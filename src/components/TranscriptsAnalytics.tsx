import React, { useState, useEffect } from 'react';
import { 
  FileText, Cpu, Zap, Clock, Activity, CheckCircle2, XCircle, 
  AlertTriangle, ShieldCheck, Database, Layers, ArrowRight, RefreshCw, BarChart2
} from 'lucide-react';
import { CallLog } from '../types';

export const TranscriptsAnalytics: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/call-logs');
      const data = await res.json();
      if (data.callLogs) {
        setCallLogs(data.callLogs);
        if (data.callLogs.length > 0) {
          setSelectedCall(data.callLogs[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch call logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Activity className="w-4 h-4" />
            <span>Telemetry, Call Analytics & Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Call Transcripts & System Analytics
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Review detailed conversation transcripts, latency breakdowns across the STT → LLM → TTS pipeline, and real estate AI voice architecture trade-offs.
          </p>
        </div>

        <button
          onClick={fetchCallLogs}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors shadow-sm shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* System Architecture Flow Visualizer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Voice Agent Architecture Flow
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            STT → LLM → RAG → Function Call → TTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
              <span>1. STT Speech Input</span>
              <span className="font-mono text-[10px] text-slate-400">~110ms</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Customer voice recorded via microphone or WebRTC phone line and converted to clean text tokens.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <div className="font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>2. Gemini LLM</span>
              <span className="font-mono text-[10px] text-slate-400">~275ms</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Maintains multi-turn context, applies sales persona, and determines required tool actions.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. RAG Retrieval</span>
              <span className="font-mono text-[10px] text-slate-400">~35ms</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Retrieves real verified property catalog listings to prevent hallucination of non-existent prices.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-2">
            <div className="font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between">
              <span>4. Tool Execution</span>
              <span className="font-mono text-[10px] text-slate-400">~40ms</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Executes backend functions like <code className="text-amber-300">book_site_visit</code> or <code className="text-amber-300">schedule_callback</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-2">
            <div className="font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
              <span>5. TTS Voice Output</span>
              <span className="font-mono text-[10px] text-slate-400">~130ms</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Synthesizes warm, polite speech audio sent back to customer earphone/speaker.
            </p>
          </div>

        </div>
      </div>

      {/* Advantages vs Disadvantages Comprehensive Matrix */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Voice Sales Agent Advantages & Disadvantages Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ADVANTAGES */}
          <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5" />
              <span>Key Advantages</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">24/7 Instant Availability:</strong>
                  Captures late-night and weekend real estate buyer leads with zero response delay.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Infinite Concurrent Scale:</strong>
                  Handles 100+ simultaneous phone calls during marketing campaigns without long call queues.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Saves Human Rep Time:</strong>
                  Filters out unqualified or casual browsers so human sales reps focus solely on hot visits.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Standardized Qualification:</strong>
                  Consistently captures budget, location, BHK requirements, and move timelines across every call.
                </div>
              </li>
            </ul>
          </div>

          {/* DISADVANTAGES & LIMITATIONS */}
          <div className="bg-slate-950 p-5 rounded-xl border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
              <XCircle className="w-5 h-5" />
              <span>Disadvantages & Trade-Offs</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Latency Overhead:</strong>
                  Combined delay across STT → LLM → TTS (~500ms) can create slight pauses compared to human speech.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">STT Accent & Noise Sensitivity:</strong>
                  Speech-to-Text can occasionally misunderstand heavy regional accents or background traffic noise.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Complex Emotional Negotiations:</strong>
                  Struggles with high-stakes price haggling or emotionally charged custom legal queries.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Ideal Application Scope:</strong>
                  Best suited for repetitive lead qualification in Real Estate, Banking, Insurance, and Automotive sales.
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Historical Call Logs & Transcripts Viewer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Historical Call Transcripts</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{callLogs.length} call records stored</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            Loading call transcripts...
          </div>
        ) : callLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No past calls recorded yet. Complete an AI call in the Live Voice tab!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Call List Column */}
            <div className="lg:col-span-5 space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {callLogs.map((call) => {
                const isSelected = selectedCall?.id === call.id;
                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{call.customerName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{call.customerPhone}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Outcome: <strong className="text-emerald-400">{call.qualificationResult}</strong></span>
                      <span>Duration: {call.durationSeconds}s</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Avg Latency: {call.latencyStats.totalMs}ms</span>
                      <span className="text-amber-400 font-bold">{call.functionCallsTriggered.length} Tool Calls</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Call Transcript Detail */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 max-h-[480px] overflow-y-auto">
              {selectedCall ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{selectedCall.customerName} - Phone Transcript</h4>
                      <p className="text-xs text-slate-400 font-mono">ID: {selectedCall.id} · Recorded: {new Date(selectedCall.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded border border-emerald-500/30">
                      {selectedCall.sentiment} Sentiment
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedCall.transcript.map((line, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg text-xs space-y-1 ${
                          line.sender === 'agent'
                            ? 'bg-slate-900 border border-slate-800 text-slate-200'
                            : line.sender === 'system'
                            ? 'bg-slate-950 border border-emerald-500/30 text-emerald-400 font-mono'
                            : 'bg-emerald-950/60 text-emerald-100 border border-emerald-500/20'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                          <span className="uppercase">{line.sender}</span>
                          <span className="font-mono">{line.time}</span>
                        </div>
                        <p className="leading-relaxed">{line.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Select a call log on the left to view transcript details.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
