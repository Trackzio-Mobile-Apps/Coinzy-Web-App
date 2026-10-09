"use client";

import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { FEED_COLLECTIONS, type FeedNotification } from "@/lib/feed/types";

type NotifDoc = {
  userId?: string;
  name?: string;
  type?: string;
  sourceUserId?: string;
  postId?: string;
  commentId?: string | null;
  replyId?: string | null;
  contentPreview?: string | null;
  timestamp?: number;
  read?: boolean;
  profileUrl?: string | null;
  title?: string | null;
};

function mapNotif(id: string, data: NotifDoc): FeedNotification {
  return {
    id,
    userId: data.userId ?? "",
    name: data.name ?? "",
    type: data.type ?? "",
    sourceUserId: data.sourceUserId ?? "",
    postId: data.postId ?? "",
    commentId: data.commentId ?? null,
    replyId: data.replyId ?? null,
    contentPreview: data.contentPreview ?? null,
    timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
    read: data.read === true,
    profileUrl: data.profileUrl ?? null,
    title: data.title ?? null,
  };
}

export async function fetchNotifications(opts: {
  userId: string;
  pageSize?: number;
  startAfterId?: string | null;
}): Promise<FeedNotification[]> {
  const db = getFirebaseDb();
  const pageSize = opts.pageSize ?? 20;
  let q = query(
    collection(db, FEED_COLLECTIONS.notifications),
    where("userId", "==", opts.userId),
    orderBy("timestamp", "desc"),
    limit(pageSize),
  );
  if (opts.startAfterId) {
    const last = await getDoc(doc(db, FEED_COLLECTIONS.notifications, opts.startAfterId));
    if (last.exists()) {
      q = query(
        collection(db, FEED_COLLECTIONS.notifications),
        where("userId", "==", opts.userId),
        orderBy("timestamp", "desc"),
        startAfter(last),
        limit(pageSize),
      );
    }
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapNotif(d.id, d.data() as NotifDoc));
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), FEED_COLLECTIONS.notifications, notificationId), {
    read: true,
  });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) return 0;
  const q = query(
    collection(getFirebaseDb(), FEED_COLLECTIONS.notifications),
    where("userId", "==", userId),
    where("read", "==", false),
  );
  try {
    const agg = await getCountFromServer(q);
    return agg.data().count;
  } catch {
    const snap = await getDocs(q);
    return snap.size;
  }
}

/** Create an in-app notification (Android CommunityViewModel.createNotification). */
export async function createNotification(input: {
  recipientUserId: string;
  type: string;
  sourceUserId: string;
  postId: string;
  name: string;
  title?: string;
  contentPreview?: string;
  commentId?: string;
  replyId?: string;
  profileUrl?: string;
}): Promise<string> {
  if (!input.recipientUserId || input.recipientUserId === input.sourceUserId) return "";
  const refDoc = await addDoc(collection(getFirebaseDb(), FEED_COLLECTIONS.notifications), {
    userId: input.recipientUserId,
    name: input.name,
    type: input.type,
    sourceUserId: input.sourceUserId,
    postId: input.postId,
    commentId: input.commentId ?? null,
    replyId: input.replyId ?? null,
    contentPreview: input.contentPreview ?? null,
    timestamp: Date.now(),
    read: false,
    profileUrl: input.profileUrl ?? null,
    title: input.title ?? null,
  });
  return refDoc.id;
}
