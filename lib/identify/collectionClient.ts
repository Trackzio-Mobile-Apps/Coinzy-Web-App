import type { AddCoinRequestBody } from "@/lib/identify/addCoinPayload";
import type { CollectionsFetchPayload } from "@/lib/identify/collections";

export async function fetchCollectionsViaApi(): Promise<
  { error: false; data: CollectionsFetchPayload } | { error: true; reason?: string }
> {
  const res = await fetch("/api/collections/fetchAll?pageSize=50", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const json = (await res.json()) as CollectionsFetchPayload & { error?: boolean; reason?: string };
  if (!res.ok || json.error) return { error: true, reason: json.reason };
  return {
    error: false,
    data: {
      data: json.data ?? [],
      ownedCount: json.ownedCount,
      identifiedCount: json.identifiedCount,
      wishlistedCount: json.wishlistedCount,
    },
  };
}

export async function addCoinViaApi(
  body: AddCoinRequestBody & Record<string, unknown>,
): Promise<{ error: false } | { error: true; reason?: string }> {
  const res = await fetch("/api/coin/add", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { error?: boolean; reason?: string };
  if (!res.ok || json.error) return { error: true, reason: json.reason };
  return { error: false };
}
