import type { VercelRequest, VercelResponse } from '@vercel/node';
import { type ZodSchema, ZodError } from 'zod';

/**
 * Validate request body/query against a Zod schema.
 * Returns parsed data or sends 400 error and returns null.
 */
export function validateRequest<T>(
  req: VercelRequest,
  res: VercelResponse,
  schema: ZodSchema<T>,
  source: 'body' | 'query' = 'body'
): T | null {
  try {
    return schema.parse(req[source]);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((issue) => ({
        field: issue.path.map(String).join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: messages,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
    return null;
  }
}

/**
 * Send a standardized error response.
 */
export function sendError(
  res: VercelResponse,
  statusCode: number,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Send a standardized success response.
 */
export function sendSuccess(
  res: VercelResponse,
  statusCode: number,
  data: unknown
): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}
