import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../_lib/supabase';
import { requireAuth } from '../_lib/auth';
import { validateRequest, sendError, sendSuccess } from '../_lib/zod';

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional()
    .nullable(),
  status: z
    .enum(['pending', 'in_progress', 'completed'])
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
  due_date: z
    .string()
    .datetime()
    .or(z.string().date())
    .optional()
    .nullable(),
});

type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const authPayload = requireAuth(req, res);
  if (!authPayload) return;

  const taskId = req.query.id as string;

  if (!taskId) {
    sendError(res, 400, 'Task ID is required');
    return;
  }

  switch (req.method) {
    case 'PUT':
      return handleUpdate(req, res, taskId, authPayload.userId);
    case 'DELETE':
      return handleDelete(res, taskId, authPayload.userId);
    default:
      sendError(res, 405, 'Method not allowed');
  }
}

async function handleUpdate(
  req: VercelRequest,
  res: VercelResponse,
  taskId: string,
  userId: string
): Promise<void> {
  const input = validateRequest<UpdateTaskInput>(
    req, res, updateTaskSchema, 'body'
  );
  if (!input) return;

  // Build update object (only include defined fields)
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.due_date !== undefined) updates.due_date = input.due_date;

  const { data: task, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !task) {
    sendError(res, 404, 'Task not found');
    return;
  }

  sendSuccess(res, 200, { task });
}

async function handleDelete(
  res: VercelResponse,
  taskId: string,
  userId: string
): Promise<void> {
  const { error, count } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    sendError(res, 500, 'Failed to delete task');
    return;
  }

  if (count === 0) {
    sendError(res, 404, 'Task not found');
    return;
  }

  res.status(204).end();
}
