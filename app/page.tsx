'use client';

import {AppLayout} from '@/components/AppLayout';
import {PageHeader} from '@/components/PageHeader';
import {useAuthContext} from '@/contexts/AuthContext';

export default function HomePage() {
  const {user} = useAuthContext();

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome, ${user?.name || 'there'}!`}
        description="Start preparing for your next interview."
      />
    </AppLayout>
  );
}
