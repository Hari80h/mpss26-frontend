'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, MapPin } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getExhibitorSlug } from '../../lib/exhibitorSlug';

export const DelegateCompanies: React.FC = () => {
  const router = useRouter();
  const {
    setActiveDelegateTab,
    setSelectedCompanyId,
    exhibitors,
    viewSavedCompaniesOnly,
    setViewSavedCompaniesOnly,
    savedCompanyIds,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredExhibitors = exhibitors.filter((company) => {
    if (viewSavedCompaniesOnly && !savedCompanyIds.includes(company.id)) return false;

    const matchesSearch =
      searchQuery === '' ||
      company.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.booth && company.booth.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.category && company.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="flex-1 min-h-0 h-full bg-[#F8F7F4] select-none flex flex-col overflow-hidden">
      {/* Fixed Top Section: Header & Search matching Schedule */}
      <div className="shrink-0 bg-[#F8F7F4] px-3 z-10 border-b border-[#E5E7EB]">
        {/* Header section matching reference mockup */}
        <div className="pt-4 pb-1">
          {viewSavedCompaniesOnly ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">
                  MPSS26 · SAVED
                </p>
                <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none">
                  Saved Exhibitors
                </h1>
              </div>
              <button
                onClick={() => {
                  setViewSavedCompaniesOnly(false);
                  router.push('/delegate/profile');
                }}
                className="px-3 py-1.5 rounded-full bg-white border border-[#DEDCD7] text-[#181818] font-bold text-[11px] shadow-sm hover:bg-[#FAF9F5] active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Profile</span>
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">
                MPSS26 · DIRECTORY
              </p>
              <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none">
                Exhibitors
              </h1>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mt-1 pb-2.5">
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-[15px]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewSavedCompaniesOnly ? "Search saved exhibitors..." : "Search companies, booths, or tags..."}
            className="w-full h-10 bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-9 text-[12.5px] focus:ring-2 focus:ring-[#B51F32]/20 focus:border-[#B51F32] outline-none text-[#181818] placeholder-[#9CA3AF] shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-[13px] text-[11px] font-bold text-[#6B6B6B] hover:text-[#181818]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 no-scrollbar pb-2.5">
        <p className="text-[11.5px] font-semibold text-[#6B6B6B] px-0.5">
          {filteredExhibitors.length} {viewSavedCompaniesOnly ? 'Saved Exhibitor' : 'Exhibitor'}{filteredExhibitors.length !== 1 ? 's' : ''}
        </p>

        {filteredExhibitors.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[16px] border border-[#DEDCD7] shadow-xs">
            <p className="text-xs font-semibold text-[#181818]">No exhibitors found</p>
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              Try adjusting your search keywords or filter category.
            </p>
          </div>
        ) : (
          filteredExhibitors.map((company) => (
            <div
              key={company.id}
              onClick={() => {
                router.push(`/delegate/exhibitors/${getExhibitorSlug(company)}`);
              }}
              className="bg-white rounded-[16px] border border-[#E2E8F0] hover:border-[#CBD5E1] p-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.company}
                      className="w-11 h-11 rounded-xl object-contain p-1 border border-[#E5E7EB] flex-shrink-0 bg-white"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          company.company
                        )}&background=F3F4F6&color=181818&bold=true`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#F6F4F0] border border-[#E5E7EB] flex items-center justify-center font-bold text-[13px] text-[#181818] flex-shrink-0">
                      {company.company.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-[#181818] leading-snug truncate">
                      {company.company}
                    </h3>
                    <p className="text-[11.5px] text-[#6B6B6B] truncate mt-0.5">
                      {company.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {company.booth && (
                    <span className="text-[8.5px] font-semibold bg-[#F0FDF4] border border-[#BBF7D0] px-1.5 py-0.5 rounded-md text-[#166534] flex items-center gap-0.5 tracking-tight whitespace-nowrap">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      Booth {company.booth}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-[#B51F32] flex items-center gap-0.5">
                    Visit &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
