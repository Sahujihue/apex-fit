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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const search = searchParams.get('search');

    // If searching food database
    if (search) {
      const foods = db.prepare(`
        SELECT * FROM foods
        WHERE name LIKE ? OR brand LIKE ? OR category LIKE ?
        LIMIT 25
      `).all(`%${search}%`, `%${search}%`, `%${search}%`);

      return NextResponse.json({ foods });
    }

    // Fetch user targets
    let profile = db.prepare('SELECT daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fat_target, daily_water_target_ml FROM user_profiles WHERE user_id = ?').get(user.id) as any;
    if (!profile) {
      profile = {
        daily_calorie_target: 2400,
        daily_protein_target: 180,
        daily_carbs_target: 240,
        daily_fat_target: 70,
        daily_water_target_ml: 3500
      };
    }

    // Fetch meal logs for date
    const meals = db.prepare(`
      SELECT * FROM meal_logs
      WHERE user_id = ? AND date = ?
      ORDER BY logged_at ASC
    `).all(user.id, date) as any[];

    // Group meals by meal_type
    const grouped = {
      breakfast: meals.filter(m => m.meal_type === 'breakfast'),
      lunch: meals.filter(m => m.meal_type === 'lunch'),
      dinner: meals.filter(m => m.meal_type === 'dinner'),
      snack: meals.filter(m => m.meal_type === 'snack')
    };

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    meals.forEach(m => {
      totalCalories += m.calories || 0;
      totalProtein += m.protein || 0;
      totalCarbs += m.carbs || 0;
      totalFat += m.fat || 0;
      totalFiber += m.fiber || 0;
    });

    // Also get water intake for this date
    const activity = db.prepare('SELECT water_intake_ml FROM daily_activity_logs WHERE user_id = ? AND date = ?').get(user.id, date) as any;
    const waterIntake = activity?.water_intake_ml || 0;

    return NextResponse.json({
      date,
      targets: {
        calories: profile.daily_calorie_target,
        protein: profile.daily_protein_target,
        carbs: profile.daily_carbs_target,
        fat: profile.daily_fat_target,
        waterMl: profile.daily_water_target_ml
      },
      consumed: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        fiber: Math.round(totalFiber),
        waterMl: waterIntake
      },
      meals: grouped,
      allLogs: meals
    });
  } catch (error: any) {
    console.error('Nutrition GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition data' }, { status: 500 });
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
      mealType = 'breakfast',
      foodName,
      servings = 1.0,
      calories = 0,
      protein = 0,
      carbs = 0,
      fat = 0,
      fiber = 0
    } = body;

    if (!foodName) {
      return NextResponse.json({ error: 'Food name is required' }, { status: 400 });
    }

    const mealId = `meal-${Date.now()}`;
    const loggedAt = `${date} ${new Date().toTimeString().split(' ')[0]}`;

    db.prepare(`
      INSERT INTO meal_logs (id, user_id, date, meal_type, food_name, servings, calories, protein, carbs, fat, fiber, logged_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(mealId, user.id, date, mealType, foodName, servings, calories, protein, carbs, fat, fiber, loggedAt);

    return NextResponse.json({
      success: true,
      mealId,
      message: `${foodName} logged to ${mealType}!`
    });
  } catch (error: any) {
    console.error('Nutrition POST error:', error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM meal_logs WHERE id = ? AND user_id = ?').run(id, user.id);

    return NextResponse.json({ success: true, message: 'Meal entry deleted' });
  } catch (error: any) {
    console.error('Nutrition DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete meal entry' }, { status: 500 });
  }
}
