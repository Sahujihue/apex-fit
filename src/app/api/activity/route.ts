import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '14', 10);

    const logs = db.prepare(`
      SELECT * FROM daily_activity_logs
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ?
    `).all(user.id, limit) as any[];

    // Calculate rolling averages
    let totalSteps = 0;
    let totalBurn = 0;
    let totalActive = 0;
    let totalSleep = 0;
    let totalRecovery = 0;

    logs.forEach(l => {
      totalSteps += l.steps || 0;
      totalBurn += l.calories_burned || 0;
      totalActive += l.active_minutes || 0;
      totalSleep += l.sleep_duration_hours || 0;
      totalRecovery += l.recovery_score || 0;
    });

    const count = logs.length || 1;

    return NextResponse.json({
      logs,
      averages: {
        steps: Math.round(totalSteps / count),
        caloriesBurned: Math.round(totalBurn / count),
        activeMinutes: Math.round(totalActive / count),
        sleepHours: parseFloat((totalSleep / count).toFixed(1)),
        recoveryScore: Math.round(totalRecovery / count)
      }
    });
  } catch (error: any) {
    console.error('Activity GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'log_water', amountMl = 250, steps = 0, sleepHours = 7.5, sleepQuality = 80 } = body;
    const today = new Date().toISOString().split('T')[0];

    let row = db.prepare('SELECT * FROM daily_activity_logs WHERE user_id = ? AND date = ?').get(user.id, today) as any;

    if (action === 'log_water') {
      if (row) {
        db.prepare('UPDATE daily_activity_logs SET water_intake_ml = water_intake_ml + ? WHERE user_id = ? AND date = ?')
          .run(amountMl, user.id, today);
      } else {
        db.prepare(`
          INSERT INTO daily_activity_logs (id, user_id, date, water_intake_ml, source)
          VALUES (?, ?, ?, ?, 'manual')
        `).run(`act-${Date.now()}`, user.id, today, amountMl);
      }
      return NextResponse.json({ success: true, message: `Added ${amountMl}ml water!` });
    }

    if (action === 'log_steps') {
      const distKm = parseFloat((steps * 0.00075).toFixed(2));
      const burn = Math.round(steps * 0.04);

      if (row) {
        db.prepare(`
          UPDATE daily_activity_logs
          SET steps = steps + ?, distance_km = distance_km + ?, calories_burned = calories_burned + ?
          WHERE user_id = ? AND date = ?
        `).run(steps, distKm, burn, user.id, today);
      } else {
        db.prepare(`
          INSERT INTO daily_activity_logs (id, user_id, date, steps, distance_km, calories_burned, source)
          VALUES (?, ?, ?, ?, ?, ?, 'manual')
        `).run(`act-${Date.now()}`, user.id, today, steps, distKm, burn);
      }
      return NextResponse.json({ success: true, message: `Logged ${steps} steps!` });
    }

    if (action === 'log_sleep') {
      // Approximate recovery score: high sleep quality & 7-9 hours yields 85-95%
      const recovery = Math.min(Math.round((sleepQuality * 0.7) + (Math.min(sleepHours / 8.0, 1.0) * 30)), 100);

      if (row) {
        db.prepare(`
          UPDATE daily_activity_logs
          SET sleep_duration_hours = ?, sleep_quality_score = ?, recovery_score = ?
          WHERE user_id = ? AND date = ?
        `).run(sleepHours, sleepQuality, recovery, user.id, today);
      } else {
        db.prepare(`
          INSERT INTO daily_activity_logs (id, user_id, date, sleep_duration_hours, sleep_quality_score, recovery_score, source)
          VALUES (?, ?, ?, ?, ?, ?, 'manual')
        `).run(`act-${Date.now()}`, user.id, today, sleepHours, sleepQuality, recovery);
      }
      return NextResponse.json({ success: true, message: `Logged ${sleepHours}h sleep (Recovery Score: ${recovery}%)` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Activity POST error:', error);
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
  }
}
