import type { IdentifyResponse } from "@/lib/identify/types";

export async function identifyCoinsV2(front: File, back: File, matchCount = 5): Promise<IdentifyResponse> {
  const body = new FormData();
  body.append("files", front);
  body.append("files", back);
  const res = await fetch(`/api/ai/identify-v2?matchCount=${matchCount}`, {
    method: "POST",
    body,
    credentials: "same-origin",
  });
  const json = (await res.json()) as IdentifyResponse;
  return json;
}
