
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Trophy, Users, ListOrdered, Home, PlusCircle, CalendarPlus, UserPlus, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/leaderboards', label: 'Leaderboards', icon: ListOrdered },
  { href: '/admin/add-news', label: 'Add News', icon: PlusCircle },
  { href: '/admin/add-tournament', label: 'Add Tournament', icon: CalendarPlus },
  { href: '/admin/add-team', label: 'Add Team', icon: UserPlus },
  { href: '/admin/update-leaderboard', label: 'Update Leaderboard', icon: ListChecks },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2"> {/* Adjusted gap for more items */}
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              'text-sm font-medium transition-colors hover:text-accent focus-visible:text-accent px-2 sm:px-3 py-1 sm:py-2', // Adjusted padding
              isActive ? 'text-accent' : 'text-muted-foreground',
              'flex items-center gap-1 sm:gap-2' // Adjusted gap within button
            )}
            title={item.label} // Added title for better UX on small screens
          >
            <Link href={item.href}>
              <item.icon className={cn('h-4 w-4 sm:h-5 sm:w-5', isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent')} />
              <span className="hidden lg:inline">{item.label}</span> {/* Changed to lg:inline to show labels later */}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
