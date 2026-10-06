import { type ReactNode } from "react";

interface SectionShellProps {
  children: ReactNode;
  id?: string;
  className?: string;
  innerClassName?: string;
  /** Full-bleed layer rendered behind the content, outside the 1440px inner column. */
  background?: ReactNode;
}

export function SectionShell({
  children,
  id,
  className = "",
  innerClassName = "",
  background,
}: SectionShellProps) {
  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      {background}
      <div
        className={`relative mx-auto w-full max-w-[1440px] px-6 py-20 lg:px-[160px] lg:py-[140px] ${innerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
