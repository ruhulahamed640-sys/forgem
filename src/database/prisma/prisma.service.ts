import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma does not automatically honour DB_MAX_CONNECTIONS / DB_POOL_TIMEOUT,
 * so inject them into the datasource URL unless the URL already defines them.
 * Keeping the pool below the database's own connection limit (for example
 * Supabase's Supavisor pool size) prevents "Timed out fetching a new
 * connection from the connection pool" errors under load.
 */
function buildDatasourceUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    const connectionLimit = process.env.DB_MAX_CONNECTIONS;
    const poolTimeout = process.env.DB_POOL_TIMEOUT;

    if (connectionLimit && !url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', connectionLimit);
    }
    if (poolTimeout && !url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', poolTimeout);
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasourceUrl: buildDatasourceUrl(process.env.DATABASE_URL),
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      // Remote/managed PostgreSQL (e.g. Supabase) can have multi-second latency.
      // Raise the interactive transaction budget above Prisma's 5s default so
      // multi-step writes do not fail with "Transaction already closed".
      transactionOptions: {
        maxWait: parseInt(process.env.DB_TX_MAX_WAIT_MS || '15000', 10),
        timeout: parseInt(process.env.DB_TX_TIMEOUT_MS || '30000', 10),
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL via Prisma ORM');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
