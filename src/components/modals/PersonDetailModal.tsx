'use client';

import React, { useEffect } from 'react';
import { useStore } from '../../lib/store';
import { INITIAL_ATTENDEES } from '../../lib/mockData';
import { Person } from '../../types';
import { X, Check, UserPlus, Mail, Phone, Linkedin, Twitter, ShieldCheck, Tag, Clock, Lock, Star } from 'lucide-react';

export const PersonDetailModal: React.FC = () => {
  const {
    selectedPersonId,
    setSelectedPersonId,
    attendees,
    sessions,
    connections,
    connectWith,
    disconnectFrom,
    savedPeopleIds,
    toggleSavePerson
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPersonId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedPersonId]);

  if (!selectedPersonId) return null;

  const normalizedSearch = (selectedPersonId || '').toLowerCase().trim();

  // Multi-tier robust resolution:
  const person: Person | null =
    attendees.find((a) => a.id === selectedPersonId) ||
    INITIAL_ATTENDEES.find((a) => a.id === selectedPersonId) ||
    attendees.find((a) => a.name.toLowerCase() === normalizedSearch) ||
    INITIAL_ATTENDEES.find((a) => a.name.toLowerCase() === normalizedSearch) ||
    attendees.find((a) => a.id.toLowerCase().includes(normalizedSearch)) ||
    INITIAL_ATTENDEES.find((a) => a.id.toLowerCase().includes(normalizedSearch)) ||
    (() => {
      // Find matching session
      for (const s of (sessions || [])) {
        const matches =
          s.speakerId === selectedPersonId ||
          `spk-${s.id}` === selectedPersonId ||
          (s.speakerIds && s.speakerIds.includes(selectedPersonId)) ||
          s.speakerName?.toLowerCase() === normalizedSearch ||
          (s.speakerName && normalizedSearch.includes(s.speakerName.toLowerCase()));

        if (matches) {
          return {
            id: selectedPersonId,
            name: s.speakerName,
            designation: s.speakerDesignation || 'Keynote Speaker',
            company: s.speakerCompany || 'MP Semiconductor Summit',
            role: 'speaker' as const,
            bio: `${s.speakerName} is a distinguished keynote speaker at the Madhya Pradesh Semiconductor Summit 2026, presenting "${s.title}". Leading national semiconductor ecosystem, fab enablement, and industry initiatives.`,
            interests: ['Semiconductors', 'Wafer Fabs', 'ATMP / OSAT', 'Chip Design', 'Ecosystem Strategy'],
            skills: ['Semiconductor Engineering', 'Executive Leadership', 'Strategic Roadmap'],
            email: 'Not publicly listed',
            mobile: 'Not publicly listed',
            linkedin: 'https://linkedin.com',
            privacy: {
              preset: 'Open' as const,
              shareEmail: false,
              sharePhone: false,
              shareLinkedIn: true,
              shareTwitter: false,
            },
            checkedIn: true,
            ticketType: 'Speaker',
            registrationId: `#SPK-${selectedPersonId.slice(-4).toUpperCase()}`,
            relevanceScore: 98,
          } as Person;
        }
      }
      return null;
    })();

  if (!person) return null;

  const isConnected = connections.some((c) => c.personId === person.id && c.status === 'connected');
  const isPending = connections.some((c) => c.personId === person.id && c.status === 'pending');
  const isSaved = savedPeopleIds.includes(person.id);

  const handleConnect = () => {
    if (isConnected || isPending) {
      disconnectFrom(person.id);
    } else {
      connectWith(person.id, 'direct');
    }
  };

  return (
    <div
      onClick={() => setSelectedPersonId(null)}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 space-y-3 shadow-2xl border border-[#DEDCD7]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DEDCD7]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
            {person.role === 'speaker' || person.ticketType === 'Speaker' ? 'Featured Speaker Profile' : 'Attendee Profile'}
          </span>
          <button
            onClick={() => setSelectedPersonId(null)}
            className="p-1 rounded-lg text-[#6B6B6B] hover:text-[#181818]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity & Avatar */}
        <div className="flex items-start gap-2.5 relative">
          <button 
            onClick={() => toggleSavePerson(person.id)}
            className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Star className={`w-5 h-5 ${isSaved ? 'fill-yellow-400 text-yellow-400' : 'text-[#9CA3AF]'}`} />
          </button>
          
          <img
            src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=181818&color=ffffff&bold=true`}
            alt={person.name}
            className="w-14 h-14 rounded-full object-cover shadow-sm border border-[#E5E7EB] flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=181818&color=ffffff&bold=true`;
            }}
          />
          <div className="pt-0.5 pr-8">
            <h2 className="text-[16px] font-bold text-[#181818] leading-tight">{person.name}</h2>
            <p className="text-[14px] text-[#4B5563] mt-0.5">
              {person.designation} · {person.company}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
                {person.ticketType}
              </span>
              {person.relevanceScore && (
                <span className="text-[11px] font-medium text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-2 py-0.5 rounded-md">
                  {person.relevanceScore}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="text-[12px] text-[#4B5563] leading-relaxed">
          <p>{person.bio}</p>
        </div>

        {/* Interests & Skills */}
        <div className="pt-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">
            Focus Areas & Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(person.interests || []).map((interest, idx) => (
              <span key={idx} className="text-[11px] bg-[#F3F4F6] text-[#4B5563] px-2.5 py-1 rounded-md font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Contact info */}
        {(() => {
          const canViewContact = true;
          return (
            <div className="bg-[#FAFAFA] p-2.5 rounded-lg border border-[#E5E7EB] space-y-3 mt-3 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
                <span className="text-[#181818] font-medium">
                  {person.role === 'speaker' || person.ticketType === 'Speaker' ? (
                    'Not publicly listed'
                  ) : !canViewContact ? (
                    <span className="text-[#9CA3AF] italic font-normal flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Hidden until connected</span>
                  ) : person.privacy?.shareEmail !== false && person.email ? (
                    person.email
                  ) : (
                    <span className="text-[#9CA3AF] italic font-normal">Not shared</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <Phone className="w-4 h-4" />
                  Mobile
                </span>
                <span className="text-[#181818] font-medium">
                  {!canViewContact ? (
                    <span className="text-[#9CA3AF] italic font-normal flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Hidden until connected</span>
                  ) : person.privacy?.sharePhone !== false && person.mobile ? (
                    person.mobile
                  ) : (
                    <span className="text-[#9CA3AF] italic font-normal">Not shared</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                  LinkedIn
                </span>
                <span>
                  {person.linkedin ? (
                    <a
                      href={person.linkedin.startsWith('http') ? person.linkedin : `https://${person.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0A66C2] font-medium hover:underline flex items-center gap-1"
                    >
                      {person.name} on LinkedIn
                    </a>
                  ) : (
                    <span className="text-[#9CA3AF] italic">Not shared</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  Twitter / X
                </span>
                <span>
                  {person.privacy?.shareTwitter && person.twitter ? (
                    <a
                      href={person.twitter.startsWith('http') ? person.twitter : `https://x.com/${person.twitter.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1DA1F2] font-medium hover:underline"
                    >
                      {person.twitter.startsWith('http')
                        ? `@${person.twitter.split('/').pop()?.split('?')[0] || 'profile'}`
                        : person.twitter.startsWith('@')
                        ? person.twitter
                        : `@${person.twitter}`}
                    </a>
                  ) : (
                    <span className="text-[#9CA3AF] italic">Not shared</span>
                  )}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
