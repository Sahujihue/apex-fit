'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      title: 'The Science of Progressive Overload: Why Logged Volume Matters',
      category: 'Hypertrophy Science',
      date: 'Nov 4, 2026',
      readTime: '6 min read',
      excerpt: 'Mechanical tension is the primary driver of skeletal muscle hypertrophy. Discover how tracking tonnage and RPE prevents premature plateaus.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600'
    },
    {
      title: 'Heart Rate Variability (HRV) and Autonomic Nervous System Recovery',
      category: 'Recovery & Wearables',
      date: 'Oct 28, 2026',
      readTime: '8 min read',
      excerpt: 'How WHOOP and wearable telemetry assess parasympathetic readiness, and when you should opt for active mobility over high-strain barbell work.',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600'
    },
    {
      title: 'Nutrient Timing vs. Daily Calorie Equivalence: What Research Really Proves',
      category: 'Sports Nutrition',
      date: 'Oct 15, 2026',
      readTime: '5 min read',
      excerpt: 'Examining the anabolic window, leucine thresholds for muscle protein synthesis, and carbohydrate glycogen replenishment protocols.',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl text-white">APEX<span className="text-emerald-400">FIT</span></span>
        </Link>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs">Launch App</Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">EVIDENCE-BASED PHYSIOLOGY</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Apex Fitness Science Journal</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Practical sports science, biomechanics research, and nutritional protocols.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <div key={i} className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between glow-card">
              <div>
                <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-2 font-mono">
                    <span className="text-emerald-400 font-bold uppercase">{p.category}</span>
                    <span>{p.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{p.excerpt}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  Read Article →
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
