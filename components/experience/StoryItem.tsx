'use client';

import {Trash2} from 'lucide-react';
import type {Story} from '@/types/experience';

interface StoryItemProps {
  story: Story;
  onClick: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function StoryItem({story, onClick, onDelete, isDeleting}: StoryItemProps) {
  return (
    <div className='group flex items-start gap-2 rounded-md border border-border/70 bg-muted/30 p-3 transition-all hover:-translate-y-0.5 hover:bg-muted/50'>
      <button type='button' onClick={onClick} className='min-w-0 flex-1 text-left'>
        <div className='flex items-start justify-between gap-2'>
          <h5 className='font-display text-sm font-semibold line-clamp-1'>{story.title || 'Untitled Story'}</h5>
          <div className='flex shrink-0 items-center gap-1'>
            {story.tags?.slice(0, 2).map(tag => (
              <span
                key={tag}
                className='inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-primary'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
      </button>
      <button
        type='button'
        onClick={onDelete}
        className='shrink-0 cursor-pointer rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100'
        aria-label='Delete story'
      >
        <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
}
