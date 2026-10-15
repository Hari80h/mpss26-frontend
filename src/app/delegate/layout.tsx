'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { PhoneFrame } from '../../components/shell/PhoneFrame';
import { DelegateBottomNavRouted } from '../../components/delegate/DelegateBottomNavRouted';
import { PersonDetailModal } from '../../components/modals/PersonDetailModal';
import { ContactPrivacyModal } from '../../components/modals/ContactPrivacyModal';
import { MyQRCodeModal } from '../../components/modals/MyQRCodeModal';
import { AccessScreen } from '../../components/auth/AccessScreen';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function DelegateLayout({ children }: { children: React.ReactNode }) {
  const { role, hasAccessConfirmed, setHasAccessConfirmed, toast } = useStore();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (role !== 'delegate') {
      router.push('/');
    }
  }, [role, router]);

  if (!hasAccessConfirmed) {
    return (
      <div className="bg-[#F6F4F0] min-h-[100dvh] flex flex-col font-sans">
        <PhoneFrame>
          <AccessScreen onSuccess={() => setHasAccessConfirmed(true)} />
        </PhoneFrame>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F4F0] min-h-[100dvh] flex flex-col font-sans">
      {/* Modals */}
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

      <PhoneFrame>
        {/* Mobile Toast */}
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

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
            {children}
          </div>
          <DelegateBottomNavRouted />
        </div>
      </PhoneFrame>
    </div>
  );
}
