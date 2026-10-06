import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/landing/TopNav";
import { Footer } from "@/components/landing/Footer";
import { DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { ArticleBody, BlogGrid, BlogSectionHeader } from "@/components/blogs/BlogParts";
import { BLOG_POSTS, formatBlogDate, getPost, readTime, relatedPosts, type BlogAuthor } from "@/lib/blogs";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | Coinzy Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.heroImage ?? post.image], type: "article" },
  };
}

function Avatar({ author, size }: { author: BlogAuthor; size: "sm" | "lg" }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-500 text-2xl leading-8 text-white ${
        size === "sm" ? "size-14 font-normal" : "size-16 font-semibold"
      }`}
    >
      {author.initials}
    </span>
  );
}

/** Blog article — Figma `Landing page/BlogsPage/Read` (828:40221). */
export default async function BlogArticlePage({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <article className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-20 lg:px-[160px]">
          <DetailsBreadcrumb ancestors={[{ href: "/blogs", label: "Blogs" }]} current={post.title} />

          {/* Title, category, author (Figma 851:24614) */}
          <header className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-medium leading-10 text-ink sm:text-4xl">{post.title}</h1>
              <span className="flex h-6 shrink-0 items-center self-start rounded-full bg-[#e8e8e8] px-3 text-xs font-medium leading-4 text-muted sm:self-auto">
                {post.tags[0]}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Avatar author={post.author} size="sm" />
              <div className="flex flex-col gap-2">
                <p className="text-xl font-medium leading-7 text-ink">By {post.author.name}</p>
                <p className="text-base leading-6 text-muted">
                  <time dateTime={post.date}>{formatBlogDate(post.date)}</time> · {readTime(post)} min read
                </p>
              </div>
            </div>
          </header>

          {/* Body (Figma 859:43116) */}
          <div className="mt-10 flex flex-col gap-8">
            <div className="relative h-[220px] w-full overflow-hidden rounded-2xl sm:h-[467px]">
              <Image
                src={post.heroImage ?? post.image}
                alt=""
                fill
                priority
                sizes="(min-width: 1440px) 1120px, 100vw"
                className="object-cover"
              />
            </div>
            <ArticleBody blocks={post.body} />
          </div>

          {/* Author bio (Figma 851:84060) */}
          <div className="mt-10 border-t border-[#e5e5e5] pt-10">
            <div className="flex items-center gap-4">
              <Avatar author={post.author} size="lg" />
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-xl font-semibold leading-7 text-ink">{post.author.name}</p>
                <p className="text-base leading-6 text-neutral-400">{post.author.bio}</p>
              </div>
            </div>
          </div>
        </article>

        {/* Similar blogs (Figma 903:22298) */}
        <section className="mx-auto w-full max-w-[1440px] px-6 py-20 lg:px-[160px] lg:py-[140px]">
          <BlogSectionHeader
            label="Similar blogs"
            title="Explore more blogs"
            description="Read and learn about similar blogs. What a coin is worth, what to look for, what to avoid — and the stories behind the coins collectors chase."
            viewAllHref="/blogs"
          />
          <div className="mt-8">
            <BlogGrid posts={relatedPosts(post)} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
