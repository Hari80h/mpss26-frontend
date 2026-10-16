'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building, Calendar, ChevronRight, HelpCircle, LogOut, Pencil, Star } from 'lucide-react';

import { useStore } from '../../lib/store';
import { calculateProfileCompletion } from '../../lib/mockData';

interface DelegateProfileProps {
  onOpenPrivacyModal?: () => void;
  onOpenQRModal?: () => void;
}

export const DelegateProfile: React.FC<DelegateProfileProps> = () => {
  const router = useRouter();
  const {
    currentUser,
    savedPeopleIds,
    sessions,
    showToast,
    setActiveDelegateTab,
    setSelectedSessionId,
    setViewSavedPeopleOnly,
    setViewSavedCompaniesOnly,
    savedCompanyIds,
    logout,
    setScheduleSubTab,
  } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/delegate/home');
  };

  const savedSessionsCount = sessions.filter((s) => s.isBookmarked).length;
  const profileCompletion = calculateProfileCompletion(currentUser); 

  return (
    <div className="flex-1 min-h-0 h-full bg-[#F8F7F4] select-none overflow-y-auto px-3 pt-1.5 pb-4 space-y-2">
      {/* Header matching directory & schedule typography */}
      <div className="pt-2 pb-1">
        <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">MPSS26 · DELEGATE</p>
        <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none">Profile</h1>
      </div>
      
      {/* Identity Card */}
      <div className="bg-white py-2.5 px-3.5 rounded-[14px] border border-[#DEDCD7] shadow-xs relative">
        <button 
          onClick={() => router.push('/delegate/profile/edit')}
          className="absolute top-2.5 right-2.5 p-1 text-[#6B6B6B] hover:text-[#181818] transition-colors"
          title="Edit Profile"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          {currentUser.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name || 'Delegate'} 
              className="w-12 h-12 rounded-full object-cover border border-[#E5E7EB] flex-shrink-0" 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#F6F4F0] border border-[#E5E7EB] text-[#181818] flex items-center justify-center font-bold text-[16px] flex-shrink-0">
              {currentUser.name ? currentUser.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) : '?'}
            </div>
          )}
          <div className="pr-6 space-y-0.5 min-w-0 flex-1">
            <h2 className="text-[15.5px] font-bold text-[#181818] tracking-tight leading-tight truncate">
              {currentUser.name || 'Anonymous Delegate'}
            </h2>
            <p className="text-[12px] text-[#6B6B6B] leading-tight truncate">
              {[currentUser.designation, currentUser.company].filter(Boolean).join(' · ') || 'No title or company added'}
            </p>
            <p className="text-[11.5px] text-[#8BA5CD] font-medium leading-tight">
              {currentUser.ticketType || 'Delegate'} · 2-day
            </p>
          </div>
        </div>
        
        {/* Profile Completion */}
        <div className="mt-2.5 pt-2 border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between text-[10.5px] font-bold mb-1">
            <span className="text-[#6B6B6B] uppercase tracking-wider">Profile Completion</span>
            <span className={profileCompletion === 100 ? "text-[#16A34A] font-bold" : "text-[#181818]"}>
              {profileCompletion}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                profileCompletion === 100 ? 'bg-[#16A34A]' : 'bg-[#181818]'
              }`}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Boxes: Saved People, Saved Exhibitors, My Schedule, Help & Support */}
      <div className="space-y-2">
        {/* Saved People */}
        <button
          onClick={() => {
            router.push('/delegate/profile/saved-people');
          }}
          className="w-full bg-white py-3 px-3.5 rounded-[14px] border border-[#DEDCD7] shadow-xs hover:border-[#181818] transition-all text-left flex items-center justify-between active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6F4F0] border border-[#EBE8E2] flex items-center justify-center text-[#181818] group-hover:bg-[#181818] group-hover:text-white transition-colors flex-shrink-0">
              <Star className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[#181818] text-[14px] tracking-tight">Saved People</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#4B5563] border border-[#E5E7EB]">
                {savedPeopleIds.length}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#181818] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Saved Exhibitors */}
        <button
          onClick={() => {
            router.push('/delegate/profile/saved-exhibitors');
          }}
          className="w-full bg-white py-3 px-3.5 rounded-[14px] border border-[#DEDCD7] shadow-xs hover:border-[#181818] transition-all text-left flex items-center justify-between active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6F4F0] border border-[#EBE8E2] flex items-center justify-center text-[#181818] group-hover:bg-[#181818] group-hover:text-white transition-colors flex-shrink-0">
              <Building className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[#181818] text-[14px] tracking-tight">Saved Exhibitors</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#4B5563] border border-[#E5E7EB]">
                {savedCompanyIds.length}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#181818] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* My Schedule */}
        <button
          onClick={() => {
            router.push('/delegate/agenda/myschedule');
          }}
          className="w-full bg-white py-3 px-3.5 rounded-[14px] border border-[#DEDCD7] shadow-xs hover:border-[#181818] transition-all text-left flex items-center justify-between active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6F4F0] border border-[#EBE8E2] flex items-center justify-center text-[#181818] group-hover:bg-[#181818] group-hover:text-white transition-colors flex-shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[#181818] text-[14px] tracking-tight">My Schedule</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#4B5563] border border-[#E5E7EB]">
                {savedSessionsCount}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#181818] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Help & Support */}
        <button
          onClick={() => {
            router.push('/delegate/profile/help');
          }}
          className="w-full bg-white py-3 px-3.5 rounded-[14px] border border-[#DEDCD7] shadow-xs hover:border-[#181818] transition-all text-left flex items-center justify-between active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6F4F0] border border-[#EBE8E2] flex items-center justify-center text-[#181818] group-hover:bg-[#181818] group-hover:text-white transition-colors flex-shrink-0">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <span className="font-medium text-[#181818] text-[14px] tracking-tight">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#181818] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Log out Action directly below Help & Support */}
      <div className="pt-1 pb-4">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-white hover:bg-red-50 border border-[#DEDCD7] hover:border-red-200 text-[#B51F32] font-semibold text-[13px] rounded-[13px] shadow-xs transition-colors flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};
