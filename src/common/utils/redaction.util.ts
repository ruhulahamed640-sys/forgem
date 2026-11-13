import { SENSITIVE_FIELDS } from '../constants';

export function redactSensitiveData<T>(input: T): T {
  if (typeof input === 'bigint') {
    // Prisma exposes BigInt columns (e.g. storage quotas) and JSON.stringify
    // cannot serialize BigInt. Quotas fit safely inside Number.MAX_SAFE_INTEGER.
    return Number(input) as unknown as T;
  }
  if (input === null || input === undefined || typeof input !== 'object') {
    return input;
  }
  if (input instanceof Date) {
    return input;
  }
  // Preserve objects with custom JSON serialization (e.g. Prisma.Decimal).
  // Cloning them would turn them into internal shapes such as `{ s, e, d }`
  // and break numeric rendering on API clients.
  if (typeof (input as { toJSON?: unknown }).toJSON === 'function') {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveData(item)) as unknown as T;
  }
  const clone: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      continue; // Strip sensitive fields from API payloads completely
    }
    clone[key] = redactSensitiveData(value);
  }
  return clone as T;
}
