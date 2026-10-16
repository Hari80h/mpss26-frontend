'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../lib/store';
import { INITIAL_ATTENDEES } from '../../lib/mockData';
import { Person } from '../../types';
import { X, Check, UserPlus, Mail, Phone, Linkedin, Twitter, Star, Pencil, Save, RotateCcw } from 'lucide-react';

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
    toggleSavePerson,
    updateAttendee,
    currentUser,
    role,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    designation: '',
    company: '',
    bio: '',
    email: '',
    mobile: '',
    linkedin: '',
    twitter: '',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPersonId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedPersonId]);

  if (!selectedPersonId) return null;

  const normalizedSearch = (selectedPersonId || '').toLowerCase().trim();

  // Multi-tier resolution:
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

  const handleStartEdit = () => {
    setEditForm({
      name: person.name || '',
      designation: person.designation || '',
      company: person.company || '',
      bio: person.bio || '',
      email: person.email || '',
      mobile: person.mobile || '',
      linkedin: person.linkedin || '',
      twitter: person.twitter || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await updateAttendee(person.id, editForm);
      setIsEditing(false);
    } catch {
      // toast in store
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = () => {
    if (isConnected || isPending) {
      disconnectFrom(person.id);
    } else {
      connectWith(person.id, 'direct');
    }
  };

  // Combine unique tags from interests and skills
  const allTags = Array.from(
    new Set([...(person.interests || []), ...(person.skills || [])])
  ).filter(Boolean);

  return (
    <div
      onClick={() => setSelectedPersonId(null)}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-5 space-y-3.5 shadow-2xl border border-[#DEDCD7]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#DEDCD7]">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#DC2626]">
            {person.role === 'speaker' || person.ticketType === 'Speaker' ? 'Featured Speaker Profile' : 'Attendee Profile'}
          </span>
          <div className="flex items-center gap-1.5">
            {!isEditing && role === 'organizer' && (
              <button
                onClick={handleStartEdit}
                className="p-1 rounded-md text-[#6B6B6B] hover:text-[#181818] hover:bg-gray-100 transition-colors"
                title="Edit Info"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSelectedPersonId(null)}
              className="p-1 rounded-md text-[#6B6B6B] hover:text-[#181818] hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing && role === 'organizer' ? (
          /* EDIT MODE */
          <div className="space-y-3 pt-1 text-xs">
            <h3 className="font-bold text-[#181818] text-sm pb-1 border-b border-gray-100">
              Edit Attendee Information
            </h3>

            <div className="space-y-1">
              <label className="font-semibold text-[#4B5563]">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-[#4B5563]">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#4B5563]">Company</label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#4B5563]">Bio / Description</label>
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-[#4B5563]">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#4B5563]">Mobile</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, mobile: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#4B5563]">LinkedIn URL</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/username"
                value={editForm.linkedin}
                onChange={(e) => setEditForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDCD7] text-xs focus:outline-none focus:ring-1 focus:ring-[#181818]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg bg-[#181818] text-white hover:bg-black font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <>
            {/* Identity & Avatar */}
            <div className="flex items-start gap-3 relative">
              <button
                onClick={() => toggleSavePerson(person.id)}
                className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                title={isSaved ? "Remove from Saved" : "Save Person"}
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
              <div className="pt-0.5 pr-8 min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-[#181818] leading-tight truncate">{person.name}</h2>
                <p className="text-[13.5px] text-[#4B5563] mt-0.5 leading-snug">
                  {[person.designation, person.company].filter(Boolean).join(' · ') || 'Attendee'}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
                    {person.ticketType || (person.role === 'speaker' ? 'Speaker' : 'Delegate')}
                  </span>
                  {person.relevanceScore !== undefined && person.relevanceScore > 0 && (
                    <span className="text-[11px] font-medium text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-2 py-0.5 rounded-md">
                      {person.relevanceScore}% Match
                    </span>
                  )}
                  {person.checkedIn && (
                    <span className="text-[11px] font-medium text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                      Checked In ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {person.bio && (
              <div className="text-[12.5px] text-[#4B5563] leading-relaxed bg-[#F8F7F4] p-2.5 rounded-lg border border-[#EBE8E2]">
                <p>{person.bio}</p>
              </div>
            )}

            {/* Focus Areas & Skills */}
            <div className="pt-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Focus Areas & Skills
              </h3>
              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] bg-[#F3F4F6] text-[#4B5563] px-2.5 py-1 rounded-md font-medium border border-[#E5E7EB]">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11.5px] text-[#9CA3AF] italic">General Semiconductor & Tech Ecosystem</p>
              )}
            </div>

            {/* Contact details */}
            <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E7EB] space-y-2.5 text-[12px]">
              {/* Email */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <Mail className="w-4 h-4 text-[#4B5563]" />
                  Email
                </span>
                <span className="text-[#181818] font-medium font-mono text-[11.5px] truncate max-w-[200px]">
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="hover:underline text-[#181818]">
                      {person.email}
                    </a>
                  ) : (
                    <span className="text-[#9CA3AF] italic font-normal">Not shared</span>
                  )}
                </span>
              </div>

              {/* Mobile */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <Phone className="w-4 h-4 text-[#4B5563]" />
                  Mobile
                </span>
                <span className="text-[#181818] font-medium font-mono text-[11.5px]">
                  {person.mobile ? (
                    <a href={`tel:${person.mobile}`} className="hover:underline text-[#181818]">
                      {person.mobile}
                    </a>
                  ) : (
                    <span className="text-[#9CA3AF] italic font-normal">Not shared</span>
                  )}
                </span>
              </div>

              {/* LinkedIn */}
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
                      rel="noopener noreferrer"
                      className="text-[#0A66C2] font-semibold hover:underline"
                    >
                      View LinkedIn Profile →
                    </a>
                  ) : (
                    <span className="text-[#9CA3AF] italic font-normal">Not shared</span>
                  )}
                </span>
              </div>

              {/* Twitter / X */}
              {person.twitter && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#6B6B6B]">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    Twitter / X
                  </span>
                  <span>
                    <a
                      href={person.twitter.startsWith('http') ? person.twitter : `https://x.com/${person.twitter.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#181818] font-medium hover:underline"
                    >
                      {person.twitter.startsWith('http')
                        ? `@${person.twitter.split('/').pop()?.split('?')[0] || 'profile'}`
                        : person.twitter.startsWith('@')
                        ? person.twitter
                        : `@${person.twitter}`}
                    </a>
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleConnect}
                className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 ${
                  isConnected
                    ? 'bg-[#E5E7EB] text-[#181818] hover:bg-gray-300'
                    : isPending
                    ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                    : 'bg-[#181818] text-white hover:bg-black'
                }`}
              >
                {isConnected ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Connected
                  </>
                ) : isPending ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Request Sent
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedPersonId(null)}
                className="py-2 px-4 rounded-xl border border-[#DEDCD7] text-[#181818] font-medium text-xs hover:bg-[#F6F4F0] cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
