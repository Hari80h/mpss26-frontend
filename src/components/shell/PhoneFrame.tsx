'use client';

import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-[100dvh] md:h-screen md:min-h-screen bg-[#F6F4F0] md:bg-[#EFEEEA] flex flex-col items-center justify-start md:py-6 overflow-hidden">
      {/* 
        Native PWA layout:
        - Mobile: exact 100dvh viewport height, edge-to-edge, zero margin/padding.
        - Desktop (md+): centered mobile frame (max-w-[430px]) with subtle border and shadow.
      */}
      <div className="w-full md:max-w-[430px] h-full md:h-[880px] md:max-h-[94vh] bg-[#F6F4F0] md:rounded-[32px] md:shadow-2xl md:border md:border-[#DEDCD7] flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};
