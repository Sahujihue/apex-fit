import { NextResponse } from 'next/server';
import { getStripeClient, getWebhookSecret } from '@/lib/stripe';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();

    let event: any;

    if (stripe && signature && webhookSecret && webhookSecret !== 'whsec_placeholder') {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // In sandbox/test simulation mode: parse JSON event payload directly
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle Event Types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        const userId = session?.metadata?.userId || session?.client_reference_id;
        const tier = session?.metadata?.tier || 'PRO';
        const period = session?.metadata?.period || 'MONTHLY';
        const customerId = session?.customer;

        if (userId) {
          const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as any;
          if (userExists) {
            db.prepare(`
              UPDATE users
              SET subscription_tier = ?, subscription_period = ?, subscription_status = 'ACTIVE', stripe_customer_id = ?
              WHERE id = ?
            `).run(tier, period, customerId || `cus_${userId}`, userId);

            // In-app notification
            db.prepare(`
              INSERT INTO notifications (id, user_id, title, message, type, action_url)
              VALUES (?, ?, ?, ?, 'billing', '/billing')
            `).run(`notif-${Date.now()}`, userId, 'Stripe Checkout Confirmed!', `Your subscription has been activated for Apex ${tier}.`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data?.object;
        const customerId = sub?.customer;
        const status = sub?.status === 'active' ? 'ACTIVE' : sub?.status === 'trialing' ? 'TRIALING' : 'CANCELLED';

        if (customerId) {
          db.prepare('UPDATE users SET subscription_status = ? WHERE stripe_customer_id = ?').run(status, customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data?.object;
        const customerId = sub?.customer;

        if (customerId) {
          db.prepare("UPDATE users SET subscription_tier = 'FREE', subscription_status = 'CANCELLED' WHERE stripe_customer_id = ?").run(customerId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data?.object;
        console.log(`[Stripe Webhook] Invoice ${invoice?.id} payment succeeded for customer ${invoice?.customer}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data?.object;
        const customerId = invoice?.customer;
        if (customerId) {
          const user = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').get(customerId) as any;
          if (user) {
            db.prepare(`
              INSERT INTO notifications (id, user_id, title, message, type, action_url)
              VALUES (?, ?, 'Payment Action Required', 'Your latest subscription renewal payment failed. Please update your payment method.', 'billing', '/billing')
            `).run(`notif-${Date.now()}`, user.id);
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventType: event.type });
  } catch (error: any) {
    console.error('Stripe webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler encountered an error' }, { status: 500 });
  }
}
