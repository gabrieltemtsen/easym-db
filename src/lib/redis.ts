
import { Redis } from '@upstash/redis';

function pickEnv(nameCandidates: string[]): string | undefined {
  for (const name of nameCandidates) {
    const val = process.env[name];
    if (val && val.length > 0) return val;
  }
  return undefined;
}

// Prefer non-public env vars; fall back to NEXT_PUBLIC only if necessary.
const redisUrl = pickEnv([
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_URL',
  'NEXT_PUBLIC_UPSTASH_REDIS_URL',
]);
const redisToken = pickEnv([
  'UPSTASH_REDIS_REST_TOKEN',
  'UPSTASH_REDIS_TOKEN',
  'NEXT_PUBLIC_UPSTASH_REDIS_TOKEN',
]);

if (!redisUrl || !redisToken) {
  throw new Error(
    'Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN (or UPSTASH_REDIS_URL/UPSTASH_REDIS_TOKEN).',
  );
}

if (
  process.env.NEXT_PUBLIC_UPSTASH_REDIS_URL ||
  process.env.NEXT_PUBLIC_UPSTASH_REDIS_TOKEN
)
  // Avoid exposing secrets to the client in production
  // eslint-disable-next-line no-console
  console.warn(
    'Warning: Using NEXT_PUBLIC_* Redis env vars. Avoid exposing secrets to the client in production.',
  );

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});
