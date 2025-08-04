
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  isLoading: boolean;
  login: (user: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
