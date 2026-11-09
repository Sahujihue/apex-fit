'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Utensils, Bot, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workouts', href: '/workouts', icon: Dumbbell },
    { label: 'Nutrition', href: '/nutrition', icon: Utensils },
    { label: 'AI Coach', href: '/coach', icon: Bot, isSpecial: true },
    { label: 'Menu', href: '/settings', icon: Menu },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-2 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isSpecial) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -top-3 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-400 p-0.5 shadow-glow-purple">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-300 mt-1">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors',
                isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-emerald-400')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
