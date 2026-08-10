import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      // Express 5 makes query/params read-only, so only assign to body
      if (target === 'body') {
        req.body = data;
      }
      // Store validated data on request for handlers to access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any)[`validated_${target}`] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
        return;
      }
      next(error);
    }
  };
}
