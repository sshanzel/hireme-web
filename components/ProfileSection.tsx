'use client';

import {Loader2} from 'lucide-react';
import {ExperienceList} from '@/components/ExperienceList';
import {UntaggedStories} from '@/components/UntaggedStories';
import {useProfile} from '@/hooks/useProfile';

export function ProfileSection() {
  const {data, isLoading, invalidate} = useProfile();
  const experiences = data?.experiences ?? [];
  const untaggedStories = data?.untaggedStories ?? [];

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-auto'>
      <UntaggedStories stories={untaggedStories} />
      <ExperienceList experiences={experiences} onMutate={invalidate} />
    </div>
  );
}
