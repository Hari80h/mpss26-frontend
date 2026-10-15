'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../lib/store';
import { DemoBar } from '../components/shell/DemoBar';
import { AddToHomeScreenBanner } from '../components/shell/AddToHomeScreenBanner';
import { PhoneFrame } from '../components/shell/PhoneFrame';
import { AccessScreen } from '../components/auth/AccessScreen';

// Delegate views
import { DelegateHome } from '../components/delegate/DelegateHome';
import { DelegatePeople } from '../components/delegate/DelegatePeople';
import { DelegateFocus } from '../components/delegate/DelegateFocus';
import { DelegateSchedule } from '../components/delegate/DelegateSchedule';
import { DelegateProfile } from '../components/delegate/DelegateProfile';
import { DelegateEditProfile } from '../components/delegate/DelegateEditProfile';
import { DelegateBottomNav } from '../components/delegate/DelegateBottomNav';
import { DelegateCompanies } from '../components/delegate/DelegateCompanies';
import { DelegateCompanyDetail } from '../components/delegate/DelegateCompanyDetail';
import { DelegateAIRecommendations } from '../components/delegate/DelegateAIRecommendations';
import { DelegateSpeakers } from '../components/delegate/DelegateSpeakers';
import { DelegatePolls } from '../components/delegate/DelegatePolls';
import { DelegateMap } from '../components/delegate/DelegateMap';
import { DelegateSponsors } from "../components/delegate/DelegateSponsors";
import { DelegateSupport } from '../components/delegate/DelegateSupport';

// Exhibitor views
import { ExhibitorHome } from '../components/exhibitor/ExhibitorHome';
import { ExhibitorLeads } from '../components/exhibitor/ExhibitorLeads';
import { ExhibitorScan } from '../components/exhibitor/ExhibitorScan';
import { ExhibitorProducts } from '../components/exhibitor/ExhibitorProducts';
import { ExhibitorMore } from '../components/exhibitor/ExhibitorMore';
import { ExhibitorBottomNav } from '../components/exhibitor/ExhibitorBottomNav';

// Organizer console
import { OrganizerConsole } from '../components/organizer/OrganizerConsole';

// Modals
import { ContactPrivacyModal } from '../components/modals/ContactPrivacyModal';
import { PersonDetailModal } from '../components/modals/PersonDetailModal';
import { MyQRCodeModal } from '../components/modals/MyQRCodeModal';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function App() {
  const router = useRouter();
  const {
    role,
    hasAccessConfirmed,
    setHasAccessConfirmed,
    setRole,
    activeDelegateTab,
    activeExhibitorTab,
    toast,
  } = useStore();

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (hasAccessConfirmed && role === 'delegate') {
      router.replace('/delegate/home');
    }
  }, [hasAccessConfirmed, role, router]);

  return (
    <div className={`bg-[#F6F4F0] flex flex-col font-sans ${role === 'organizer' ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>


      {/* Modals for Delegate Experience */}
      <ContactPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <MyQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />
      <PersonDetailModal />

      {/* Floating Feedback Toast Notification for Organizer */}
      {toast && role === 'organizer' && (
        <div className="fixed top-14 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#181818] text-white px-3 py-2.5 rounded-lg shadow-lg border border-[#333333] flex items-center gap-2.5 text-xs max-w-sm">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2F7D58] flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#B51F32] flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#00A4EF] flex-shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main View Router based on Role */}
      {!hasAccessConfirmed ? (
        <PhoneFrame>
          <AccessScreen onSuccess={() => setHasAccessConfirmed(true)} />
        </PhoneFrame>
      ) : role === 'organizer' ? (
        /* Full-Width Desktop Organizer Console */
        <OrganizerConsole />
      ) : (
        /* Delegate or Exhibitor in Mobile-First Phone Container */
        <PhoneFrame>
          {/* Add-to-Home-Screen PWA Banner (inside mobile frame) */}
          {/* <AddToHomeScreenBanner /> */}

          {/* Mobile Toast Notification */}
          {toast && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-200 w-[90%] max-w-[340px]">
              <div className="bg-[#181818] text-white px-3 py-3 rounded-[14px] shadow-xl border border-[#333333] flex items-center gap-2 text-[12px]">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2F7D58] flex-shrink-0" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-[#B51F32] flex-shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-[#00A4EF] flex-shrink-0" />
                )}
                <span className="font-semibold truncate">{toast.message}</span>
              </div>
            </div>
          )}
          {role === 'delegate' ? (
              /* Delegate Experience */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                  {activeDelegateTab === 'home' && <DelegateHome />}
                  {activeDelegateTab === 'people' && <DelegatePeople />}
                  {(activeDelegateTab === 'focus' || activeDelegateTab === 'scan') && <DelegateFocus />}
                  {activeDelegateTab === 'schedule' && <DelegateSchedule />}
                  {activeDelegateTab === 'companies' && <DelegateCompanies />}
                  {activeDelegateTab === 'company_detail' && <DelegateCompanyDetail />}
                  {activeDelegateTab === 'ai_recommendations' && <DelegateAIRecommendations />}
                  {activeDelegateTab === 'speakers' && <DelegateSpeakers />}
                  {activeDelegateTab === 'polls' && <DelegatePolls />}
                  {activeDelegateTab === 'map' && <DelegateMap />}
                  {activeDelegateTab === "sponsors" && <DelegateSponsors />}
                  {activeDelegateTab === 'support' && <DelegateSupport />}
                  {activeDelegateTab === 'profile' && (
                    <DelegateProfile
                      onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
                      onOpenQRModal={() => setIsQRModalOpen(true)}
                    />
                  )}
                  {activeDelegateTab === 'edit_profile' && <DelegateEditProfile />}
                </div>
                <DelegateBottomNav />
              </div>
          ) : (
            /* Exhibitor (Truechip Solutions) Experience */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain no-scrollbar">
                {activeExhibitorTab === 'home' && <ExhibitorHome />}
                {activeExhibitorTab === 'leads' && <ExhibitorLeads />}
                {activeExhibitorTab === 'scan' && <ExhibitorScan />}
                {activeExhibitorTab === 'products' && <ExhibitorProducts />}
                {activeExhibitorTab === 'more' && <ExhibitorMore />}
              </div>
              <ExhibitorBottomNav />
            </div>
          )}
        </PhoneFrame>
      )}
    </div>
  );
}
