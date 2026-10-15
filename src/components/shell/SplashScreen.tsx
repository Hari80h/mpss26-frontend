'use client';

import React from 'react';

interface SplashScreenProps {
  onDismiss?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#F6F4F0] select-none cursor-pointer"
    >
      <div className="w-full flex justify-end">
        <span className="text-xs text-[#6B6B6B] border border-[#DEDCD7] px-2.5 py-1 rounded-full bg-white">
          MPSS26 · Official Digital Layer
        </span>
      </div>

      <div className="flex flex-col items-center text-center -mt-12">
        {/* Animated Brand Emblem */}
        <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-[14px] bg-[#B51F32] shadow-sm transform -rotate-3" />
          <div className="absolute inset-0 rounded-[14px] bg-[#181818] transform rotate-3 opacity-10" />
          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            <span className="text-[15px] font-black tracking-tight">ES</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-[#181818] tracking-tight">
          Event<span className="text-[#B51F32]">Sphere</span>
        </h1>
        <p className="text-[12px] text-[#6B6B6B] mt-2 font-medium">
          The Digital Engagement Layer for Professional Events
        </p>

        <div className="mt-8 px-3 py-2 bg-white rounded-lg border border-[#DEDCD7] shadow-sm">
          <p className="text-xs font-semibold text-[#181818]">India Tech Summit 2026</p>
          <p className="text-[11px] text-[#6B6B6B]">12–14 Feb 2026 · Bengaluru</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#B51F32] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#6B6B6B]">Loading event session data...</span>
      </div>
    </div>
  );
};
