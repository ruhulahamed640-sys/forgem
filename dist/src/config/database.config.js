"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    poolTimeoutSeconds: parseInt(process.env.DB_POOL_TIMEOUT || '15', 10),
}));
//# sourceMappingURL=database.config.js.map