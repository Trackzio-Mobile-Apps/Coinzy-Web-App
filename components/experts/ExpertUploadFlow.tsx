"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, useTransition, type DragEvent } from "react";
import { ExpertDebugBar, type ExpertsDebugMedia } from "@/components/experts/ExpertDebugBar";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import { ExpertsBreadcrumb } from "@/components/experts/ExpertsBreadcrumb";
import { ExpertsBuyCreditsDialog } from "@/components/experts/ExpertsBuyCreditsDialog";
import { createExpertRequest, uploadExpertFiles } from "@/lib/experts/client";
import {
  hasRequiredHttpsSlots,
  isInsufficientCreditsError,
  MAX_SLOT_IMAGES,
  MAX_VIDEO_DURATION_MS,
  resolveCountryIso,
  sanitizeMediaForApi,
} from "@/lib/experts/mediaRules";
import type { ExpertRequestMedia, ExpertsDirectoryItem } from "@/lib/experts/types";

const A = "/assets/experts";
type Slot = "obverse" | "reverse" | "edge";
type LocalSlot = { file: File; preview: string };

/**
 * New-request upload — Figma `1312:114554`.
 * Android: slots obverse/reverse/edge (1–2 each) + optional video → uploads → create request.
 */
export function ExpertUploadFlow({
  creditBalance: initialCredits,
  experts,
}: {
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
}) {
  const router = useRouter();
  const [credits, setCredits] = useState(initialCredits);
  const [obverse, setObverse] = useState<LocalSlot[]>([]);
  const [reverse, setReverse] = useState<LocalSlot[]>([]);
  const [edge, setEdge] = useState<LocalSlot[]>([]);
  const [video, setVideo] = useState<LocalSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [buyOpen, setBuyOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const draftId = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `EV${y}${m}${day}${seq}`;
  }, []);

  const setSlot = (slot: Slot, next: LocalSlot[]) => {
    if (slot === "obverse") setObverse(next);
    else if (slot === "reverse") setReverse(next);
    else setEdge(next);
  };

  const getSlot = (slot: Slot) => (slot === "obverse" ? obverse : slot === "reverse" ? reverse : edge);

  const addFiles = (slot: Slot, files: FileList | File[] | null, atIndex: 0 | 1 = 0) => {
    if (!files) return;
    const list = Array.isArray(files) ? files : [...files];
    const picked = list.find((f) => f.type.startsWith("image/"));
    if (!picked) return;
    const current = [...getSlot(slot)];
    const next: LocalSlot = { file: picked, preview: URL.createObjectURL(picked) };
    if (atIndex === 0) {
      if (current[0]) URL.revokeObjectURL(current[0].preview);
      current[0] = next;
    } else if (current.length === 0) {
      // Optional used first — treat as the required primary so submit stays valid.
      current.push(next);
    } else if (current.length === 1) {
      current.push(next);
    } else {
      URL.revokeObjectURL(current[1].preview);
      current[1] = next;
    }
    setSlot(slot, current.slice(0, MAX_SLOT_IMAGES));
    setError("");
  };

  const removeAt = (slot: Slot, index: number) => {
    const current = getSlot(slot);
    const victim = current[index];
    if (victim) URL.revokeObjectURL(victim.preview);
    setSlot(
      slot,
      current.filter((_, i) => i !== index),
    );
  };

  const setVideoFile = (file: File | null) => {
    if (!file) {
      setVideo(null);
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    const preview = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const ms = (el.duration || 0) * 1000;
      el.removeAttribute("src");
      el.load();
      if (Number.isFinite(ms) && ms > MAX_VIDEO_DURATION_MS) {
        setError("Video must be 10 seconds or shorter.");
        URL.revokeObjectURL(preview);
        setVideo(null);
        return;
      }
      setError("");
      setVideo({ file, preview });
    };
    el.onerror = () => {
      setError("");
      setVideo({ file, preview });
    };
    el.src = preview;
  };

  const canSubmit = obverse.length >= 1 && reverse.length >= 1 && edge.length >= 1 && !pending;

  const revokeAll = (slots: LocalSlot[]) => {
    slots.forEach((s) => URL.revokeObjectURL(s.preview));
  };

  const toSlot = (file: File): LocalSlot => ({ file, preview: URL.createObjectURL(file) });

  const applyDebugMedia = (media: ExpertsDebugMedia) => {
    revokeAll(obverse);
    revokeAll(reverse);
    revokeAll(edge);
    if (video) URL.revokeObjectURL(video.preview);
    setObverse([toSlot(media.obverse)]);
    setReverse([toSlot(media.reverse)]);
    setEdge([toSlot(media.edge)]);
    if (media.video) {
      setVideo(toSlot(media.video));
    } else {
      setVideo(null);
    }
    setError("");
    setNotes(media.video ? "Debug: fake images + video" : "Debug sample loaded");
  };

  const submit = () => {
    if (!canSubmit) return;
    if (credits < 1) {
      setBuyOpen(true);
      return;
    }
    startTransition(async () => {
      setError("");
      try {
        const allFiles = [
          ...obverse.map((s) => s.file),
          ...reverse.map((s) => s.file),
          ...edge.map((s) => s.file),
          ...(video ? [video.file] : []),
        ];
        const uploaded = await uploadExpertFiles(allFiles);
        if (uploaded.error || !uploaded.data?.urls?.length) {
          setError(uploaded.message || "Upload failed. Please try again.");
          return;
        }
        const urls = uploaded.data.urls;
        let i = 0;
        const take = (n: number) => urls.slice(i, (i += n));
        const media: ExpertRequestMedia = sanitizeMediaForApi({
          obverse: take(obverse.length),
          reverse: take(reverse.length),
          edge: take(edge.length),
          video: video ? take(1)[0] ?? null : null,
        });
        if (!hasRequiredHttpsSlots(media)) {
          setError("Upload did not return enough photo URLs. Please try again.");
          return;
        }
        const created = await createExpertRequest({
          country: resolveCountryIso(),
          payload: { media, notes: notes.trim() || undefined },
        });
        if (created.error || !created.data?.request) {
          const msg = created.message || "Could not create evaluation.";
          if (isInsufficientCreditsError(msg)) {
            setBuyOpen(true);
            return;
          }
          setError(msg);
          return;
        }
        if (typeof created.data.creditBalance === "number") setCredits(created.data.creditBalance);
        const id = created.data.request._id || created.data.request.id;
        if (!id) {
          setError("Created without an id. Check Expert analysis history.");
          router.push("/experts");
          return;
        }
        router.replace(`/experts/request/${id}`);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  const submitBtn = (
    <button
      type="button"
      disabled={!canSubmit}
      onClick={submit}
      className="inline-flex h-9 items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Submitting…" : "Submit"}
    </button>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1122px] items-start gap-4 px-8 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <ExpertsBreadcrumb
          crumbs={[
            { label: "Expert analysis", href: "/experts" },
            { label: "New request" },
          ]}
        />

        <ExpertDebugBar onLoad={applyDebugMedia} />

        {/* Header card — Figma First section */}
        <section className="rounded-xl border-[0.5px] border-[#dfdfe0] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="flex flex-wrap items-baseline gap-1 text-lg leading-7">
                <span className="font-semibold text-[#1e1e1f]">New evaluation request:</span>
                <span className="font-normal text-[#606062]">Request ID #{draftId}</span>
              </h1>
              <p className="text-sm leading-5 text-[#5c5557]">
                Upload the front, back, and rim of one coin only. Multiple coins may cause the evaluation
                to be rejected.
              </p>
            </div>
            {submitBtn}
          </div>
        </section>

        <PhotoSideCard
          title="Obverse (front)"
          slots={obverse}
          onAdd={(files) => addFiles("obverse", files)}
          onRemove={(i) => removeAt("obverse", i)}
        />
        <PhotoSideCard
          title="Reverse (back)"
          slots={reverse}
          onAdd={(files) => addFiles("reverse", files)}
          onRemove={(i) => removeAt("reverse", i)}
        />
        <PhotoSideCard
          title="Rim (edge)"
          slots={edge}
          onAdd={(files) => addFiles("edge", files)}
          onRemove={(i) => removeAt("edge", i)}
        />

        {/* Video + notes — Figma Fifth section */}
        <section className="rounded-xl border-[0.5px] border-[#dfdfe0] bg-white p-4">
          <h2 className="text-lg font-medium leading-7 text-[#0a0a0a]">Coin video (optional)</h2>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-xs font-medium leading-4 text-[#1e1e1f]">Add video (optional)</p>
              <VideoDropzone video={video} onPick={setVideoFile} onClear={() => setVideo(null)} />
            </div>
            <label className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-xs font-medium leading-4 text-[#1e1e1f]">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="Share any details about this coin that might help the expert (condition concerns, provenance, questions, etc.)"
                className="min-h-[132px] w-full flex-1 resize-y rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-2 text-sm leading-5 text-[#1e1e1f] outline-primary-500 placeholder:text-[#a4a4a7]"
              />
            </label>
          </div>
        </section>

        {error ? (
          <p role="alert" className="text-sm text-[#b91c1c]">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end pb-6">{submitBtn}</div>
      </div>

      <ExpertsAside
        creditBalance={credits}
        experts={experts}
        onCreditsPurchased={setCredits}
      />

      <ExpertsBuyCreditsDialog
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        title="You need credits to submit"
        subtitle="Explore our packs to get the experts evaluation"
        onPurchased={setCredits}
      />
    </div>
  );
}

function PhotoSideCard({
  title,
  slots,
  onAdd,
  onRemove,
}: {
  title: string;
  slots: LocalSlot[];
  onAdd: (files: FileList | File[] | null, atIndex: 0 | 1) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="rounded-xl border-[0.5px] border-[#dfdfe0] bg-white p-4">
      <h2 className="text-lg font-medium leading-7 text-[#0a0a0a]">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium leading-4 text-[#1e1e1f]">Add image</p>
          {slots[0] ? (
            <PreviewTile preview={slots[0].preview} onRemove={() => onRemove(0)} label={`${title} 1`} />
          ) : (
            <ImageDropzone required onPick={(files) => onAdd(files, 0)} />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium leading-4 text-[#1e1e1f]">Add image (optional)</p>
          {slots[1] ? (
            <PreviewTile preview={slots[1].preview} onRemove={() => onRemove(1)} label={`${title} 2`} />
          ) : (
            <ImageDropzone onPick={(files) => onAdd(files, 1)} />
          )}
        </div>
      </div>
    </section>
  );
}

function PreviewTile({
  preview,
  onRemove,
  label,
}: {
  preview: string;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className="relative flex h-[132px] items-center justify-center overflow-hidden rounded-md border-[0.5px] border-dashed border-[#87878a] bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt={label} className="max-h-full max-w-full object-contain" />
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-xs shadow"
      >
        ×
      </button>
    </div>
  );
}

function SoftBtn({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg bg-[linear-gradient(90deg,rgba(23,23,23,0.1),rgba(23,23,23,0.1)),linear-gradient(#fff,#fff)] px-2.5 py-1 text-sm font-medium text-[#0a0a0a]"
    >
      {icon ? (
        <Image src={`${A}/icon-upload-btn.svg`} alt="" width={14} height={14} unoptimized className="size-3.5" />
      ) : null}
      {children}
    </button>
  );
}

function ImageDropzone({
  required,
  onPick,
}: {
  required?: boolean;
  onPick: (files: File[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const id = useId();

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onPick([...e.dataTransfer.files]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex h-[132px] flex-col items-center justify-center gap-3 rounded-md border-[0.5px] border-dashed px-3 py-2 ${
        dragging ? "border-primary-500 bg-primary-50" : "border-[#87878a] bg-white"
      }`}
    >
      <Image src={`${A}/icon-upload-image.svg`} alt="" width={24} height={24} unoptimized className="size-6 opacity-80" />
      <p className="text-center text-xs leading-4 text-[#606062]">
        Drag and drop here to upload
        {required ? (
          <>
            {" "}
            <span aria-hidden>•</span> <span className="text-[#ef4444]">(Required)</span>
          </>
        ) : null}
      </p>
      <div className="flex gap-3">
        <SoftBtn icon onClick={() => fileRef.current?.click()}>
          Upload file
        </SoftBtn>
        <SoftBtn icon onClick={() => camRef.current?.click()}>
          Use camera
        </SoftBtn>
      </div>
      <input
        id={`${id}-file`}
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files ? [...e.target.files] : []);
          e.target.value = "";
        }}
      />
      <input
        id={`${id}-cam`}
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files ? [...e.target.files] : []);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function VideoDropzone({
  video,
  onPick,
  onClear,
}: {
  video: LocalSlot | null;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  if (video) {
    return (
      <div className="relative flex h-[132px] items-center justify-center overflow-hidden rounded-md border-[0.5px] border-dashed border-[#87878a] bg-white">
        <video src={video.preview} className="max-h-full max-w-full object-contain" muted />
        <button
          type="button"
          aria-label="Remove video"
          onClick={onClear}
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-xs shadow"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onPick(f);
      }}
      className={`flex h-[132px] flex-col items-center justify-center gap-3 rounded-md border-[0.5px] border-dashed px-3 py-2 ${
        dragging ? "border-primary-500 bg-primary-50" : "border-[#87878a] bg-white"
      }`}
    >
      <Image src={`${A}/icon-upload-video.svg`} alt="" width={24} height={24} unoptimized className="size-6 opacity-80" />
      <p className="text-center text-xs leading-4 text-[#606062]">Drag and drop here to upload</p>
      <div className="flex gap-3">
        <SoftBtn icon onClick={() => fileRef.current?.click()}>
          Upload file
        </SoftBtn>
        <SoftBtn icon onClick={() => camRef.current?.click()}>
          Use camera
        </SoftBtn>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <input
        ref={camRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
