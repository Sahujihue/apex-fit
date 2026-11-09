import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-xs font-bold text-emerald-400 hover:underline">← Return Home</Link>
        <h1 className="text-3xl font-black text-white">Privacy Policy & Biometric Data Handling</h1>
        <p className="text-xs text-zinc-400">Effective Date: November 2026</p>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <p>
            At ApexFit AI ("ApexFit", "we", "our"), protecting the integrity, confidentiality, and security of your biometric health metrics, workout history, and personal telemetry is our highest priority.
          </p>

          <h3 className="text-base font-bold text-white pt-2">1. Information We Collect</h3>
          <p>
            We collect information provided directly by you, including your name, email address, age, gender, height, current body weight, target fitness goals, dietary preferences, and workout logs. If you enable wearable device synchronization (Apple Health, WHOOP, Fitbit), we process steps, active calories, sleep duration, and resting heart rate data strictly to compute your readiness scores.
          </p>

          <h3 className="text-base font-bold text-white pt-2">2. How AI Models Process Your Data</h3>
          <p>
            Your training metrics and prompts submitted to Apex AI Coach are processed server-side through secured encrypted endpoints. We do not use your private personal health logs to train public foundation models without explicit consent.
          </p>

          <h3 className="text-base font-bold text-white pt-2">3. Data Isolation & Security</h3>
          <p>
            All user accounts are isolated with row-level ownership checks. Database credentials and session tokens are strictly signed with cryptographic hashing (bcrypt & JWT HMAC-SHA256).
          </p>
        </div>
      </div>
    </div>
  );
}
