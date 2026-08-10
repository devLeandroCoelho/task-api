import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-minimum-16-chars';

// ── Hoisted mocks (safe for vi.mock factory) ───────────────────────────
const mocks = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockFromFn = vi.fn();
  const mockCreateUser = vi.fn();
  const mockDeleteUser = vi.fn();
  const mockSignInWithPassword = vi.fn();

  return {
    mockSingle,
    mockInsert,
    mockSelect,
    mockEq,
    mockFromFn,
    mockCreateUser,
    mockDeleteUser,
    mockSignInWithPassword,
  };
});

function buildChain() {
  const chain: Record<string, unknown> = {
    insert: mocks.mockInsert.mockReturnThis(),
    select: mocks.mockSelect.mockReturnThis(),
    eq: mocks.mockEq.mockReturnThis(),
    single: mocks.mockSingle,
  };
  return chain;
}

vi.mock('../api/_lib/supabase', () => ({
  supabase: {
    auth: {
      admin: {
        createUser: mocks.mockCreateUser,
        deleteUser: mocks.mockDeleteUser,
      },
      signInWithPassword: mocks.mockSignInWithPassword,
    },
    from: mocks.mockFromFn.mockImplementation(() => buildChain()),
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────
function mockReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: {},
    body: {},
    query: {},
    ...overrides,
  } as VercelRequest;
}

function mockRes(): VercelResponse & { _status: number; _body: unknown } {
  const res = {
    _status: 200,
    _body: null as unknown,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(body: unknown) {
      res._body = body;
      return res;
    },
    end() {
      return res;
    },
  } as unknown as VercelResponse & { _status: number; _body: unknown };
  return res;
}

function makeToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// ── Reset mocks ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mocks.mockFromFn.mockImplementation(() => buildChain());
});

// ══════════════════════════════════════════════════════════════════════
// Auth Tests
// ══════════════════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const { default: handler } = await import('../api/auth/register');

    // 1st call: check existing user → none found
    mocks.mockSingle.mockResolvedValueOnce({ data: null, error: null });
    // Auth user creation
    mocks.mockCreateUser.mockResolvedValueOnce({
      data: { user: { id: 'uuid-123', email: 'john@example.com' } },
      error: null,
    });
    // 2nd call: insert profile → success
    mocks.mockInsert.mockResolvedValueOnce({ data: null, error: null });

    const req = mockReq({
      body: { name: 'John', email: 'john@example.com', password: 'Password1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(201);
    const body = res._body as { success: boolean; data: { user: Record<string, unknown>; token: string } };
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('john@example.com');
    expect(body.data.user.name).toBe('John');
    expect(body.data.token).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    const { default: handler } = await import('../api/auth/register');

    // Existing user found
    mocks.mockSingle.mockResolvedValueOnce({ data: { id: 'existing' }, error: null });

    const req = mockReq({
      body: { name: 'John', email: 'john@example.com', password: 'Password1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(409);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const { default: handler } = await import('../api/auth/register');

    const req = mockReq({
      body: { name: 'John', email: 'not-an-email', password: 'Password1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('should reject weak password', async () => {
    const { default: handler } = await import('../api/auth/register');

    const req = mockReq({
      body: { name: 'John', email: 'john@example.com', password: '123' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const { default: handler } = await import('../api/auth/register');

    const req = mockReq({
      body: { email: 'test@test.com' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('should reject wrong method', async () => {
    const { default: handler } = await import('../api/auth/register');

    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(405);
  });
});

describe('POST /api/auth/login', () => {
  it('should login successfully', async () => {
    const { default: handler } = await import('../api/auth/login');

    mocks.mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'uuid-123', email: 'john@example.com' } },
      error: null,
    });
    // Profile fetch
    mocks.mockSingle.mockResolvedValueOnce({
      data: { name: 'John' },
      error: null,
    });

    const req = mockReq({
      body: { email: 'john@example.com', password: 'Password1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    const body = res._body as { success: boolean; data: { token: string; user: Record<string, unknown> } };
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('john@example.com');
  });

  it('should reject wrong password', async () => {
    const { default: handler } = await import('../api/auth/login');

    mocks.mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const req = mockReq({
      body: { email: 'john@example.com', password: 'Wrong1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('should reject non-existent user', async () => {
    const { default: handler } = await import('../api/auth/login');

    mocks.mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const req = mockReq({
      body: { email: 'nonexistent@example.com', password: 'Password1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
  });

  it('should reject wrong method', async () => {
    const { default: handler } = await import('../api/auth/login');

    const req = mockReq({ method: 'GET' });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(405);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user with valid token', async () => {
    const { default: handler } = await import('../api/auth/me');
    const token = makeToken({ userId: 'uuid-123', email: 'john@example.com' });

    mocks.mockSingle.mockResolvedValueOnce({
      data: { id: 'uuid-123', name: 'John', email: 'john@example.com' },
      error: null,
    });

    const req = mockReq({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    const body = res._body as { success: boolean; data: { user: Record<string, unknown> } };
    expect(body.data.user.id).toBe('uuid-123');
    expect(body.data.user.name).toBe('John');
  });

  it('should reject without token', async () => {
    const { default: handler } = await import('../api/auth/me');

    const req = mockReq({ method: 'GET', headers: {} });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('should reject invalid token', async () => {
    const { default: handler } = await import('../api/auth/me');

    const req = mockReq({
      method: 'GET',
      headers: { authorization: 'Bearer invalid-token' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
  });

  it('should reject wrong method', async () => {
    const { default: handler } = await import('../api/auth/me');

    const req = mockReq({
      method: 'POST',
      headers: { authorization: `Bearer ${makeToken({ userId: 'uuid-123', email: 'john@example.com' })}` },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(405);
  });
});
