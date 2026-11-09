'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Target, Shield, HeartPulse, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl text-white">APEX<span className="text-emerald-400">FIT</span></span>
        </Link>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs">Launch App</Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">OUR MISSION</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Democratizing elite athletic science</h1>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            ApexFit was born out of frustration with disjointed fitness tracking tools that treat nutrition, sleep, progressive overload, and coaching as separate silos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <Target className="w-8 h-8 text-emerald-400 mb-2" />
            <h3 className="text-base font-bold text-white">Zero Guesswork Tracking</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We apply proven sports physiology algorithms — Mifflin-St Jeor caloric expenditure, RPE-based load autoregulation, and heart rate variability recovery indicators.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <HeartPulse className="w-8 h-8 text-cyan-400 mb-2" />
            <h3 className="text-base font-bold text-white">Holistic Health Ecosystem</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              By merging Apple Fitness ring mechanics with WHOOP recovery scores and MyFitnessPal macro granularity, you get the complete picture of your biological readiness.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
