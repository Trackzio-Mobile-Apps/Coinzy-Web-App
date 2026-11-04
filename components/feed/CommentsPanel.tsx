"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const COMMENT_MAX_LENGTH = 500;

/** Inline comments and replies for a feed post. */
export function CommentsPanel({
  open,
  post,
  me,
  onOpen,
  onCommentCountDelta,
}: {
  open: boolean;
  post: FeedPost;
  me: CommunityUser;
  onOpen: () => void;
  onCommentCountDelta: (postId: string, delta: number) => void;
}) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 82)}px`;
  }, [text, open]);

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
  }, [open, post.id, me.userId]);


  const submit = async () => {
    const body = text.trim();
    if (!body || busy) return;
    if (text.length > COMMENT_MAX_LENGTH) {
      setError(`Comments must be ${COMMENT_MAX_LENGTH} characters or fewer.`);
      return;
    }
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
    <div className="flex flex-col gap-3" aria-label="Post comments">
        {open && <div className="flex flex-col gap-3">
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
                      <button type="button" onClick={() => { setReplyTo(c.id); inputRef.current?.focus(); }}>
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
        </div>}

        <div>
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
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e5e5e5] bg-primary-50 text-xs font-medium text-primary-500">
              {me.profilePictureUrl ? <img src={me.profilePictureUrl} alt="" className="size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling?.classList.remove("hidden"); }} /> : null}<span className={me.profilePictureUrl ? "hidden" : undefined}>{initials(me.name || "?")}</span>
            </div>
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              maxLength={COMMENT_MAX_LENGTH}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment"
              aria-label="Add a comment"
              onFocus={onOpen}
              className="min-h-10 max-h-[82px] min-w-0 flex-1 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm leading-5 outline-none focus:border-primary-500"
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
            <div className="relative"><button type="button" aria-label="Choose emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((value) => !value)} className="flex size-8 items-center justify-center text-[#141b34]"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.8 1.2 2 1.8 3.5 1.8s2.7-.6 3.5-1.8M8.5 9.5h.01M15.5 9.5h.01"/></svg></button>{emojiOpen && <div className="absolute bottom-full right-0 z-10 mb-2 flex gap-1 rounded-lg border border-[#e5e5e5] bg-white p-2 shadow-lg">{["😀", "😊", "❤️", "👍", "🎉"].map((emoji) => <button key={emoji} type="button" aria-label={`Add ${emoji}`} onClick={() => { setText((value) => (value + emoji).slice(0, COMMENT_MAX_LENGTH)); setEmojiOpen(false); inputRef.current?.focus(); }} className="rounded p-1 hover:bg-[#f5f5f5]">{emoji}</button>)}</div>}</div>
            {text.trim() && <button
              type="button"
              onClick={() => void submit()}
              disabled={busy || !text.trim()}
              className="flex size-9 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-50"
              aria-label="Send"
            >
              <Image src="/assets/home/icon-arrow-right.svg" alt="" width={14} height={12} className="brightness-0 invert" />
            </button>}
          </div>
          {text.length > 0 && <p className="mt-1 text-right text-xs text-muted" aria-live="polite">
            {text.length >= COMMENT_MAX_LENGTH ? `Character limit reached (${COMMENT_MAX_LENGTH}).` : `${text.length}/${COMMENT_MAX_LENGTH}`}
          </p>}
        </div>
    </div>
  );
}
