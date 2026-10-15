'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { OrganizerOverview } from './OrganizerOverview';
import { OrganizerAttendees } from './OrganizerAttendees';
import { OrganizerExhibitors } from './OrganizerExhibitors';
import { OrganizerSessions } from './OrganizerSessions';
import { OrganizerReports } from './OrganizerReports';
import { OrganizerSettings } from './OrganizerSettings';

export const OrganizerConsole: React.FC = () => {
  const {
    activeOrganizerTab,
    setActiveOrganizerTab,
    event,
    setHasAccessConfirmed,
  } = useStore();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const sidebarItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'attendees' as const, label: 'Attendees', icon: Users, badge: event.totalRegistered.toLocaleString() },
    { id: 'exhibitors' as const, label: 'Exhibitors', icon: Building2, badge: event.totalExhibitors.toString() },
    { id: 'sessions' as const, label: 'Sessions', icon: Calendar },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex-1 h-full min-h-0 w-full bg-[#F4F6FA] flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Header (Small screens only) */}
      <div className="md:hidden no-print bg-[#14233B] text-white px-4 py-3 border-b border-[#1E293B] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#3563F6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            E
          </div>
          <div className="min-w-0">
            <span className="text-[14px] font-semibold text-white truncate block leading-tight">
              EventSphere
            </span>
            <span className="text-[11px] text-[#94A3B8] truncate block">
              {event.name}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`no-print ${
          isMobileNavOpen ? 'flex' : 'hidden'
        } md:flex w-full md:w-[260px] h-full bg-[#14233B] text-white flex-col justify-between flex-shrink-0 border-r border-[#1E293B] z-20 overflow-y-auto`}
      >
        <div className="p-5 space-y-5">
          {/* Brand & Console Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3563F6] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              E
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-white tracking-tight leading-tight">
                EventSphere
              </h2>
              <p className="text-[11px] text-[#94A3B8] font-normal mt-0.5">
                Organizer Console
              </p>
            </div>
          </div>

          {/* Clean Event Selector / Status Box */}
          <div className="p-3 bg-[#0F1B2D] rounded-lg border border-[#1E2E4A]">
            <p className="text-[13px] font-medium text-white truncate" title={event.name}>
              {event.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#94A3B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
              <span>{event.id} · LIVE</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-1">
            {sidebarItems.map((item) => {
              const isActive = activeOrganizerTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveOrganizerTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 h-9 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1E304F] text-white'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#3563F6]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-normal ${
                        isActive ? 'bg-[#3563F6]/20 text-blue-200' : 'bg-[#1E293B] text-[#94A3B8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Anchored Logout Section */}
        <div className="p-4 border-t border-[#1E2E4A] mt-auto">
          <button
            onClick={() => setHasAccessConfirmed(false)}
            className="w-full h-9 px-3 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#64748B]" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Console Content Body */}
      <main className="flex-1 h-full min-h-0 overflow-y-auto bg-[#F4F6FA] p-6 lg:p-8">
        {activeOrganizerTab === 'overview' && <OrganizerOverview />}
        {activeOrganizerTab === 'attendees' && <OrganizerAttendees />}
        {activeOrganizerTab === 'exhibitors' && <OrganizerExhibitors />}
        {activeOrganizerTab === 'sessions' && <OrganizerSessions />}
        {activeOrganizerTab === 'reports' && <OrganizerReports />}
        {activeOrganizerTab === 'settings' && <OrganizerSettings />}
      </main>
    </div>
  );
};
