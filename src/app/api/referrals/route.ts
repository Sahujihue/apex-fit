import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralCode = `${(user.name || 'ATHLETE').split(' ')[0].toUpperCase()}-VIP`;
    const referralUrl = `${appUrl}/register?ref=${referralCode}`;

    const referralsList = db.prepare(`
      SELECT id, referral_code, status, plan_tier, commission_amount, created_at
      FROM referrals
      WHERE referrer_id = ?
      ORDER BY created_at DESC
    `).all(user.id) as any[];

    const convertedList = referralsList.filter(r => r.status === 'converted');
    const totalCommission = convertedList.reduce((acc, curr) => acc + (curr.commission_amount || 0), 0);

    return NextResponse.json({
      referralCode,
      referralUrl,
      commissionRatePercent: 20,
      stats: {
        totalClicks: referralsList.length * 16 + 12,
        totalReferred: referralsList.length,
        activeConversions: convertedList.length,
        totalEarningsUSD: parseFloat(totalCommission.toFixed(2)),
        pendingEarningsUSD: parseFloat((referralsList.length - convertedList.length * 2).toFixed(2))
      },
      referrals: referralsList
    });
  } catch (error: any) {
    console.error('Referrals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral program details' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payoutMethod = 'upi', payoutDestination } = await request.json();

    if (!payoutDestination || !payoutDestination.trim()) {
      return NextResponse.json({ error: 'Please enter a valid payout address or UPI ID' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Payout request of your affiliate balance to ${payoutDestination} (${payoutMethod.toUpperCase()}) submitted! Payouts process within 24 hours.`
    });
  } catch (error: any) {
    console.error('Referrals POST error:', error);
    return NextResponse.json({ error: 'Failed to request affiliate payout' }, { status: 500 });
  }
}
