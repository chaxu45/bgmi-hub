import type { ReactNode } from 'react';
import { Header } from './header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm border-t">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} BGMI India Hub. All rights reserved.
        </div>
      </footer>
    </>
  );
}
