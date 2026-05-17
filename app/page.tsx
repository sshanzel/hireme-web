'use client';

import {AppLayout} from '@/components/layout/AppLayout';
import {PageHeader} from '@/components/layout/PageHeader';
import {Chat} from '@/components/story/Chat';
import {ProfileSection} from '@/components/profile/ProfileSection';
import {useAuthContext} from '@/contexts/AuthContext';
import {useProfile} from '@/hooks/useProfile';
import {getFirstName} from '@/lib/strings/name';
import {StoryChatProvider} from '@/contexts/StoryChatContext';
import {BookOpen, BriefcaseBusiness, MessageSquareText} from 'lucide-react';

export default function HomePage() {
  const {user} = useAuthContext();
  const {data} = useProfile();
  const title = user ? `Welcome, ${getFirstName(user.name)}!` : 'Welcome!';
  const experiencesCount = data?.experiences?.length ?? 0;
  const storiesCount = data?.experiences?.reduce((count, exp) => count + exp.stories.length, 0) ?? 0;
  const untaggedCount = data?.untaggedStories?.length ?? 0;

  return (
    <AppLayout>
      <div className='flex h-full flex-col'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <PageHeader
            title={title}
            description='Shape raw work memories into clear, useful stories before the interview clock starts ticking.'
            eyebrow='Story desk'
          />
          <div className='grid grid-cols-3 gap-2 lg:w-[28rem]'>
            <div className='ledger-card p-3'>
              <BriefcaseBusiness className='h-4 w-4 text-primary' />
              <p className='font-display mt-2 text-2xl font-semibold'>{experiencesCount}</p>
              <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>Roles</p>
            </div>
            <div className='ledger-card p-3'>
              <BookOpen className='h-4 w-4 text-accent' />
              <p className='font-display mt-2 text-2xl font-semibold'>{storiesCount}</p>
              <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>Stories</p>
            </div>
            <div className='ledger-card p-3'>
              <MessageSquareText className='h-4 w-4 text-chart-4' />
              <p className='font-display mt-2 text-2xl font-semibold'>{untaggedCount}</p>
              <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>Loose</p>
            </div>
          </div>
        </div>
        <div className='mt-2 grid min-h-0 flex-1 grid-cols-1 gap-5 pb-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]'>
          <StoryChatProvider>
            <Chat />
            <ProfileSection />
          </StoryChatProvider>
        </div>
      </div>
    </AppLayout>
  );
}
