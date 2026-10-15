'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { ChevronLeft, ZoomIn, ZoomOut, MapPin } from 'lucide-react';

export const DelegateMap: React.FC = () => {
  const router = useRouter();
  const { setActiveDelegateTab } = useStore();
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div className="flex-1 bg-[#F6F4F0] flex flex-col h-full overflow-hidden">
      <div className="pt-4 pb-4 px-4 bg-[#F6F4F0] flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/delegate/home')}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#181818] transition-active active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h1 className="text-[20px] font-bold text-[#181818] tracking-tight">Exhibit Hall Map</h1>
          </div>
          <div className="flex bg-[#F6F4F0] rounded-lg p-1">
            <button onClick={handleZoomOut} className="p-1.5 rounded text-[#181818] hover:bg-white transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleZoomIn} className="p-1.5 rounded text-[#181818] hover:bg-white transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#E5E5E5]">
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <div className="relative w-full max-w-[600px] aspect-square bg-white shadow-lg m-3 rounded-lg border border-gray-300 overflow-hidden">
            {/* Demo Map Representation */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            
            <div className="p-3 h-full flex flex-col">
              <div className="text-center font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">
                Entrance / Registration
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-2.5">
                {/* Block A */}
                <div className="col-span-1 border-2 border-gray-200 rounded flex items-center justify-center relative bg-gray-50">
                  <span className="font-bold text-gray-300 text-3xl absolute opacity-50">A</span>
                  <div className="flex flex-col gap-2 w-full px-2">
                    <div className="bg-blue-100 border border-blue-300 rounded p-1 text-center text-[9px] font-bold text-blue-800">A-10 A4agility</div>
                    <div className="bg-white border border-gray-300 rounded p-1 text-center text-[9px] text-gray-500">A-11</div>
                    <div className="bg-white border border-gray-300 rounded p-1 text-center text-[9px] text-gray-500">A-12</div>
                  </div>
                </div>
                
                {/* Center Aisle */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="text-gray-300 text-xs uppercase tracking-widest rotate-90">Main Aisle</div>
                </div>

                {/* Block E & F */}
                <div className="col-span-1 flex flex-col gap-2.5">
                  <div className="flex-1 border-2 border-gray-200 rounded flex items-center justify-center relative bg-gray-50">
                    <span className="font-bold text-gray-300 text-3xl absolute opacity-50">E</span>
                    <div className="w-full px-2">
                      <div className="bg-purple-100 border border-purple-300 rounded p-2 text-center text-[9px] font-bold text-purple-800 h-16 flex items-center justify-center">E-22 Applied Materials</div>
                    </div>
                  </div>
                  <div className="flex-1 border-2 border-gray-200 rounded flex items-center justify-center relative bg-gray-50">
                    <span className="font-bold text-gray-300 text-3xl absolute opacity-50">F</span>
                    <div className="w-full px-2">
                      <div className="bg-green-100 border border-green-300 rounded p-2 text-center text-[9px] font-bold text-green-800">F-14 ANZ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Row */}
              <div className="mt-3 border-2 border-gray-200 rounded h-24 flex items-center justify-center relative bg-gray-50">
                <span className="font-bold text-gray-300 text-3xl absolute opacity-50">T</span>
                <div className="flex gap-2.5 w-full px-3">
                  <div className="flex-1 bg-white border border-gray-300 rounded"></div>
                  <div className="flex-1 bg-red-100 border border-red-300 rounded flex items-center justify-center text-center text-[9px] font-bold text-red-800">T-05 Act Fibernet</div>
                  <div className="flex-1 bg-white border border-gray-300 rounded"></div>
                  <div className="flex-1 bg-white border border-gray-300 rounded"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Legend overlay */}
      <div className="absolute bottom-24 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-2.5 shadow-sm border border-gray-200">
        <div className="flex gap-2.5 justify-center items-center text-[11px] font-medium text-gray-600">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm"></div> Tech</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-sm"></div> Electronics</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></div> Finance</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm"></div> Telecom</div>
        </div>
      </div>
    </div>
  );
};
