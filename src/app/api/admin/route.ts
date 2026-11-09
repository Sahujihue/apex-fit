import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      // For developer demo inspectability, allow user with admin role or fallback
      // In production enforce strictly
      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Access denied: Admin privileges required' }, { status: 403 });
      }
    }

    // 1. User & Subscription Metrics
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    const premiumUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_tier IN ('PRO', 'ELITE', 'TRAINER')").get() as any)?.count || 0;
    const activeTrainers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'TRAINER'").get() as any)?.count || 0;
    const totalWorkoutsLogged = (db.prepare('SELECT COUNT(*) as count FROM workout_logs').get() as any)?.count || 0;
    const totalMealsLogged = (db.prepare('SELECT COUNT(*) as count FROM meal_logs').get() as any)?.count || 0;

    // Simulated Financial metrics based on active tier counts
    const proCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_tier = 'PRO'").get() as any)?.count || 0;
    const eliteCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_tier = 'ELITE'").get() as any)?.count || 0;
    const trainerCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_tier = 'TRAINER'").get() as any)?.count || 0;

    const mrr = Math.round(proCount * 9.99 + eliteCount * 19.99 + trainerCount * 39.99 + 1850); // plus baseline sample MRR
    const arr = mrr * 12;
    const churnRate = 2.1; // %

    // 2. All Users List
    const users = db.prepare(`
      SELECT id, email, name, avatar, role, subscription_tier, subscription_status, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    // 3. Admin Settings & Feature Flags
    const settingsRows = db.prepare('SELECT setting_key, setting_value, description FROM admin_settings').all() as any[];
    const settingsMap: Record<string, string> = {};
    settingsRows.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    // 4. Coupons
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY times_used DESC').all();

    return NextResponse.json({
      metrics: {
        totalUsers,
        premiumUsers,
        activeTrainers,
        totalWorkoutsLogged,
        totalMealsLogged,
        mrr,
        arr,
        churnRate
      },
      users,
      settings: settingsMap,
      coupons
    });
  } catch (error: any) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin overview' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { action = 'update_setting', key, value, targetUserId, newRole, newTier, couponCode, discountPercent } = body;

    if (action === 'update_setting') {
      if (!key) return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });

      db.prepare(`
        INSERT INTO admin_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')
      `).run(key, String(value));

      return NextResponse.json({ success: true, message: `Setting "${key}" updated to ${value}` });
    }

    if (action === 'bulk_update_settings') {
      const { settingsMap } = body;
      if (!settingsMap || typeof settingsMap !== 'object') {
        return NextResponse.json({ error: 'settingsMap object is required' }, { status: 400 });
      }

      const upsert = db.prepare(`
        INSERT INTO admin_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')
      `);

      Object.entries(settingsMap).forEach(([k, v]) => {
        upsert.run(k, String(v));
      });

      return NextResponse.json({ success: true, message: 'Gateway configurations updated successfully' });
    }

    if (action === 'update_user') {
      if (!targetUserId) return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });

      if (newRole) {
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, targetUserId);
      }
      if (newTier) {
        db.prepare('UPDATE users SET subscription_tier = ? WHERE id = ?').run(newTier, targetUserId);
      }

      return NextResponse.json({ success: true, message: 'User updated successfully' });
    }

    if (action === 'create_coupon') {
      if (!couponCode || !discountPercent) {
        return NextResponse.json({ error: 'Coupon code and discount percentage are required' }, { status: 400 });
      }

      const id = `cp-${Date.now()}`;
      db.prepare(`
        INSERT INTO coupons (id, code, discount_percent, valid_until, max_uses, times_used, active)
        VALUES (?, ?, ?, '2027-12-31', 1000, 0, 1)
      `).run(id, couponCode.toUpperCase().trim(), Number(discountPercent));

      return NextResponse.json({ success: true, message: `Coupon "${couponCode.toUpperCase()}" created!` });
    }

    if (action === 'test_stripe_webhook') {
      const { eventType = 'checkout.session.completed', targetUserId = user.id, tier = 'ELITE' } = body;
      const mockEvent = {
        id: `evt_test_${Date.now()}`,
        object: 'event',
        type: eventType,
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            object: 'checkout.session',
            customer: `cus_${targetUserId}`,
            metadata: {
              userId: targetUserId,
              tier,
              period: 'MONTHLY'
            },
            payment_status: 'paid',
            status: 'complete'
          }
        }
      };

      try {
        const res = await fetch('http://localhost:3000/api/webhooks/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockEvent)
        });
        const webhookResult = await res.json();
        return NextResponse.json({
          success: res.ok,
          message: `Stripe Webhook "${eventType}" dispatched and processed!`,
          result: webhookResult
        });
      } catch (err: any) {
        return NextResponse.json({ error: `Webhook dispatch failed: ${err.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Failed to execute admin action' }, { status: 500 });
  }
}
