"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatFeedTime, initials } from "@/lib/feed/format";
import type { FeedPost } from "@/lib/feed/types";

const THUMB = "/assets/feed/icon-thumbs-up.svg";
const THUMB_FILLED = "/assets/feed/icon-thumbs-up-filled.svg";
const COMMENT = "/assets/landing-page/10-community/icon-comment.svg";
const BOOKMARK = "/assets/feed/icon-bookmark.svg";
const BOOKMARK_FILLED = "/assets/feed/icon-bookmark-filled.svg";

export function FeedPostCard({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onOpenComments,
  onEdit,
  onDelete,
  onReport,
}: {
  post: FeedPost;
  currentUserId: string;
  onLike: () => void;
  onBookmark: () => void;
  onOpenComments: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}) {
  const author = post.user?.name?.trim() || "Collector";
  const isOwner = Boolean(currentUserId && post.user?.userId === currentUserId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <article className="rounded-2xl border border-[#efefef] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-sm font-medium text-primary-500">
          {post.user?.profilePictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.user.profilePictureUrl} alt="" className="size-full object-cover" />
          ) : (
            initials(author)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-5 text-ink">{author}</p>
              <p className="text-xs leading-4 text-muted">
                Coin collector · {formatFeedTime(post.timestamp)}
                {post.isBuySell ? (
                  <span className="ml-2 rounded-full bg-[#eef2ff] px-2 py-0.5 text-[11px] font-medium text-[#4338ca]">
                    Buy / Sell
                  </span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={onBookmark}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f3f4f6]"
              aria-pressed={post.isBookmarked}
              aria-label={post.isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Image
                src={post.isBookmarked ? BOOKMARK_FILLED : BOOKMARK}
                alt=""
                width={18}
                height={18}
              />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f3f4f6]"
                aria-label="More"
                aria-expanded={menuOpen}
              >
                <Image src="/assets/feed/icon-more.svg" alt="" width={18} height={18} />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg">
                  {isOwner && onEdit ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink hover:bg-[#f9fafb]"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit();
                      }}
                    >
                      <Image src="/assets/feed/icon-pencil.svg" alt="" width={16} height={16} />
                      Edit post
                    </button>
                  ) : null}
                  {isOwner && onDelete ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-[#fef2f2]"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                    >
                      <Image src="/assets/feed/icon-trash.svg" alt="" width={16} height={16} />
                      Delete post
                    </button>
                  ) : null}
                  {!isOwner && onReport ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink hover:bg-[#f9fafb]"
                      onClick={() => {
                        setMenuOpen(false);
                        onReport();
                      }}
                    >
                      Report
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {post.title ? (
            <h3 className="mt-3 text-base font-semibold leading-6 text-ink">{post.title}</h3>
          ) : null}
          {post.content ? (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[#404042]">{post.content}</p>
          ) : null}

          {post.imageList.length > 0 && (
            <div
              className={`mt-3 grid gap-2 ${post.imageList.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {post.imageList.slice(0, 2).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f3f4f6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-5">
            <button
              type="button"
              onClick={onLike}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
              aria-pressed={post.isLikedByCurrentUser}
            >
              <Image
                src={post.isLikedByCurrentUser ? THUMB_FILLED : THUMB}
                alt=""
                width={18}
                height={18}
              />
              <span>
                {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenComments}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
            >
              <Image src={COMMENT} alt="" width={18} height={18} />
              <span>
                {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
