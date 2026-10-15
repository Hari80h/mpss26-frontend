'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import {
  Calendar,
  Clock,
  MapPin,
  Mic,
  Plus,
  Edit3,
  Search,
  X,
  Trash2,
  Check,
  Radio,
  Sparkles
} from 'lucide-react';
import { Session } from '../../types';

export const OrganizerSessions: React.FC = () => {
  const {
    sessions,
    updateSession,
    createSession,
    deleteSession,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTrack, setFormTrack] = useState('');
  const [formDay, setFormDay] = useState<number>(1);
  const [formTimeRange, setFormTimeRange] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formStatus, setFormStatus] = useState<'live' | 'upcoming' | 'completed'>('upcoming');
  const [formSpeakerName, setFormSpeakerName] = useState('');
  const [formSpeakerDesignation, setFormSpeakerDesignation] = useState('');
  const [formSpeakerCompany, setFormSpeakerCompany] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTakeaways, setFormTakeaways] = useState('');

  // Extract unique tracks
  const allTracks = Array.from(new Set(sessions.map((s) => s.track).filter(Boolean)));

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      s.title.toLowerCase().includes(q) ||
      s.speakerName.toLowerCase().includes(q) ||
      s.speakerCompany.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q) ||
      s.track.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedDay !== 'all' && s.day !== selectedDay) return false;
    if (selectedTrack !== 'all' && s.track !== selectedTrack) return false;

    return true;
  });

  const handleOpenEdit = (session: Session) => {
    setModalMode('edit');
    setEditingSessionId(session.id);
    setFormTitle(session.title);
    setFormTrack(session.track || 'General');
    setFormDay(session.day || 1);
    setFormTimeRange(session.timeRange || '09:00–10:00');
    setFormRoom(session.room || 'Main Auditorium');
    setFormStatus(session.status || 'upcoming');
    setFormSpeakerName(session.speakerName || '');
    setFormSpeakerDesignation(session.speakerDesignation || '');
    setFormSpeakerCompany(session.speakerCompany || '');
    setFormDescription(session.description || '');
    setFormTakeaways(Array.isArray(session.takeaways) ? session.takeaways.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingSessionId(null);
    setFormTitle('');
    setFormTrack('Keynote');
    setFormDay(1);
    setFormTimeRange('10:00–11:00');
    setFormRoom('Main Auditorium');
    setFormStatus('upcoming');
    setFormSpeakerName('');
    setFormSpeakerDesignation('');
    setFormSpeakerCompany('');
    setFormDescription('');
    setFormTakeaways('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter a session title', 'error');
      return;
    }

    const takeawaysArray = formTakeaways
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (modalMode === 'edit' && editingSessionId) {
      updateSession(editingSessionId, {
        title: formTitle.trim(),
        track: formTrack.trim() || 'General',
        day: Number(formDay),
        timeRange: formTimeRange.trim(),
        room: formRoom.trim(),
        status: formStatus,
        speakerName: formSpeakerName.trim() || 'TBA',
        speakerDesignation: formSpeakerDesignation.trim(),
        speakerCompany: formSpeakerCompany.trim(),
        description: formDescription.trim(),
        takeaways: takeawaysArray,
      });
    } else {
      createSession({
        title: formTitle.trim(),
        track: formTrack.trim() || 'General',
        day: Number(formDay),
        timeRange: formTimeRange.trim() || '10:00–11:00',
        room: formRoom.trim() || 'Main Hall',
        status: formStatus,
        speakerName: formSpeakerName.trim() || 'TBA',
        speakerDesignation: formSpeakerDesignation.trim(),
        speakerCompany: formSpeakerCompany.trim(),
        speakerId: `spk-${Date.now()}`,
        description: formDescription.trim(),
        takeaways: takeawaysArray,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingSessionId) {
      if (confirm('Are you sure you want to delete this session?')) {
        deleteSession(editingSessionId);
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6 select-text max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            MPSS26 · INDORE · SUMMIT SCHEDULE
          </span>
          <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight mt-1">
            Sessions & Agenda
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Click on any session card to edit its title, speakers, timing, room, and details.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-9 px-4 bg-[#3563F6] hover:bg-[#2554E5] active:bg-[#1D46CA] text-white text-[13px] font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search session, speaker, room, track..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6] shadow-2xs"
          />
        </div>

        {/* Day Pills & Track Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Day filters */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E2E8F0] shadow-2xs">
            {(['all', 1, 2, 3] as const).map((dayVal) => {
              const isActive = selectedDay === dayVal;
              return (
                <button
                  key={dayVal}
                  onClick={() => setSelectedDay(dayVal)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#14233B] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {dayVal === 'all' ? 'All Days' : `Day ${dayVal}`}
                </button>
              );
            })}
          </div>

          {/* Track selector */}
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6] shadow-2xs cursor-pointer"
          >
            <option value="all">All Tracks</option>
            {allTracks.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Symmetrical Grid of Session Boxes */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <Calendar className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-semibold text-[#172033]">No sessions match your search</h3>
          <p className="text-xs text-[#64748B] mt-1">Try resetting the filters or add a new session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const initials = (session.speakerName || 'TBA')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2);

            const isLive = session.status === 'live';
            const isCompleted = session.status === 'completed';

            return (
              <div
                key={session.id}
                onClick={() => handleOpenEdit(session)}
                className="group relative bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs hover:border-[#3563F6]/50 hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between"
              >
                {/* Card Top: Badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                        Day {session.day} · {session.timeRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                          LIVE
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[11px] font-medium text-[#64748B] bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md">
                          Done
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#3563F6] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room & Track Tags */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {session.room}
                    </span>
                    <span className="text-[#CBD5E1]">·</span>
                    <span className="text-[11px] font-medium text-[#3563F6] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {session.track}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-[#172033] leading-snug group-hover:text-[#3563F6] transition-colors line-clamp-2">
                    {session.title}
                  </h3>

                  {/* Description snippet */}
                  {session.description && (
                    <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                </div>

                {/* Card Middle & Bottom: Speaker & Footer */}
                <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
                  {/* Speaker Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2F6] text-[#3563F6] font-semibold text-xs flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#172033] truncate">
                        {session.speakerName || 'Speaker TBA'}
                      </p>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {session.speakerDesignation ? `${session.speakerDesignation} · ` : ''}
                        {session.speakerCompany}
                      </p>
                    </div>
                  </div>

                  {/* Footer Edit Action */}
                  <div className="flex items-center justify-end text-xs text-[#64748B] pt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3563F6] group-hover:underline">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-[#E2E8F0] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {modalMode === 'edit' ? 'Session Editor' : 'New Session'}
                </span>
                <h2 className="text-base font-semibold text-[#172033] mt-0.5">
                  {modalMode === 'edit' ? 'Edit Session Details' : 'Create New Session'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Keynote on Semiconductor Roadmap"
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                />
              </div>

              {/* Day, Time, Room, Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  >
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Time Range</label>
                  <input
                    type="text"
                    value={formTimeRange}
                    onChange={(e) => setFormTimeRange(e.target.value)}
                    placeholder="e.g. 09:30–10:30"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="e.g. Main Auditorium, Hall B"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Track / Category</label>
                  <input
                    type="text"
                    value={formTrack}
                    onChange={(e) => setFormTrack(e.target.value)}
                    placeholder="e.g. Keynote, Technical, Panel, Workshop"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">Session Status</label>
                <div className="flex gap-2">
                  {(['upcoming', 'live', 'completed'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setFormStatus(st)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all cursor-pointer ${
                        formStatus === st
                          ? 'bg-[#14233B] text-white border-[#14233B] shadow-2xs'
                          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker Information */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-semibold text-[#172033] mb-2 uppercase tracking-wide">
                  Speaker Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                      Speaker Name
                    </label>
                    <input
                      type="text"
                      value={formSpeakerName}
                      onChange={(e) => setFormSpeakerName(e.target.value)}
                      placeholder="e.g. Dr. Manish Hooda"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formSpeakerDesignation}
                      onChange={(e) => setFormSpeakerDesignation(e.target.value)}
                      placeholder="e.g. Director (Technology)"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={formSpeakerCompany}
                      onChange={(e) => setFormSpeakerCompany(e.target.value)}
                      placeholder="e.g. India Semiconductor Mission"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Description & Overview
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summary of what this session covers..."
                  className="w-full p-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                />
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Key Takeaways (one per line)
                </label>
                <textarea
                  rows={2}
                  value={formTakeaways}
                  onChange={(e) => setFormTakeaways(e.target.value)}
                  placeholder="Takeaway 1&#10;Takeaway 2"
                  className="w-full p-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-9 px-4 bg-white hover:bg-[#F8FAFC] text-[#172033] text-xs font-medium rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="h-9 px-4 bg-[#3563F6] hover:bg-[#2554E5] active:bg-[#1D46CA] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    {modalMode === 'edit' ? 'Save Changes' : 'Create Session'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
