"use client";

import { createContext, useContext, type ReactNode } from "react";

const ExpertsDummyPayContext = createContext({ allow: false, email: "" });

/** Provides staff-only dummy-pay eligibility from the signed-in session email. */
export function ExpertsDummyPayProvider({
  allow,
  email,
  children,
}: {
  allow: boolean;
  email: string;
  children: ReactNode;
}) {
  return <ExpertsDummyPayContext.Provider value={{ allow, email }}>{children}</ExpertsDummyPayContext.Provider>;
}

export function useExpertsDummyPayAllowed(): boolean {
  return useContext(ExpertsDummyPayContext).allow;
}

export function useExpertsAccountEmail(): string {
  return useContext(ExpertsDummyPayContext).email;
}
