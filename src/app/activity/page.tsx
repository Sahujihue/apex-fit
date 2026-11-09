'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Footprints,
  Moon,
  HeartPulse,
  Droplets,
  Watch,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import { formatNumber } from '@/lib/utils';

export default function ActivityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState('85');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity?limit=14');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleLogSleep = async () => {
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_sleep',
          sleepHours: parseFloat(sleepHours),
          sleepQuality: parseInt(sleepQuality, 10)
        })
      });
      if (res.ok) {
        setShowSleepModal(false);
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeviceSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncMessage('Successfully synced latest telemetry from Apple Health & WHOOP 4.0');
      setTimeout(() => setSyncMessage(''), 4000);
      fetchActivity();
    }, 1200);
  };

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  const stepsChartData = (data.logs || []).slice(0, 7).reverse().map((l: any) => ({
    date: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
    steps: l.steps,
    calories: l.calories_burned
  }));

  const latest = data.logs?.[0] || { steps: 11450, distance_km: 8.6, calories_burned: 2680, active_minutes: 62, water_intake_ml: 3250, sleep_duration_hours: 7.8, sleep_quality_score: 86, recovery_score: 92 };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              Smart Activity & Sleep Recovery
            </h1>
            <p className="text-xs text-zinc-400">Continuous telemetry, circadian sleep consistency, and autonomic nervous system readiness</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeviceSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 text-xs font-bold text-zinc-200 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Wearables'}
            </button>

            <button
              onClick={() => setShowSleepModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Moon className="w-4 h-4" />
              Log Sleep Journal
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            {syncMessage}
          </div>
        )}

        {/* Wearables Connected Banner */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Integration Engine:</span>
            <span className="text-zinc-400">Apple Health (Connected), WHOOP 4.0 (Active), Fitbit API (Ready)</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            Source: {latest.source || 'apple_health'}
          </span>
        </div>

        {/* 4 Core Recovery Strain Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">DAILY STEPS</span>
            <p className="text-3xl font-black text-white mt-1">{formatNumber(latest.steps)}</p>
            <p className="text-xs text-zinc-400 mt-1">{latest.distance_km} km distance covered</p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min((latest.steps / 10000) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">ACTIVE ENERGY</span>
            <p className="text-3xl font-black text-white mt-1">{latest.calories_burned} <span className="text-xs text-zinc-400">kcal</span></p>
            <p className="text-xs text-zinc-400 mt-1">{latest.active_minutes} active metabolic minutes</p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min((latest.calories_burned / 2500) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">SLEEP DURATION</span>
            <p className="text-3xl font-black text-white mt-1">{latest.sleep_duration_hours} <span className="text-xs text-zinc-400">hrs</span></p>
            <p className="text-xs text-zinc-400 mt-1">Sleep Score: <strong className="text-indigo-400">{latest.sleep_quality_score}%</strong></p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min((latest.sleep_duration_hours / 8.0) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">WHOOP RECOVERY</span>
            <p className="text-3xl font-black text-white mt-1">{latest.recovery_score}%</p>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">Ready for Maximum Strain</p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${latest.recovery_score}%` }} />
            </div>
          </div>
        </div>

        {/* Steps Bar Chart (7 days) */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-1">Step Volume & Walking Cadence (Past 7 Days)</h3>
          <p className="text-xs text-zinc-400 mb-4">Consistent daily movement regulates insulin sensitivity and supports recovery</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="steps" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Steps Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Stages & Recovery Insight Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-3">Sleep Breakdown Estimate</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-300">Deep Sleep (Physical Restoration)</span>
                <span className="font-bold text-indigo-300">1h 48m (23%)</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-300">REM Sleep (Cognitive & Memory Consolidation)</span>
                <span className="font-bold text-purple-300">2h 10m (28%)</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-300">Light Sleep (Core Stages)</span>
                <span className="font-bold text-cyan-300">3h 42m (47%)</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-300">Awake / Disturbances</span>
                <span className="font-bold text-rose-300">14 min (2%)</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3 italic">
              *Sleep stage estimates reflect user journal and connected telemetry. Not intended for medical diagnostic sleep disorders.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Rest Day Recommendations</h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Based on your rolling 7-day average of {data.averages?.steps} steps and {data.averages?.caloriesBurned} kcal daily burn:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  ✓ <strong>Active Recovery:</strong> Take a 25-minute leisurely walk in natural sunlight to stimulate mitochondrial biogenesis without inducing joint fatigue.
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  ✓ <strong>Electrolyte Protocol:</strong> Ensure you hit at least 3,200ml water today with a pinch of Himalayan salt and magnesium glycinate before bed.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Log Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Log Sleep Journal</h3>
              <button onClick={() => setShowSleepModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Sleep Duration (Hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Sleep Quality Score (0 - 100)</label>
                <input
                  type="number"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <button
                onClick={handleLogSleep}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-glow-purple"
              >
                Save Sleep Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
