"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ArchetypeDetails } from "@/lib/api/coinzy";
import {
  IdentifyAddToCollectionDrawer,
  IdentifySelectCollectionModal,
} from "@/components/identify/IdentifyCollectionUI";
import { IdentifySuccessToast } from "@/components/identify/IdentifySuccessToast";
import { buildAddCoinPayload } from "@/lib/identify/addCoinPayload";
import {
  applyCollectionToAddBody,
  buildCollectionOptions,
  IDENTIFIED_COLLECTION_ID,
  OWNED_COLLECTION_ID,
  privateCollectionOption,
  type UserCollectionOption,
} from "@/lib/identify/collections";
import { addCoinViaApi, createCollectionViaApi, fetchCollectionsViaApi } from "@/lib/identify/collectionClient";
import { readIdentifySession } from "@/lib/identify/storage";

/** Figma `1254:103144` faces — Stroke default, Solid primary when selected (`1252:102854`). */
const RATE_MESSAGE_MAX_WORDS = 100;

/** Keeps at most `max` words, preserving the user's spacing (and a trailing space while typing). */
function limitWords(text: string, max: number): string {
  const re = /\S+/g;
  let count = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (++count === max) return text.slice(0, m.index + m[0].length) + (/\s$/.test(text) && re.lastIndex < text.length ? " " : "");
  }
  return text;
}

const RATE_FACES = [
  {
    src: "/assets/identify/rate/sad-02.png",
    selectedSrc: "/assets/identify/rate/sad-02-selected.png",
    label: "Very dissatisfied",
  },
  {
    src: "/assets/identify/rate/sad-01.png",
    selectedSrc: "/assets/identify/rate/sad-01-selected.png",
    label: "Dissatisfied",
  },
  {
    src: "/assets/identify/rate/flushed.png",
    selectedSrc: "/assets/identify/rate/flushed-selected.png",
    label: "Neutral",
  },
  {
    src: "/assets/identify/rate/happy.png",
    selectedSrc: "/assets/identify/rate/happy-selected.png",
    label: "Satisfied",
  },
  {
    src: "/assets/identify/rate/star-face.png",
    selectedSrc: "/assets/identify/rate/star-face-selected.png",
    label: "Very satisfied",
  },
] as const;

function userUploadUrls(): [string, string] | null {
  const session = readIdentifySession();
  if (!session) return null;
  const remote = session.imageUrls?.filter(Boolean);
  if (remote && remote.length >= 2) return [remote[0], remote[1]];
  if (session.previewUrls) return session.previewUrls;
  return null;
}

