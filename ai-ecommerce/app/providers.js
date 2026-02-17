'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}