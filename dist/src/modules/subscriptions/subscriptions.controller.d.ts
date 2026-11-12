import { SubscriptionsService } from './subscriptions.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateCheckoutSessionDto } from './dto/subscription.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    listPlans(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        priceCents: number;
        currency: string;
        billingInterval: string;
        dailyAiTokenLimit: number;
        storageQuotaBytes: bigint;
        features: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }[]>;
    getMySubscription(user: AuthenticatedUser): Promise<({
        invoices: {
            id: string;
            status: string;
            userId: string;
            subscriptionId: string;
            invoiceNumber: string;
            amountDueCents: number;
            amountPaidCents: number;
            issuedAt: Date;
        }[];
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            priceCents: number;
            currency: string;
            billingInterval: string;
            dailyAiTokenLimit: number;
            storageQuotaBytes: bigint;
            features: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        userId: string;
        externalSubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
        planId: string;
    }) | null>;
    createCheckout(user: AuthenticatedUser, dto: CreateCheckoutSessionDto): Promise<{
        checkoutSessionId: string;
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userId: string;
            verifiedAt: Date | null;
            idempotencyKey: string;
            provider: string;
            providerPaymentId: string;
            subscriptionId: string | null;
            amountCents: number;
            refundedAmountCents: number;
        };
        idempotentReplay: boolean;
        checkoutUrl?: undefined;
        plan?: undefined;
    } | {
        checkoutSessionId: string;
        checkoutUrl: string;
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userId: string;
            verifiedAt: Date | null;
            idempotencyKey: string;
            provider: string;
            providerPaymentId: string;
            subscriptionId: string | null;
            amountCents: number;
            refundedAmountCents: number;
        };
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            priceCents: number;
            currency: string;
            billingInterval: string;
            dailyAiTokenLimit: number;
            storageQuotaBytes: bigint;
            features: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
        };
        idempotentReplay?: undefined;
    }>;
    getPaymentHistory(user: AuthenticatedUser): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userId: string;
            verifiedAt: Date | null;
            idempotencyKey: string;
            provider: string;
            providerPaymentId: string;
            subscriptionId: string | null;
            amountCents: number;
            refundedAmountCents: number;
        }[];
        invoices: {
            id: string;
            status: string;
            userId: string;
            subscriptionId: string;
            invoiceNumber: string;
            amountDueCents: number;
            amountPaidCents: number;
            issuedAt: Date;
        }[];
    }>;
    handleWebhook(payload: any, signature: string, lowerSignature: string): Promise<{
        webhookProcessed: boolean;
        subscription: {
            plan: {
                id: string;
                name: string;
                createdAt: Date;
                code: string;
                priceCents: number;
                currency: string;
                billingInterval: string;
                dailyAiTokenLimit: number;
                storageQuotaBytes: bigint;
                features: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            userId: string;
            externalSubscriptionId: string | null;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
            cancelledAt: Date | null;
            planId: string;
        };
        invoice: {
            id: string;
            status: string;
            userId: string;
            subscriptionId: string;
            invoiceNumber: string;
            amountDueCents: number;
            amountPaidCents: number;
            issuedAt: Date;
        };
        eventType?: undefined;
    } | {
        webhookProcessed: boolean;
        eventType: string;
        subscription?: undefined;
        invoice?: undefined;
    }>;
}
