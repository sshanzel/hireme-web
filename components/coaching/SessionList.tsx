import {MessageCircle} from 'lucide-react';
import {SessionItem} from './SessionItem';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import type {CoachingSession} from '@/hooks/useCoachingSessions';

interface SessionListProps {
  sessions: CoachingSession[];
  activeSessionId?: string | null;
  onSessionClick?: (session: CoachingSession) => void;
  onSessionDelete?: (sessionId: string) => void;
  isLoading?: boolean;
}

export function SessionList({
  sessions,
  activeSessionId,
  onSessionClick,
  onSessionDelete,
  isLoading,
}: SessionListProps) {
  if (isLoading) {
    return <LoadingSpinner className='py-8' />;
  }

  if (sessions.length === 0) {
    return (
      <div className='py-8 text-center'>
        <MessageCircle className='mx-auto h-8 w-8 text-muted-foreground/50' />
        <p className='mt-2 text-sm text-muted-foreground'>No sessions yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-1'>
      {sessions.map(session => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={activeSessionId === session.id}
          onClick={() => onSessionClick?.(session)}
          onDelete={() => onSessionDelete?.(session.id)}
        />
      ))}
    </div>
  );
}
