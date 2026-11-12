import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_DATABASE_URL,
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  poolTimeoutSeconds: parseInt(process.env.DB_POOL_TIMEOUT || '15', 10),
}));
