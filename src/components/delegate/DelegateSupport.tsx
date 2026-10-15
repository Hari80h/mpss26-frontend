'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { ChevronLeft, Phone, Mail, MapPin } from 'lucide-react';

export const DelegateSupport: React.FC = () => {
  const router = useRouter();
  const { setActiveDelegateTab } = useStore();

  return (
    <div className="flex-1 min-h-0 h-full bg-[#F8F7F4] select-none flex flex-col overflow-hidden">
      {/* Top Fixed Header matching Profile & Schedule */}
      <div className="shrink-0 bg-[#F8F7F4] px-3 z-10 border-b border-[#E5E7EB]">
        <div className="pt-4 pb-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">
              MPSS26 · SUPPORT
            </p>
            <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none">
              Help & Support
            </h1>
          </div>
          <button
            onClick={() => router.push('/delegate/profile')}
            className="px-3 py-1.5 rounded-full bg-white border border-[#DEDCD7] text-[#181818] font-bold text-[11px] shadow-sm hover:bg-[#FAF9F5] active:scale-95 transition-all flex items-center gap-1 shrink-0"
            aria-label="Back to Profile"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Content: Helpdesk Hotlines only */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-3 space-y-3">
        {/* Helpdesk Hotlines Card */}
        <div className="bg-white p-4 rounded-[16px] border border-[#DEDCD7] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#181818]">Helpdesk Hotlines</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              Available 8 AM – 8 PM
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="tel:+917314255000"
              className="p-3 rounded-xl border border-[#E5E7EB] hover:border-[#181818] bg-[#F9FAFB] hover:bg-white flex flex-col gap-1 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[#181818]">
                <Phone className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="text-[12px] font-bold">Call Helpdesk</span>
              </div>
              <span className="text-[11px] text-[#4B5563] font-mono group-hover:text-[#181818]">
                +91 731 425 5000
              </span>
            </a>

            <a
              href="mailto:ed1@mpsedc.com"
              className="p-3 rounded-xl border border-[#E5E7EB] hover:border-[#181818] bg-[#F9FAFB] hover:bg-white flex flex-col gap-1 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-[#181818]">
                <Mail className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-[12px] font-bold">Email Support</span>
              </div>
              <span className="text-[11px] text-[#4B5563] truncate group-hover:text-[#181818]">
                ed1@mpsedc.com
              </span>
            </a>
          </div>

          <div className="pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#6B6B6B]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#9CA3AF]" />
              Physical Desk: Ground Floor Foyer A
            </span>
            <span className="font-semibold text-[#181818]">Counter 01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
