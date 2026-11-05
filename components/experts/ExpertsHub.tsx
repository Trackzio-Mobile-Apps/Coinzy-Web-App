"use client";

import Image from "next/image";
import Link from "next/link";
import { BuyCreditsButton } from "@/components/experts/BuyCreditsButton";
import { ExpertCard, FIGMA_EXPERTS, toExpertCard, type ExpertCardData } from "@/components/experts/ExpertCard";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import {
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

/** Hub — Figma Copy `1312:115253` pixel layout. */
export function ExpertsHub({
  requests,
  creditBalance,
  experts,
  preview = false,
}: {
  requests: ExpertRequest[];
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
  preview?: boolean;
}) {
  const evaluations = requests.length > 0 ? <EvaluationsPanel requests={requests} preview={preview} /> : null;
  return (
    <div className="mx-auto flex w-full max-w-[1184px] items-start gap-4 px-4 py-4 sm:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold leading-8 text-[#1e1e1f]">Expert analysis</h1>
        <HeroBanner />
        <CreditsCard creditBalance={creditBalance} />
        <div className="lg:hidden">{evaluations}</div>
        <ReportIncludes />
        <MeetExperts experts={experts} preview={preview} />
      </div>
      <div className="mt-12 hidden shrink-0 lg:block"><ExpertsAside creditBalance={creditBalance} creditTotal={preview && creditBalance > 0 ? 10 : undefined} requestSummary={evaluations} /></div>
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
        <div className="flex w-[160px] max-w-[45%] shrink-0 flex-col items-center justify-center gap-4">
          <Image src={`${A}/wallet.webp`} alt="" width={84} height={68} className="h-auto w-[84px] opacity-80" />
          {creditBalance > 0 ? <Link href="/experts/new" className="inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700">Request evaluation</Link> : <BuyCreditsButton
            className="inline-flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700"
            title="Buy credits"
            subtitle="Explore our packs to get the experts evaluation"
          />}
        </div>
      </div>
    </section>
  );
}

function ReportIncludes() {
  return (
    <section className="rounded-xl bg-white p-4">
      <h2 className="text-lg font-medium leading-7 text-[#0a0a0a]">Evaluation Report Includes</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

function MeetExperts({ experts, preview }: { experts: ExpertsDirectoryItem[]; preview: boolean }) {
  const cards: ExpertCardData[] = preview ? [...FIGMA_EXPERTS] : experts.slice(0, 3).map(toExpertCard);
  if (cards.length === 0) return null;
  return (
    <section className="rounded-xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium leading-7 text-[#0a0a0a]">Meet Our Experts</h2>
        <Link href={preview ? "/experts-directory-preview" : "/experts/directory"} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium leading-4 text-[#1e1e1f]">
          View all
          <ChevronRight />
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {cards.map((e, i) => (
          <ExpertCard key={`${e.name}-${i}`} expert={e} />
        ))}
      </div>
    </section>
  );
}

function EvaluationsPanel({ requests, preview }: { requests: ExpertRequest[]; preview: boolean }) {
  return <section className="rounded-2xl border border-[#dfdfe0] bg-white p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-medium text-ink">Your Evaluations</h2><Link href={preview ? "/evaluation-all-preview" : "/experts/evaluations"} className="flex items-center gap-1 text-xs font-medium text-ink">View all<ChevronRight /></Link></div><ul className="mt-4 divide-y divide-[#e5e5e5]">{requests.slice(0, 2).map((request) => <EvaluationItem key={expertRequestId(request)} request={request} preview={preview} />)}</ul></section>;
}

function EvaluationItem({ request, preview }: { request: ExpertRequest; preview: boolean }) {
  const id = expertRequestId(request);
  const media = request.payload?.media;
  const photos = [...(media?.obverse || []), ...(media?.reverse || []), ...(media?.edge || [])];
  const status = (request.status || "").toLowerCase();
  const href = preview ? status === "completed" ? "/evaluation-report-ready" : status === "deadline_missed" ? "/evaluation-deadline-exceeded" : "/evaluation-in-progress" : status === "completed" ? `/experts/request/${id}/report` : `/experts/request/${id}`;
  const tone = status === "completed" ? "border-[#16a34a] text-[#16a34a]" : status === "cancelled" || status === "deadline_missed" ? "border-[#e51b23] text-[#e51b23]" : "border-[#e47700] text-[#e47700]";
  return <li className="py-4 first:pt-0 last:pb-0"><Link href={href} className="block rounded-md focus-visible:outline-2 focus-visible:outline-primary-500"><p className="text-base font-medium text-[#39393b]">Request ID #{(request.displayId || id).replace(/^#/, "")}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-[#606062]"><span>{photos.length} photo{photos.length === 1 ? "" : "s"}{media?.video ? " • 1 video" : ""}</span>{request.createdAt && <span>◷ &nbsp;Received {formatDate(request.createdAt)}</span>}</div><div className="mt-4 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center">{photos.slice(0, 6).map((url, i) => <img key={`${url}-${i}`} src={url} alt="" className={`${i ? "-ml-6" : ""} size-[50px] shrink-0 rounded-full border-2 border-[#dfdfe0] bg-[#f5f5f5] object-cover`} />)}</div>{media?.video && <span className="relative size-[50px] shrink-0 rounded-full border-2 border-[#dfdfe0]"><video src={media.video} preload="metadata" muted playsInline className="size-full rounded-full object-cover"/><span className="absolute bottom-0 right-0 rounded-full border border-[#dfdfe0] bg-white px-1 text-[10px] text-[#606062]">▶</span></span>}</div><span className={`mt-4 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${tone}`}>{status === "completed" ? "✓  Report ready" : status === "cancelled" ? "⊘  Cancelled" : statusLabel(request.status)}</span></Link></li>;
}

function formatDate(iso: string) {
  const date = Date.parse(iso);
  if (!Number.isFinite(date)) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}
