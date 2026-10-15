'use client';

import React from 'react';
import { useStore } from '../../lib/store';
import { LayoutDashboard, Users, Package, MoreHorizontal } from 'lucide-react';

export const ExhibitorBottomNav: React.FC = React.memo(() => {
  const { activeExhibitorTab, setActiveExhibitorTab } = useStore();

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: LayoutDashboard },
    { id: 'leads' as const, label: 'Leads', icon: Users },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'more' as const, label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="flex-shrink-0 w-full z-40 bg-[#FFFFFF] border-t border-[#DEDCD7] pb-1.5 px-2 pt-2 shadow-sm select-none">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeExhibitorTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveExhibitorTab(item.id)}
              className={`w-full flex flex-col items-center justify-center py-1 transition-colors relative group focus:outline-none ${
                isActive ? 'text-[#D11E39]' : 'text-[#6B6B6B] hover:text-[#181818]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <div className="flex flex-col items-center mt-1">
                <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold text-[#D11E39]' : 'font-medium text-[#6B6B6B]'}`}>
                  {item.label}
                </span>
                <div
                  className={`w-4 h-0.5 rounded-full mt-0.5 transition-opacity ${
                    isActive ? 'bg-[#D11E39] opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

ExhibitorBottomNav.displayName = 'ExhibitorBottomNav';
