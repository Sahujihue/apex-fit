'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Watch,
  Shield,
  Trash2,
  CheckCircle2,
  Save
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(180);
  const [weightKg, setWeightKg] = useState(78.5);
  const [targetWeightKg, setTargetWeightKg] = useState(75.0);
  const [fitnessGoal, setFitnessGoal] = useState('muscle_gain');
  const [dietaryPref, setDietaryPref] = useState('omnivore');

  // Notifications toggles
  const [notifWorkouts, setNotifWorkouts] = useState(true);
  const [notifWater, setNotifWater] = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name);
        }
        if (data.profile) {
          setProfile(data.profile);
          setAge(data.profile.age || 28);
          setHeightCm(data.profile.height_cm || 180);
          setWeightKg(data.profile.current_weight_kg || 78.5);
          setTargetWeightKg(data.profile.target_weight_kg || 75.0);
          setFitnessGoal(data.profile.fitness_goal || 'muscle_gain');
          setDietaryPref(data.profile.dietary_preference || 'omnivore');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          heightCm,
          currentWeightKg: weightKg,
          targetWeightKg,
          fitnessGoal,
          dietaryPreference: dietaryPref
        })
      });
      if (res.ok) {
        setSavedMessage('Profile and nutrition targets successfully updated!');
        setTimeout(() => setSavedMessage(''), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            Athlete Profile & Settings
          </h1>
          <p className="text-xs text-zinc-400">Manage anthropometric parameters, notification cadence, and telemetry integrations</p>
        </div>

        {savedMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {savedMessage}
          </div>
        )}

        {/* Section 1: Biometric Profile Form */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Biometric Profile & Targets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-300">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-300">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-300">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-300">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-300">Primary Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
              >
                <option value="weight_loss">Weight Loss & Fat Reduction</option>
                <option value="muscle_gain">Muscle Hypertrophy & Bulk</option>
                <option value="endurance">Cardiovascular Endurance</option>
                <option value="maintenance">Body Recomposition & Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </div>

        {/* Section 2: Notifications Preferences */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Retention & Smart Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Daily Workout Reminder</p>
                <p className="text-[11px] text-zinc-400">Gentle nudge at your preferred training time</p>
              </div>
              <input
                type="checkbox"
                checked={notifWorkouts}
                onChange={(e) => setNotifWorkouts(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Hydration & Water Reminders</p>
                <p className="text-[11px] text-zinc-400">Afternoon reminder if below 50% of your water target</p>
              </div>
              <input
                type="checkbox"
                checked={notifWater}
                onChange={(e) => setNotifWater(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Weekly AI Progress Synthesis Report</p>
                <p className="text-[11px] text-zinc-400">Sunday evening digest of weekly volume, PRS, and calorie balance</p>
              </div>
              <input
                type="checkbox"
                checked={notifWeeklyReport}
                onChange={(e) => setNotifWeeklyReport(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Wearable Device Connections */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Watch className="w-4 h-4 text-purple-400" />
            Wearables & Health Ecosystem Connections
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <strong className="text-white">Apple Health</strong>
                <p className="text-[11px] text-zinc-400">Steps, Active Calories, Sleep</p>
              </div>
              <span className="text-emerald-400 font-bold">CONNECTED ✓</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <strong className="text-white">WHOOP 4.0</strong>
                <p className="text-[11px] text-zinc-400">HRV, Strain & Recovery Telemetry</p>
              </div>
              <span className="text-emerald-400 font-bold">CONNECTED ✓</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between opacity-70">
              <div>
                <strong className="text-white">Google Health Connect</strong>
                <p className="text-[11px] text-zinc-400">Android Wear Sync</p>
              </div>
              <button className="text-cyan-400 font-bold hover:underline">Connect</button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between opacity-70">
              <div>
                <strong className="text-white">Fitbit API</strong>
                <p className="text-[11px] text-zinc-400">Daily Activity & Heart Rate</p>
              </div>
              <button className="text-cyan-400 font-bold hover:underline">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
