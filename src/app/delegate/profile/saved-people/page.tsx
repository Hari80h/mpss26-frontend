'use client';

import { useEffect } from 'react';
import { useStore } from '../../../../lib/store';
import { DelegatePeople } from '../../../../components/delegate/DelegatePeople';

export default function SavedPeoplePage() {
  const { setViewSavedPeopleOnly } = useStore();

  useEffect(() => {
    setViewSavedPeopleOnly(true);
    return () => {
      // Reset when leaving this page
      setViewSavedPeopleOnly(false);
    };
  }, [setViewSavedPeopleOnly]);

  return <DelegatePeople />;
}
