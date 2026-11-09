'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Dumbbell,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function AICoachPage() {
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
          <Link href="/coach" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple">
            Try AI Coach Live
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            POWERED BY SPORTS SCIENCE & GEMINI LLMS
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            An elite personal trainer in your pocket, 24/7
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Apex Coach isn't a pre-written chatbot. It's a continuous sports physiology engine that understands your lifting volume, recovery strain, and physical limitations.
          </p>
        </div>

        {/* 3 Core AI Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-zinc-900/70 border border-purple-500/30 glow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Progressive Overload Architecture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monitors your rate of perceived exertion (RPE) and set logs. When your compound lifts plateau, Apex Coach prescribes micro-loading, wave loading, or volume deloads.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900/70 border border-purple-500/30 glow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Injury Prevention & Joint Swaps</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If your patellar tendon or front deltoid aches, tell the coach. It instantaneously swaps back squats for box squats and overhead presses for lateral raises without missing a beat.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900/70 border border-purple-500/30 glow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Precision Macronutrient Tuning</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dynamically calculates optimal protein (2.0-2.2g per kg) and carbohydrate distribution around pre-workout and post-workout windows to fuel muscle protein synthesis.
            </p>
          </div>
        </div>

        {/* Interactive Example Consultation Card */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SAMPLE AI COACH CONSULTATION</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">Sports Science Verified</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-zinc-950 text-zinc-300 border border-zinc-800">
              <strong>User:</strong> "Apex Coach, I only have 25 minutes today and a pair of 20kg dumbbells at my hotel. What should I do for maximum upper body stimulus?"
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 text-purple-200 border border-purple-500/30 space-y-2">
              <strong className="text-purple-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4" /> Apex Coach:
              </strong>
              <p>
                "Here is a high-density <strong>Antagonistic Superset Protocol</strong> to maximize mechanical tension and pump in 22 minutes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Superset 1:</strong> Flat Dumbbell Floor Press (12 reps) into Bent-Over Dumbbell Rows (12 reps) — 4 rounds, 45s rest.</li>
                <li><strong>Superset 2:</strong> Standing Dumbbell Arnold Press (10 reps) into Incline Hammer Curls (12 reps) — 3 rounds, 30s rest.</li>
                <li><strong>Finisher:</strong> Push-ups to failure (2 sets).</li>
              </ul>
              <p className="text-xs text-zinc-400 italic">
                Focus on a 3-second eccentric lower to make the 20kg bells feel significantly heavier without excessive joint stress."
              </p>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="text-center pt-8">
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition-all shadow-glow-purple"
          >
            Open Apex AI Coach Chat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
