'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, RotateCcw } from 'lucide-react';

import { useStore } from '../../lib/store';
import { INITIAL_POLL } from '../../lib/mockData';

export const DelegatePolls: React.FC = () => {
  const router = useRouter();
  const { setActiveDelegateTab, poll, votePoll, resetPollVote, currentUser } = useStore();
  
  // Ensure we use the official summit poll data
  const activePoll = poll && poll.id === INITIAL_POLL.id ? poll : (poll || INITIAL_POLL);
  const storageKey = currentUser?.id
    ? `eventsphere_poll_voted_${activePoll.id}_${currentUser.id}`
    : `eventsphere_poll_voted_${activePoll.id}`;

  const [submittedOption, setSubmittedOption] = useState<string | null>(null);

  // Initialize from backend poll DTO or user-scoped localStorage
  useEffect(() => {
    if (activePoll.votedOptionId) {
      setSubmittedOption(activePoll.votedOptionId);
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setSubmittedOption(saved);
        } else if (activePoll.hasVoted && activePoll.voterIds && currentUser?.id && activePoll.voterIds.includes(currentUser.id)) {
          setSubmittedOption(activePoll.votedOptionId || null);
        } else {
          setSubmittedOption(null);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [activePoll.id, activePoll.hasVoted, activePoll.votedOptionId, activePoll.voterIds, currentUser?.id, storageKey]);

  const handleVote = (optionId: string) => {
    if (activePoll.status === 'closed') return;
    setSubmittedOption(optionId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, optionId);
      } catch {
        // ignore
      }
    }
    votePoll(optionId);
  };

  const handleReset = () => {
    setSubmittedOption(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`eventsphere_poll_voted_${activePoll.id}`);
      } catch {
        // ignore
      }
    }
    if (resetPollVote) {
      resetPollVote();
    }
  };

  const hasVoted = submittedOption !== null || Boolean(activePoll.hasVoted) || (Boolean(currentUser?.id) && Boolean(activePoll.voterIds?.includes(currentUser.id)));
  const totalVotes = activePoll.totalVotes || 0;

  return (
    <div className="flex-1 bg-[#F9F9F8] flex flex-col h-full overflow-hidden select-none">
      {/* Sticky Top Header Navigation - Compact */}
      <div className="pt-2.5 pb-2 px-3.5 bg-[#F9F9F8] flex-shrink-0 sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => router.push('/delegate/home')}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#181818] transition-active active:scale-95 shadow-2xs border border-gray-200/80 cursor-pointer"
            aria-label="Back to home"
          >
            <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
          <h1 className="text-[17px] font-bold text-[#181818] tracking-tight">Live Polls</h1>
        </div>

        {/* Testing helper: Reset button */}
        {hasVoted && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-gray-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Reset vote to test unvoted state"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset Vote</span>
          </button>
        )}
      </div>

      {/* Main Content Area - Reduced Padding to fit fully on mobile view */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2.5 pb-3">
        <div className="max-w-md mx-auto">
          {/* Poll Card - Reduced padding & compact typography */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 border border-slate-200/90 shadow-xs">
            {/* Header: LIVE Badge | Session Poll */}
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#DC2626] text-white text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                <span>LIVE</span>
              </div>
              <span className="text-slate-300 font-light select-none text-xs">|</span>
              <span className="text-[12px] font-medium text-slate-500">
                Session Poll
              </span>
            </div>

            {/* Question Title - Compact leading and font size */}
            <h2 className="text-[15px] sm:text-[16.5px] font-bold text-[#0F172A] leading-snug tracking-tight mb-3">
              {activePoll.question}
            </h2>

            {/* Options List - Compact space-y-2 */}
            <div className="space-y-2">
              {activePoll.options.map((option) => {
                const isSelected = submittedOption === option.id;
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                // State 1: Unvoted format (Compact)
                if (!hasVoted) {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleVote(option.id)}
                      disabled={activePoll.status === 'closed'}
                      className="w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 active:scale-[0.99] transition-all flex items-center gap-2.5 group cursor-pointer shadow-2xs"
                    >
                      {/* Empty Radio Circle */}
                      <div className="w-4 h-4 rounded-full border-[1.5px] border-slate-300 group-hover:border-slate-400 shrink-0 transition-colors" />

                      {/* Option Text */}
                      <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#0F172A] leading-snug">
                        {option.text}
                      </span>
                    </button>
                  );
                }

                // State 2: Voted format (Compact)
                return (
                  <div
                    key={option.id}
                    className={`w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all shadow-2xs ${
                      isSelected
                        ? 'border-2 border-[#14B8A6] bg-[#F0FDF9]'
                        : 'border border-slate-200 bg-white'
                    }`}
                  >
                    {/* Top Row: Option Text + Percentage */}
                    <div className="flex items-center justify-between gap-2.5 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Teal Checkmark Badge on Selected Option */}
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0 shadow-2xs text-white">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                        )}
                        <span
                          className={`text-[12.5px] sm:text-[13.5px] leading-snug ${
                            isSelected
                              ? 'font-semibold text-[#0F172A]'
                              : 'font-medium text-[#0F172A]'
                          }`}
                        >
                          {option.text}
                        </span>
                      </div>

                      {/* Percentage */}
                      <span
                        className={`text-[13.5px] sm:text-[14.5px] font-bold shrink-0 ${
                          isSelected ? 'text-[#0D9488]' : 'text-slate-600'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    {/* Bottom Row: Horizontal Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isSelected ? 'bg-[#0D9488]' : 'bg-slate-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Votes Count */}
            <div className="mt-3 text-center">
              <span className="text-[11.5px] sm:text-[12px] font-medium text-slate-400">
                {totalVotes} votes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
