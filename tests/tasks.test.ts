import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-minimum-16-chars';

// ── Mock Supabase chainable ────────────────────────────────────────────
let _chainResult: Record<string, unknown> = {};
let _chainError: unknown = null;
let _chainCount: number | null = null;

function buildMockChain() {
  const chain: Record<string, unknown> = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data: _chainResult, error: _chainError })),
  };
  // Make thenable so `await queryBuilder` resolves
  chain.then = (resolve: (val: { data: unknown; error: unknown; count: number | null }) => void) =>
    resolve({ data: _chainResult, error: _chainError, count: _chainCount });
  return chain;
}

const mockFrom = vi.fn(() => buildMockChain());

vi.mock('../api/_lib/supabase', () => ({
  supabase: {
    auth: {
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
      },
      signInWithPassword: vi.fn(),
    },
    from: mockFrom,
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────
function makeToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function mockReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'GET',
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

const AUTH_TOKEN = makeToken({ userId: 'user-1', email: 'test@example.com' });

beforeEach(() => {
  vi.clearAllMocks();
  _chainResult = {};
  _chainError = null;
  _chainCount = null;
});

// ══════════════════════════════════════════════════════════════════════
// Tasks Tests
// ══════════════════════════════════════════════════════════════════════
describe('POST /api/tasks', () => {
  it('should create a task', async () => {
    const taskRow = {
      id: 'task-1',
      user_id: 'user-1',
      title: 'Test Task',
      description: 'Desc',
      status: 'pending',
      priority: 'high',
      due_date: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
    _chainResult = taskRow;

    const { default: handler } = await import('../api/tasks/index');

    const req = mockReq({
      method: 'POST',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      body: { title: 'Test Task', description: 'Desc', priority: 'high' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(201);
    const body = res._body as { success: boolean; data: { task: Record<string, unknown> } };
    expect(body.success).toBe(true);
    expect(body.data.task.title).toBe('Test Task');
  });

  it('should reject without auth', async () => {
    const { default: handler } = await import('../api/tasks/index');

    const req = mockReq({
      method: 'POST',
      headers: {},
      body: { title: 'Test' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
  });

  it('should reject invalid data', async () => {
    const { default: handler } = await import('../api/tasks/index');

    const req = mockReq({
      method: 'POST',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      body: { title: '' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(400);
    const body = res._body as { success: boolean };
    expect(body.success).toBe(false);
  });
});

describe('GET /api/tasks', () => {
  it('should list tasks', async () => {
    _chainResult = [
      { id: 't1', title: 'Task 1' },
      { id: 't2', title: 'Task 2' },
      { id: 't3', title: 'Task 3' },
    ];
    _chainCount = 3;

    const { default: handler } = await import('../api/tasks/index');

    const req = mockReq({
      method: 'GET',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    const body = res._body as { data: { tasks: unknown[]; pagination: Record<string, unknown> } };
    expect(body.data.tasks).toHaveLength(3);
    expect(body.data.pagination.total).toBe(3);
  });

  it('should paginate tasks', async () => {
    _chainResult = [{ id: 't1' }, { id: 't2' }];
    _chainCount = 5;

    const { default: handler } = await import('../api/tasks/index');

    const req = mockReq({
      method: 'GET',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      query: { page: '1', limit: '2' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    const body = res._body as { data: { tasks: unknown[]; pagination: Record<string, unknown> } };
    expect(body.data.tasks).toHaveLength(2);
    expect(body.data.pagination.totalPages).toBe(3);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('should update a task', async () => {
    _chainResult = {
      id: 'task-1',
      title: 'Updated Title',
      status: 'completed',
    };

    const { default: handler } = await import('../api/tasks/[id]');

    const req = mockReq({
      method: 'PUT',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      query: { id: 'task-1' },
      body: { title: 'Updated Title', status: 'completed' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    const body = res._body as { data: { task: Record<string, unknown> } };
    expect(body.data.task.title).toBe('Updated Title');
    expect(body.data.task.status).toBe('completed');
  });

  it('should return 404 for non-existent task', async () => {
    _chainResult = null;

    const { default: handler } = await import('../api/tasks/[id]');

    const req = mockReq({
      method: 'PUT',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      query: { id: '99999' },
      body: { title: 'Updated' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(404);
  });

  it('should reject without auth', async () => {
    const { default: handler } = await import('../api/tasks/[id]');

    const req = mockReq({
      method: 'PUT',
      headers: {},
      query: { id: 'task-1' },
      body: { title: 'Updated' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('should delete a task', async () => {
    _chainResult = null;
    _chainCount = 1;

    const { default: handler } = await import('../api/tasks/[id]');

    const req = mockReq({
      method: 'DELETE',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      query: { id: 'task-1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(204);
  });

  it('should return 404 for non-existent task', async () => {
    _chainResult = null;
    _chainCount = 0;

    const { default: handler } = await import('../api/tasks/[id]');

    const req = mockReq({
      method: 'DELETE',
      headers: { authorization: `Bearer ${AUTH_TOKEN}` },
      query: { id: '99999' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(404);
  });

  it('should reject without auth', async () => {
    const { default: handler } = await import('../api/tasks/[id]');

    const req = mockReq({
      method: 'DELETE',
      headers: {},
      query: { id: 'task-1' },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(401);
  });
});
