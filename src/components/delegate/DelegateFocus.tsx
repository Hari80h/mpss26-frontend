'use client';

import React from 'react';
import { Focus } from 'lucide-react';

export const DelegateFocus: React.FC = () => {
  return (
    <div className="flex-1 bg-[#F8F7F4] select-none h-full overflow-hidden flex flex-col px-3 pt-2 pb-2 gap-3">
      {/* Header matching natural style */}
      <div className="pt-2 pb-1 shrink-0">
        <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">MPSS26 · FOCUS</p>
        <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none">Focus</h1>
      </div>

      {/* Main Focus Card Container */}
      <div className="flex-1 bg-white p-6 rounded-[20px] border border-[#DEDCD7] shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-3.5 shadow-sm">
          <Focus className="w-8 h-8 text-[#D11E39] stroke-[2.2]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#181818] tracking-tight mb-1.5">
          Focus Mode
        </h2>
        <p className="text-[13px] text-[#6B6B6B] max-w-xs leading-relaxed">
          Ready for your instructions. What would you like to set up here?
        </p>
      </div>
    </div>
  );
};
