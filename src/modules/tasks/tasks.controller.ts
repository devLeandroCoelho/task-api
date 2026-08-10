import { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service';
import { ListTasksQuery } from './tasks.schema';

export class TasksController {
  constructor(private tasksService: TasksService) {}

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query = (req as unknown as Record<string, unknown>).validated_query as ListTasksQuery ?? req.query as unknown as ListTasksQuery;
      const result = this.tasksService.findAll(userId, query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const taskId = Number(req.params.id);
      const task = this.tasksService.findById(taskId, userId);
      res.status(200).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const task = this.tasksService.create(userId, req.body);
      res.status(201).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const taskId = Number(req.params.id);
      const task = this.tasksService.update(taskId, userId, req.body);
      res.status(200).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const taskId = Number(req.params.id);
      this.tasksService.delete(taskId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
