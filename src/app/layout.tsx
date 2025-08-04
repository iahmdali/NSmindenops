
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { AppTitleProvider } from '@/components/app-title-context';
import { usePathname } from 'next/navigation';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { useEffect, type ReactNode } from 'react';
import { redirect } from 'next/navigation';

const APP_TITLE = 'SRD: Minden Operations';

// Since we can't apply metadata in a client component, 
// we can export it from the layout, but it might be better to have a RootLayout Server Component
// wrapping this client-side layout. For this case, this is fine.
export const metadata: Metadata = {
  title: APP_TITLE,
  description: 'Shift Report Dashboard by North Sails',
};

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      redirect('/login');
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && pathname !== '/login') {
    // This will be caught by the redirect effect, but as a fallback
    return null;
  }
  
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
      <AppTitleProvider title={APP_TITLE}>
        <AppLayout>
          {children}
        </AppLayout>
      </AppTitleProvider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <AuthProvider>
            <ProtectedLayout>
              {children}
            </ProtectedLayout>
          </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
