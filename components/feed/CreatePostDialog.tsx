"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { initials } from "@/lib/feed/format";
import { FEED_MAX_IMAGES } from "@/lib/feed/posts";
import type { CommunityUser, FeedPost } from "@/lib/feed/types";

/**
 * Create / edit post — Figma Feed modal.
 * Title and text are optional; require at least one text field or image, max 2 images.
 */
export function CreatePostDialog({
  open,
  busy,
  error,
  me,
  editing,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy: boolean;
  error: string | null;
  me: CommunityUser;
  editing: FeedPost | null;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    content: string;
    isBuySell: boolean;
    files: File[];
    keepImageUrls: string[];
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keepUrls, setKeepUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setContent(editing.content);
      setKeepUrls(editing.imageList.slice(0, FEED_MAX_IMAGES));
      setFiles([]);
      setPreviews([]);
    } else {
      setTitle("");
      setContent("");
      setKeepUrls([]);
      setFiles([]);
      setPreviews([]);
    }
  }, [open, editing]);

  if (!open) return null;

  const imageCount = keepUrls.length + files.length;
  const canPost = (title.trim().length > 0 || content.trim().length > 0 || imageCount > 0) && !busy;

  const close = () => {
    if (busy) return;
    previews.forEach((u) => URL.revokeObjectURL(u));
    onClose();
  };

  const onFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const room = FEED_MAX_IMAGES - keepUrls.length - files.length;
    if (room <= 0) return;
    const nextFiles = [...files, ...Array.from(list)].slice(0, files.length + room);
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return nextFiles.map((f) => URL.createObjectURL(f));
    });
    setFiles(nextFiles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="flex max-h-[90vh] w-full max-w-[572px] flex-col overflow-hidden rounded-[14px] bg-white shadow-xl">
        <div className="flex items-start gap-2 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-sm font-medium text-primary-500">
            {me.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.profilePictureUrl} alt="" className="size-full object-cover" />
            ) : (
              initials(me.name || "?")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium leading-6 text-ink">{me.name || "Collector"}</p>
            <p className="mt-1 text-sm leading-5 text-[#777]">Post to Anyone</p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="flex size-4 items-center justify-center text-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 pb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-lg border border-[#e5e5e5] px-2.5 text-sm font-medium outline-none placeholder:font-normal placeholder:text-[#a4a4a7] focus:border-primary-500"
          placeholder="Title (optional)"
          maxLength={120}
          disabled={busy}
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2 h-[76px] min-h-[76px] w-full resize-y rounded-lg border border-[#e5e5e5] px-2.5 py-2 text-sm leading-5 outline-none placeholder:text-[#a4a4a7] focus:border-primary-500"
          placeholder="Small Bio (optional)"
          disabled={busy}
        />

        {(keepUrls.length > 0 || previews.length > 0) && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {keepUrls.map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f3f4f6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                  onClick={() => setKeepUrls((u) => u.filter((x) => x !== src))}
                  disabled={busy}
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.map((src, i) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f3f4f6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                  onClick={() => {
                    setFiles((f) => f.filter((_, idx) => idx !== i));
                    setPreviews((p) => {
                      URL.revokeObjectURL(p[i]!);
                      return p.filter((_, idx) => idx !== i);
                    });
                  }}
                  disabled={busy}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="flex min-h-[68px] items-center justify-between gap-3 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || imageCount >= FEED_MAX_IMAGES}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-[#f3f4f6] disabled:opacity-40"
              aria-label="Add photo"
              title={`Up to ${FEED_MAX_IMAGES} images`}
            >
              <Image src="/assets/feed/icon-image.svg" alt="" width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || imageCount >= FEED_MAX_IMAGES}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-[#f3f4f6] disabled:opacity-40"
              aria-label="Camera"
            >
              <Image src="/assets/feed/icon-camera.svg" alt="" width={20} height={20} />
            </button>
          </div>
          <button
            type="button"
            disabled={!canPost}
            onClick={async () => {
              await onSubmit({
                title: title.trim(),
                content: content.trim(),
                isBuySell: editing?.isBuySell ?? false,
                files,
                keepImageUrls: keepUrls,
              });
            }}
            className="h-8 rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Posting…" : editing ? "Save" : "Post"}
          </button>
        </div>

      </div>
    </div>
  );
}
