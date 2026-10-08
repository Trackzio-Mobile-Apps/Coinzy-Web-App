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
const label = "text-xs font-medium text-ink";
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
      <label htmlFor={id} className={label}>{title}</label>
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
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${input} appearance-none`}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/** Add for Sale drawer — Figma `1349:128590`, validation `1349:130692`. */
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
  const [values, setValues] = useState<SellFormState>(() => ({
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
  }));
  const [errors, setErrors] = useState<SellFormErrors>({});
  const priceId = useId();

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues((v) => ({ ...v, contactEmail: defaultEmail || v.contactEmail }));
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
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[min(100%,420px)] flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sell-drawer-title"
      >
        <header className="flex items-center gap-3 border-b border-[#dfdfe0] px-4 py-3">
          <button type="button" onClick={onClose} aria-label="Close panel" className="flex size-8 items-center justify-center">
            <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
          </button>
          <h2 id="sell-drawer-title" className="text-base font-medium text-ink">Add for Sale</h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <section>
            <h3 className="text-sm font-medium text-ink">Basic details</h3>
            <div className="mt-3 flex flex-col gap-4">
              <Field id={priceId} title="Price" error={errors.price}>
                <div className="flex h-8 items-center rounded-[10px] border border-[#e5e5e5] bg-white px-2.5">
                  <span className="text-sm text-[#606062]">$</span>
                  <input
                    id={priceId}
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter price"
                    value={values.price}
                    onChange={(e) => set("price", e.target.value)}
                    className="ml-1 w-full bg-transparent text-sm outline-none placeholder:font-light placeholder:text-[#c2c2c4]"
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
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Add external links"
                    value={values.linkDraft}
                    onChange={(e) => set("linkDraft", e.target.value)}
                    className={`${input} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white"
                    aria-label="Add link"
                  >
                    ✓
                  </button>
                </div>
                {values.externalLinks.length > 0 && (
                  <ul className="text-xs text-[#606062]">
                    {values.externalLinks.map((l) => (
                      <li key={l} className="truncate">{l}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-medium text-ink">Coin Grading details</h3>
            <div className="mt-3 flex flex-col gap-4">
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
          </section>
        </div>

        <footer className="border-t border-[#dfdfe0] px-4 py-4">
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add for Sale"}
          </button>
          <button type="button" onClick={onClose} className="mt-3 flex h-9 w-full items-center justify-center text-sm font-medium text-ink">
            Cancel
          </button>
        </footer>
      </aside>
    </>
  );
}
