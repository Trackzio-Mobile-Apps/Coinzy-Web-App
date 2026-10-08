import type { ReactNode } from "react";

/** Sticky footer CTA on collection coin details (Figma `1348:175552`). */
export function CollectionDetailsSellBar({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-[#efefef] bg-[#1e1e1f]/95 px-6 py-4 lg:pl-[254px]">
      <div className="pointer-events-auto w-full max-w-[400px]">{children}</div>
    </div>
  );
}
