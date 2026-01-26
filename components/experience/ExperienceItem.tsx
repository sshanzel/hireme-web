'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Briefcase, GraduationCap, Pencil, Trash2, Loader2, BookOpen, Sparkles, Plus} from 'lucide-react';
import {StoryItem} from './StoryItem';
import {formatDateRange} from '@/lib/strings/format';
import type {Experience} from '@/types/experience';

interface ExperienceItemProps {
  experience: Experience;
  onEdit: () => void;
  onDelete: () => void;
  onStorySelect: (storyId: string) => void;
  isDeleting: boolean;
}

export function ExperienceItem({
  experience,
  onEdit,
  onDelete,
  onStorySelect,
  isDeleting,
}: ExperienceItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isStoriesExpanded, setIsStoriesExpanded] = useState(false);
  const storiesCount = experience.stories.length;
  const hasStories = storiesCount > 0;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const isEducation = experience.type === 'education';
  const ExperienceIcon = isEducation ? GraduationCap : Briefcase;

  return (
    <div className='rounded-lg border'>
      <div className='flex gap-4 p-4'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
          <ExperienceIcon className='h-5 w-5 text-primary' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-start justify-between gap-x-4 gap-y-1'>
            <div>
              <h4 className='font-medium'>{experience.title}</h4>
              <p className='text-sm text-muted-foreground'>{experience.organization}</p>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>
                {formatDateRange(experience.startDate, experience.endDate)}
              </span>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onEdit}>
                <Pencil className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive'
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
          <p className='mt-2 text-sm line-clamp-2'>{experience.description}</p>

          {showDeleteConfirm && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3'>
              <p className='flex-1 text-sm text-destructive'>Delete this experience?</p>
              <Button variant='ghost' size='sm' onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant='destructive' size='sm' onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='border-t px-4 py-3'>
        <button
          type='button'
          onClick={() => setIsStoriesExpanded(!isStoriesExpanded)}
          className='flex w-full items-center justify-between text-left'
        >
          <div className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>
              Stories{' '}
              <span className={hasStories ? 'text-primary' : 'text-muted-foreground'}>
                ({storiesCount})
              </span>
            </span>
          </div>
          <span className='text-xs text-muted-foreground'>
            {isStoriesExpanded ? 'Hide' : 'Show'}
          </span>
        </button>

        <div
          className='grid transition-[grid-template-rows] duration-300 ease-in-out'
          style={{gridTemplateRows: isStoriesExpanded ? '1fr' : '0fr'}}
        >
          <div className='overflow-hidden'>
            <div className='space-y-2 pt-3'>
              {hasStories ? (
                experience.stories.map(story => (
                  <StoryItem key={story.id} story={story} onClick={() => onStorySelect(story.id)} />
                ))
              ) : (
                <div className='rounded-md border border-dashed bg-muted/20 p-4 text-center'>
                  <Sparkles className='mx-auto h-6 w-6 text-muted-foreground/50' />
                  <p className='mt-2 text-sm font-medium'>No stories yet</p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Stories help you remember specific achievements and answer interview questions
                    like &quot;Tell me about a time when...&quot;
                  </p>
                  <Button variant='outline' size='sm' className='mt-3'>
                    <Plus className='mr-2 h-3 w-3' />
                    Add a story
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
