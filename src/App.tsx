import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveVoiceAgent } from './components/LiveVoiceAgent';
import { LeadsCRM } from './components/LeadsCRM';
import { PropertyCatalogRAG } from './components/PropertyCatalogRAG';
import { TranscriptsAnalytics } from './components/TranscriptsAnalytics';
import { PersonaStudio } from './components/PersonaStudio';
import { PersonaConfig } from './types';
import { Sparkles, CheckCircle2, Wrench, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'call' | 'leads' | 'catalog' | 'transcripts' | 'persona'>('call');
  const [isCallActive, setIsCallActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>({
    agentName: 'Aria',
    agencyName: 'Horizon Realty',
    personalityTone: 'Polite, Professional, & Consultative Sales Agent',
    voiceName: 'Kore',
    strictGuardrails: true,
    maxUtteranceLength: '1 to 3 concise, natural sentences suitable for phone audio',
    ragSensitivity: 'Strictly match verified property catalog; do not hallucinate prices'
  });

  // Fetch live system config from backend on load
  useEffect(() => {
    fetch('/api/system-config')
      .then(res => res.json())
      .then(data => {
        if (data.personaConfig) {
          setPersonaConfig(data.personaConfig);
        }
      })
      .catch(err => console.warn('Could not fetch initial persona config:', err));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      
      {/* Maintenance / Update Announcement Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center backdrop-blur-md">
        <Wrench className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
        <span>System Notice: This application is currently under update for now and will be fully functional very soon!</span>
      </div>

      {/* Top Header Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCallActive={isCallActive}
        agentName={personaConfig.agentName}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'call' && (
          <LiveVoiceAgent 
            personaConfig={personaConfig}
            onLeadCreated={() => triggerToast('New Qualified Lead Recorded in CRM!')}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsCRM 
            onStartCallWithLead={(name, phone, location, budget) => {
              setActiveTab('call');
              triggerToast(`Initiated outbound call simulation with ${name}`);
            }}
          />
        )}

        {activeTab === 'catalog' && (
          <PropertyCatalogRAG />
        )}

        {activeTab === 'transcripts' && (
          <TranscriptsAnalytics />
        )}

        {activeTab === 'persona' && (
          <PersonaStudio 
            personaConfig={personaConfig}
            onUpdateConfig={(newCfg) => {
              setPersonaConfig(newCfg);
              triggerToast('System Prompt & Persona Updated!');
            }}
          />
        )}
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>EstateVoice AI · Real Estate Voice Sales Agent · Under Scheduled Maintenance & Enhancements</p>
      </footer>

    </div>
  );
}
