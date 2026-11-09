'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Bot,
  Activity,
  Dumbbell,
  Utensils,
  ShieldCheck,
  Check,
  ChevronRight,
  Play,
  ArrowRight,
  Star,
  Users,
  HeartPulse,
  Watch,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Apex AI Personal Coach differ from generic fitness apps?',
      a: 'Unlike static workout templates, Apex Coach actively synthesizes your recent lifting volumes, current fatigue telemetry, and nutrition targets. It calculates progressive overload increments, suggests exercise substitutions for sore joints, and adjusts your nutrition in real-time.'
    },
    {
      q: 'Does ApexFit integrate with Apple Health, WHOOP, and fitness wearables?',
      a: 'Yes. ApexFit features integration-ready architecture connecting Apple Health, WHOOP 4.0, Google Health Connect, and Fitbit. Telemetry such as steps, resting heart rate, active calories, and sleep duration automatically synchronize into your dashboard.'
    },
    {
      q: 'How accurate is the AI Meal Photo Scanner?',
      a: 'Our AI food scanner analyzes volumetric portion sizes and ingredient composition to deliver approximate macronutrient and caloric estimates. It provides quick tracking convenience while clearly flagging all estimates as approximate for safety.'
    },
    {
      q: 'Can personal trainers and coaches manage clients on ApexFit?',
      a: 'Yes! The Trainer Tier gives coaches a dedicated portal to manage rosters, view client adherence, assign custom workout routines, track progress photos, and conduct scheduled video coaching sessions.'
    },
    {
      q: 'Can I switch or cancel my subscription at any time?',
      a: 'Absolutely. You can upgrade, downgrade, or cancel your plan anytime directly from your Billing dashboard. There are no contracts or hidden cancellation fees.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black">
      {/* Sticky Marketing Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black shadow-glow-green">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">APEX<span className="text-emerald-400">FIT</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
            <Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link>
            <Link href="/ai-coach" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              AI Coach <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">NEW</span>
            </Link>
            <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-emerald-400 transition-colors">Science Blog</Link>
            <Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
            >
              Launch Platform →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden p-6 bg-zinc-900 border-b border-zinc-800 space-y-4">
            <div className="flex flex-col gap-3 text-sm font-semibold text-zinc-300">
              <Link href="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="/ai-coach" onClick={() => setMobileMenuOpen(false)}>AI Coach</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            </div>
            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
              <Link href="/login" className="py-2.5 rounded-xl bg-zinc-800 text-center font-bold text-xs text-white">Sign In</Link>
              <Link href="/dashboard" className="py-2.5 rounded-xl bg-emerald-500 text-center font-bold text-xs text-zinc-950">Launch App</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-zinc-300">Apple Fitness Rings × WHOOP Recovery × AI Personal Trainer</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            The intelligent fitness OS for <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">peak human performance</span>.
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Personalized biometric tracking, progressive overload algorithms, AI vision meal analysis, and real-time coaching calibrated for serious athletes and coaches.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm transition-all shadow-glow-green flex items-center justify-center gap-2 group"
            >
              Start Free Trial Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-zinc-400" />
              Live Demo Tour
            </Link>
          </div>

          {/* Live Product Preview Card Mockup */}
          <div className="mt-16 max-w-5xl mx-auto rounded-3xl bg-zinc-900/90 border border-zinc-700/60 p-4 sm:p-8 shadow-2xl relative overflow-hidden text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">LIVE DASHBOARD TELEMETRY</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Daily Strain: 92/100 • Prime Readiness</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Continuous Biometric Stream</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Activity Rings Mini Card */}
              <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-xs font-bold text-rose-400 block mb-2">🔥 Three-Ring Goal Completion</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Move (Calories)</span>
                    <strong className="text-white">2,680 / 2,500 kcal</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[100%]" />
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-400">Exercise (Minutes)</span>
                    <strong className="text-white">62 / 45 min</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[100%]" />
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-400">Steps Cadence</span>
                    <strong className="text-white">11,450 steps</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[100%]" />
                  </div>
                </div>
              </div>

              {/* AI Coach Suggestion Mini Card */}
              <div className="p-5 rounded-2xl bg-zinc-950/70 border border-purple-500/30">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-2">
                  <Bot className="w-4 h-4" />
                  Apex AI Real-Time Guidance
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  "High recovery score (88%) and 7.8 hours deep sleep recorded. Today is calibrated for <strong>progressive overload on Barbell Bench Press</strong>. Target 85kg × 8 reps."
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Sports Science Certified</span>
                  <span className="text-emerald-400 font-bold">180g Protein Target</span>
                </div>
              </div>

              {/* Nutrition & Recovery Mini Card */}
              <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <span className="text-xs font-bold text-cyan-400 block mb-2">⚡ Autonomic Recovery Strain</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white">88%</span>
                  <span className="text-xs text-emerald-400 font-bold">Green Tier</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Resting HR: 51 bpm • HRV: 78ms • 3,250ml hydration reached
                </p>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between text-[11px] text-zinc-400">
                  <span>Device: Apple Watch Ultra</span>
                  <span className="text-zinc-200">14-Day Streak 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">COMPLETE FIT-TECH ECOSYSTEM</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">Built for every phase of your journey</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-3">From garage gym weightlifters to professional coaches managing 50 athletes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all glow-card">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl mb-6">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Workout Management</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log compound sets, reps, and weights in real-time. Automated 60-second rest timers with audio notifications, progressive volume tracking, and personal records archive.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/40 transition-all glow-card">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Apex AI Personal Coach</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generates 8-week customized training protocols tailored to your available equipment, age, and goals. Dynamic form cues, plateau breakers, and sore joint substitutions.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-all glow-card">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl mb-6">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Precision Nutrition & Vision</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                100+ verified foods database, macronutrient ratios (Protein, Carbs, Fats, Fiber), hydration trackers, and optional AI meal scanner estimating calories from meal dishes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">TRANSPARENT VALUE</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">Invest in your health architecture</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">No hidden contracts. Cancel or upgrade whenever you want.</p>

          {/* Monthly / Yearly Switch */}
          <div className="mt-8 inline-flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setBillingPeriod('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === 'MONTHLY' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('YEARLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === 'YEARLY' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-400 text-zinc-950 text-[10px] font-black">
                20% OFF
              </span>
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {/* Free */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Apex Free</h4>
                <p className="text-xs text-zinc-400 mt-1">Core tracking basics</p>
                <div className="my-4">
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
              <Link href="/register" className="mt-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center font-bold text-xs text-white">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-emerald-500 shadow-glow-green relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase">
                RECOMMENDED
              </span>
              <div>
                <h4 className="text-base font-bold text-white">Apex Pro</h4>
                <p className="text-xs text-zinc-400 mt-1">AI coaching & full analytics</p>
                <div className="my-4">
                  <span className="text-3xl font-black text-white">{billingPeriod === 'YEARLY' ? '$89.99' : '$9.99'}</span>
                  <span className="text-xs text-zinc-500"> /{billingPeriod === 'YEARLY' ? 'year' : 'month'}</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Everything in Free</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Apex AI Personal Fitness Coach</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited workout & PR history</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dynamic 8-week plan generator</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Wearable device sync</p>
                </div>
              </div>
              <Link href="/billing" className="mt-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-center font-bold text-xs text-zinc-950 shadow-glow-green">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Elite */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Apex Elite</h4>
                <p className="text-xs text-zinc-400 mt-1">AI vision & autonomic recovery</p>
                <div className="my-4">
                  <span className="text-3xl font-black text-white">{billingPeriod === 'YEARLY' ? '$179.99' : '$19.99'}</span>
                  <span className="text-xs text-zinc-500"> /{billingPeriod === 'YEARLY' ? 'year' : 'month'}</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Everything in Pro</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> AI Meal Photo Scanner</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> WHOOP-style recovery strain scores</p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Bi-weekly PDF reports</p>
                </div>
              </div>
              <Link href="/billing" className="mt-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center font-bold text-xs text-white">
                Choose Elite
              </Link>
            </div>

            {/* Trainer */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Coach & Trainer</h4>
                <p className="text-xs text-zinc-400 mt-1">Multi-client roster suite</p>
                <div className="my-4">
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
              <Link href="/billing" className="mt-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-center font-bold text-xs text-white">
                Get Trainer Suite
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">ATHLETE COMMUNITY</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Trusted by lifters, runners, and certified coaches</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex text-amber-400 mb-3">{'★'.repeat(5)}</div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                "Having the Apple-style activity rings along with real progressive overload set tracking solved my need for three different subscriptions. Apex Coach helped me break my 100kg bench press plateau in 4 weeks."
              </p>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Alex R" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h5 className="text-xs font-bold text-white">Alex Rivera</h5>
                  <span className="text-[10px] text-zinc-400">Competitive Powerlifter</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex text-amber-400 mb-3">{'★'.repeat(5)}</div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                "The Trainer Portal lets me prescribe exact routines to my clients and monitor their daily steps and macro compliance. It cut my coaching admin time in half."
              </p>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100" alt="Marcus V" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h5 className="text-xs font-bold text-white">Marcus Vance, CSCS</h5>
                  <span className="text-[10px] text-zinc-400">Performance Strength Coach</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex text-amber-400 mb-3">{'★'.repeat(5)}</div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                "I lost 4.2kg over 8 weeks using the nutrition macro tracker and AI joint-friendly workout modifications. The Before & After comparison slider kept me inspired every single day."
              </p>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Sarah J" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h5 className="text-xs font-bold text-white">Sarah Jenkins</h5>
                  <span className="text-[10px] text-zinc-400">Triathlete & Marathoner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="text-3xl font-black text-white mt-2">Everything you need to know</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-emerald-400 font-mono text-base">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 border-t border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Ready to experience next-generation fitness tracking?
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Join thousands of dedicated athletes and coaches who trust ApexFit AI to elevate their daily training and nutrition.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green"
            >
              Get Started for Free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-bold text-xs"
            >
              Open Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">APEX<span className="text-emerald-400">FIT</span></span>
            </Link>
            <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
              The premier AI-powered fitness tracker SaaS platform. Biometric monitoring, sports science algorithms, and autonomous personal coaching.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Product</h5>
            <div className="space-y-2 flex flex-col">
              <Link href="/features" className="hover:text-emerald-400">Features</Link>
              <Link href="/ai-coach" className="hover:text-emerald-400">AI Coach</Link>
              <Link href="/pricing" className="hover:text-emerald-400">Pricing Plans</Link>
              <Link href="/dashboard" className="hover:text-emerald-400">Web App</Link>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Resources</h5>
            <div className="space-y-2 flex flex-col">
              <Link href="/blog" className="hover:text-emerald-400">Science Blog</Link>
              <Link href="/about" className="hover:text-emerald-400">Our Mission</Link>
              <Link href="/contact" className="hover:text-emerald-400">Contact Support</Link>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Legal & Safety</h5>
            <div className="space-y-2 flex flex-col">
              <Link href="/privacy" className="hover:text-emerald-400">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-emerald-400">Terms of Service</Link>
              <span className="text-[10px] text-zinc-500 block pt-1">HIPAA & GDPR Ready</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400">
          <p>© 2026 ApexFit AI Technologies Inc. All rights reserved.</p>
          <p>Sports performance recommendations. Not intended as medical diagnosis.</p>
        </div>
      </footer>
    </div>
  );
}
