import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Calendar, PhoneCall, Filter, Search, 
  MapPin, IndianRupee, Sparkles, CheckCircle2, AlertCircle, Clock,
  ArrowUpRight, RefreshCw, ChevronRight, Phone
} from 'lucide-react';
import { Lead } from '../types';

interface LeadsCRMProps {
  onStartCallWithLead?: (leadName: string, phone: string, location: string, budget: number) => void;
}

export const LeadsCRM: React.FC<LeadsCRMProps> = ({ onStartCallWithLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Hot Lead' | 'Warm Lead' | 'Cold Lead'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filterStatus === 'All' || lead.qualificationStatus === filterStatus;
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.locationPreference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalLeads = leads.length;
  const hotLeadsCount = leads.filter(l => l.qualificationStatus === 'Hot Lead').length;
  const bookedVisitsCount = leads.filter(l => l.bookedSiteVisit).length;
  const callbacksPendingCount = leads.filter(l => l.scheduledCallback).length;
  const avgBudgetLakhs = Math.round(
    leads.reduce((acc, curr) => acc + (curr.budgetLakhs || 0), 0) / (totalLeads || 1)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Users className="w-4 h-4" />
            <span>AI Sales Pipeline Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Qualified Leads CRM
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Real estate leads automatically qualified and scored during AI voice calls with booked site visits and callback schedules.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors shadow-sm shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Qualified Leads</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalLeads}</div>
          <p className="text-[11px] text-slate-400">Captured by AI Voice Agent</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Hot Prospects</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{hotLeadsCount}</div>
          <p className="text-[11px] text-emerald-400/80 font-medium">Lead score &gt; 85/100</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Site Visits Booked</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{bookedVisitsCount}</div>
          <p className="text-[11px] text-amber-300/80">Confirmed via function call</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Buyer Budget</span>
            <IndianRupee className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">₹{avgBudgetLakhs} L</div>
          <p className="text-[11px] text-slate-400">Target purchase budget</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
          {(['All', 'Hot Lead', 'Warm Lead', 'Cold Lead'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex-1 md:flex-initial ${
                filterStatus === status
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead name, location, or phone..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* Leads Table / Card List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading CRM leads from database...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No leads found matching criteria</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lead Name & Phone</th>
                  <th className="py-3.5 px-4">Qualification Status</th>
                  <th className="py-3.5 px-4">Lead Score</th>
                  <th className="py-3.5 px-4">Location & Budget</th>
                  <th className="py-3.5 px-4">Site Visit / Callback</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredLeads.map((lead) => {
                  const isHot = lead.qualificationStatus === 'Hot Lead';
                  const isWarm = lead.qualificationStatus === 'Warm Lead';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{lead.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{lead.phone}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isHot 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isWarm
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isHot ? 'bg-emerald-400' : isWarm ? 'bg-amber-400' : 'bg-slate-500'}`} />
                          {lead.qualificationStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isHot ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                              style={{ width: `${lead.leadScore || 70}%` }}
                            />
                          </div>
                          <span>{lead.leadScore || 70}/100</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-medium text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{lead.locationPreference}</span>
                        </div>
                        <div className="text-emerald-400 font-bold font-mono">
                          {lead.budgetLakhs ? `₹${lead.budgetLakhs} Lakhs (${lead.bedrooms || 2} BHK)` : 'Budget flexible'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {lead.bookedSiteVisit ? (
                          <div className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30 text-[11px] space-y-0.5">
                            <div className="font-bold text-emerald-300 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Site Visit Confirmed</span>
                            </div>
                            <div className="text-slate-300 font-mono">
                              {lead.bookedSiteVisit.date} @ {lead.bookedSiteVisit.time}
                            </div>
                          </div>
                        ) : lead.scheduledCallback ? (
                          <div className="bg-amber-950/60 p-2 rounded-lg border border-amber-500/30 text-[11px] space-y-0.5">
                            <div className="font-bold text-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Callback Scheduled</span>
                            </div>
                            <div className="text-slate-300 font-mono">
                              {lead.scheduledCallback.preferredTime}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">Qualified in Call</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                        {lead.lastConversationSnippet || 'Captured during voice call.'}
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Snippet
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                <p className="text-xs text-emerald-400 font-mono">{selectedLead.phone}</p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Location Preference</span>
                  <span className="font-bold text-white">{selectedLead.locationPreference}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Budget</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {selectedLead.budgetLakhs ? `₹${selectedLead.budgetLakhs} Lakhs` : 'Flexible'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Score</span>
                  <span className="font-bold text-white font-mono">{selectedLead.leadScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timeline</span>
                  <span className="font-bold text-white">{selectedLead.moveTimeline}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-300 mb-1">AI Agent Conversation Summary:</h5>
                <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                  "{selectedLead.lastConversationSnippet}"
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
