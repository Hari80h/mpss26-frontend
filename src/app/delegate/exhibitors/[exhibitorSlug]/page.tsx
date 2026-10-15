'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { findExhibitorBySlug } from '@/lib/exhibitorSlug';
import { DelegateCompanyDetail } from '@/components/delegate/DelegateCompanyDetail';

interface ExhibitorDetailPageProps {
  params: { exhibitorSlug: string };
}

export default function ExhibitorDetailPage({ params }: ExhibitorDetailPageProps) {
  const { exhibitorSlug } = params;
  const { exhibitors, setSelectedCompanyId } = useStore();
  const router = useRouter();

  const exhibitor = findExhibitorBySlug(exhibitors, exhibitorSlug);

  useEffect(() => {
    if (exhibitor) {
      setSelectedCompanyId(exhibitor.id);
    }
  }, [exhibitor, setSelectedCompanyId]);

  if (!exhibitor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F7F4] px-6 text-center">
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-[20px] font-bold text-[#181818] mb-2">Exhibitor Not Found</h2>
        <p className="text-[13px] text-[#6B6B6B] mb-6">
          The exhibitor "{exhibitorSlug}" doesn't exist or is not participating in MPSS26.
        </p>
        <button
          onClick={() => router.push('/delegate/exhibitors')}
          className="px-4 py-2 bg-[#181818] text-white rounded-lg text-[13px] font-medium"
        >
          Browse Exhibitors
        </button>
      </div>
    );
  }

  return <DelegateCompanyDetail />;
}
