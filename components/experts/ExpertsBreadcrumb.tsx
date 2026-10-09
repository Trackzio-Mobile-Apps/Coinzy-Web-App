import Link from "next/link";

export function ExpertsBreadcrumb({
  crumbs,
}: {
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm leading-5 text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <span className="text-[#a4a4a7]">/</span> : null}
            {c.href ? (
              <Link href={c.href} className="text-primary-500 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
