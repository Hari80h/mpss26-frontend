'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Building2, User } from 'lucide-react';
import { useStore } from '../../lib/store';

export const DelegateBottomNavRouted: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setSelectedSessionId, setScheduleSubTab, setSessionBackTab, setViewSavedCompaniesOnly } = useStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/delegate/home' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, href: '/delegate/agenda/allsessions' },
    { id: 'exhibitors', label: 'Exhibitors', icon: Building2, href: '/delegate/exhibitors' },
    { id: 'profile', label: 'Profile', icon: User, href: '/delegate/profile' },
  ];

  const getActiveId = (): string => {
    if (!pathname) return 'home';
    if (
      pathname === '/delegate/home' ||
      pathname === '/delegate/speakers' ||
      pathname === '/delegate/polls' ||
      pathname === '/delegate/map' ||
      pathname === '/delegate/sponsors' ||
      pathname === '/delegate/people'
    ) {
      return 'home';
    }
    if (
      pathname.startsWith('/delegate/agenda') ||
      pathname.startsWith('/delegate/agenda/')
    ) {
      return 'agenda';
    }
    if (
      pathname === '/delegate/exhibitors' ||
      pathname.startsWith('/delegate/exhibitors/')
    ) {
      return 'exhibitors';
    }
    if (
      pathname === '/delegate/profile' ||
      pathname.startsWith('/delegate/profile/')
    ) {
      return 'profile';
    }
    return 'home';
  };

  const activeId = getActiveId();

  return (
    <nav className="flex-shrink-0 w-full z-40 bg-[#FFFFFF] border-t border-[#DEDCD7] pb-safe px-2 pt-1 shadow-md select-none">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'agenda') {
                  setSelectedSessionId(null);
                  setScheduleSubTab('all');
                  setSessionBackTab('schedule');
                }
                if (item.id === 'home') {
                  setSelectedSessionId(null);
                }
                if (item.id === 'exhibitors') {
                  setViewSavedCompaniesOnly(false);
                }
                router.push(item.href);
              }}
              className={`flex-1 flex flex-col items-center justify-center min-h-[42px] py-1 transition-colors relative ${
                isActive ? 'text-[#D11E39]' : 'text-[#6B6B6B] hover:text-[#181818]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] ${
                    isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <div className="flex flex-col items-center mt-1">
                <span
                  className={`text-[9.5px] font-medium tracking-tight ${
                    isActive ? 'font-bold' : ''
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-[#D11E39] rounded-full mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
