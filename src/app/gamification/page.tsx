'use client';

import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Target,
  CheckCircle2,
  Users,
  Footprints,
  Droplets,
  Sunrise,
  Shield,
  Sparkles
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import confetti from 'canvas-confetti';

export default function GamificationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges' | 'leaderboard'>('challenges');

  const fetchGamification = async () => {
    try {
      const res = await fetch('/api/gamification');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamification();
  }, []);

  const handleJoinChallenge = async (chId: string) => {
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: chId })
      });
      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 }
        });
        fetchGamification();
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Gamification & Community Challenges
            </h1>
            <p className="text-xs text-zinc-400">Unlock achievement badges, conquer weekly community quests, and climb the ranks</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'challenges' ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Challenges
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'badges' ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Badges ({data.badges?.filter((b: any) => b.unlocked).length || 0})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leaderboard' ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Top Gamification Banner: Streak & Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Streak Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">CURRENT STREAK</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">{data.streak}</span>
                <span className="text-xs text-zinc-400">Days Active</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">All-time record: <strong className="text-white">{data.longestStreak} days</strong></p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-black shadow-inner">
              🔥
            </div>
          </div>

          {/* Level & XP */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 via-zinc-900 to-zinc-900 border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">ATHLETE TIER</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">Level {data.level}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2"><strong className="text-purple-300">{data.points} Total XP</strong> accumulated</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl font-black shadow-inner">
              ⚡
            </div>
          </div>

          {/* Badges Unlocked Count */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">MILESTONES</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">{data.badges?.filter((b: any) => b.unlocked).length || 0}</span>
                <span className="text-xs text-zinc-400">/ {data.badges?.length || 8} Badges</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Next reward: +350 XP Milestone</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-black shadow-inner">
              🏆
            </div>
          </div>
        </div>

        {/* TAB 1: CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Active Community Challenges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.challenges?.map((ch: any) => (
                <div key={ch.id} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between glow-card">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700 uppercase">
                        {ch.category}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {ch.participants_count} joined
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{ch.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{ch.description}</p>

                    <div className="mt-4 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs">
                      <div className="flex justify-between font-bold text-zinc-300 mb-1">
                        <span>Progress: {ch.progress.toLocaleString()}</span>
                        <span>{ch.target_value.toLocaleString()} {ch.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                          style={{ width: `${ch.pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mt-2">
                        <span>Reward: 🏅 {ch.badge_reward}</span>
                        <span className="text-amber-400 font-bold">+{ch.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80">
                    {ch.isJoined ? (
                      <div className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Active Participant ({ch.pct}%)
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoinChallenge(ch.id)}
                        className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all shadow-sm"
                      >
                        Join Challenge Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: BADGES GRID */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Achievement Hall of Fame</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data.badges?.map((b: any) => (
                <div
                  key={b.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                    b.unlocked
                      ? 'bg-zinc-900/90 border-amber-500/40 shadow-glow-green'
                      : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
                          b.unlocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-600'
                        }`}
                      >
                        {b.unlocked ? '🏅' : '🔒'}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">+{b.xp} XP</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{b.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{b.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 text-[10px]">
                    {b.unlocked ? (
                      <span className="text-emerald-400 font-bold">✓ Unlocked {b.unlockedAt ? `on ${b.unlockedAt}` : ''}</span>
                    ) : (
                      <span className="text-zinc-500">Locked milestone</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Global Community Leaderboard</h3>
              <span className="text-xs text-zinc-400">Weekly Top Performers</span>
            </div>

            <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden divide-y divide-zinc-800/60">
              {data.leaderboard?.map((entry: any) => (
                <div
                  key={entry.rank}
                  className={`p-4 flex items-center justify-between ${
                    entry.isCurrentUser ? 'bg-emerald-950/20 border-l-4 border-l-emerald-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-7 text-center font-black text-sm ${
                      entry.rank === 1 ? 'text-amber-400 text-base' :
                      entry.rank === 2 ? 'text-zinc-300' :
                      entry.rank === 3 ? 'text-amber-600' : 'text-zinc-500'
                    }`}>
                      #{entry.rank}
                    </span>

                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />

                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400">Level {entry.level} • {entry.streak} Day Streak 🔥</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">{entry.points.toLocaleString()} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
