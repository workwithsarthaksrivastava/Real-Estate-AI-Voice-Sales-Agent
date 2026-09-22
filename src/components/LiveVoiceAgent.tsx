import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Send, 
  Building2, Calendar, Clock, Zap, Cpu, Sparkles, CheckCircle2,
  ChevronRight, ArrowUpRight, Play, RefreshCw
} from 'lucide-react';
import { TranscriptMessage, Property, LatencyStats, PersonaConfig } from '../types';

interface LiveVoiceAgentProps {
  personaConfig: PersonaConfig;
  onLeadCreated: () => void;
}

export const LiveVoiceAgent: React.FC<LiveVoiceAgentProps> = ({ personaConfig, onLeadCreated }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [voiceVolume, setVoiceVolume] = useState(1);
  
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      text: `Hello! This is ${personaConfig.agentName} from ${personaConfig.agencyName}. I am your AI property consultant. How can I assist with your home search today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  ]);

  const [currentLatency, setCurrentLatency] = useState<LatencyStats>({
    sttMs: 115,
    llmMs: 275,
    toolMs: 40,
    ttsMs: 130,
    totalMs: 560
  });

  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Timer effect for call duration
  useEffect(() => {
    let interval: any = null;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isProcessing]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcriptText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcriptText += event.results[i][0].transcript;
        }
        setTextInput(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert('Browser speech recognition is not supported in this browser. You can type or use quick prompts!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTextInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-Speech playback helper
  const speakAgentResponse = async (text: string) => {
    if (isMuted) return;

    // Try Gemini TTS first via backend
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: personaConfig.voiceName })
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.volume = voiceVolume;
        audio.play();
        return;
      }
    } catch (e) {
      console.warn('Backend TTS error, falling back to Web Speech API', e);
    }

    // Web Speech API fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = voiceVolume;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (userMsgText?: string) => {
    const msgToSend = userMsgText || textInput;
    if (!msgToSend.trim() || isProcessing) return;

    if (!isCallActive) {
      setIsCallActive(true);
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userMsg: TranscriptMessage = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      text: msgToSend.trim(),
      time: nowTime
    };

    setTranscript(prev => [...prev, userMsg]);
    setTextInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgToSend,
          history: transcript.filter(m => m.sender !== 'system'),
          customPersona: personaConfig
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Server error');
      }

      // Update latency stats
      if (data.latencyStats) {
        setCurrentLatency(data.latencyStats);
      }

      // Insert system logs for tool calls executed
      if (data.triggeredFunctions && data.triggeredFunctions.length > 0) {
        data.triggeredFunctions.forEach((tf: any) => {
          const systemMsg: TranscriptMessage = {
            id: `sys-${Date.now()}-${Math.random()}`,
            sender: 'system',
            text: `Tool Triggered: ${tf.name}(${JSON.stringify(tf.args)})`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            toolCall: tf
          };
          setTranscript(prev => [...prev, systemMsg]);
        });
      }

      // Update recommended properties
      if (data.propertyResults && data.propertyResults.length > 0) {
        setRecommendedProperties(data.propertyResults);
      }

      // Trigger CRM lead update notification if lead was created
      if (data.leadCreatedOrUpdated) {
        onLeadCreated();
      }

      // Agent Reply
      const agentMsg: TranscriptMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        recommendedProperties: data.propertyResults && data.propertyResults.length > 0 ? data.propertyResults : undefined
      };

      setTranscript(prev => [...prev, agentMsg]);
      speakAgentResponse(data.replyText);

    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: TranscriptMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: `Error processing request: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setTranscript(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presetPrompts = [
    "I need a 2BHK on Kolar Road, budget 40 lakh.",
    "Looking for a 3BHK luxury villa in Arera Colony under 1.5 Cr with swimming pool.",
    "Can I schedule a site visit for Green Valley Heights 2BHK this Saturday at 11 AM?",
    "Please have a human sales manager call me back tomorrow at 4 PM. My name is Vikram.",
    "Show me affordable properties near Hoshangabad Road under 35 Lakhs."
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Interactive Banner / Architecture Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/80 shadow-xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Zap className="w-4 h-4" />
            <span>Autonomous AI Sales Agent Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Real Estate Voice Sales Call
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Multi-turn phone sales agent qualifying leads in real-time. Features RAG property catalog search, function calling for appointment booking, and real-time latency optimization.
          </p>
        </div>

        {/* Call State Quick Control Card */}
        <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 shrink-0 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/src/assets/images/agent_avatar_female_1790110014374.jpg" 
                alt="Aria AI Agent" 
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
              />
              {isCallActive && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{personaConfig.agentName}</div>
              <div className="text-xs text-emerald-400 font-medium">{personaConfig.agencyName} Voice AI</div>
            </div>
          </div>

          <button
            onClick={() => setIsCallActive(!isCallActive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
              isCallActive 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/30'
            }`}
          >
            {isCallActive ? (
              <>
                <PhoneOff className="w-4 h-4" />
                <span>End Call ({formatDuration(callDuration)})</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>Start Call</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Phone/Visualizer + Right Live Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Phone Agent UI + Latency Gauge */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Phone Dial Visualizer Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl flex flex-col items-center justify-between relative overflow-hidden min-h-[440px]">
            {/* Background Ambient Pulse Glow */}
            {isCallActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none animate-pulse" />
            )}

            {/* Top Call Status Bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <span className="font-semibold text-slate-300">
                  {isCallActive ? 'ACTIVE PHONE CALL' : 'STANDBY MODE'}
                </span>
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                {isCallActive ? formatDuration(callDuration) : '00:00'}
              </div>
            </div>

            {/* Center Agent Visualizer Avatar */}
            <div className="my-6 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                {/* Audio Wave Ring Animation */}
                {isCallActive && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                    <div className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse" />
                  </>
                )}
                <img 
                  src="/src/assets/images/agent_avatar_female_1790110014374.jpg" 
                  alt="Aria AI Agent" 
                  className={`w-32 h-32 rounded-full object-cover border-4 transition-all duration-300 shadow-2xl relative z-10 ${
                    isCallActive ? 'border-emerald-400 shadow-emerald-500/30 scale-105' : 'border-slate-700'
                  }`}
                />
              </div>

              <div className="text-center space-y-1 z-10">
                <h3 className="text-xl font-bold text-white">{personaConfig.agentName}</h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {isProcessing ? 'AI Agent Reasoning & Function Calling...' : isCallActive ? 'Listening to Customer Voice...' : 'Tap Start Call to Connect'}
                </p>
              </div>

              {/* Dynamic Sound Wave Bars */}
              {isCallActive && (
                <div className="flex items-center justify-center gap-1.5 h-8 my-2">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 35, 70].map((h, idx) => (
                    <div 
                      key={idx}
                      className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150 animate-bounce"
                      style={{ 
                        height: isProcessing ? `${(h * 0.4)}%` : `${h}%`,
                        animationDelay: `${idx * 80}ms` 
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Call Controls */}
            <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-around gap-4 z-10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition-colors ${
                  isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={isMuted ? "Unmute Agent Voice" : "Mute Agent Voice"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMicListening}
                className={`p-4 rounded-full transition-all shadow-lg ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-900/50' 
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-950/40'
                }`}
                title={isListening ? "Stop Microphone" : "Speak into Microphone (STT)"}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setTranscript([])}
                className="p-3.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Clear Call Transcript"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Latency & Pipeline Metrics Box */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Voice Pipeline Latency Meter</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Total: {currentLatency.totalMs}ms
              </span>
            </div>

            {/* Latency Segment Bars */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>1. STT Speech-To-Text</span>
                  <span className="font-mono text-slate-200">{currentLatency.sttMs} ms</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, (currentLatency.sttMs / 600) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>2. LLM Reasoning & RAG</span>
                  <span className="font-mono text-slate-200">{currentLatency.llmMs} ms</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (currentLatency.llmMs / 600) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>3. Function Calling & Database</span>
                  <span className="font-mono text-slate-200">{currentLatency.toolMs} ms</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, (currentLatency.toolMs / 600) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>4. TTS Voice Synthesis</span>
                  <span className="font-mono text-slate-200">{currentLatency.ttsMs} ms</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.min(100, (currentLatency.ttsMs / 600) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Transcript Feed + Interactive Input */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* Transcript Feed Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl flex-1 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Live Phone Transcript & Function Execution</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {transcript.length} turns recorded
              </span>
            </div>

            {/* Scrollable Conversation Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[520px]">
              {transcript.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="bg-slate-950/80 rounded-xl p-3 border border-emerald-500/30 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>FUNCTION CALL EXECUTED</span>
                        </div>
                        <span className="text-slate-500">{msg.time}</span>
                      </div>
                      <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                const isAgent = msg.sender === 'agent';

                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col space-y-1.5 ${isAgent ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
                      <span className="font-semibold text-slate-300">
                        {isAgent ? `${personaConfig.agentName} (${personaConfig.agencyName})` : 'Customer'}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">{msg.time}</span>
                    </div>

                    <div 
                      className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed ${
                        isAgent
                          ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/80 shadow-md'
                          : 'bg-emerald-600 text-white rounded-tr-none shadow-md font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Property Recommendation Carousel inside transcript */}
                    {msg.recommendedProperties && msg.recommendedProperties.length > 0 && (
                      <div className="w-full mt-3 space-y-2 bg-slate-950/90 p-3.5 rounded-xl border border-emerald-500/30">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>RAG Property Search Results ({msg.recommendedProperties.length})</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {msg.recommendedProperties.map((prop) => (
                            <div key={prop.id} className="bg-slate-900 rounded-lg p-2.5 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-colors">
                              <img 
                                src={prop.imageUrl} 
                                alt={prop.title} 
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white line-clamp-1">{prop.title}</h5>
                                <p className="text-[11px] text-slate-400">{prop.location} · {prop.bedrooms} BHK</p>
                              </div>
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                                <span className="font-bold text-emerald-400">{prop.priceDisplay}</span>
                                <button
                                  onClick={() => handleSendMessage(`I want to book a site visit for ${prop.title}`)}
                                  className="text-[10px] font-bold px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                                >
                                  Book Visit
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono py-2 bg-slate-950/50 px-3 rounded-lg border border-slate-800 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{personaConfig.agentName} is analyzing RAG database & generating voice response...</span>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Quick Prompt Presets */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Test Customer Query Presets:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presetPrompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(promptText)}
                    disabled={isProcessing}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left truncate max-w-xs"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Input Field */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening... Speak now" : "Type customer message e.g. 'I need a 2BHK on Kolar Road'"}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <button
                onClick={toggleMicListening}
                className={`p-3 rounded-xl transition-colors ${
                  isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Microphone Input"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={!textInput.trim() || isProcessing}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
