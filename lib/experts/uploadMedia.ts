"use client";

/**
 * Android `ExpertMediaUploader` parity — compress → Firebase Storage → HTTPS download URLs.
 * Path: `expert-evaluations/{sessionId}/{obverse|reverse|edge|video}/{file}`.
 * Experts API accepts any HTTPS host in `payload.media` (no `/users/uploads`).
 */

import { signInAnonymously } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ensureFirebaseSession } from "@/lib/firebase/authBridge";
import { getFirebaseAuth, getFirebaseStorage } from "@/lib/firebase/client";
import type { ExpertRequestMedia } from "@/lib/experts/types";

/**
 * Storage rules only need `request.auth != null` (same as Android). Prefer the Feed
 * email/password bridge; if that account exists with a different credential (e.g. Google),
 * fall back to anonymous so uploads still work.
 */
export async function ensureExpertsFirebaseAuth(identity: {
  email: string;
  isGuest: boolean;
}): Promise<void> {
  try {
    const user = await ensureFirebaseSession(identity);
    if (user) return;
  } catch {
    /* fall through */
  }
  const auth = getFirebaseAuth();
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}

const STORAGE_ROOT = "expert-evaluations";
const MAX_IMAGE_EDGE_PX = 1280;
const MAX_IMAGE_BYTES = 350 * 1024;

type Slot = "obverse" | "reverse" | "edge";

async function compressImageToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > MAX_IMAGE_EDGE_PX ? MAX_IMAGE_EDGE_PX / longest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to compress image.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    let quality = 0.72;
    let blob: Blob | null = null;
    do {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );
      quality -= 0.08;
    } while (blob && blob.size > MAX_IMAGE_BYTES && quality >= 0.24);

    if (!blob) throw new Error("Unable to compress image.");
    return blob;
  } finally {
    bitmap.close();
  }
}

async function uploadBlob(
  sessionId: string,
  slot: string,
  fileName: string,
  data: Blob,
  contentType: string,
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, `${STORAGE_ROOT}/${sessionId}/${slot}/${fileName}`);
  await uploadBytes(storageRef, data, { contentType });
  return getDownloadURL(storageRef);
}

async function uploadImageSlot(sessionId: string, slot: Slot, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImageToJpeg(files[i]!);
    urls.push(await uploadBlob(sessionId, slot, `${i}.jpg`, compressed, "image/jpeg"));
  }
  return urls;
}

async function uploadVideo(sessionId: string, file: File): Promise<string> {
  const contentType = file.type.startsWith("video/") ? file.type : "video/mp4";
  return uploadBlob(sessionId, "video", "video.mp4", file, contentType);
}

/** Upload request media the same way Android does (Firebase Storage, not Experts `/users/uploads`). */
export async function uploadExpertRequestMedia(input: {
  obverse: File[];
  reverse: File[];
  edge: File[];
  video?: File | null;
}): Promise<ExpertRequestMedia> {
  const sessionId = crypto.randomUUID();
  const [obverse, reverse, edge, video] = await Promise.all([
    uploadImageSlot(sessionId, "obverse", input.obverse),
    uploadImageSlot(sessionId, "reverse", input.reverse),
    uploadImageSlot(sessionId, "edge", input.edge),
    input.video ? uploadVideo(sessionId, input.video) : Promise.resolve(null),
  ]);
  return { obverse, reverse, edge, video };
}
