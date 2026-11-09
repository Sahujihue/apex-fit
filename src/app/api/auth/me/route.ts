import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id) as any;
    const gamification = db.prepare('SELECT * FROM gamification WHERE user_id = ?').get(user.id) as any;
    const unreadNotifications = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(user.id) as any;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        subscriptionStatus: user.subscription_status,
        onboardingCompleted: Boolean(user.onboarding_completed),
        trainerId: user.trainer_id,
        unreadNotificationsCount: unreadNotifications?.count || 0
      },
      profile: profile ? {
        ...profile,
        equipment: profile.equipment ? JSON.parse(profile.equipment) : []
      } : null,
      gamification: gamification ? {
        ...gamification,
        unlockedBadges: gamification.unlocked_badges_json ? JSON.parse(gamification.unlocked_badges_json) : []
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ authenticated: false, error: 'Failed to verify session' }, { status: 500 });
  }
}
