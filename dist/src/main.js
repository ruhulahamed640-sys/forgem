"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const helmet_1 = require("helmet");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const sanitize_validation_pipe_1 = require("./common/pipes/sanitize-validation.pipe");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    app.use((0, helmet_1.default)());
    app.use(cookieParser(process.env.COOKIE_SECRET || 'studypilot-cookie-secret'));
    app.use((0, express_1.json)({ limit: '1mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '1mb' }));
    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ||
        'https://app.studypilot.io,http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin ||
                allowedOrigins.includes(origin) ||
                origin.startsWith('chrome-extension://')) {
                callback(null, true);
            }
            else {
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
    app.useGlobalPipes((0, sanitize_validation_pipe_1.createGlobalValidationPipe)());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('StudyPilot Backend REST API')
        .setDescription('Production API for StudyPilot Academic Productivity, Gamification, AI Study Assistant & Browser Extension Platform')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = parseInt(process.env.PORT || '4000', 10);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map