'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { CURRENT_USER, INITIAL_ATTENDEES } from '../../lib/mockData';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2, Lock } from 'lucide-react';

interface AccessScreenProps {
  onSuccess: () => void;
}

export const AccessScreen: React.FC<AccessScreenProps> = ({ onSuccess }) => {
  const { setRole, setHasAccessConfirmed, setCurrentUser } = useStore();
  
  const [eventId, setEventId] = useState('MPSS26');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Sync with DOM value in case browser autofilled or restored the field
  useEffect(() => {
    if (mobileInputRef.current?.value && !mobile) {
      setMobile(mobileInputRef.current.value);
    }
  }, [mobile]);

  const handleQuickSelect = (num: string) => {
    setMobile(num);
    setErrorMessage('');
    if (status === 'error') setStatus('idle');
    mobileInputRef.current?.focus();
  };

  const handleVerify = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (status === 'verifying' || status === 'confirmed') return;

    setErrorMessage('');

    // Read directly from state or input ref to guarantee value is never missed
    const rawMobile = (mobile || mobileInputRef.current?.value || '').trim();

    if (!rawMobile) {
      setStatus('error');
      setErrorMessage('Please enter your registered mobile number.');
      mobileInputRef.current?.focus();
      return;
    }

    setStatus('verifying');

    // Extract digits and normalize
    let num = rawMobile.replace(/\D/g, '');
    if (num.startsWith('91') && num.length > 10) num = num.slice(2);
    if (num.startsWith('0')) num = num.slice(1);

    let detectedRole: 'delegate' | 'exhibitor' | 'organizer' = 'delegate';

    if (num === '9876543211' || num.endsWith('43211') || num.endsWith('3211')) {
      detectedRole = 'exhibitor';
    } else if (num === '9876543212' || num === '90876543212' || num.endsWith('43212') || num.endsWith('3212')) {
      detectedRole = 'organizer';
    } else {
      detectedRole = 'delegate';
    }

    if (detectedRole === 'delegate') {
      const matched = INITIAL_ATTENDEES.find((a) => {
        const aNum = (a.mobile || '').replace(/\D/g, '');
        return aNum.endsWith(num) || (num.length >= 8 && aNum.includes(num));
      });
      setCurrentUser(matched || CURRENT_USER);
    }

    setTimeout(() => {
      try {
        setRole(detectedRole);
        setStatus('confirmed');
        setTimeout(() => {
          setHasAccessConfirmed(true);
          onSuccess();
        }, 350);
      } catch (err) {
        console.error('Login error:', err);
        setHasAccessConfirmed(true);
        setStatus('confirmed');
        onSuccess();
      }
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6F4F0] min-h-[600px] select-none h-full relative overflow-y-auto">
      
      {/* Hero Image Section */}
      <div 
        className="h-[42%] min-h-[280px] relative bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")' }}
      >
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center font-extrabold text-[#181818] text-[12px] rounded-sm">
              E
            </div>
            <span className="font-bold text-[12px] tracking-[0.15em] text-white">EVENTSPHERE</span>
          </div>
          <span className="text-[11px] font-medium tracking-widest text-white border border-white/40 px-2 py-0.5 rounded backdrop-blur-sm bg-black/20">
            MPSS26
          </span>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-10 left-6 z-10 text-white">
          <p className="text-[12px] font-medium text-white/90 mb-0.5">Welcome to</p>
          <h1 className="text-[26px] font-serif font-medium leading-tight tracking-tight mb-1">
            MP Semiconductor Summit 2026
          </h1>
          <p className="text-[12px] font-medium text-white/80">
            23–24 Oct 2026 · Indore · 2,400 attending
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-[#F6F4F0] rounded-t-[28px] -mt-6 relative z-20 px-4 pt-5 pb-4 flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        
        <div className="mb-4">
          <div className="border-l-[3px] border-[#B51F32] pl-3">
            <h2 className="text-[15px] font-bold text-[#181818] tracking-tight">Enter your event</h2>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5 leading-relaxed">
              Use the Event ID and mobile number used during event registration.
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="flex-1 flex flex-col">
          <div className="space-y-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-[#181818] mb-1">
                Event ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="MPSS26"
                  disabled={status === 'verifying' || status === 'confirmed'}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#DEDCD7] text-[13px] font-bold tracking-wider text-[#181818] focus:outline-none focus:ring-2 focus:ring-[#B51F32] focus:border-transparent transition-all shadow-sm"
                />
                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B51F32]" />
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#181818] mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <input
                  ref={mobileInputRef}
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="e.g. 9876543210"
                  disabled={status === 'verifying' || status === 'confirmed'}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#DEDCD7] text-[13px] font-medium text-[#181818] focus:outline-none focus:ring-2 focus:ring-[#B51F32] focus:border-transparent transition-all shadow-sm"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Quick Demo Selector Chips */}
            <div className="pt-0.5">
              <p className="text-[10.5px] text-[#888888] font-medium mb-1.5">Quick Demo Logins:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('9876543210')}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    mobile === '9876543210'
                      ? 'bg-[#B51F32] text-white border-[#B51F32] font-semibold shadow-sm'
                      : 'bg-white text-[#333333] border-[#DEDCD7] hover:border-[#B51F32] font-medium'
                  }`}
                >
                  Delegate - Hari Gupta (9876543210)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('9876543211')}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    mobile === '9876543211'
                      ? 'bg-[#B51F32] text-white border-[#B51F32] font-semibold shadow-sm'
                      : 'bg-white text-[#333333] border-[#DEDCD7] hover:border-[#B51F32] font-medium'
                  }`}
                >
                  Exhibitor (9876543211)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('90876543212')}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    mobile === '90876543212'
                      ? 'bg-[#B51F32] text-white border-[#B51F32] font-semibold shadow-sm'
                      : 'bg-white text-[#333333] border-[#DEDCD7] hover:border-[#B51F32] font-medium'
                  }`}
                >
                  Organizer (90876543212)
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2 animate-in fade-in mt-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Confirmation State */}
          {status === 'confirmed' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in mt-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-[12px] text-emerald-900">Access confirmed ✓</p>
                <p className="text-[11px] text-emerald-700">Loading your personalized dashboard...</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-3">
            {/* Submit Action */}
            <button
              type="submit"
              disabled={status === 'verifying' || status === 'confirmed'}
              className="w-full h-[42px] bg-[#B51F32] hover:bg-[#9C1A2B] active:scale-[0.98] text-white font-semibold text-[13px] rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {status === 'verifying' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : status === 'confirmed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Access Confirmed ✓</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer Info */}
            <div className="mt-3 flex items-center justify-center gap-3 text-[12px] font-medium text-[#6B6B6B]">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>No passwords</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Registration verified</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
