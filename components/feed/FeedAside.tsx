"use client";

import Image from "next/image";
import { formatFeedTime, initials } from "@/lib/feed/format";
import { FEED_TRENDING } from "@/lib/feed/trending";
import type { FeedNotification, FeedTab } from "@/lib/feed/types";

/** Right rail — Figma Feed: Quick links · Notification · Trending. */
export function FeedAside({
  tab,
  onTab,
  notifications,
  onOpenNotification,
}: {
  tab: FeedTab;
  onTab: (tab: FeedTab) => void;
  notifications: FeedNotification[];
  onOpenNotification: (n: FeedNotification) => void;
}) {
  return (
    <aside aria-label="Feed sidebar" className="hidden w-[268px] shrink-0 flex-col gap-4 lg:flex">
      <div className="flex flex-col gap-4 rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
        <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onTab("saved")}
          className={`flex h-6 w-full items-center gap-3 rounded text-left text-sm font-medium ${
            tab === "saved" ? "bg-primary-50 text-primary-500" : "text-ink hover:bg-[#f9fafb]"
          }`}
        >
          <Image src="/assets/feed/icon-bookmark.svg" alt="" width={16} height={16} />
          Saved posts
        </button>
        <button
          type="button"
          onClick={() => onTab("mine")}
          className={`flex h-6 w-full items-center gap-3 rounded text-left text-sm font-medium ${
            tab === "mine" ? "bg-primary-50 text-primary-500" : "text-ink hover:bg-[#f9fafb]"
          }`}
        >
          <Image src="/assets/feed/icon-pencil.svg" alt="" width={16} height={16} />
          My posts
        </button>
        {tab !== "all" ? (
          <button
            type="button"
            onClick={() => onTab("all")}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-muted hover:text-ink"
          >
            ← Back to Feed
          </button>
        ) : null}
        </div>
        <hr className="border-t-[0.5px] border-border-neutral" />
        <div className="flex items-center gap-3">
          <Image src="/assets/feed/icon-bell.svg" alt="" width={16} height={16} />
          <p className="text-base font-medium leading-6 text-ink">Notification</p>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted">No notifications yet!</p>
        ) : (
          <ul className="flex flex-col">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id} className="border-b-[0.5px] border-[#c2c2c4] last:border-0">
                <button
                  type="button"
                  onClick={() => onOpenNotification(n)}
                  className={`flex w-full items-center gap-4 rounded-t-lg px-2 py-2 text-left ${n.read ? "" : "bg-[#f5ebeb]"}`}
                >
                  <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-[#b0b0b0] bg-primary-50 text-xs font-medium text-primary-500">
                    {n.profileUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.profileUrl} alt="" className="size-full rounded-full object-cover" />
                    ) : (
                      initials(n.name || "?")
                    )}
                    <span className={`absolute -bottom-1 -right-1 flex size-[18px] items-center justify-center rounded-full border bg-white ${n.type.includes("liked") ? "border-[#007aff]" : "border-[#34c759]"}`}>
                      <Image src={n.type.includes("liked") ? "/assets/feed/icon-thumbs-up.svg" : "/assets/landing-page/10-community/icon-comment.svg"} alt="" width={12} height={12} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-4 text-ink ${n.read ? "" : "font-medium"}`}>
                      {n.title || n.name || "Activity"}
                    </p>
                    <p className="mt-0.5 text-xs font-light leading-4 text-[#5d5d5d]">{formatFeedTime(n.timestamp, "notif")}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
        <p className="text-sm font-medium leading-5 text-ink">Trending in the community</p>
        <ol className="flex flex-col gap-2.5">
          {FEED_TRENDING.map((item) => (
            <li key={item.rank} className="flex items-center gap-3">
              <span className="flex h-5 min-w-[17px] items-center justify-center rounded-full bg-[#f2f2f3] px-1.5 text-xs font-medium leading-4 text-muted">{item.rank}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium leading-4 text-ink">{item.name}</p>
                <p className="mt-1 text-xs font-light leading-4 text-muted">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
