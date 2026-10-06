import Image from "next/image";
import Link from "next/link";
import { formatBlogDate, type BlogBlock, type BlogPost } from "@/lib/blogs";

const A = "/assets/blogs";

/** Figma soft badge: rgba(23,23,23,0.1) over white. */
const softBadge = "rounded-full bg-[#e8e8e8] font-medium text-muted";

/** Figma "Blogs card" (885:27125): 510px, 24px padding, 218px image, tags, title, 3-line excerpt, date + ↗. */
export function BlogCard({ post }: { post: BlogPost }) {
  const href = `/blogs/${post.slug}`;
  return (
    <article className="relative flex h-[510px] flex-col overflow-hidden rounded-[14px] bg-white py-6 shadow-[0_0_0_1px_rgba(10,10,10,0.1)] transition-shadow hover:shadow-[0_0_0_1px_rgba(10,10,10,0.1),0_8px_24px_-12px_rgba(0,0,0,0.25)]">
      <div className="flex flex-1 flex-col gap-6 px-6">
        <div className="relative h-[218px] w-full shrink-0 overflow-hidden rounded-lg">
          <Image src={post.image} alt="" fill sizes="(min-width: 1280px) 315px, (min-width: 768px) 45vw, 90vw" className="object-cover" />
        </div>
        <div className="flex h-[220px] flex-col gap-3">
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className={`${softBadge} px-2 py-0.5 text-sm leading-5`}>
                {tag}
              </span>
            ))}
          </div>
          <h3 className="line-clamp-2 text-xl font-medium leading-7 text-ink">
            {/* Stretched link: the whole card opens the article. */}
            <Link href={href} className="after:absolute after:inset-0">
              {post.title}
            </Link>
          </h3>
          <p className="line-clamp-3 min-h-0 flex-1 text-base leading-6 text-muted">{post.excerpt}</p>
          <div className="flex items-center gap-1.5">
            <span className="relative h-6 w-[21px] shrink-0">
              <Image src={`${A}/icon-calendar.svg`} alt="" width={21} height={22} className="absolute left-[-0.5px] top-[1.25px]" />
            </span>
            <time dateTime={post.date} className="flex-1 text-base leading-6 text-neutral-400">
              {formatBlogDate(post.date)}
            </time>
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white"
            >
              <Image src={`${A}/icon-arrow-up-right.svg`} alt="" width={16} height={16} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Figma blog section header (885:27104): Plus Jakarta label/heading/description, optional "View all". */
export function BlogSectionHeader({
  label,
  title,
  description,
  viewAllHref,
}: {
  label: string;
  title: string;
  description: string;
  viewAllHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-20">
      <div className="flex flex-1 flex-col gap-3">
        <p className="font-jakarta text-xs uppercase leading-[1.5] text-primary-500">{label}</p>
        <div className="flex flex-col gap-3">
          <h2 className="font-jakarta text-2xl font-bold leading-[1.2] text-ink">{title}</h2>
          <p className="font-jakarta text-sm leading-[1.5] text-muted">{description}</p>
        </div>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-[10px] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700 sm:self-auto"
        >
          View all
          <Image src="/assets/landing-page/icons/shared/arrow-right.svg" alt="" width={16} height={16} />
        </Link>
      )}
    </div>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

const bodyText = "text-base leading-6 text-neutral-400";

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "p":
      return <p className={`${bodyText} sm:text-justify`}>{block.text}</p>;
    case "h2":
      return <h2 className="-mb-2 text-xl font-semibold leading-7 text-ink">{block.text}</h2>;
    case "ul":
      return (
        <ul className={`${bodyText} list-disc space-y-0 ps-6`}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-border-neutral text-lg font-medium leading-7 text-ink">
                <th className="w-1/3 px-4 py-3 font-medium">{block.head[0]}</th>
                <th className="w-1/3 px-4 py-3 font-medium">{block.head[1]}</th>
                <th className="px-4 py-3 text-right font-medium">{block.head[2]}</th>
              </tr>
            </thead>
            <tbody className="text-base leading-6">
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-t border-neutral-50">
                  <td className="px-4 py-3 align-top text-muted">{row[0]}</td>
                  <td className="px-4 py-3 align-top text-muted">{row[1]}</td>
                  <td className="px-4 py-3 text-right align-top text-primary-500">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      // Figma "Try it with Coinzy AI" (851:27082): 16px radius, primary-50 border, white → #faf3f3 gradient.
      return (
        <aside className="my-4 flex flex-col gap-4 rounded-2xl border border-primary-50 bg-[linear-gradient(168.4deg,#fff_27.3%,#faf3f3_84.9%)] p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-medium leading-10 text-primary-500 sm:text-4xl">{block.title}</h2>
            <p className="text-lg leading-7 text-muted">{block.text}</p>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 self-start rounded-[10px] bg-primary-500 px-4 py-2 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700"
          >
            {block.button}
            <Image src={`${A}/icon-arrow-right-white.svg`} alt="" width={20} height={20} />
          </Link>
        </aside>
      );
  }
}

/**
 * Article body (Figma 859:43116): 16px #87878a text, 20px semibold headings. Paragraphs and sections are
 * 24px apart (Figma uses blank 24px lines), heading → content 16px, "Try it" box 40px from neighbours.
 */
export function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
