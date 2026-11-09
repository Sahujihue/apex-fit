'use client';

import React from 'react';
import { Flame, Clock, Footprints } from 'lucide-react';

interface ActivityRingsProps {
  move: { current: number; target: number; pct: number };
  exercise: { current: number; target: number; pct: number };
  stand: { current: number; target: number; pct: number };
  size?: number;
}

export default function ActivityRings({ move, exercise, stand, size = 180 }: ActivityRingsProps) {
  const strokeWidth = 14;
  const center = size / 2;

  // Radii for 3 concentric rings
  const radiusMove = center - strokeWidth;
  const radiusExercise = radiusMove - strokeWidth - 4;
  const radiusStand = radiusExercise - strokeWidth - 4;

  const circMove = 2 * Math.PI * radiusMove;
  const circExercise = 2 * Math.PI * radiusExercise;
  const circStand = 2 * Math.PI * radiusStand;

  const offsetMove = circMove - (Math.min(move.pct, 100) / 100) * circMove;
  const offsetExercise = circExercise - (Math.min(exercise.pct, 100) / 100) * circExercise;
  const offsetStand = circStand - (Math.min(stand.pct, 100) / 100) * circStand;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Rings */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track 1 (Move - Rose) */}
          <circle
            cx={center}
            cy={center}
            r={radiusMove}
            stroke="rgba(244, 63, 94, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Ring 1 (Move - Rose) */}
          <circle
            cx={center}
            cy={center}
            r={radiusMove}
            stroke="#f43f5e"
            strokeWidth={strokeWidth}
            strokeDasharray={circMove}
            strokeDashoffset={offsetMove}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />

          {/* Background Track 2 (Exercise - Neon Green) */}
          <circle
            cx={center}
            cy={center}
            r={radiusExercise}
            stroke="rgba(34, 197, 94, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Ring 2 (Exercise - Neon Green) */}
          <circle
            cx={center}
            cy={center}
            r={radiusExercise}
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeDasharray={circExercise}
            strokeDashoffset={offsetExercise}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />

          {/* Background Track 3 (Stand - Cyan) */}
          <circle
            cx={center}
            cy={center}
            r={radiusStand}
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Ring 3 (Stand - Cyan) */}
          <circle
            cx={center}
            cy={center}
            r={radiusStand}
            stroke="#06b6d4"
            strokeWidth={strokeWidth}
            strokeDasharray={circStand}
            strokeDashoffset={offsetStand}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Glow Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
            <span className="text-xs font-bold text-zinc-300">
              {Math.round((move.pct + exercise.pct + stand.pct) / 3)}%
            </span>
          </div>
        </div>
      </div>

      {/* Ring Legends & Stats */}
      <div className="flex flex-col gap-3 w-full sm:w-auto">
        {/* Move */}
        <div className="flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-300">MOVE</p>
              <p className="text-sm font-bold text-white">
                {move.current.toLocaleString()} <span className="text-xs font-normal text-zinc-400">/ {move.target} kcal</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
            {move.pct}%
          </span>
        </div>

        {/* Exercise */}
        <div className="flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-300">EXERCISE</p>
              <p className="text-sm font-bold text-white">
                {exercise.current} <span className="text-xs font-normal text-zinc-400">/ {exercise.target} min</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
            {exercise.pct}%
          </span>
        </div>

        {/* Stand / Steps */}
        <div className="flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-cyan-300">STEPS</p>
              <p className="text-sm font-bold text-white">
                {stand.current.toLocaleString()} <span className="text-xs font-normal text-zinc-400">/ {stand.target.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
            {stand.pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
