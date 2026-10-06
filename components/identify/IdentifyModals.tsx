"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IdentifyCameraGuide } from "@/components/identify/IdentifyCameraGuide";
import {
  IdentifyCameraPermissionHeader,
  IdentifyCameraPermissionUploadFallback,
  IdentifyCameraPermissionViewport,
} from "@/components/identify/IdentifyCameraPermissionUI";
import { IdentifyZoomSlider, zoomScaleFromSlider } from "@/components/identify/IdentifyZoomSlider";
import { useModalDialog } from "@/components/ui/useModalDialog";

const QR = "/assets/coin-details/qr-coinzy.png";
const FLIP_ILLUSTRATION = "/assets/identify/flip-coin-illustration.png";

/** Figma `1828:206843` — shown after the first side is uploaded. */
export function IdentifyFlipCoinModal({
  open,
  needSide,
  onClose,
}: {
  open: boolean;
  /** Which side the user still needs to photograph. */
  needSide: "obverse" | "reverse";
  onClose: () => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const tailsOrHeads = needSide === "reverse" ? "Tails" : "Heads";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(100%,382px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative p-4 pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-4 items-center justify-center"
        >
          <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
        </button>
        <div className="flex justify-center pt-2">
          <Image src={FLIP_ILLUSTRATION} alt="" width={220} height={132} className="h-auto max-w-full object-contain" />
        </div>
        <h2 id={titleId} className="mt-3 text-base font-medium leading-6 text-[#1e1e1f]">
          Flip the coin
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-[#606062]">
          Turn the coin over and take a clear photo of the other side ({tailsOrHeads})
        </p>
      </div>
      <div className="border-t border-[#e5e5e5] bg-[#f5f5f5] px-4 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center rounded-[10px] bg-[#7c3c3f] px-3 text-sm font-medium text-[#fafafa]"
          >
            Okay
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function IdentifyQrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useModalDialog(open, (next) => !next && onClose());
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-w-[946px] w-[calc(100%-2rem)] rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="relative p-6 text-center">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-sm text-muted">Close</button>
        <p className="text-lg font-medium text-ink">Scan to download Coinzy AI</p>
        <p className="mt-2 text-sm text-muted">Identify coins in real-time with your phone camera</p>
        <div className="mt-6 flex justify-center">
          <Image src={QR} alt="QR code" width={200} height={184} />
        </div>
      </div>
    </dialog>
  );
}

/** Figma `1828:206844` — camera denied with upload fallback. */
export function IdentifyCameraBlockedModal({
  open,
  onClose,
  side,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  side?: "obverse" | "reverse";
  onUpload?: (file: File) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const sideLabel = side === "obverse" ? "Obverse (front side)" : side === "reverse" ? "Reverse (back side)" : undefined;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[572px] max-w-[calc(100%-2rem)] overflow-hidden rounded-[14px] border-0 bg-white p-0 shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative border-b border-[#e5e5e5] px-4 pb-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-4 items-center justify-center"
        >
          <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
        </button>
        <IdentifyCameraPermissionHeader titleId={titleId} />
      </div>
      <div className="px-4 pb-4">
        <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#dfdfe0] bg-black">
          <IdentifyCameraPermissionViewport />
        </div>
        {onUpload && (
          <IdentifyCameraPermissionUploadFallback
            sideLabel={sideLabel}
            onFile={(file) => {
              onUpload(file);
              onClose();
            }}
          />
        )}
      </div>
    </dialog>
  );
}

export function IdentifyCameraModal({
  open,
  side,
  onClose,
  onCapture,
  onUploadFile,
}: {
  open: boolean;
  side: "obverse" | "reverse";
  onClose: () => void;
  onCapture: (file: File) => void;
  onUploadFile?: (file: File) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<"blocked" | "other" | null>(null);
  const [zoomSlider, setZoomSlider] = useState(50);
  const zoom = zoomScaleFromSlider(zoomSlider);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      stopStream();
      setError(null);
      setZoomSlider(50);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        const name = e instanceof DOMException ? e.name : "";
        const blocked = name === "NotAllowedError" || name === "PermissionDeniedError";
        setError(blocked ? "blocked" : "other");
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, stopStream]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || error) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const scale = zoom;
    const viewW = vw / scale;
    const viewH = vh / scale;
    const sx = (vw - viewW) / 2;
    const sy = (vh - viewH) / 2;

    const out = 1280;
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sideLen = Math.min(viewW, viewH);
    const cropX = sx + (viewW - sideLen) / 2;
    const cropY = sy + (viewH - sideLen) / 2;
    ctx.drawImage(video, cropX, cropY, sideLen, sideLen, 0, 0, out, out);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `${side}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  };

  const sideLabel = side === "obverse" ? "Obverse (front side)" : "Reverse (back side)";
  const blocked = error === "blocked";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[572px] max-w-[calc(100%-2rem)] overflow-hidden rounded-[14px] border-0 bg-white p-0 shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative border-b border-[#e5e5e5] px-4 pb-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-4 items-center justify-center"
        >
          <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
        </button>
        {blocked ? (
          <IdentifyCameraPermissionHeader titleId={titleId} />
        ) : (
          <>
            <h2 id={titleId} className="pr-8 text-base font-medium leading-6 text-ink">
              Capture a clear image of your coin
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Position the entire coin inside the guide. Make sure it&apos;s well lit and in focus.
              <span className="mt-1 block text-xs text-[#87878a]">{sideLabel}</span>
            </p>
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        <div
          className={`relative mx-auto flex w-full max-w-[540px] items-center justify-center overflow-hidden rounded-2xl border border-[#dfdfe0] bg-black ${
            blocked ? "h-[280px]" : "h-[420px]"
          }`}
        >
          {error === "blocked" ? (
            <IdentifyCameraPermissionViewport />
          ) : error === "other" ? (
            <p className="px-6 text-center text-sm text-white">Could not open camera. Try uploading instead.</p>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute size-full object-cover"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              />
              <IdentifyCameraGuide />
            </>
          )}
        </div>
        {blocked && onUploadFile && (
          <IdentifyCameraPermissionUploadFallback
            sideLabel={sideLabel}
            onFile={(file) => {
              onUploadFile(file);
              onClose();
            }}
          />
        )}
      </div>

      {!blocked && (
        <div
          className="flex flex-col gap-4 border-t border-[#e5e5e5] bg-[#f5f5f5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <IdentifyZoomSlider value={zoomSlider} onChange={setZoomSlider} />
          <div className="flex shrink-0 items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-[#1e1e1f]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={!!error}
              className="inline-flex h-8 items-center justify-center rounded-[10px] bg-[#7c3c3f] px-3 text-sm font-medium text-[#fafafa] disabled:opacity-50"
            >
              Capture
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function IdentifyOwnCoinDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (owned: boolean) => void;
}) {
  const ref = useModalDialog(open, (next) => !next && onClose());
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-w-md w-[calc(100%-2rem)] rounded-2xl border-0 bg-white p-6 shadow-xl backdrop:bg-black/40"
    >
      <h2 className="text-lg font-medium text-ink">Do you own this coin?</h2>
      <p className="mt-2 text-sm text-muted">We can add it to your collection with the photos you used for identification.</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={() => { onConfirm(false); onClose(); }} className="rounded-[10px] px-4 py-2 text-sm font-medium text-ink">
          No
        </button>
        <button
          type="button"
          onClick={() => { onConfirm(true); onClose(); }}
          className="rounded-[10px] bg-primary-500 px-4 py-2 text-sm font-medium text-white"
        >
          Yes, add to collection
        </button>
      </div>
    </dialog>
  );
}
