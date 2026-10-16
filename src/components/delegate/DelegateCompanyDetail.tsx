'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Star, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

export const DelegateCompanyDetail: React.FC = () => {
  const router = useRouter();
  const { 
    setActiveDelegateTab, 
    selectedCompanyId, 
    exhibitors, 
    products, 
    savedCompanyIds, 
    toggleSaveCompany,
    showToast 
  } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedCompanyId]);

  const company = exhibitors.find(e => e.id === selectedCompanyId) || exhibitors[0];

  useEffect(() => {
    if (company?.id) {
      api.exhibitors.getProducts(company.id)
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            setLiveProducts(data);
          }
        })
        .catch((err) => {
          console.warn('Failed to load exhibitor products from backend:', err);
        });
    }
  }, [company?.id]);

  const companyProducts = liveProducts.length > 0
    ? liveProducts.map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        category: p.category,
        overview: p.overview,
        image: p.imageUrl || p.image || '',
        company: company.company,
      }))
    : products.filter(p => p.company === company.company);

  if (!company) return null;

  const handleDownloadBrochure = () => {
    const content = `================================================
${company.company.toUpperCase()} - OFFICIAL EXHIBITOR BROCHURE
MP Semiconductor Summit 2026 (MPSS26)
================================================

Booth: ${company.booth || 'TBA'}
Location: Brilliant Convention Centre, Indore, Madhya Pradesh
Category: ${company.category || 'Technology'}

ABOUT ${company.company.toUpperCase()}:
${company.company} is showcasing cutting-edge semiconductor innovations and solutions at MPSS26.
Visit Booth ${company.booth || 'TBA'} to explore live demonstrations and speak with company representatives.

FEATURED PRODUCTS & SOLUTIONS:
${companyProducts.length > 0 
  ? companyProducts.map((p, idx) => `${idx + 1}. ${p.name} (${p.category})\n   ${p.overview || p.tagline || ''}`).join('\n\n')
  : 'Detailed catalog available at the booth.'}

------------------------------------------------
Generated via EventSphere Official App (MPSS26)
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.company.replace(/[^a-zA-Z0-9]/g, '_')}_Brochure_MPSS26.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${company.company} brochure ✓`, 'success');
  };

  return (
    <div ref={scrollRef} className="flex-1 bg-[#F6F4F0] flex flex-col h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="pt-4 pb-4 px-4 bg-[#F6F4F0] sticky top-0 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 pr-1">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/delegate/exhibitors');
              }
            }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#181818] transition-active active:scale-95 shadow-sm shrink-0"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-[19px] font-bold text-[#181818] tracking-tight truncate">{company.company}</h1>
        </div>

        <button
          onClick={handleDownloadBrochure}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-gray-50 text-[#181818] border border-[#DEDCD7] text-[12px] font-semibold transition-all active:scale-95 shadow-sm shrink-0 hover:border-[#181818]"
          title="Download Brochure"
        >
          <Download className="w-3.5 h-3.5 text-[#B51F32]" />
          <span>Brochure</span>
        </button>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Main Card */}
        <div className="bg-white rounded-[14px] border border-[#DEDCD7] p-3 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.company} 
                className="w-12 h-12 rounded-xl object-contain p-1 border border-[#DEDCD7] bg-white shadow-xs"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.company)}&background=F3F4F6&color=181818&bold=true`;
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#EFEEEA] flex items-center justify-center font-bold text-[12px] text-[#181818]">
                {company.company.charAt(0)}
              </div>
            )}
            <div className="bg-[#181818] text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
              Booth {company.booth || 'TBA'}
            </div>
          </div>
          
          <h2 className="text-[12px] font-bold text-[#181818] mb-1.5">{company.company}</h2>
          <div className="flex items-start gap-1 text-[#6B6B6B] mb-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p className="text-[12px]">Brilliant Convention Centre, Indore, MP</p>
          </div>

          <p className="text-[12px] text-[#181818] leading-relaxed mb-2">
            {company.company} is showcasing their latest innovations in the {company.category} space. Visit Booth {company.booth} at MPSS26 to explore their products and engage with their experts.
          </p>

          <button 
            onClick={() => toggleSaveCompany(company.id)}
            className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 font-bold text-[12px] active:scale-95 transition-transform ${
              savedCompanyIds.includes(company.id)
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'border-[#181818] text-[#181818] hover:bg-gray-50'
            }`}
          >
            <Star className={`w-4 h-4 ${savedCompanyIds.includes(company.id) ? 'fill-[#166534]' : ''}`} />
            {savedCompanyIds.includes(company.id) ? 'Company Saved' : 'Save Company'}
          </button>
        </div>

        {/* Products Section */}
        {companyProducts.length > 0 && (
          <div>
            <h3 className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">
              SHOWCASING AT THE BOOTH
            </h3>
            
            <div className="space-y-2">
              {companyProducts.map(product => (
                <div key={product.id} className="bg-white rounded-[14px] border border-[#DEDCD7] p-3 shadow-sm cursor-pointer hover:border-[#181818]/30 transition-colors">
                  <div className="flex gap-2 items-start mb-2">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=F3F4F6&color=181818&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#EFEEEA] flex items-center justify-center font-bold text-[12px] text-[#181818] flex-shrink-0">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-[12px] font-bold text-[#181818]">{product.name}</h4>
                      <p className="text-[12px] text-[#6B6B6B]">{product.category || product.tagline}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                    {product.overview || product.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
