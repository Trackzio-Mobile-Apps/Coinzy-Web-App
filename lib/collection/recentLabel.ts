/** Relative “recently added …” copy for collection home cards (Figma `1341:262557`). */
export function formatRecentlyAdded(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null;
  const then = Date.parse(updatedAt);
  if (!Number.isFinite(then)) return null;
  const diffMs = Date.now() - then;
  if (diffMs < 0) return null;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `recently added ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `recently added ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `recently added ${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `recently added ${weeks}w ago`;
}

export function collectionCardSubtitle(
  count: number,
  updatedAt: string | null | undefined,
): string {
  if (count === 0) return "No coins added";
  return formatRecentlyAdded(updatedAt) ?? "Recently updated";
}
