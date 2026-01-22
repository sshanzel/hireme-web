'use client';

import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {MessageSquareWarning, ChevronDown, ChevronUp} from 'lucide-react';
import {useStoryChatContext} from '@/contexts/StoryChatContext';
import type {Story} from '@/types/experience';

const INITIAL_DISPLAY_COUNT = 2;

interface UntaggedStoriesProps {
  stories: Story[];
}

interface StoryItemProps {
  story: Story;
  onClick: () => void;
}

function StoryItem({story, onClick}: StoryItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='w-full rounded-md border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50'
    >
      <h5 className='text-sm font-medium'>{story.title}</h5>
      <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
    </button>
  );
}

export function UntaggedStories({stories}: UntaggedStoriesProps) {
  const {selectStory} = useStoryChatContext();
  const [isExpanded, setIsExpanded] = useState(false);

  if (stories.length === 0) {
    return null;
  }

  const hasMore = stories.length > INITIAL_DISPLAY_COUNT;
  const displayedStories = isExpanded ? stories : stories.slice(0, INITIAL_DISPLAY_COUNT);
  const hiddenCount = stories.length - INITIAL_DISPLAY_COUNT;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <MessageSquareWarning className='h-5 w-5 text-amber-500' />
          <div>
            <CardTitle className='text-base'>Untagged Stories ({stories.length})</CardTitle>
            <CardDescription>These stories need to be linked to a work experience</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {displayedStories.map(story => (
            <StoryItem key={story.id} story={story} onClick={() => selectStory(story.id)} />
          ))}
        </div>
        {hasMore && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
            className='mt-3 w-full'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='mr-2 h-4 w-4' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='mr-2 h-4 w-4' />
                Show {hiddenCount} more
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
