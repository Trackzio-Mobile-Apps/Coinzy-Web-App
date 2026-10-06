import Image from "next/image";
import Link from "next/link";

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  labelClassName?: string;
  /** Figma variant with an 8px (not 12px) gap between title and description. */
  tight?: boolean;
}

export function SectionHeader({
  label,
  title,
  description,
  actionLabel,
  actionHref = "#",
  labelClassName = "text-primary-500",
  tight = false,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex-1 space-y-2">
        <p className={`text-xs font-light uppercase leading-4 ${labelClassName}`}>
          {label}
        </p>
        <div className={tight ? "space-y-2" : "space-y-3"}>
          <h2 className="text-2xl font-medium leading-8 text-ink">{title}</h2>
          {description && (
            <p className="text-sm leading-5 text-muted">{description}</p>
          )}
        </div>
      </div>
      {actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700"
        >
          {actionLabel}
          <Image
            src="/assets/landing-page/icons/shared/arrow-right.svg"
            alt=""
            width={16}
            height={16}
          />
        </Link>
      )}
    </div>
  );
}
