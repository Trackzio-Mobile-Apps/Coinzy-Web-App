"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import {
  FEED_COLLECTIONS,
  FEED_PAGE_SIZE,
  type CommunityUser,
  type FeedPost,
} from "@/lib/feed/types";

/** Android CreatePostBottomSheet — “Only 2 images allowed”. */
export const FEED_MAX_IMAGES = 2;

type PostDoc = {
  title?: string;
  content?: string;
  user?: CommunityUser | null;
  imageList?: string[] | null;
  timestamp?: number;
  likeCount?: number;
  commentCount?: number;
  isBuySell?: boolean;
};

function mapPost(
  snap: QueryDocumentSnapshot<DocumentData>,
  opts: { isBookmarked: boolean; isLikedByCurrentUser: boolean },
): FeedPost {
  const data = snap.data() as PostDoc;
  return {
    id: snap.id,
    title: data.title ?? "",
    content: data.content ?? "",
    user: data.user ?? null,
    imageList: Array.isArray(data.imageList) ? data.imageList.filter(Boolean) : [],
    timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
    likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    isBookmarked: opts.isBookmarked,
    isLikedByCurrentUser: opts.isLikedByCurrentUser,
    isBuySell: data.isBuySell === true,
  };
}

async function bookmarkedIds(userId: string, postIds: string[]): Promise<Set<string>> {
  if (!userId || postIds.length === 0) return new Set();
  const db = getFirebaseDb();
  const found = new Set<string>();
  // Firestore `in` max 10
  for (let i = 0; i < postIds.length; i += 10) {
    const chunk = postIds.slice(i, i + 10);
    const q = query(
      collection(db, FEED_COLLECTIONS.users, userId, "bookmarks"),
      where(documentId(), "in", chunk),
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => found.add(d.id));
  }
  return found;
}

async function likedIds(userId: string, postIds: string[]): Promise<Set<string>> {
  if (!userId || postIds.length === 0) return new Set();
  const db = getFirebaseDb();
  const found = new Set<string>();
  await Promise.all(
    postIds.map(async (postId) => {
      const like = await getDoc(doc(db, FEED_COLLECTIONS.posts, postId, "likes", userId));
      if (like.exists()) found.add(postId);
    }),
  );
  return found;
}

async function enrichPosts(
  docs: QueryDocumentSnapshot<DocumentData>[],
  currentUserId: string | null,
): Promise<FeedPost[]> {
  const ids = docs.map((d) => d.id);
  const [bookmarks, likes] = await Promise.all([
    currentUserId ? bookmarkedIds(currentUserId, ids) : Promise.resolve(new Set<string>()),
    currentUserId ? likedIds(currentUserId, ids) : Promise.resolve(new Set<string>()),
  ]);
  return docs.map((d) =>
    mapPost(d, {
      isBookmarked: bookmarks.has(d.id),
      isLikedByCurrentUser: likes.has(d.id),
    }),
  );
}

export async function fetchFeedPosts(opts: {
  pageSize?: number;
  startAfterId?: string | null;
  currentUserId: string | null;
}): Promise<{ posts: FeedPost[]; lastId: string | null }> {
  const db = getFirebaseDb();
  const pageSize = opts.pageSize ?? FEED_PAGE_SIZE;
  let q = query(
    collection(db, FEED_COLLECTIONS.posts),
    orderBy("timestamp", "desc"),
    limit(pageSize),
  );
  if (opts.startAfterId) {
    const last = await getDoc(doc(db, FEED_COLLECTIONS.posts, opts.startAfterId));
    if (last.exists()) {
      q = query(
        collection(db, FEED_COLLECTIONS.posts),
        orderBy("timestamp", "desc"),
        startAfter(last),
        limit(pageSize),
      );
    }
  }
  const snap = await getDocs(q);
  const posts = await enrichPosts(snap.docs, opts.currentUserId);
  return { posts, lastId: snap.docs.at(-1)?.id ?? null };
}

export async function fetchMyPosts(opts: {
  userId: string;
  pageSize?: number;
  startAfterId?: string | null;
}): Promise<{ posts: FeedPost[]; lastId: string | null }> {
  const db = getFirebaseDb();
  const pageSize = opts.pageSize ?? FEED_PAGE_SIZE;
  let q = query(
    collection(db, FEED_COLLECTIONS.posts),
    where("user.userId", "==", opts.userId),
    orderBy("timestamp", "desc"),
    limit(pageSize),
  );
  if (opts.startAfterId) {
    const last = await getDoc(doc(db, FEED_COLLECTIONS.posts, opts.startAfterId));
    if (last.exists()) {
      q = query(
        collection(db, FEED_COLLECTIONS.posts),
        where("user.userId", "==", opts.userId),
        orderBy("timestamp", "desc"),
        startAfter(last),
        limit(pageSize),
      );
    }
  }
  const snap = await getDocs(q);
  const posts = await enrichPosts(snap.docs, opts.userId);
  return { posts, lastId: snap.docs.at(-1)?.id ?? null };
}

