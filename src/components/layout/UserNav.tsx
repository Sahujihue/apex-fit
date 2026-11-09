'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Moon, Sun, CheckCircle2, UserCheck, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function UserNav({ user }: { user?: any }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(user?.unreadNotificationsCount || 0);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, []);

  const switchDemoRole = async (role: string) => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        setShowDemoMenu(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotifsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Quick Breadcrumb / Greeting */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <p className="text-xs text-zinc-400">Welcome back,</p>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            {user?.name || 'Alex Rivera'}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {user?.subscriptionTier || 'PRO'}
            </span>
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Instant Demo Switcher Pill (Set NEXT_PUBLIC_DEMO_MODE="false" in production to hide) */}
        {process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' && (
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-xs font-semibold text-zinc-200 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Demo Persona:</span>
            <span className="text-emerald-400 font-bold">{user?.role || 'USER'}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-zinc-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Switch Live Demo Persona</p>
                <p className="text-xs text-zinc-300">Test different role experiences instantly:</p>
              </div>
              <div className="py-1 space-y-1">
                <button
                  onClick={() => switchDemoRole('USER')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-zinc-800 text-left transition-colors"
                >
                  <div>
                    <p className="font-bold text-white">🏋️ Alex Rivera</p>
                    <p className="text-[10px] text-zinc-400">Athlete (PRO Tier, rich data)</p>
                  </div>
                  {user?.role === 'USER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => switchDemoRole('TRAINER')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-zinc-800 text-left transition-colors"
                >
                  <div>
                    <p className="font-bold text-white">📋 Coach Marcus Vance</p>
                    <p className="text-[10px] text-zinc-400">Personal Trainer Portal</p>
                  </div>
                  {user?.role === 'TRAINER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => switchDemoRole('ADMIN')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-zinc-800 text-left transition-colors"
                >
                  <div>
                    <p className="font-bold text-white">🛡️ SaaS Super Admin</p>
                    <p className="text-[10px] text-zinc-400">Full platform controls & AI config</p>
                  </div>
                  {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => switchDemoRole('CLIENT')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-zinc-800 text-left transition-colors"
                >
                  <div>
                    <p className="font-bold text-white">🏃 Sarah Jenkins</p>
                    <p className="text-[10px] text-zinc-400">Coached Client (Assigned to Marcus)</p>
                  </div>
                  {user?.email === 'sarah@apexfit.com' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Toggle Light / Dark mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-white">Notifications ({unreadCount} unread)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs border ${
                        n.is_read ? 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400' : 'bg-zinc-800/60 border-emerald-500/30 text-zinc-200'
                      }`}
                    >
                      <p className="font-bold text-white">{n.title}</p>
                      <p className="text-[11px] text-zinc-300 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
