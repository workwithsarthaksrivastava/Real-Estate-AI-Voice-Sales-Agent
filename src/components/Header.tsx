import React from 'react';
import { PhoneCall, Users, Building2, FileText, Settings, Bot } from 'lucide-react';

interface HeaderProps {
  activeTab: 'call' | 'leads' | 'catalog' | 'transcripts' | 'persona';
  setActiveTab: (tab: 'call' | 'leads' | 'catalog' | 'transcripts' | 'persona') => void;
  isCallActive: boolean;
  agentName: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isCallActive, agentName }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single Wordmark Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('call'); }}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors"
            >
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <Bot className="w-5 h-5" />
              </span>
              <span>EstateVoice AI</span>
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('call')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'call'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Voice Agent Call</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'leads'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Qualified Leads CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>RAG Property Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('transcripts')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'transcripts'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Transcripts & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'persona'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Persona Studio</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Call Status */}
          <div className="flex items-center gap-3 shrink-0">
            {isCallActive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 text-xs font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>In Live Call ({agentName})</span>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('call')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Start AI Call</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/80 px-2 py-2 border-t border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('call')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-colors ${
            activeTab === 'call' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call</span>
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-colors ${
            activeTab === 'leads' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-colors ${
            activeTab === 'catalog' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab('transcripts')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-colors ${
            activeTab === 'transcripts' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('persona')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-colors ${
            activeTab === 'persona' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Persona</span>
        </button>
      </div>
    </header>
  );
};
