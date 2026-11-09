'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Target,
  Dumbbell,
  Scale,
  Calendar,
  Utensils,
  Zap,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: 28,
    gender: 'male',
    heightCm: 178,
    currentWeightKg: 78,
    targetWeightKg: 74,
    targetDate: '2026-12-31',
    fitnessGoal: 'weight_loss',
    experienceLevel: 'intermediate',
    activityLevel: 'moderately_active',
    workoutLocation: 'gym',
    equipment: ['barbell', 'dumbbells', 'cables', 'bench'],
    preferredDaysPerWeek: 4,
    dietaryPreference: 'omnivore'
  });

  const [saving, setSaving] = useState(false);
  const [calculatedTargets, setCalculatedTargets] = useState<any>(null);

  const toggleEquipment = (eq: string) => {
    setFormData(prev => {
      const exists = prev.equipment.includes(eq);
      return {
        ...prev,
        equipment: exists ? prev.equipment.filter(e => e !== eq) : [...prev.equipment, eq]
      };
    });
  };

  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok) {
        setCalculatedTargets(json.targets);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">APEX<span className="text-emerald-400">FIT</span></span>
        </div>

        <div className="text-xs font-mono font-bold text-zinc-400">
          STEP <span className="text-emerald-400">{step}</span> OF {totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full my-4">
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Body */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-6">
        {/* STEP 1: BIOMETRICS */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">BIOMETRIC FOUNDATION</span>
              <h2 className="text-2xl font-black text-white mt-1">Tell us about your body metrics</h2>
              <p className="text-xs text-zinc-400">We calibrate your basal metabolic expenditure and daily energy expenditure from this baseline.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300">Your First Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Biological Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentWeightKg}
                  onChange={(e) => setFormData({ ...formData, currentWeightKg: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Target Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetWeightKg}
                  onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PRIMARY FITNESS GOAL */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">TRAINING FOCUS</span>
              <h2 className="text-2xl font-black text-white mt-1">What is your primary fitness goal?</h2>
              <p className="text-xs text-zinc-400">Apex AI tailors your training stimulus, set-rep progression, and caloric margin.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'weight_loss', title: 'Fat Loss & Shred', desc: 'Caloric deficit, metabolic density, and lean retention', icon: '🔥' },
                { id: 'muscle_gain', title: 'Muscle Hypertrophy', desc: 'Lean surplus, mechanical tension, progressive overload', icon: '💪' },
                { id: 'endurance', title: 'Cardiovascular Stamina', desc: 'Zone 2 aerobic base, VO2 max conditioning, HIIT', icon: '🏃' },
                { id: 'maintenance', title: 'Recomposition & Health', desc: 'Maintain bodyweight while shedding body fat & gaining strength', icon: '⚖️' }
              ].map((g) => (
                <div
                  key={g.id}
                  onClick={() => setFormData({ ...formData, fitnessGoal: g.id })}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    formData.fitnessGoal === g.id
                      ? 'bg-zinc-900 border-emerald-500 shadow-glow-green'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <div className="text-2xl mb-2">{g.icon}</div>
                  <h4 className="text-base font-bold text-white">{g.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: EXPERIENCE LEVEL & ACTIVITY */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">ADAPTATION CAPACITY</span>
              <h2 className="text-2xl font-black text-white mt-1">Your experience and daily activity</h2>
              <p className="text-xs text-zinc-400">Prevents overtraining and calibrates recovery allowances.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Lifting Experience</label>
                <div className="grid grid-cols-3 gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                      className={`p-4 rounded-2xl border text-center capitalize text-xs font-bold transition-all ${
                        formData.experienceLevel === lvl
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-glow-green'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Daily Movement Baseline</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'sedentary', title: 'Sedentary', desc: 'Desk job, &lt; 5,000 steps daily' },
                    { id: 'lightly_active', title: 'Lightly Active', desc: 'Some walking, 5,000-8,000 steps' },
                    { id: 'moderately_active', title: 'Moderately Active', desc: 'On feet often, 8,000-11,000 steps' },
                    { id: 'very_active', title: 'Very Active', desc: 'Physical occupation, 12,000+ steps' }
                  ].map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setFormData({ ...formData, activityLevel: act.id })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.activityLevel === act.id
                          ? 'bg-zinc-900 border-emerald-500 shadow-glow-green'
                          : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-white">{act.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{act.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: WORKOUT LOCATION & EQUIPMENT */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">TRAINING ENVIRONMENT</span>
              <h2 className="text-2xl font-black text-white mt-1">Where will you train?</h2>
              <p className="text-xs text-zinc-400">Select your workout venue and available equipment so AI only selects exercises you can perform.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'gym', label: 'Commercial Gym' },
                { id: 'home', label: 'Home Gym' },
                { id: 'hybrid', label: 'Hybrid' }
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, workoutLocation: loc.id })}
                  className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                    formData.workoutLocation === loc.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-2">Available Equipment (Toggle all that apply)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {['barbell', 'dumbbells', 'cables', 'pullup_bar', 'bench', 'kettlebell', 'resistance_bands', 'squat_rack', 'treadmill'].map((eq) => {
                  const isChecked = formData.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`p-3 rounded-xl border capitalize flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>{eq.replace('_', ' ')}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SCHEDULE FREQUENCY */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">TRAINING FREQUENCY</span>
              <h2 className="text-2xl font-black text-white mt-1">How many days per week can you commit?</h2>
              <p className="text-xs text-zinc-400">Consistency beats perfection. 3-5 days is optimal for most athletes.</p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredDaysPerWeek: days })}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    formData.preferredDaysPerWeek === days
                      ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-glow-green font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-2xl block">{days}</span>
                  <span className="text-[10px] uppercase">Days</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: DIETARY PREFERENCE & CONFIRM */}
        {step === 6 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">NUTRITIONAL PARADIGM</span>
              <h2 className="text-2xl font-black text-white mt-1">What is your dietary preference?</h2>
              <p className="text-xs text-zinc-400">We calibrate your protein sources and carbohydrate distribution.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'pescatarian'].map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietaryPreference: diet })}
                  className={`p-4 rounded-2xl border text-center capitalize text-xs font-bold transition-all ${
                    formData.dietaryPreference === diet
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-glow-green'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>

            {calculatedTargets && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-xs space-y-2 animate-fade-in">
                <span className="font-bold text-emerald-400 block">Personalized Blueprint Calculated!</span>
                <p className="text-zinc-300">
                  Daily Calorie Target: <strong>{calculatedTargets.dailyCalories} kcal</strong> • Protein: <strong>{calculatedTargets.proteinGrams}g</strong>
                </p>
                <p className="text-[11px] text-zinc-400">Redirecting to your custom dashboard...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav Controls */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pt-6 border-t border-zinc-800">
        <button
          onClick={() => setStep(s => Math.max(s - 1, 1))}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-xs font-bold text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={() => setStep(s => Math.min(s + 1, totalSteps))}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinishOnboarding}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-zinc-950 font-black text-xs transition-all shadow-glow-green"
          >
            {saving ? 'Synthesizing Profile...' : 'Complete & Launch Dashboard ✓'}
          </button>
        )}
      </div>
    </div>
  );
}
