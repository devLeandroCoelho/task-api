import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthPayload {
  userId: string;
  email: string;
}

/**
 * Extract and verify JWT from Authorization header.
 * Returns the decoded payload or null if invalid.
 */
export function verifyAuth(req: VercelRequest): AuthPayload | null {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET env var');
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Require authentication — returns 401 if not authenticated.
 */
export function requireAuth(req: VercelRequest, res: VercelResponse): AuthPayload | null {
  const payload = verifyAuth(req);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
    return null;
  }

  return payload;
}

/**
 * Generate a JWT token for a user.
 */
export function signToken(payload: AuthPayload): string {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET env var');
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
