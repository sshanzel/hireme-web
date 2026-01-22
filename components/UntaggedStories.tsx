'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {MessageSquareWarning} from 'lucide-react';
import type {Story} from '@/types/experience';

interface UntaggedStoriesProps {
  stories: Story[];
}

function StoryItem({story}: {story: Story}) {
  return (
    <div className='rounded-md border bg-muted/30 p-3'>
      <h5 className='text-sm font-medium'>{story.title}</h5>
      <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
    </div>
  );
}

export function UntaggedStories({stories}: UntaggedStoriesProps) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <MessageSquareWarning className='h-5 w-5 text-amber-500' />
          <div>
            <CardTitle className='text-base'>Untagged Stories</CardTitle>
            <CardDescription>
              These stories need to be linked to a work experience
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {stories.map(story => (
            <StoryItem key={story.id} story={story} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
