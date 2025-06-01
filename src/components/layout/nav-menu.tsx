'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Trophy, Users, ListOrdered, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/leaderboards', label: 'Leaderboards', icon: ListOrdered },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 sm:gap-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              'text-sm font-medium transition-colors hover:text-accent focus-visible:text-accent',
              isActive ? 'text-accent' : 'text-muted-foreground',
              'flex items-center gap-2'
            )}
          >
            <Link href={item.href}>
              <item.icon className={cn('h-5 w-5', isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent')} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
