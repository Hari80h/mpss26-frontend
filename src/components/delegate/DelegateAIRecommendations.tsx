'use client';

import React, { useMemo } from 'react';
import { useStore } from '../../lib/store';
import { ChevronLeft, ChevronRight, Check, Clock, UserPlus, Settings, Lightbulb, Grid, Calendar, CalendarPlus } from 'lucide-react';

export const DelegateAIRecommendations: React.FC = () => {
  const {
    attendees,
    currentUser,
    connections,
    connectWith,
    disconnectFrom,
    setSelectedPersonId,
    setActiveDelegateTab,
    sessions,
    setSelectedSessionId,
    setSessionBackTab,
    toggleBookmarkSession
  } = useStore();

  const isConnected = (personId: string) => connections.some((c) => c.personId === personId && c.status === 'connected');
  const isPending = (personId: string) => connections.some((c) => c.personId === personId && c.status === 'pending');

  const recommendedPeople = useMemo(() => {
    const speakers = attendees.filter(
      (a) =>
        a.role === 'speaker' &&
        a.id !== currentUser.id &&
        a.name.toLowerCase() !== (currentUser.name || '').toLowerCase()
    );
    const indices = [0, 2, 3, 5, 7, 9, 11, 12, 13, 14];
    const picked = indices.map((idx) => speakers[idx]).filter(Boolean);
    return picked.length >= 10 ? picked.slice(0, 10) : speakers.slice(0, 10);
  }, [attendees, currentUser.id, currentUser.name]);

  // Recommended Sessions mock (excluding non-session breaks & registrations)
  const recommendedSessions = sessions
    .filter((s) => !/registration|high tea|lunch|tea break|cultural evening|gala dinner/i.test(s.title))
    .slice(0, 4);

  const handleConnect = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    connectWith(personId, 'direct');
  };

  return (
    <div className="flex-1 min-h-0 h-full bg-white pb-4 overflow-y-auto">
      {/* Header */}
      <div className="p-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2 mt-2">
          <button
            onClick={() => setActiveDelegateTab('home')}
            className="p-1 -ml-1 text-[#181818] hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[12px] font-bold text-[#181818] truncate">People You Should Meet</h1>
        </div>
        
        <p className="text-[12px] text-[#4B5563] leading-relaxed mb-2 pr-4">
          Discover the top matches our AI generated for you based on your platform use.
        </p>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-[#B51F32] bg-red-50 px-3 py-1.5 rounded-full border border-red-100 w-fit">
          <Lightbulb className="w-3.5 h-3.5" />
          Learn how &gt;
        </button>
      </div>

      <div className="px-3 space-y-8 relative">
        {/* People Matches */}
        <div>
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-[#8B5CF6] mb-2">
            <Settings className="w-4 h-4" /> People Matches
          </h2>
          <div className="flex overflow-x-auto gap-2 pb-3 -mx-4 px-3 no-scrollbar">
            {recommendedPeople.map((person) => {
              const connected = isConnected(person.id);
              const pending = isPending(person.id);
              return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className="bg-white p-2.5 rounded-[14px] border border-[#DEDCD7] flex-shrink-0 w-[240px] flex flex-col justify-between gap-2 cursor-pointer shadow-sm hover:border-[#181818]/40 transition-all"
                  >
                  <div className="flex items-center gap-2">
                    {person.avatar ? (
                      <img src={person.avatar} alt={person.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#EFEEEA] flex items-center justify-center font-bold text-[12px] text-[#181818] flex-shrink-0">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-bold text-[#181818] truncate leading-snug">
                        {person.name}
                      </h4>
                      <p className="text-[12px] text-[#64748b] truncate mt-0.5">
                        {person.designation} · {person.company}
                      </p>
                    </div>
                  </div>

                    <div className="pt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#181818] border-t border-gray-100 mt-1 text-center">
                      <span>View profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Session Matches */}
        <div>
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-[#8B5CF6] mb-2">
            <Settings className="w-4 h-4" /> Session Matches
          </h2>
          <div className="flex overflow-x-auto gap-2 pb-3 -mx-4 px-3 no-scrollbar">
            {recommendedSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setSessionBackTab('ai_recommendations');
                  setSelectedSessionId(session.id);
                  setActiveDelegateTab('schedule');
                }}
                className="p-2 bg-white rounded-[12px] shadow-sm relative overflow-hidden flex flex-col gap-1 cursor-pointer hover:shadow-md transition-shadow border border-[#F3F4F6] flex-shrink-0 w-[260px]"
              >
                {/* Red strip */}
                <div className="absolute top-0 left-0 w-1.5 h-[35%] bg-[#D11E39] rounded-br-md" />
                
                <div className="flex items-center justify-between pl-1">
                  <div className="flex items-center gap-1 bg-[#FFF0F2] px-1.5 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D11E39]" />
                    <Calendar className="w-[10px] h-[10px] text-[#D11E39]" />
                    <span className="text-[9.5px] font-medium text-[#4B5563]">
                      Day {session.day} · {session.timeRange}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#D11E39] flex items-center gap-0.5">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="pl-1">
                  <h4 className="text-[12.5px] font-bold text-[#181818] leading-tight pr-2 whitespace-normal line-clamp-2">
                    {session.title}
                  </h4>
                  <p className="text-[10.5px] text-[#6B6B6B] mt-0.5">{session.speakerName || 'Not published'}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmarkSession(session.id);
                  }}
                  className={`w-full py-1.5 rounded-[6px] text-[11.5px] font-bold transition-all active:scale-95 border flex items-center justify-center gap-1.5 ${
                    session.isBookmarked 
                      ? 'border-[#0D9488] bg-[#F0FDF4] text-[#0D9488]'
                      : 'border-[#181818] text-[#181818] bg-white hover:bg-gray-50'
                  }`}
                >
                  {session.isBookmarked ? (
                    <>
                      <Check className="w-3 h-3" /> Added to Schedule
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-3 h-3" /> Add to Schedule
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};
