
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, ListOrdered, PlusCircle, CalendarPlus, UserPlus, ListChecks, HelpCircle, Edit3, UserCog, ClipboardEdit, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';

const publicNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/leaderboards', label: 'Leaderboards', icon: ListOrdered },
  { href: '/predict-and-win', label: 'Predict & Win', icon: HelpCircle },
];

const adminNavItems = [
  { href: '/admin/add-news', label: 'Add News', icon: PlusCircle },
  { href: '/admin/add-tournament', label: 'Add Tournament', icon: CalendarPlus },
  { href: '/admin/add-team', label: 'Add Team', icon: UserPlus },
  { href: '/admin/manage-teams', label: 'Manage Teams', icon: UserCog }, // Changed UsersCog to UserCog
  { href: '/admin/manage-tournaments', label: 'Manage Tournaments', icon: ClipboardEdit },
  { href: '/admin/update-leaderboard', label: 'Update Leaderboard', icon: ListChecks },
  { href: '/admin/manage-prediction', label: 'Manage Prediction', icon: Edit3 },
];

export function NavMenu() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();

  let navItems = [...publicNavItems];

  // Only show admin links if the user is authenticated and has admin privileges
  if (isAdmin) {
    navItems = [...navItems, ...adminNavItems];
  }

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1"> {/* Adjusted gap for more items */}
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              'text-xs sm:text-sm font-medium transition-colors hover:text-accent focus-visible:text-accent px-1.5 py-1 sm:px-2 sm:py-2', // Adjusted padding
              isActive ? 'text-accent' : 'text-muted-foreground',
              'flex items-center gap-1 sm:gap-1.5' // Adjusted gap within button
            )}
            title={item.label} // Added title for better UX on small screens
          >
            <Link href={item.href}>
              <item.icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent')} />
              <span className="hidden xl:inline">{item.label}</span> {/* Changed to xl:inline to show labels later */}
            </Link>
          </Button>
        );
      })}
      
      {/* Show logout button if user is authenticated */}
      {user && (
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className={cn(
            'text-xs sm:text-sm font-medium transition-colors hover:text-accent focus-visible:text-accent px-1.5 py-1 sm:px-2 sm:py-2',
            'text-muted-foreground',
            'flex items-center gap-1 sm:gap-1.5'
          )}
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-accent" />
          <span className="hidden xl:inline">Logout</span>
        </Button>
      )}
    </nav>
  );
}
