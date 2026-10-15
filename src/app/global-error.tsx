'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-[#F6F4F0] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#181818] mb-2">Application Error</h2>
        <p className="text-xs text-[#6B6B6B] mb-6 max-w-sm">
          {error.message || 'A global error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#B51F32] text-white font-semibold text-sm rounded-xl"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}
