import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function makeReq(ip = '203.0.113.10', url = '/api/auth/login', method = 'POST'): VercelRequest {
  return {
    headers: { 'x-forwarded-for': ip },
    url,
    method,
  } as unknown as VercelRequest;
}

function makeRes() {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
    status: (code: number) => ({
      json: (body: unknown) => ({ code, body }),
    }),
  };
  return { res: res as unknown as VercelResponse, headers };
}

/** Fresh module per test so the in-memory buckets start empty. */
async function loadRateLimit() {
  vi.resetModules();
  return import('../api/_lib/rateLimit');
}

describe('rateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns the client IP from x-forwarded-for', async () => {
    const { getClientIp } = await loadRateLimit();
    expect(getClientIp(makeReq('198.51.100.7'))).toBe('198.51.100.7');
  });

  it('allows requests up to the limit and sets rate-limit headers', async () => {
    const { rateLimit } = await loadRateLimit();
    const { res, headers } = makeRes();
    const req = makeReq();

    for (let i = 0; i < 10; i += 1) {
      expect(rateLimit(req, res)).toBe(true);
    }
    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
  });

  it('rejects once the limit is exceeded', async () => {
    const { rateLimit } = await loadRateLimit();
    const { res } = makeRes();
    const req = makeReq();

    for (let i = 0; i < 10; i += 1) {
      rateLimit(req, res);
    }
    expect(rateLimit(req, res)).toBe(false);
  });

  it('tracks different routes independently', async () => {
    const { rateLimit } = await loadRateLimit();
    const { res } = makeRes();
    const loginReq = makeReq('203.0.113.10', '/api/auth/login');
    const registerReq = makeReq('203.0.113.10', '/api/auth/register');

    for (let i = 0; i < 10; i += 1) {
      rateLimit(loginReq, res);
    }
    expect(rateLimit(registerReq, res)).toBe(true);
    expect(rateLimit(loginReq, res)).toBe(false);
  });

  it('respects a custom max option', async () => {
    const { rateLimit } = await loadRateLimit();
    const { res } = makeRes();
    const req = makeReq('203.0.113.10', '/api/auth/me', 'GET');

    expect(rateLimit(req, res, { max: 3 })).toBe(true);
    expect(rateLimit(req, res, { max: 3 })).toBe(true);
    expect(rateLimit(req, res, { max: 3 })).toBe(true);
    expect(rateLimit(req, res, { max: 3 })).toBe(false);
  });

  it('shares a bucket across query strings when includeQuery is false', async () => {
    const { rateLimit } = await loadRateLimit();
    const { res } = makeRes();

    const page1 = makeReq('203.0.113.10', '/api/tasks?page=1&limit=10');
    const page2 = makeReq('203.0.113.10', '/api/tasks?page=2&limit=10');

    expect(rateLimit(page1, res, { max: 2, includeQuery: false })).toBe(true);
    expect(rateLimit(page2, res, { max: 2, includeQuery: false })).toBe(true);
    expect(rateLimit(page1, res, { max: 2, includeQuery: false })).toBe(false);
  });

  it('keeps query strings in the bucket key by default', async () => {
    const { rateLimit } = await loadRateLimit();
    const { res } = makeRes();

    const page1 = makeReq('203.0.113.10', '/api/tasks?page=1');
    const page2 = makeReq('203.0.113.10', '/api/tasks?page=2');

    expect(rateLimit(page1, res, { max: 1 })).toBe(true);
    expect(rateLimit(page2, res, { max: 1 })).toBe(true); // distinct bucket
    expect(rateLimit(page1, res, { max: 1 })).toBe(false); // first bucket now limited
  });
});
