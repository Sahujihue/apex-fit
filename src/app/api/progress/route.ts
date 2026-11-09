import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';
import { calculateBMI } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = db.prepare('SELECT current_weight_kg, target_weight_kg, height_cm, target_date FROM user_profiles WHERE user_id = ?').get(user.id) as any;

    const measurements = db.prepare(`
      SELECT * FROM body_measurements
      WHERE user_id = ?
      ORDER BY date ASC
    `).all(user.id) as any[];

    const heightCm = profile?.height_cm || 178;
    const currentWeight = profile?.current_weight_kg || 78.5;
    const targetWeight = profile?.target_weight_kg || 75.0;

    const formattedMeasurements = measurements.map(m => ({
      ...m,
      bmi: calculateBMI(m.weight_kg, heightCm).bmi
    }));

    const latest = measurements[measurements.length - 1] || null;
    const initial = measurements[0] || null;

    const totalChangeKg = initial && latest ? parseFloat((latest.weight_kg - initial.weight_kg).toFixed(1)) : 0;

    return NextResponse.json({
      profile: {
        heightCm,
        currentWeight,
        targetWeight,
        targetDate: profile?.target_date,
        totalChangeKg,
        bmi: calculateBMI(currentWeight, heightCm)
      },
      history: formattedMeasurements,
      latest
    });
  } catch (error: any) {
    console.error('Progress GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress metrics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date = new Date().toISOString().split('T')[0],
      weightKg,
      bodyFatPct,
      waistCm,
      chestCm,
      armsCm,
      hipsCm,
      thighsCm,
      notes = ''
    } = body;

    if (!weightKg) {
      return NextResponse.json({ error: 'Weight is required' }, { status: 400 });
    }

    const measId = `meas-${Date.now()}`;
    db.prepare(`
      INSERT INTO body_measurements (id, user_id, date, weight_kg, body_fat_pct, waist_cm, chest_cm, arms_cm, hips_cm, thighs_cm, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(measId, user.id, date, weightKg, bodyFatPct || null, waistCm || null, chestCm || null, armsCm || null, hipsCm || null, thighsCm || null, notes);

    // Update current weight in user_profiles
    db.prepare('UPDATE user_profiles SET current_weight_kg = ? WHERE user_id = ?').run(weightKg, user.id);

    return NextResponse.json({
      success: true,
      measId,
      message: 'Body measurements and weight updated successfully!'
    });
  } catch (error: any) {
    console.error('Progress POST error:', error);
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}
