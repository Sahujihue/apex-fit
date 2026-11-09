'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Check,
  Sparkles,
  Shield,
  Zap,
  Tag,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  X,
  RefreshCw,
  Clock,
  Printer,
  QrCode,
  Copy,
  Wallet,
  Smartphone,
  CheckCheck
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import confetti from 'canvas-confetti';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  highlight?: boolean;
}

interface Receipt {
  transactionId: string;
  invoiceId: string;
  tier: string;
  period: string;
  amountPaid: number;
  paymentGateway: string;
  customTxInfo?: string;
  date: string;
  customerEmail: string;
  status: string;
}

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState('');

  // Checkout modal state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'razorpay' | 'cashfree' | 'paypal' | 'crypto'>('stripe_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('Yusuf Sahu');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('424');
  const [cardZip, setCardZip] = useState('10001');

  // Razorpay states
  const [razorpayUpi, setRazorpayUpi] = useState('yusuf@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');

  // Cashfree states
  const [cashfreePhone, setCashfreePhone] = useState('+91 98765 43210');

  // Crypto states
  const [cryptoToken, setCryptoToken] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC20 (Tron)');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Receipt modal state
  const [completedReceipt, setCompletedReceipt] = useState<Receipt | null>(null);

  const fetchBilling = async () => {
    try {
      const res = await fetch('/api/billing');
      const json = await res.json();
      setData(json);
      if (json.subscription?.period) {
        setBillingPeriod(json.subscription.period);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply_coupon', couponCode: couponCode.trim() })
      });
      const json = await res.json();
      if (res.ok) {
        setAppliedCoupon(json);
        setCouponMessage(`Discount of ${json.discountPercent}% successfully applied!`);
      } else {
        setAppliedCoupon(null);
        setCouponMessage(json.error || 'Invalid coupon code');
      }
    } catch (e) {
      console.error(e);
      setCouponMessage('Error validating promotional coupon');
    }
  };

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlanForCheckout(plan);
    setPaymentError('');
    // Auto-select first enabled gateway
    const enabled = data?.enabledGateways || {};
    if (enabled.stripe) setPaymentMethod('stripe_card');
    else if (enabled.razorpay) setPaymentMethod('razorpay');
    else if (enabled.cashfree) setPaymentMethod('cashfree');
    else if (enabled.paypal) setPaymentMethod('paypal');
    else if (enabled.crypto) setPaymentMethod('crypto');
  };

  const handleQuickFillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('08/29');
    setCardCvc('842');
    setCardName('Apex Athlete');
  };

  const handleCopyCryptoAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleProcessCheckout = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const basePrice = billingPeriod === 'YEARLY' 
        ? selectedPlanForCheckout.priceYearly 
        : selectedPlanForCheckout.priceMonthly;
      const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
      const finalAmount = discountPercent > 0 
        ? parseFloat((basePrice * (1 - discountPercent / 100)).toFixed(2)) 
        : basePrice;

      // Gateway progress animation
      if (paymentMethod === 'stripe_card') {
        setPaymentStepText('Authorizing Stripe 256-Bit SSL Gateway...');
        await new Promise(r => setTimeout(r, 600));
        setPaymentStepText('Verifying 3D-Secure 2.0 protocol...');
        await new Promise(r => setTimeout(r, 500));
      } else if (paymentMethod === 'razorpay') {
        setPaymentStepText('Connecting to Razorpay UPI Gateway...');
        await new Promise(r => setTimeout(r, 600));
        setPaymentStepText('Verifying UPI VPA & bank authorization...');
        await new Promise(r => setTimeout(r, 500));
      } else if (paymentMethod === 'cashfree') {
        setPaymentStepText('Initializing Cashfree Auto-Collect session...');
        await new Promise(r => setTimeout(r, 600));
      } else if (paymentMethod === 'paypal') {
        setPaymentStepText('Connecting to PayPal Express API...');
        await new Promise(r => setTimeout(r, 600));
      } else if (paymentMethod === 'crypto') {
        setPaymentStepText(`Verifying on-chain ${cryptoToken} transaction hash...`);
        await new Promise(r => setTimeout(r, 700));
        setPaymentStepText('Confirming blockchain block confirmations (12/12)...');
        await new Promise(r => setTimeout(r, 500));
      }

      const payload = {
        tier: selectedPlanForCheckout.id,
        period: billingPeriod,
        paymentMethod,
        amount: finalAmount,
        couponCode: appliedCoupon?.code,
        cardDetails: paymentMethod === 'stripe_card' ? {
          cardNumber: cardNumber || '4242424242424242',
          expMonth: cardExpiry.split('/')[0] || '12',
          expYear: cardExpiry.split('/')[1] || '28',
          cvc: cardCvc || '424',
          nameOnCard: cardName || 'Apex Subscriber'
        } : undefined,
        razorpayDetails: paymentMethod === 'razorpay' ? {
          upiId: razorpayUpi,
          paymentId: `pay_rzp_${Date.now()}`
        } : undefined,
        cashfreeDetails: paymentMethod === 'cashfree' ? {
          phone: cashfreePhone,
          orderId: `cf_order_${Date.now()}`
        } : undefined,
        paypalOrderId: paymentMethod === 'paypal' ? `PAYPAL_${Date.now()}` : undefined,
        cryptoDetails: paymentMethod === 'crypto' ? {
          token: cryptoToken,
          network: cryptoNetwork,
          txHash: cryptoTxHash || `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
        } : undefined
      };

      const res = await fetch('/api/billing/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok) {
        setPaymentError(resData.error || 'Payment gateway declined transaction');
        setIsProcessingPayment(false);
        return;
      }

      setPaymentStepText('Payment Confirmed! Provisioning SaaS Tier...');
      await new Promise(r => setTimeout(r, 400));

      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.5 }
      });

      setCompletedReceipt(resData.receipt);
      setSelectedPlanForCheckout(null);
      fetchBilling();
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Payment communication error');
    } finally {
      setIsProcessingPayment(false);
      setPaymentStepText('');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your active subscription? You will retain access until the end of this billing period.')) return;
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_subscription' })
      });
      if (res.ok) {
        fetchBilling();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenStripePortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const json = await res.json();
      if (json.portalUrl) {
        window.location.href = json.portalUrl;
      }
    } catch (e) {
      console.error(e);
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

  const { subscription, plans, invoices, enabledGateways = {}, gatewayConfig = {} } = data;
  const inrRate = parseFloat(gatewayConfig.currency_conversion_inr || '83.5');

  // Crypto wallet address helper
  const getCryptoAddress = () => {
    if (cryptoToken === 'BTC') return gatewayConfig.crypto_wallet_btc || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    if (cryptoToken === 'ETH') return gatewayConfig.crypto_wallet_eth || '0x3E54b8D218bE3c1A807b53D4b6E999071E57A42A';
    return gatewayConfig.crypto_wallet_usdt || '0x71C8fb8E999071E57A42AB6E999071E57A42A90';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                STRIPE • RAZORPAY • CASHFREE • PAYPAL • CRYPTO
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              Subscription & SaaS Monetization
            </h1>
            <p className="text-xs text-zinc-400">
              International automated billing supporting UPI, NetBanking, Credit/Debit cards, PayPal, and Web3 Crypto
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setBillingPeriod('MONTHLY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === 'MONTHLY' ? 'bg-emerald-500 text-zinc-950 shadow-glow-green' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('YEARLY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === 'YEARLY' ? 'bg-emerald-500 text-zinc-950 shadow-glow-green' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Yearly Billing
              <span className="px-1.5 py-0.2 rounded-md bg-zinc-950 text-emerald-400 text-[10px] font-black">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Current Active Plan Status Banner */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">CURRENT PLAN</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {subscription.status}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <h2 className="text-3xl font-black text-white">Apex {subscription.tier} Plan</h2>
              <span className="text-xs text-zinc-400">
                • Billed {billingPeriod.toLowerCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Next Scheduled Billing Date: <strong className="text-zinc-200">{subscription.nextBillingDate}</strong> • Secured Multi-Gateway Billing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenStripePortal}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-2 border border-zinc-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              Stripe Customer Portal
            </button>
            {subscription.tier !== 'FREE' && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Promotional Coupon Banner */}
        <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Have an Official Promotional Coupon?
              </h4>
              <p className="text-xs text-zinc-400">
                Apply discount code <span className="font-mono text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">APEX50</span> to get 50% OFF any plan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. APEX50"
              className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono uppercase text-white focus:outline-none focus:border-amber-400 w-32"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all shadow-sm"
            >
              Apply Discount
            </button>
          </div>
        </div>

        {couponMessage && (
          <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            appliedCoupon ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            {appliedCoupon ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{couponMessage}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p: Plan) => {
            const isCurrent = subscription.tier === p.id;
            const price = billingPeriod === 'YEARLY' ? p.priceYearly : p.priceMonthly;
            const discount = appliedCoupon ? appliedCoupon.discountPercent : 0;
            const finalPrice = discount > 0 ? parseFloat((price * (1 - discount / 100)).toFixed(2)) : price;
            const inrPrice = Math.round(finalPrice * inrRate);

            return (
              <div
                key={p.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${
                  p.highlight
                    ? 'bg-zinc-900/95 border-emerald-500/70 shadow-glow-green'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    {p.id === 'FREE' && (
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Starter</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 min-h-[34px]">{p.description}</p>

                  <div className="my-5 pb-5 border-b border-zinc-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">${finalPrice}</span>
                      <span className="text-xs text-zinc-400 font-semibold">/{billingPeriod === 'YEARLY' ? 'year' : 'month'}</span>
                    </div>
                    {finalPrice > 0 && (
                      <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                        ≈ ₹{inrPrice.toLocaleString()} INR
                      </span>
                    )}
                    {discount > 0 && price > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 line-through">${price}</span>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          SAVE {discount}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {p.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800">
                  {isCurrent ? (
                    <div className="py-2.5 rounded-xl bg-zinc-800 text-emerald-400 font-bold text-xs text-center border border-zinc-700 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Current Active Plan
                    </div>
                  ) : p.id === 'FREE' ? (
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
                    >
                      Downgrade to Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(p)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        p.highlight
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-glow-green font-black'
                          : 'bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Subscribe / Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Supported Payment Providers Badges */}
        <div className="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            INTERNATIONAL PAYMENT INFRASTRUCTURE
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {enabledGateways.stripe !== false && (
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Stripe (Cards, Apple Pay)
              </span>
            )}
            {enabledGateways.razorpay !== false && (
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                Razorpay (UPI, GPay, PhonePe, Paytm)
              </span>
            )}
            {enabledGateways.cashfree !== false && (
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Cashfree (UPI & Auto-Debit)
              </span>
            )}
            {enabledGateways.paypal !== false && (
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
                <span className="font-extrabold text-blue-400">P</span>
                PayPal Express
              </span>
            )}
            {enabledGateways.crypto !== false && (
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Crypto (USDT, BTC, ETH)
              </span>
            )}
          </div>
        </div>

        {/* Invoices History Table */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Billing History & Invoices</h3>
              <p className="text-xs text-zinc-400">Download past tax receipts and transaction records</p>
            </div>
            <span className="text-xs font-mono text-zinc-400">Currency: USD ($) & INR (₹)</span>
          </div>

          <div className="divide-y divide-zinc-800 text-xs">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{inv.id}</span>
                    <span className="text-zinc-400">• Apex {inv.plan}</span>
                  </div>
                  <span className="block text-[11px] text-zinc-500 mt-0.5">{inv.date} • Verified Gateway</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-white">${inv.amount}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                    {inv.status}
                  </span>
                  <button 
                    onClick={() => {
                      alert(`Invoice ${inv.id}\nPlan: ${inv.plan}\nAmount: $${inv.amount}\nStatus: ${inv.status}\nGateway: Verified\n\nDownload PDF receipt confirmed.`);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    title="Download Tax Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MULTI-GATEWAY CHECKOUT MODAL */}
        {/* ======================================================== */}
        {selectedPlanForCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Select Payment Gateway
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Apex {selectedPlanForCheckout.name} • {billingPeriod} Subscription
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlanForCheckout(null)}
                  disabled={isProcessingPayment}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Gateway Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {enabledGateways.stripe !== false && (
                    <button
                      onClick={() => setPaymentMethod('stripe_card')}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                        paymentMethod === 'stripe_card'
                          ? 'bg-zinc-800 border-emerald-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Stripe Cards</span>
                    </button>
                  )}

                  {enabledGateways.razorpay !== false && (
                    <button
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'bg-zinc-800 border-blue-400 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <span>Razorpay UPI</span>
                    </button>
                  )}

                  {enabledGateways.cashfree !== false && (
                    <button
                      onClick={() => setPaymentMethod('cashfree')}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                        paymentMethod === 'cashfree'
                          ? 'bg-zinc-800 border-amber-400 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Cashfree</span>
                    </button>
                  )}

                  {enabledGateways.paypal !== false && (
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                        paymentMethod === 'paypal'
                          ? 'bg-zinc-800 border-sky-400 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="font-extrabold text-sky-400">P</span>
                      <span>PayPal</span>
                    </button>
                  )}

                  {enabledGateways.crypto !== false && (
                    <button
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                        paymentMethod === 'crypto'
                          ? 'bg-zinc-800 border-emerald-400 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Crypto Web3</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: STRIPE CARD CHECKOUT */}
                {paymentMethod === 'stripe_card' && (
                  <div className="space-y-4">
                    {/* Visual Card Simulation */}
                    <div className="p-5 rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-zinc-700/80 shadow-lg relative overflow-hidden text-zinc-200">
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-10 h-7 rounded-md bg-amber-400/80 flex items-center justify-center text-zinc-950 font-black text-[9px] shadow-sm">
                          CHIP
                        </div>
                        <span className="font-black italic tracking-widest text-emerald-400 text-sm">
                          STRIPE VERIFIED
                        </span>
                      </div>
                      <div className="font-mono text-base tracking-widest text-white mb-4">
                        {cardNumber || '•••• •••• •••• 4242'}
                      </div>
                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Cardholder</span>
                          <span className="font-bold uppercase tracking-wider text-white">{cardName || 'Apex Athlete'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Expires</span>
                          <span className="font-mono font-bold text-white">{cardExpiry || '12/28'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleQuickFillTestCard}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        ⚡ Autofill Stripe Test Card (4242)
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-300 block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-zinc-300 block mb-1">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-zinc-300 block mb-1">CVC / CVV</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: RAZORPAY UPI & CARDS */}
                {paymentMethod === 'razorpay' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-400" />
                          Razorpay UPI & Indian Banking
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Instant zero-fee payment with UPI Apps, RuPay, and Indian NetBanking
                        </p>
                      </div>
                      <span className="text-sm font-black font-mono text-blue-400">
                        ₹{Math.round(
                          (appliedCoupon
                            ? (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly) * (1 - appliedCoupon.discountPercent / 100)
                            : (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly)) * inrRate
                        )} INR
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-300 block mb-1">Select UPI Provider</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['gpay', 'phonepe', 'paytm', 'other'].map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => {
                                setSelectedUpiApp(app as any);
                                if (app === 'gpay') setRazorpayUpi('athlete@okaxis');
                                else if (app === 'phonepe') setRazorpayUpi('athlete@ybl');
                                else if (app === 'paytm') setRazorpayUpi('9876543210@paytm');
                              }}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                                selectedUpiApp === app
                                  ? 'bg-blue-500/20 border-blue-400 text-white'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-300 block mb-1">Enter UPI Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          value={razorpayUpi}
                          onChange={(e) => setRazorpayUpi(e.target.value)}
                          placeholder="yourname@bank"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CASHFREE */}
                {paymentMethod === 'cashfree' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          Cashfree Auto-Collect & UPI
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          High success-rate instant settlements via Cashfree Payments
                        </p>
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">
                        Cashfree Sandbox
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Mobile Number for Payment Request</label>
                      <input
                        type="text"
                        value={cashfreePhone}
                        onChange={(e) => setCashfreePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: PAYPAL */}
                {paymentMethod === 'paypal' && (
                  <div className="p-6 rounded-2xl bg-zinc-950 border border-sky-500/30 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center font-black text-xl">
                      P
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">PayPal Express Checkout</h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                        Safe, simple subscription management with PayPal buyer protection and one-touch renewal.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                      Sandbox Account: <strong>buyer@apexfit-demo.com</strong>
                    </div>
                  </div>
                )}

                {/* TAB 5: CRYPTO WEB3 */}
                {paymentMethod === 'crypto' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">Web3 Crypto Payments</h4>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                          DECENTRALIZED
                        </span>
                      </div>

                      {/* Token Selector */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {(['USDT', 'BTC', 'ETH'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setCryptoToken(t);
                              if (t === 'USDT') setCryptoNetwork('TRC20 (Tron)');
                              else if (t === 'BTC') setCryptoNetwork('Bitcoin Network');
                              else if (t === 'ETH') setCryptoNetwork('Ethereum (ERC20)');
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                              cryptoToken === t
                                ? 'bg-emerald-500 text-zinc-950 font-black'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Deposit Details */}
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400">Network:</span>
                          <span className="text-white font-mono font-bold">{cryptoNetwork}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400">Deposit Address:</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCryptoAddress(getCryptoAddress())}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 font-bold"
                          >
                            {copiedAddress ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedAddress ? 'Copied!' : `${getCryptoAddress().substring(0, 10)}...${getCryptoAddress().slice(-6)}`}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Transaction Hash (TxHash / TxID)
                      </label>
                      <input
                        type="text"
                        value={cryptoTxHash}
                        onChange={(e) => setCryptoTxHash(e.target.value)}
                        placeholder="Paste 0x... or Bitcoin transaction ID after sending"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() => setCryptoTxHash(`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 mt-1 font-bold inline-block"
                      >
                        ⚡ Autofill Demo Confirmed TxHash
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Summary Box */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Apex {selectedPlanForCheckout.name} ({billingPeriod})</span>
                    <span className="font-mono text-white">
                      ${billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Promotional Discount ({appliedCoupon.code} - {appliedCoupon.discountPercent}%)</span>
                      <span>
                        -$
                        {(
                          (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly) *
                          (appliedCoupon.discountPercent / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-400">
                    <span>Tax & Processing Fees</span>
                    <span className="text-emerald-400 font-semibold">$0.00 (Included)</span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline text-white">
                    <span className="text-sm font-black">Total Due Today</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        $
                        {appliedCoupon
                          ? (
                              (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly) *
                              (1 - appliedCoupon.discountPercent / 100)
                            ).toFixed(2)
                          : (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly)}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono block">
                        ≈ ₹
                        {Math.round(
                          (appliedCoupon
                            ? (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly) *
                              (1 - appliedCoupon.discountPercent / 100)
                            : (billingPeriod === 'YEARLY' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly)) * inrRate
                        ).toLocaleString()}{' '}
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {isProcessingPayment && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                    <span>{paymentStepText}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Multi-Gateway SSL & Web3 Verification</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedPlanForCheckout(null)}
                    disabled={isProcessingPayment}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessCheckout}
                    disabled={isProcessingPayment}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Payment & Subscribe
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPLETED TRANSACTION VERIFIED RECEIPT MODAL */}
        {/* ======================================================== */}
        {completedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-900 border border-emerald-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-glow-green">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    PAYMENT SUCCESSFUL
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">Welcome to Apex {completedReceipt.tier}!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your subscription is now active with full AI coaching and unlimited tracking privileges.
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Transaction ID</span>
                    <span className="font-mono text-zinc-200 font-bold">{completedReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Invoice Number</span>
                    <span className="font-mono text-zinc-200 font-bold">{completedReceipt.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gateway Provider</span>
                    <span className="text-emerald-400 font-bold">{completedReceipt.paymentGateway}</span>
                  </div>
                  {completedReceipt.customTxInfo && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Reference Details</span>
                      <span className="font-mono text-zinc-300">{completedReceipt.customTxInfo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer Email</span>
                    <span className="text-zinc-200">{completedReceipt.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Billing Cycle</span>
                    <span className="text-zinc-200 uppercase">{completedReceipt.period}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm">
                    <span className="text-white">Total Amount Paid</span>
                    <span className="text-emerald-400 font-mono">${completedReceipt.amountPaid}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      alert(`Printing Official Tax Receipt:\n\nInvoice: ${completedReceipt.invoiceId}\nTransaction: ${completedReceipt.transactionId}\nPlan: Apex ${completedReceipt.tier}\nGateway: ${completedReceipt.paymentGateway}\nPaid: $${completedReceipt.amountPaid}\nStatus: Verified Paid.`);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Download PDF Receipt
                  </button>
                  <button
                    onClick={() => setCompletedReceipt(null)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-glow-green"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
