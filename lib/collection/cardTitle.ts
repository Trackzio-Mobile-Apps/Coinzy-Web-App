export function systemCollectionTitle(kind: "owned" | "identified" | "wishlist", count: number): string {
  const label = kind === "owned" ? "Owned" : kind === "identified" ? "Identified" : "Wishlist";
  const n =
    (kind === "identified" || kind === "wishlist") && count < 100
      ? String(count).padStart(2, "0")
      : String(count);
  return `${label} (${n} coins)`;
}

export function privateCollectionTitle(name: string, count: number): string {
  return `${name} (${count} coins)`;
}
