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
    <aside className="hidden w-[268px] shrink-0 flex-col gap-4 xl:flex">
      <div className="rounded-xl border border-[#efefef] bg-white p-3">
        <button
          type="button"
          onClick={() => onTab("saved")}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
            tab === "saved" ? "bg-primary-50 text-primary-500" : "text-ink hover:bg-[#f9fafb]"
          }`}
        >
          <Image src="/assets/feed/icon-bookmark.svg" alt="" width={18} height={18} />
          Saved posts
        </button>
        <button
          type="button"
          onClick={() => onTab("mine")}
          className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
            tab === "mine" ? "bg-primary-50 text-primary-500" : "text-ink hover:bg-[#f9fafb]"
          }`}
        >
          <Image src="/assets/feed/icon-pencil.svg" alt="" width={18} height={18} />
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

      <div className="rounded-xl border border-[#efefef] bg-white p-4">
        <div className="flex items-center gap-2">
          <Image src="/assets/feed/icon-bell.svg" alt="" width={18} height={18} />
          <p className="text-sm font-medium text-ink">Notification</p>
        </div>
        {notifications.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No notifications yet!</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onOpenNotification(n)}
                  className="flex w-full gap-2 text-left"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-medium text-primary-500">
                    {n.profileUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.profileUrl} alt="" className="size-full rounded-full object-cover" />
                    ) : (
                      initials(n.name || "?")
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-4 text-ink ${n.read ? "" : "font-medium"}`}>
                      {n.title || n.name || "Activity"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{formatFeedTime(n.timestamp, "notif")}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-4">
        <div className="flex items-center gap-2">
          <Image src="/assets/feed/icon-trend.svg" alt="" width={18} height={18} />
          <p className="text-sm font-medium text-ink">Trending in the community</p>
        </div>
        <ol className="mt-3 flex flex-col gap-3">
          {FEED_TRENDING.map((item) => (
            <li key={item.rank} className="flex gap-3">
              <span className="w-4 text-sm font-medium text-muted">{item.rank}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
