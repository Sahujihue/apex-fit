'use client';

import React, { useEffect, useState } from 'react';
import {
  Share2,
  Copy,
  CheckCircle2,
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  ArrowRight,
  ExternalLink,
  Wallet,
  Smartphone,
  Check,
  Zap,
  Award
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import confetti from 'canvas-confetti';

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Payout states
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'paypal' | 'crypto'>('upi');
  const [payoutDestination, setPayoutDestination] = useState('athlete@okhdfcbank');
  const [payoutStatus, setPayoutStatus] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/referrals');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleCopyLink = () => {
    if (!data?.referralUrl) return;
    navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = async () => {
    setIsRequestingPayout(true);
    setPayoutStatus('');
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutMethod, payoutDestination })
      });
      const json = await res.json();
      if (res.ok) {
        setPayoutStatus(json.message);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setPayoutStatus(json.error || 'Payout request failed');
      }
    } catch {
      setPayoutStatus('Network error requesting payout');
    } finally {
      setIsRequestingPayout(false);
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

  const { stats, referrals = [] } = data;
  const shareMessage = `Join me on ApexFit AI — the premier AI personal fitness and workout tracker. Use my VIP link for a special discount: ${data.referralUrl}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                VIRAL GROWTH ENGINE
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
              <Share2 className="w-6 h-6 text-emerald-400" />
              Affiliate & Referral Rewards Program
            </h1>
            <p className="text-xs text-zinc-400">
              Invite friends, athletes, and gym partners to ApexFit and earn 20% recurring monthly commission for every active subscription.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/30 self-start sm:self-auto">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Commission Rate: 20% Lifetime Recurring</span>
          </div>
        </div>

        {/* Hero Referral Link Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">YOUR EXCLUSIVE AFFILIATE LINK</span>
              <h3 className="text-lg font-black text-white mt-1">Share ApexFit with Your Community</h3>
              <p className="text-xs text-zinc-400">Anyone signing up via your link receives 10% off their first subscription.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Referral Code:</span>
              <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-emerald-400 font-black text-xs">
                {data.referralCode}
              </span>
            </div>
          </div>

          {/* Copy Box */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              readOnly
              value={data.referralUrl}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green flex items-center justify-center gap-2 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Link'}
            </button>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80 text-xs">
            <span className="text-[11px] text-zinc-500 mr-2">Quick Share:</span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(data.referralUrl)}&text=${encodeURIComponent('Track fitness with AI on ApexFit')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Telegram
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-bold border border-sky-500/30 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              X / Twitter
            </a>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">TOTAL CLICKS</span>
            <p className="text-3xl font-black text-white mt-1">{stats.totalClicks}</p>
            <p className="text-[11px] text-zinc-500 mt-1">Unique link impressions</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">ATHLETES REFERRED</span>
            <p className="text-3xl font-black text-white mt-1">{stats.totalReferred}</p>
            <p className="text-[11px] text-zinc-500 mt-1">{stats.activeConversions} active paid subscribers</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">EARNINGS BALANCE</span>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1">${stats.totalEarningsUSD}</p>
            <p className="text-[11px] text-zinc-500 mt-1">Ready for 24-hour withdrawal</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">COMMISSION SHARE</span>
            <p className="text-3xl font-black text-white mt-1">{data.commissionRatePercent}%</p>
            <p className="text-[11px] text-zinc-500 mt-1">On all renewal billing cycles</p>
          </div>
        </div>

        {/* How It Works Infographic */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            How the ApexFit Partner Program Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
              <h4 className="font-bold text-white">Share Your Link</h4>
              <p className="text-zinc-400 text-[11px]">Post your link on Instagram, gym WhatsApp groups, fitness blogs, or personal coaching channels.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">2</span>
              <h4 className="font-bold text-white">Athletes Subscribe</h4>
              <p className="text-zinc-400 text-[11px]">When users register through your link, they receive an automatic discount and get bound to your affiliate account.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">3</span>
              <h4 className="font-bold text-white">Get Paid Monthly</h4>
              <p className="text-zinc-400 text-[11px]">Receive 20% recurring revenue deposited straight into your UPI, Bank Account, PayPal, or Crypto USDT wallet.</p>
            </div>
          </div>
        </div>

        {/* Request Payout Box */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Affiliate Payout Withdrawal
              </h3>
              <p className="text-xs text-zinc-400">Withdraw your earned commissions directly to your local bank via UPI, PayPal, or Crypto.</p>
            </div>

            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              Available to Cash Out: ${stats.totalEarningsUSD} USD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setPayoutMethod('upi')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                payoutMethod === 'upi' ? 'bg-zinc-800 border-blue-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <strong className="block text-xs text-white">🇮🇳 UPI / Bank Transfer</strong>
              <span className="text-[10px]">Google Pay, PhonePe, Paytm (India)</span>
            </button>

            <button
              onClick={() => setPayoutMethod('paypal')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                payoutMethod === 'paypal' ? 'bg-zinc-800 border-sky-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <strong className="block text-xs text-white">🅿️ PayPal Account</strong>
              <span className="text-[10px]">Instant international transfer</span>
            </button>

            <button
              onClick={() => setPayoutMethod('crypto')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                payoutMethod === 'crypto' ? 'bg-zinc-800 border-emerald-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <strong className="block text-xs text-white">🪙 Crypto USDT (TRC20)</strong>
              <span className="text-[10px]">Zero-fee blockchain payout</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <input
              type="text"
              value={payoutDestination}
              onChange={(e) => setPayoutDestination(e.target.value)}
              placeholder={payoutMethod === 'upi' ? 'Enter UPI ID (e.g. name@okhdfcbank)' : payoutMethod === 'paypal' ? 'Enter PayPal Email' : 'Enter USDT TRC20 Wallet Address'}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={handleRequestPayout}
              disabled={isRequestingPayout}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green shrink-0 flex items-center justify-center gap-2"
            >
              {isRequestingPayout ? 'Processing...' : 'Request Payout'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {payoutStatus && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              payoutStatus.includes('submitted') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{payoutStatus}</span>
            </div>
          )}
        </div>

        {/* Referrals Activity Table */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h3 className="text-base font-bold text-white">Referral Activity Log</h3>
          <div className="divide-y divide-zinc-800 text-xs">
            {referrals.map((refItem: any) => (
              <div key={refItem.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Referral ID: {refItem.id}</span>
                  <span className="text-zinc-400 ml-2">• Apex {refItem.plan_tier} Tier</span>
                  <span className="block text-[11px] text-zinc-500 mt-0.5">{refItem.created_at}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-400">+${refItem.commission_amount.toFixed(2)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    refItem.status === 'converted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {refItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
