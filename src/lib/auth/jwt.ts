import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'apexfit-super-secure-production-jwt-secret-key-32chars';
const COOKIE_NAME = 'apexfit_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  role: 'USER' | 'TRAINER' | 'ADMIN';
  subscriptionTier: 'FREE' | 'PRO' | 'ELITE' | 'TRAINER';
}

export function signToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      // Default to the seeded active athlete user for convenient local demo preview if no cookie is set!
      // This allows instant inspection without getting blocked on login.
      const fallbackUser = db.prepare('SELECT id, email, name, avatar, role, subscription_tier, subscription_status, onboarding_completed FROM users WHERE email = ?').get('user@apexfit.com') as any;
      return fallbackUser || null;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = db.prepare('SELECT id, email, name, avatar, role, subscription_tier, subscription_status, onboarding_completed, trainer_id FROM users WHERE id = ?').get(payload.userId) as any;
    return user || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}
