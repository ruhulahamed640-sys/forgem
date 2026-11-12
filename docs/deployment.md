# StudyPilot — Production Deployment, Backup & Rollback Guide

## 1. Production Environment Requirements
- **Node.js**: v20 LTS (`node:20-alpine` container image running as non-root `nestjs` user via `dumb-init`)
- **PostgreSQL**: v16 with PgBouncer connection pooling (`DATABASE_URL` pooled, `DIRECT_DATABASE_URL` direct for migrations)
- **Redis**: v7 with AOF persistence enabled (`appendonly yes`) for BullMQ queues and rate-limiting state
- **Reverse Proxy**: Nginx / Envoy with TLS 1.3, HSTS, and 10MB upload limit for S3 presigned flows

## 2. Build & Database Migration Commands
```bash
# Install dependencies and generate Prisma client
npm ci
npx prisma generate

# Apply production migrations safely (never use migrate reset in production)
npx prisma migrate deploy

# Build and start production server
npm run build
npm run start:prod
```

## 3. PostgreSQL Backup & Point-in-Time Recovery (PITR)
```bash
# Encrypted logical backup to S3-compatible cold storage
pg_dump --format=custom --no-owner --no-privileges "$DIRECT_DATABASE_URL" \
  | gzip -9 > "/backups/studypilot_$(date +%Y%m%d_%H%M%S).dump.gz"

# Restore into target recovery database
gunzip -c /backups/studypilot_20261111_000000.dump.gz \
  | pg_restore --clean --if-exists --no-owner -d "$RECOVERY_DATABASE_URL"
```

## 4. Deployment Rollback Procedure
1. Pin container orchestrator (Kubernetes / ECS / Docker Swarm) to the previous immutable image tag (`studypilot-api:<prev-git-sha>`).
2. If a schema migration requires rollback, apply the down-migration SQL script using `npx prisma migrate resolve --rolled-back <migration_name>`.
3. Verify `/api/v1/health` returns `status: "healthy"`.
