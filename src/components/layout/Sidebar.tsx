'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Activity,
  LineChart,
  Bot,
  Trophy,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  Sparkles,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workouts', href: '/workouts', icon: Dumbbell },
    { label: 'Nutrition', href: '/nutrition', icon: Utensils },
    { label: 'Activity & Sleep', href: '/activity', icon: Activity },
    { label: 'Body Progress', href: '/progress', icon: LineChart },
    { label: 'AI Coach', href: '/coach', icon: Bot, badge: 'AI' },
    { label: 'Gamification', href: '/gamification', icon: Trophy },
    { label: 'Trainer Portal', href: '/trainer', icon: Users, badge: 'PRO' },
    { label: 'Referrals & Rewards', href: '/referrals', icon: Share2, badge: 'EARN' },
    { label: 'Billing & Plan', href: '/billing', icon: CreditCard },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Super admin link
  if (user?.role === 'ADMIN') {
    navItems.splice(8, 0, { label: 'Admin Control', href: '/admin', icon: ShieldCheck, badge: 'ADMIN' });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl h-screen sticky top-0 px-4 py-6 z-40 select-none">
      {/* Brand Header */}
      <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black shadow-glow-green">
          <Sparkles className="w-5 h-5 animate-pulse-subtle" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-emerald-400">
            APEX<span className="text-emerald-400">FIT</span>
          </span>
          <span className="block text-[10px] tracking-widest text-zinc-400 font-mono font-medium">
            AI FITNESS ECOSYSTEM
          </span>
        </div>
      </Link>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Tracking & AI
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-emerald-400' : 'text-zinc-400')} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                  item.badge === 'AI' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  item.badge === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Tier Footer Card */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
              alt={user?.name || 'Athlete'}
              className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Alex Rivera'}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user?.role || 'USER'} • {user?.subscriptionTier || 'PRO'}</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
}
