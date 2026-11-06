"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { fetchFeedPosts } from "@/lib/feed/posts";
import type { FeedPost } from "@/lib/feed/types";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { ensureFirebaseSession } from "@/lib/firebase/authBridge";

function FeedImagePlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#f8f1ed] text-[#9b6b5e]" aria-hidden="true">
      <span className="flex size-12 items-center justify-center rounded-full bg-white/80">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.8-.8L4 20l.8-4.7a8.5 8.5 0 1 1 16.2-3.8Z" /><path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" strokeWidth="2.5" /></svg>
      </span>
      <span className="text-xs font-medium">Community conversation</span>
    </div>
  );
}

export function CommunityFeedSection() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
        if (response.ok) {
          const data = await response.json() as { user?: { email?: string; isGuest?: boolean } };
          if (data.user) await ensureFirebaseSession({ email: data.user.email || "", isGuest: data.user.isGuest === true || !data.user.email });
        } else {
          const auth = getFirebaseAuth();
          await new Promise<void>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, () => { unsubscribe(); resolve(); });
          });
        }
        const result = await fetchFeedPosts({ pageSize: 3, currentUserId: null });
        if (active) { setPosts(result.posts); setStatus("ready"); }
      } catch {
        if (active) setStatus("unavailable");
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  return (
    <SectionShell id="blogs" className="bg-cream">
      <div className="space-y-8">
        <SectionHeader label="Community" title="From the Coinzy feed" description="Daily coin discoveries, expert articles, and collector conversations." actionLabel="View all" actionHref="/feed" tight />
        {status === "loading" ? <p className="text-sm text-muted">Loading community posts…</p> : status === "unavailable" ? (
          <p className="text-sm text-muted">Community posts are unavailable here. <Link className="text-primary-500 underline" href="/feed">Open the feed</Link> to see the latest posts.</p>
        ) : posts.length === 0 ? <p className="text-sm text-muted">There are no community posts yet.</p> : (
          <div className="grid gap-4 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary-500/[0.12] bg-surface p-px">
                <div className="relative h-40 shrink-0 overflow-hidden bg-[#f8f1ed]">{post.imageList[0] ? <FallbackImage src={post.imageList[0]} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" fallback={<FeedImagePlaceholder />} /> : <FeedImagePlaceholder />}</div>
                <div className="flex flex-1 flex-col items-start gap-3 p-5">
                  <p className="text-xs text-muted">{post.user?.name || "Coinzy collector"}</p>
                  {post.title && <h3 className="line-clamp-3 font-jakarta text-sm font-bold leading-[20.3px] text-ink">{post.title}</h3>}
                  {post.content && <p className="line-clamp-3 font-jakarta text-xs leading-[1.5] text-muted">{post.content}</p>}
                  <p className="text-xs text-muted">{post.likeCount} likes · {post.commentCount} comments</p>
                  <Link href="/feed" className="mt-auto inline-block rounded-lg px-2 py-1 text-xs font-medium text-primary-500 hover:bg-black/5">Open feed</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
