import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeContext';
import PWAInstallBanner from '@/components/layout/PWAInstallBanner';

export const metadata: Metadata = {
  title: 'ApexFit AI — Premium AI-Powered Fitness Tracker & SaaS Ecosystem',
  description: 'The world-class AI fitness platform combining Apple Fitness activity rings, WHOOP recovery strain, MyFitnessPal macro intelligence, and real-time AI personal coaching.',
  keywords: 'fitness tracker, AI personal trainer, workout tracker, macro counter, health SaaS, WHOOP recovery, Apple Fitness',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ApexFit'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-black">
        <ThemeProvider>
          {children}
          <PWAInstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
