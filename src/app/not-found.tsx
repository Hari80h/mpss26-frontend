'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-[#FFF0F2] text-[#B51F32] rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 shadow-sm border border-[#FAD2D7]">
        404
      </div>
      <h2 className="text-xl font-bold text-[#181818] mb-2">Page Not Found</h2>
      <p className="text-sm text-[#6B6B6B] mb-6 max-w-xs">
        The requested screen or event resource could not be found.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#B51F32] hover:bg-[#9C1A2B] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
