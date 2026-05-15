'use client';

import {ExperienceList} from '@/components/experience/ExperienceList';
import {UntaggedStories} from '@/components/story/UntaggedStories';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import {useProfile} from '@/hooks/useProfile';

export function ProfileSection() {
  const {data, isLoading, invalidate} = useProfile();
  const experiences = data?.experiences ?? [];
  const untaggedStories = data?.untaggedStories ?? [];

  if (isLoading) {
    return <LoadingSpinner size='lg' className='h-full' />;
  }

  return (
    <div className='flex min-h-0 flex-col gap-5 overflow-auto xl:h-full'>
      <UntaggedStories stories={untaggedStories} />
      <ExperienceList experiences={experiences} onMutate={invalidate} />
    </div>
  );
}
