'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {MessageSquareWarning} from 'lucide-react';
import {useStoryChatContext} from '@/contexts/StoryChatContext';
import {CollapsibleList} from '@/components/CollapsibleList';
import type {Story} from '@/types/experience';

interface UntaggedStoriesProps {
  stories: Story[];
}

export function UntaggedStories({stories}: UntaggedStoriesProps) {
  const {selectStory} = useStoryChatContext();

  if (stories.length === 0) {
    return null;
  }

  return (
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
            <button
              type='button'
              onClick={() => selectStory(story.id)}
              className='w-full cursor-pointer rounded-md border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50'
            >
              <h5 className='text-sm font-medium'>{story.title}</h5>
              <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
            </button>
          )}
        />
      </CardContent>
    </Card>
  );
}
