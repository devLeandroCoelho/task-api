import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} from './tasks.schema';

export function createTasksRoutes(controller: TasksController): Router {
  const router = Router();

  // All task routes require authentication
  router.use(authenticate);

  router.get(
    '/',
    validate(listTasksQuerySchema, 'query'),
    controller.findAll
  );

  router.get('/:id', controller.findById);

  router.post(
    '/',
    validate(createTaskSchema),
    controller.create
  );

  router.put(
    '/:id',
    validate(updateTaskSchema),
    controller.update
  );

  router.delete('/:id', controller.delete);

  return router;
}
