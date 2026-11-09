'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">FAIR & TRANSPARENT</span>
          <h1 className="text-4xl sm:text-6xl font-black text-white">Simple pricing for serious fitness</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Choose the plan suited for your lifestyle or training business.</p>

          <div className="pt-6 inline-flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setBillingPeriod('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === 'MONTHLY' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('YEARLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === 'YEARLY' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* FREE */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Apex Free</h3>
              <p className="text-xs text-zinc-400 mt-1">Core tracking basics</p>
              <div className="my-5">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-zinc-500"> / forever</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Basic fitness dashboard</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Manual workout logging</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Calorie and macro count</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 7-day progress history</p>
              </div>
            </div>
            <Link href="/register" className="mt-8 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center font-bold text-xs text-white">
              Get Started Free
            </Link>
          </div>

          {/* PRO */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-emerald-500 shadow-glow-green relative flex flex-col justify-between">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase">
              POPULAR
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Apex Pro</h3>
              <p className="text-xs text-zinc-400 mt-1">AI coaching & full analytics</p>
              <div className="my-5">
                <span className="text-3xl font-black text-white">{billingPeriod === 'YEARLY' ? '$89.99' : '$9.99'}</span>
                <span className="text-xs text-zinc-500"> /{billingPeriod === 'YEARLY' ? 'year' : 'month'}</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Everything in Free</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Apex AI Personal Fitness Coach</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited workout & PR history</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 8-week dynamic training generator</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Wearable telemetry sync</p>
              </div>
            </div>
            <Link href="/billing" className="mt-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-center font-bold text-xs text-zinc-950 shadow-glow-green">
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* ELITE */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Apex Elite</h3>
              <p className="text-xs text-zinc-400 mt-1">AI vision & autonomic recovery</p>
              <div className="my-5">
                <span className="text-3xl font-black text-white">{billingPeriod === 'YEARLY' ? '$179.99' : '$19.99'}</span>
                <span className="text-xs text-zinc-500"> /{billingPeriod === 'YEARLY' ? 'year' : 'month'}</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Everything in Pro</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> AI Meal Photo Scanner</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Recovery strain scoring</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Priority AI model speed</p>
              </div>
            </div>
            <Link href="/billing" className="mt-8 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center font-bold text-xs text-white">
              Choose Elite
            </Link>
          </div>

          {/* TRAINER */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Coach & Trainer</h3>
              <p className="text-xs text-zinc-400 mt-1">Multi-client roster suite</p>
              <div className="my-5">
                <span className="text-3xl font-black text-white">{billingPeriod === 'YEARLY' ? '$349.99' : '$39.99'}</span>
                <span className="text-xs text-zinc-500"> /{billingPeriod === 'YEARLY' ? 'year' : 'month'}</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Trainer Portal access</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Manage up to 50 active athletes</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Assign workout & meal routines</p>
                <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Integrated client messaging</p>
              </div>
            </div>
            <Link href="/billing" className="mt-8 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center font-bold text-xs text-white">
              Get Trainer Suite
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
