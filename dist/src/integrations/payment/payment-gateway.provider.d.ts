export declare class PaymentGatewayProvider {
    createProviderCheckoutSession(params: {
        userId: string;
        planCode: string;
        amountCents: number;
    }): {
        sessionId: string;
        url: string;
        amountCents: number;
    };
}
