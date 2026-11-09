import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Calculate Body Mass Index (BMI)
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
} {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) {
    return { bmi: 0, category: 'Normal', color: 'text-zinc-400' };
  }
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) return { bmi, category: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25.0) return { bmi, category: 'Normal', color: 'text-emerald-400' };
  if (bmi < 30.0) return { bmi, category: 'Overweight', color: 'text-amber-400' };
  return { bmi, category: 'Obese', color: 'text-rose-400' };
}

// Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' = 'male'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

// Calculate Total Daily Energy Expenditure (TDEE)
export function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'): number {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.375));
}

// Calculate Activity Score (0 - 100) inspired by WHOOP & Apple Fitness
export function calculateDailyActivityScore(metrics: {
  steps: number;
  stepsTarget: number;
  activeMinutes: number;
  activeTarget: number;
  caloriesBurned: number;
  caloriesTarget: number;
  sleepHours: number;
  sleepTarget?: number;
}): number {
  const stepsRatio = Math.min(metrics.steps / (metrics.stepsTarget || 10000), 1.2);
  const activeRatio = Math.min(metrics.activeMinutes / (metrics.activeTarget || 45), 1.2);
  const caloriesRatio = Math.min(metrics.caloriesBurned / (metrics.caloriesTarget || 2500), 1.2);
  const sleepRatio = Math.min(metrics.sleepHours / (metrics.sleepTarget || 8.0), 1.0);

  // Weighted score
  const score = Math.round(
    (stepsRatio * 30) +
    (activeRatio * 35) +
    (caloriesRatio * 20) +
    (sleepRatio * 15)
  );

  return Math.min(Math.max(score, 10), 100);
}

// Format duration in seconds to "Xh Ym" or "Ym Zs"
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Format date relative or localized
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
