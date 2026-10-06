"use client";

export function IdentifyToast({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div
      role="alert"
      className="fixed right-6 top-[92px] z-50 flex w-[min(100%,415px)] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-lg"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]">
        !
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-xs leading-4 text-muted">{body}</p>
      </div>
      <button type="button" onClick={onClose} className="shrink-0 text-xs font-medium text-primary-500">
        Dismiss
      </button>
    </div>
  );
}
