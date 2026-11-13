import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_DATABASE_URL,
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  poolTimeoutSeconds: parseInt(process.env.DB_POOL_TIMEOUT || '20', 10),
  transactionMaxWaitMs: parseInt(process.env.DB_TX_MAX_WAIT_MS || '15000', 10),
  transactionTimeoutMs: parseInt(process.env.DB_TX_TIMEOUT_MS || '30000', 10),
}));
