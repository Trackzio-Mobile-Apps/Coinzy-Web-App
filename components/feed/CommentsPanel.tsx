"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  addComment,
  addReply,
  fetchCommentsForPost,
  toggleCommentLike,
  toggleReplyLike,
} from "@/lib/feed/comments";
import { formatFeedTime, initials } from "@/lib/feed/format";
import { createNotification } from "@/lib/feed/notifications";
import type { CommunityUser, FeedComment, FeedPost } from "@/lib/feed/types";

/** Comments / replies modal — Figma Feed replies frame. */
export function CommentsPanel({
  open,
  post,
  me,
  onClose,
  onCommentCountDelta,
}: {
  open: boolean;
  post: FeedPost | null;
  me: CommunityUser;
  onClose: () => void;
  onCommentCountDelta: (postId: string, delta: number) => void;
}) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchCommentsForPost({
          postId: post.id,
          currentUserId: me.userId,
        });
        if (!cancelled) setComments(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load comments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, post, me.userId]);

  if (!open || !post) return null;

  const submit = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (replyTo) {
        await addReply(replyTo, me, body);
        const parent = comments.find((c) => c.id === replyTo);
        if (parent?.user?.userId) {
          await createNotification({
            recipientUserId: parent.user.userId,
            type: "reply_added",
            sourceUserId: me.userId,
            postId: post.id,
            name: me.name,
            commentId: replyTo,
            contentPreview: body.slice(0, 80),
            title: `${me.name} replied on your comment`,
          });
        }
      } else {
        await addComment(post.id, me, body);
        onCommentCountDelta(post.id, 1);
        if (post.user?.userId) {
          await createNotification({
            recipientUserId: post.user.userId,
            type: "comment_added",
            sourceUserId: me.userId,
            postId: post.id,
            name: me.name,
            contentPreview: body.slice(0, 80),
            title: `${me.name} Commented on your post`,
          });
        }
      }
      setText("");
      setReplyTo(null);
      setComments(await fetchCommentsForPost({ postId: post.id, currentUserId: me.userId }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="flex max-h-[min(720px,90dvh)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">
            Comments ({post.commentCount})
          </h2>
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? <p className="text-sm text-muted">Loading…</p> : null}
          {!loading && comments.length === 0 ? (
            <p className="text-sm text-muted">No comments yet. Start the discussion.</p>
          ) : null}
          <ul className="flex flex-col gap-4">
            {comments.map((c) => (
              <li key={c.id}>
                <div className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-medium text-primary-500">
                    {initials(c.user?.name || "?")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">{c.user?.name || "Collector"}</span>
                      <span className="text-[11px] text-muted">{formatFeedTime(c.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#404042]">{c.content}</p>
                    <div className="mt-2 flex gap-3 text-xs text-muted">
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleCommentLike(c.id, me.userId);
                          setComments((prev) =>
                            prev.map((x) =>
                              x.id === c.id
                                ? {
                                    ...x,
                                    isLikedByCurrentUser: !x.isLikedByCurrentUser,
                                    likeCount: x.likeCount + (x.isLikedByCurrentUser ? -1 : 1),
                                  }
                                : x,
                            ),
                          );
                        }}
                      >
                        {c.isLikedByCurrentUser ? "Unlike" : "Like"} · {c.likeCount}
                      </button>
                      <button type="button" onClick={() => setReplyTo(c.id)}>
                        Reply
                      </button>
                    </div>
                    {c.replies.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-3 border-l border-[#e5e7eb] pl-3">
                        {c.replies.map((r) => (
                          <li key={r.id} className="flex gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[10px] font-medium text-muted">
                              {initials(r.user?.name || "?")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-ink">
                                {r.user?.name || "Collector"}{" "}
                                <span className="font-normal text-muted">{formatFeedTime(r.timestamp)}</span>
                              </p>
                              <p className="text-sm text-[#404042]">{r.content}</p>
                              <button
                                type="button"
                                className="mt-1 text-xs text-muted"
                                onClick={async () => {
                                  await toggleReplyLike(c.id, r.id, me);
                                  setComments((prev) =>
                                    prev.map((x) =>
                                      x.id !== c.id
                                        ? x
                                        : {
                                            ...x,
                                            replies: x.replies.map((rr) =>
                                              rr.id === r.id
                                                ? {
                                                    ...rr,
                                                    isLikedByCurrentUser: !rr.isLikedByCurrentUser,
                                                    likeCount:
                                                      rr.likeCount + (rr.isLikedByCurrentUser ? -1 : 1),
                                                  }
                                                : rr,
                                            ),
                                          },
                                    ),
                                  );
                                }}
                              >
                                {r.isLikedByCurrentUser ? "Unlike" : "Like"} · {r.likeCount}
                              </button>
                            </div>
                          </li>
                        ))}
                        {c.isMoreThan2 ? (
                          <li className="text-xs text-muted">More replies available…</li>
                        ) : null}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#e5e7eb] p-4">
          {replyTo ? (
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Replying to comment</span>
              <button type="button" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </div>
          ) : null}
          {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-medium text-primary-500">
              {initials(me.name || "?")}
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="min-w-0 flex-1 rounded-full border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-primary-500"
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy || !text.trim()}
              className="flex size-9 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-50"
              aria-label="Send"
            >
              <Image src="/assets/home/icon-arrow-right.svg" alt="" width={14} height={12} className="brightness-0 invert" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
