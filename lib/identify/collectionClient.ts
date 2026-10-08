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

export async function createCollectionViaApi(
  name: string,
): Promise<{ error: false; collectionId: string; name: string } | { error: true; reason?: string }> {
  const res = await fetch("/api/collections/add", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const json = (await res.json()) as {
    error?: boolean;
    reason?: string;
    data?: { collectionId?: string; _id?: string; name?: string };
  };
  const collectionId = json.data?.collectionId ?? json.data?._id;
  if (!res.ok || json.error || !collectionId) {
    return { error: true, reason: json.reason ?? "Could not create collection." };
  }
  return {
    error: false,
    collectionId,
    name: json.data?.name ?? name,
  };
}

export async function addCoinViaApi(
  body: AddCoinRequestBody,
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
