import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../_lib/supabase';
import { requireAuth } from '../_lib/auth';
import { validateRequest, sendError, sendSuccess } from '../_lib/zod';

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  status: z
    .enum(['pending', 'in_progress', 'completed'])
    .default('pending'),
  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium'),
  due_date: z
    .string()
    .datetime()
    .or(z.string().date())
    .optional(),
});

const listTasksQuerySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const authPayload = requireAuth(req, res);
  if (!authPayload) return;

  switch (req.method) {
    case 'GET':
      return handleList(req, res, authPayload.userId);
    case 'POST':
      return handleCreate(req, res, authPayload.userId);
    default:
      sendError(res, 405, 'Method not allowed');
  }
}

async function handleList(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
): Promise<void> {
  const query = validateRequest<ListTasksQuery>(
    req, res, listTasksQuerySchema, 'query'
  );
  if (!query) return;

  const { status, priority, page, limit } = query;
  const offset = (page - 1) * limit;

  // Build query
  let queryBuilder = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  }
  if (priority) {
    queryBuilder = queryBuilder.eq('priority', priority);
  }

  const { data: tasks, count, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    sendError(res, 500, 'Failed to fetch tasks');
    return;
  }

  const total = count ?? 0;

  sendSuccess(res, 200, {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
): Promise<void> {
  const input = validateRequest<CreateTaskInput>(
    req, res, createTaskSchema, 'body'
  );
  if (!input) return;

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      due_date: input.due_date ?? null,
    })
    .select()
    .single();

  if (error) {
    sendError(res, 500, 'Failed to create task');
    return;
  }

  sendSuccess(res, 201, { task });
}
