'use client';

import {AppLayout} from '@/components/AppLayout';
import {PageHeader} from '@/components/PageHeader';
import {ChatPlaceholder} from '@/components/ChatPlaceholder';
import {ProfileSection} from '@/components/ProfileSection';
import {useAuthContext} from '@/contexts/AuthContext';

export default function HomePage() {
  const {user} = useAuthContext();

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <PageHeader
          title={`Welcome, ${user?.name || 'there'}!`}
          description="Start preparing for your next interview."
        />
        <div className="mt-6 grid flex-1 grid-cols-2 gap-6">
          <ChatPlaceholder />
          <ProfileSection />
        </div>
      </div>
    </AppLayout>
  );
}
