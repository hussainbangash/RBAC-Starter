type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as unknown as {
  rateLimitBuckets: Map<string, RateLimitEntry> | undefined;
};

const buckets =
  globalForRateLimit.rateLimitBuckets ?? new Map<string, RateLimitEntry>();

globalForRateLimit.rateLimitBuckets = buckets;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
