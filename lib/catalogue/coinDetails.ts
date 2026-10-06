/**
 * View-model for the catalogue coin details page (`/catalogue/coin/[id]`, Figma 797:35810).
 * Turns the raw `getDetails` archetype into the labelled rows / grade prices the page renders.
 */
import type { ArchetypeDetails, ListingDetails } from "@/lib/api/coinzy";

/** Coin facts shared by catalogue archetypes and marketplace listings (`coinDetails`). */
export type CoinSpec = Partial<ArchetypeDetails> & { name: string };

export type Row = { label: string; value: string };
export type TableGroup = { heading: string; rows: Row[] };
export type GradePrice = { code: string; label: string; name: string; price: string };

const NA = "NA";

/** Grade codes in ascending condition order. `label` = sidebar text, `name` = dropdown text ("Fine grade"). */
const GRADES: { codes: string[]; label: string; name: string }[] = [
  { codes: ["PO", "P"], label: "Poor (PO)", name: "Poor" },
  { codes: ["FR"], label: "Fair (FR)", name: "Fair" },
  { codes: ["AG"], label: "Almost Good (AG)", name: "Almost Good" },
  { codes: ["G"], label: "Good (G)", name: "Good" },
  { codes: ["VG"], label: "Very Good (VG)", name: "Very Good" },
  { codes: ["F"], label: "Fine (F)", name: "Fine" },
  { codes: ["VF"], label: "Very fine (VF)", name: "Very fine" },
  { codes: ["XF", "EF"], label: "Extremely Fine (EF)", name: "Extremely Fine" },
  { codes: ["AU"], label: "About Uncirculated (AU)", name: "About Uncirculated" },
  { codes: ["UNC", "MS", "BU"], label: "Uncirculated (UNC)", name: "Uncirculated" },
  { codes: ["PR", "PF", "PROOF"], label: "Proof (PR)", name: "Proof" },
];

type Raw = string | number | null | undefined;

/**
 * Newer archetypes send some fields as numbers (year, weight, sizes); older ones as strings,
 * sometimes with HTML entities (e.g. "10&nbspSKK").
 */
function clean(v: Raw): string | null {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : null;
  if (typeof v !== "string") return null;
  const s = v.replace(/&nbsp;?/g, "\u00a0").trim();
  return s ? s : null;
}

const text = (v: Raw) => clean(v) ?? NA;
const unit = (v: Raw, u: string) => (clean(v) ? `${clean(v)} ${u}` : NA);
const yesNo = (v: boolean | null | undefined) => (v == null ? NA : v ? "Yes" : "No");

