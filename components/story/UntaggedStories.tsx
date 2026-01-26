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
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <MessageSquareWarning className='h-5 w-5 text-amber-500' />
            <div>
              <CardTitle className='text-base'>Untagged Stories ({stories.length})</CardTitle>
              <CardDescription>Click a story to open it, then tag it from the chat</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CollapsibleList
            items={stories}
            maxItems={2}
            keyExtractor={story => story.id}
            renderItem={story => (
              <div className='group flex items-start gap-2 rounded-md border bg-muted/30 p-3 transition-colors hover:bg-muted/50'>
                <button
                  type='button'
                  onClick={() => selectStory(story.id)}
                  className='min-w-0 flex-1 cursor-pointer text-left'
                >
                  <h5 className='text-sm font-medium line-clamp-1'>{story.title || 'Untitled Story'}</h5>
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
