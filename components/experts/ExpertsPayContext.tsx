"use client";

import { createContext, useContext, type ReactNode } from "react";

const ExpertsDummyPayContext = createContext(false);

/** Provides staff-only dummy-pay eligibility from the signed-in session email. */
export function ExpertsDummyPayProvider({
  allow,
  children,
}: {
  allow: boolean;
  children: ReactNode;
}) {
  return <ExpertsDummyPayContext.Provider value={allow}>{children}</ExpertsDummyPayContext.Provider>;
}

export function useExpertsDummyPayAllowed(): boolean {
  return useContext(ExpertsDummyPayContext);
}
