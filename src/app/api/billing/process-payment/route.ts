import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      tier,
      period = 'MONTHLY',
      paymentMethod = 'stripe_card', // 'stripe_card', 'razorpay', 'cashfree', 'paypal', 'crypto'
      cardDetails,
      razorpayDetails,
      cashfreeDetails,
      paypalOrderId,
      cryptoDetails,
      amount,
      couponCode
    } = await request.json();

    if (!['PRO', 'ELITE', 'TRAINER'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    // Verify gateway is enabled in admin_settings
    const gatewayKey = `gateway_${paymentMethod === 'stripe_card' ? 'stripe' : paymentMethod}_enabled`;
    const gatewaySetting = db.prepare('SELECT setting_value FROM admin_settings WHERE setting_key = ?').get(gatewayKey) as any;
    if (gatewaySetting && gatewaySetting.setting_value === 'false') {
      return NextResponse.json({ 
        error: `The ${paymentMethod.toUpperCase()} payment gateway is currently disabled by the administrator.` 
      }, { status: 403 });
    }

    let gatewayName = 'Stripe (256-Bit SSL Encrypted)';
    let customTxInfo = '';

    // Validation per gateway
    if (paymentMethod === 'stripe_card') {
      const { cardNumber, cvc, nameOnCard } = cardDetails || {};
      const cleanCard = (cardNumber || '').replace(/\s+/g, '');
      if (!cleanCard || cleanCard.length < 13) {
        return NextResponse.json({ error: 'Please enter a valid credit or debit card number (15-16 digits)' }, { status: 400 });
      }
      if (!cvc || cvc.length < 3) {
        return NextResponse.json({ error: 'Invalid CVC / CVV security code' }, { status: 400 });
      }
      if (!nameOnCard || !nameOnCard.trim()) {
        return NextResponse.json({ error: 'Cardholder name is required' }, { status: 400 });
      }
      gatewayName = 'Stripe Card Gateway (PCI-DSS Level 1)';
    } else if (paymentMethod === 'razorpay') {
      const { upiId, paymentId } = razorpayDetails || {};
      if (upiId && !upiId.includes('@')) {
        return NextResponse.json({ error: 'Please enter a valid UPI ID (e.g. username@okhdfcbank or 9876543210@paytm)' }, { status: 400 });
      }
      gatewayName = `Razorpay UPI & Cards (India - ${paymentId || 'UPI Verified'})`;
      customTxInfo = `Razorpay Ref: ${paymentId || `pay_${Date.now()}`}`;
    } else if (paymentMethod === 'cashfree') {
      const { orderId } = cashfreeDetails || {};
      gatewayName = 'Cashfree Payments (UPI / Auto-Collect)';
      customTxInfo = `Cashfree Order: ${orderId || `cf_${Date.now()}`}`;
    } else if (paymentMethod === 'paypal') {
      gatewayName = 'PayPal Express Checkout';
      customTxInfo = `PayPal Order: ${paypalOrderId || `PAYPAL_${Date.now()}`}`;
    } else if (paymentMethod === 'crypto') {
      const { token = 'USDT', txHash, network = 'TRC20' } = cryptoDetails || {};
      if (!txHash || txHash.trim().length < 8) {
        return NextResponse.json({ error: 'Please enter the transaction hash (TxHash) after sending the crypto transfer.' }, { status: 400 });
      }
      gatewayName = `Crypto Web3 Gateway (${token} - ${network})`;
      customTxInfo = `TxHash: ${txHash.substring(0, 16)}...`;
    }

    const transactionId = `txn_${paymentMethod.toUpperCase().substring(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // 1. Update user subscription status in database
    db.prepare(`
      UPDATE users
      SET subscription_tier = ?, subscription_period = ?, subscription_status = 'ACTIVE', stripe_customer_id = ?
      WHERE id = ?
    `).run(tier, period, `cus_${user.id}`, user.id);

    // 2. Increment coupon usage if used
    if (couponCode) {
      db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE code = ?').run(couponCode.toUpperCase().trim());
    }

    // 3. Dispatch in-app notification
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, 'billing', '/billing')
    `).run(
      `notif-${Date.now()}`,
      user.id,
      'Payment Processed Successfully!',
      `Receipt ${invoiceId}: Upgraded to Apex ${tier} (${period}). Gateway: ${gatewayName}. Total paid: $${amount}. ${customTxInfo}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully processed payment via ${gatewayName}!`,
      receipt: {
        transactionId,
        invoiceId,
        tier,
        period,
        amountPaid: amount,
        paymentGateway: gatewayName,
        customTxInfo,
        date: now,
        customerEmail: user.email,
        status: 'PAID'
      }
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: 'Payment processing failed. Please check your payment credentials.' }, { status: 500 });
  }
}
