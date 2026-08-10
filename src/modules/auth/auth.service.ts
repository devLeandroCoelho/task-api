import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { env } from '../../config/env';
import { createAppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput } from './auth.schema';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  constructor(private db: Database.Database) {}

  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = this.db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(data.email) as { id: number } | undefined;

    if (existingUser) {
      throw createAppError('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Insert user
    const result = this.db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(data.name, data.email, hashedPassword);

    const userId = result.lastInsertRowid as number;

    // Generate token
    const token = this.generateToken({ userId, email: data.email });

    return {
      user: {
        id: userId,
        name: data.name,
        email: data.email,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    // Find user by email
    const user = this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).get(data.email) as UserRecord | undefined;

    if (!user) {
      throw createAppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw createAppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate token
    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  private generateToken(payload: { userId: number; email: string }): string {
    const options: SignOptions = { expiresIn: 60 * 60 * 24 * 7 }; // 7 days in seconds
    return jwt.sign(payload, env.JWT_SECRET, options);
  }
}
