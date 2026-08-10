import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabase } from '../_lib/supabase';
import { signToken } from '../_lib/auth';
import { validateRequest, sendError, sendSuccess } from '../_lib/zod';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

type RegisterInput = z.infer<typeof registerSchema>;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only POST allowed
  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  const input = validateRequest<RegisterInput>(req, res, registerSchema, 'body');
  if (!input) return;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', input.email)
    .single();

  if (existingUser) {
    sendError(res, 409, 'User with this email already exists');
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(input.password, salt);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true, // Auto-confirm for API-created users
  });

  if (authError || !authData.user) {
    sendError(res, 400, authError?.message ?? 'Failed to create user');
    return;
  }

  // Insert profile in users table
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      name: input.name,
      email: input.email,
    });

  if (profileError) {
    // Rollback: delete the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    sendError(res, 500, 'Failed to create user profile');
    return;
  }

  // Generate our own JWT (custom claims)
  const token = signToken({ userId: authData.user.id, email: input.email });

  sendSuccess(res, 201, {
    user: {
      id: authData.user.id,
      name: input.name,
      email: input.email,
    },
    token,
  });
}
