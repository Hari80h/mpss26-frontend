'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  QrCode,
  Share2,
  Building,
  Mic,
  Loader2,
  Sparkles
} from 'lucide-react';

export const OrganizerReports: React.FC = () => {
  const { event, exhibitors, poll, showToast } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(true);

  // Top 5 exhibitors ranked by most leads generated
  const topExhibitorsByLeads = [...exhibitors]
    .sort((a, b) => (b.leads || 0) - (a.leads || 0))
    .slice(0, 5);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      showToast('Client-ready event report generated ✓', 'success');
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Metric,Value',
        `Event Name,${event.name}`,
        `Event ID,${event.id}`,
        `Total Registered,${event.totalRegistered}`,
        `Total Exhibitors,${event.totalExhibitors}`,
        `Total Speakers,${event.totalSpeakers}`,
        `Poll Responses,${poll.totalVotes}`,
        '',
        'Top 5 Exhibitors by Leads,Booth,Category,Leads Generated',
        ...topExhibitorsByLeads.map(
          (ex, idx) => `"#${idx + 1} ${ex.company}","${ex.booth}","${ex.category}",${ex.leads || 0}`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventsphere-mpss26-executive-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report CSV exported ✓', 'success');
  };

  return (
    <div className="space-y-6 select-text max-w-5xl mx-auto">
      {/* Top Header & Report Actions */}
      <div className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            MPSS26 · INDORE · EXECUTIVE REPORTING
          </span>
          <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight mt-1">
            Executive Event Report
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Client-ready presentation report for stakeholders, partners, and sponsors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="h-9 px-4 bg-[#3563F6] hover:bg-[#2554E5] active:bg-[#1D46CA] text-white text-[13px] font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Regenerate Report</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="h-9 px-3.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] text-[13px] font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#64748B]" />
            <span>Download PDF / Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] text-[13px] font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* The Printable Branded Client-Ready Report Sheet */}
      <div className="report-sheet bg-white p-8 sm:p-10 rounded-xl border border-[#E2E8F0] shadow-sm space-y-8 text-[#172033]">
        {/* Report Branding Header */}
        <div className="border-b border-[#E2E8F0] pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#3563F6]" />
              <span className="text-xs font-semibold tracking-tight text-[#172033]">
                EventSphere
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#172033] tracking-tight">
              {event.name}
            </h2>
            <p className="text-xs font-medium text-[#3563F6] mt-0.5">
              Official Event Experience & Engagement Report
            </p>
          </div>

          <div className="text-right text-xs text-[#64748B] space-y-1">
            <p className="font-mono font-semibold text-[#172033]">{event.id} · LIVE AUDIT</p>
            <p>{event.dates}</p>
            <p>{event.venue.includes(event.city) ? event.venue : `${event.venue}, ${event.city}`}</p>
            <p className="text-[11px] text-[#16A34A] font-medium">VERIFIED DATA LAYER</p>
          </div>
        </div>

        {/* 3 Core Executive Numbers Grid */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5">
            1. Executive Attendance & Scale Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] uppercase font-semibold text-[#64748B] block">Registered</span>
              <p className="text-[18px] font-semibold font-mono text-[#172033] mt-1">
                {event.totalRegistered.toLocaleString()}
              </p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] uppercase font-semibold text-[#64748B] block">Exhibitors</span>
              <p className="text-[18px] font-semibold font-mono text-[#172033] mt-1">
                {event.totalExhibitors}
              </p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] uppercase font-semibold text-[#64748B] block">Speakers</span>
              <p className="text-[18px] font-semibold font-mono text-[#172033] mt-1">
                {event.totalSpeakers}
              </p>
            </div>
          </div>
        </div>

        {/* Top 5 Featured Exhibitors by Leads Directory */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5">
            2. Featured Exhibitors & Leads Generated
          </h3>
          <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-14">#</th>
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Booth Location</th>
                  <th className="py-2.5 px-4 text-right">Leads Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {topExhibitorsByLeads.map((ex, idx) => (
                  <tr key={ex.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-mono font-medium text-[#64748B]">#{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#172033]">{ex.company}</td>
                    <td className="py-2.5 px-4 text-[#64748B]">{ex.category}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#172033]">{ex.booth}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#172033]">
                      {(ex.leads || 0).toLocaleString()} <span className="text-[11px] text-[#64748B] font-normal">leads</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engagement Highlights */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5">
            3. Audience Engagement Highlights
          </h3>
          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] max-w-xs text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] uppercase font-semibold text-[#64748B] block">Poll Responses</span>
              <p className="text-[20px] font-semibold font-mono text-[#172033] mt-0.5">{poll.totalVotes}</p>
            </div>
            <span className="text-[11px] text-[#3563F6] font-medium bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md mt-2 sm:mt-0 inline-block">
              Interactive voting
            </span>
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>Generated dynamically by EventSphere Digital Experience Engine</span>
          </div>
          <span className="font-mono">Document ID: ES-MPSS26-AUDIT-{Date.now().toString().slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};
