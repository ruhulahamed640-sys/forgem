import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { createGlobalValidationPipe } from './common/pipes/sanitize-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Security middleware & request size limits
  app.use(helmet());
  app.use(cookieParser(process.env.COOKIE_SECRET || 'studypilot-cookie-secret'));
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
}

bootstrap();
