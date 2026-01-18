'use client';

import {AppLayout} from '@/components/AppLayout';
import {PageHeader} from '@/components/PageHeader';
import {Chat} from '@/components/Chat';
import {ProfileSection} from '@/components/ProfileSection';
import {useAuthContext} from '@/contexts/AuthContext';
import {getFirstName} from '@/lib/strings/name';

export default function HomePage() {
  const {user} = useAuthContext();
  const title = user ? `Welcome, ${getFirstName(user.name)}!` : 'Welcome!';

  return (
    <AppLayout>
      <div className='flex h-full flex-col'>
        <PageHeader title={title} description='Start preparing for your next interview.' />
        <div className='mt-6 pb-6 grid flex-1 grid-cols-2 gap-6'>
          <Chat />
          <ProfileSection />
        </div>
      </div>
    </AppLayout>
  );
}
