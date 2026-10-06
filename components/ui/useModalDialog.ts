"use client";

import { useEffect, useRef } from "react";

/**
 * Drives a native `<dialog>` from React state: `showModal()` (focus trap, inert page, focus returns to the
 * previously focused element on close), page-scroll lock, and Esc (native `cancel` already does it; the key
 * listener also covers synthetic keys). Pair with `onClose={() => setOpen(false)}` and a backdrop-click handler
 * on the dialog. Opening/closing never touches history.
 */
export function useModalDialog(open: boolean, setOpen: (open: boolean) => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return ref;
}
