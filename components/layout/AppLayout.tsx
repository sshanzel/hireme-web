'use client';

import Link from 'next/link';
import {ProtectedRoute} from '@/components/auth/ProtectedRoute';
import {Sidebar} from './Sidebar';
import {CVUploadOverlay} from '@/components/common/CVUploadOverlay';
import {useAuthContext} from '@/contexts/AuthContext';
import {getInitials} from '@/lib/strings/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {User, Settings, LogOut, Search, Sparkles} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({children}: AppLayoutProps) {
  const {user, logout} = useAuthContext();

  return (
    <ProtectedRoute>
      <CVUploadOverlay />
      <div className='workspace-grid flex h-screen bg-background/80'>
        <Sidebar />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <header className='flex h-[4.5rem] items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl md:px-6'>
            <Link href='/' className='text-lg font-semibold md:hidden'>
              <span className='text-gradient'>HireMe</span>
              <span>.dev</span>
            </Link>
            <div className='hidden min-w-0 items-center gap-3 md:flex'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/90 shadow-sm'>
                <Search className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase text-muted-foreground'>Workspace</p>
                <p className='truncate text-sm font-semibold text-foreground'>
                  Build, tag, and rehearse sharper career stories
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 md:ml-auto'>
              <div className='hidden items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-foreground lg:flex'>
                <Sparkles className='h-3.5 w-3.5 text-accent' />
                Story mode
              </div>
            <DropdownMenu>
              <DropdownMenuTrigger className='flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 bg-card/85 px-2 py-1.5 shadow-sm transition-colors hover:bg-secondary/60'>
                <span className='hidden max-w-[10.5rem] truncate text-sm font-medium text-foreground sm:block'>
                  {user?.name || user?.email}
                </span>
                <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm'>
                  {user?.name ? getInitials(user.name) : <User className='h-4 w-4' />}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem asChild>
                  <Link href={`/${user?.username ?? user?.id}`} className='cursor-pointer'>
                    <User className='mr-2 h-4 w-4' />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/settings' className='cursor-pointer'>
                    <Settings className='mr-2 h-4 w-4' />
                    Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className='cursor-pointer text-destructive focus:text-destructive'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </header>
          <main className='flex-1 overflow-auto p-4 pb-24 md:p-6'>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
