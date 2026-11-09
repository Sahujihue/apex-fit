import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tier = user.subscription_tier || 'FREE';
    const status = user.subscription_status || 'ACTIVE';
    const period = user.subscription_period || 'MONTHLY';

    // Query gateway & plan settings from admin_settings
    const gatewayRows = db.prepare(`
      SELECT setting_key, setting_value FROM admin_settings 
      WHERE setting_key LIKE 'gateway_%' 
         OR setting_key LIKE 'crypto_wallet_%' 
         OR setting_key LIKE 'plan_%'
         OR setting_key IN ('stripe_publishable_key', 'razorpay_key_id', 'cashfree_app_id', 'currency_conversion_inr', 'free_trial_days')
    `).all() as any[];

    const gatewayConfig: Record<string, string> = {};
    gatewayRows.forEach(r => { gatewayConfig[r.setting_key] = r.setting_value; });

    const enabledGateways = {
      stripe: gatewayConfig['gateway_stripe_enabled'] !== 'false',
      razorpay: gatewayConfig['gateway_razorpay_enabled'] !== 'false',
      cashfree: gatewayConfig['gateway_cashfree_enabled'] !== 'false',
      paypal: gatewayConfig['gateway_paypal_enabled'] !== 'false',
      crypto: gatewayConfig['gateway_crypto_enabled'] !== 'false',
    };

    // Pricing Plans Reference (Dynamically customizable by Admin)
    const plans = [
      {
        id: 'FREE',
        name: 'Apex Free',
        priceMonthly: 0,
        priceYearly: 0,
        description: 'Core tracking foundation for dedicated athletes.',
        features: [
          'Basic fitness dashboard',
          'Manual workout tracking',
          'Basic calorie & macro logging',
          '7-day progress history',
          'Community challenges'
        ],
        highlight: false
      },
      {
        id: 'PRO',
        name: 'Apex Pro',
        priceMonthly: parseFloat(gatewayConfig['plan_pro_monthly'] || '9.99'),
        priceYearly: parseFloat(gatewayConfig['plan_pro_yearly'] || '89.99'),
        description: 'Intelligent AI coaching and limitless progression analytics.',
        features: [
          'Everything in Free',
          'Apex AI Personal Fitness Coach',
          'Automated workout plan generator',
          'Full nutrition & macro insights',
          'Unlimited workout logs & PR history',
          'Wearable health sync ready'
        ],
        highlight: true
      },
      {
        id: 'ELITE',
        name: 'Apex Elite',
        priceMonthly: parseFloat(gatewayConfig['plan_elite_monthly'] || '19.99'),
        priceYearly: parseFloat(gatewayConfig['plan_elite_yearly'] || '179.99'),
        description: 'The pinnacle of biometric optimization with AI vision.',
        features: [
          'Everything in Pro',
          'AI Photo Meal Nutrition Analysis',
          'Advanced Recovery & Strain Scores (WHOOP-style)',
          'Automated Deload & Overload Adjustments',
          'Priority AI model processing',
          'Bi-weekly automated PDF fitness reports'
        ],
        highlight: false
      },
      {
        id: 'TRAINER',
        name: 'Coach & Trainer',
        priceMonthly: parseFloat(gatewayConfig['plan_trainer_monthly'] || '39.99'),
        priceYearly: parseFloat(gatewayConfig['plan_trainer_yearly'] || '349.99'),
        description: 'Complete coaching suite to manage athletes and clients.',
        features: [
          'Trainer portal & client management',
          'Assign workout routines & macro targets',
          'Monitor client adherence & check-ins',
          'Direct client messaging & video appointments',
          'Client performance audit exports'
        ],
        highlight: false
      }
    ];

    // Simulated Billing Invoices
    const invoices = [
      { id: 'INV-2026-001', date: '2026-11-01', amount: period === 'YEARLY' ? 89.99 : 9.99, status: 'Paid', plan: `${tier} (${period})`, pdfUrl: '#' },
      { id: 'INV-2026-002', date: '2026-10-01', amount: 9.99, status: 'Paid', plan: 'PRO (MONTHLY)', pdfUrl: '#' },
      { id: 'INV-2026-003', date: '2026-09-01', amount: 9.99, status: 'Paid', plan: 'PRO (MONTHLY)', pdfUrl: '#' }
    ];

    return NextResponse.json({
      subscription: {
        tier,
        status,
        period,
        nextBillingDate: '2026-12-01',
        paymentMethod: 'Visa ending in 4242'
      },
      plans,
      invoices,
      enabledGateways,
      gatewayConfig
    });
  } catch (error: any) {
    console.error('Billing GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing details' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'change_plan', tier, period = 'MONTHLY', couponCode } = body;

    if (action === 'apply_coupon') {
      if (!couponCode) {
        return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
      }

      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(couponCode.toUpperCase()) as any;
      if (!coupon) {
        return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        discountPercent: coupon.discount_percent,
        code: coupon.code,
        message: `Coupon "${coupon.code}" applied! You get ${coupon.discount_percent}% off.`
      });
    }

    if (action === 'change_plan') {
      if (!['FREE', 'PRO', 'ELITE', 'TRAINER'].includes(tier)) {
        return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
      }

      db.prepare(`
        UPDATE users
        SET subscription_tier = ?, subscription_period = ?, subscription_status = 'ACTIVE'
        WHERE id = ?
      `).run(tier, period, user.id);

      // Notification
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, action_url)
        VALUES (?, ?, ?, ?, 'billing', '/billing')
      `).run(`notif-${Date.now()}`, user.id, 'Subscription Updated!', `You are now on the Apex ${tier} plan (${period}). Enjoy all premium capabilities!`);

      return NextResponse.json({
        success: true,
        tier,
        period,
        message: `Plan upgraded to Apex ${tier} successfully!`
      });
    }

    if (action === 'cancel_subscription') {
      db.prepare("UPDATE users SET subscription_tier = 'FREE', subscription_status = 'CANCELLED' WHERE id = ?").run(user.id);
      return NextResponse.json({ success: true, message: 'Subscription cancelled. You have returned to the Free plan.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Billing POST error:', error);
    return NextResponse.json({ error: 'Failed to process subscription action' }, { status: 500 });
  }
}
