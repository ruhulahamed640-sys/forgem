import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { createGlobalValidationPipe } from './common/pipes/sanitize-validation.pipe';

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'DIRECT_DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
  'CSRF_SECRET',
] as const;

function validateEnvironment(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Please check your .env file or environment configuration.',
    );
  }

  // Validate secret lengths
  const minSecretLength = 32;
  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < minSecretLength) {
    throw new Error(`JWT_ACCESS_SECRET must be at least ${minSecretLength} characters`);
  }
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < minSecretLength) {
    throw new Error(`JWT_REFRESH_SECRET must be at least ${minSecretLength} characters`);
  }
  if (process.env.COOKIE_SECRET && process.env.COOKIE_SECRET.length < minSecretLength) {
    throw new Error(`COOKIE_SECRET must be at least ${minSecretLength} characters`);
  }
  if (process.env.CSRF_SECRET && process.env.CSRF_SECRET.length < minSecretLength) {
    throw new Error(`CSRF_SECRET must be at least ${minSecretLength} characters`);
  }

  // Warn about development defaults in production
  if (process.env.NODE_ENV === 'production') {
    const devDefaults = [
      { key: 'JWT_ACCESS_SECRET', value: 'studypilot-access-secret-key-2026' },
      { key: 'JWT_REFRESH_SECRET', value: 'studypilot-refresh-secret-key-2026' },
      { key: 'COOKIE_SECRET', value: 'studypilot-cookie-secret' },
      { key: 'CSRF_SECRET', value: 'studypilot-csrf-secret-2026' },
      { key: 'PAYMENT_WEBHOOK_SECRET', value: 'studypilot-webhook-signing-secret-2026' },
    ];
    for (const { key, value } of devDefaults) {
      if (process.env[key] === value) {
        console.warn(`⚠️  WARNING: ${key} is using a development default value. Please set a secure random value for production.`);
      }
    }
  }
}

async function bootstrap() {
  // Validate environment before initializing the app
  validateEnvironment();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = new Logger('Bootstrap');

  // Trust the first proxy hop (load balancer / reverse proxy) so req.ip is accurate.
  if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Gracefully release DB/Redis connections when the process is stopped.
  app.enableShutdownHooks();

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Security middleware & request size limits
  app.use(helmet());
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) {
    throw new Error('COOKIE_SECRET environment variable is required');
  }
  app.use(cookieParser(cookieSecret));
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Strict CORS allowlist supporting web client and browser extension
  const allowedOrigins = (
    process.env.CORS_ALLOWED_ORIGINS ||
    'https://app.studypilot.io,http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('chrome-extension://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origin not permitted by StudyPilot CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Client-Id',
      'X-Request-Id',
      'X-Payment-Signature',
    ],
  });

  app.useGlobalPipes(createGlobalValidationPipe());

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StudyPilot Backend REST API')
    .setDescription(
      'Production API for StudyPilot Academic Productivity, Gamification, AI Study Assistant & Browser Extension Platform',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  logger.log(`StudyPilot API listening on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Application failed to start',
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
