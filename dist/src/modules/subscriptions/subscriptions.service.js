"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'studypilot-webhook-signing-secret-2026';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPlans() {
        return this.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { priceCents: 'asc' },
        });
    }
    async getMySubscription(userId) {
        const sub = await this.prisma.subscription.findFirst({
            where: { userId },
            include: { plan: true, invoices: true },
            orderBy: { createdAt: 'desc' },
        });
        return sub;
    }
    async createCheckout(userId, dto) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { code: dto.planCode },
        });
        if (!plan || !plan.isActive) {
            throw new common_1.NotFoundException({
                message: 'Subscription plan not found',
                code: 'PLAN_NOT_FOUND',
            });
        }
        const idempotencyKey = `${userId}:checkout:${plan.code}:${dto.idempotencyKey}`;
        const existingTx = await this.prisma.paymentTransaction.findUnique({
            where: { idempotencyKey },
        });
        if (existingTx) {
            return {
                checkoutSessionId: existingTx.providerPaymentId,
                transaction: existingTx,
                idempotentReplay: true,
            };
        }
        const providerPaymentId = `cs_live_${crypto.randomBytes(12).toString('hex')}`;
        const tx = await this.prisma.paymentTransaction.create({
            data: {
                userId,
                provider: 'stripe',
                providerPaymentId,
                idempotencyKey,
                amountCents: plan.priceCents,
                currency: plan.currency,
                status: 'PENDING',
            },
        });
        return {
            checkoutSessionId: providerPaymentId,
            checkoutUrl: `https://checkout.studypilot.io/pay/${providerPaymentId}`,
            transaction: tx,
            plan,
        };
    }
    async getPaymentHistory(userId) {
        const [transactions, invoices] = await Promise.all([
            this.prisma.paymentTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.invoice.findMany({
                where: { userId },
                orderBy: { issuedAt: 'desc' },
            }),
        ]);
        return { transactions, invoices };
    }
    computeWebhookSignature(rawPayload) {
        return crypto
            .createHmac('sha256', this.webhookSecret)
            .update(rawPayload)
            .digest('hex');
    }
    verifyWebhookSignature(rawPayload, signatureHeader) {
        if (!signatureHeader)
            return false;
        const expected = this.computeWebhookSignature(rawPayload);
        const a = Buffer.from(expected, 'utf8');
        const b = Buffer.from(signatureHeader.trim(), 'utf8');
        if (a.length !== b.length)
            return false;
        return crypto.timingSafeEqual(a, b);
    }
    async processWebhook(payload, signatureHeader) {
        const rawPayload = JSON.stringify(payload);
        if (!this.verifyWebhookSignature(rawPayload, signatureHeader)) {
            throw new common_1.UnauthorizedException({
                message: 'Webhook cryptographic signature verification failed',
                code: 'INVALID_WEBHOOK_SIGNATURE',
            });
        }
        const existingWebhook = await this.prisma.paymentWebhook.findUnique({
            where: { providerEventId: payload.eventId },
        });
        if (existingWebhook) {
            throw new common_1.ConflictException({
                message: 'Webhook event has already been processed',
                code: 'DUPLICATE_WEBHOOK_EVENT',
            });
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.paymentWebhook.create({
                data: {
                    provider: 'stripe',
                    providerEventId: payload.eventId,
                    eventType: payload.eventType,
                    signatureVerified: true,
                    payload: payload,
                    processingStatus: 'PROCESSED',
                },
            });
            if (payload.eventType === 'payment_intent.succeeded') {
                const plan = await tx.subscriptionPlan.findUnique({
                    where: { code: payload.planCode },
                });
                if (!plan) {
                    throw new common_1.BadRequestException({
                        message: 'Referenced subscription plan does not exist',
                        code: 'PLAN_NOT_FOUND',
                    });
                }
                await tx.paymentTransaction.upsert({
                    where: { providerPaymentId: payload.providerPaymentId },
                    update: {
                        status: 'SUCCEEDED',
                        verifiedAt: new Date(),
                    },
                    create: {
                        userId: payload.userId,
                        provider: 'stripe',
                        providerPaymentId: payload.providerPaymentId,
                        idempotencyKey: `webhook:${payload.eventId}`,
                        amountCents: payload.amountCents,
                        currency: plan.currency,
                        status: 'SUCCEEDED',
                        verifiedAt: new Date(),
                    },
                });
                const now = new Date();
                const periodEnd = new Date(now.getTime() + 30 * 86400 * 1000);
                const subscription = await tx.subscription.create({
                    data: {
                        userId: payload.userId,
                        planId: plan.id,
                        status: 'ACTIVE',
                        externalSubscriptionId: `sub_${payload.eventId}`,
                        currentPeriodStart: now,
                        currentPeriodEnd: periodEnd,
                    },
                    include: { plan: true },
                });
                const invoice = await tx.invoice.create({
                    data: {
                        userId: payload.userId,
                        subscriptionId: subscription.id,
                        invoiceNumber: `INV-${Date.now()}-${payload.eventId.slice(-4).toUpperCase()}`,
                        amountDueCents: payload.amountCents,
                        amountPaidCents: payload.amountCents,
                        status: 'PAID',
                    },
                });
                return {
                    webhookProcessed: true,
                    subscription,
                    invoice,
                };
            }
            return { webhookProcessed: true, eventType: payload.eventType };
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map