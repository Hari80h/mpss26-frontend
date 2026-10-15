'use client';

import React from 'react';
import { useStore } from '../../lib/store';
import {
  Users,
  Building2,
  Mic
} from 'lucide-react';

export const OrganizerOverview: React.FC = () => {
  const {
    event,
    setActiveOrganizerTab,
  } = useStore();

  const registered = event.totalRegistered || 2438;
  const exhibitorsCount = event.totalExhibitors || 51;
  const speakersCount = event.totalSpeakers || 40;

  // 3 Core KPI metrics
  const kpis = [
    {
      label: 'Registered',
      value: registered.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Exhibitors',
      value: exhibitorsCount.toString(),
      icon: Building2,
    },
    {
      label: 'Speakers',
      value: speakersCount.toString(),
      icon: Mic,
    },
  ];

  // Top exhibitors data matching specification
  const leadExhibitors = [
    { name: 'Microsoft', booth: 'Booth B-14', leads: 248 },
    { name: 'Google Cloud', booth: 'Booth B-02', leads: 186 },
    { name: 'AWS', booth: 'Booth B-09', leads: 164 },
    { name: 'TCS', booth: 'Booth B-21', leads: 142 },
    { name: 'Infosys', booth: 'Booth B-30', leads: 96 },
  ];
  const maxLeads = 280;

  return (
    <div className="space-y-6 select-text max-w-[1360px] mx-auto w-full">
      {/* Event Header Banner */}
      <div>
        <span className="text-[12px] uppercase tracking-wider font-semibold text-[#64748B] block">
          {event.id} · {event.city.toUpperCase()} · DAY 1 OF 3
        </span>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight leading-tight mt-1">
          {event.name}
        </h1>
        <div className="flex items-center gap-2 mt-1.5 text-[13px] text-[#64748B]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
          <span className="font-medium">
            LIVE · {registered.toLocaleString()} registered delegates & participants
          </span>
        </div>
      </div>

      {/* 3 Symmetrical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between h-[104px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#64748B]">{kpi.label}</span>
                <Icon className="w-4 h-4 text-[#94A3B8]" />
              </div>
              <div>
                <span className="text-[26px] font-semibold text-[#172033] tracking-tight leading-none tabular-nums">
                  {kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Content Grid: 58% Left vs 42% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Top Exhibitors by Leads (58% width) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-1">
            <h2 className="text-[17px] font-semibold text-[#172033]">Top Exhibitors by Leads</h2>
            <button
              onClick={() => setActiveOrganizerTab('exhibitors')}
              className="text-[13px] font-medium text-[#3563F6] hover:text-[#2554E5] hover:underline transition-colors cursor-pointer"
            >
              View all exhibitors
            </button>
          </div>

          <div className="divide-y divide-[#F1F5F9] flex-1 flex flex-col justify-between">
            {leadExhibitors.map((ex) => {
              const percentage = Math.round((ex.leads / maxLeads) * 100);

              return (
                <div key={ex.name} className="py-3.5 first:pt-3 last:pb-2 flex items-center gap-4 text-xs">
                  {/* Exhibitor Name & Booth */}
                  <div className="w-36 sm:w-44 shrink-0 min-w-0">
                    <p className="text-[14px] font-medium text-[#172033] truncate">{ex.name}</p>
                    <p className="text-[12px] text-[#64748B] font-normal mt-0.5">{ex.booth}</p>
                  </div>

                  {/* Normalized Progress Bar */}
                  <div className="flex-1 bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#3563F6] h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Right-aligned Lead Count */}
                  <div className="w-16 text-right shrink-0">
                    <span className="text-[14px] font-medium text-[#172033] tabular-nums">
                      {ex.leads}
                    </span>
                    <span className="text-[12px] text-[#64748B] font-normal ml-1">leads</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Today's Programme (42% width) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-1">
            <h2 className="text-[17px] font-semibold text-[#172033]">Today&apos;s Programme</h2>
            <button
              onClick={() => setActiveOrganizerTab('sessions')}
              className="text-[13px] font-medium text-[#3563F6] hover:text-[#2554E5] hover:underline transition-colors cursor-pointer"
            >
              View schedule
            </button>
          </div>

          <div className="divide-y divide-[#F1F5F9] flex-1 flex flex-col justify-between">
            {/* 09:30 — Opening Keynote */}
            <div className="py-4 first:pt-3 flex items-start gap-4">
              <div className="w-14 text-[13px] font-medium text-[#64748B] tabular-nums pt-0.5 shrink-0">
                09:30
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-[#172033] truncate">
                    Opening Keynote
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[12px] text-[#64748B] mt-1">
                  Main Hall · 842 attending
                </p>
              </div>
            </div>

            {/* 10:45 — Production RAG at Scale */}
            <div className="py-4 flex items-start gap-4">
              <div className="w-14 text-[13px] font-medium text-[#64748B] tabular-nums pt-0.5 shrink-0">
                10:45
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#172033] truncate">
                  Production RAG at Scale
                </h3>
                <p className="text-[12px] text-[#64748B] mt-1">
                  Hall B · 412 saved
                </p>
              </div>
            </div>

            {/* 12:00 — Design Systems for AI */}
            <div className="py-4 last:pb-2 flex items-start gap-4">
              <div className="w-14 text-[13px] font-medium text-[#64748B] tabular-nums pt-0.5 shrink-0">
                12:00
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#172033] truncate">
                  Design Systems for AI
                </h3>
                <p className="text-[12px] text-[#64748B] mt-1">
                  Hall C · 268 saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
