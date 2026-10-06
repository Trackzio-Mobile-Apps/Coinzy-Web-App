"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IdentifyAnalysing } from "@/components/identify/IdentifyAnalysing";
import { IdentifyMatchList } from "@/components/identify/IdentifyMatchList";
import {
  IdentifyCameraBlockedModal,
  IdentifyCameraModal,
  IdentifyFlipCoinModal,
  IdentifyQrModal,
} from "@/components/identify/IdentifyModals";
import { IdentifySideRail } from "@/components/identify/IdentifySideRail";
import { IdentifyToast } from "@/components/identify/IdentifyToast";
import { IdentifyDebugBar } from "@/components/identify/IdentifyDebugBar";
import { IdentifyUploadCard } from "@/components/identify/IdentifyUploadCard";
import { identifyCoinsV2 } from "@/lib/identify/client";
import { loadIdentifyDebugSample } from "@/lib/identify/debugSamples";
import { identifyErrorMessage } from "@/lib/identify/messages";
import { notifyFreeScanUsageUpdated, recordFreeScanUsed } from "@/lib/identify/scanUsage";
import { saveIdentifySession } from "@/lib/identify/storage";
import type { IdentifyMatch } from "@/lib/identify/types";

type Step = "upload" | "analysing" | "matches";

type Slot = { file: File; preview: string };

