'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../../../lib/store';
import { DelegateSchedule } from '../../../../../components/delegate/DelegateSchedule';

interface SessionPageProps {
  params: { sessionId: string };
}

export default function SessionDetailPage({ params }: SessionPageProps) {
  const { sessionId } = params;
  const { sessions, setSelectedSessionId, setScheduleSubTab, setSessionBackTab } = useStore();
  const router = useRouter();

  useEffect(() => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      // Session not found — show not-found state via null selection
      setSelectedSessionId(null);
      return;
    }
    // Keep scheduleSubTab as-is (preserves All Sessions or My Schedule context)
    // Set session back to agenda so Back button works naturally
    setSessionBackTab('schedule');
    setSelectedSessionId(sessionId);
  }, [sessionId, sessions, setSelectedSessionId, setScheduleSubTab, setSessionBackTab]);

  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F7F4] px-6 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-[20px] font-bold text-[#181818] mb-2">Session Not Found</h2>
        <p className="text-[13px] text-[#6B6B6B] mb-6">
          The session "{sessionId}" doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/delegate/agenda/allsessions')}
          className="px-4 py-2 bg-[#181818] text-white rounded-lg text-[13px] font-medium"
        >
          View All Sessions
        </button>
      </div>
    );
  }

  return <DelegateSchedule />;
}
