'use client';

import { useEffect } from 'react';
import { useStore } from '../../../../lib/store';
import { DelegateSchedule } from '../../../../components/delegate/DelegateSchedule';

export default function AllSessionsPage() {
  const { setScheduleSubTab, setSelectedSessionId } = useStore();

  useEffect(() => {
    setScheduleSubTab('all');
    setSelectedSessionId(null);
  }, [setScheduleSubTab, setSelectedSessionId]);

  return <DelegateSchedule />;
}
