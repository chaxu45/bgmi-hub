
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Trophy, Users, ListOrdered, Home, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/leaderboards', label: 'Leaderboards', icon: ListOrdered },
  { href: '/admin/add-news', label: 'Add News', icon: PlusCircle }, // Added new nav item
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
              <span className="hidden md:inline">{item.label}</span> {/* Changed to md:inline to show labels earlier */}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

