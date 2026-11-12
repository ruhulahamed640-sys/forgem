import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-only-access-secret-do-not-use-in-prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-only-refresh-secret-do-not-use-in-prod',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'dev-only-cookie-secret',
  csrfSecret: process.env.CSRF_SECRET || 'dev-only-csrf-secret',
  argon2: {
    memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10),
    timeCost: parseInt(process.env.ARGON2_TIME_COST || '3', 10),
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4', 10),
  },
  throttle: {
    ttlSeconds: parseInt(process.env.THROTTLE_TTL_SECONDS || '60', 10),
    limitDefault: parseInt(process.env.THROTTLE_LIMIT_DEFAULT || '100', 10),
    limitAuth: parseInt(process.env.THROTTLE_LIMIT_AUTH || '10', 10),
    limitAi: parseInt(process.env.THROTTLE_LIMIT_AI || '20', 10),
  },
}));
