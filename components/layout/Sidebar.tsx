'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Code2, LayoutDashboard, MessageCircle, Settings, Sparkles} from 'lucide-react';
import {cn} from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Coach',
    href: '/coach',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    label: 'Stack',
    href: '/stack',
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
    <aside className="hidden h-screen w-[17.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl shadow-primary/10 md:flex">
      <div className="flex h-[4.5rem] items-center border-b border-sidebar-border/80 px-5">
        <Link href="/" className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground shadow-lg shadow-black/15">
            HM
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-semibold">
              <span className="text-gradient">HireMe</span>
              <span className="text-sidebar-foreground">.dev</span>
            </span>
            <span className="mt-1 text-[11px] font-medium text-sidebar-foreground/55">
              Career story studio
            </span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-black/10'
                  : 'text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
              )}
            >
              <span
                className={cn(
                  'absolute left-0 h-6 w-1 rounded-r-full bg-sidebar-primary opacity-0 transition-opacity',
                  isActive && 'opacity-100',
                )}
              />
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-lg border border-sidebar-border/80 bg-white/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-sidebar-primary" />
          Ready for rehearsal
        </div>
      </div>
    </aside>
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-lg border border-sidebar-border/70 bg-sidebar/95 p-1 text-sidebar-foreground shadow-2xl shadow-black/20 backdrop-blur md:hidden">
      {navItems.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
    </>
  );
}
