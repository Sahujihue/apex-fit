'use client';

import React, { useEffect, useState } from 'react';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Plus,
  Camera,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import AppLayout from '@/components/layout/AppLayout';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Form fields
  const [newWeight, setNewWeight] = useState('78.0');
  const [newBf, setNewBf] = useState('14.8');
  const [newWaist, setNewWaist] = useState('81.5');
  const [newChest, setNewChest] = useState('105.5');
  const [newArms, setNewArms] = useState('38.6');
  const [newNotes, setNewNotes] = useState('');

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleRecordMeasurement = async () => {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: parseFloat(newWeight),
          bodyFatPct: parseFloat(newBf) || null,
          waistCm: parseFloat(newWaist) || null,
          chestCm: parseFloat(newChest) || null,
          armsCm: parseFloat(newArms) || null,
          notes: newNotes
        })
      });
      if (res.ok) {
        setShowLogModal(false);
        fetchProgress();
      }
    } catch (e) {
      console.error(e);
    }
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

  const chartData = data.history.map((m: any) => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weight_kg,
    bf: m.body_fat_pct
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-400" />
              Weight & Body Progress Tracker
            </h1>
            <p className="text-xs text-zinc-400">Anthropometric measurements, body fat analysis, and visual transformations</p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Log New Check-in
          </button>
        </div>

        {/* Top Biometric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">CURRENT WEIGHT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{data.profile.currentWeight}</span>
              <span className="text-xs text-zinc-400">kg</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-2 block">
              {data.profile.totalChangeKg < 0 ? `↓ ${Math.abs(data.profile.totalChangeKg)} kg lost overall` : `↑ +${data.profile.totalChangeKg} kg gained`}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">TARGET WEIGHT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{data.profile.targetWeight}</span>
              <span className="text-xs text-zinc-400">kg</span>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">
              {(data.profile.currentWeight - data.profile.targetWeight).toFixed(1)} kg to goal
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">BMI CLASSIFICATION</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{data.profile.bmi?.bmi}</span>
              <span className={`text-xs font-bold ${data.profile.bmi?.color}`}>{data.profile.bmi?.category}</span>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">Height: {data.profile.heightCm} cm</span>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">BODY FAT ESTIMATE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{data.latest?.body_fat_pct || 15.0}%</span>
              <span className="text-xs text-emerald-400 font-semibold">Athletic Tier</span>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">Down -4.5% from baseline</span>
          </div>
        </div>

        {/* Weight Progression Chart */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                Weight History & Goal Progression
              </h3>
              <p className="text-xs text-zinc-400">Continuous check-in timeline with target threshold line</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <ReferenceLine y={data.profile.targetWeight} stroke="#06b6d4" strokeDasharray="5 5" label={{ value: 'Target 75kg', fill: '#06b6d4', fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#22c55e' }}
                  activeDot={{ r: 7 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section: Circumference Measurements & Before/After Photo Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circumference Table */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-3">Circumference Body Measurements</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-300">Waist Circumference</span>
                <span className="text-sm font-mono font-bold text-white">{data.latest?.waist_cm || 82.0} cm</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-300">Chest Circumference</span>
                <span className="text-sm font-mono font-bold text-white">{data.latest?.chest_cm || 105.0} cm</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-300">Biceps / Arm</span>
                <span className="text-sm font-mono font-bold text-white">{data.latest?.arms_cm || 38.5} cm</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-300">Hips</span>
                <span className="text-sm font-mono font-bold text-white">{data.latest?.hips_cm || 95.0} cm</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-300">Thighs</span>
                <span className="text-sm font-mono font-bold text-white">{data.latest?.thighs_cm || 60.0} cm</span>
              </div>
            </div>
          </div>

          {/* Before & After Interactive Visual Slider */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  Before & After Comparison
                </h3>
                <span className="text-xs text-zinc-400 font-mono">Week 1 vs Week 8</span>
              </div>

              {/* Interactive Comparison Slider */}
              <div className="relative h-64 rounded-2xl overflow-hidden select-none border border-zinc-800">
                {/* After Image (Background) */}
                <img
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600"
                  alt="After progress"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  CURRENT (78.5 kg)
                </span>

                {/* Before Image (Clipped overlay) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
                    alt="Before progress"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', minWidth: '400px' }}
                  />
                  <span className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10">
                    BASELINE (83.2 kg)
                  </span>
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10 cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-zinc-950 font-bold text-[9px] flex items-center justify-center shadow-lg">
                    ⇄
                  </div>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="mt-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>← Baseline</span>
                  <span>Drag slider to compare</span>
                  <span>Present →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Log Body Progress Check-in</h3>
              <button onClick={() => setShowLogModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Weight (kg)*</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBf}
                    onChange={(e) => setNewBf(e.target.value)}
                    className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newArms}
                    onChange={(e) => setNewArms(e.target.value)}
                    className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Notes & Reflections</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="How energy feels, muscle definition, dietary adherence..."
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  rows={2}
                />
              </div>

              <button
                onClick={handleRecordMeasurement}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
              >
                Record Measurement Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
