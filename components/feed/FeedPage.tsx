"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CommentsPanel } from "@/components/feed/CommentsPanel";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { FeedAside } from "@/components/feed/FeedAside";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { ensureFirebaseSession } from "@/lib/firebase/authBridge";
import { initials } from "@/lib/feed/format";
import { fetchNotifications, createNotification, markNotificationRead } from "@/lib/feed/notifications";
import {
  createPost,
  deletePost,
  fetchBookmarkedPosts,
  fetchFeedPosts,
  fetchMyPosts,
  fetchPostById,
  reportContent,
  toggleBookmark,
  togglePostLike,
  updatePost,
  uploadPostImages,
  FEED_MAX_IMAGES,
} from "@/lib/feed/posts";
import type { CommunityUser, FeedNotification, FeedPost, FeedTab } from "@/lib/feed/types";

type MePayload = {
  id?: string;
  name?: string;
  email?: string;
  isGuest?: boolean;
};

export function FeedPage({
  premium,
  initialName,
  initialEmail,
  initialIsGuest,
}: {
  premium: boolean;
  initialName: string;
  initialEmail: string;
  initialIsGuest: boolean;
}) {
  void premium;
  const [tab, setTab] = useState<FeedTab>("all");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [me, setMe] = useState<CommunityUser>({
    userId: "",
    name: initialName || "Collector",
  });
  const [email, setEmail] = useState(initialEmail);
  const [isGuest, setIsGuest] = useState(initialIsGuest);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FeedPost | null>(null);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [commentsPost, setCommentsPost] = useState<FeedPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedPost | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<FeedNotification[]>([]);

  const communityUser = useMemo(() => me, [me]);

  const heading =
    tab === "mine" ? "My posts" : tab === "saved" ? "Saved posts" : "Feed";

  const bootstrap = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      const json = (await res.json()) as { error?: boolean; user?: MePayload };
      if (!res.ok || json.error || !json.user) {
        throw new Error("Sign in to use Feed.");
      }
      const user = json.user;
      setEmail(user.email || "");
      setIsGuest(user.isGuest === true);
      setMe({
        userId: user.id || "",
        name: user.name || initialName || "Collector",
      });
      await ensureFirebaseSession({
        email: user.email || "",
        isGuest: user.isGuest === true || !user.email,
      });
      if (user.id) {
        setNotifications(await fetchNotifications({ userId: user.id }).catch(() => []));
      }
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to Feed.");
      setReady(false);
    }
  }, [initialName]);

  const loadTab = useCallback(
    async (nextTab: FeedTab, userId: string, append = false, cursor: string | null = null) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        let result: { posts: FeedPost[]; lastId: string | null };
        if (nextTab === "mine") {
          result = await fetchMyPosts({ userId, startAfterId: append ? cursor : null });
        } else if (nextTab === "saved") {
          result = await fetchBookmarkedPosts({ userId });
        } else {
          result = await fetchFeedPosts({
            currentUserId: userId,
            startAfterId: append ? cursor : null,
          });
        }
        setPosts((prev) => (append ? [...prev, ...result.posts] : result.posts));
        setLastId(result.lastId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load posts.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!ready || !me.userId) return;
    void loadTab(tab, me.userId, false, null);
  }, [ready, me.userId, tab, loadTab]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const emptyCopy =
    tab === "saved"
      ? { title: "No saved posts", sub: "Bookmark posts from Feed to see them here." }
      : tab === "mine"
        ? { title: "No posts yet", sub: "Share a coin find to get started." }
        : { title: "No posts yet", sub: "Share a coin find to get started." };

  return (
    <div className="relative flex flex-1 gap-6 overflow-auto px-6 py-6 lg:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h2 className="text-2xl font-semibold leading-8 text-ink">{heading}</h2>

        {tab === "all" ? (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
            className="flex items-center gap-3 rounded-2xl border border-[#efefef] bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-sm font-medium text-primary-500">
              {initials(me.name || "?")}
            </div>
            <span className="flex-1 text-sm text-muted">What’s on your mind?</span>
            <Image src="/assets/feed/icon-image.svg" alt="" width={20} height={20} />
            <Image src="/assets/feed/icon-camera.svg" alt="" width={20} height={20} />
          </button>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button type="button" className="ml-2 underline" onClick={() => void bootstrap()}>
              Retry
            </button>
          </div>
        ) : null}

        {loading ? <p className="text-sm text-muted">Loading posts…</p> : null}

        {!loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#efefef] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <span className="text-4xl" aria-hidden>
              📝
            </span>
            <p className="mt-3 text-base font-semibold text-ink">{emptyCopy.title}</p>
            <p className="mt-1 text-sm text-muted">{emptyCopy.sub}</p>
            {tab !== "saved" ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setCreateOpen(true);
                }}
                className="mt-5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
              >
                Create post
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              currentUserId={me.userId}
              onLike={async () => {
                const wasLiked = post.isLikedByCurrentUser;
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === post.id
                      ? {
                          ...p,
                          isLikedByCurrentUser: !wasLiked,
                          likeCount: p.likeCount + (wasLiked ? -1 : 1),
                        }
                      : p,
                  ),
                );
                try {
                  await togglePostLike(post.id, communityUser);
                  if (!wasLiked && post.user?.userId) {
                    await createNotification({
                      recipientUserId: post.user.userId,
                      type: "post_liked",
                      sourceUserId: me.userId,
                      postId: post.id,
                      name: me.name,
                      title: `${me.name} Liked your post`,
                    });
                  }
                } catch {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === post.id
                        ? {
                            ...p,
                            isLikedByCurrentUser: wasLiked,
                            likeCount: post.likeCount,
                          }
                        : p,
                    ),
                  );
                }
              }}
              onBookmark={async () => {
                const was = post.isBookmarked;
                setPosts((prev) =>
                  prev.map((p) => (p.id === post.id ? { ...p, isBookmarked: !was } : p)),
                );
                try {
                  await toggleBookmark(post.id, communityUser, post);
                  if (tab === "saved" && was) {
                    setPosts((prev) => prev.filter((p) => p.id !== post.id));
                  }
                } catch {
                  setPosts((prev) =>
                    prev.map((p) => (p.id === post.id ? { ...p, isBookmarked: was } : p)),
                  );
                }
              }}
              onOpenComments={() => setCommentsPost(post)}
              onEdit={
                post.user?.userId === me.userId
                  ? () => {
                      setEditing(post);
                      setCreateOpen(true);
                    }
                  : undefined
              }
              onDelete={
                post.user?.userId === me.userId ? () => setDeleteTarget(post) : undefined
              }
              onReport={
                post.user?.userId !== me.userId
                  ? async () => {
                      const reason = window.prompt("Why are you reporting this post?");
                      if (!reason?.trim()) return;
                      await reportContent({
                        reporterId: me.userId,
                        postId: post.id,
                        reason: reason.trim(),
                      });
                      setToast("Report submitted");
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {tab !== "saved" && lastId && posts.length > 0 ? (
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadTab(tab, me.userId, true, lastId)}
            className="mx-auto rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        ) : null}
      </div>

      <FeedAside
        tab={tab}
        onTab={setTab}
        notifications={notifications}
        onOpenNotification={async (n) => {
          if (!n.read) {
            await markNotificationRead(n.id).catch(() => undefined);
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
          }
          if (n.postId) {
            const post = await fetchPostById(n.postId, me.userId);
            if (post) setCommentsPost(post);
          }
        }}
      />

      <CreatePostDialog
        open={createOpen}
        busy={createBusy}
        error={createError}
        me={communityUser}
        editing={editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
          setCreateError(null);
        }}
        onSubmit={async ({ title, content, isBuySell, files, keepImageUrls }) => {
          if (!me.userId) {
            setCreateError("Missing user id — refresh and try again.");
            return;
          }
          // Android enable rule
          if (!title.trim() || (!content.trim() && files.length === 0 && keepImageUrls.length === 0)) {
            setCreateError("Enter a title and add details or an image.");
            return;
          }
          setCreateBusy(true);
          setCreateError(null);
          try {
            await ensureFirebaseSession({ email, isGuest });
            if (editing) {
              const cappedKeep = keepImageUrls.slice(0, FEED_MAX_IMAGES);
              const room = FEED_MAX_IMAGES - cappedKeep.length;
              const newUrls =
                files.length && room > 0
                  ? await uploadPostImages(editing.id, files.slice(0, room))
                  : [];
              const imageList = [...cappedKeep, ...newUrls].slice(0, FEED_MAX_IMAGES);
              const next: FeedPost = {
                ...editing,
                title: title.trim(),
                content: content.trim(),
                isBuySell,
                imageList,
              };
              await updatePost(next);
              setPosts((prev) => prev.map((p) => (p.id === editing.id ? next : p)));
              setToast("Post updated");
            } else {
              await createPost({
                title: title.trim(),
                content: content.trim(),
                user: communityUser,
                isBuySell,
                imageFiles: files.slice(0, FEED_MAX_IMAGES),
              });
              setToast("Post uploaded");
              setTab("all");
              await loadTab("all", me.userId, false, null);
            }
            setCreateOpen(false);
            setEditing(null);
          } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Could not save post.");
          } finally {
            setCreateBusy(false);
          }
        }}
      />

      <CommentsPanel
        open={Boolean(commentsPost)}
        post={commentsPost}
        me={communityUser}
        onClose={() => setCommentsPost(null)}
        onCommentCountDelta={(postId, delta) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount + delta) } : p,
            ),
          );
          setCommentsPost((cur) =>
            cur && cur.id === postId
              ? { ...cur, commentCount: Math.max(0, cur.commentCount + delta) }
              : cur,
          );
        }}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">Delete this post?</h3>
            <p className="mt-2 text-sm text-muted">This can’t be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-[#f3f4f6]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={async () => {
                  setDeleteBusy(true);
                  try {
                    await deletePost(deleteTarget.id);
                    setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
                    setDeleteTarget(null);
                    setToast("Post deleted");
                  } finally {
                    setDeleteBusy(false);
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleteBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#16a34a] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          ✓ {toast}
        </div>
      ) : null}
    </div>
  );
}
