import Database from 'better-sqlite3';
import { createAppError } from '../../middleware/errorHandler';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from './tasks.schema';

interface TaskRecord {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export class TasksService {
  constructor(private db: Database.Database) {}

  findAll(userId: number, query: ListTasksQuery) {
    const { status, priority, page, limit } = query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    const params: (string | number)[] = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }

    // Get total count
    const countResult = this.db.prepare(
      `SELECT COUNT(*) as total FROM tasks ${whereClause}`
    ).get(...params) as { total: number };

    // Get paginated results
    const tasks = this.db.prepare(
      `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as TaskRecord[];

    return {
      tasks,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    };
  }

  findById(id: number, userId: number): TaskRecord {
    const task = this.db.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).get(id, userId) as TaskRecord | undefined;

    if (!task) {
      throw createAppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    return task;
  }

  create(userId: number, data: CreateTaskInput): TaskRecord {
    const result = this.db.prepare(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      data.title,
      data.description ?? null,
      data.status,
      data.priority,
      data.due_date ?? null,
      userId
    );

    const task = this.db.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).get(result.lastInsertRowid) as TaskRecord;

    return task;
  }

  update(id: number, userId: number, data: UpdateTaskInput): TaskRecord {
    // Verify task exists and belongs to user
    this.findById(id, userId);

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push('priority = ?');
      values.push(data.priority);
    }
    if (data.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(data.due_date);
    }

    if (fields.length === 0) {
      throw createAppError('No fields to update', 400, 'NO_FIELDS_TO_UPDATE');
    }

    fields.push("updated_at = datetime('now')");
    values.push(id, userId);

    this.db.prepare(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
    ).run(...values);

    return this.findById(id, userId);
  }

  delete(id: number, userId: number): void {
    const result = this.db.prepare(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?'
    ).run(id, userId);

    if (result.changes === 0) {
      throw createAppError('Task not found', 404, 'TASK_NOT_FOUND');
    }
  }
}
