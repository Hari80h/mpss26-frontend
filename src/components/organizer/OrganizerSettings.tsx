'use client';

import React from 'react';
import { useStore } from '../../lib/store';
import { ShieldCheck, Database, RefreshCw, Key, Globe, Radio } from 'lucide-react';

export const OrganizerSettings: React.FC = () => {
  const { event, resetAllData, showToast } = useStore();

  const handleTestWebhook = () => {
    showToast('External Registration Webhook test: 200 OK ✓', 'success');
  };

  const handleBroadcastAlert = () => {
    showToast('Emergency announcement broadcasted to 1,120 active badges ✓', 'info');
  };

  return (
    <div className="space-y-6 select-text max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
          MPSS26 · INDORE · SYSTEM CONFIGURATION
        </span>
        <h1 className="text-[28px] sm:text-[30px] font-semibold text-[#172033] tracking-tight mt-1">
          Settings & Integrations
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Event configuration, registration webhooks, and demo environment state
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-[#172033]">Core Event Identity</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Event Name</label>
            <input
              type="text"
              readOnly
              value={event.name}
              className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-medium text-[#172033] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Event ID</label>
            <input
              type="text"
              readOnly
              value={event.id}
              className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-mono font-semibold text-[#172033] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Dates</label>
            <input
              type="text"
              readOnly
              value={event.dates}
              className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Venue</label>
            <input
              type="text"
              readOnly
              value={event.venue.includes(event.city) ? event.venue : `${event.venue}, ${event.city}`}
              className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Integration & Webhook */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#172033]">External Registration Bridge</h2>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
            EventSphere receives verified attendees via webhook from your primary ticketing portal. Attendee records are encrypted and synced in real time.
          </p>
        </div>

        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
            <span className="font-mono text-[#172033] truncate">https://api.eventsphere.io/v2/webhook/MPSS26</span>
          </div>
          <button
            onClick={handleTestWebhook}
            className="h-8 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-medium text-xs text-[#172033] shadow-2xs cursor-pointer flex-shrink-0"
          >
            Test Webhook
          </button>
        </div>
      </div>

      {/* Demo State Control */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#172033]">Demo Reset & Diagnostic Controls</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Restore initial mock attendees, leads, and questions for subsequent sales demonstrations.
          </p>
        </div>

        <div>
          <button
            onClick={resetAllData}
            className="h-9 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
