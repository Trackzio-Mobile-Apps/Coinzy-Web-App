"use client";

import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";
import type { SidebarActive } from "@/lib/sidebarNav";

function PendingPage({ active, title }: { active: SidebarActive; title: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <SignedInRouteLoading active={active} title={title}>
        <div className="h-48 animate-pulse rounded-xl bg-black/[0.06]" />
      </SignedInRouteLoading>
    </div>,
    document.body,
  );
}

export function SidebarLink({ href, active, title, className, current, children }: {
  href: string;
  active: SidebarActive;
  title: string;
  className: string;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={className}>
      {children}
      <PendingPage active={active} title={title} />
    </Link>
  );
}