export function IdentifyApp({
  autoLoadDebug = false,
  premium = false,
}: {
  autoLoadDebug?: boolean;
  premium?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [obverse, setObverse] = useState<Slot | null>(null);
  const [reverse, setReverse] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<IdentifyMatch[]>([]);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [cameraBlockedOpen, setCameraBlockedOpen] = useState(false);
  const [cameraSide, setCameraSide] = useState<"obverse" | "reverse" | null>(null);
  const [flipDismissed, setFlipDismissed] = useState(false);

  const setSlot = useCallback((side: "obverse" | "reverse", file: File) => {
    const preview = URL.createObjectURL(file);
    if (side === "obverse") {
      setObverse((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return { file, preview };
      });
    } else {
      setReverse((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return { file, preview };
      });
    }
  }, []);

  const loadBoth = useCallback((obv: File, rev: File) => {
    setObverse((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return { file: obv, preview: URL.createObjectURL(obv) };
    });
    setReverse((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return { file: rev, preview: URL.createObjectURL(rev) };
    });
    setStep("upload");
  }, []);

  useEffect(() => {
    if (!autoLoadDebug || obverse || reverse) return;
    let cancelled = false;
    loadIdentifyDebugSample()
      .then((files) => {
        if (!cancelled) loadBoth(files.obverse, files.reverse);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [autoLoadDebug, obverse, reverse, loadBoth]);

  const clearSlot = useCallback((side: "obverse" | "reverse") => {
    if (side === "obverse") {
      setObverse((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return null;
      });
    } else {
      setReverse((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return null;
      });
    }
  }, []);

  const previewUrlsRef = useRef({ obverse: "", reverse: "" });
  useEffect(() => {
    previewUrlsRef.current.obverse = obverse?.preview ?? "";
    previewUrlsRef.current.reverse = reverse?.preview ?? "";
  }, [obverse?.preview, reverse?.preview]);

  useEffect(() => {
    if ((obverse && reverse) || (!obverse && !reverse)) {
      setFlipDismissed(false);
    }
  }, [obverse, reverse]);

  const flipNeedSide: "obverse" | "reverse" | null =
    obverse && !reverse ? "reverse" : reverse && !obverse ? "obverse" : null;

  useEffect(() => {
    return () => {
      const { obverse: o, reverse: r } = previewUrlsRef.current;
      if (o) URL.revokeObjectURL(o);
      if (r) URL.revokeObjectURL(r);
    };
  }, []);

  const openCamera = (side: "obverse" | "reverse") => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraSide(side);
      setCameraBlockedOpen(true);
      return;
    }
    setCameraBlockedOpen(false);
    setCameraSide(side);
  };

  const submit = async () => {
    if (!obverse || !reverse) return;
    setBusy(true);
    setStep("analysing");
    setToast(null);
    try {
      const res = await identifyCoinsV2(obverse.file, reverse.file);
      if (res.error) {
        const msg = identifyErrorMessage(res.aiErrorCode, res.reason);
        setToast(msg);
        setStep("upload");
        return;
      }
      const list = res.data.matches ?? [];
      if (!list.length) {
        setToast(identifyErrorMessage("E006"));
        setStep("upload");
        return;
      }
      setMatches(list);
      const previews: [string, string] = [obverse.preview, reverse.preview];
      saveIdentifySession({
        imageUrls: res.data.imageUrls,
        matches: list,
        previewUrls: previews,
      });
      if (!premium) {
        recordFreeScanUsed();
        notifyFreeScanUsageUpdated();
      }
      setStep("matches");
    } catch {
      setToast(identifyErrorMessage("E003"));
      setStep("upload");
    } finally {
      setBusy(false);
    }
  };

  const pickMatch = (m: IdentifyMatch) => {
    router.push(`/identify/coin/${m.archetypeId}`);
  };

  const previewPair: [string, string] | null =
    obverse && reverse ? [obverse.preview, reverse.preview] : null;

  return (
    <>
      <IdentifyDebugBar onLoad={(files) => loadBoth(files.obverse, files.reverse)} />

      {step === "upload" && (
        <nav className="mb-4 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/home" className="hover:text-ink">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Identify coin</span>
        </nav>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {step === "upload" && (
            <IdentifyUploadCard
              obversePreview={obverse?.preview ?? null}
              reversePreview={reverse?.preview ?? null}
              onObverseFile={(f) => setSlot("obverse", f)}
              onReverseFile={(f) => setSlot("reverse", f)}
              onTakeObverse={() => openCamera("obverse")}
              onTakeReverse={() => openCamera("reverse")}
              onClearObverse={() => clearSlot("obverse")}
              onClearReverse={() => clearSlot("reverse")}
              onSubmit={submit}
              busy={busy}
            />
          )}
          {step === "analysing" && previewPair && (
            <IdentifyAnalysing frontPreview={previewPair[0]} backPreview={previewPair[1]} />
          )}
          {step === "matches" && previewPair && (
            <IdentifyMatchList
              matches={matches}
              onPick={pickMatch}
              onTryAgain={() => {
                setStep("upload");
                setMatches([]);
              }}
              onReportNoMatches={() =>
                setToast({
                  title: "Thanks for the feedback",
                  body: "We’ve noted that none of the matches fit. Try again with clearer photos or browse the catalogue.",
                })
              }
            />
          )}

          {step === "upload" && (
            <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-sm text-muted">
              <p className="font-medium text-ink">Tips for best results</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                <li>Use natural light and a plain background.</li>
                <li>Fill the frame with the coin; keep the camera parallel to the surface.</li>
                <li>Upload one obverse and one reverse of the same coin.</li>
              </ul>
            </section>
          )}
        </div>

        <IdentifySideRail premium={premium} onScanApp={() => setQrOpen(true)} />
      </div>

      {flipNeedSide ? (
        <IdentifyFlipCoinModal
          open={!flipDismissed}
          needSide={flipNeedSide}
          onClose={() => setFlipDismissed(true)}
        />
      ) : null}
      <IdentifyQrModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <IdentifyCameraBlockedModal
        open={cameraBlockedOpen && cameraSide !== null}
        side={cameraSide ?? undefined}
        onClose={() => {
          setCameraBlockedOpen(false);
          setCameraSide(null);
        }}
        onUpload={(file) => {
          if (cameraSide) setSlot(cameraSide, file);
        }}
      />
      <IdentifyCameraModal
        open={cameraSide !== null && !cameraBlockedOpen}
        side={cameraSide ?? "obverse"}
        onClose={() => setCameraSide(null)}
        onCapture={(file) => {
          if (cameraSide) setSlot(cameraSide, file);
        }}
        onUploadFile={(file) => {
          if (cameraSide) setSlot(cameraSide, file);
        }}
      />
      {toast && <IdentifyToast title={toast.title} body={toast.body} onClose={() => setToast(null)} />}
    </>
  );
}
