'use client';

import React from 'react';
import { useStore } from '../../lib/store';
import { Smartphone, Monitor, Wifi, WifiOff, RefreshCw, MessageSquare, ShieldCheck, Check } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const {
    role,
    setRole,
    viewMode,
    setViewMode,
    isOnline,
    toggleConnectivity,
    isSyncing,
    syncPendingCount,
    lastSyncedTime,
    resetAllData,
  } = useStore();

  return (
    <header className="sticky top-0 z-50 bg-[#181818] text-[#F6F4F0] border-b border-[#2C2C2C] px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[12px]">
        {/* Brand & Event Identifier */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-[13px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B51F32] inline-block animate-pulse" />
            <span>EventSphere</span>
          </div>
          <span className="text-[#888888] hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#CCCCCC] bg-[#282828] px-2 py-0.5 rounded border border-[#3A3A3A]">
            <span className="font-semibold text-white">MPSS26</span>
            <span>·</span>
            <span>Indore</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D58]" />
            <span className="text-[10px] text-[#2F7D58] font-bold uppercase">Live</span>
          </div>
        </div>

        {/* Center: Role Switcher (Delegate | Exhibitor | Organizer) */}
        <div className="flex items-center bg-[#252525] p-0.5 rounded-lg border border-[#383838]">
          <button
            onClick={() => setRole('delegate')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1.5 ${
              role === 'delegate'
                ? 'bg-[#B51F32] text-white shadow-sm font-semibold'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            <span>Delegate</span>
            <span className="hidden md:inline text-[10px] opacity-80">(Aarav)</span>
          </button>
          <button
            onClick={() => setRole('exhibitor')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1.5 ${
              role === 'exhibitor'
                ? 'bg-[#B51F32] text-white shadow-sm font-semibold'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            <span>Exhibitor</span>
            <span className="hidden md:inline text-[10px] opacity-80">(Microsoft)</span>
          </button>
          <button
            onClick={() => setRole('organizer')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all text-xs flex items-center gap-1.5 ${
              role === 'organizer'
                ? 'bg-[#B51F32] text-white shadow-sm font-semibold'
                : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            <span>Organizer</span>
            <span className="hidden md:inline text-[10px] opacity-80">(Console)</span>
          </button>
        </div>

        {/* Right: View Frame Toggle, Offline Demo Toggle, WhatsApp Simulator & Reset */}
        <div className="flex items-center gap-2">
          {/* Frame vs Full toggle (Only relevant for Delegate and Exhibitor) */}
          {role !== 'organizer' && (
            <div className="hidden md:flex items-center bg-[#252525] rounded-md border border-[#383838] p-0.5">
              <button
                onClick={() => setViewMode('frame')}
                title="View in mobile device frame (430px)"
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'frame' ? 'bg-[#3A3A3A] text-white' : 'text-[#888888] hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('responsive')}
                title="View responsive full width"
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'responsive' ? 'bg-[#3A3A3A] text-white' : 'text-[#888888] hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Connectivity Offline/Online Toggle */}
          <button
            onClick={toggleConnectivity}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors ${
              isOnline
                ? 'bg-[#1C2C24] border-[#2F7D58]/40 text-[#4ADE80] hover:bg-[#23382D]'
                : 'bg-[#332211] border-[#F59E0B]/40 text-[#FBBF24] hover:bg-[#3D2915]'
            }`}
            title={isOnline ? 'Online (Click to simulate offline)' : `Offline · Last synced ${lastSyncedTime}`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-[#606060]" />
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-[#2F7D58]" />
                <span className="font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-[#595959]" />
                <span className="font-medium">Offline</span>
                {syncPendingCount > 0 && (
                  <span className="bg-[#B51F32] text-white text-[10px] px-1 py-0.2 rounded-full font-bold">
                    {syncPendingCount}
                  </span>
                )}
              </>
            )}
          </button>



          {/* Reset Demo Data */}
          <button
            onClick={resetAllData}
            title="Reset demo data to initial state"
            className="p-1.5 rounded text-[#AAAAAA] hover:text-white hover:bg-[#282828] border border-[#383838] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
