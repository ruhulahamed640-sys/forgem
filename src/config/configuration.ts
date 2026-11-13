export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  appName: process.env.APP_NAME || 'StudyPilot',
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),
  allowedClientIds: (
    process.env.ALLOWED_CLIENT_IDS ||
    'web-app,browser-extension-popup,browser-extension-sidepanel,mobile-client'
  )
    .split(',')
    .map((c) => c.trim()),
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET_NAME || 'studypilot-assets',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    maxUploadBytes: parseInt(process.env.MAX_UPLOAD_FILE_SIZE_BYTES || '10485760', 10),
    presignedExpiresSeconds: parseInt(process.env.PRESIGNED_URL_EXPIRES_SECONDS || '900', 10),
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash',
    fallbackProvider: process.env.AI_FALLBACK_PROVIDER || 'openai-compatible',
    fallbackApiKey: process.env.AI_FALLBACK_API_KEY || '',
    freeDailyTokenLimit: parseInt(process.env.AI_FREE_DAILY_TOKEN_LIMIT || '25000', 10),
    proDailyTokenLimit: parseInt(process.env.AI_PRO_DAILY_TOKEN_LIMIT || '500000', 10),
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'stripe',
    apiSecretKey: process.env.PAYMENT_API_SECRET_KEY || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },
  email: {
    provider: (process.env.EMAIL_PROVIDER || 'smtp').trim().toLowerCase(),
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from:
      process.env.EMAIL_FROM_ADDRESS ||
      process.env.MAIL_FROM ||
      process.env.SMTP_USER ||
      '',
    fromName: process.env.EMAIL_FROM_NAME || process.env.APP_NAME || 'StudyPilot',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    connectionTimeoutMs: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10),
    greetingTimeoutMs: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '10000', 10),
    socketTimeoutMs: parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '20000', 10),
  },
});
