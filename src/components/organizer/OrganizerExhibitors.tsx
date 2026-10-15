'use client';
import React, { useState, useEffect, useRef, Suspense } from "react";

import { ArrowUpRight, BarChart2, Briefcase, Building, Building2, Calendar, Download, LineChart, Mic, User, Users } from 'lucide-react';
import { useStore } from '../../lib/store';

export const OrganizerExhibitors: React.FC = () => {
  const { exhibitors, showToast } = useStore();

  const PAGE_SIZE = 11;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(exhibitors.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedExhibitors = exhibitors.slice(startIndex, startIndex + PAGE_SIZE);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, 6, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
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

  const handleExportCSV = () => {
    const headers = ['Company', 'Booth', 'Category', 'Leads Generated'];
    const rows = exhibitors.map((e) => [
      `"${e.company}"`,
      `"${e.booth}"`,
      `"${e.category}"`,
      e.leads || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventsphere-mpss26-exhibitor-directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exhibitor directory exported successfully ✓', 'success');
  };

  return (
    <div className="space-y-6 select-text max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            MPSS26 · INDORE · EXHIBITOR DIRECTORY
          </span>
          <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight mt-1">
            Exhibitors
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Confirmed exhibition booth locations and sponsor directory
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="h-9 px-4 bg-[#3563F6] hover:bg-[#2554E5] active:bg-[#1D46CA] text-white text-[13px] font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Directory</span>
        </button>
      </div>

      {/* Exhibitors Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="py-3.5 px-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#172033]">Sponsor & Exhibitor Directory</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Confirmed booth locations across exhibition halls</p>
          </div>
          <span className="text-xs font-medium text-[#64748B]">{exhibitors.length} Total Exhibitors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider bg-[#F8FAFC]">
                <th className="py-3 px-6">Company</th>
                <th className="py-3 px-6">Booth</th>
                <th className="py-3 px-6 text-right">Leads Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedExhibitors.map((ex) => (
                <tr
                  key={ex.id}
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs sm:text-sm text-[#172033]">{ex.company}</span>
                        {ex.company === 'Microsoft' && (
                          <span className="text-[10px] bg-blue-50 text-[#3563F6] border border-blue-200/60 font-medium px-1.5 py-0.5 rounded leading-none">
                            Featured Sponsor
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#64748B] block mt-0.5">{ex.category}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 font-mono text-xs font-semibold text-[#172033]">
                    {ex.booth}
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <span className="font-mono text-xs font-semibold text-[#172033]">
                      {(ex.leads || 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#64748B] ml-1">leads</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="py-3 px-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] bg-[#F8FAFC]">
          <div>
            Showing {exhibitors.length === 0 ? 0 : startIndex + 1}
            {paginatedExhibitors.length > 1 ? `–${startIndex + paginatedExhibitors.length}` : ''} of{' '}
            {exhibitors.length.toLocaleString()} · sorted by booth order
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
    </div>
  );
};
