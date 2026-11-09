'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (!data.user.onboardingCompleted && data.user.role === 'USER') {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (role: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Demo switch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black shadow-glow-green">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">APEX<span className="text-emerald-400">FIT</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
          <p className="text-xs text-zinc-400">Enter your credentials or choose a pre-configured demo account</p>
        </div>

        {/* 1-Click Demo Persona Shortcuts (Hidden if NEXT_PUBLIC_DEMO_MODE="false") */}
        {process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' && (
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Instant Live Demo Sign-in:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => loginAsDemo('USER')}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-emerald-500/50 text-left transition-colors"
              >
                <strong className="text-white block">🏋️ Athlete Demo</strong>
                <span className="text-[10px] text-zinc-400">Alex Rivera (PRO)</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('TRAINER')}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-emerald-500/50 text-left transition-colors"
              >
                <strong className="text-white block">📋 Coach Demo</strong>
                <span className="text-[10px] text-zinc-400">Marcus Vance</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('ADMIN')}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-emerald-500/50 text-left transition-colors"
              >
                <strong className="text-white block">🛡️ Admin Demo</strong>
                <span className="text-[10px] text-zinc-400">Super SaaS Admin</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('CLIENT')}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-emerald-500/50 text-left transition-colors"
              >
                <strong className="text-white block">🏃 Sarah (Client)</strong>
                <span className="text-[10px] text-zinc-400">Assigned Client</span>
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@apexfit.com"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-emerald-400 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all shadow-glow-green flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-zinc-400 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-400 font-bold hover:underline">
              Sign up for free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
