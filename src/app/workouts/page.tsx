'use client';

import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Volume2,
  VolumeX,
  Printer,
  FileText
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { formatDuration } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'routines' | 'active' | 'library' | 'history'>('routines');
  const [data, setData] = useState<any>({ exercises: [], routines: [], history: [], personalRecords: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Voice Coach state
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(true);

  const speakCoach = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && voiceCoachEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Active Workout Session State
  const [activeSession, setActiveSession] = useState<{
    title: string;
    routineId?: string;
    startedAt: Date;
    secondsElapsed: number;
    exercises: {
      name: string;
      sets: { setNumber: number; reps: number; weightKg: number; completed: boolean }[];
    }[];
  } | null>(null);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // New Routine Builder Modal
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [newRoutineCategory, setNewRoutineCategory] = useState('Chest & Push');
  const [newRoutineExercises, setNewRoutineExercises] = useState<any[]>([]);

  // Selected exercise detail modal
  const [viewingExercise, setViewingExercise] = useState<any>(null);

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Timer interval for active session and rest timer
  useEffect(() => {
    let interval: any = null;
    if (activeSession) {
      interval = setInterval(() => {
        setActiveSession(prev => prev ? { ...prev, secondsElapsed: prev.secondsElapsed + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    let restInterval: any = null;
    if (isResting && restTimerSeconds > 0) {
      restInterval = setInterval(() => {
        setRestTimerSeconds(s => {
          if (s === 11 && voiceCoachEnabled) {
            speakCoach('Ten seconds remaining! Get into position for your next set.');
          }
          if (s === 1 && voiceCoachEnabled) {
            speakCoach('Rest is over! Crush your next set!');
          }
          return s - 1;
        });
      }, 1000);
    } else if (restTimerSeconds === 0 && isResting) {
      setIsResting(false);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restTimerSeconds, voiceCoachEnabled]);

  const startRoutineSession = (routine: any) => {
    const sessionExercises = routine.exercises.map((ex: any) => {
      const setsArr = [];
      const numSets = ex.sets || 3;
      for (let i = 1; i <= numSets; i++) {
        setsArr.push({
          setNumber: i,
          reps: ex.reps || 10,
          weightKg: ex.target_weight_kg || 50,
          completed: false
        });
      }
      return {
        name: ex.name,
        sets: setsArr
      };
    });

    setActiveSession({
      title: routine.title,
      routineId: routine.id,
      startedAt: new Date(),
      secondsElapsed: 0,
      exercises: sessionExercises
    });
    setActiveTab('active');
    speakCoach(`Session started for ${routine.title}. Let us crush this workout!`);
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    if (!activeSession) return;
    const updated = { ...activeSession };
    const currentStatus = updated.exercises[exIdx].sets[setIdx].completed;
    updated.exercises[exIdx].sets[setIdx].completed = !currentStatus;
    setActiveSession(updated);

    if (!currentStatus) {
      // Start 60 second rest countdown!
      setRestTimerSeconds(60);
      setIsResting(true);
      speakCoach('Set completed! Starting sixty-second recovery countdown. Take deep breaths.');
    }
  };

  const updateSetValues = (exIdx: number, setIdx: number, field: 'reps' | 'weightKg', val: number) => {
    if (!activeSession) return;
    const updated = { ...activeSession };
    updated.exercises[exIdx].sets[setIdx][field] = val;
    setActiveSession(updated);
  };

  const handleExportPDF = (routine: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${routine.title} - ApexFit Official Workout Program</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 26px; font-weight: 900; margin: 0; color: #09090b; }
            .badge { background: #10b981; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; }
            .meta { font-size: 13px; color: #666; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f4f5; text-align: left; padding: 10px 12px; font-size: 12px; border-bottom: 2px solid #e4e4e7; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e4e4e7; font-size: 13px; }
            .footer { margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px; font-size: 12px; color: #71717a; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span class="badge">APEXFIT AI • OFFICIAL TRAINING PROTOCOL</span>
              <h1 class="title" style="margin-top: 8px;">${routine.title}</h1>
              <p class="meta">Category: ${routine.category || 'Strength'} • Estimated Time: ${routine.duration_minutes || 45} mins</p>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 13px;">Protocol ID</strong><br/>
              <span style="font-family: monospace; color: #666;">APX-${Date.now().toString().slice(-6)}</span>
            </div>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: #444;">
            <strong>Target Objective:</strong> ${routine.description || 'Targeted strength training routine optimized for hypertrophy, motor recruitment, and functional power.'}
          </p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Exercise Movement</th>
                <th>Prescribed Sets</th>
                <th>Target Reps</th>
                <th>Rest Period</th>
              </tr>
            </thead>
            <tbody>
              ${routine.exercises.map((ex: any, i: number) => `
                <tr>
                  <td><strong>${i + 1}</strong></td>
                  <td><strong>${ex.name}</strong></td>
                  <td>${ex.sets || 3} Sets</td>
                  <td>${ex.reps || 10} Reps</td>
                  <td>60 - 90 Seconds</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated by ApexFit AI Sports Science Engine • Consistent Progressive Overload is key to muscle growth.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const finishWorkout = async () => {
    if (!activeSession) return;

    let totalVolume = 0;
    activeSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          totalVolume += s.reps * s.weightKg;
        }
      });
    });

    speakCoach(`Outstanding session! Workout logged with ${Math.round(totalVolume)} kilograms of volume. Great discipline today!`);

    // Approximate calories burned (approx 7.5 kcal per active minute)
    const activeMinutes = Math.max(Math.round(activeSession.secondsElapsed / 60), 15);
    const caloriesBurned = Math.round(activeMinutes * 8.5);

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_workout',
          title: activeSession.title,
          routineId: activeSession.routineId,
          durationSeconds: activeSession.secondsElapsed,
          caloriesBurned,
          totalVolumeKg: totalVolume,
          notes: 'Completed with high intensity and form focus.',
          rating: 5,
          exercisesLog: activeSession.exercises
        })
      });

      if (res.ok) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });

        setActiveSession(null);
        setActiveTab('history');
        fetchWorkouts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCustomRoutine = async () => {
    if (!newRoutineTitle || newRoutineExercises.length === 0) return;

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_routine',
          title: newRoutineTitle,
          description: newRoutineDesc,
          category: newRoutineCategory,
          durationMin: 45,
          exercises: newRoutineExercises
        })
      });

      if (res.ok) {
        setShowBuilder(false);
        setNewRoutineTitle('');
        setNewRoutineDesc('');
        setNewRoutineExercises([]);
        fetchWorkouts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredExercises = data.exercises.filter((ex: any) => {
    const matchesCat = selectedCategory === 'all' || ex.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.target_muscles.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-emerald-400" />
              Workout Management & Tracker
            </h1>
            <p className="text-xs text-zinc-400">Track sets, progressive overload, rest timers, and exercise mechanics</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('routines')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'routines' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Routines
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'active' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active Session
              {activeSession && <span className="w-2 h-2 rounded-full bg-rose-500 inline-block ml-1 animate-ping"></span>}
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'library' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Exercise Library
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              History
            </button>
            <button
              onClick={() => {
                setVoiceCoachEnabled(!voiceCoachEnabled);
                if (!voiceCoachEnabled) speakCoach('AI Voice Workout Coach activated!');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                voiceCoachEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
              title="Toggle Real-Time AI Audio Coaching"
            >
              {voiceCoachEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{voiceCoachEnabled ? 'Voice: ON' : 'Voice: OFF'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ROUTINES & TEMPLATES */}
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-300">Preset & Custom Workout Routines</p>
              <button
                onClick={() => setShowBuilder(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Build Custom Routine
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.routines.map((routine: any) => (
                <div key={routine.id} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-emerald-400 border border-zinc-700 uppercase tracking-wider">
                        {routine.category}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {routine.estimated_duration_min} min
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {routine.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {routine.description}
                    </p>

                    {/* Exercises Preview */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Included Exercises ({routine.exercises?.length || 0}):</span>
                      {routine.exercises?.slice(0, 4).map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs text-zinc-300">
                          <span className="truncate max-w-[180px]">• {ex.name}</span>
                          <span className="font-mono text-zinc-400">{ex.sets} sets × {ex.reps}</span>
                        </div>
                      ))}
                      {routine.exercises?.length > 4 && (
                        <span className="text-[11px] text-zinc-400 italic">+ {routine.exercises.length - 4} more exercises</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => startRoutineSession(routine)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Workout
                    </button>
                    <button
                      onClick={() => handleExportPDF(routine)}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
                      title="Export Branded Printable PDF Program"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE WORKOUT LOGGER & REST TIMER */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {!activeSession ? (
              <div className="p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center max-w-lg mx-auto">
                <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-white">No Workout in Progress</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Pick a routine or initiate a blank workout to log sets, track reps and weights, and time your rests.
                </p>
                <button
                  onClick={() => setActiveTab('routines')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-glow-green"
                >
                  Choose a Routine to Start
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Session Sticky Header Bar */}
                <div className="p-5 rounded-3xl bg-zinc-900/90 border border-emerald-500/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-20 shadow-2xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">LIVE WORKOUT RECORDING</span>
                    <h2 className="text-xl font-black text-white">{activeSession.title}</h2>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stopwatch Duration */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                      <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-base font-mono font-bold text-white">
                        {formatDuration(activeSession.secondsElapsed)}
                      </span>
                    </div>

                    {/* Rest Countdown Timer */}
                    {isResting && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40">
                        <span className="text-xs text-cyan-300 font-bold">Rest:</span>
                        <span className="text-base font-mono font-black text-cyan-400 animate-pulse">
                          {restTimerSeconds}s
                        </span>
                      </div>
                    )}

                    <button
                      onClick={finishWorkout}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Workout
                    </button>
                  </div>
                </div>

                {/* Exercises & Set Rows */}
                <div className="space-y-4">
                  {activeSession.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800">
                      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-xs flex items-center justify-center font-mono">
                          {exIdx + 1}
                        </span>
                        {ex.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                          <span className="col-span-2">SET</span>
                          <span className="col-span-4">WEIGHT (KG)</span>
                          <span className="col-span-3">REPS</span>
                          <span className="col-span-3 text-right">STATUS</span>
                        </div>

                        {ex.sets.map((set, setIdx) => (
                          <div
                            key={setIdx}
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                              set.completed
                                ? 'bg-emerald-950/20 border-emerald-500/40'
                                : 'bg-zinc-950/60 border-zinc-800'
                            }`}
                          >
                            <span className="col-span-2 font-mono font-bold text-xs text-zinc-300 pl-2">
                              #{set.setNumber}
                            </span>
                            <div className="col-span-4">
                              <input
                                type="number"
                                value={set.weightKg}
                                onChange={(e) => updateSetValues(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => updateSetValues(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div className="col-span-3 text-right pr-2">
                              <button
                                onClick={() => toggleSetComplete(exIdx, setIdx)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                  set.completed
                                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                }`}
                              >
                                {set.completed ? 'Done ✓' : 'Log Set'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MASTER EXERCISE LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises by name, muscles (e.g. Bench, Hamstrings, Shoulders)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0">
                {['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'hiit', 'yoga'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((ex: any) => (
                <div
                  key={ex.id}
                  onClick={() => setViewingExercise(ex)}
                  className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all glow-card"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-zinc-950">
                    <img
                      src={ex.image_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'}
                      alt={ex.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 border border-white/10 uppercase">
                        {ex.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="text-base font-bold text-white mb-1">{ex.name}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{ex.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {ex.target_muscles?.map((m: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORKOUT HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Logged Workout History</h3>
            <div className="space-y-3">
              {data.history.map((log: any) => (
                <div key={log.id} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{log.title}</h4>
                      <p className="text-xs text-zinc-400">
                        {new Date(log.started_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {formatDuration(log.duration_seconds)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                        {log.calories_burned} kcal
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                        {log.total_volume_kg?.toLocaleString()} kg volume
                      </span>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-zinc-300 italic mb-3">"{log.notes}"</p>
                  )}

                  {/* Exercises detail breakdown */}
                  <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap gap-2">
                    {log.exercises?.map((item: any, i: number) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono">
                        {item.name} ({item.sets?.length || 0} sets)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Detailed View Modal */}
      {viewingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{viewingExercise.category}</span>
                <h3 className="text-xl font-black text-white">{viewingExercise.name}</h3>
              </div>
              <button onClick={() => setViewingExercise(null)} className="text-zinc-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-4">
              <img
                src={viewingExercise.image_url}
                alt={viewingExercise.name}
                className="w-full h-52 object-cover rounded-2xl border border-zinc-800"
              />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Equipment</h4>
                <p className="text-sm text-zinc-200">{viewingExercise.equipment_required}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Target Muscles</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingExercise.target_muscles?.map((m: string, i: number) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Execution Steps</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300">
                  {viewingExercise.instructions?.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {viewingExercise.tips && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong>Pro Coaching Cue:</strong> {viewingExercise.tips}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Routine Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Create Custom Routine</h3>
              <button onClick={() => setShowBuilder(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Routine Title</label>
                <input
                  type="text"
                  value={newRoutineTitle}
                  onChange={(e) => setNewRoutineTitle(e.target.value)}
                  placeholder="e.g. Arm Hypertrophy Blast"
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Category</label>
                <input
                  type="text"
                  value={newRoutineCategory}
                  onChange={(e) => setNewRoutineCategory(e.target.value)}
                  placeholder="e.g. Arms & Core"
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Description</label>
                <textarea
                  value={newRoutineDesc}
                  onChange={(e) => setNewRoutineDesc(e.target.value)}
                  placeholder="Target goal or progression notes..."
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Quick Add Exercises</label>
                <div className="flex flex-wrap gap-1.5 mt-2 max-h-36 overflow-y-auto">
                  {data.exercises.slice(0, 8).map((ex: any) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setNewRoutineExercises(prev => [...prev, { name: ex.name, sets: 3, reps: 10, target_weight_kg: 40 }]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-xs text-zinc-300 hover:text-emerald-300 border border-zinc-700"
                    >
                      + {ex.name}
                    </button>
                  ))}
                </div>
              </div>

              {newRoutineExercises.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                  <span className="font-bold text-zinc-400">Added ({newRoutineExercises.length}):</span>
                  {newRoutineExercises.map((e, idx) => (
                    <p key={idx} className="text-zinc-200">• {e.name} (3 × 10)</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleSaveCustomRoutine}
                disabled={!newRoutineTitle || newRoutineExercises.length === 0}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
              >
                Save Workout Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
