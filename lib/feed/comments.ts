"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { FEED_COLLECTIONS, type CommunityUser, type FeedComment, type FeedReply } from "@/lib/feed/types";

type CommentDoc = {
  postId?: string;
  content?: string;
  user?: CommunityUser | null;
  timestamp?: number;
  likeCount?: number;
};

type ReplyDoc = {
  content?: string;
  user?: CommunityUser | null;
  timestamp?: number;
  likeCount?: number;
};

async function isCommentLiked(commentId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  const snap = await getDoc(doc(getFirebaseDb(), FEED_COLLECTIONS.comments, commentId, "likes", userId));
  return snap.exists();
}

async function isReplyLiked(
  parentCommentId: string,
  replyId: string,
  userId: string,
): Promise<boolean> {
  if (!userId) return false;
  const snap = await getDoc(
    doc(getFirebaseDb(), FEED_COLLECTIONS.comments, parentCommentId, "replies", replyId, "likes", userId),
  );
  return snap.exists();
}

async function fetchRepliesPreview(
  parentCommentId: string,
  currentUserId: string | null,
): Promise<{ replies: FeedReply[]; isMoreThan2: boolean }> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, FEED_COLLECTIONS.comments, parentCommentId, "replies"),
      orderBy("timestamp", "asc"),
      limit(4),
    ),
  );
  const isMoreThan2 = snap.docs.length > 2;
  const slice = snap.docs.slice(0, isMoreThan2 ? 3 : snap.docs.length);
  const replies = await Promise.all(
    slice.map(async (d) => {
      const data = d.data() as ReplyDoc;
      return {
        id: d.id,
        parentCommentId,
        user: data.user ?? null,
        content: data.content ?? "",
        timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
        likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
        isLikedByCurrentUser: currentUserId
          ? await isReplyLiked(parentCommentId, d.id, currentUserId)
          : false,
      } satisfies FeedReply;
    }),
  );
  return { replies, isMoreThan2 };
}

export async function fetchCommentsForPost(opts: {
  postId: string;
  currentUserId: string;
  pageSize?: number;
  startAfterId?: string | null;
}): Promise<FeedComment[]> {
  const db = getFirebaseDb();
  const pageSize = opts.pageSize ?? 20;
  let q = query(
    collection(db, FEED_COLLECTIONS.comments),
    where("postId", "==", opts.postId),
    orderBy("timestamp", "desc"),
    limit(pageSize),
  );
  if (opts.startAfterId) {
    const last = await getDoc(doc(db, FEED_COLLECTIONS.comments, opts.startAfterId));
    if (last.exists()) {
      q = query(
        collection(db, FEED_COLLECTIONS.comments),
        where("postId", "==", opts.postId),
        orderBy("timestamp", "desc"),
        startAfter(last),
        limit(pageSize),
      );
    }
  }
  const snap = await getDocs(q);
  return Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data() as CommentDoc;
      const liked = await isCommentLiked(d.id, opts.currentUserId);
      const { replies, isMoreThan2 } = await fetchRepliesPreview(d.id, opts.currentUserId);
      return {
        id: d.id,
        postId: data.postId ?? opts.postId,
        user: data.user ?? null,
        content: data.content ?? "",
        timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
        likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
        isLikedByCurrentUser: liked,
        replies,
        isMoreThan2,
      } satisfies FeedComment;
    }),
  );
}

export async function addComment(
  postId: string,
  user: CommunityUser,
  content: string,
): Promise<string> {
  const db = getFirebaseDb();
  return runTransaction(db, async (tx) => {
    const commentRef = doc(collection(db, FEED_COLLECTIONS.comments));
    tx.set(commentRef, {
      postId,
      user,
      content: content.trim(),
      timestamp: Date.now(),
      likeCount: 0,
    });
    tx.update(doc(db, FEED_COLLECTIONS.posts, postId), { commentCount: increment(1) });
    return commentRef.id;
  });
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const db = getFirebaseDb();
  await runTransaction(db, async (tx) => {
    tx.delete(doc(db, FEED_COLLECTIONS.comments, commentId));
    tx.update(doc(db, FEED_COLLECTIONS.posts, postId), { commentCount: increment(-1) });
  });
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<void> {
  const db = getFirebaseDb();
  const likeRef = doc(db, FEED_COLLECTIONS.comments, commentId, "likes", userId);
  const commentRef = doc(db, FEED_COLLECTIONS.comments, commentId);
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists()) {
      tx.delete(likeRef);
      tx.update(commentRef, { likeCount: increment(-1) });
    } else {
      tx.set(likeRef, { userId, timestamp: Date.now() });
      tx.update(commentRef, { likeCount: increment(1) });
    }
  });
}

export async function addReply(
  parentCommentId: string,
  user: CommunityUser,
  content: string,
): Promise<string> {
  const refDoc = await addDoc(
    collection(getFirebaseDb(), FEED_COLLECTIONS.comments, parentCommentId, "replies"),
    {
      user,
      content: content.trim(),
      timestamp: Date.now(),
      likeCount: 0,
    },
  );
  return refDoc.id;
}

export async function deleteReply(parentCommentId: string, replyId: string): Promise<void> {
  await deleteDoc(
    doc(getFirebaseDb(), FEED_COLLECTIONS.comments, parentCommentId, "replies", replyId),
  );
}

export async function toggleReplyLike(
  parentCommentId: string,
  replyId: string,
  user: CommunityUser,
): Promise<void> {
  const db = getFirebaseDb();
  const likeRef = doc(
    db,
    FEED_COLLECTIONS.comments,
    parentCommentId,
    "replies",
    replyId,
    "likes",
    user.userId,
  );
  const replyRef = doc(db, FEED_COLLECTIONS.comments, parentCommentId, "replies", replyId);
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists()) {
      tx.delete(likeRef);
      tx.update(replyRef, { likeCount: increment(-1) });
    } else {
      tx.set(likeRef, user);
      tx.update(replyRef, { likeCount: increment(1) });
    }
  });
}

export async function updateComment(commentId: string, content: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), FEED_COLLECTIONS.comments, commentId), {
    content: content.trim(),
  });
}

/** Load more replies beyond the card preview. */
export async function fetchAllReplies(
  parentCommentId: string,
  currentUserId: string | null,
): Promise<FeedReply[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), FEED_COLLECTIONS.comments, parentCommentId, "replies"),
      orderBy("timestamp", "asc"),
    ),
  );
  return Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data() as ReplyDoc;
      return {
        id: d.id,
        parentCommentId,
        user: data.user ?? null,
        content: data.content ?? "",
        timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
        likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
        isLikedByCurrentUser: currentUserId
          ? await isReplyLiked(parentCommentId, d.id, currentUserId)
          : false,
      } satisfies FeedReply;
    }),
  );
}
