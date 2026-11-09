import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getStripeClient } from '@/lib/stripe';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (stripe && user.stripe_customer_id) {
      try {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripe_customer_id,
          return_url: `${appUrl}/billing`,
        });

        return NextResponse.json({ url: portalSession.url });
      } catch (err: any) {
        console.warn('Stripe billing portal creation failed:', err.message);
      }
    }

    // Default return to in-app billing
    return NextResponse.json({ url: `${appUrl}/billing` });
  } catch (error: any) {
    console.error('Customer portal error:', error);
    return NextResponse.json({ error: 'Failed to access billing portal' }, { status: 500 });
  }
}
