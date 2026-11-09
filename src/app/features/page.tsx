'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Bot,
  Dumbbell,
  Utensils,
  HeartPulse,
  Scale,
  Trophy,
  Users,
  Watch,
  ArrowRight
} from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: Flame,
      title: 'Apple Fitness Activity Rings',
      desc: 'Three concentric circular SVG indicators monitoring Move (active calories), Exercise (minutes), and Stand/Steps with live progress updates.',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      icon: Bot,
      title: 'Apex AI Personal Trainer',
      desc: 'Algorithmic periodization, progressive overload recommendations, injury workarounds, and conversational fitness reasoning powered by Google Gemini and LLM engines.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      icon: Dumbbell,
      title: 'Active Workout Session Tracker',
      desc: 'Live stopwatch, audio/visual 60-second rest countdown timers, set-by-set weight & rep tracking, and automated total training volume calculation.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: Utensils,
      title: 'Macronutrient Nutrition & Vision',
      desc: '100+ verified food database, customized calorie/protein/carb/fat targets, meal classification, and AI photo analysis for instant estimated nutrition.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      icon: HeartPulse,
      title: 'WHOOP-Style Recovery Strain',
      desc: 'Autonomic nervous system recovery scoring (0-100%) based on sleep architecture, resting heart rate, and training fatigue.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      icon: Scale,
      title: 'Body Progress & Before/After Slider',
      desc: 'Continuous weight tracking, BMI health meters, body fat percentage calculations, circumference logs, and interactive Before & After visual comparison sliders.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      icon: Trophy,
      title: 'Gamification & Challenges',
      desc: 'Activity streaks with fire badges, level progression (Level 1 to 50), XP rewards, global opt-in leaderboards, and weekly community quests.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      icon: Users,
      title: 'Dedicated Trainer Portal',
      desc: 'Full personal coaching suite allowing certified trainers to manage athlete rosters, assign workout and meal plans, and host video calls.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: Watch,
      title: 'Wearable Telemetry Sync',
      desc: 'Zero-friction telemetry pipelines supporting Apple Health, Google Health Connect, WHOOP 4.0, Garmin, and Fitbit devices.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl text-white">APEX<span className="text-emerald-400">FIT</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold text-zinc-300 hover:text-white">Sign In</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs">Launch App</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">PLATFORM CAPABILITIES</span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Engineered for precision, speed, and athletic growth
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Every feature on ApexFit is built to replace fragmented fitness apps with a unified, high-performance daily platform.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureList.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between glow-card">
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-purple-950/40 border border-zinc-800 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Experience all capabilities live</h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Test our live demo directly with pre-loaded workout logs, meal plans, and AI coaching.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-glow-green transition-all"
            >
              Open Live Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
