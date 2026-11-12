"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalValidationPipe = createGlobalValidationPipe;
const common_1 = require("@nestjs/common");
function createGlobalValidationPipe() {
    return new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    });
}
//# sourceMappingURL=sanitize-validation.pipe.js.map