'use client';

import {AppLayout} from '@/components/AppLayout';
import {PageHeader} from '@/components/PageHeader';
import {useAuthContext} from '@/contexts/AuthContext';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export default function SettingsPage() {
  const {user} = useAuthContext();

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        description="Manage your account settings."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-sm text-muted-foreground">{user?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
