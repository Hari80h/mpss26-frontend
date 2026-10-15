'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import { Search, Download, Filter, User, Building, Mail, Phone, Calendar, ChevronRight, X, Edit3, CheckCircle2, UserPlus } from 'lucide-react';
import { Lead, LeadStatus } from '../../types';

export const ExhibitorLeads: React.FC = React.memo(() => {
  const { leads, updateLeadStatus, showToast, setActiveExhibitorTab } = useStore();
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState('');

  // Status counts precomputed in a single pass
  const statusCounts = useMemo(() => {
    let newCount = 0;
    let interestedCount = 0;
    let followUpCount = 0;
    for (const l of leads) {
      if (l.status === 'New') newCount++;
      else if (l.status === 'Interested') interestedCount++;
      else if (l.status === 'Follow-up') followUpCount++;
    }
    return {
      all: leads.length,
      new: newCount,
      interested: interestedCount,
      followUp: followUpCount,
    };
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return leads.filter((lead) => {
      if (q) {
        const matches =
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.designation.toLowerCase().includes(q) ||
          lead.interests.some((i) => i.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (selectedStatusTab === 'All') return true;
      return lead.status === selectedStatusTab;
    });
  }, [leads, searchQuery, selectedStatusTab]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Designation', 'Email', 'Mobile', 'Status', 'Interests', 'Captured At', 'Notes'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.designation}"`,
      `"${l.email}"`,
      `"${l.mobile}"`,
      `"${l.status}"`,
      `"${l.interests.join('; ')}"`,
      `"${l.capturedAt}"`,
      `"${l.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `truechip-booth-leads-mpss26.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Leads exported successfully ✓', 'success');
  };

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotesText(lead.notes);
    setIsEditingNotes(false);
  };

  const handleSaveNotes = () => {
    if (!selectedLead) return;
    updateLeadStatus(selectedLead.id, selectedLead.status, editNotesText);
    setSelectedLead({ ...selectedLead, notes: editNotesText });
    setIsEditingNotes(false);
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    updateLeadStatus(selectedLead.id, newStatus);
    setSelectedLead({ ...selectedLead, status: newStatus });
  };

  return (
    <div className="flex-1 bg-[#F6F4F0] select-none pb-20 flex flex-col">
      {/* Rich Header Block */}
      <div className="bg-[#151515] px-5 pt-10 pb-12 text-white rounded-b-[32px] shadow-lg relative overflow-hidden shrink-0">
        {/* Soft Red Glow Background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-bl from-[#B51F32]/50 via-[#B51F32]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10 mb-2">
          <div>
            <h1 className="text-[28px] font-serif tracking-tight text-white leading-tight mb-1">
              Booth Leads
            </h1>
            <p className="text-[12px] text-gray-300 font-medium">
              {leads.length} captured leads at Truechip (Booth A-02)
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveExhibitorTab('scan')}
              className="h-10 px-3.5 bg-[#B51F32] hover:bg-[#9C1A2B] active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Save Lead</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="h-10 px-3.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 font-semibold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads by name, company, interest..."
          className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-[#DEDCD7] text-sm text-[#181818] focus:outline-none focus:ring-2 focus:ring-[#B51F32] transition-all shadow-sm"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-1.5 p-1 bg-[#EFEEEA] rounded-xl border border-[#DEDCD7] w-max min-w-full">
          {[
            { id: 'All', label: `All (${statusCounts.all})` },
            { id: 'New', label: `New (${statusCounts.new})` },
            { id: 'Interested', label: `Interested (${statusCounts.interested})` },
            { id: 'Follow-up', label: `Follow-up (${statusCounts.followUp})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-center transition-all whitespace-nowrap ${
                selectedStatusTab === tab.id
                  ? 'bg-white text-[#181818] shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#181818]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#DEDCD7]">
            <p className="text-base font-semibold text-[#181818]">No leads match your filter</p>
            <p className="text-sm text-[#6B6B6B] mt-2">
              Scan attendees from the SCAN tab to capture new leads.
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => handleOpenLead(lead)}
              className="bg-white px-4 py-4 rounded-2xl border border-[#DEDCD7] hover:border-[#B51F32]/30 transition-all cursor-pointer flex items-center gap-3"
            >
              {/* Avatar */}
              {lead.avatar ? (
                <img src={lead.avatar} alt={lead.name} className="w-11 h-11 rounded-full object-cover shrink-0 shadow-sm border border-gray-200" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-[#181818] truncate">{lead.name}</h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">
                  {lead.designation} · <strong className="text-[#181818]">{lead.company}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${
                  lead.status === 'New'
                    ? 'bg-green-50 text-[#2F7D58] border-green-200'
                    : lead.status === 'Interested'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : lead.status === 'Follow-up'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-gray-50 text-[#6B6B6B] border-gray-200'
                }`}
              >
                {lead.status}
              </span>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-3.5 space-y-3 shadow-2xl border border-[#DEDCD7]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-2 border-b border-[#DEDCD7]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B6B6B] block mb-0.5">
                  Lead Detail
                </span>
                <h2 className="text-xl font-serif text-[#181818] leading-tight">{selectedLead.name}</h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-full bg-gray-50 text-[#6B6B6B] hover:text-[#181818] hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile & Consent-Respected Contacts */}
            <div className="bg-[#F6F4F0] p-2.5 rounded-[14px] border border-[#DEDCD7] space-y-2">
              <p className="font-semibold text-[#181818] text-sm">
                {selectedLead.designation} · {selectedLead.company}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-[#DEDCD7]/60 text-[13px] text-[#6B6B6B]">
                <div className="flex justify-between items-center gap-2">
                  <span>Email:</span>
                  <strong className="text-[#181818] truncate">{selectedLead.email}</strong>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span>Mobile:</span>
                  <strong className="text-[#181818]">{selectedLead.mobile}</strong>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span>Source:</span>
                  <span className="text-[#181818] font-medium bg-white px-2 py-0.5 rounded-md border border-[#DEDCD7] text-xs">
                    {selectedLead.source}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Status */}
            <div>
              <label className="block text-[13px] font-semibold text-[#181818] mb-1.5">
                Qualification Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['New', 'Interested', 'Follow-up'] as LeadStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 px-2 rounded-[10px] text-xs font-semibold border transition-all ${
                      selectedLead.status === st
                        ? 'bg-[#181818] text-white border-[#181818] shadow-sm'
                        : 'bg-white text-[#6B6B6B] border-[#DEDCD7] hover:bg-[#F6F4F0]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Section with In-place Edit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#181818]">
                  Conversation Notes
                </label>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-[11px] text-[#181818] bg-white border border-[#DEDCD7] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 hover:bg-[#F6F4F0] transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={editNotesText}
                    onChange={(e) => setEditNotesText(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-2xl bg-white border border-[#DEDCD7] text-sm text-[#181818] focus:outline-none focus:border-[#181818] resize-none shadow-sm"
                    placeholder="Enter conversation notes here..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl text-sm font-semibold text-[#181818]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-[#181818] hover:bg-black transition-colors text-white rounded-xl text-sm font-semibold shadow-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F6F4F0] rounded-2xl border border-[#DEDCD7] text-sm text-[#181818] leading-relaxed min-h-[60px]">
                  {selectedLead.notes || <span className="text-[#6B6B6B] italic">No notes added yet.</span>}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-1">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full h-12 bg-[#181818] hover:bg-black active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ExhibitorLeads.displayName = 'ExhibitorLeads';
