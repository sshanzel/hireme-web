'use client';

import {AppLayout} from '@/components/layout/AppLayout';
import {PageHeader} from '@/components/layout/PageHeader';
import {ProfileForm} from '@/components/profile/ProfileForm';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import {useAuthContext} from '@/contexts/AuthContext';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export default function SettingsPage() {
  const {user, isLoading} = useAuthContext();

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner size='lg' className='h-full' />
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <PageHeader
        title='Settings'
        description='Tune the public version of you: headline, profile links, and the account details behind the studio.'
      />

      <div className='grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information and social links.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                name: user.name,
                title: user.title ?? null,
                bio: user.bio ?? null,
                githubUrl: user.githubUrl ?? null,
                linkedinUrl: user.linkedinUrl ?? null,
                twitterUrl: user.twitterUrl ?? null,
                websiteUrl: user.websiteUrl ?? null,
              }}
            />
          </CardContent>
        </Card>

        <Card className='h-fit'>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border border-border/70 bg-secondary/30 p-3'>
              <label className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>Email</label>
              <p className='mt-1 break-all text-sm font-semibold'>{user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
