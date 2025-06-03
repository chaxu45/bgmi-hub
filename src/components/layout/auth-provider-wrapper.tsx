'use client';

import { AuthProvider } from '@/lib/firebase/auth-context';
import { ReactNode } from 'react';

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
