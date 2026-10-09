"use client";

import Image from "next/image";
import { useEffect, useId, useState, type ReactNode } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import type { SellerDetails } from "@/lib/api/auth-session";
import {
  formStateFromSellerDetails,
  sellerDetailsFromForm,
  validateSellerProfileForm,
  type SellerProfileFormErrors,
  type SellerProfileFormState,
} from "@/lib/marketplace/sellerProfile";

const input =
  "h-8 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 text-sm text-ink outline-none placeholder:font-light placeholder:text-[#a4a4a7] focus:border-primary-500 disabled:bg-neutral-50 disabled:text-[#606062]";
const labelCls = "text-xs font-medium leading-4 text-ink";
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
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className={labelCls}>
        {title}
      </label>
      {children}
      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

export type PublicSellerProfile = {
  name: string;
  email: string;
  isGuest: boolean;
  sellerDetails: SellerDetails;
  sellerProfileComplete: boolean;
};

/**
 * Set Seller Profile modal — Figma Copy `1363:172631` (dialog `1363:171945`).
 * 572px card, avatar + title, name / personal email + “use for seller” / seller email /
 * optional phone + bio, Cancel / Save. Native `<dialog>` via `useModalDialog`.
 */
export function SetSellerProfileDialog({
  open,
  onClose,
  personalEmail,
  defaultName,
  initialDetails,
  submitting,
  error,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  personalEmail: string;
  defaultName?: string;
  initialDetails?: SellerDetails | null;
  submitting?: boolean;
  error?: string | null;
  onSave: (details: SellerDetails) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const [values, setValues] = useState<SellerProfileFormState>(() =>
    formStateFromSellerDetails(initialDetails, personalEmail, defaultName ?? ""),
  );
  const [errors, setErrors] = useState<SellerProfileFormErrors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(formStateFromSellerDetails(initialDetails, personalEmail, defaultName ?? ""));
  }, [open, initialDetails, personalEmail, defaultName]);

  const set = <K extends keyof SellerProfileFormState>(key: K, val: SellerProfileFormState[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, name: key === "name" ? undefined : e.name, sellerEmail: key === "sellerEmail" || key === "usePersonalEmail" ? undefined : e.sellerEmail, form: undefined }));
  };

  const submit = () => {
    const next = validateSellerProfileForm(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave(sellerDetailsFromForm(values));
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[572px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-4 p-4">
        <div className="flex items-start gap-3 pr-6">
          <div className="relative size-8 shrink-0">
            <Image
              src="/assets/marketplace/seller-profile-avatar.svg"
              alt=""
              width={32}
              height={32}
              className="rounded-[8px] border border-[#e5e5e5]"
            />
            <span className="absolute -right-0.5 bottom-0 flex size-2.5 items-center justify-center rounded-full bg-ink shadow-[0_0_0_2px_white]">
              <Image src="/assets/marketplace/seller-profile-plus.svg" alt="" width={6} height={6} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="h-[22px] text-base font-medium leading-6 text-ink">
              Set Seller Profile
            </h2>
            <p className="text-sm leading-5 text-[#737373]">Visible to buyers on the marketplace</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <Field id={`${titleId}-name`} title="Name" error={errors.name}>
          <input
            id={`${titleId}-name`}
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={input}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <Field id={`${titleId}-personal`} title="Personal Email">
            <input
              id={`${titleId}-personal`}
              type="email"
              readOnly
              value={values.personalEmail || "—"}
              className={input}
            />
          </Field>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={values.usePersonalEmail}
              disabled={!values.personalEmail.trim()}
              onChange={(e) => set("usePersonalEmail", e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border border-[#e5e5e5] accent-primary-500 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            />
            <span className="text-sm font-medium leading-5 text-[#606062]">Use this email for seller profile too</span>
          </label>
        </div>

        <Field id={`${titleId}-seller`} title="Seller Email" error={errors.sellerEmail}>
          <input
            id={`${titleId}-seller`}
            type="email"
            autoComplete="email"
            placeholder="Enter seller email"
            disabled={values.usePersonalEmail}
            value={values.usePersonalEmail ? values.personalEmail : values.sellerEmail}
            onChange={(e) => set("sellerEmail", e.target.value)}
            className={input}
          />
        </Field>

        <Field id={`${titleId}-phone`} title="Contact number (optional)">
          <input
            id={`${titleId}-phone`}
            type="tel"
            autoComplete="tel"
            placeholder="Enter contact number"
            value={values.phoneNumber}
            onChange={(e) => set("phoneNumber", e.target.value)}
            className={input}
          />
        </Field>

        <Field id={`${titleId}-bio`} title="Bio (optional)">
          <textarea
            id={`${titleId}-bio`}
            placeholder="Small Bio (optional)"
            value={values.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className="h-[76px] w-full resize-y rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-2 text-sm text-ink outline-none placeholder:font-light placeholder:text-[#a4a4a7] focus:border-primary-500"
          />
        </Field>

        {(error || errors.form) && <p className={errorText}>{error || errors.form}</p>}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)] p-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium leading-5 text-ink hover:bg-neutral-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-[10px] bg-primary-500 px-3 py-1.5 text-sm font-medium leading-5 text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </dialog>
  );
}
