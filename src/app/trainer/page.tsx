'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  MessageSquare,
  Dumbbell,
  Video,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function TrainerPortalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState('');

  const [showApptModal, setShowApptModal] = useState(false);
  const [apptTitle, setApptTitle] = useState('Form Check & Macro Consultation');
  const [apptDateTime, setApptDateTime] = useState('2026-11-15 17:00');

  const fetchTrainerData = async () => {
    try {
      const res = await fetch('/api/trainer');
      const json = await res.json();
      setData(json);
      if (json.clients?.length > 0 && !selectedClient) {
        setSelectedClient(json.clients[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerData();
  }, []);

  // Fetch messages whenever selected client changes
  useEffect(() => {
    if (selectedClient) {
      fetch(`/api/trainer/messages?peerId=${selectedClient.client_id}`)
        .then(res => res.json())
        .then(json => {
          if (json.messages) setMessages(json.messages);
        })
        .catch(() => {});
    }
  }, [selectedClient]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !selectedClient || sendingMsg) return;
    setSendingMsg(true);

    try {
      const res = await fetch('/api/trainer/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedClient.client_id,
          content: newMessageText.trim()
        })
      });
      const json = await res.json();
      if (json.message) {
        setMessages(prev => [...prev, json.message]);
        setNewMessageText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleAssignRoutine = async () => {
    if (!selectedClient || !selectedRoutineId) return;

    try {
      const res = await fetch('/api/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_routine',
          clientId: selectedClient.client_id,
          routineId: selectedRoutineId
        })
      });
      if (res.ok) {
        setShowAssignModal(false);
        alert('Routine successfully assigned to client!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedClient || !apptTitle || !apptDateTime) return;

    try {
      const res = await fetch('/api/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_appointment',
          clientId: selectedClient.client_id,
          title: apptTitle,
          dateTime: apptDateTime,
          durationMin: 45
        })
      });
      if (res.ok) {
        setShowApptModal(false);
        fetchTrainerData();
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-400" />
              Coach & Personal Trainer Portal
            </h1>
            <p className="text-xs text-zinc-400">Athlete roster management, customized curriculum assignments, and video appointments</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Assign Routine
            </button>
            <button
              onClick={() => setShowApptModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
            >
              <Video className="w-4 h-4" />
              Book Video Session
            </button>
          </div>
        </div>

        {/* Client Roster List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.clients?.map((c: any) => (
            <div
              key={c.client_id}
              onClick={() => setSelectedClient(c)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                selectedClient?.client_id === c.client_id
                  ? 'bg-zinc-900 border-emerald-500 shadow-glow-green'
                  : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-zinc-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    {c.subscription_tier}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-zinc-300">
                <p>Weight: <strong className="text-white">{c.current_weight_kg} kg</strong> → Target: <strong className="text-emerald-400">{c.target_weight_kg} kg</strong></p>
                <p>Goal: <span className="capitalize">{c.fitness_goal?.replace('_', ' ')}</span></p>
                <p>Consistency: 🔥 {c.current_streak} days active</p>
              </div>
            </div>
          ))}
        </div>

        {/* Client Detail & Direct 1-on-1 Chat */}
        {selectedClient && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Cols: Client Overview & Notes */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">ATHLETE PROFILE</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedClient.name}</h3>
                <p className="text-xs text-zinc-400">{selectedClient.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Experience Level:</span>
                  <span className="font-bold text-white capitalize">{selectedClient.experience_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Current Weight:</span>
                  <span className="font-bold text-white">{selectedClient.current_weight_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Weight:</span>
                  <span className="font-bold text-emerald-400">{selectedClient.target_weight_kg} kg</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-zinc-300 block mb-1">Trainer Coaching Notes</span>
                <p className="text-xs text-zinc-400 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 italic">
                  "{selectedClient.trainer_notes || 'Focusing on progressive overload and high protein adherence.'}"
                </p>
              </div>

              {/* Upcoming Appointments */}
              <div>
                <span className="text-xs font-bold text-zinc-300 block mb-2">Scheduled Coaching Calls</span>
                <div className="space-y-2">
                  {data.appointments?.map((appt: any) => (
                    <div key={appt.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                      <div className="flex justify-between items-baseline">
                        <strong className="text-white">{appt.title}</strong>
                        <span className="text-[10px] text-emerald-400 font-mono">{appt.date_time}</span>
                      </div>
                      <a
                        href={appt.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        Launch Google Meet <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 8 Cols: Direct 1-on-1 Chat Box */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col h-[520px]">
              <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Direct Coaching Chat with {selectedClient.name}
                  </h4>
                  <p className="text-xs text-zinc-400">Encrypted trainer-client channel</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-10">No messages yet. Send a greeting to {selectedClient.name}!</p>
                ) : (
                  messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-lg ${m.sender_id === selectedClient.client_id ? 'mr-auto items-start' : 'ml-auto items-end'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                          m.sender_id === selectedClient.client_id
                            ? 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                            : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-tr-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 px-1">
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="pt-3 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Send feedback or workout cues to ${selectedClient.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMsg || !newMessageText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Routine Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Assign Routine to {selectedClient?.name}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Select Routine Template</label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {data.routines?.map((r: any) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoutineId(r.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRoutineId === r.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{r.title}</p>
                    <p className="text-[10px] text-zinc-400">{r.category} • ~{r.estimated_duration_min} min</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAssignRoutine}
                disabled={!selectedRoutineId}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs"
              >
                Confirm Routine Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Scheduler Modal */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Schedule Video Coaching Call</h3>
              <button onClick={() => setShowApptModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Session Title</label>
                <input
                  type="text"
                  value={apptTitle}
                  onChange={(e) => setApptTitle(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Date & Time</label>
                <input
                  type="text"
                  value={apptDateTime}
                  onChange={(e) => setApptDateTime(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  placeholder="YYYY-MM-DD HH:MM"
                />
              </div>

              <button
                onClick={handleCreateAppointment}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-glow-green"
              >
                Schedule & Send Calendar Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
