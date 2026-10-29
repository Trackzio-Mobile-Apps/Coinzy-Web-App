"use client";

import Image from "next/image";
import { useEffect, useId, useState, type ReactNode } from "react";
import {
  buildSellPayload,
  validateSellForm,
  type SellFormErrors,
  type SellFormState,
} from "@/lib/marketplace/sellForm";

export type SellFilterOptions = {
  gradingScale?: string[];
  gradeValue?: string[];
  gradingAuthority?: string[];
  strikerType?: string[];
  cleaningAlterations?: string[];
};

const input =
  "h-8 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 text-sm text-ink outline-none placeholder:font-light placeholder:text-[#c2c2c4] focus:border-primary-500";
const sectionTitle = "text-sm font-medium leading-5 text-[#1e1e1f]";
const label = "text-xs font-medium leading-4 text-[#1e1e1f]";
const errorText = "text-xs text-[#dc2626]";

function Field({
  id,
  title,
  error,
  children,
}: {
  id: string;
  title: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {title}
      </label>
      {children}
      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${input} appearance-none pr-8 ${value ? "" : "font-light text-[#c2c2c4]"}`}
      >
        <option value="" className="font-normal text-ink">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="font-normal text-ink">
            {o}
          </option>
        ))}
      </select>
      <Image
        src="/assets/listing/icon-chevron-up.svg"
        alt=""
        width={16}
        height={16}
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 rotate-180 opacity-50"
      />
    </div>
  );
}

/** Collapsible section heading with the chevron from Figma (`chevron-up`, rotates when collapsed). */
function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start justify-between gap-3 text-left">
      <h3 className={sectionTitle}>{title}</h3>
      <Image
        src="/assets/listing/icon-chevron-up.svg"
        alt=""
        width={16}
        height={16}
        className={`size-4 shrink-0 transition-transform ${open ? "" : "rotate-180"}`}
      />
    </button>
  );
}

function emptyForm(defaultEmail: string): SellFormState {
  return {
    price: "",
    contactEmail: defaultEmail,
    externalLinks: [],
    linkDraft: "",
    gradingScale: "",
    gradeValue: "",
    gradingAuthority: "",
    certificationNumber: "",
    strikerType: "",
    cleaningAlterations: "",
    coinCondition: "",
  };
}

/**
 * Add for Sale drawer — Figma Copy `1363:176354` / collection `1349:128590`, validation `1349:130692`.
 * Reused from collection coin details and From Owned / List-a-coin handoffs (`?list=1`).
 */
export function CollectionSellDrawer({
  open,
  coinTitle,
  sellerName,
  defaultEmail,
  filterOptions,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  coinTitle: string;
  sellerName: string;
  defaultEmail: string;
  filterOptions: SellFilterOptions;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ReturnType<typeof buildSellPayload>) => void;
}) {
  const [values, setValues] = useState<SellFormState>(() => emptyForm(defaultEmail));
  const [errors, setErrors] = useState<SellFormErrors>({});
  const priceId = useId();
  const [basicOpen, setBasicOpen] = useState(true);
  const [gradingOpen, setGradingOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(emptyForm(defaultEmail));
  }, [open, defaultEmail]);

  if (!open) return null;

  const set = <K extends keyof SellFormState>(key: K, val: SellFormState[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addLink = () => {
    const url = values.linkDraft.trim();
    if (!url) return;
    setValues((v) => ({ ...v, externalLinks: [...v.externalLinks, url], linkDraft: "" }));
  };

  const submit = () => {
    const nextErrors = validateSellForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(buildSellPayload(values, { name: sellerName, email: defaultEmail }, coinTitle));
  };

  return (
    <>
      <button type="button" aria-label="Close" className="fixed inset-0 z-40 bg-black/55" onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[585px] flex-col rounded-l-xl border-l border-[#e5e5e5] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sell-drawer-title"
      >
        <header className="flex h-12 shrink-0 items-center gap-2.5 rounded-tl-xl bg-[#f2f2f3] px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex size-6 items-center justify-center rounded-lg bg-white hover:bg-neutral-50"
          >
            <Image src="/assets/auth/close.svg" alt="" width={12} height={12} />
          </button>
          <h2 id="sell-drawer-title" className="text-sm font-medium leading-5 text-[#1e1e1f]">
            Add for Sale
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 py-3 [scrollbar-color:#c2c2c4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c2c2c4] [&::-webkit-scrollbar]:w-1.5">
          <section className="flex flex-col gap-3">
            <SectionHeader title="Basic details" open={basicOpen} onToggle={() => setBasicOpen((v) => !v)} />
            {basicOpen && (
              <div className="flex flex-col gap-3">
                <Field id={priceId} title="Price" error={errors.price}>
                  <div className="flex gap-2">
                    <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-light text-[#1e1e1f]">
                      $
                    </span>
                    <input
                      id={priceId}
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter price"
                      value={values.price}
                      onChange={(e) => set("price", e.target.value)}
                      className={`${input} min-w-0 flex-1`}
                    />
                  </div>
                </Field>
                <Field id={`${priceId}-email`} title="Your contact email address" error={errors.contactEmail}>
                  <input
                    id={`${priceId}-email`}
                    type="email"
                    placeholder="Enter your contact address"
                    value={values.contactEmail}
                    onChange={(e) => set("contactEmail", e.target.value)}
                    className={input}
                  />
                </Field>
                <div className="flex flex-col gap-2">
                  <span className={label}>Add link for buyers</span>
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Image
                        src="/assets/marketplace/icon-link.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
                      />
                      <input
                        type="url"
                        placeholder="Add external links"
                        value={values.linkDraft}
                        onChange={(e) => set("linkDraft", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLink();
                          }
                        }}
                        className={`${input} pl-8 placeholder:text-[#a4a4a7]`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addLink}
                      disabled={!values.linkDraft.trim()}
                      className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#e8e8e8] opacity-50 transition enabled:opacity-100 enabled:hover:bg-[#dcdcdc]"
                      aria-label="Add link"
                    >
                      <Image src="/assets/marketplace/icon-check.svg" alt="" width={16} height={16} />
                    </button>
                  </div>
                  {values.externalLinks.length > 0 && (
                    <ul className="flex flex-col gap-1 text-xs text-[#606062]">
                      {values.externalLinks.map((l) => (
                        <li key={l} className="truncate">
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </section>

          <hr className="border-t-[0.5px] border-[#dfdfe0]" />

          <section className="flex flex-col gap-3">
            <SectionHeader title="Coin Grading details" open={gradingOpen} onToggle={() => setGradingOpen((v) => !v)} />
            {gradingOpen && (
              <div className="flex flex-col gap-3">
                <Field id={`${priceId}-scale`} title="Grading scale (Select one)" error={errors.gradingScale}>
                  <Select
                    id={`${priceId}-scale`}
                    value={values.gradingScale}
                    onChange={(v) => set("gradingScale", v)}
                    placeholder="Select grading scale used"
                    options={filterOptions.gradingScale ?? ["Sheldon Scale", "PCGS"]}
                  />
                </Field>
                <Field id={`${priceId}-grade`} title="Grading Condition">
                  <Select
                    id={`${priceId}-grade`}
                    value={values.gradeValue}
                    onChange={(v) => set("gradeValue", v)}
                    placeholder="Select grading condition"
                    options={filterOptions.gradeValue ?? []}
                  />
                </Field>
                <Field id={`${priceId}-auth`} title="Grading Authority" error={errors.gradingAuthority}>
                  <Select
                    id={`${priceId}-auth`}
                    value={values.gradingAuthority}
                    onChange={(v) => set("gradingAuthority", v)}
                    placeholder="Select name of the authority"
                    options={filterOptions.gradingAuthority ?? ["Self-graded", "PCGS", "NGC"]}
                  />
                </Field>
                <Field id={`${priceId}-cert`} title="Certification number">
                  <input
                    id={`${priceId}-cert`}
                    placeholder="Enter Certification number"
                    value={values.certificationNumber}
                    onChange={(e) => set("certificationNumber", e.target.value)}
                    className={input}
                  />
                </Field>
                <Field id={`${priceId}-strike`} title="Strike Type">
                  <Select
                    id={`${priceId}-strike`}
                    value={values.strikerType}
                    onChange={(v) => set("strikerType", v)}
                    placeholder="Select strike type"
                    options={filterOptions.strikerType ?? ["Business Strike", "Proof"]}
                  />
                </Field>
                <Field id={`${priceId}-clean`} title="Cleaning/Alteration">
                  <Select
                    id={`${priceId}-clean`}
                    value={values.cleaningAlterations}
                    onChange={(v) => set("cleaningAlterations", v)}
                    placeholder="Select alterations"
                    options={filterOptions.cleaningAlterations ?? ["None", "Heavily Cleaned"]}
                  />
                </Field>
                <Field id={`${priceId}-notes`} title="Coin Condition Notes">
                  <input
                    id={`${priceId}-notes`}
                    placeholder="Enter any additional notes"
                    value={values.coinCondition}
                    onChange={(e) => set("coinCondition", e.target.value)}
                    className={input}
                  />
                </Field>
              </div>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-[#dfdfe0] bg-white px-14 py-4">
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-[#fafafa] hover:bg-primary-600 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add for Sale"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-full items-center justify-center rounded-[10px] px-4 text-sm font-medium text-[#1e1e1f] hover:bg-neutral-50"
          >
            Cancel
          </button>
        </footer>
      </aside>
    </>
  );
}
