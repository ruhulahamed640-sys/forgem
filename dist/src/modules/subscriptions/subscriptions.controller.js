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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscriptions_service_1 = require("./subscriptions.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const subscription_dto_1 = require("./dto/subscription.dto");
let SubscriptionsController = class SubscriptionsController {
    subscriptionsService;
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    listPlans() {
        return this.subscriptionsService.listPlans();
    }
    getMySubscription(user) {
        return this.subscriptionsService.getMySubscription(user.id);
    }
    createCheckout(user, dto) {
        return this.subscriptionsService.createCheckout(user.id, dto);
    }
    getPaymentHistory(user) {
        return this.subscriptionsService.getPaymentHistory(user.id);
    }
    handleWebhook(payload, signature, lowerSignature) {
        return this.subscriptionsService.processWebhook(payload, signature || lowerSignature || '');
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('subscriptions/plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List active free and premium subscription plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "listPlans", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('subscriptions/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve current user active subscription and feature entitlements' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getMySubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('subscriptions/checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate an idempotent subscription checkout transaction' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, subscription_dto_1.CreateCheckoutSessionDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createCheckout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('payments/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve user payment transactions and invoices' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getPaymentHistory", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('payments/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Process cryptographically signed payment provider webhooks (idempotent)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-Payment-Signature')),
    __param(2, (0, common_1.Headers)('x-payment-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "handleWebhook", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions & Payments'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map