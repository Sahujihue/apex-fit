import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { signToken, getCookieName } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    let targetEmail = 'user@apexfit.com';
    if (role === 'ADMIN') targetEmail = 'admin@apexfit.com';
    else if (role === 'TRAINER') targetEmail = 'trainer@apexfit.com';
    else if (role === 'CLIENT') targetEmail = 'sarah@apexfit.com';

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail) as any;
    if (!user) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 404 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscription_tier,
    });

    const response = NextResponse.json({
      success: true,
      message: `Switched demo persona to ${user.name} (${user.role})`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        subscriptionTier: user.subscription_tier,
        onboardingCompleted: Boolean(user.onboarding_completed)
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
    console.error('Demo switch error:', error);
    return NextResponse.json({ error: 'Failed to switch demo persona' }, { status: 500 });
  }
}
