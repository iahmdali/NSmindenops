
"use client";

import { createContext, useContext, type ReactNode } from "react";

interface AppTitleContextType {
  title: string;
}

const AppTitleContext = createContext<AppTitleContextType | undefined>(undefined);

export function AppTitleProvider({ children, title }: { children: ReactNode, title: string }) {
  return (
    <AppTitleContext.Provider value={{ title }}>
      {children}
    </AppTitleContext.Provider>
  );
}

export function useAppTitle() {
  const context = useContext(AppTitleContext);
  if (context === undefined) {
    throw new Error("useAppTitle must be used within an AppTitleProvider");
  }
  return context;
}
