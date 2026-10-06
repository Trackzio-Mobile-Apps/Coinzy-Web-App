import Image from "next/image";
import type { ListingDetails } from "@/lib/api/coinzy";

const ICONS = "/assets/listing";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-xs font-medium leading-4 text-ink">{label}</dt>
      <dd className="break-words text-sm leading-5 text-muted">{children}</dd>
    </div>
  );
}

/**
 * Figma "Details side panel / Marketplace - Buyer" (1285:114907): collapsible seller fields,
 * external links, and the "Contact seller" button (mail, else phone).
 */
export function SellerDetailsPanel({ seller, title }: { seller: ListingDetails["sellerDetails"]; title: string }) {
  const email = seller?.contactEmail?.trim() || null;
  const phone = seller?.phoneNumber?.trim() || null;
  const links = (seller?.externalLinks ?? []).filter((l) => /^https?:\/\//i.test(l));
  const contactHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Coinzy listing: ${title}`)}`
    : phone
      ? `tel:${phone.replace(/[^\d+]/g, "")}`
      : null;

  return (
    <div className="flex w-full flex-col gap-5 rounded-[12px] border border-[#efefef] bg-white px-[17px] py-[13px] lg:w-[266px]">
      <div className="flex flex-col gap-3">
        <details open className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between [&::-webkit-details-marker]:hidden">
            <h2 className="text-sm font-medium leading-5 text-ink">Seller Details</h2>
            <Image
              src={`${ICONS}/icon-chevron-up.svg`}
              alt=""
              width={16}
              height={16}
              className="rotate-180 transition-transform group-open:rotate-0"
            />
          </summary>
          <dl className="mt-3 flex flex-col gap-4">
            <Field label="Name">{seller?.name?.trim() || "--"}</Field>
            <Field label="Email">{email ?? "--"}</Field>
            <Field label="Mobile no.">{phone ?? "--"}</Field>
            <div className="flex flex-col gap-2">
              <dt className="text-xs font-medium leading-4 text-ink">Location</dt>
              <dd className="font-jakarta text-xs leading-[1.5] text-muted">{seller?.location?.trim() || "--"}</dd>
            </div>
          </dl>
        </details>

        <div className="border-t-[0.5px] border-border-neutral" />

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium leading-4 text-ink">External links</h3>
          {links.length ? (
            <ul className="flex flex-col gap-2">
              {links.map((href) => (
                <li key={href} className="flex items-start gap-2">
                  <span className="size-12 shrink-0 rounded bg-border-neutral" aria-hidden />
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="line-clamp-2 min-w-0 flex-1 break-all text-sm leading-5 text-[#007aff] underline"
                  >
                    {href}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-5 text-muted">--</p>
          )}
        </div>
      </div>

      {contactHref ? (
        <a
          href={contactHref}
          className="flex w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 py-2 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700"
        >
          Contact seller
        </a>
      ) : (
        <span
          aria-disabled
          className="flex w-full cursor-not-allowed items-center justify-center rounded-[10px] bg-primary-500 px-4 py-2 text-sm font-medium leading-5 text-[#fafafa] opacity-50"
        >
          Contact seller
        </span>
      )}
    </div>
  );
}
