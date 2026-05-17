'use client';

import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {MessageSquareWarning, Trash2} from 'lucide-react';
import {useStoryChatContext} from '@/contexts/StoryChatContext';
import {useDeleteStory} from '@/hooks/useDeleteStory';
import {CollapsibleList} from '@/components/common/CollapsibleList';
import {ConfirmDialog} from '@/components/common/ConfirmDialog';
import type {Story} from '@/types/experience';

interface UntaggedStoriesProps {
  stories: Story[];
}

export function UntaggedStories({stories}: UntaggedStoriesProps) {
  const {selectStory, selectedStoryId, story: currentStory, clearSelection} = useStoryChatContext();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const deleteStoryMutation = useDeleteStory();

  const handleDeleteClick = (storyId: string) => {
    setConfirmingId(storyId);
  };

  const handleConfirm = () => {
    if (!confirmingId) return;
    deleteStoryMutation.mutate(confirmingId, {
      onSuccess: () => {
        if (selectedStoryId === confirmingId || currentStory?.id === confirmingId) {
          clearSelection();
        }
      },
      onSettled: () => setConfirmingId(null),
    });
  };

  const handleCancel = () => {
    setConfirmingId(null);
  };

  if (stories.length === 0) {
    return null;
  }

  return (
    <>
      <Card className='overflow-hidden border-accent/30 bg-accent/10'>
        <CardHeader className='border-b border-accent/20 bg-accent/10'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-md bg-accent/20'>
              <MessageSquareWarning className='h-5 w-5 text-accent-foreground' />
            </div>
            <div>
              <CardTitle className='text-base'>Untagged Stories ({stories.length})</CardTitle>
              <CardDescription>Waiting for a role</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <CollapsibleList
            items={stories}
            maxItems={2}
            keyExtractor={story => story.id}
            renderItem={story => (
              <div className='group flex items-start gap-2 rounded-md border border-border/70 bg-card/75 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-card'>
                <button
                  type='button'
                  onClick={() => selectStory(story.id)}
                  className='min-w-0 flex-1 cursor-pointer text-left'
                >
                  <h5 className='font-display text-sm font-semibold line-clamp-1'>{story.title || 'Untitled Story'}</h5>
                  <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
                </button>
                <button
                  type='button'
                  onClick={() => handleDeleteClick(story.id)}
                  className='shrink-0 cursor-pointer rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100'
                  aria-label='Delete story'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmingId}
        onOpenChange={open => !open && handleCancel()}
        title='Delete story'
        description='Are you sure you want to delete this story? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleConfirm}
        isLoading={deleteStoryMutation.isPending}
        variant='destructive'
      />
    </>
  );
}
