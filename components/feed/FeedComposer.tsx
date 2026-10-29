"use client";

import Image from "next/image";
import { useState } from "react";
import { initials } from "@/lib/feed/format";
import type { CommunityUser } from "@/lib/feed/types";

export function FeedComposer({ me, onCompose }: { me: CommunityUser; onCompose: () => void }) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const photo = me.profilePictureUrl;
  return (
    <div aria-label="Create a feed post" className="flex h-[61px] shrink-0 items-start gap-3 rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
      <div className="relative size-8 shrink-0">
        <div className="flex size-full items-center justify-center overflow-hidden rounded-full border border-[#e5e5e5] bg-[#f5f5f5] text-xs font-medium text-muted">
          {photo && failedPhoto !== photo ? (
            // Same avatar rendering as FeedPostCard and CreatePostDialog; Firebase URLs are dynamic.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={`${me.name}'s profile picture`} width={32} height={32} onError={() => setFailedPhoto(photo)} className="size-full object-cover" />
          ) : initials(me.name || "?")}
        </div>
        <span aria-hidden="true" className="absolute bottom-0 right-0 size-2 rounded-full bg-[#16a34a] ring-2 ring-white" />
      </div>
      <button type="button" onClick={onCompose} className="flex h-8 min-w-0 flex-1 items-center rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 text-left text-sm leading-5 text-[#a4a4a7]">
        <span className="truncate">What’s on your mind?</span>
      </button>
      <div className="flex shrink-0 gap-0.5">
        <button type="button" aria-label="Add photo" onClick={onCompose} className="flex size-9 items-center justify-center rounded-[10px] hover:bg-neutral-50">
          <Image src="/assets/feed/icon-compose-image.svg" alt="" width={16} height={16} />
        </button>
        <button type="button" aria-label="Camera" onClick={onCompose} className="flex size-9 items-center justify-center rounded-[10px] hover:bg-neutral-50">
          <Image src="/assets/feed/icon-compose-camera.svg" alt="" width={15} height={15} />
        </button>
      </div>
    </div>
  );
}
