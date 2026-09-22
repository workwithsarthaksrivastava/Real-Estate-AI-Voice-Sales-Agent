import React, { useState } from 'react';
import { 
  Settings, Bot, Shield, Mic, Sparkles, Check, Save, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { PersonaConfig } from '../types';

interface PersonaStudioProps {
  personaConfig: PersonaConfig;
  onUpdateConfig: (newConfig: PersonaConfig) => void;
}

export const PersonaStudio: React.FC<PersonaStudioProps> = ({ personaConfig, onUpdateConfig }) => {
  const [formConfig, setFormConfig] = useState<PersonaConfig>({ ...personaConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConfig)
      });

      const data = await res.json();
      if (data.success) {
        onUpdateConfig(data.personaConfig || formConfig);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving persona config:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Settings className="w-4 h-4" />
            <span>AI Sales Persona & System Prompt Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Agent Persona & Guardrails
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Configure agent persona, voice model, conversational length limits, and strict business guardrails.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold animate-pulse">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Config Saved & Active</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Identity Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">1. Agent Identity & Agency Branding</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Agent Name</label>
              <input
                type="text"
                required
                value={formConfig.agentName}
                onChange={(e) => setFormConfig({ ...formConfig, agentName: e.target.value })}
                placeholder="e.g. Aria, Rohan, Maya"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Agency / Developer Name</label>
              <input
                type="text"
                required
                value={formConfig.agencyName}
                onChange={(e) => setFormConfig({ ...formConfig, agencyName: e.target.value })}
                placeholder="e.g. Horizon Realty, Prestige Group"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Tone & Voice Model Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mic className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">2. Conversational Tone & Voice Model</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Personality & Tone Style</label>
              <select
                value={formConfig.personalityTone}
                onChange={(e) => setFormConfig({ ...formConfig, personalityTone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Polite, Professional, & Consultative Sales Agent">Polite, Professional, & Consultative Sales Agent</option>
                <option value="High Energy Energetic Real Estate Sales Representative">High Energy Energetic Real Estate Sales Representative</option>
                <option value="Luxury Property Advisor & Concierge">Luxury Property Advisor & Concierge</option>
                <option value="Direct & Efficient Lead Qualifier">Direct & Efficient Lead Qualifier</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Voice Synthesis Preset</label>
              <select
                value={formConfig.voiceName}
                onChange={(e) => setFormConfig({ ...formConfig, voiceName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Kore">Kore (Warm, Professional Female - Default)</option>
                <option value="Zephyr">Zephyr (Clear, Friendly Female)</option>
                <option value="Puck">Puck (Polite, Energetic Male)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Strict Guardrails & Safety Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">3. System Guardrails & Hallucination Defense</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="font-bold text-white block">Strict Price & Property Guardrails</span>
                <p className="text-slate-400">
                  Enforces that the AI agent must never invent pricing or non-existent properties. All listings must come from the RAG store via tool calls.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formConfig.strictGuardrails}
                onChange={(e) => setFormConfig({ ...formConfig, strictGuardrails: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="block font-bold text-white">Spoken Utterance Constraints</label>
              <p className="text-slate-400">
                Limits response lengths so the spoken voice audio sounds natural on phone calls without long monologues.
              </p>
              <input
                type="text"
                value={formConfig.maxUtteranceLength}
                onChange={(e) => setFormConfig({ ...formConfig, maxUtteranceLength: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Agent Persona Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
