import Image from "next/image";
import { expertDirectoryName, type ExpertsDirectoryItem } from "@/lib/experts/types";

const A = "/assets/experts";

/** Figma `1312:115253` Meet Our Experts — design assets (not API QA names). */
export const FIGMA_EXPERTS = [
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

export type ExpertCardData = { name: string; rating: string | null; reviews: string; specialty: string; pic: string | null };

export function toExpertCard(e: ExpertsDirectoryItem): ExpertCardData {
  const specialty =
    e.expertise?.split(",").map((x) => x.trim()).filter(Boolean).join(" ● ") ||
    e.oneLineDescription?.trim() ||
    e.yearsOfXp?.trim() ||
    "";
  const avg = e.stats?.averageRating;
  return {
    name: expertDirectoryName(e),
    rating: typeof avg === "number" ? avg.toFixed(1) : null,
    reviews: String(e.stats?.reviewCount ?? 0),
    specialty,
    pic: e.profilePicture?.trim() || null,
  };
}


export function ExpertCard({ expert }: { expert: ExpertCardData }) {
  return (
  <article
    className="min-w-0 flex-1 rounded-[14px] border border-[#e5e5e5] bg-white p-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="relative size-[52px] shrink-0">
        <div className="relative size-[52px] overflow-hidden rounded-[26px] border-2 border-primary-50">
          {expert.pic ? (
            <Image src={expert.pic} alt="" width={52} height={52} unoptimized className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center bg-primary-50 text-sm font-semibold text-primary-700">
              {expert.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
            </span>
          )}
        </div>
        <span className="absolute bottom-0 right-0 size-3.5 rounded-[7px] border-2 border-white bg-[#22c55e]" />
      </div>
      <div className="flex flex-col items-end gap-1">
        {expert.rating && (
          <div className="flex items-center gap-1.5">
            <Image src={`${A}/icon-star.svg`} alt="" width={13} height={13} unoptimized />
            <span className="text-xs font-semibold leading-4 text-[#1e1e1f]">{expert.rating}</span>
          </div>
        )}
        {Number(expert.reviews.replace(/,/g, "")) > 0 && <p className="text-xs font-light leading-4 text-[#606062]">({expert.reviews} reviews)</p>}
      </div>
    </div>
    <div className="mt-3 flex flex-col gap-1">
      <p className="truncate text-sm font-medium leading-5 text-[#1e1a1a]">{expert.name}</p>
      <p className="text-xs leading-4 text-[#606062]">{expert.specialty}</p>
    </div>
  </article>
  );
}
