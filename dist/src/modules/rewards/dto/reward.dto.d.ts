export declare class RedeemRewardDto {
    idempotencyKey: string;
}
export declare class CreateRewardCatalogDto {
    name: string;
    description: string;
    pointsCost: number;
    stockQuantity: number;
    category?: string;
}
export declare class UpdateRewardCatalogDto {
    name?: string;
    pointsCost?: number;
    stockQuantity?: number;
}
