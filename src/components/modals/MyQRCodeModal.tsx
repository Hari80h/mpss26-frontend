'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { useStore } from '../../lib/store';
import { X, ShieldCheck, Share2 } from 'lucide-react';

interface MyQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
}

export const MyQRCodeModal: React.FC<MyQRCodeModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacy,
}) => {
  const { currentUser } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-[24px] w-full max-w-[340px] p-6 shadow-2xl relative text-center">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-[#6B6B6B] hover:text-[#181818] transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Top Badge */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#FFF0F2] border border-[#FCE8E8] mb-4">
          <span className="text-[11px] font-bold tracking-widest text-[#B51F32]">
            MY BADGE
          </span>
        </div>

        {/* Identity */}
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-[#181818] tracking-tight mb-1">{currentUser.name}</h2>
          <p className="text-[14px] text-[#4B5563]">
            {currentUser.designation} <span className="opacity-60">·</span> {currentUser.company}
          </p>
        </div>

        {/* QR Code */}
        <div className="w-[260px] h-[260px] mx-auto rounded-[20px] overflow-hidden flex items-center justify-center mb-6 p-4 border border-[#E5E7EB] shadow-sm">
          <QRCode 
            value={`eventsphere://reg/${currentUser.registrationId}`} 
            size={228}
            bgColor="#FFFFFF"
            fgColor="#181818"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>

        {/* Privacy Preset Shortcut */}
        <div className="flex items-center justify-center gap-2 text-[13px] pt-4 border-t border-gray-100">
          <span className="text-[#6B6B6B]">Sharing: <strong className="text-[#181818]">{currentUser.privacy.preset}</strong></span>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => {
              onClose();
              onOpenPrivacy();
            }}
            className="font-semibold text-[#B51F32] hover:underline"
          >
            Adjust Privacy
          </button>
        </div>
      </div>
    </div>
  );
};
