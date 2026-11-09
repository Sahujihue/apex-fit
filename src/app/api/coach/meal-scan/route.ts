import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';
import { analyzeMealContent } from '@/lib/ai/coach';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check feature flag
    const flagRow = db.prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'feature_ai_meal_scan'").get() as any;
    if (flagRow && flagRow.setting_value === 'false') {
      return NextResponse.json({ error: 'AI Meal Scan is temporarily disabled by admin.' }, { status: 403 });
    }

    const { description, photoDataUrl } = await request.json();
    if (!description && !photoDataUrl) {
      return NextResponse.json({ error: 'Please provide either a meal description or photo' }, { status: 400 });
    }

    const analysis = await analyzeMealContent(description || 'Meal Photo Submission', photoDataUrl);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Meal Scan error:', error);
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 });
  }
}
