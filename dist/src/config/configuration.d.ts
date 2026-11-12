declare const _default: () => {
    env: string;
    port: number;
    apiPrefix: string;
    appName: string;
    appUrl: string;
    frontendUrl: string;
    corsAllowedOrigins: string[];
    allowedClientIds: string[];
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    storage: {
        endpoint: string;
        region: string;
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
        maxUploadBytes: number;
        presignedExpiresSeconds: number;
    };
    ai: {
        geminiApiKey: string;
        geminiModel: string;
        fallbackProvider: string;
        fallbackApiKey: string;
        freeDailyTokenLimit: number;
        proDailyTokenLimit: number;
    };
    payment: {
        provider: string;
        apiSecretKey: string;
        webhookSecret: string;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
        frontendUrl: string;
    };
};
export default _default;
