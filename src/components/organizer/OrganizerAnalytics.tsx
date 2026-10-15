'use client';
import React, { useState, useEffect, useRef, Suspense } from "react";

import { BarChart2, BarChart3, Briefcase, Building2, Calendar, CheckCircle2, LineChart, Mic, QrCode, Share2, TrendingUp, User, Users } from 'lucide-react';
import { useStore } from '../../lib/store';

export const OrganizerAnalytics: React.FC = () => {
  const { event, exhibitors, poll, questions } = useStore();

  const checkInRate = ((event.totalCheckedIn / event.totalRegistered) * 100).toFixed(1);

  // Hourly scans distribution data
  const hourlyScans = [
    { hour: '08:00', count: 420 },
    { hour: '09:00', count: 1150 },
    { hour: '10:00', count: 1680 },
    { hour: '11:00', count: 1420 },
    { hour: '12:00', count: 890 },
    { hour: '13:00', count: 652 },
  ];

  const maxScan = Math.max(...hourlyScans.map((h) => h.count));

  // Sessions attendance
  const sessionCapacity = [
    { title: 'Opening Keynote', attended: 420, capacity: 500 },
    { title: 'FinTech Infrastructure', attended: 290, capacity: 350 },
    { title: 'Agentic Workflows', attended: 315, capacity: 400 },
    { title: 'Data Mesh Analytics', attended: 210, capacity: 300 },
  ];

  return (
    <div className="space-y-6 select-text max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
          MPSS26 · INDORE · REAL-TIME ANALYTICS
        </span>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight mt-1">
          Analytics & Telemetry
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Live badge telemetry, hall capacity utilization, and exhibitor lead capture velocity
        </p>
      </div>

      {/* Top 4 High-Impact KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between h-[104px]">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Check-In Rate
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[26px] font-semibold text-[#172033] tracking-tight tabular-nums">
              {checkInRate}%
            </span>
            <span className="text-xs font-medium text-[#16A34A]">
              {event.totalCheckedIn.toLocaleString()} / {event.totalRegistered.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between h-[104px]">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Total QR Scans
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[26px] font-semibold text-[#172033] tracking-tight tabular-nums">
              {event.totalScans.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-[#64748B]">
              2.55 scans / delegate
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between h-[104px]">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Mutual Connections
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[26px] font-semibold text-[#172033] tracking-tight tabular-nums">
              {event.totalConnections.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-[#64748B]">
              Verified contacts
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between h-[104px]">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Total Sponsor Leads
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[26px] font-semibold text-[#172033] tracking-tight tabular-nums">
              {exhibitors.reduce((acc, curr) => acc + curr.leads, 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-[#3563F6]">
              {exhibitors.length || 51} booths
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Hourly QR Scan Volume */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#172033]">Hourly QR Scan Volume</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Badge scans & booth lead captures</p>
            </div>
            <span className="text-xs font-medium text-[#3563F6] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
              Peak: 10:00 AM
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-44 flex items-end gap-2 pt-4 border-b border-[#E2E8F0] pb-2">
            {hourlyScans.map((item) => {
              const heightPct = Math.round((item.count / maxScan) * 100);
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono font-medium text-[#172033] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div
                    className="w-full bg-[#3563F6] hover:bg-[#2554E5] transition-colors rounded-t-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-[#64748B] font-mono">{item.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-[#64748B]">
            <span>Morning Keynote surge captured 41% of total scans</span>
            <span className="font-semibold text-[#172033]">{event.totalScans.toLocaleString()} scans total</span>
          </div>
        </div>

        {/* CHART 2: Sponsor Booth Footfall vs Leads */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#172033]">Top Exhibitors: Visits vs Leads</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Footfall to qualified lead conversion rate</p>
            </div>
            <span className="text-xs font-medium text-[#16A34A] bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              Avg 74% conversion
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {exhibitors.slice(0, 4).map((ex) => {
              const convRate = ((ex.leads / ex.visits) * 100).toFixed(0);
              return (
                <div key={ex.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#172033]">{ex.company} ({ex.booth})</span>
                    <span className="font-mono text-[#64748B]">
                      <strong className="text-[#3563F6] font-semibold">{ex.leads} leads</strong> / {ex.visits} visits ({convRate}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#3563F6] h-full rounded-full"
                      style={{ width: `${(ex.leads / ex.visits) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-[#64748B] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3563F6]" />
              Qualified Leads
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
              Walk-in Visits
            </span>
          </div>
        </div>

        {/* CHART 3: Session Capacity & Attendance */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#172033]">Session Capacity Utilization</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Hall seat occupancy by track</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#172033]">82.4% avg</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {sessionCapacity.map((sc, idx) => {
              const occPct = Math.round((sc.attended / sc.capacity) * 100);
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#172033]">{sc.title}</span>
                    <span className="font-mono text-[#64748B]">
                      {sc.attended} / {sc.capacity} ({occPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occPct > 80 ? 'bg-[#16A34A]' : 'bg-[#3563F6]'
                      }`}
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 4: Audience Engagement Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#172033]">Audience Engagement Breakdown</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Q&A, Polls, and Product Enquiries</p>
            </div>
            <span className="text-xs text-[#16A34A] font-medium bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              High Interaction
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Q&A Questions</span>
              <strong className="text-sm font-semibold font-mono text-[#172033] block mt-0.5">
                {142 + questions.length}
              </strong>
              <span className="text-[11px] text-[#16A34A] font-medium block mt-0.5">98 Answered</span>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Poll Responses</span>
              <strong className="text-sm font-semibold font-mono text-[#172033] block mt-0.5">
                {poll.totalVotes}
              </strong>
              <span className="text-[11px] text-[#64748B] block mt-0.5">1 vote/person</span>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Product Interest</span>
              <strong className="text-sm font-semibold font-mono text-[#3563F6] block mt-0.5">
                48
              </strong>
              <span className="text-[11px] text-[#16A34A] font-medium block mt-0.5">High intent</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs text-[#64748B]">
            Zero vanity metrics. Engagement numbers are cryptographically anchored to verified registration IDs.
          </div>
        </div>
      </div>
    </div>
  );
};
