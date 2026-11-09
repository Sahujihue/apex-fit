import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getStripeClient, PLAN_PRICING } from '@/lib/stripe';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, period = 'MONTHLY', couponCode } = await request.json();

    if (!['PRO', 'ELITE', 'TRAINER'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier for checkout' }, { status: 400 });
    }

    const planInfo = (PLAN_PRICING as any)[tier];
    if (!planInfo) {
      return NextResponse.json({ error: 'Plan pricing not configured' }, { status: 400 });
    }

    let rawPrice = period === 'YEARLY' ? planInfo.yearlyPrice : planInfo.monthlyPrice;
    let discountPercent = 0;

    // Validate coupon if supplied
    if (couponCode) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(couponCode.toUpperCase().trim()) as any;
      if (coupon) {
        discountPercent = coupon.discount_percent;
      }
    }

    const finalAmount = discountPercent > 0
      ? parseFloat((rawPrice * (1 - discountPercent / 100)).toFixed(2))
      : rawPrice;

    const stripe = getStripeClient();

    // If actual Stripe Secret key is configured (e.g. sk_test_... or sk_live_...)
    if (stripe) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer_email: user.email,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `ApexFit ${planInfo.name} Subscription`,
                  description: `Full access to ${planInfo.name} tier (${period.toLowerCase()} billing)`
                },
                unit_amount: Math.round(finalAmount * 100),
                recurring: {
                  interval: period === 'YEARLY' ? 'year' : 'month'
                }
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId: user.id,
            tier,
            period,
            couponCode: couponCode || ''
          },
          success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/billing?cancelled=true`,
        });

        return NextResponse.json({
          mode: 'stripe_hosted',
          sessionId: session.id,
          checkoutUrl: session.url
        });
      } catch (stripeErr: any) {
        console.warn('Real Stripe call failed or key invalid, falling back to embedded checkout gateway', stripeErr.message);
      }
    }

    // Interactive Embedded Stripe & PayPal Gateway Session
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      mode: 'embedded_gateway',
      transactionId,
      tier,
      period,
      planName: planInfo.name,
      originalPrice: rawPrice,
      discountPercent,
      finalAmount,
      currency: 'USD',
      userEmail: user.email,
      supportedGateways: ['stripe_card', 'paypal', 'apple_pay', 'google_pay'],
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_apexfit_sandbox'
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to initiate checkout session' }, { status: 500 });
  }
}
