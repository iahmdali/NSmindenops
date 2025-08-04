
"use client";

import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { AppTitleProvider } from '@/components/app-title-context';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { AuthContext, useAuth } from '@/hooks/use-auth';

const APP_TITLE = 'SRD: Minden Operations';

function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userCookie = Cookies.get('auth_user');
    if (userCookie) {
      setIsAuthenticated(true);
      setUser(userCookie);
       if(pathname === '/login') {
         router.push('/dashboard');
      }
    } else {
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
    setIsLoading(false);
  }, [pathname, router]);

  const login = (newUser: string) => {
    setIsAuthenticated(true);
    setUser(newUser);
    Cookies.set('auth_user', newUser, { expires: 7 }); 
    router.push('/dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    Cookies.remove('auth_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


function AppContent({ children }: { children: ReactNode }) {
  const {isAuthenticated, isLoading} = useAuth();
  const pathname = usePathname();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }
  
  if (!isAuthenticated) {
    return null; 
  }

  return (
      <AppLayout>
        {children}
      </AppLayout>
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
        <title>{APP_TITLE}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <AuthProvider>
            <AppTitleProvider title={APP_TITLE}>
                <AppContent>
                  {children}
                </AppContent>
             </AppTitleProvider>
          </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
