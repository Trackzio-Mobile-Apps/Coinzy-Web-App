"use client";

import { useState } from "react";
import { ContactDetailsDialog } from "./ContactDetailsDialog";

const buttonClass =
  "flex w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 py-2 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

/** "Contact seller" for signed-in viewers: opens the Contact details modal (Figma `1356:164759`). No history entry. */
export function ContactSellerButton({ phone, email, title }: { phone: string | null; email: string | null; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={buttonClass}>
        Contact seller
      </button>
      <ContactDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        phone={phone}
        email={email}
        subject={`Coinzy listing: ${title}`}
      />
    </>
  );
}
