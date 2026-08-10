import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { createDatabase, initializeDatabase } from './db';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { TasksController } from './modules/tasks/tasks.controller';
import { TasksService } from './modules/tasks/tasks.service';
import { createTasksRoutes } from './modules/tasks/tasks.routes';

export interface AppResult {
  app: express.Express;
  database: Database.Database;
}

export function createApp(db?: Database.Database): AppResult {
  const app = express();

  const database = db ?? createDatabase();
  initializeDatabase(database);

  // Security
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Initialize services
  const authService = new AuthService(database);
  const authController = new AuthController(authService);
  const tasksService = new TasksService(database);
  const tasksController = new TasksController(tasksService);

  // Routes
  app.use(`${env.API_PREFIX}/auth`, createAuthRoutes(authController));
  app.use(`${env.API_PREFIX}/tasks`, createTasksRoutes(tasksController));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Error handler
  app.use(errorHandler);

  return { app, database };
}
