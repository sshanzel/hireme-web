import {MessageCircle, Trash2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {formatRelativeDate} from '@/lib/strings/format';
import type {CoachingSession} from '@/hooks/useCoachingSessions';

interface SessionItemProps {
  session: CoachingSession;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export function SessionItem({session, isActive, onClick, onDelete}: SessionItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-border/70 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'border-primary/25 bg-muted',
      )}
    >
      <MessageCircle className='h-4 w-4 shrink-0 text-muted-foreground' />
      <div className='min-w-0 flex-1'>
        <p className='font-display truncate font-semibold'>{session.title || 'Untitled session'}</p>
        <p className='font-mono text-[10px] font-semibold uppercase text-muted-foreground'>{formatRelativeDate(session.updatedAt)}</p>
      </div>
      {onDelete && (
        <button
          type='button'
          onClick={handleDelete}
          className='shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100'
        >
          <Trash2 className='h-3 w-3 text-destructive' />
          <span className='sr-only'>Delete session</span>
        </button>
      )}
    </div>
  );
}
