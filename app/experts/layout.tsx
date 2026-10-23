import type { ReactNode } from "react";
import { requireCatalogueSession } from "@/lib/auth/catalogue-session";

/** Experts routes need a catalogue session valid for `COINZY_*_ORIGIN` (same JWT as Experts Bearer). */
export default async function ExpertsLayout({ children }: { children: ReactNode }) {
  await requireCatalogueSession("/experts");
  return children;
}
