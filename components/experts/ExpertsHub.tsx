import Image from "next/image";
import Link from "next/link";
import { BuyCreditsButton } from "@/components/experts/BuyCreditsButton";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import {
  expertDisplayTitle,
  expertRequestId,
  type ExpertRequest,
  type ExpertsDirectoryItem,
} from "@/lib/experts/types";

const A = "/assets/experts";

const REPORT_FEATURES = [
  {
    title: "Expert Analysis",
    body: "In-depth review",
    icon: `${A}/icon-feature-analysis.svg`,
    iconBg: "bg-[#6e60e7] shadow-[0_4px_5px_rgba(110,96,231,0.33)]",
    bar: "from-[rgba(110,96,231,0.33)] to-[rgba(110,96,231,0.06)]",
  },
  {
    title: "Market Value",
    body: "Current price range",
    icon: `${A}/icon-feature-value.svg`,
    iconBg: "bg-[#24bc8d] shadow-[0_4px_5px_rgba(36,188,141,0.33)]",
    bar: "from-[rgba(36,188,141,0.33)] to-[rgba(36,188,141,0.06)]",
  },
  {
    title: "History",
    body: "Era, ruler & origin",
    icon: `${A}/icon-feature-history.svg`,
    iconBg: "bg-[#2b7fff] shadow-[0_4px_5px_rgba(43,127,255,0.33)]",
    bar: "from-[rgba(43,127,255,0.33)] to-[rgba(43,127,255,0.06)]",
  },
  {
    title: "Details",
    body: "Rarity, mint & grade",
    icon: `${A}/icon-feature-details.svg`,
    iconBg: "bg-[#fe9a00] shadow-[0_4px_5px_rgba(254,154,0,0.33)]",
    bar: "from-[rgba(254,154,0,0.33)] to-[rgba(254,154,0,0.06)]",
  },
] as const;

/** Figma `1312:115253` Meet Our Experts — design assets (not API QA names). */
const FIGMA_EXPERTS = [
  {
    name: "David Richardson",
    rating: "4.9",
    reviews: "1,240",
    specialty: "Ancient Coins ● Indian Princely States",
    pic: `${A}/expert-david.webp`,
  },
  {
    name: "Priya Sharma",
    rating: "4.8",
    reviews: "129",
    specialty: "Mughal Era ● US Coins",
    pic: `${A}/expert-priya.webp`,
  },
  {
    name: "David Richardson",
    rating: "4.9",
    reviews: "1,240",
    specialty: "Ancient Banknotes ● Indian Princely States",
    pic: `${A}/expert-david.webp`,
  },
] as const;

function ArrowRight({ className, stroke = "#0A0A0A" }: { className?: string; stroke?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M6 4l4 4-4 4" stroke="#1E1E1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1.5l1.236 2.505 2.764.402-2 1.95.472 2.753L6 7.71l-2.472 1.3.472-2.753-2-1.95 2.764-.402L6 1.5z"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function statusLabel(status: string | null | undefined) {
  switch ((status || "").toLowerCase()) {
    case "offered":
      return "Review pending";
    case "accepted":
      return "In progress";
    case "completed":
      return "Completed";
    case "deadline_missed":
      return "Deadline missed";
    case "cancelled":
      return "Cancelled";
    default:
      return status || "Pending";
  }
}

function statusTone(status: string | null | undefined) {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "bg-[#dcfce7] text-[#0d542b]";
    case "deadline_missed":
    case "cancelled":
      return "bg-[#ffd5d4] text-[#660901]";
    case "accepted":
      return "bg-[#ffedd4] text-[#ca3500]";
    case "offered":
      return "bg-[#f3f5f7] text-[#6a7282]";
    default:
      return "bg-[#f5f5f5] text-[#525252]";
  }
}

