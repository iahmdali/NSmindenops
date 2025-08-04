
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

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

  useEffect(() => {
    // Check for auth cookie on initial load
    const userCookie = Cookies.get('auth_user');
    if (userCookie) {
      setIsAuthenticated(true);
      setUser(userCookie);
    }
    setIsLoading(false);
  }, []);

  const login = (newUser: string) => {
    setIsAuthenticated(true);
    setUser(newUser);
    Cookies.set('auth_user', newUser, { expires: 7 }); // Cookie expires in 7 days
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    Cookies.remove('auth_user');
    // Full page reload to ensure all state is cleared
    window.location.href = '/login';
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
