'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import UserNav from './UserNav';
import MobileNav from './MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <UserNav user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
