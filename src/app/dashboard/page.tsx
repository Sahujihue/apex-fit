'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Footprints,
  Clock,
  Droplets,
  Moon,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Plus,
  Sparkles,
  Dumbbell,
  Scale,
  HeartPulse,
  Bot
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import ActivityRings from '@/components/dashboard/ActivityRings';
import { formatNumber, formatDuration } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [waterAddedMessage, setWaterAddedMessage] = useState('');
  const [quickLogModal, setQuickLogModal] = useState(false);
  const [customSteps, setCustomSteps] = useState('2000');
  const [customWater, setCustomWater] = useState('500');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickWater = async (amount: number) => {
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log_water', amountMl: amount })
      });
      if (res.ok) {
        setWaterAddedMessage(`+${amount}ml logged!`);
        setTimeout(() => setWaterAddedMessage(''), 2500);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickSteps = async () => {
    try {
      const steps = parseInt(customSteps, 10);
      if (isNaN(steps) || steps <= 0) return;
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log_steps', steps })
      });
      if (res.ok) {
        setQuickLogModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-zinc-400">Loading your biometric fitness metrics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-zinc-400">Unable to load dashboard data. Please refresh.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header Banner: Daily Activity Score & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800/80 border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Daily Readiness & Strain</span>
              <span className="text-xs text-zinc-400">• {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{data.activityScore}</span>
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">/ 100 Score</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {data.activityScore >= 80 ? '🔥 Prime Condition' : '⚡ Active Rebuilding'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-xl">
              {data.aiRecommendation?.advice}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={() => setQuickLogModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Quick Log
            </button>
            <Link
              href="/workouts"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
            >
              <Dumbbell className="w-4 h-4" />
              Start Workout
            </Link>
          </div>
        </div>

        {/* Section 1: Apple Fitness Activity Rings + Nutrition Macros */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Apple Fitness Activity Rings Card */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Activity Completion Rings
                </h3>
                <p className="text-xs text-zinc-400">Apple Fitness-inspired three-ring tracking model</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">Live Device Sync</span>
            </div>

            <div className="py-2">
              <ActivityRings
                move={data.rings.move}
                exercise={data.rings.exercise}
                stand={data.rings.stand}
              />
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Goal reached: <strong className="text-white">{Math.round((data.rings.move.pct + data.rings.exercise.pct + data.rings.stand.pct) / 3)}%</strong></span>
              <Link href="/activity" className="text-emerald-400 hover:underline flex items-center gap-1">
                View Sleep & Recovery details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Daily Nutrition & Calorie Burn Balance */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Nutrition & Energy Balance
                </h3>
                <p className="text-xs text-zinc-400">Net Calories: {data.nutrition.calories.current - data.activity.caloriesBurned} kcal</p>
              </div>
              <Link href="/nutrition" className="text-xs text-emerald-400 hover:underline">
                Log Meal
              </Link>
            </div>

            {/* Calorie Progress Bar */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-300">Calories Consumed</span>
                <span className="text-white font-bold">
                  {data.nutrition.calories.current} / {data.nutrition.calories.target} kcal
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((data.nutrition.calories.current / data.nutrition.calories.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Macronutrient Bars */}
            <div className="grid grid-cols-3 gap-3">
              {/* Protein */}
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">PROTEIN</span>
                <p className="text-base font-extrabold text-white mt-1">
                  {data.nutrition.protein.current}g
                </p>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min((data.nutrition.protein.current / data.nutrition.protein.target) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block mt-1">Target: {data.nutrition.protein.target}g</span>
              </div>

              {/* Carbs */}
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">CARBS</span>
                <p className="text-base font-extrabold text-white mt-1">
                  {data.nutrition.carbs.current}g
                </p>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min((data.nutrition.carbs.current / data.nutrition.carbs.target) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block mt-1">Target: {data.nutrition.carbs.target}g</span>
              </div>

              {/* Fats */}
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">FATS</span>
                <p className="text-base font-extrabold text-white mt-1">
                  {data.nutrition.fat.current}g
                </p>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${Math.min((data.nutrition.fat.current / data.nutrition.fat.target) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block mt-1">Target: {data.nutrition.fat.target}g</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>{data.nutrition.mealsCount} meals logged today</span>
              <Link href="/nutrition" className="text-emerald-400 hover:underline">
                AI Meal Scan Camera →
              </Link>
            </div>
          </div>
        </div>

        {/* Section 2: 4 Biometric Metric Cards (Steps, Water, Sleep, Recovery) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Steps */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Steps</span>
              <Footprints className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">{formatNumber(data.activity.steps)}</p>
            <p className="text-xs text-zinc-400 mt-1">{data.activity.distanceKm} km travelled</p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.min((data.activity.steps / data.profile.daily_steps_target) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Water Intake */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card relative">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Water</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{data.activity.waterIntakeMl} <span className="text-xs font-normal text-zinc-400">ml</span></p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleQuickWater(250)}
                className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[11px] font-bold transition-all"
              >
                +250ml
              </button>
              <button
                onClick={() => handleQuickWater(500)}
                className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[11px] font-bold transition-all"
              >
                +500ml
              </button>
              {waterAddedMessage && (
                <span className="text-[10px] text-emerald-400 font-bold animate-pulse">{waterAddedMessage}</span>
              )}
            </div>
          </div>

          {/* Sleep Score */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Sleep</span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{data.activity.sleepHours} <span className="text-xs font-normal text-zinc-400">hrs</span></p>
            <p className="text-xs text-zinc-400 mt-1">Quality: <strong className="text-indigo-400">{data.activity.sleepQuality}%</strong></p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-400 rounded-full"
                style={{ width: `${Math.min((data.activity.sleepHours / 8.0) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* WHOOP-Style Recovery */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Recovery Strain</span>
              <HeartPulse className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{data.activity.recoveryScore}%</p>
            <p className="text-xs text-zinc-400 mt-1">Status: <strong className="text-emerald-400">Optimal Recovery</strong></p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${data.activity.recoveryScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Recharts 7-Day Activity & Calorie Burn Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Weekly Activity & Calorie Trend
                </h3>
                <p className="text-xs text-zinc-400">Daily calorie burn and activity volume progression</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyTrend}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCal)"
                    name="Calories Burned"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Body Progress & BMI Gauge */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  Body Composition
                </h3>
                <Link href="/progress" className="text-xs text-emerald-400 hover:underline">
                  Full Tracker →
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400">Current Weight</span>
                  <span className="text-2xl font-black text-white">{data.profile.current_weight_kg} kg</span>
                </div>
                <div className="flex justify-between items-baseline mt-1 text-xs text-zinc-400">
                  <span>Target Weight: <strong className="text-zinc-200">{data.profile.target_weight_kg} kg</strong></span>
                  <span className="text-emerald-400 font-semibold">-3.5 kg achieved</span>
                </div>
              </div>

              {/* BMI Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400">BMI Index</span>
                  <span className="text-2xl font-black text-white">{data.bmi.bmi}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-bold ${data.bmi.color}`}>{data.bmi.category} Weight Range</span>
                  <span className="text-[10px] text-zinc-400">Height: {data.profile.height_cm} cm</span>
                </div>
              </div>
            </div>

            {/* Streak & Gamification Badge */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  🔥
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{data.gamification.streak} Day Streak</p>
                  <p className="text-[10px] text-zinc-400">Level {data.gamification.level} Athlete • {data.gamification.points} XP</p>
                </div>
              </div>
              <Link href="/gamification" className="text-xs text-amber-400 hover:underline font-semibold">
                Badges ({data.gamification.badgesCount}) →
              </Link>
            </div>
          </div>
        </div>

        {/* Section 4: Recent Workouts & Personal Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Workouts List */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                Recent Workout History
              </h3>
              <Link href="/workouts" className="text-xs text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {data.recentWorkouts.map((w: any) => (
                <div key={w.id} className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-white">{w.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {w.started_at ? new Date(w.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'} • {formatDuration(w.duration_seconds)} • {w.calories_burned} kcal
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">{w.total_volume_kg?.toLocaleString()} kg</span>
                    <span className="block text-[10px] text-zinc-400">Volume</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Records PRs */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Personal Records (PRs)
              </h3>
              <Link href="/progress" className="text-xs text-amber-400 hover:underline">
                Milestones
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.personalRecords.map((pr: any, i: number) => (
                <div key={i} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[11px] font-medium text-zinc-400 truncate block">{pr.exercise_name}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-amber-300">{pr.value}</span>
                    <span className="text-xs text-zinc-400">{pr.unit}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Achieved {pr.achieved_at}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-200">Need a progressive overload program?</span>
              </div>
              <Link href="/coach" className="text-xs font-bold text-purple-400 hover:underline">
                Ask AI Coach →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Log Modal */}
      {quickLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Quick Activity Log</h3>
              <button onClick={() => setQuickLogModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Add Steps to Today</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    value={customSteps}
                    onChange={(e) => setCustomSteps(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Steps count"
                  />
                  <button
                    onClick={handleQuickSteps}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                  >
                    Add Steps
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Quick Water</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button onClick={() => { handleQuickWater(250); setQuickLogModal(false); }} className="py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs hover:bg-blue-500/30">
                    +250 ml
                  </button>
                  <button onClick={() => { handleQuickWater(500); setQuickLogModal(false); }} className="py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs hover:bg-blue-500/30">
                    +500 ml
                  </button>
                  <button onClick={() => { handleQuickWater(1000); setQuickLogModal(false); }} className="py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs hover:bg-blue-500/30">
                    +1,000 ml
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
