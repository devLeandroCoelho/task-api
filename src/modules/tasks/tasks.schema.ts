import { z } from 'zod';

export const createTaskSchema = z.object({
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

export const updateTaskSchema = z.object({
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

export const taskIdSchema = z.object({
  id: z.coerce.number().int().positive('Invalid task ID'),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdParams = z.infer<typeof taskIdSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
