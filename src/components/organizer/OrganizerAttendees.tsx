'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../lib/store';
import { api, ImportResult } from '../../lib/api';
import {
  Search,
  Download,
  Upload,
  UserPlus,
  CheckCircle2,
  XCircle,
  MoreVertical,
  X,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Calendar,
  Share2,
  QrCode,
  Edit3
} from 'lucide-react';
import { Person } from '../../types';

export const OrganizerAttendees: React.FC = () => {
  const {
    attendees,
    toggleCheckIn,
    addWalkInAttendee,
    showToast,
    event,
    updateAttendee,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Delegates' | 'VIP' | 'Speakers' | 'Exhibitors'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [isSavingPerson, setIsSavingPerson] = useState(false);
  const [personEditForm, setPersonEditForm] = useState({
    name: '',
    designation: '',
    company: '',
    email: '',
    mobile: '',
    ticketType: '',
    bio: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(11);
  const [serverAttendees, setServerAttendees] = useState<Person[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever debounced search query, filter tab, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, activeTab, pageSize]);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInMobile, setWalkInMobile] = useState('');
  const [walkInCompany, setWalkInCompany] = useState('');
  const [walkInDesignation, setWalkInDesignation] = useState('');
  const [walkInTicket, setWalkInTicket] = useState('Full Access Delegate Pass');

  // Real CSV file upload & import state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [mappingStep, setMappingStep] = useState<'upload' | 'mapping' | 'complete'>('upload');

  // Fetch attendees from backend using server-side pagination & query
  const fetchAttendees = useCallback(async () => {
    setIsLoading(true);
    try {
      const categoryParam =
        activeTab === 'Delegates'
          ? 'DELEGATE'
          : activeTab === 'VIP'
          ? 'VIP'
          : activeTab === 'Speakers'
          ? 'SPEAKER'
          : activeTab === 'Exhibitors'
          ? 'EXHIBITOR'
          : undefined;

      const res = await api.organizer.getAttendees({
        query: debouncedQuery.trim() || undefined,
        category: categoryParam,
        page: currentPage - 1,
        size: pageSize,
      });

      if (res && res.items) {
        const mapped: Person[] = res.items.map((b: any) => ({
          id: b.id,
          name: b.name,
          designation: b.designation || '',
          company: b.company || '',
          role: (b.category?.toLowerCase() as any) || 'delegate',
          bio: b.bio || '',
          interests: b.interests || [],
          skills: b.skills || [],
          email: b.email || '',
          mobile: b.mobile || '',
          avatar: b.avatarUrl || b.avatar || '',
          linkedin: b.linkedin || '',
          twitter: b.twitter || '',
          checkedIn: Boolean(b.checkedIn),
          checkInTime: b.checkInTime ? new Date(b.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          registrationId: b.registrationId || `#${b.id.slice(-4)}`,
          ticketType: b.ticketType || 'Delegate',
          privacy: {
            preset: 'Connections Only',
            shareEmail: true,
            sharePhone: true,
            shareLinkedIn: true,
          },
        }));
        setServerAttendees(mapped);
        setTotalCount(res.total);
      }
    } catch (err: any) {
      console.warn('Failed to fetch organizer attendees from backend:', err);
      // Fallback to local store filtering if backend fails
      const q = debouncedQuery.toLowerCase().trim();
      const localFiltered = attendees.filter((p) => {
        const regId = (p.registrationId || '').toLowerCase();
        const matchesSearch =
          q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.designation.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          regId.includes(q);
        if (!matchesSearch) return false;
        if (activeTab === 'Delegates') return p.role === 'delegate';
        if (activeTab === 'VIP') return p.role === 'vip';
        if (activeTab === 'Speakers') return p.role === 'speaker';
        if (activeTab === 'Exhibitors') return p.role === 'exhibitor_staff';
        return true;
      });
      setServerAttendees(localFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize));
      setTotalCount(localFiltered.length);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeTab, currentPage, pageSize, attendees]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const totalRecords = totalCount || event.totalRegistered || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedAttendees = serverAttendees;

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // When near the beginning: show 1, 2, 3, 4, 5, 6, '...', totalPages
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, 6, '...', totalPages];
    }
    // When near the end: show last 6 pages
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    // In the middle: show 2 pages behind and 2 pages ahead
    return [
      1,
      '...',
      safeCurrentPage - 2,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      safeCurrentPage + 2,
      '...',
      totalPages,
    ];
  };

  const getFormattedRegId = (person: Person) => {
    if (!person.registrationId || person.registrationId.toLowerCase().includes('not public') || person.registrationId.toLowerCase().includes('unlisted')) {
      const num = String(Math.abs(person.id.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)) % 9000 + 1000).padStart(4, '0');
      return `#${num}`;
    }
    return person.registrationId.startsWith('#') ? person.registrationId : `#${person.registrationId}`;
  };

  const handleExportCSV = () => {
    const headers = ['Registration ID', 'Name', 'Email', 'Company', 'Designation', 'Ticket Type', 'Checked In', 'Check-In Time'];
    const rows = attendees.map((a) => [
      `"${getFormattedRegId(a)}"`,
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.company}"`,
      `"${a.designation}"`,
      `"${a.ticketType}"`,
      `"${a.checkedIn ? 'YES' : 'NO'}"`,
      `"${a.checkInTime || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventsphere-mpss26-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Attendee roster exported successfully ✓', 'success');
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInEmail) return;

    await addWalkInAttendee({
      name: walkInName,
      email: walkInEmail,
      mobile: walkInMobile || '+91 9800000000',
      company: walkInCompany || 'Independent',
      designation: walkInDesignation || 'Delegate',
      ticketType: walkInTicket,
    });

    // Reset and close
    setWalkInName('');
    setWalkInEmail('');
    setWalkInMobile('');
    setWalkInCompany('');
    setWalkInDesignation('');
    setShowWalkInModal(false);
    fetchAttendees();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImportError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      return;
    }
    setImportError(null);
    setSelectedFile(file);
    setMappingStep('mapping');
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await api.organizer.importAttendeesCsv(selectedFile);
      setImportResult(res);
      setMappingStep('complete');
      showToast(`Imported ${res.totalImported} attendees (${res.totalSkipped} skipped) ✓`, 'success');
      fetchAttendees();
    } catch (err: any) {
      console.warn('CSV import failed:', err);
      setImportError(err.message || 'Failed to import CSV file');
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-5 select-text max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] uppercase tracking-wider font-semibold text-[#64748B] block">
            {event.id} · {totalRecords.toLocaleString()} RECORDS
          </span>
          <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight leading-tight mt-1">
            Attendees
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setMappingStep('upload');
              setShowImportModal(true);
            }}
            className="h-9 px-3.5 bg-white hover:bg-[#F8FAFC] text-[#172033] text-[13px] font-medium rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
          >
            Import CSV
          </button>

          <button
            onClick={() => setShowWalkInModal(true)}
            className="h-9 px-3.5 bg-white hover:bg-[#F8FAFC] text-[#172033] text-[13px] font-medium rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
          >
            + Walk-in
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 px-4 bg-[#3563F6] hover:bg-[#2554E5] active:bg-[#1D46CA] text-white text-[13px] font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80 flex-shrink-0">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, company, ID..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6] shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Delegates', 'VIP', 'Speakers', 'Exhibitors'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all font-medium cursor-pointer ${
                  isActive
                    ? 'bg-[#14233B] text-white shadow-2xs'
                    : 'bg-white text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attendees Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider bg-[#F8FAFC]">
                <th className="py-2.5 px-5 font-semibold">Name</th>
                <th className="py-2.5 px-5 font-semibold">Company</th>
                <th className="py-2.5 px-5 font-semibold">Designation</th>
                <th className="py-2.5 px-5 font-semibold">Type</th>
                <th className="py-2.5 px-5 font-semibold text-right">Reg ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedAttendees.map((person) => {
                const initials = person.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
                const typeLabel =
                  person.role === 'speaker' || person.ticketType?.toLowerCase().includes('speaker')
                    ? 'Speaker'
                    : person.role === 'vip' || person.ticketType?.toLowerCase().includes('vip')
                    ? 'VIP'
                    : person.role === 'exhibitor_staff' || person.ticketType?.toLowerCase().includes('exhibitor')
                    ? 'Exhibitor'
                    : 'Delegate';

                return (
                  <tr
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    {/* NAME */}
                    <td className="py-2.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#EEF2F6] text-[#475569] flex items-center justify-center font-semibold text-[10px] flex-shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-[#172033]">
                          {person.name}
                        </span>
                      </div>
                    </td>

                    {/* COMPANY */}
                    <td className="py-2.5 px-5 text-xs sm:text-sm text-[#64748B]">
                      {person.company}
                    </td>

                    {/* DESIGNATION */}
                    <td className="py-2.5 px-5 text-xs sm:text-sm text-[#64748B]">
                      {person.designation}
                    </td>

                    {/* TYPE */}
                    <td className="py-2.5 px-5">
                      <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        typeLabel === 'VIP'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : typeLabel === 'Speaker'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : typeLabel === 'Exhibitor'
                          ? 'bg-blue-50 text-[#3563F6] border border-blue-200/60'
                          : 'bg-slate-100 text-[#475569] border border-slate-200/60'
                      }`}>
                        {typeLabel}
                      </span>
                    </td>

                    {/* REG ID */}
                    <td className="py-2.5 px-5 text-right font-mono text-xs text-[#64748B]">
                      {getFormattedRegId(person)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="py-2.5 px-5 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] bg-[#F8FAFC]">
          <div>
            Showing {totalRecords === 0 ? 0 : startIndex + 1}
            {paginatedAttendees.length > 1 ? `–${startIndex + paginatedAttendees.length}` : ''} of{' '}
            {totalRecords.toLocaleString()} · sorted by registration order
          </div>

          <div className="flex items-center gap-1 font-medium select-none">
            {safeCurrentPage > 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer text-[#64748B] transition-colors outline-none focus:outline-none"
                title="Previous page"
              >
                ←
              </button>
            )}

            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                const isLeftDots = idx === 1;
                return (
                  <button
                    type="button"
                    key={`dots-${idx}`}
                    onClick={() =>
                      setCurrentPage((p) =>
                        isLeftDots ? Math.max(1, p - 5) : Math.min(totalPages, p + 5)
                      )
                    }
                    className="w-7 h-7 rounded-md text-xs flex items-center justify-center text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors outline-none focus:outline-none"
                    title={isLeftDots ? 'Jump back 5 pages' : 'Jump ahead 5 pages'}
                  >
                    ...
                  </button>
                );
              }

              const pageNum = Number(page);
              const isActive = safeCurrentPage === pageNum;

              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center transition-all outline-none focus:outline-none ${
                    isActive
                      ? 'bg-[#3563F6] text-white shadow-2xs cursor-default'
                      : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {safeCurrentPage < totalPages && (
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer text-[#64748B] transition-colors outline-none focus:outline-none"
                title="Next page"
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendee Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Attendee Profile & Engagement Record
                </span>
                <h2 className="text-base font-semibold text-[#172033] mt-0.5">{selectedPerson.name}</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {!isEditingPerson && (
                  <button
                    onClick={() => {
                      setPersonEditForm({
                        name: selectedPerson.name || '',
                        designation: selectedPerson.designation || '',
                        company: selectedPerson.company || '',
                        email: selectedPerson.email || '',
                        mobile: selectedPerson.mobile || '',
                        ticketType: selectedPerson.ticketType || '',
                        bio: selectedPerson.bio || '',
                      });
                      setIsEditingPerson(true);
                    }}
                    className="p-1.5 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                    title="Edit Attendee"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPerson(null);
                    setIsEditingPerson(false);
                  }}
                  className="p-1 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditingPerson ? (
              /* ORGANIZER EDIT ATTENDEE FORM */
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#475569]">Full Name</label>
                  <input
                    type="text"
                    value={personEditForm.name}
                    onChange={(e) => setPersonEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#475569]">Company</label>
                    <input
                      type="text"
                      value={personEditForm.company}
                      onChange={(e) => setPersonEditForm((prev) => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#475569]">Designation</label>
                    <input
                      type="text"
                      value={personEditForm.designation}
                      onChange={(e) => setPersonEditForm((prev) => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#475569]">Email</label>
                    <input
                      type="email"
                      value={personEditForm.email}
                      onChange={(e) => setPersonEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#475569]">Mobile</label>
                    <input
                      type="text"
                      value={personEditForm.mobile}
                      onChange={(e) => setPersonEditForm((prev) => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#475569]">Ticket Tier</label>
                  <select
                    value={personEditForm.ticketType}
                    onChange={(e) => setPersonEditForm((prev) => ({ ...prev, ticketType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none bg-white"
                  >
                    <option value="Delegate Pass">Delegate Pass</option>
                    <option value="VIP Delegate Pass">VIP Delegate Pass</option>
                    <option value="Speaker Pass">Speaker Pass</option>
                    <option value="Exhibitor Booth Staff">Exhibitor Booth Staff</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#475569]">Bio / Profile Summary</label>
                  <textarea
                    rows={2}
                    value={personEditForm.bio}
                    onChange={(e) => setPersonEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs focus:ring-1 focus:ring-[#14233B] outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditingPerson(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingPerson}
                    onClick={async () => {
                      setIsSavingPerson(true);
                      try {
                        await updateAttendee(selectedPerson.id, personEditForm);
                        setSelectedPerson((prev) => prev ? ({ ...prev, ...personEditForm }) : null);
                        setIsEditingPerson(false);
                      } catch {
                        // toast handled in store
                      } finally {
                        setIsSavingPerson(false);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#14233B] text-white hover:bg-[#1E304F] font-semibold disabled:opacity-50"
                  >
                    {isSavingPerson ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW ATTENDEE RECORD */
              <>
                {/* Registration Details */}
                <div className="bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E2E8F0] space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Registration ID:</span>
                    <strong className="font-mono text-[#172033] font-semibold">{getFormattedRegId(selectedPerson)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Ticket Tier:</span>
                    <span className="font-medium text-[#172033]">{selectedPerson.ticketType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Company & Role:</span>
                    <span className="text-[#172033]">{selectedPerson.designation} · {selectedPerson.company}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Email:</span>
                    <span className="text-[#172033] font-mono">{selectedPerson.email || 'None provided'}</span>
                  </div>
                  {selectedPerson.mobile && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Mobile:</span>
                      <span className="text-[#172033] font-mono">{selectedPerson.mobile}</span>
                    </div>
                  )}
                  {selectedPerson.bio && (
                    <div className="pt-1 border-t border-[#E2E8F0]">
                      <span className="text-[#64748B] block mb-0.5">Bio:</span>
                      <p className="text-[#334155] leading-relaxed">{selectedPerson.bio}</p>
                    </div>
                  )}
                </div>

                {/* Focus Areas & Skills */}
                {((selectedPerson.interests && selectedPerson.interests.length > 0) || (selectedPerson.skills && selectedPerson.skills.length > 0)) && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Focus Areas & Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...(selectedPerson.interests || []), ...(selectedPerson.skills || [])])).map((tag, idx) => (
                        <span key={idx} className="text-[11px] bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-md font-medium border border-[#E2E8F0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement metrics */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B] block">Sessions</span>
                    <strong className="text-[13px] font-mono text-[#172033] font-semibold">4 Bookmarked</strong>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B] block">Connections</span>
                    <strong className="text-[13px] font-mono text-[#172033] font-semibold">8 Made</strong>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B] block">Check-in</span>
                    <strong className={`text-[13px] font-semibold ${selectedPerson.checkedIn ? 'text-green-600' : 'text-slate-500'}`}>
                      {selectedPerson.checkedIn ? 'Checked In ✓' : 'Registered'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedPerson(null);
                      setIsEditingPerson(false);
                    }}
                    className="w-full py-2 px-3 bg-[#14233B] hover:bg-[#1E304F] text-white font-medium text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSV Import Modal with Column Mapping */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-semibold text-[#172033]">Import External Registrations</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Upload a CSV file to register attendees (Max 5MB)</p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportResult(null);
                  setImportError(null);
                  setMappingStep('upload');
                }}
                className="p-1 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {importError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {importError}
              </div>
            )}

            {mappingStep === 'upload' && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#3563F6] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#F8FAFC]"
                >
                  <FileSpreadsheet className="w-8 h-8 text-[#3563F6] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#172033]">
                    {selectedFile ? selectedFile.name : 'Click to select CSV File'}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB · Click to change file`
                      : 'Accepts CSV with name, email, company, designation, ticketType'}
                  </p>
                </div>
                {selectedFile && (
                  <button
                    onClick={() => setMappingStep('mapping')}
                    className="w-full py-2 bg-[#3563F6] hover:bg-[#2554E5] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Proceed to Column Verification
                  </button>
                )}
              </div>
            )}

            {mappingStep === 'mapping' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#64748B]">
                  Verify CSV column mapping for <strong className="text-[#172033]">{selectedFile?.name}</strong>:
                </p>

                <div className="space-y-2 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Full Name:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "name" or "full_name"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Email Address:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "email"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Organization:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "company"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Ticket Tier / Category:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "ticket_type" or "category"</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setMappingStep('upload')}
                    className="py-2 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImportSubmit}
                    disabled={isImporting}
                    className="flex-1 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isImporting ? 'Importing CSV...' : 'Confirm & Import to Backend'}</span>
                  </button>
                </div>
              </div>
            )}

            {mappingStep === 'complete' && importResult && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CSV Import Completed</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <span className="text-[10px] text-[#64748B] block font-sans">Processed</span>
                      <strong className="text-emerald-900 text-sm">{importResult.totalProcessed}</strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <span className="text-[10px] text-[#64748B] block font-sans">Imported</span>
                      <strong className="text-emerald-900 text-sm">{importResult.totalImported}</strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <span className="text-[10px] text-[#64748B] block font-sans">Skipped</span>
                      <strong className="text-amber-800 text-sm">{importResult.totalSkipped}</strong>
                    </div>
                  </div>
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                    <span className="font-semibold text-amber-800 text-[11px]">Notice ({importResult.errors.length} skipped rows):</span>
                    <div className="max-h-24 overflow-y-auto text-[11px] text-amber-700 space-y-0.5 font-mono">
                      {importResult.errors.map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setImportResult(null);
                    setImportError(null);
                    setMappingStep('upload');
                  }}
                  className="w-full py-2 bg-[#14233B] hover:bg-[#1E304F] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Walk-in Attendee Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-semibold text-[#172033]">Add On-site Walk-in Attendee</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Instantly issues digital pass and marks checked-in</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#172033] mb-1">Full Name</label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  required
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#172033] mb-1">Email</label>
                  <input
                    type="email"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                    placeholder="maya@example.com"
                    required
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#172033] mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={walkInMobile}
                    onChange={(e) => setWalkInMobile(e.target.value)}
                    placeholder="+91 9800000000"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#172033] mb-1">Company</label>
                  <input
                    type="text"
                    value={walkInCompany}
                    onChange={(e) => setWalkInCompany(e.target.value)}
                    placeholder="Zomato"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#172033] mb-1">Designation</label>
                  <input
                    type="text"
                    value={walkInDesignation}
                    onChange={(e) => setWalkInDesignation(e.target.value)}
                    placeholder="Engineering Manager"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3563F6] focus:border-[#3563F6]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="py-2 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#3563F6] hover:bg-[#2554E5] active:bg-[#1D46CA] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Register & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
