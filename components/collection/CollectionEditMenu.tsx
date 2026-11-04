"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useModalDialog } from "@/components/ui/useModalDialog";

export function CollectionEditMenu({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<"delete" | "rename" | null>(null);
  const [value, setValue] = useState(name);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const dialogRef = useModalDialog(dialog !== null, (next) => { if (!next && !pending) setDialog(null); });
  const close = () => { if (!pending) { setDialog(null); setNotice(""); } };
  const rename = () => startTransition(async () => {
    setNotice("");
    try {
      const response = await fetch(`/api/collections/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: value.trim() }) });
      const result = await response.json() as { error?: boolean; reason?: string };
      if (!response.ok || result.error) throw new Error(result.reason || "Could not rename collection.");
      setDialog(null); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not rename collection."); }
  });
  const remove = () => startTransition(async () => {
    setNotice("");
    try {
      const response = await fetch(`/api/collections/${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json() as { error?: boolean; reason?: string };
      if (!response.ok || result.error) throw new Error(result.reason || "Could not delete collection.");
      setDialog(null); router.push("/collection"); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not delete collection."); }
  });
  return <div className="relative shrink-0">
    <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink">Edit collection</button>
    {open && <div className="absolute right-0 top-10 z-10 w-[152px] rounded-lg border border-[#dfdfe0] bg-white py-1 shadow-xl">
      <button type="button" onClick={() => { setValue(name); setNotice(""); setDialog("rename"); setOpen(false); }} className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-ink hover:bg-[#f7f7f7]"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#606062" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L20 8l-4-4L4 16v4ZM14 6l4 4M12 20h8"/></svg>Rename collection</button>
      <button type="button" onClick={() => { setNotice(""); setDialog("delete"); setOpen(false); }} className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-[#e43c19] hover:bg-[#f7f7f7]"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"/></svg>Delete collection</button>
    </div>}
    <dialog ref={dialogRef} aria-labelledby="collection-edit-title" onClose={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }} className="m-auto w-[380px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55">
      <div className="flex h-[54px] items-center justify-between gap-3 px-4"><h2 id="collection-edit-title" className="text-base font-medium leading-[22px]">{dialog === "delete" ? `Delete ${name}?` : `Rename your ${name}?`}</h2><button type="button" onClick={close} disabled={pending} aria-label="Close" className="flex size-5 shrink-0 items-center justify-center text-xl leading-none text-[#606062]">×</button></div>
      <div className="px-4 pb-4">{dialog === "delete" ? <p className="text-base leading-6 text-[#87878a]">Are you sure you want to permanently delete this collection?</p> : <><label htmlFor="rename-collection" className="block text-sm leading-5 text-[#87878a]">Collection name</label><div className="relative mt-2"><input id="rename-collection" value={value} maxLength={80} onChange={(event) => setValue(event.target.value)} className="h-8 w-full rounded-[10px] border border-primary-500 bg-white px-2.5 pr-9 text-xs text-ink outline-primary-500"/><button type="button" aria-label="Clear collection name" onClick={() => setValue("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-xl leading-none text-[#606062]">×</button></div></>}{notice && <p role="status" className="mt-2 text-xs text-[#b91c1c]">{notice}</p>}</div>
      <div className="flex min-h-16 items-center justify-end gap-3 border-t border-[#e5e5e5] bg-[#fafafa] px-4 py-4"><button type="button" onClick={close} disabled={pending} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink">Cancel</button>{dialog === "delete" ? <button type="button" onClick={remove} disabled={pending} className="h-8 rounded-[10px] bg-[#fbe8e8] px-3 text-sm font-medium text-[#e51b23] disabled:opacity-50">{pending ? "Deleting…" : "Delete"}</button> : <button type="button" disabled={pending || !value.trim()} onClick={rename} className="h-8 rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50">{pending ? "Saving…" : "Done"}</button>}</div>
    </dialog>
  </div>;
}
