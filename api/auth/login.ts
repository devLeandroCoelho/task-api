import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../_lib/supabase';
import { signToken } from '../_lib/auth';
import { validateRequest, sendError, sendSuccess } from '../_lib/zod';
import { rateLimit } from '../_lib/rateLimit';

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only POST allowed
  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  // Protect against brute-force: 10 attempts per 15 min per IP
  if (!rateLimit(req, res)) return;

  const input = validateRequest<LoginInput>(req, res, loginSchema, 'body');
  if (!input) return;

  // Authenticate via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (authError || !authData.user) {
    sendError(res, 401, 'Invalid email or password');
    return;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', authData.user.id)
    .single();

  const userName = profile?.name ?? 'User';

  // Generate our own JWT (custom claims)
  const token = signToken({ userId: authData.user.id, email: input.email });

  sendSuccess(res, 200, {
    user: {
      id: authData.user.id,
      name: userName,
      email: input.email,
    },
    token,
  });
}
