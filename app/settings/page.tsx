'use client';

import {AppLayout} from '@/components/AppLayout';
import {PageHeader} from '@/components/PageHeader';
import {ProfileForm} from '@/components/ProfileForm';
import {useAuthContext} from '@/contexts/AuthContext';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2} from 'lucide-react';

export default function SettingsPage() {
  const {user, isLoading} = useAuthContext();

  if (isLoading) {
    return (
      <AppLayout>
        <div className='flex h-full items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <PageHeader title='Settings' description='Manage your account settings.' />

      <div className='max-w-2xl space-y-6'>
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

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className='text-sm font-medium'>Email</label>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