/** Figma right rail: user uploads, add to collection (`1828:206836`). Rate card `1254:103144` is dummy (toast + dismiss). */
export function IdentifyResultRail({
  archetypeId,
  coin,
}: {
  archetypeId: string;
  coin: ArchetypeDetails;
}) {
  const [uploads, setUploads] = useState<[string, string] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  // Identified + Owned are local, so they render instantly; only private collections come from the API.
  const [collections, setCollections] = useState<UserCollectionOption[]>(() => buildCollectionOptions({ data: [] }));
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([IDENTIFIED_COLLECTION_ID]);
  const [userOwnsCoin, setUserOwnsCoin] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [rateCardVisible, setRateCardVisible] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUploads(userUploadUrls());
  }, []);

  // Prefetch on mount so private collections are usually ready before the popup opens.
  useEffect(() => {
    let cancelled = false;
    fetchCollectionsViaApi()
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          setError(res.reason ?? "Could not load collections.");
          setCollections(buildCollectionOptions({ data: [] }));
          return;
        }
        setCollections(buildCollectionOptions(res.data));
      })
      .finally(() => {
        if (!cancelled) setCollectionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectOpen) return;
    setSelectedIds(userOwnsCoin ? [OWNED_COLLECTION_ID] : [IDENTIFIED_COLLECTION_ID]);
  }, [selectOpen, userOwnsCoin]);

  const imagePair = useMemo((): [string, string] | null => {
    // Prefer remote identify uploads; never persist local blob:/data: previews to the API.
    if (uploads && uploads.every((u) => /^https?:\/\//i.test(u))) {
      return uploads;
    }
    const urls = coin.imageUrls;
    if (urls.length >= 2) return [urls[0], urls[1]];
    return null;
  }, [uploads, coin.imageUrls]);

  const openDrawer = () => {
    setError(null);
    setDrawerOpen(true);
  };

  const finishAdd = useCallback(async () => {
    if (!imagePair) {
      setError("Upload photos are missing — identify this coin again.");
      return;
    }
    // Android parity: add to each selected collection one by one (Owned first), then one success message.
    const picked = collections
      .filter((o) => selectedIds.includes(o.id))
      .sort((x, y) => Number(y.kind === "owned") - Number(x.kind === "owned"));
    if (!picked.length) {
      setError("Select a collection.");
      return;
    }
    const base = buildAddCoinPayload(coin, archetypeId, imagePair, {
      isOwned: userOwnsCoin,
    });

    setSaving(true);
    setError(null);
    for (const opt of picked) {
      const res = await addCoinViaApi(applyCollectionToAddBody(base, opt, userOwnsCoin));
      if (res.error) {
        setSaving(false);
        setError(res.reason ?? `Could not add coin to ${opt.label}.`);
        return;
      }
    }
    setSaving(false);
    setSelectOpen(false);
    setDrawerOpen(false);
    const named = picked.filter((o) => o.kind !== "identified");
    const only = named.length === 1 ? named[0] : picked.length === 1 ? picked[0] : null;
    setSuccess({
      title: "Your coin added to collection!",
      body: only
        ? `The coin has been successfully added to your ${only.label.replace(/ collection$/i, "")} collection`
        : "The coin has been successfully added to your collections",
    });
  }, [archetypeId, coin, selectedIds, collections, imagePair, userOwnsCoin]);

  const handleCreateCollection = useCallback(
    async (name: string) => {
      const res = await createCollectionViaApi(name);
      if (res.error) return res;
      const option = privateCollectionOption({ collectionId: res.collectionId, name: res.name });
      setCollections((prev) => [...prev, option]);
      setSelectedIds((prev) => [...prev, option.id]);
      return { error: false as const };
    },
    [],
  );

  const tile = "relative size-[120px] overflow-hidden rounded-lg border border-[#efefef] bg-[#f5f5f5]";

  return (
    <>
      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[268px]">
        <div className="rounded-xl border border-[#efefef] bg-white px-4 py-3">
          <p className="text-sm font-medium text-ink">User-clicked image</p>
          {imagePair ? (
            <div className="mt-3 flex flex-col gap-3">
              {imagePair.map((src, i) => (
                <div key={`${src}-${i}`} className={tile}>
                  <Image
                    src={src}
                    alt={i === 0 ? "Your obverse" : "Your reverse"}
                    fill
                    className="object-cover"
                    unoptimized={src.startsWith("blob:")}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">No upload previews in this session.</p>
          )}
          <button
            type="button"
            onClick={openDrawer}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white"
          >
            Add to collection
          </button>
        </div>

        {rateCardVisible && (
          <div className="flex flex-col items-end gap-4 rounded-xl bg-[#f2f2f3] p-3">
            <div className="flex w-full flex-col gap-1">
              <p className="text-lg font-medium leading-7 text-ink">Rate this match!</p>
              <p className="text-sm leading-5 text-[#5d5d5d]">Your feedback makes us better.</p>
            </div>
            <div className="flex w-full items-center justify-center gap-3">
              {RATE_FACES.map((face, i) => {
                const selected = rating === i + 1;
                return (
                  <button
                    key={face.src}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="group relative flex size-8 items-center justify-center rounded-full transition-transform duration-100 hover:scale-110 hover:bg-black/5 active:scale-95"
                    aria-label={face.label}
                    aria-pressed={selected}
                    title={face.label}
                  >
                    {/* Both states stay mounted so the tap swaps instantly (no image load on click). */}
                    <Image
                      src={face.src}
                      alt=""
                      width={24}
                      height={24}
                      aria-hidden
                      priority
                      className={`absolute size-6 ${selected ? "opacity-0" : "opacity-100"}`}
                    />
                    <Image
                      src={face.selectedSrc}
                      alt=""
                      width={24}
                      height={24}
                      aria-hidden
                      priority
                      className={`absolute size-6 ${selected ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="identify-rate-message" className="text-sm font-medium text-ink">
                Message
              </label>
              <textarea
                id="identify-rate-message"
                value={message}
                onChange={(e) => setMessage(limitWords(e.target.value, RATE_MESSAGE_MAX_WORDS))}
                placeholder="Type here"
                rows={2}
                className="h-16 w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-2 text-sm text-ink placeholder:text-[#737373]"
              />
              <p className="text-right text-xs text-[#87878a]">
                {message.trim() ? message.trim().split(/\s+/).length : 0}/{RATE_MESSAGE_MAX_WORDS} words
              </p>
            </div>
            <button
              type="button"
              disabled={rating == null}
              className="rounded-lg border border-[#e5e5e5] bg-white px-2 py-1 text-xs font-medium text-ink disabled:opacity-50"
              onClick={() => {
                setRateCardVisible(false);
                setFeedbackToast(true);
              }}
            >
              Submit
            </button>
          </div>
        )}

        {error && <p className="text-sm text-[#dc2626]" role="alert">{error}</p>}
      </aside>

      <IdentifyAddToCollectionDrawer
        open={drawerOpen}
        coin={coin}
        userImageUrls={imagePair}
        onClose={() => setDrawerOpen(false)}
        onConfirmAdd={({ isOwned }) => {
          setUserOwnsCoin(isOwned);
          setSelectOpen(true);
        }}
      />

      <IdentifySelectCollectionModal
        open={selectOpen}
        collections={collections}
        loading={collectionsLoading}
        userOwnsCoin={userOwnsCoin}
        selectedIds={selectedIds}
        onToggle={(id) =>
          setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
        }
        onClose={() => setSelectOpen(false)}
        onDone={() => {
          if (!saving && !collectionsLoading) finishAdd();
        }}
        onCreateCollection={handleCreateCollection}
        saving={saving}
      />

      {feedbackToast && (
        <IdentifySuccessToast
          title="Feedback sent"
          body="Thanks — your rating helps us improve matches."
          onClose={() => setFeedbackToast(false)}
        />
      )}
      {success && <IdentifySuccessToast title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </>
  );
}
