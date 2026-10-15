'use client';

import { useEffect } from 'react';
import { useStore } from '../../../../lib/store';
import { DelegateSchedule } from '../../../../components/delegate/DelegateSchedule';

export default function MySchedulePage() {
  const { setScheduleSubTab, setSelectedSessionId } = useStore();

  useEffect(() => {
    setScheduleSubTab('saved');
    setSelectedSessionId(null);
  }, [setScheduleSubTab, setSelectedSessionId]);

  return <DelegateSchedule />;
}
