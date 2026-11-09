import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-xs font-bold text-emerald-400 hover:underline">← Return Home</Link>
        <h1 className="text-3xl font-black text-white">Terms of Service & Health Disclaimer</h1>
        <p className="text-xs text-zinc-400">Effective Date: November 2026</p>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <strong>CRITICAL HEALTH & MEDICAL DISCLAIMER:</strong> ApexFit AI and its automated AI Personal Fitness Coach provide sports performance recommendations, training program suggestions, and nutritional caloric guidelines based on general exercise physiology. ApexFit DOES NOT provide medical diagnosis, treatment of injuries, or guaranteed health outcomes. Always consult a physician before beginning any strenuous resistance training or nutritional program.
          </div>

          <h3 className="text-base font-bold text-white pt-2">1. Subscription Billing & Cancellations</h3>
          <p>
            Subscriptions renew automatically according to your selected period (monthly or annually). You may cancel your subscription at any time via the Billing dashboard. Cancellation halts future charges and returns your account to the Free tier at the end of the active billing cycle.
          </p>

          <h3 className="text-base font-bold text-white pt-2">2. Acceptable Use</h3>
          <p>
            You agree to use ApexFit solely for personal fitness tracking or lawful coaching client management. You may not attempt to reverse engineer API endpoints, bypass subscription tier feature gates, or upload malicious code.
          </p>
        </div>
      </div>
    </div>
  );
}
