import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * In-memory sliding-window rate limiter for auth endpoints.
 *
 * Protects against brute-force / credential stuffing on register/login.
 *
 * NOTE (serverless): on Vercel each lambda instance keeps its own map, so this
 * is a best-effort per-instance guard. For multi-instance production use a
 * shared store (Upstash Redis, etc.). See issue #3.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_AUTH_ATTEMPTS = 10; // register / login per window
const MAX_ME_REQUESTS = 60; // /auth/me per window

const buckets = new Map<string, Bucket>();

/** Best-effort client IP extraction (works on Vercel and local dev). */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] as string | undefined ?? 'local';
}

function keyFor(ip: string, route: string): string {
  return `${route}:${ip}`;
}

function isLimited(key: string, max: number): Bucket | null {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    // Fresh window
    buckets.set(key, { count: 1, windowStart: now });
    return null;
  }

  if (bucket.count >= max) {
    return bucket; // still inside the window and over the limit
  }

  bucket.count += 1;
  return null;
}

function resetAt(bucket: Bucket): number {
  return Math.ceil((bucket.windowStart + WINDOW_MS) / 1000);
}

export interface RateLimitOptions {
  max?: number;
}

/**
 * Apply rate limiting to the request. Returns true when the request is allowed;
 * when limited, writes the 429 response and returns false.
 */
export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  options: RateLimitOptions = {}
): boolean {
  const ip = getClientIp(req);
  const route = `${req.method ?? 'GET'} ${req.url ?? '/'}`;
  const key = keyFor(ip, route);
  const max = options.max ?? MAX_AUTH_ATTEMPTS;

  const limited = isLimited(key, max);

  if (limited) {
    res.setHeader?.('Retry-After', String(Math.max(1, resetAt(limited) - Math.floor(Date.now() / 1000))));
    res.setHeader?.('X-RateLimit-Limit', String(max));
    res.setHeader?.('X-RateLimit-Remaining', '0');
    res.setHeader?.('X-RateLimit-Reset', String(resetAt(limited)));
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
    return false;
  }

  const bucket = buckets.get(key);
  res.setHeader?.('X-RateLimit-Limit', String(max));
  res.setHeader?.(
    'X-RateLimit-Remaining',
    bucket ? String(Math.max(0, max - bucket.count)) : String(max - 1)
  );
  if (bucket) {
    res.setHeader?.('X-RateLimit-Reset', String(resetAt(bucket)));
  }

  return true;
}
