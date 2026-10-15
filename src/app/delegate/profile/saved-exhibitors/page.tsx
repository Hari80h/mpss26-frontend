'use client';

import { useEffect } from 'react';
import { useStore } from '../../../../lib/store';
import { DelegateCompanies } from '../../../../components/delegate/DelegateCompanies';

export default function SavedExhibitorsPage() {
  const { setViewSavedCompaniesOnly } = useStore();

  useEffect(() => {
    setViewSavedCompaniesOnly(true);
    return () => {
      setViewSavedCompaniesOnly(false);
    };
  }, [setViewSavedCompaniesOnly]);

  return <DelegateCompanies />;
}
