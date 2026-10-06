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
  collectionLabel,
  IDENTIFIED_COLLECTION_ID,
  OWNED_COLLECTION_ID,
  type UserCollectionOption,
} from "@/lib/identify/collections";
import { addCoinViaApi, fetchCollectionsViaApi } from "@/lib/identify/collectionClient";
import { readIdentifySession } from "@/lib/identify/storage";

const EMOJI_RATINGS = ["😞", "😐", "🙂", "😊", "😍"];

function userUploadUrls(): [string, string] | null {
  const session = readIdentifySession();
  if (!session) return null;
  const remote = session.imageUrls?.filter(Boolean);
  if (remote && remote.length >= 2) return [remote[0], remote[1]];
  if (session.previewUrls) return session.previewUrls;
  return null;
}

/** Figma right rail: user uploads, add to collection, rate match (`1828:206836`). */
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
  const [collections, setCollections] = useState<UserCollectionOption[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState(IDENTIFIED_COLLECTION_ID);
  const [userOwnsCoin, setUserOwnsCoin] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectionLocked = userOwnsCoin;

  useEffect(() => {
    setUploads(userUploadUrls());
  }, []);

  useEffect(() => {
    if (!selectOpen) return;
    let cancelled = false;
    setCollectionsLoading(true);
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
  }, [selectOpen]);

  useEffect(() => {
    if (!selectOpen) return;
    if (userOwnsCoin) setCollectionId(OWNED_COLLECTION_ID);
    else setCollectionId(IDENTIFIED_COLLECTION_ID);
  }, [selectOpen, userOwnsCoin]);

  const imagePair = useMemo((): [string, string] | null => {
    if (uploads) return uploads;
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
    const opt = collections.find((o) => o.id === collectionId);
    if (!opt) {
      setError("Select a collection.");
      return;
    }
    const base = buildAddCoinPayload(coin, archetypeId, imagePair, {
      isOwned: userOwnsCoin,
      rating: rating ?? undefined,
      comment: message.trim() || undefined,
    });
    const payload = applyCollectionToAddBody(base, opt, userOwnsCoin);

    setSaving(true);
    setError(null);
    const res = await addCoinViaApi(payload);
    setSaving(false);
    if (res.error) {
      setError(res.reason ?? "Could not add coin.");
      return;
    }
    setSelectOpen(false);
    setDrawerOpen(false);
    const label = collectionLabel(collections, collectionId);
    setSuccess({
      title: `Your coin added to ${label}!`,
      body: "The coin has been successfully added to collection",
    });
  }, [archetypeId, coin, collectionId, collections, imagePair, message, rating, userOwnsCoin]);

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

        <div className="rounded-xl border border-[#efefef] bg-white px-4 py-3">
          <p className="text-sm font-medium text-ink">Rate this match!</p>
          <p className="mt-1 text-xs text-muted">Your feedback makes us better.</p>
          <div className="mt-3 flex justify-between gap-1">
            {EMOJI_RATINGS.map((emoji, i) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setRating(i + 1)}
                className={`flex size-9 items-center justify-center rounded-lg text-lg ${
                  rating === i + 1 ? "bg-primary-50 ring-1 ring-primary-200" : "hover:bg-[#fafafa]"
                }`}
                aria-label={`Rate ${i + 1} of 5`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-xs font-medium text-[#606062]">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type here"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm text-ink placeholder:text-[#87878a]"
          />
          <div className="mt-2 flex justify-end">
            <button type="button" className="text-sm font-medium text-primary-500" onClick={() => setMessage(message)}>
              Submit
            </button>
          </div>
        </div>

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
        selectionLocked={selectionLocked}
        userOwnsCoin={userOwnsCoin}
        selectedId={collectionId}
        onSelect={setCollectionId}
        onClose={() => setSelectOpen(false)}
        onDone={() => {
          if (!saving && !collectionsLoading) finishAdd();
        }}
        saving={saving}
      />

      {success && <IdentifySuccessToast title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </>
  );
}
