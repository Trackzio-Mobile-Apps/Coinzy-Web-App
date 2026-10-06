"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { GradePrice, TableGroup } from "@/lib/catalogue/coinDetails";

const ICONS = "/assets/coin-details";

/**
 * Figma "Estimated Value" banner (1386:269938): tag badge + copy on the left,
 * grade dropdown and the selected grade's price range on the right.
 */
export function EstimatedValueBanner({
  grades,
  defaultCode,
}: {
  grades: GradePrice[];
  /** Grade to open on (a listing's own grade); otherwise Fine, as in Figma. */
  defaultCode?: string | null;
}) {
  const selectId = useId();
  // Figma defaults to "Fine grade"; fall back to the middle available grade.
  const [code, setCode] = useState(
    () =>
      (grades.find((g) => g.code === defaultCode) ?? grades.find((g) => g.code === "F") ?? grades[Math.floor(grades.length / 2)])
        ?.code,
  );
  const selected = grades.find((g) => g.code === code);

  return (
    <div className="flex w-full flex-col gap-3 rounded-[12px] bg-[linear-gradient(rgba(247,231,232,0.3),rgba(247,231,232,0.3)),linear-gradient(#fff,#fff)] px-4 py-4 sm:flex-row sm:items-center sm:px-9">
      <div className="flex flex-1 items-start gap-5 self-stretch">
        <div className="flex shrink-0 items-center rounded-full border border-[#edd2d3] p-2">
          <Image src={`${ICONS}/icon-tag.svg`} alt="" width={16} height={16} />
        </div>
        <div className="flex flex-col text-sm leading-5">
          <p className="font-medium text-ink">Estimated Value</p>
          <p className="text-muted">{grades.length ? "Based on recent market data" : "No recent market data yet"}</p>
        </div>
      </div>

      {selected && (
        <div className="flex flex-1 flex-col items-start gap-1 sm:items-end">
          <label htmlFor={selectId} className="sr-only">
            Coin grade
          </label>
          <div className="relative flex items-center">
            <select
              id={selectId}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-9 text-sm font-medium leading-5 text-ink outline-none [field-sizing:content] [text-align-last:right] focus-visible:underline"
            >
              {grades.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.name} grade
                </option>
              ))}
            </select>
            <Image
              src={`${ICONS}/icon-chevron-down.svg`}
              alt=""
              width={24}
              height={24}
              className="pointer-events-none absolute right-0"
            />
          </div>
          <p className="text-xl font-bold leading-7 text-primary-500 sm:pr-9" aria-live="polite">
            {selected.price}
          </p>
        </div>
      )}
    </div>
  );
}

/** Two-column table row (Figma "Table Row": 14px, 200px medium label, regular muted value, 0.5px divider). */
export function TableRow({ label, value, gapClassName }: { label: string; value: string; gapClassName: string }) {
  return (
    <div
      className={`flex items-center border-b-[0.5px] border-border-neutral py-3 text-sm leading-5 last:border-b-0 ${gapClassName}`}
    >
      <p className="w-[120px] shrink-0 font-medium text-ink sm:w-[200px]">{label}</p>
      <p className="min-w-0 flex-1 text-muted">{value}</p>
    </div>
  );
}

/** Figma "Coin Details" card (1257:112590): underline tabs, then headed tables. */
export function CoinDetailTabs({
  tabs,
  className = "",
}: {
  tabs: { label: string; groups: TableGroup[] }[];
  className?: string;
}) {
  const baseId = useId();
  const [active, setActive] = useState(0);

  return (
    <div className={`flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ${className}`}>
      <div className="pb-2">
        <div role="tablist" className="flex h-[43px] overflow-x-auto border-b border-[#efefef] pb-px">
          {tabs.map((tab, i) => {
            const on = i === active;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${baseId}-panel-${i}`}
                onClick={() => setActive(i)}
                className={`h-full shrink-0 whitespace-nowrap px-5 text-center text-sm leading-5 ${
                  on
                    ? "border-b-2 border-primary-500 pb-2.5 pt-2 font-medium text-primary-500"
                    : "py-2 text-ink hover:text-primary-500"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          className="flex flex-col gap-5"
        >
          {tab.groups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-2">
              <h3 className="text-lg font-medium leading-7 text-ink">{group.heading}</h3>
              <div className="flex flex-col">
                {group.rows.map((row) => (
                  <TableRow key={row.label} {...row} gapClassName="gap-6 lg:gap-[140px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
