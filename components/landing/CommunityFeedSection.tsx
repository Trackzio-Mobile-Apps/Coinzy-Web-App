import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { FEED_POSTS } from "@/lib/constants";

const ICONS = "/assets/landing-page/10-community";

type Post = (typeof FEED_POSTS)[number];

/** Header art per Figma: two-sided coin pair, a 360×203 photo, or a full-width square photo — all top-cropped to 160px. */
function PostHeader({ header }: { header: Post["header"] }) {
  const images: readonly string[] = header.images;
  const [first, second] = images;
  const pair = header.layout === "pair";
  return (
    <div
      className={`flex h-40 justify-center overflow-hidden ${pair ? "items-center gap-10" : "items-start"}`}
      style={{ backgroundColor: header.bg }}
    >
      {pair && second ? (
        <>
          <Image src={first} alt="" width={139} height={263} className="h-[263px] w-[139px] max-w-none shrink-0" />
          <Image src={second} alt="" width={131} height={263} className="h-[263px] w-[131px] max-w-none shrink-0" />
        </>
      ) : (
        <Image
          src={first}
          alt=""
          width={360}
          height={360}
          className={
            header.layout === "square"
              ? "aspect-square w-full object-cover"
              : "h-[203px] w-[360px] max-w-none shrink-0 object-cover"
          }
        />
      )}
    </div>
  );
}

const ACTIONS = [
  { label: "Like", icon: "icon-like.svg", className: "text-[#549dff]" },
  { label: "Comment", icon: "icon-comment.svg", className: "text-muted" },
  { label: "Share", icon: "icon-share.svg", className: "text-muted" },
];

export function CommunityFeedSection() {
  return (
    <SectionShell id="blogs" className="bg-cream">
      <div className="space-y-8">
        <SectionHeader
          label="Community"
          title="From the Coinzy feed"
          description="Daily coin discoveries, expert articles, and collector conversations."
          actionLabel="View all"
          actionHref="/blogs"
          tight
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {FEED_POSTS.map((post) => (
            <article
              key={post.title}
              className="overflow-hidden rounded-2xl border border-primary-500/[0.12] bg-surface p-px"
            >
              <PostHeader header={post.header} />
              <div className="space-y-3 p-5">
                <h3 className="truncate font-jakarta text-sm font-bold leading-[20.3px] text-ink">
                  {post.title}
                </h3>
                <div className="space-y-2">
                  <p className="line-clamp-3 font-jakarta text-xs leading-[1.5] text-muted">{post.excerpt}</p>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs font-medium leading-4 text-[#171717] hover:bg-black/5"
                  >
                    Read more
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  {ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium leading-4 hover:bg-black/5 ${action.className}`}
                    >
                      <Image src={`${ICONS}/${action.icon}`} alt="" width={16} height={16} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
