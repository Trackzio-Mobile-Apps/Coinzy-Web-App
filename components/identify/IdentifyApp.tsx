"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IdentifyAnalysing } from "@/components/identify/IdentifyAnalysing";
import { IdentifyFailure } from "@/components/identify/IdentifyFailure";
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
import { IdentifyCropModal } from "@/components/identify/IdentifyCropModal";
import { identifyCoinsV2 } from "@/lib/identify/client";
import { loadIdentifyDebugSample } from "@/lib/identify/debugSamples";
import { identifyErrorMessage, isInlineIdentifyFailure } from "@/lib/identify/messages";
import { notifyFreeScanUsageUpdated, recordFailedScan, recordFreeScanUsed } from "@/lib/identify/scanUsage";
import { readIdentifySession, saveIdentifySession } from "@/lib/identify/storage";
import type { IdentifyMatch } from "@/lib/identify/types";

type Step = "upload" | "analysing" | "matches" | "failure";

type Slot = { file: File; preview: string };

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function IdentifyApp({
  autoLoadDebug = false,
  premium = false,
  restoreMatches = false,
}: {
  autoLoadDebug?: boolean;
  premium?: boolean;
  /** `?step=matches` — coming back from a result page: re-show the saved Top 5 matches. */
  restoreMatches?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(restoreMatches ? "matches" : "upload");
  const [restoredPreviews, setRestoredPreviews] = useState<[string, string] | null>(null);
  const [obverse, setObverse] = useState<Slot | null>(null);
  const [reverse, setReverse] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<IdentifyMatch[]>([]);
  const [failure, setFailure] = useState<{ title: string; body: string } | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [cameraBlockedOpen, setCameraBlockedOpen] = useState(false);
  const [cameraSide, setCameraSide] = useState<"obverse" | "reverse" | null>(null);
  const [flipDismissed, setFlipDismissed] = useState(false);
  const [crop, setCrop] = useState<{ side: "obverse" | "reverse"; file: File } | null>(null);
  const queueCrop = (side: "obverse" | "reverse", file: File) => {
    setCameraSide(null);
    setCameraBlockedOpen(false);
    setCrop({ side, file });
  };

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

  useEffect(() => {
    if ((obverse && reverse) || (!obverse && !reverse)) {
      setFlipDismissed(false);
    }
  }, [obverse, reverse]);

  const flipNeedSide: "obverse" | "reverse" | null =
    obverse && !reverse ? "reverse" : reverse && !obverse ? "obverse" : null;

  // Revoke only on unmount: per-change cleanup would also revoke the unchanged side's URL.
  const previewsRef = useRef<[string, string]>(["", ""]);
  previewsRef.current = [obverse?.preview ?? "", reverse?.preview ?? ""];
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((u) => u && URL.revokeObjectURL(u));
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

  const resetToUpload = (clearPhotos: boolean) => {
    setFailure(null);
    setMatches([]);
    setStep("upload");
    if (clearPhotos) {
      clearSlot("obverse");
      clearSlot("reverse");
    }
  };

  const countFreeScan = () => {
    if (premium) return;
    recordFreeScanUsed();
    notifyFreeScanUsageUpdated();
  };

  const countFailedScan = () => {
    if (premium) return;
    if (recordFailedScan()) countFreeScan();
  };

  const submit = async () => {
    if (!obverse || !reverse) return;
    setBusy(true);
    setStep("analysing");
    setToast(null);
    setFailure(null);
    try {
      const res = await identifyCoinsV2(obverse.file, reverse.file);
      if (res.error) {
        const msg = identifyErrorMessage(res.aiErrorCode, res.reason);
        // Full-page failure (Figma `2098:158944`) for not-a-coin / blurry / photo issues.
        // API often omits `aiErrorCode` and only sends reason like "Coin not detected!".
        if (isInlineIdentifyFailure(res.aiErrorCode, res.reason)) {
          countFailedScan();
          setFailure(msg);
          setStep("failure");
        } else {
          setToast(msg);
          setStep("upload");
        }
        return;
      }
      const list = res.data.matches ?? [];
      if (!list.length) {
        countFailedScan();
        setFailure(identifyErrorMessage("E001"));
        setStep("failure");
        return;
      }
      setMatches(list);
      // Blob URLs are revoked when this page unmounts, so persist data URLs for the result pages.
      const previews = await Promise.all([fileToDataUrl(obverse.file), fileToDataUrl(reverse.file)]).catch(
        () => [obverse.preview, reverse.preview],
      );
      saveIdentifySession({
        imageUrls: res.data.imageUrls,
        matches: list,
        previewUrls: [previews[0], previews[1]],
      });
      countFreeScan();
      setStep("matches");
    } catch {
      setToast(identifyErrorMessage("E003"));
      setStep("upload");
    } finally {
      setBusy(false);
    }
  };

  // Layout effect: runs before paint on client navigation, so Back shows the list with no upload-form flash.
  useLayoutEffect(() => {
    if (!restoreMatches) return;
    const saved = readIdentifySession();
    if (saved?.matches?.length) {
      setMatches(saved.matches);
      setRestoredPreviews(saved.previewUrls ?? null);
    } else {
      setStep("upload");
    }
  }, [restoreMatches]);

  const pickMatch = (m: IdentifyMatch) => {
    // Mark this history entry as the matches view so browser Back (and the result page's back arrow) return here.
    window.history.replaceState(window.history.state, "", "/identify?step=matches");
    router.push(`/identify/coin/${m.archetypeId}`);
  };

  const previewPair: [string, string] | null =
    obverse && reverse ? [obverse.preview, reverse.preview] : restoredPreviews;

  return (
    <>
      <IdentifyDebugBar onLoad={(files) => loadBoth(files.obverse, files.reverse)} />

      {step === "upload" && (
        <h1 className="mb-4 text-2xl font-semibold leading-8 text-ink">Identify coin</h1>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {step === "upload" && (
            <IdentifyUploadCard
              obversePreview={obverse?.preview ?? null}
              reversePreview={reverse?.preview ?? null}
              onObverseFile={(f) => queueCrop("obverse", f)}
              onReverseFile={(f) => queueCrop("reverse", f)}
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
          {step === "matches" && matches.length > 0 && (
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
          {step === "failure" && previewPair && failure && (
            <IdentifyFailure
              frontPreview={previewPair[0]}
              backPreview={previewPair[1]}
              title={failure.title}
              body={failure.body}
              onTryAgain={() => resetToUpload(false)}
              onUploadNew={() => resetToUpload(true)}
            />
          )}


        </div>

        <IdentifySideRail premium={premium} onScanApp={() => setQrOpen(true)} />
      </div>

      {flipNeedSide && !crop ? (
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
          if (cameraSide) queueCrop(cameraSide, file);
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
          if (cameraSide) queueCrop(cameraSide, file);
        }}
      />
      {crop && <IdentifyCropModal
        file={crop.file}
        side={crop.side}
        onClose={() => setCrop(null)}
        onConfirm={(file) => {
          setSlot(crop.side, file);
          setCrop(null);
        }}
      />}
      {toast && <IdentifyToast title={toast.title} body={toast.body} onClose={() => setToast(null)} />}
    </>
  );
}
