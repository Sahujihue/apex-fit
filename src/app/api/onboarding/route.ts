import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';
import { calculateBMR, calculateTDEE } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      age = 28,
      gender = 'male',
      heightCm = 175,
      currentWeightKg = 75,
      targetWeightKg = 70,
      targetDate = '2026-12-31',
      fitnessGoal = 'weight_loss',
      experienceLevel = 'intermediate',
      activityLevel = 'moderately_active',
      workoutLocation = 'gym',
      equipment = ['dumbbells', 'barbell'],
      preferredDaysPerWeek = 4,
      dietaryPreference = 'omnivore'
    } = data;

    // Calculate smart scientific targets based on user biometric data
    const bmr = calculateBMR(Number(currentWeightKg), Number(heightCm), Number(age), gender as any);
    const tdee = calculateTDEE(bmr, activityLevel as any);

    let dailyCalories = tdee;
    if (fitnessGoal === 'weight_loss') {
      dailyCalories = Math.max(tdee - 500, 1500); // 500 kcal deficit
    } else if (fitnessGoal === 'muscle_gain') {
      dailyCalories = tdee + 300; // 300 kcal lean surplus
    }

    // Protein: 2.0g per kg of bodyweight
    const proteinGrams = Math.round(Number(currentWeightKg) * 2.0);
    // Fats: 25% of total energy
    const fatGrams = Math.round((dailyCalories * 0.25) / 9);
    // Carbs: Remaining calories
    const carbGrams = Math.round((dailyCalories - (proteinGrams * 4 + fatGrams * 9)) / 4);

    const waterTargetMl = Math.round(Number(currentWeightKg) * 40); // 40ml per kg
    const stepsTarget = activityLevel === 'very_active' ? 12000 : activityLevel === 'moderately_active' ? 10000 : 8000;

    // Update or insert profile
    const existing = db.prepare('SELECT user_id FROM user_profiles WHERE user_id = ?').get(user.id);
    if (existing) {
      db.prepare(`
        UPDATE user_profiles
        SET age = ?, gender = ?, height_cm = ?, current_weight_kg = ?, target_weight_kg = ?, target_date = ?,
            fitness_goal = ?, experience_level = ?, activity_level = ?, workout_location = ?, equipment = ?,
            preferred_days_per_week = ?, daily_calorie_target = ?, daily_protein_target = ?, daily_carbs_target = ?,
            daily_fat_target = ?, daily_water_target_ml = ?, daily_steps_target = ?, dietary_preference = ?
        WHERE user_id = ?
      `).run(
        age, gender, heightCm, currentWeightKg, targetWeightKg, targetDate,
        fitnessGoal, experienceLevel, activityLevel, workoutLocation, JSON.stringify(equipment),
        preferredDaysPerWeek, dailyCalories, proteinGrams, carbGrams,
        fatGrams, waterTargetMl, stepsTarget, dietaryPreference, user.id
      );
    } else {
      db.prepare(`
        INSERT INTO user_profiles (
          user_id, age, gender, height_cm, current_weight_kg, target_weight_kg, target_date,
          fitness_goal, experience_level, activity_level, workout_location, equipment,
          preferred_days_per_week, daily_calorie_target, daily_protein_target, daily_carbs_target,
          daily_fat_target, daily_water_target_ml, daily_steps_target, dietary_preference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.id, age, gender, heightCm, currentWeightKg, targetWeightKg, targetDate,
        fitnessGoal, experienceLevel, activityLevel, workoutLocation, JSON.stringify(equipment),
        preferredDaysPerWeek, dailyCalories, proteinGrams, carbGrams,
        fatGrams, waterTargetMl, stepsTarget, dietaryPreference
      );
    }

    // Mark onboarding as completed
    db.prepare('UPDATE users SET onboarding_completed = 1 WHERE id = ?').run(user.id);

    // Initial baseline measurement entry
    db.prepare(`
      INSERT INTO body_measurements (id, user_id, date, weight_kg, notes)
      VALUES (?, ?, date('now'), ?, 'Initial baseline recorded via onboarding.')
    `).run(`meas-${Date.now()}`, user.id, currentWeightKg);

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed and personalized profile calculated!',
      targets: {
        dailyCalories,
        proteinGrams,
        carbGrams,
        fatGrams,
        waterTargetMl,
        stepsTarget
      }
    });
  } catch (error: any) {
    console.error('Onboarding update error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding details' }, { status: 500 });
  }
}