/** "ULTRA_RARE" → "Ultra rare". */
export function formatRarity(v: Raw): string {
  const s = clean(v);
  if (!s) return NA;
  const words = s.toLowerCase().split("_");
  return [words[0][0].toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
}

function usd(n: number): string {
  return `$${n.toLocaleString("en-US", Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "3.50-6.70" → "$3.50 – $6.70"; a number (newer archetypes) or equal bounds → one value (Figma "$14"). */
export function formatRange(raw: string | number | null | undefined): string | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? usd(raw) : null;
  if (typeof raw !== "string") return null;
  const nums = raw
    .split("-")
    .map((p) => Number.parseFloat(p.replace(/[^0-9.]/g, "")))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? usd(lo) : `${usd(lo)} – ${usd(hi)}`;
}

/** Lowest–highest value across every grade ("$3.50 – $290"), or null when no grade has a price. */
export function estimatedSpan(estimated: ArchetypeDetails["estimatedPrice"]): string | null {
  if (!estimated) return null;
  const nums = Object.values(estimated).flatMap((raw) =>
    typeof raw === "number"
      ? [raw]
      : String(raw ?? "")
          .split("-")
          .map((p) => Number.parseFloat(p.replace(/[^0-9.]/g, ""))),
  ).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? usd(lo) : `${usd(lo)} – ${usd(hi)}`;
}

/** Known grades in condition order, then any unrecognised codes the API returns. */
export function gradePrices(estimated: ArchetypeDetails["estimatedPrice"]): GradePrice[] {
  if (!estimated) return [];
  const entries = Object.entries(estimated).map(([code, raw]) => [code.toUpperCase(), raw] as const);
  const out: GradePrice[] = [];
  const used = new Set<string>();
  for (const g of GRADES) {
    const hit = entries.find(([code]) => g.codes.includes(code));
    const price = hit && formatRange(hit[1]);
    if (hit && price) {
      used.add(hit[0]);
      out.push({ code: hit[0], label: g.label, name: g.name, price });
    }
  }
  for (const [code, raw] of entries) {
    const price = formatRange(raw);
    if (!used.has(code) && price) out.push({ code, label: code, name: code, price });
  }
  return out;
}

/** Page title: name + minting year, as in Figma ("2 Annas 1933"). */
export function coinTitle(c: CoinSpec): string {
  const year = clean(c.yearOfMinting);
  return year && !c.name.includes(year) ? `${c.name} ${year}` : c.name;
}

export function overviewRows(c: CoinSpec): Row[] {
  return [
    { label: "Name or Denominations", value: clean(c.value) ?? c.name },
    { label: "Issuer", value: text(c.issuer) },
    { label: "Ruler", value: text(c.ruler) },
    { label: "Year of Minting", value: text(c.yearOfMinting) },
    { label: "Currency", value: text(c.currency) },
    { label: "Shape", value: text(c.shape) },
    { label: "Rarity", value: formatRarity(c.rarity) },
  ];
}

/** Tabs of the "Coin Details" card. Figma only draws "Design & Material"; the others reuse its table layout. */
export function detailTabs(c: CoinSpec): { label: string; groups: TableGroup[] }[] {
  const listings = c.marketplace?.buy?.listingCount;
  return [
    {
      label: "Design & Material",
      groups: [
        {
          heading: "Size",
          rows: [
            { label: "Weight", value: unit(c.weightGrams, "g") },
            { label: "Diameter", value: unit(c.diameterMm, "mm") },
            { label: "Thickness", value: unit(c.thicknessMm, "mm") },
          ],
        },
        {
          heading: "Composition",
          rows: [
            { label: "Material", value: text(c.material) },
            { label: "Shape", value: text(c.shape) },
            { label: "Edge Type", value: text(c.edgeType) },
            { label: "Technique", value: text(c.technique) },
            { label: "Front design", value: text(c.frontDesign) },
            { label: "Back design", value: text(c.backDesign) },
          ],
        },
      ],
    },
    {
      label: "History",
      groups: [
        {
          heading: "Minting",
          rows: [
            { label: "Year of Minting", value: text(c.yearOfMinting) },
            { label: clean(c.rulerType) ?? "Ruler", value: text(c.ruler) },
            { label: "Mint location", value: text(c.mintLocation?.replace(/^♦\s*/, "")) },
            { label: "Mint mark", value: text(c.mintMark) },
            { label: "Orientation", value: text(c.orientation) },
          ],
        },
        {
          heading: "Background",
          rows: [
            { label: "Inscriptions", value: text(c.inscriptions) },
            ...(clean(c.context) ? [{ label: "Context", value: clean(c.context)! }] : []),
            ...(clean(c.coinSummary) ? [{ label: "Summary", value: clean(c.coinSummary)! }] : []),
          ],
        },
      ],
    },
    {
      label: "Rarity",
      groups: [
        {
          heading: "Rarity",
          rows: [
            { label: "Rarity", value: formatRarity(c.rarity) },
            { label: "Coin type", value: text(c.coinType) },
            { label: "In circulation", value: yesNo(c.inCirculation) },
            { label: "Demonetized", value: yesNo(c.isDemonetized) },
            // Catalogue only: listings carry no marketplace summary.
            ...(listings == null ? [] : [{ label: "Marketplace listings", value: String(listings) }]),
          ],
        },
      ],
    },
  ];
}

/** One scrollable section of the "Coin of the day" drawer (Figma 1248:123835). */
export type DrawerSection = { id: "overview" | "design" | "rarity" | "history"; heading: string; groups: { heading?: string; rows: Row[] }[] };

/** Serializable sections for the "Coin of the day" drawer: Overview · Design & Material · Rarity · History. */
export function coinDrawerSections(c: CoinSpec): DrawerSection[] {
  const tabs = detailTabs(c);
  const groupsOf = (label: string, section: string) =>
    (tabs.find((t) => t.label === label)?.groups ?? []).map((g) => ({
      // The section heading already says it ("Rarity" › "Rarity"), so don't repeat it as a sub-heading.
      heading: g.heading === section ? undefined : g.heading,
      rows: g.rows,
    }));
  return [
    {
      id: "overview",
      heading: "Overview",
      groups: [{ rows: [...overviewRows(c), { label: "Estimated price ($)", value: estimatedSpan(c.estimatedPrice ?? null) ?? NA }] }],
    },
    { id: "design", heading: "Design & Material", groups: groupsOf("Design & Material", "Design & Material") },
    { id: "rarity", heading: "Rarity", groups: groupsOf("Rarity", "Rarity") },
    { id: "history", heading: "History", groups: groupsOf("History", "History") },
  ];
}

// ---- Marketplace listing (`/marketplace/listing/[id]`, Figma 843:15466) ----

/** Asking price, e.g. 500 → "$500" (API sends whole USD; strings are tolerated). */
export function formatPrice(raw: ListingDetails["price"]): string | null {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? usd(n) : null;
}

/**
 * Which `grades` entry matches the seller's free-form `gradeValue` ("VF:Very Fine", "PR-60 to PR-70:Proof",
 * "XF-40…"), so the estimated-value dropdown opens on the listing's grade. Null for unparseable values
 * ("perfect", "1–100:Use slider…") or grades without a price.
 */
export function listingGradeCode(gradeValue: string | null | undefined, grades: GradePrice[]): string | null {
  const code = clean(gradeValue)?.split(":")[0].trim().toUpperCase().match(/^[A-Z]+/)?.[0];
  const group = code && GRADES.find((g) => g.codes.includes(code));
  return (group && grades.find((g) => group.codes.includes(g.code))?.code) ?? null;
}

/** "Coin grading details" table. Figma's 5 rows, plus Grade / Certification no. when the seller gave them. */
export function gradingRows(l: ListingDetails): Row[] {
  const grade = clean(l.gradeValue);
  const cert = clean(l.certificationNumber);
  return [
    { label: "Grading Scale (select one)", value: text(l.gradingScale) },
    ...(grade ? [{ label: "Grade", value: grade.replace(/:\s*/, " · ") }] : []),
    { label: "Grading authority", value: text(l.gradingAuthority) },
    ...(cert ? [{ label: "Certification no.", value: cert }] : []),
    { label: "Strike type", value: text(l.strikerType) },
    { label: "Cleaning/Alteration", value: l.cleaningAlterations?.filter(Boolean).join(", ") || NA },
    { label: "Coin condition notes", value: text(l.coinCondition) },
  ];
}
