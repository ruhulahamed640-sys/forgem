declare const _default: (() => {
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshExpiresIn: string;
    cookieSecret: string;
    csrfSecret: string;
    argon2: {
        memoryCost: number;
        timeCost: number;
        parallelism: number;
    };
    throttle: {
        ttlSeconds: number;
        limitDefault: number;
        limitAuth: number;
        limitAi: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshExpiresIn: string;
    cookieSecret: string;
    csrfSecret: string;
    argon2: {
        memoryCost: number;
        timeCost: number;
        parallelism: number;
    };
    throttle: {
        ttlSeconds: number;
        limitDefault: number;
        limitAuth: number;
        limitAi: number;
    };
}>;
export default _default;
