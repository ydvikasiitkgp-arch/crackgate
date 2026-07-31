"use client";

import { createContext, useContext, type ReactNode } from "react";

const ImpersonationContext = createContext(false);

export function ImpersonationProvider({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <ImpersonationContext.Provider value={active}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation(): boolean {
  return useContext(ImpersonationContext);
}
