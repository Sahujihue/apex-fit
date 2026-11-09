'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Dumbbell,
  ShieldAlert,
  Flame,
  Plus,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function CoachPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [splitType, setSplitType] = useState('Push/Pull/Legs');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/coach');
      const json = await res.json();
      if (json.messages) {
        setMessages(json.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || sending) return;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    if (!customText) setInputMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const json = await res.json();
      if (json.assistantMessage) {
        setMessages(prev => [...prev, json.assistantMessage]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_plan', splitType })
      });
      const json = await res.json();
      if (json.plan) {
        setGeneratedPlan(json.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const samplePrompts = [
    'How should I adjust my routine for tight hip flexors and lower back?',
    'What is the most effective progressive overload scheme for bench press?',
    'Calculate my exact cutting macros and refeed strategy for 78kg bodyweight.',
    'I only have 30 minutes today. Give me an intense dumbbell superset session.'
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-400" />
              Apex AI Personal Fitness Coach
            </h1>
            <p className="text-xs text-zinc-400">Sports science intelligence, dynamic workout adjustments, and nutrition strategy</p>
          </div>

          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-xs transition-all shadow-glow-purple self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate Complete AI Training Program
          </button>
        </div>

        {/* Medical & Health Outcome Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Sports Science Guidance Disclaimer:</strong> Apex Coach provides exercise programming and sports nutrition guidance based on biomechanics and published exercise physiology. It does not provide medical diagnosis or replace personalized medical counsel. Always listen to your body and warm up adequately.
          </span>
        </div>

        {/* Chat Window */}
        <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex flex-col h-[650px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || i}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-emerald-500 text-zinc-950 shadow-glow-green'
                        : 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                    }`}
                  >
                    {isUser ? 'ME' : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-zinc-100 rounded-tr-none'
                        : 'bg-zinc-950/80 border border-zinc-800 text-zinc-200 rounded-tl-none prose prose-invert max-w-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <span className="block text-[10px] text-zinc-500 mt-2 text-right">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  Apex Coach is formulating your progressive plan...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/50 flex gap-2 overflow-x-auto">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-all whitespace-nowrap shrink-0"
              >
                💬 {p}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Apex Coach anything (e.g. adjust exercises, macros, progressive overload, recovery)..."
                className="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-glow-purple flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask Coach</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Full AI Workout Plan Generator Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Workout Plan Generator
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {!generatedPlan ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Apex AI compiles your biometric anthropometry, current lifting baseline, and selected split schedule into a 8-week progressive overload curriculum.
                </p>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Choose Split Protocol</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {['Push/Pull/Legs', 'Upper/Lower', 'Full Body Blitz', 'Home Dumbbell'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSplitType(s)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          splitType === s
                            ? 'bg-purple-600/30 border-purple-500 text-white'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-xs transition-all shadow-glow-purple flex items-center justify-center gap-2"
                >
                  {generatingPlan ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating Scientific 8-Week Training Block...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Custom Program
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-purple-500/40">
                  <h4 className="text-base font-extrabold text-white">{generatedPlan.title}</h4>
                  <p className="text-xs text-zinc-300 mt-1">{generatedPlan.overview}</p>
                  <div className="flex gap-3 text-xs text-zinc-400 mt-2 font-mono">
                    <span>Duration: {generatedPlan.durationWeeks} Weeks</span>
                    <span>•</span>
                    <span>Frequency: {generatedPlan.frequency}</span>
                  </div>
                </div>

                {/* Training Days */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Weekly Workout Schedule</h5>
                  {generatedPlan.schedule?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs font-bold text-emerald-400">{item.day} — {item.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{item.exercises?.length || 0} exercises</span>
                      </div>
                      <div className="space-y-1">
                        {item.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs text-zinc-300">
                            <span>• {ex.name}</span>
                            <span className="text-zinc-400 font-mono">{ex.sets} (Rest: {ex.rest})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setGeneratedPlan(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700"
                  >
                    Adjust Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowPlanModal(false);
                      setGeneratedPlan(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                  >
                    Adopt Program to Dashboard ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
