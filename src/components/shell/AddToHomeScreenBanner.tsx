'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { useStore } from '../../lib/store';

export const AddToHomeScreenBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const { showToast } = useStore();

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (isDismissed) setDismissed(true);

    // If running in standalone PWA mode already, don't show the banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    // Listen for the native beforeinstallprompt event on Chromium/Android
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      showToast('EventSphere PWA installed successfully ✓', 'success');
      setTimeout(() => {
        setDismissed(true);
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
      }, 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger the browser's native install prompt
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstalled(true);
          showToast('Installing EventSphere to Home Screen...', 'success');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (isIOS) {
      // Apple Safari doesn't support programmatic install; guide the user
      showToast('Tap the Safari Share button (⎋) below and select "Add to Home Screen"', 'info');
    } else {
      // Direct instruction if prompt wasn't captured or already triggered
      showToast('Tap browser menu (⋮) and select "Add to Home screen" or "Install app"', 'info');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="relative bg-[#FFFFFF] border-b border-[#DEDCD7] px-3 py-2.5 shadow-sm text-[#181818] z-40 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#B51F32] flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
            ES
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight text-[#181818]">Install EventSphere PWA</p>
            <p className="text-[11px] text-[#6B6B6B] leading-tight mt-0.5">
              Add to Home Screen for fast, 1-tap offline access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            disabled={installed}
            className="px-3 py-1.5 bg-[#B51F32] hover:bg-[#9C1A2B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1 active:scale-95"
          >
            {installed ? (
              <span>Installed ✓</span>
            ) : isIOS && !deferredPrompt ? (
              <>
                <Share className="w-3.5 h-3.5" />
                <span>How to Add</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 text-[#6B6B6B] hover:text-[#181818] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
