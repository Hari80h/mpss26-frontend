'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Shield, X, Check, Mail, Phone, Linkedin, Lock } from 'lucide-react';

interface ContactPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactPrivacyModal: React.FC<ContactPrivacyModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserPrivacy } = useStore();

  const [preset, setPreset] = useState(currentUser.privacy.preset);
  const [shareEmail, setShareEmail] = useState(currentUser.privacy.shareEmail);
  const [sharePhone, setSharePhone] = useState(currentUser.privacy.sharePhone);
  const [shareLinkedIn, setShareLinkedIn] = useState(currentUser.privacy.shareLinkedIn);

  if (!isOpen) return null;

  const handlePresetSelect = (selected: 'Open' | 'Connections Only') => {
    setPreset(selected);
    if (selected === 'Open') {
      setShareEmail(true);
      setSharePhone(true);
      setShareLinkedIn(true);
    } else if (selected === 'Connections Only') {
      setShareEmail(true);
      setSharePhone(true);
      setShareLinkedIn(true);
    }
  };

  const handleSave = () => {
    updateCurrentUserPrivacy({
      preset,
      shareEmail,
      sharePhone,
      shareLinkedIn,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 animate-in fade-in select-none">
      <div className="bg-white rounded-2xl w-full max-w-sm p-3 space-y-2 shadow-2xl border border-[#DEDCD7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DEDCD7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#2F7D58]">
              <Shield className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-[#181818]">Contact Sharing Consent</h3>
              <p className="text-[11px] text-[#6B6B6B]">Control what other attendees & sponsors see</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#6B6B6B] hover:text-[#181818]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#181818]">Privacy Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Connections Only', 'Open'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  preset === p
                    ? 'bg-[#181818] text-white border-[#181818] shadow-xs'
                    : 'bg-white text-[#6B6B6B] border-[#DEDCD7] hover:border-[#181818]'
                }`}
              >
                {p === 'Connections Only' ? 'Connections Only (Default)' : 'Open'}
              </button>
            ))}
          </div>
        </div>

        {/* Granular Field Toggles */}
        <div className="bg-[#F6F4F0] p-2.5 rounded-[14px] border border-[#DEDCD7] space-y-3 text-xs">
          <span className="font-bold text-[#181818] block">Field-Level Visibility</span>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2 text-[#181818]">
              <Mail className="w-4 h-4 text-[#6B6B6B]" />
              <div>
                <p className="font-semibold leading-tight">Email Address</p>
                <p className="text-[10px] text-[#6B6B6B] font-mono">{currentUser.email}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shareEmail}
              onChange={(e) => {
                setShareEmail(e.target.checked);
                setPreset('Connections Only');
              }}
              className="w-4 h-4 rounded text-[#B51F32] focus:ring-[#B51F32]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#DEDCD7]/60">
            <div className="flex items-center gap-2 text-[#181818]">
              <Phone className="w-4 h-4 text-[#6B6B6B]" />
              <div>
                <p className="font-semibold leading-tight">Mobile Number</p>
                <p className="text-[10px] text-[#6B6B6B] font-mono">{currentUser.mobile}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sharePhone}
              onChange={(e) => {
                setSharePhone(e.target.checked);
                setPreset('Connections Only');
              }}
              className="w-4 h-4 rounded text-[#B51F32] focus:ring-[#B51F32]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#DEDCD7]/60">
            <div className="flex items-center gap-2 text-[#181818]">
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              <div>
                <p className="font-semibold leading-tight">LinkedIn Profile</p>
                <p className="text-[10px] text-[#6B6B6B]">{currentUser.linkedin}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shareLinkedIn}
              onChange={(e) => {
                setShareLinkedIn(e.target.checked);
                setPreset('Connections Only');
              }}
              className="w-4 h-4 rounded text-[#B51F32] focus:ring-[#B51F32]"
            />
          </label>
        </div>

        <p className="text-[10px] text-[#6B6B6B] leading-tight">
          Protected by India DPDP Act compliance. Unshared fields will display as "Not shared" across EventSphere.
        </p>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-[#B51F32] hover:bg-[#9C1A2B] active:scale-95 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
        >
          Save Privacy Preferences
        </button>
      </div>
    </div>
  );
};
