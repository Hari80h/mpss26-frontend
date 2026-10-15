'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useStore } from '../../lib/store';
import { QrCode, Check, ArrowRight, X, Scan } from 'lucide-react';
import { Person } from '../../types';

export const DelegateScan: React.FC = () => {
  const {
    attendees,
    currentUser,
    connectWith,
    setSelectedPersonId,
    connections,
  } = useStore();

  const [scannedPerson, setScannedPerson] = useState<Person | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);

  const candidateTargets = attendees.filter(
    (a) => a.id !== currentUser.id && a.id !== 'usr-walkin'
  );

  const handleSimulateScan = () => {
    if (candidateTargets.length === 0) return;
    setIsScanningAnimation(true);
    setScannedPerson(null);

    setTimeout(() => {
      setIsScanningAnimation(false);
      const notConnected = candidateTargets.filter(c => !connections.some(conn => conn.personId === c.id));
      const targetPerson = notConnected.length > 0 ? notConnected[0] : candidateTargets[0];
      
      const result = connectWith(targetPerson.id, 'qr_scan');
      setIsDuplicate(result.alreadyConnected);
      setScannedPerson(targetPerson);
    }, 600);
  };

  return (
    <div className="flex-1 bg-[#F8F7F4] select-none h-full overflow-hidden flex flex-col px-3 pt-2 pb-2 gap-2">
      {/* Header exactly matching Schedule & People natural style */}
      <div className="pt-2 pb-1 shrink-0">
        <p className="text-[10.5px] uppercase tracking-[0.15em] text-[#6B6B6B] font-semibold mb-0.5">MPSS26 · SCANNER</p>
        <h1 className="text-[32px] font-serif font-medium text-[#181818] tracking-tight leading-none">My Badge</h1>
      </div>

      {/* 1st Card: My QR Code Badge View (Increased QR size) */}
      <div className="flex-1 bg-white p-3 rounded-[18px] border border-[#DEDCD7] shadow-sm text-center flex flex-col items-center justify-center min-h-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B51F32] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full mb-1 shrink-0">
          My Badge
        </span>
        <h2 className="text-[14px] font-bold text-[#181818] leading-tight shrink-0">{currentUser.name}</h2>
        <p className="text-[11px] text-[#6B6B6B] mt-0.5 shrink-0">
          {currentUser.designation} · {currentUser.company}
        </p>

        {/* Larger QR Code Container */}
        <div className="relative w-36 h-36 my-1.5 bg-white p-2 rounded-xl border border-[#181818]/15 flex items-center justify-center shadow-inner shrink-0">
          <QRCode 
            value={`eventsphere://reg/${currentUser.registrationId}`} 
            size={128}
            bgColor="#FFFFFF"
            fgColor="#181818"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>
      </div>

      {/* 2nd Card: Camera & Scan Section (Increased scanner size) */}
      <div className="flex-1 bg-white p-3 rounded-[18px] border border-[#DEDCD7] shadow-sm flex flex-col justify-between min-h-0">
        <div className="flex items-center justify-between mb-1 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-50 text-[#B51F32] flex items-center justify-center">
              <Scan className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-[#181818] leading-none">Scan QR Code</h3>
              <p className="text-[10px] text-[#6B6B6B] mt-0.5 leading-none">Align the QR code within the frame</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#0D9488]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
            Ready
          </span>
        </div>

        {/* Enlarged Viewfinder Window */}
        <div 
          onClick={handleSimulateScan}
          className="relative w-full flex-1 min-h-[120px] bg-gradient-to-b from-[#1C1C1E] to-[#121214] rounded-xl overflow-hidden flex items-center justify-center my-1 cursor-pointer"
        >
          {/* Target Reticle Brackets */}
          <div className={`relative w-32 h-32 flex items-center justify-center transition-all ${isScanningAnimation ? 'scale-95' : ''}`}>
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-[3px] border-l-[3px] border-[#B51F32] rounded-tl-sm" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-[3px] border-r-[3px] border-[#B51F32] rounded-tr-sm" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-[3px] border-l-[3px] border-[#B51F32] rounded-bl-sm" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-[3px] border-r-[3px] border-[#B51F32] rounded-br-sm" />

            {isScanningAnimation && (
              <div className="absolute left-1 right-1 h-0.5 bg-[#B51F32] shadow-[0_0_8px_#B51F32] scanner-laser" />
            )}

            <QrCode className="w-7 h-7 text-white/30 stroke-1" />
          </div>
        </div>

        {/* Simulate Scan Button */}
        <button
          onClick={handleSimulateScan}
          disabled={isScanningAnimation}
          className="w-full h-10 bg-[#B51F32] hover:bg-[#9C1A2B] active:scale-[0.98] text-white font-semibold text-[12px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Scan className="w-4 h-4" />
          <span>Simulate Scan</span>
        </button>
      </div>

      {/* Scan Connection Result Modal Popup */}
      {scannedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 animate-in fade-in select-none">
          <div className="bg-white p-3 rounded-[20px] w-full max-w-sm border border-[#DEDCD7] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#166534]">
                <Check className="w-5 h-5 bg-[#F0FDF4] rounded-full p-0.5 text-[#166534]" />
                <span>
                  {isDuplicate
                    ? `Already connected`
                    : `Connected successfully`}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setScannedPerson(null);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Attendee Details Card */}
            <div className="bg-[#F6F4F0] p-3 rounded-[14px] border border-[#E5E7EB] mb-3 flex items-center gap-3">
              <img
                src={scannedPerson.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(scannedPerson.name)}&background=181818&color=ffffff&bold=true`}
                alt={scannedPerson.name}
                className="w-11 h-11 rounded-full object-cover shadow-sm border border-[#E5E7EB] flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(scannedPerson.name)}&background=181818&color=ffffff&bold=true`;
                }}
              />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <h3 className="text-[13.5px] font-bold text-[#181818] leading-tight">{scannedPerson.name}</h3>
                <p className="text-[11.5px] text-[#6B6B6B]">
                  {scannedPerson.designation} <span className="opacity-60">·</span> <strong className="text-[#181818] font-medium">{scannedPerson.company}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setScannedPerson(null);
                }}
                className="flex-1 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] active:scale-95 text-[#4B5563] font-semibold text-[12px] rounded-lg transition-all"
              >
                OK
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setScannedPerson(null);
                  setSelectedPersonId(scannedPerson.id);
                }}
                className="flex-[2] py-2.5 bg-[#181818] hover:bg-[#333333] active:scale-95 text-white font-semibold text-[12px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
