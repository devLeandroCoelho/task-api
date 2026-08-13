import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth';
import { sendError, sendSuccess } from '../_lib/zod';
import { supabase } from '../_lib/supabase';
import { rateLimit } from '../_lib/rateLimit';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only GET allowed
  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  // 60 requests per 15 min per IP is plenty for profile reads
  if (!rateLimit(req, res, { max: 60 })) return;

  const authPayload = requireAuth(req, res);
  if (!authPayload) return;

  // Get user profile from users table
  const { data: profile, error } = await supabase
    .from('users')
    .select('id, name, email, created_at, updated_at')
    .eq('id', authPayload.userId)
    .single();

  if (error || !profile) {
    sendError(res, 404, 'User not found');
    return;
  }

  sendSuccess(res, 200, { user: profile });
}
