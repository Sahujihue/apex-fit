import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';
import { calculateDailyActivityScore, calculateBMI } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. User Profile & Targets
    let profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id) as any;
    if (!profile) {
      // Default fallback targets
      profile = {
        age: 28,
        height_cm: 180,
        current_weight_kg: 78.5,
        target_weight_kg: 75.0,
        fitness_goal: 'muscle_gain',
        daily_calorie_target: 2450,
        daily_protein_target: 180,
        daily_carbs_target: 250,
        daily_fat_target: 70,
        daily_water_target_ml: 3500,
        daily_steps_target: 10000,
      };
    }

    // 2. Today's Activity Log
    let activity = db.prepare('SELECT * FROM daily_activity_logs WHERE user_id = ? AND date = ?').get(user.id, today) as any;
    if (!activity) {
      // Try latest activity log if today hasn't been logged yet
      activity = db.prepare('SELECT * FROM daily_activity_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1').get(user.id) as any;
      if (!activity) {
        activity = {
          steps: 8400,
          distance_km: 6.2,
          calories_burned: 2250,
          active_minutes: 45,
          water_intake_ml: 2500,
          sleep_duration_hours: 7.5,
          sleep_quality_score: 82,
          recovery_score: 86,
          source: 'manual'
        };
      }
    }

    // 3. Today's Meals & Macro sums
    const meals = db.prepare('SELECT * FROM meal_logs WHERE user_id = ? AND date = ?').all(user.id, today) as any[];
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

    // 4. Past 7-Day Activity & Calorie Burn Trend for Recharts
    const pastDaysLogs = db.prepare(`
      SELECT date, steps, calories_burned, active_minutes, sleep_duration_hours, recovery_score
      FROM daily_activity_logs
      WHERE user_id = ?
      ORDER BY date ASC
      LIMIT 7
    `).all(user.id) as any[];

    // 5. Recent Workouts
    const recentWorkouts = db.prepare(`
      SELECT id, title, started_at, completed_at, duration_seconds, calories_burned, total_volume_kg, rating, notes
      FROM workout_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 3
    `).all(user.id) as any[];

    // 6. Gamification
    const gamification = db.prepare('SELECT * FROM gamification WHERE user_id = ?').get(user.id) as any;
    const streak = gamification?.current_streak || 1;
    const points = gamification?.total_points || 150;
    const level = gamification?.current_level || 1;
    const unlockedBadges = gamification?.unlocked_badges_json ? JSON.parse(gamification.unlocked_badges_json) : [];

    // 7. Recent PRs
    const personalRecords = db.prepare(`
      SELECT exercise_name, record_type, value, unit, achieved_at
      FROM personal_records
      WHERE user_id = ?
      ORDER BY achieved_at DESC
      LIMIT 4
    `).all(user.id) as any[];

    // 8. BMI & Body Progress
    const bmiData = calculateBMI(profile.current_weight_kg, profile.height_cm);

    // 9. Activity Score
    const dailyActivityScore = calculateDailyActivityScore({
      steps: activity.steps,
      stepsTarget: profile.daily_steps_target,
      activeMinutes: activity.active_minutes,
      activeTarget: 45,
      caloriesBurned: activity.calories_burned,
      caloriesTarget: 2500,
      sleepHours: activity.sleep_duration_hours,
      sleepTarget: 8.0
    });

    // 10. Apple Fitness Ring Percentages
    const moveRingPct = Math.min(Math.round((activity.calories_burned / 2500) * 100), 100);
    const exerciseRingPct = Math.min(Math.round((activity.active_minutes / 45) * 100), 100);
    const standRingPct = Math.min(Math.round((activity.steps / profile.daily_steps_target) * 100), 100);

    return NextResponse.json({
      today,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        subscriptionTier: user.subscription_tier
      },
      profile,
      bmi: bmiData,
      activityScore: dailyActivityScore,
      rings: {
        move: { current: activity.calories_burned, target: 2500, pct: moveRingPct, unit: 'kcal' },
        exercise: { current: activity.active_minutes, target: 45, pct: exerciseRingPct, unit: 'min' },
        stand: { current: activity.steps, target: profile.daily_steps_target, pct: standRingPct, unit: 'steps' }
      },
      nutrition: {
        calories: { current: Math.round(totalCalories), target: profile.daily_calorie_target },
        protein: { current: Math.round(totalProtein), target: profile.daily_protein_target },
        carbs: { current: Math.round(totalCarbs), target: profile.daily_carbs_target },
        fat: { current: Math.round(totalFat), target: profile.daily_fat_target },
        fiber: { current: Math.round(totalFiber), target: 35 },
        mealsCount: meals.length
      },
      activity: {
        steps: activity.steps,
        distanceKm: activity.distance_km,
        caloriesBurned: activity.calories_burned,
        activeMinutes: activity.active_minutes,
        waterIntakeMl: activity.water_intake_ml,
        waterTargetMl: profile.daily_water_target_ml,
        sleepHours: activity.sleep_duration_hours,
        sleepQuality: activity.sleep_quality_score,
        recoveryScore: activity.recovery_score,
        source: activity.source
      },
      weeklyTrend: pastDaysLogs.map(l => ({
        day: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: l.date,
        steps: l.steps,
        calories: l.calories_burned,
        activeMin: l.active_minutes,
        recovery: l.recovery_score
      })),
      recentWorkouts,
      personalRecords,
      gamification: {
        streak,
        points,
        level,
        badgesCount: unlockedBadges.length,
        badges: unlockedBadges
      },
      aiRecommendation: {
        headline: dailyActivityScore > 85 ? 'Optimal Recovery & High Readiness' : 'Steady Progress Day',
        advice: dailyActivityScore > 85
          ? `Your CNS recovery is at ${activity.recovery_score}% with an exceptional ${activity.sleep_duration_hours}h sleep cycle. Today is prime for progressive overload on your compound lifts!`
          : `You are maintaining solid consistency. Keep your hydration up to flush lactic acid and prioritize 15 minutes of hip and shoulder mobility tonight.`
      }
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
