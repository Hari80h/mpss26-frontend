'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { RECOMMENDED_PEOPLE_IDS } from '../../lib/mockData';
import { Person } from '../../types';

export const DelegatePeople: React.FC = () => {
  const router = useRouter();
  const {
    attendees,
    currentUser,
    setSelectedPersonId,
    setActiveDelegateTab,
    viewSavedPeopleOnly,
    setViewSavedPeopleOnly,
    savedPeopleIds,
    toggleSavePerson,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Strictly the 10 curated speakers for People You Should Meet
  const baseList = useMemo(() => {
    if (viewSavedPeopleOnly) {
      return attendees.filter((p) => savedPeopleIds.includes(p.id));
    }
    return RECOMMENDED_PEOPLE_IDS.map((id) =>
      attendees.find((a) => a.id === id)
    ).filter(Boolean) as Person[];
  }, [attendees, viewSavedPeopleOnly, savedPeopleIds]);

  const [serverResults, setServerResults] = useState<Person[] | null>(null);

  React.useEffect(() => {
    if (!searchQuery.trim() || viewSavedPeopleOnly) {
      setServerResults(null);
      return;
    }
    const timer = setTimeout(() => {
      import('../../lib/api').then(({ api }) => {
        api.attendees.getAll({ query: searchQuery.trim() })
          .then((res) => {
            if (Array.isArray(res)) {
              setServerResults(res.map((a: any) => ({
                id: a.id,
                name: a.name,
                designation: a.designation || '',
                company: a.company || '',
                role: (a.role as any) || 'delegate',
                avatar: a.avatar || a.avatarUrl || '',
                bio: a.bio || '',
                email: a.email || '',
                mobile: a.mobile || '',
                linkedin: a.linkedin || '',
                interests: a.interests || [],
                skills: a.skills || [],
                relevanceScore: a.relevanceScore || 0,
                privacy: a.privacy || { preset: 'Connections Only', shareEmail: true, sharePhone: false, shareLinkedIn: true, shareTwitter: false },
                checkedIn: Boolean(a.checkedIn),
                registrationId: a.registrationId || `#${a.id.slice(-4)}`,
                ticketType: a.ticketType || 'Delegate',
              })));
            }
          })
          .catch(() => setServerResults(null));
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, viewSavedPeopleOnly]);

  const displayedList = useMemo(() => {
    if (serverResults) return serverResults;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseList;

    return baseList.filter((person) => {
      return (
        person.name.toLowerCase().includes(q) ||
        person.company.toLowerCase().includes(q) ||
        person.designation.toLowerCase().includes(q) ||
        (person.interests && person.interests.some((i) => i.toLowerCase().includes(q))) ||
        (person.skills && person.skills.some((s) => s.toLowerCase().includes(q)))
      );
    });
  }, [baseList, searchQuery, serverResults]);

  return (
    <div className="flex-1 min-h-0 h-full bg-[#F8F7F4] select-none flex flex-col overflow-hidden">
      {/* Fixed Top Section: Header & Search */}
      <div className="shrink-0 bg-[#F8F7F4] px-3.5 z-10 border-b border-[#E5E7EB]">
        {/* Header */}
        <div className="pt-4 pb-1">
          {viewSavedPeopleOnly ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">
                  MPSS26 · SAVED
                </p>
                <h1 className="text-[30px] font-serif font-normal text-[#181818] tracking-tight leading-none">
                  Saved People
                </h1>
              </div>
              <button
                onClick={() => {
                  setViewSavedPeopleOnly(false);
                  router.push('/delegate/profile');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#DEDCD7] text-[#181818] font-bold text-[11.5px] shadow-xs hover:bg-[#FAF9F5] active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Profile</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">
                  MPSS26 · NETWORKING
                </p>
                <h1 className="text-[30px] font-serif font-normal text-[#181818] tracking-tight leading-none">
                  People You Should Meet
                </h1>
              </div>
              <button
                onClick={() => router.push('/delegate/home')}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#DEDCD7] text-[#181818] font-bold text-[11.5px] shadow-xs hover:bg-[#FAF9F5] active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Home</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mt-2 pb-3">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-[19px] -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, or interest (e.g. AI)..."
            className="w-full h-10 bg-white border border-[#E5E7EB] rounded-[14px] pl-10 pr-9 text-[12.5px] focus:ring-2 focus:ring-[#B51F32]/20 focus:border-[#B51F32] outline-none text-[#181818] placeholder-[#9CA3AF] shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-[19px] -translate-y-1/2 text-[11px] font-bold text-[#6B6B6B] hover:text-[#181818]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2.5 no-scrollbar pb-2.5">
        <p className="text-[12.5px] font-medium text-[#6B7280] px-0.5">
          {viewSavedPeopleOnly
            ? `${displayedList.length} Saved ${displayedList.length === 1 ? 'Person' : 'People'}`
            : `${displayedList.length} Recommended ${displayedList.length === 1 ? 'Attendee' : 'Attendees'}`}
        </p>

        {/* Attendees / Profiles List */}
        <div className="space-y-2.5">
          {displayedList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-[20px] border border-[#DEDCD7]">
              <p className="text-xs font-semibold text-[#181818]">
                {viewSavedPeopleOnly ? 'No saved people yet' : 'No recommended attendees found'}
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                {viewSavedPeopleOnly
                  ? 'Explore the Speakers and People tabs and tap the star to save them here.'
                  : 'Try adjusting your search keywords.'}
              </p>
            </div>
          ) : (
            displayedList.map((person) => (
              <div
                key={person.id}
                onClick={() => setSelectedPersonId(person.id)}
                className="bg-white p-3.5 rounded-[20px] border border-[#E5E7EB] hover:border-gray-400 transition-all shadow-xs cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-12 h-12 rounded-full object-cover object-top flex-shrink-0 shadow-xs border border-[#E5E7EB]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F6F4F0] border border-[#E5E7EB] flex items-center justify-center font-bold text-[15px] text-[#181818] flex-shrink-0 shadow-xs">
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-[#181818] truncate leading-tight">
                      {person.name}
                    </h3>
                    <p className="text-[12.5px] text-[#6B7280] font-normal truncate mt-1 leading-normal">
                      {person.designation} · {person.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavePerson(person.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    title={savedPeopleIds.includes(person.id) ? "Remove from Saved People" : "Save Person"}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        savedPeopleIds.includes(person.id)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-[#9CA3AF]'
                      }`}
                    />
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[2]" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
