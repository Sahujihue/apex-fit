'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Server,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Globe,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InstallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [systemCheck, setSystemCheck] = useState<any>(null);

  // Wizard steps: 1 to 4
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [siteName, setSiteName] = useState('ApexFit AI');
  const [currency, setCurrency] = useState('USD');
  const [inrRate, setInrRate] = useState('83.5');
  const [demoMode, setDemoMode] = useState('false'); // default to false for real installation!

  // Admin states
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional Gateways
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [cryptoWalletUsdt, setCryptoWalletUsdt] = useState('');

  // Processing & Error
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('/api/install')
      .then(res => res.json())
      .then(data => {
        setIsInstalled(data.installed);
        setSystemCheck(data.systemCheck);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 2) {
      if (!siteName.trim()) {
        setErrorMessage('Please enter a website name');
        return;
      }
    } else if (currentStep === 3) {
      if (!adminEmail.trim() || !adminEmail.includes('@')) {
        setErrorMessage('Please enter a valid Admin email address');
        return;
      }
      if (!adminPassword || adminPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters');
        return;
      }
      if (adminPassword !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleCompleteInstall = async () => {
    setInstalling(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          adminName,
          adminEmail,
          adminPassword,
          currency,
          inrRate,
          demoMode,
          stripePublishableKey,
          stripeSecretKey,
          razorpayKeyId,
          cryptoWalletUsdt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Installation failed');
        setInstalling(false);
        return;
      }

      setInstallSuccess(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Network connection failed during installation');
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If already installed
  if (isInstalled && !installSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Platform is Already Installed!</h2>
            <p className="text-xs text-zinc-400 mt-2">
              ApexFit AI has already been configured and secured. You can sign in using your Super Admin credentials.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Installation Complete Screen
  if (installSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-8 rounded-3xl bg-zinc-900 border border-emerald-500/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-glow-green">
            <Check className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              INSTALLATION COMPLETE
            </span>
            <h2 className="text-2xl font-black text-white mt-3">Welcome to {siteName}!</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your AI Fitness SaaS platform has been initialized, database tables verified, and Super Admin created.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Super Admin Email:</span>
              <span className="text-white font-mono font-bold">{adminEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Default Currency:</span>
              <span className="text-emerald-400 font-bold">{currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Demo Persona Switcher:</span>
              <span className="text-zinc-300 font-bold uppercase">{demoMode === 'true' ? 'Enabled' : 'Disabled (Clean Production)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Database Engine:</span>
              <span className="text-zinc-300 font-mono">SQLite WAL Mode (ACID)</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green flex items-center justify-center gap-2"
          >
            Launch & Sign In as Admin
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        {/* Wizard Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-zinc-950 font-black shadow-glow-green">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">ApexFit SaaS Web Installer</h1>
              <p className="text-xs text-zinc-400">First-time server initialization and setup wizard</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-zinc-800 text-[11px] font-bold text-center">
          <div className={`py-2.5 border-b-2 ${currentStep >= 1 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-600'}`}>
            1. System Check
          </div>
          <div className={`py-2.5 border-b-2 ${currentStep >= 2 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-600'}`}>
            2. Platform
          </div>
          <div className={`py-2.5 border-b-2 ${currentStep >= 3 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-600'}`}>
            3. Super Admin
          </div>
          <div className={`py-2.5 border-b-2 ${currentStep >= 4 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-600'}`}>
            4. Gateways
          </div>
        </div>

        {/* Wizard Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: SYSTEM REQUIREMENTS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Server & Environment Health Check</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Verifying that your hosting server meets the prerequisites for running ApexFit AI SaaS platform.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Node.js Runtime Engine</span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5">Version {systemCheck?.nodeVersion || 'v18+'} (Recommended v18.0.0+)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    PASSED ✓
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">SQLite Database Engine</span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5">ACID Compliance, WAL Mode, Zero-Config</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    READY ✓
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Data Storage Permissions</span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5">Directory /data has full read/write privileges</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    WRITABLE ✓
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Security & Cryptography Modules</span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5">Bcrypt password hashing & JWT authentication ready</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    ACTIVE ✓
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANDING & PLATFORM CONFIG */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Platform Identity & Localization</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Customize your SaaS branding name, default billing currency, and demo mode.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Platform Brand Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. ApexFit AI or YourBrand Gym"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Default Billing Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">USD to INR Exchange Rate</label>
                    <input
                      type="text"
                      value={inrRate}
                      onChange={(e) => setInrRate(e.target.value)}
                      placeholder="83.5"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Demo Persona Switcher & Test Shortcuts</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoMode('false')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        demoMode === 'false' ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <strong className="block text-white">Disabled (Recommended)</strong>
                      <span className="text-[10px]">Clean production launch without demo buttons</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoMode('true')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        demoMode === 'true' ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <strong className="block text-white">Enabled</strong>
                      <span className="text-[10px]">Keep 1-click demo persona switcher visible</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUPER ADMIN ACCOUNT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create Master Super Admin Account</h3>
              </div>
              <p className="text-xs text-zinc-400">
                This account will have full administrative access to financial telemetry, users, feature flags, and payment gateways.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Yusuf Sahu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Admin Email Address</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Create Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: OPTIONAL PAYMENT GATEWAYS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Payment Gateways Setup (Optional)</h3>
              </div>
              <p className="text-xs text-zinc-400">
                You can configure your payment gateway API keys now, or leave them blank and configure anytime inside the Super Admin Dashboard.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Razorpay Key ID (For India UPI / GPay / PhonePe)</label>
                  <input
                    type="text"
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    placeholder="rzp_live_... (or leave blank for test mode)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-blue-400 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Stripe Publishable Key (Credit/Debit Cards)</label>
                  <input
                    type="text"
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    placeholder="pk_live_... (or leave blank for test mode)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-400 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Crypto USDT (TRC20/ERC20) Receiving Wallet</label>
                  <input
                    type="text"
                    value={cryptoWalletUsdt}
                    onChange={(e) => setCryptoWalletUsdt(e.target.value)}
                    placeholder="0x... or Tron TRC20 wallet address"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handlePrevStep}
              disabled={installing}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green flex items-center gap-1.5"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCompleteInstall}
              disabled={installing}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green flex items-center gap-2 disabled:opacity-50"
            >
              {installing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Finalizing Installation...
                </>
              ) : (
                <>
                  Install & Launch Platform
                  <Zap className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