export async function fetchBookmarkedPosts(opts: {
  userId: string;
  pageSize?: number;
}): Promise<{ posts: FeedPost[]; lastId: string | null }> {
  const db = getFirebaseDb();
  const pageSize = opts.pageSize ?? FEED_PAGE_SIZE;
  const bookmarksSnap = await getDocs(
    query(
      collection(db, FEED_COLLECTIONS.users, opts.userId, "bookmarks"),
      limit(pageSize),
    ),
  );
  if (bookmarksSnap.empty) return { posts: [], lastId: null };
  const postIds = bookmarksSnap.docs.map((d) => d.id);
  const postSnaps = await Promise.all(postIds.map((id) => getDoc(doc(db, FEED_COLLECTIONS.posts, id))));
  const docs = postSnaps.filter((s) => s.exists()) as QueryDocumentSnapshot<DocumentData>[];
  // Preserve bookmark order roughly; enrich marks all bookmarked
  const posts = await enrichPosts(docs, opts.userId);
  return { posts: posts.map((p) => ({ ...p, isBookmarked: true })), lastId: null };
}

export async function fetchPostById(
  postId: string,
  currentUserId: string | null,
): Promise<FeedPost | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, FEED_COLLECTIONS.posts, postId));
  if (!snap.exists()) return null;
  const [posts] = await Promise.all([enrichPosts([snap as QueryDocumentSnapshot<DocumentData>], currentUserId)]);
  return posts[0] ?? null;
}

export async function createPost(input: {
  title: string;
  content: string;
  user: CommunityUser;
  isBuySell?: boolean;
  imageFiles?: File[];
}): Promise<string> {
  const db = getFirebaseDb();
  const refDoc = await addDoc(collection(db, FEED_COLLECTIONS.posts), {
    title: input.title.trim(),
    content: input.content.trim(),
    user: input.user,
    imageList: [] as string[],
    timestamp: Date.now(),
    likeCount: 0,
    commentCount: 0,
    isBuySell: input.isBuySell === true,
  });

  // Android CreatePostBottomSheet: max 2 images
  const files = (input.imageFiles?.filter(Boolean) ?? []).slice(0, FEED_MAX_IMAGES);
  if (files.length) {
    const urls = await uploadPostImages(refDoc.id, files);
    // Mirror Android: update post doc with download URLs after Storage upload
    await updateDoc(refDoc, { imageList: urls });
  }
  return refDoc.id;
}

export async function uploadPostImages(postId: string, files: File[]): Promise<string[]> {
  const storage = getFirebaseStorage();
  const urls: string[] = [];
  for (const file of files) {
    const name = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const storageRef = ref(storage, `posts/${postId}/images/${name}`);
    await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });
    urls.push(await getDownloadURL(storageRef));
  }
  return urls;
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), FEED_COLLECTIONS.posts, postId));
}

/** Android `updatePost` — `postsCollection.document(id).set(post.toDto())`. */
export async function updatePost(post: FeedPost): Promise<void> {
  await setDoc(doc(getFirebaseDb(), FEED_COLLECTIONS.posts, post.id), {
    title: post.title,
    content: post.content,
    user: post.user,
    imageList: post.imageList,
    timestamp: post.timestamp,
    likeCount: post.likeCount,
    isBuySell: post.isBuySell,
  });
}


export async function togglePostLike(postId: string, user: CommunityUser): Promise<void> {
  const db = getFirebaseDb();
  const likeRef = doc(db, FEED_COLLECTIONS.posts, postId, "likes", user.userId);
  const postRef = doc(db, FEED_COLLECTIONS.posts, postId);
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists()) {
      tx.delete(likeRef);
      tx.update(postRef, { likeCount: increment(-1) });
    } else {
      tx.set(likeRef, user);
      tx.update(postRef, { likeCount: increment(1) });
    }
  });
}

export async function toggleBookmark(
  postId: string,
  user: CommunityUser,
  post: FeedPost,
): Promise<void> {
  const db = getFirebaseDb();
  const bookmarkRef = doc(db, FEED_COLLECTIONS.users, user.userId, "bookmarks", postId);
  const existing = await getDoc(bookmarkRef);
  if (existing.exists()) {
    await deleteDoc(bookmarkRef);
  } else {
    await setDoc(bookmarkRef, {
      title: post.title,
      content: post.content,
      user: post.user,
      imageList: post.imageList,
      timestamp: post.timestamp,
      likeCount: post.likeCount,
      isBuySell: post.isBuySell,
    });
  }
}

export async function reportContent(payload: {
  reporterId: string;
  postId?: string;
  commentId?: string;
  reason: string;
}): Promise<string> {
  const refDoc = await addDoc(collection(getFirebaseDb(), FEED_COLLECTIONS.report), {
    ...payload,
    timestamp: Date.now(),
  });
  return refDoc.id;
}
