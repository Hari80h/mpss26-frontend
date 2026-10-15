'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import {
  Building2,
  Info,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  Globe,
  X,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

export const ExhibitorMore: React.FC = React.memo(() => {
  const { showToast, setHasAccessConfirmed } = useStore();

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'event' | 'company'>('event');

  const handleOpenModal = (tab: 'event' | 'company') => {
    setModalTab(tab);
    setIsInfoModalOpen(true);
  };

  const handleLogout = () => {
    setHasAccessConfirmed(false);
    showToast('Logged out successfully', 'info');
  };

  const handleCallSupport = () => {
    showToast('Connecting to Organizer Help Desk helpline (+91 80 2345 6789)...', 'info');
    window.location.href = 'tel:+918023456789';
  };

  return (
    <div className="flex-1 bg-[#F6F4F0] select-none px-4 pt-4 pb-24 space-y-5">
      {/* Header Profile Card */}
      <div className="bg-white p-5 rounded-3xl border border-[#DEDCD7] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1.5 border border-gray-200 shadow-sm overflow-hidden">
            <img src="/images/exhibitors/truechip.png" alt="Truechip" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#181818]">Truechip Solutions</h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Hall 1 · Booth A-02 · Verification IP & EDA
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#EFEEEA] px-2.5 py-1 rounded-md text-[#181818]">
          MPSS26
        </span>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-3xl border border-[#DEDCD7] shadow-sm divide-y divide-[#DEDCD7]/60 overflow-hidden text-sm">
        {/* Company Profile */}
        <div 
          onClick={() => handleOpenModal('company')}
          className="p-4 flex items-center justify-between hover:bg-[#F6F4F0] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#181818]" />
            </div>
            <div>
              <span className="font-semibold text-[#181818] text-base">Company Profile</span>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Booth overview, branding & description</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Event Information */}
        <div 
          onClick={() => handleOpenModal('event')}
          className="p-4 flex items-center justify-between hover:bg-[#F6F4F0] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-[#181818]" />
            </div>
            <div>
              <span className="font-semibold text-[#181818] text-base">Event Information</span>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Venue location, dates, booth logistics & map</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Help & Support (Redirects directly to call) */}
        <a 
          href="tel:+918023456789"
          onClick={(e) => {
            // Also trigger toast feedback
            showToast('Calling Organizer Help Desk (+91 80 2345 6789)...', 'info');
          }}
          className="p-4 flex items-center justify-between hover:bg-[#F6F4F0] cursor-pointer transition-colors block text-inherit no-underline"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#B51F32]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#181818] text-base">Help & Support</span>
                <span className="text-[10px] bg-[#EBF5F0] text-[#2F7D58] font-bold px-1.5 py-0.5 rounded">Call Helpline</span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Direct phone call to live organizer desk (+91 80 2345 6789)</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </a>
      </div>

      {/* Log Out Action */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-red-50 hover:bg-red-100 active:scale-[0.99] border border-red-200 text-[#B51F32] font-semibold text-[14px] rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-[#B51F32]" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Information Modal (Event & Company details) */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#F6F4F0] rounded-[28px] w-full max-w-sm max-h-[86vh] flex flex-col shadow-2xl border border-[#DEDCD7] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-[#DEDCD7] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#181818] text-[17px]">
                  {modalTab === 'event' ? 'Event & Venue Guide' : 'Company Profile'}
                </h3>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                  MPSS26 · Hall 1 · Booth A-02
                </p>
              </div>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F4F0] hover:bg-[#EAE7E0] text-[#181818] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="px-4 pt-3 pb-1 bg-white">
              <div className="bg-[#EFEEEA] p-1 rounded-xl flex gap-1">
                <button
                  type="button"
                  onClick={() => setModalTab('event')}
                  className={`flex-1 py-1.5 text-[12.5px] rounded-lg font-medium transition-all ${
                    modalTab === 'event'
                      ? 'bg-white text-[#181818] font-bold shadow-sm'
                      : 'text-[#6B6B6B] hover:text-[#181818]'
                  }`}
                >
                  Event & Venue
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('company')}
                  className={`flex-1 py-1.5 text-[12.5px] rounded-lg font-medium transition-all ${
                    modalTab === 'company'
                      ? 'bg-white text-[#181818] font-bold shadow-sm'
                      : 'text-[#6B6B6B] hover:text-[#181818]'
                  }`}
                >
                  Company Details
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
              {modalTab === 'event' ? (
                <>
                  {/* Event Banner */}
                  <div className="bg-white p-4 rounded-2xl border border-[#DEDCD7] shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B51F32] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        MPSS26 Official
                      </span>
                      <span className="text-[11.5px] font-semibold text-[#2F7D58] bg-[#EBF5F0] px-2 py-0.5 rounded">
                        Live Event
                      </span>
                    </div>
                    <h4 className="text-[18px] font-serif font-bold text-[#181818]">
                      MP Semiconductor Summit 2026
                    </h4>
                    <p className="text-[12.5px] text-[#555555] leading-relaxed">
                      Madhya Pradesh&apos;s premier semiconductor and chip manufacturing summit, convening global chipmakers, fab leaders, founders, and policy makers.
                    </p>
                  </div>

                  {/* Venue & Location Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#DEDCD7] shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-[#B51F32]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                          Venue Location
                        </span>
                        <p className="text-[13.5px] font-bold text-[#181818] mt-0.5">
                          Brilliant Convention Centre, Indore
                        </p>
                        <p className="text-[12px] text-[#6B6B6B] mt-0.5 leading-relaxed">
                          Indore, Madhya Pradesh, India
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#EAE7E0] pt-2.5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-[#181818]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                          Event Dates & Hours
                        </span>
                        <p className="text-[13.5px] font-bold text-[#181818] mt-0.5">
                          23–24 October 2026
                        </p>
                        <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                          09:00 AM – 06:00 PM IST (Exhibitor hall access from 08:00 AM)
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#EAE7E0] pt-2.5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers className="w-4 h-4 text-[#181818]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                          Exhibitor Hall & Zone
                        </span>
                        <p className="text-[13.5px] font-bold text-[#181818] mt-0.5">
                          Hall B · Semiconductor Ecosystem Pavilion
                        </p>
                        <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                          Hall 1 · Booth A-02 (Prominent semiconductor verification pavilion position)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Company Profile Header */}
                  <div className="bg-white p-4 rounded-2xl border border-[#DEDCD7] shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 border border-gray-200 shadow-sm overflow-hidden">
                        <img src="/images/exhibitors/truechip.png" alt="Truechip" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-[18px] font-serif font-bold text-[#181818]">
                          Truechip Solutions
                        </h4>
                        <span className="text-[11.5px] font-bold text-[#B51F32] bg-red-50 border border-red-200 px-2 py-0.5 rounded inline-block mt-0.5">
                          The Verification IP Specialist
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#555555] leading-relaxed">
                      Truechip is a leading global provider of Design and Verification solutions which helps accelerate semiconductor design, lowering the cost and the risks associated with the development of ASIC, FPGA, and SoC designs. Trusted across 100+ silicon tapeouts worldwide.
                    </p>
                  </div>

                  {/* Official Contact & Web Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#DEDCD7] shadow-sm space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block">
                      Official Contacts
                    </span>
                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-[#181818]">
                        <Globe className="w-4 h-4 text-[#737373] shrink-0" />
                        <span className="font-medium">www.truechip.net</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[#181818]">
                        <Mail className="w-4 h-4 text-[#737373] shrink-0" />
                        <span className="font-medium">info@truechip.net</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[#181818]">
                        <MapPin className="w-4 h-4 text-[#737373] shrink-0" />
                        <span className="font-medium">Hall 1 · Booth A-02, Brilliant Convention Centre, Indore</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Bottom Action */}
            <div className="p-3 bg-white border-t border-[#DEDCD7] flex gap-2">
              <a
                href="tel:+918023456789"
                className="flex-1 h-10 bg-[#B51F32] hover:bg-[#9C1A2B] text-white font-semibold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-inherit no-underline"
              >
                <Phone className="w-4 h-4" />
                <span>Call Helpdesk</span>
              </a>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="h-10 px-4 bg-[#EFEEEA] hover:bg-[#EAE7E0] text-[#181818] font-semibold text-[13px] rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ExhibitorMore.displayName = 'ExhibitorMore';
