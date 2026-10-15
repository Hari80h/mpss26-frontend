'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import {
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  UserPlus
} from 'lucide-react';
import { Person, Lead, LeadStatus } from '../../types';

export const ExhibitorScan: React.FC = React.memo(() => {
  const {
    attendees,
    currentUser,
    leads,
    saveLead,
    setActiveExhibitorTab,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('Interested');
  const [notes, setNotes] = useState('');

  // Fast O(1) lead lookup map
  const leadMap = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const l of leads) {
      map.set(l.personId, l);
    }
    return map;
  }, [leads]);

  // Combine attendees (delegates, speakers, VIPs, guests)
  const allCandidates: Person[] = useMemo(() => [
    ...(currentUser ? [currentUser] : []),
    ...attendees.filter((a) => a.id !== currentUser?.id && a.role !== 'exhibitor_staff'),
  ], [currentUser, attendees]);

  // Filter candidates based on search query and role filter
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCandidates.filter((p) => {
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.designation.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedRoleFilter === 'Delegates') return p.role === 'delegate';
      if (selectedRoleFilter === 'VIP & Speakers') return p.role === 'vip' || p.role === 'speaker';
      return true;
    });
  }, [allCandidates, searchQuery, selectedRoleFilter]);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    const existing = leadMap.get(person.id);
    if (existing) {
      setSelectedStatus(existing.status);
      setNotes(existing.notes || '');
    } else {
      setSelectedStatus('Interested');
      setNotes('');
    }
  };

  const handleSaveLead = () => {
    if (!selectedPerson) return;

    const emailToUse = selectedPerson.privacy?.shareEmail !== false ? selectedPerson.email : 'contact@eventsphere.internal';
    const mobileToUse = selectedPerson.privacy?.sharePhone !== false ? selectedPerson.mobile : '+91 98765 00000';
    const linkedinToUse = selectedPerson.privacy?.shareLinkedIn !== false ? (selectedPerson.linkedin || '') : '';

    const existingLead = leadMap.get(selectedPerson.id);

    saveLead({
      personId: selectedPerson.id,
      name: selectedPerson.name,
      avatar: selectedPerson.avatar,
      company: selectedPerson.company,
      designation: selectedPerson.designation,
      email: emailToUse,
      mobile: mobileToUse,
      linkedin: linkedinToUse,
      source: 'Booth Lead Capture (Hall 1 · A-02)',
      status: selectedStatus,
      interests: existingLead?.interests || ['PCIe Gen 6 / 7 VIP', 'UCIe Chiplet VIP'],
      notes: notes.trim(),
      boothId: 'Hall 1 · A-02',
      productsViewed: existingLead?.productsViewed || [],
    });

    // Reset selection and navigate to Leads tab
    setSelectedPerson(null);
    setSearchQuery('');
    setActiveExhibitorTab('leads');
  };

  const leadTypes: LeadStatus[] = ['New', 'Interested', 'Follow-up'];

  return (
    <div className="flex-1 bg-[#F6F4F0] select-none pb-24 flex flex-col min-h-full">
      {/* Simple, Clean Header */}
      <div className="bg-[#151515] px-5 pt-8 pb-9 text-white rounded-b-[24px] shadow-sm relative overflow-hidden shrink-0">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-white tracking-tight leading-none mb-1">
              {selectedPerson ? 'Save Lead' : 'Select Attendee'}
            </h1>
            <p className="text-xs text-gray-400">
              {selectedPerson ? 'Hall 1 · Booth A-02' : 'Choose an attendee to add to Truechip leads'}
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedPerson) {
                setSelectedPerson(null);
              } else {
                setActiveExhibitorTab('home');
              }
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-colors shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-4 -mt-4 relative z-20 flex-1 flex flex-col space-y-4">
        {!selectedPerson ? (
          /* ============================================================== */
          /* Step 1: Attendee Directory                                     */
          /* ============================================================== */
          <>
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendees by name, company, title..."
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-[#DEDCD7] text-xs text-[#181818] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-1 focus:ring-[#9E1B2D] transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#EBE7E0] rounded-xl border border-[#DEDCD7]">
              {['All', 'Delegates', 'VIP & Speakers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedRoleFilter(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                    selectedRoleFilter === tab
                      ? 'bg-white text-[#181818] shadow-xs'
                      : 'text-[#6B6B6B] hover:text-[#181818]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Attendee Cards List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5 no-scrollbar">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[11px] font-semibold text-[#8A8A8A]">
                  Attendees ({filteredCandidates.length})
                </span>
                <span className="text-[11px] text-[#6B6B6B]">Tap to select</span>
              </div>

              {filteredCandidates.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#DEDCD7] shadow-xs">
                  <p className="text-sm font-semibold text-[#181818]">No attendees found</p>
                  <p className="text-xs text-[#8A8A8A] mt-1">Try another search keyword or filter</p>
                </div>
              ) : (
                filteredCandidates.map((person) => {
                  const existingLead = leadMap.get(person.id);

                  return (
                    <div
                      key={person.id}
                      onClick={() => handleSelectPerson(person)}
                      className="bg-white p-3 rounded-xl border border-[#DEDCD7] hover:border-gray-400 cursor-pointer transition-all flex items-center justify-between group active:scale-[0.99] shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {person.avatar ? (
                          <img
                            src={person.avatar}
                            alt={person.name}
                            loading="lazy"
                            decoding="async"
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {person.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-semibold text-[#181818] truncate leading-tight group-hover:text-[#9E1B2D] transition-colors">
                              {person.name}
                            </h3>
                            {person.role === 'vip' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded-md shrink-0">
                                VIP
                              </span>
                            )}
                            {person.role === 'speaker' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#E0E7FF] text-[#3730A3] rounded-md shrink-0">
                                Speaker
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B6B6B] truncate mt-0.5">
                            {person.designation} · <strong className="text-[#181818] font-medium">{person.company}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {existingLead ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              existingLead.status === 'Interested'
                                ? 'bg-amber-100 text-amber-800'
                                : existingLead.status === 'Follow-up'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {existingLead.status}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-[#9E1B2D] group-hover:underline flex items-center gap-0.5">
                            Select <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* ============================================================== */
          /* Step 2: Save Lead Form (Simple, clean, cohesive)               */
          /* ============================================================== */
          <div className="space-y-4">
            {/* Unified Card */}
            <div className="bg-white rounded-2xl border border-[#DEDCD7] p-4 shadow-xs space-y-4">
              {/* Selected Contact Row */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EEEA]">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedPerson.avatar ? (
                    <img
                      src={selectedPerson.avatar}
                      alt={selectedPerson.name}
                      loading="lazy"
                      decoding="async"
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {selectedPerson.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#181818] leading-tight truncate">
                      {selectedPerson.name}
                    </h3>
                    <p className="text-xs text-[#6B6B6B] truncate mt-0.5">
                      {selectedPerson.designation} · <strong className="text-[#181818] font-semibold">{selectedPerson.company}</strong>
                    </p>
                    <p className="text-[11px] text-[#8A8A8A] truncate mt-0.5">
                      {selectedPerson.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPerson(null)}
                  className="text-xs font-semibold text-[#9E1B2D] hover:underline shrink-0 ml-3 py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Lead Type */}
              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-2">
                  Lead Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {leadTypes.map((type) => {
                    const isSelected = selectedStatus === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedStatus(type)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? 'bg-[#181818] text-white border-[#181818] shadow-xs'
                            : 'bg-[#FAF9F6] text-[#555] border-[#DEDCD7] hover:bg-white hover:border-gray-400'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes... (optional)"
                  className="w-full p-3 rounded-xl bg-[#FAF9F6] border border-[#DEDCD7] text-xs text-[#181818] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#181818] focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveLead}
              className="w-full h-12 bg-[#9E1B2D] hover:bg-[#8A1625] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Save Lead</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ExhibitorScan.displayName = 'ExhibitorScan';
