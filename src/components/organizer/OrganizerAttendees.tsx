'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
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
  QrCode
} from 'lucide-react';
import { Person } from '../../types';

export const OrganizerAttendees: React.FC = () => {
  const {
    attendees,
    toggleCheckIn,
    addWalkInAttendee,
    importAttendeesMock,
    showToast,
    event,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Delegates' | 'VIP' | 'Speakers' | 'Exhibitors'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(11);

  // Reset to page 1 whenever search query, filter tab, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, pageSize]);

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

  // CSV column mapping state
  const [mappingStep, setMappingStep] = useState<'upload' | 'mapping' | 'complete'>('upload');
  const [importedRowCount, setImportedRowCount] = useState(120);

  // Filter attendees
  const filteredAttendees = attendees.filter((person) => {
    const q = searchQuery.toLowerCase().trim();
    const regId = (person.registrationId || '').toLowerCase();
    const matchesSearch =
      q === '' ||
      person.name.toLowerCase().includes(q) ||
      person.company.toLowerCase().includes(q) ||
      person.designation.toLowerCase().includes(q) ||
      person.email.toLowerCase().includes(q) ||
      regId.includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'Delegates') return person.role === 'delegate' || (!person.role && !person.ticketType?.toLowerCase().includes('speaker') && !person.ticketType?.toLowerCase().includes('vip') && !person.ticketType?.toLowerCase().includes('exhibitor'));
    if (activeTab === 'VIP') return person.role === 'vip' || person.ticketType?.toLowerCase().includes('vip');
    if (activeTab === 'Speakers') return person.role === 'speaker' || person.ticketType?.toLowerCase().includes('speaker');
    if (activeTab === 'Exhibitors') return person.role === 'exhibitor_staff' || person.ticketType?.toLowerCase().includes('exhibitor');
    return true; // 'All'
  });

  const totalRecords = event.totalRegistered || 2438;

  const totalPages = Math.max(1, Math.ceil(filteredAttendees.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedAttendees = filteredAttendees.slice(startIndex, startIndex + pageSize);

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

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInEmail) return;

    addWalkInAttendee({
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
  };

  const handleConfirmImport = () => {
    importAttendeesMock(importedRowCount);
    setShowImportModal(false);
    setMappingStep('upload');
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
            Showing {filteredAttendees.length === 0 ? 0 : startIndex + 1}
            {paginatedAttendees.length > 1 ? `–${startIndex + paginatedAttendees.length}` : ''} of{' '}
            {filteredAttendees.length.toLocaleString()} · sorted by registration order
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
              <button
                onClick={() => setSelectedPerson(null)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                <span className="text-[#172033] font-mono">{selectedPerson.email}</span>
              </div>
            </div>

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
                <span className="text-[11px] text-[#64748B] block">QR Scans</span>
                <strong className="text-[13px] font-mono text-[#172033] font-semibold">14 Scanned</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedPerson(null)}
                className="w-full py-2 px-3 bg-[#14233B] hover:bg-[#1E304F] text-white font-medium text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
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
                <p className="text-xs text-[#64748B] mt-0.5">Map CSV columns to EventSphere attendee schema</p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {mappingStep === 'upload' && (
              <div className="space-y-3">
                <div
                  onClick={() => setMappingStep('mapping')}
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#3563F6] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#F8FAFC]"
                >
                  <FileSpreadsheet className="w-8 h-8 text-[#3563F6] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#172033]">Click to select CSV File</p>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Simulating: <strong className="text-[#172033]">mpss26_external_registrations_batch2.csv</strong> (120 rows)
                  </p>
                </div>
                <button
                  onClick={() => setMappingStep('mapping')}
                  className="w-full py-2 bg-[#3563F6] hover:bg-[#2554E5] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Proceed to Column Mapping
                </button>
              </div>
            )}

            {mappingStep === 'mapping' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#64748B]">
                  Verify CSV column mapping for 120 attendee records:
                </p>

                <div className="space-y-2 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Full Name:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "Full_Name"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Email Address:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "Email"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Organization:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "Company"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Ticket Tier:</span>
                    <span className="font-mono font-semibold text-[#172033]">CSV Col: "Pass_Category"</span>
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
                    onClick={handleConfirmImport}
                    className="flex-1 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Import 120 Records</span>
                  </button>
                </div>
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
