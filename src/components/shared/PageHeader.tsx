import React from 'react';
import { LucideIcon, ChevronLeft } from 'lucide-react';

export type ThemeColor = 'red' | 'green' | 'blue' | 'purple' | 'amber' | 'gray';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  theme?: ThemeColor; // Kept for backwards compatibility but ignored visually
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon: Icon, onBack }) => {
  return (
    <div className="flex items-start bg-[#EFEBE5] rounded-[20px] p-3.5 shadow-sm relative overflow-hidden mb-3">
      {/* Subtle background decoration to mimic the waves from Home */}
      <div className="absolute -top-12 -right-8 w-28 h-28 bg-white/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-28 h-28 bg-[#E5DFD6]/60 rounded-full blur-xl pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-3 w-full">
        <div className="flex flex-col items-center gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm transition-colors active:scale-95 text-[#181818]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-shrink-0 w-11 h-11 rounded-[12px] bg-white shadow-sm flex items-center justify-center border border-white/50">
            <Icon className="w-5 h-5 text-[#181818]" strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
          <h1 className="text-[24px] font-serif font-medium text-[#181818] tracking-tight leading-none mb-1.5">{title}</h1>
          <p className="text-[12.5px] font-bold text-[#6B6B6B] leading-snug">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
