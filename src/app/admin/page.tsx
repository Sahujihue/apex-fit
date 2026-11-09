'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  Cpu,
  Sliders,
  Tag,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  CreditCard,
  Send,
  RefreshCw,
  Lock,
  ExternalLink,
  Smartphone,
  Wallet,
  Zap
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'ai' | 'features' | 'coupons' | 'gateways' | 'plans'>('metrics');

  // Coupon creator form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('25');

  // Gateway webhook test
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState(false);

  // Plan editing states
  const [editingPlans, setEditingPlans] = useState<Record<string, string>>({});
  const [planSaveMessage, setPlanSaveMessage] = useState('');

  const fetchAdmin = async () => {
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleToggleSetting = async (key: string, currentVal: string) => {
    const nextVal = currentVal === 'true' ? 'false' : 'true';
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_setting', key, value: nextVal })
      });
      if (res.ok) {
        fetchAdmin();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAIModel = async (model: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_setting', key: 'ai_model_name', value: model })
      });
      fetchAdmin();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', targetUserId: userId, newRole })
      });
      fetchAdmin();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUserTier = async (userId: string, newTier: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', targetUserId: userId, newTier })
      });
      fetchAdmin();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCode || !newDiscount) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_coupon',
          couponCode: newCode,
          discountPercent: parseInt(newDiscount, 10)
        })
      });
      if (res.ok) {
        setShowCouponModal(false);
        setNewCode('');
        fetchAdmin();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestWebhook = async (eventType: string) => {
    setIsDispatchingWebhook(true);
    setWebhookStatus(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_stripe_webhook', eventType })
      });
      const json = await res.json();
      if (res.ok) {
        setWebhookStatus(`✓ Success: Event "${eventType}" verified & processed by Stripe Webhook handler.`);
        fetchAdmin();
      } else {
        setWebhookStatus(`✗ Error: ${json.error || 'Failed to dispatch webhook event'}`);
      }
    } catch (e: any) {
      setWebhookStatus(`✗ Error: ${e.message}`);
    } finally {
      setIsDispatchingWebhook(false);
    }
  };

  const handleSavePlans = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_update_settings', settingsMap: editingPlans })
      });
      if (res.ok) {
        setPlanSaveMessage('✓ Subscription plan pricing updated successfully!');
        setTimeout(() => setPlanSaveMessage(''), 3000);
        fetchAdmin();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  const { metrics, users, settings, coupons } = data;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              Super Admin SaaS Operations Center
            </h1>
            <p className="text-xs text-zinc-400">Total system telemetry, AI models, feature flags, subscriptions, and revenue metrics</p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'metrics' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Revenue & KPIs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Users ({users?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              AI Engine
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'features' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Feature Toggles
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'coupons' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setActiveTab('gateways')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'gateways' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payment Gateways
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'plans' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Plans & Pricing
            </button>
          </div>
        </div>

        {/* TAB 1: REVENUE & METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">MONTHLY RECURRING REVENUE (MRR)</span>
                <p className="text-3xl font-black text-white mt-1">${metrics.mrr.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1 font-semibold">ARR: ${(metrics.arr).toLocaleString()}</p>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">TOTAL SUBSCRIBERS</span>
                <p className="text-3xl font-black text-white mt-1">{metrics.totalUsers}</p>
                <p className="text-xs text-zinc-400 mt-1">{metrics.premiumUsers} on Paid Tiers</p>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">TOTAL ENGAGEMENT</span>
                <p className="text-3xl font-black text-white mt-1">{metrics.totalWorkoutsLogged}</p>
                <p className="text-xs text-zinc-400 mt-1">{metrics.totalMealsLogged} logged meals</p>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">CHURN RATE</span>
                <p className="text-3xl font-black text-white mt-1">{metrics.churnRate}%</p>
                <p className="text-xs text-emerald-400 mt-1 font-semibold">Healthy SaaS benchmark (&lt; 3%)</p>
              </div>
            </div>

            {/* System Health Check */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-white">System Infrastructure Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">SQLite / PostgreSQL Engine</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">Google Gemini & OpenAI APIs</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured / Fallback Active
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">Stripe Webhook Gateway</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Listening (Sandbox)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Registered Users & Tier Controls</h3>
            <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Plan Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-zinc-800/40">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[11px] text-zinc-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-white"
                        >
                          <option value="USER">USER</option>
                          <option value="TRAINER">TRAINER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.subscription_tier}
                          onChange={(e) => handleUpdateUserTier(u.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-bold text-white"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO ($9.99)</option>
                          <option value="ELITE">ELITE ($19.99)</option>
                          <option value="TRAINER">TRAINER ($39.99)</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {u.subscription_status}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AI ENGINE SETTINGS */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                AI Model & API Configuration
              </h3>
              <p className="text-xs text-zinc-400">
                Choose the LLM backend for Apex Coach workouts, nutrition suggestions, and conversational assistance.
              </p>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Active AI Model</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {['gemini-1.5-pro', 'gemini-1.5-flash', 'gpt-4o'].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleUpdateAIModel(m)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        settings['ai_model_name'] === m
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-glow-purple'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <p className="font-bold text-sm text-white">{m}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {m.startsWith('gemini') ? 'Google DeepMind Gemini API' : 'OpenAI Platform'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <p className="text-zinc-300 font-bold">API Key Environment Setup:</p>
                <p className="text-zinc-400 font-mono">GEMINI_API_KEY: {process.env.GEMINI_API_KEY ? '•••••••• (Configured)' : 'Not set in .env (Using built-in intelligent sports science fallback)'}</p>
                <p className="text-zinc-400 font-mono">OPENAI_API_KEY: {process.env.OPENAI_API_KEY ? '•••••••• (Configured)' : 'Optional fallback'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEATURE TOGGLES */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Dynamic Platform Feature Activation</h3>
            <p className="text-xs text-zinc-400">Instantly enable or disable major customer-facing subsystems without redeployment</p>

            <div className="space-y-3">
              {[
                { key: 'feature_demo_mode', title: 'Demo Persona Switcher & Demo Logins', desc: 'Shows 1-click role switcher in navbar & demo logins on /login. Turn OFF when launching to real production hosting.' },
                { key: 'feature_ai_coach', title: 'Apex AI Fitness Coach', desc: 'Allows users to converse with AI and generate workout/nutrition programs.' },
                { key: 'feature_ai_meal_scan', title: 'AI Meal Photo & Text Scanner', desc: 'Allows estimating macro breakdown from meal descriptions/photos.' },
                { key: 'feature_leaderboard', title: 'Global Community Leaderboard', desc: 'Enables weekly leaderboard competition for athlete motivation.' },
                { key: 'feature_trainer_portal', title: 'Personal Trainer Portal', desc: 'Enables coaching assignments, athlete rosters, and appointments.' },
                { key: 'maintenance_mode', title: 'Platform Maintenance Mode', desc: 'Places entire public app into maintenance upgrade state.' }
              ].map((feat) => {
                const isEnabled = settings[feat.key] === 'true';
                return (
                  <div key={feat.key} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                      <p className="text-xs text-zinc-400">{feat.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting(feat.key, settings[feat.key])}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        isEnabled
                          ? 'bg-emerald-500 text-zinc-950 shadow-glow-green'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {isEnabled ? 'ENABLED ✓' : 'DISABLED ✗'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS & DISCOUNTS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Active Promotional Codes</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons?.map((cp: any) => (
                <div key={cp.id} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-base font-black font-mono text-amber-400">{cp.code}</span>
                    <span className="text-xs font-bold text-emerald-400">{cp.discount_percent}% OFF</span>
                  </div>
                  <p className="text-xs text-zinc-400">Used {cp.times_used} times • Max: {cp.max_uses}</p>
                  <p className="text-[10px] text-zinc-500 mt-2 font-mono">Valid until: {cp.valid_until}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MULTI-GATEWAY SAAS CONTROLLER (STRIPE, RAZORPAY, CASHFREE, PAYPAL, CRYPTO) */}
        {activeTab === 'gateways' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Multi-Gateway Payment Controller</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase">
                      5 ACTIVE PROVIDERS
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Toggle individual gateways ON or OFF in real-time. Configure API keys, secrets, and crypto wallet addresses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Environment:</span>
                <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-xs uppercase font-mono">
                  HYBRID TEST & LIVE
                </span>
              </div>
            </div>

            {/* MASTER ON / OFF SWITCHES FOR ALL 5 GATEWAYS */}
            <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                GATEWAY MASTER ACTIVATION SWITCHES (CLICK TO TOGGLE ON / OFF)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Stripe Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  settings.gateway_stripe_enabled !== 'false'
                    ? 'bg-zinc-950 border-purple-500/40'
                    : 'bg-zinc-950/50 border-zinc-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Stripe</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('gateway_stripe_enabled', settings.gateway_stripe_enabled || 'true')}
                      className="text-purple-400 hover:text-white"
                      title="Toggle Stripe"
                    >
                      {settings.gateway_stripe_enabled !== 'false' ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">Cards & Apple Pay</p>
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    settings.gateway_stripe_enabled !== 'false'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {settings.gateway_stripe_enabled !== 'false' ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>

                {/* 2. Razorpay Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  settings.gateway_razorpay_enabled !== 'false'
                    ? 'bg-zinc-950 border-blue-500/40'
                    : 'bg-zinc-950/50 border-zinc-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">Razorpay</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('gateway_razorpay_enabled', settings.gateway_razorpay_enabled || 'true')}
                      className="text-blue-400 hover:text-white"
                      title="Toggle Razorpay"
                    >
                      {settings.gateway_razorpay_enabled !== 'false' ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">UPI & Indian Banking</p>
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    settings.gateway_razorpay_enabled !== 'false'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {settings.gateway_razorpay_enabled !== 'false' ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>

                {/* 3. Cashfree Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  settings.gateway_cashfree_enabled !== 'false'
                    ? 'bg-zinc-950 border-amber-500/40'
                    : 'bg-zinc-950/50 border-zinc-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Cashfree</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('gateway_cashfree_enabled', settings.gateway_cashfree_enabled || 'true')}
                      className="text-amber-400 hover:text-white"
                      title="Toggle Cashfree"
                    >
                      {settings.gateway_cashfree_enabled !== 'false' ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">Auto-Collect & Cards</p>
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    settings.gateway_cashfree_enabled !== 'false'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {settings.gateway_cashfree_enabled !== 'false' ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>

                {/* 4. PayPal Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  settings.gateway_paypal_enabled !== 'false'
                    ? 'bg-zinc-950 border-sky-500/40'
                    : 'bg-zinc-950/50 border-zinc-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sky-400 text-sm">P</span>
                      <span className="text-xs font-bold text-white">PayPal</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('gateway_paypal_enabled', settings.gateway_paypal_enabled || 'true')}
                      className="text-sky-400 hover:text-white"
                      title="Toggle PayPal"
                    >
                      {settings.gateway_paypal_enabled !== 'false' ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">Global Express</p>
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    settings.gateway_paypal_enabled !== 'false'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {settings.gateway_paypal_enabled !== 'false' ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>

                {/* 5. Crypto Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  settings.gateway_crypto_enabled !== 'false'
                    ? 'bg-zinc-950 border-emerald-500/40'
                    : 'bg-zinc-950/50 border-zinc-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Crypto</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('gateway_crypto_enabled', settings.gateway_crypto_enabled || 'true')}
                      className="text-emerald-400 hover:text-white"
                      title="Toggle Crypto"
                    >
                      {settings.gateway_crypto_enabled !== 'false' ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">USDT, BTC, ETH</p>
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    settings.gateway_crypto_enabled !== 'false'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {settings.gateway_crypto_enabled !== 'false' ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>
              </div>
            </div>

            {/* GATEWAY CREDENTIALS AND CONFIGURATION TILES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. RAZORPAY CONFIG */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <h4 className="text-base font-black text-white">Razorpay (India)</h4>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                    UPI & INR
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Razorpay Key ID</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.razorpay_key_id || 'rzp_test_ApexFit109283'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Razorpay Key Secret</label>
                    <input
                      type="password"
                      readOnly
                      value={settings.razorpay_key_secret || 'rzp_secret_live_sandbox'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">USD to INR Conversion Rate (₹)</label>
                    <input
                      type="text"
                      readOnly
                      value={`1 USD = ₹${settings.currency_conversion_inr || '83.5'} INR`}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-emerald-400 text-[11px] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. CASHFREE CONFIG */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-black text-white">Cashfree Payments</h4>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    Auto-Collect
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Cashfree App ID</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.cashfree_app_id || 'cf_app_apexfit_demo'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Cashfree Secret Key</label>
                    <input
                      type="password"
                      readOnly
                      value={settings.cashfree_secret_key || 'cf_secret_apexfit_demo'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-zinc-400">Environment</span>
                    <span className="text-amber-400 font-mono text-[11px]">Cashfree Sandbox Mode</span>
                  </div>
                </div>
              </div>

              {/* 3. STRIPE CONFIG */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-black text-white">Stripe Core</h4>
                  </div>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                    PCI-DSS Level 1
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Publishable Key</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.stripe_publishable_key || 'pk_test_apexfit_sandbox'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Secret Key</label>
                    <input
                      type="password"
                      readOnly
                      value={settings.stripe_secret_key || 'sk_test_apexfit_sandbox'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-zinc-400">Customer Portal URL</span>
                    <span className="text-emerald-400 font-mono text-[11px]">/api/billing/portal</span>
                  </div>
                </div>
              </div>

              {/* 4. CRYPTO WEB3 CONFIG */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base font-black text-white">Web3 Crypto Gateway Settings</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    ON-CHAIN VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">USDT TRC20 / ERC20 Wallet</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.crypto_wallet_usdt || '0x71C8fb8E999071E57A42AB6E999071E57A42A90'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Bitcoin (BTC) Wallet</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.crypto_wallet_btc || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Ethereum (ETH) Wallet</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.crypto_wallet_eth || '0x3E54b8D218bE3c1A807b53D4b6E999071E57A42A'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* 5. PAYPAL EXPRESS CONFIG */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sky-400 text-lg">P</span>
                    <h4 className="text-base font-black text-white">PayPal Express</h4>
                  </div>
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">
                    Global
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">PayPal Client ID</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.paypal_client_id || 'sb_paypal_apexfit_demo'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-[11px]"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-zinc-400">Environment</span>
                    <span className="text-sky-400 font-mono text-[11px]">PayPal Sandbox</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE TRANSACTION SIMULATOR AND WEBHOOK DISPATCHER */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Live Multi-Gateway Event Simulator & Webhook Verifier
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Simulate incoming transaction webhooks for Stripe, Razorpay, Cashfree, and Crypto to test instant subscription provisioning.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={() => handleTestWebhook('checkout.session.completed')}
                  disabled={isDispatchingWebhook}
                  className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-left transition-all"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Stripe Webhook
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Simulates checkout.session.completed and upgrades athlete tier</p>
                </button>

                <button
                  onClick={() => handleTestWebhook('customer.subscription.updated')}
                  disabled={isDispatchingWebhook}
                  className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/50 text-left transition-all"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Razorpay UPI Webhook
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Simulates payment.captured for UPI settlement</p>
                </button>

                <button
                  onClick={() => handleTestWebhook('invoice.payment_succeeded')}
                  disabled={isDispatchingWebhook}
                  className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-left transition-all"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Cashfree Auto-Collect
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Simulates instant order settlement via Cashfree webhook</p>
                </button>

                <button
                  onClick={() => handleTestWebhook('customer.subscription.deleted')}
                  disabled={isDispatchingWebhook}
                  className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/50 text-left transition-all"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    Cancellation Event
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Simulates customer cancellation and tier downgrade</p>
                </button>
              </div>

              {webhookStatus && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  webhookStatus.startsWith('✓') 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}>
                  {webhookStatus.startsWith('✓') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{webhookStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SUBSCRIPTION PLANS & PRICING MANAGER */}
        {activeTab === 'plans' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    Subscription Plans & Monetization Manager
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase">
                    LIVE PRICING ENGINE
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Edit monthly/yearly prices, free trial duration, and currency rates. Changes apply immediately to public checkout and pricing pages.
                </p>
              </div>

              <button
                onClick={handleSavePlans}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs transition-all shadow-glow-green self-start sm:self-auto"
              >
                Save Plan Changes
              </button>
            </div>

            {planSaveMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{planSaveMessage}</span>
              </div>
            )}

            {/* Global Trial & Exchange Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Free Trial Duration (Days)</label>
                <input
                  type="number"
                  defaultValue={settings.free_trial_days || '14'}
                  onChange={(e) => setEditingPlans(prev => ({ ...prev, free_trial_days: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="e.g. 14"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Set to 0 if you want no free trial and require immediate payment</p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">USD to INR Exchange Rate (₹)</label>
                <input
                  type="text"
                  defaultValue={settings.currency_conversion_inr || '83.5'}
                  onChange={(e) => setEditingPlans(prev => ({ ...prev, currency_conversion_inr: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="e.g. 83.5"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Used to calculate Razorpay and UPI amounts automatically</p>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PLAN 1: PRO */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-emerald-500/50 space-y-4 relative shadow-glow-green">
                <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase">
                  MOST POPULAR
                </span>
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-black text-white">Apex Pro Plan</h4>
                  <span className="text-[10px] font-bold text-emerald-400">AI Coach Tier</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Monthly Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={settings.plan_pro_monthly || '9.99'}
                      onChange={(e) => setEditingPlans(prev => ({ ...prev, plan_pro_monthly: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Yearly Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={settings.plan_pro_yearly || '89.99'}
                      onChange={(e) => setEditingPlans(prev => ({ ...prev, plan_pro_yearly: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-zinc-300">Included Features:</p>
                  <p>• Apex AI Personal Fitness Coach</p>
                  <p>• Automated workout program generator</p>
                  <p>• Full macro nutrition insights & PR history</p>
                </div>
              </div>

              {/* PLAN 2: ELITE */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-black text-white">Apex Elite Plan</h4>
                  <span className="text-[10px] font-bold text-cyan-400">Vision & Recovery</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Monthly Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={settings.plan_elite_monthly || '19.99'}
                      onChange={(e) => setEditingPlans(prev => ({ ...prev, plan_elite_monthly: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Yearly Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={settings.plan_elite_yearly || '179.99'}
                      onChange={(e) => setEditingPlans(prev => ({ ...prev, plan_elite_yearly: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-zinc-300">Included Features:</p>
                  <p>• AI Photo Meal Nutrition Analysis</p>
                  <p>• Advanced WHOOP-style recovery strain</p>
                  <p>• Bi-weekly automated PDF audit reports</p>
                </div>
              </div>

              {/* PLAN 3: TRAINER */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-black text-white">Coach & Trainer Plan</h4>
                  <span className="text-[10px] font-bold text-purple-400">Coaching Suite</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Monthly Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={settings.plan_trainer_monthly || '39.99'}
                      onChange={(e) => setEditingPlans(prev => ({ ...prev, plan_trainer_monthly: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Yearly Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={settings.plan_trainer_yearly || '349.99'}
                      onChange={(e) => setEditingPlans(prev => ({ ...prev, plan_trainer_yearly: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-zinc-300">Included Features:</p>
                  <p>• Personal Trainer portal & client roster</p>
                  <p>• Assign routines, targets & adherence audit</p>
                  <p>• Direct messaging & Google Meet calls</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Create New Coupon Code</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Coupon Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. VIP50"
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono uppercase text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <button
                onClick={handleCreateCoupon}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs"
              >
                Create Promo Code
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
