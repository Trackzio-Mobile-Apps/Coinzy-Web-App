import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/landing/TopNav";
import { CommunityFeedSection } from "@/components/landing/CommunityFeedSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { BlogGrid, BlogSectionHeader } from "@/components/blogs/BlogParts";
import { BLOG_CATEGORIES, SORTED_POSTS, type BlogCategory } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Blogs | Coinzy AI",
  description:
    "Identification guides, value insights, expert Q&As and rare coin stories — everything a collector should know.",
};

const PAGE_SIZE = 6; // Figma: two rows of three

type Params = { searchParams: Promise<{ category?: string; show?: string }> };

/** Blogs listing — Figma `Landing page/BlogsPage` (822:23268). Filter + "Load more" are URL params. */
export default async function BlogsPage({ searchParams }: Params) {
  const { category: rawCategory, show } = await searchParams;
  const category = BLOG_CATEGORIES.find((c) => c === rawCategory) as BlogCategory | undefined;
  const filtered = category ? SORTED_POSTS.filter((p) => p.tags[0] === category) : SORTED_POSTS;
  const visible = Math.max(PAGE_SIZE, Number.parseInt(show ?? "", 10) || PAGE_SIZE);
  const posts = filtered.slice(0, visible);
  const query = (c?: string, n?: number) => {
    const qs = new URLSearchParams();
    if (c) qs.set("category", c);
    if (n) qs.set("show", String(n));
    return qs.toString();
  };
  const href = (c?: string, n?: number) => `/blogs${query(c, n) ? `?${query(c, n)}` : ""}#posts`;

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <HeroBanner
          label="The stories"
          title="Everything a collector should know."
          description="What a coin is worth, what to look for, what to avoid — and the stories behind the coins collectors chase."
        />

        <section id="posts" className="mx-auto w-full max-w-[1440px] scroll-mt-16 px-6 py-20 lg:px-[160px]">
          <BlogSectionHeader
            label="Browse blogs"
            title="Blogs"
            description="Welcome to the Coinzy blog. Identification guides, value insights, expert Q&As, rare coin stories, and everything else you need to know about your collection."
            viewAllHref="/blogs#posts"
          />

          <nav aria-label="Blog categories" className="mt-8 flex flex-wrap gap-3">
            {[undefined, ...BLOG_CATEGORIES].map((c) => {
              const active = c === category;
              return (
                <Link
                  key={c ?? "all"}
                  href={href(c)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-6 items-center rounded-full px-3 text-xs font-medium leading-4 ${
                    active ? "bg-ink text-white" : "bg-[#e8e8e8] text-muted hover:text-ink"
                  }`}
                >
                  {c ?? "All"}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5">
            {posts.length ? (
              <BlogGrid posts={posts} listQuery={query(category, visible > PAGE_SIZE ? visible : undefined)} />
            ) : (
              <p className="py-16 text-center text-sm text-muted">No posts in this category yet — check back soon.</p>
            )}
          </div>

          {filtered.length > posts.length && (
            <div className="mt-[124px] flex justify-center">
              <Link
                href={href(category, visible + PAGE_SIZE)}
                scroll={false}
                replace
                className="rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium leading-5 text-[#0a0a0a] hover:bg-neutral-50"
              >
                Load more posts
              </Link>
            </div>
          )}
        </section>

        <WebappCTASection />
        <CommunityFeedSection />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
