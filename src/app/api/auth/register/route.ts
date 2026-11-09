import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken, getCookieName } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { name, email, password, role = 'USER' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const assignedRole = ['USER', 'TRAINER', 'ADMIN'].includes(role) ? role : 'USER';
    const subTier = assignedRole === 'TRAINER' ? 'TRAINER' : 'FREE';

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, avatar, role, subscription_tier, subscription_status, onboarding_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0)
    `).run(
      userId,
      email,
      passwordHash,
      name,
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      assignedRole,
      subTier
    );

    // Create blank profile
    db.prepare(`
      INSERT INTO user_profiles (user_id, age, gender, height_cm, current_weight_kg, target_weight_kg, fitness_goal, experience_level, activity_level, workout_location, preferred_days_per_week, daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fat_target, daily_water_target_ml, daily_steps_target)
      VALUES (?, 28, 'other', 175, 75, 70, 'weight_loss', 'beginner', 'moderately_active', 'gym', 4, 2100, 150, 200, 60, 3000, 10000)
    `).run(userId);

    // Create gamification tracker
    db.prepare(`
      INSERT INTO gamification (user_id, current_streak, longest_streak, last_active_date, total_points, current_level, unlocked_badges_json)
      VALUES (?, 1, 1, date('now'), 50, 1, '[]')
    `).run(userId);

    const token = signToken({
      userId,
      email,
      role: assignedRole as any,
      subscriptionTier: subTier as any,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role: assignedRole,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        subscriptionTier: subTier,
        onboardingCompleted: false
      }
    });

    response.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
