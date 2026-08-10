import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import { closeDatabase } from '../src/db';

let app: express.Express;
let db: Database.Database;
let authToken: string;

beforeAll(async () => {
  const result = createApp();
  app = result.app;
  db = result.database;

  // Register a test user and get token
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });
  authToken = res.body.data.token;
});

afterAll(() => {
  closeDatabase();
});

beforeEach(() => {
  db.exec('DELETE FROM tasks');
});

describe('Tasks', () => {
  const sampleTask = {
    title: 'Test Task',
    description: 'Test description',
    priority: 'high',
    status: 'pending',
  };

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task).toMatchObject({
        title: sampleTask.title,
        description: sampleTask.description,
        priority: sampleTask.priority,
        status: sampleTask.status,
      });
    });

    it('should reject without auth', async () => {
      await request(app)
        .post('/api/tasks')
        .send(sampleTask)
        .expect(401);
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create multiple tasks
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: `Task ${i + 1}` });
      }
    });

    it('should list tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should paginate tasks', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.tasks).toHaveLength(2);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter by status', async () => {
      // Complete one task
      const tasks = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      const taskId = tasks.body.data.tasks[0].id;
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      const response = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.tasks).toHaveLength(1);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleTask);
      taskId = res.body.data.task.id;
    });

    it('should update a task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title', status: 'completed' })
        .expect(200);

      expect(response.body.data.task.title).toBe('Updated Title');
      expect(response.body.data.task.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('should not update other user task', async () => {
      // Register another user
      const otherUser = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'Password123',
        });
      const otherToken = otherUser.body.data.token;

      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked' })
        .expect(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleTask);
      taskId = res.body.data.task.id;
    });

    it('should delete a task', async () => {
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify it's gone
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
