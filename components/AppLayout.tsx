'use client';

import {ProtectedRoute} from '@/components/ProtectedRoute';
import {Sidebar} from '@/components/Sidebar';
import {CVUploadOverlay} from '@/components/CVUploadOverlay';
import {useAuthContext} from '@/contexts/AuthContext';
import {Button} from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({children}: AppLayoutProps) {
  const {user, logout} = useAuthContext();

  return (
    <ProtectedRoute>
      <CVUploadOverlay />
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-end border-b px-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
