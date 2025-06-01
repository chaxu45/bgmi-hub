import Link from 'next/link';
import { NavMenu } from './nav-menu';
import { Gamepad2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-bold text-primary-foreground font-headline">
            BGMI India Hub
          </h1>
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
