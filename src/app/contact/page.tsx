'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl text-white">APEX<span className="text-emerald-400">FIT</span></span>
        </Link>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs">Launch App</Link>
      </header>

      <main className="max-w-xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">SUPPORT & INQUIRIES</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Get in touch with us</h1>
          <p className="text-xs text-zinc-400">Have questions about API integrations, enterprise coaching, or technical assistance?</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Dispatched!</h3>
              <p className="text-xs text-zinc-300">
                Thank you, <strong>{name}</strong>. Our athletic engineering support team will reply to <strong>{email}</strong> within 12 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Message Inquiry</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help optimize your fitness platform experience?"
                  required
                  rows={4}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