/** Hub — Figma Copy `1312:115253` pixel layout. */
export function ExpertsHub({
  requests,
  creditBalance,
}: {
  requests: ExpertRequest[];
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
}) {
  const active = requests.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s === "offered" || s === "accepted" || s === "deadline_missed";
  });
  const past = requests.filter((r) => !active.includes(r));

  return (
    <div className="mx-auto flex w-full max-w-[1122px] items-start gap-4 px-8 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold leading-8 text-[#1e1e1f]">Expert analysis</h1>

        {requests.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm leading-5 text-[#737373]">Your evaluations</p>
              <Link
                href="/experts/new"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700"
              >
                Start evaluation
                <ArrowRight stroke="#fff" />
              </Link>
            </div>
            {active.length > 0 && (
              <section>
                <h2 className="text-lg font-medium leading-7 text-ink">In progress</h2>
                <ul className="mt-3 space-y-3">
                  {active.map((r) => (
                    <RequestRow key={expertRequestId(r)} request={r} />
                  ))}
                </ul>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-medium leading-7 text-ink">Past evaluations</h2>
                <ul className="mt-3 space-y-3">
                  {past.map((r) => (
                    <RequestRow key={expertRequestId(r)} request={r} />
                  ))}
                </ul>
              </section>
            )}
            <HeroBanner />
            <MeetExperts />
          </div>
        ) : (
          <>
            <HeroBanner />
            <CreditsCard creditBalance={creditBalance} />
            <ReportIncludes />
            <MeetExperts />
          </>
        )}
      </div>
      <ExpertsAside creditBalance={creditBalance} />
    </div>
  );
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#6f3235] px-4 py-3">
      <div className="pointer-events-none absolute left-[39%] top-0.5 h-[184px] w-[min(100%,496px)] opacity-20">
        <Image src={`${A}/hero-banner.webp`} alt="" fill className="object-cover object-left" sizes="496px" priority />
      </div>
      <div className="relative z-[1] flex max-w-[423px] flex-col gap-3">
        <span className="inline-flex h-5 w-fit items-center gap-1 rounded-full bg-[rgba(244,244,245,0.1)] px-2 text-xs font-light leading-4 text-white">
          <StarBadge />
          Certified numismatic experts
        </span>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-medium leading-7 text-white">Professional Coin Authentication</h2>
          <p className="text-sm leading-5 text-white/70">
            Certified and trusted experts with 20+ years of experience. Get a detailed report within 48 hours.
          </p>
        </div>
        <Link
          href="/experts/new"
          className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-[#0a0a0a] hover:bg-[#fafafa]"
        >
          Start evaluation
          <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

function CreditsCard({ creditBalance }: { creditBalance: number }) {
  const creditsLabel =
    creditBalance === 1 ? "You've 1 Credit left" : `You've ${creditBalance} Credits left`;

  return (
    <section className="rounded-xl bg-white p-4">
      <div className="flex items-stretch gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <p className="text-xs leading-4 text-primary-500">EXPERT EVALUATION</p>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-normal leading-8 text-[#2f2f31]">Certified Expert Reviews</h2>
            <p className="text-xs leading-4 text-[#2f2f31]">1 credit = 1 expert evaluation</p>
          </div>
          {/* Figma Credit Badge (1988:62786): coin 28×28 over pill at left-14 / top-4 */}
          <div className="relative h-7 w-fit min-w-[187px] shrink-0">
            <div className="absolute left-[14px] top-1 flex h-5 items-center rounded-bl-lg rounded-br-[48px] rounded-tl-lg rounded-tr-[48px] bg-primary-500 pl-4 pr-2">
              <p className="whitespace-nowrap text-xs font-medium leading-4 text-white">{creditsLabel}</p>
            </div>
            <div className="pointer-events-none absolute left-0 top-0 size-7 overflow-hidden">
              <Image
                src={`${A}/credit-badge-coin.webp`}
                alt=""
                width={40}
                height={60}
                className="absolute left-[-20.5%] top-[-52.7%] h-[210%] w-[140%] max-w-none"
              />
            </div>
          </div>
        </div>
        <div className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-4">
          <Image src={`${A}/wallet.webp`} alt="" width={84} height={68} className="h-auto w-[84px] opacity-80" />
          <BuyCreditsButton
            className="inline-flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700"
            title="Buy credits"
            subtitle="Explore our packs to get the experts evaluation"
          />
        </div>
      </div>
    </section>
  );
}

function ReportIncludes() {
  return (
    <section className="rounded-xl bg-white p-4">
      <h2 className="text-lg font-medium leading-7 text-[#0a0a0a]">Evaluation Report Includes</h2>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {REPORT_FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex gap-3 rounded-xl border border-[#e5e5e5] bg-white px-[13px] py-[17px] shadow-[0_1px_1.5px_rgba(0,0,0,0.04)]"
          >
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${f.iconBg}`}>
              {/* Icons already fill white from Figma export */}
              <Image src={f.icon} alt="" width={24} height={24} unoptimized />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-5 text-[#1e1e1f]">{f.title}</p>
              <p className="pt-[3px] text-xs leading-4 text-[#606062]">{f.body}</p>
              <div className={`mt-2.5 h-1 w-full rounded-full bg-gradient-to-r ${f.bar}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MeetExperts() {
  return (
    <section className="rounded-xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium leading-7 text-[#0a0a0a]">Meet Our Experts</h2>
        <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium leading-4 text-[#1e1e1f]">
          View all
          <ChevronRight />
        </span>
      </div>
      <div className="mt-3 flex gap-3.5">
        {FIGMA_EXPERTS.map((e, i) => (
          <article
            key={`${e.name}-${i}`}
            className="min-w-0 flex-1 rounded-[14px] border border-[#e5e5e5] bg-white p-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="relative size-[52px] shrink-0">
                <div className="relative size-[52px] overflow-hidden rounded-[26px] border-2 border-primary-50">
                  <Image src={e.pic} alt="" width={52} height={52} className="size-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 size-3.5 rounded-[7px] border-2 border-white bg-[#22c55e]" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  <Image src={`${A}/icon-star.svg`} alt="" width={13} height={13} unoptimized />
                  <span className="text-xs font-semibold leading-4 text-[#1e1e1f]">{e.rating}</span>
                </div>
                <p className="text-xs font-light leading-4 text-[#606062]">({e.reviews} reviews)</p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <p className="truncate text-sm font-medium leading-5 text-[#1e1a1a]">{e.name}</p>
              <p className="text-xs leading-4 text-[#606062]">{e.specialty}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RequestRow({ request }: { request: ExpertRequest }) {
  const id = expertRequestId(request);
  const title = expertDisplayTitle(request);
  const done = (request.status || "").toLowerCase() === "completed";
  const href = done ? `/experts/request/${id}/report` : `/experts/request/${id}`;
  const thumb =
    request.payload?.media?.obverse?.[0] || request.payload?.media?.reverse?.[0] || null;

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-4 rounded-[12px] border border-[#e5e7eb] bg-white p-3 hover:border-primary-500/40"
      >
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f8]">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[10px] text-muted">Coin</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-[#737373]">
            {request.displayId || id.slice(-8)}
            {request.createdAt ? ` · ${formatDate(request.createdAt)}` : ""}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(request.status)}`}>
          {statusLabel(request.status)}
        </span>
      </Link>
    </li>
  );
}

function formatDate(iso: string) {
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(d);
}
