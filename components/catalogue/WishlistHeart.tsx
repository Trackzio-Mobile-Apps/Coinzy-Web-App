"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setArchetypeWishlisted, WishlistAuthError } from "@/lib/catalogue/wishlistClient";
import { authHref } from "@/lib/auth/returnTo";

const ICONS = "/assets/catalogue";

export function WishlistHeart({
  archetypeId,
  initialWishlisted = false,
  returnTo,
  className = "absolute right-[7.5px] top-[7.5px] z-10 flex size-6 items-center justify-center",
}: {
  archetypeId: string;
  initialWishlisted?: boolean;
  /** Same-origin return path after sign-in (defaults to current URL on the client). */
  returnTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    const next = !wishlisted;
    setPending(true);
    try {
      await setArchetypeWishlisted(archetypeId, next);
      setWishlisted(next);
    } catch (error) {
      if (error instanceof WishlistAuthError) {
        const back =
          returnTo ??
          (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/catalogue");
        router.push(authHref("login", back));
        return;
      }
      // Revert optimistic UI on failure (no optimistic update before success).
    } finally {
      setPending(false);
    }
  }

  const label = wishlisted ? "Remove from wishlist" : "Add to wishlist";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={wishlisted}
      disabled={pending}
      onClick={toggle}
      className={`${className} rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500 disabled:opacity-60`}
    >
      <Image
        src={wishlisted ? `${ICONS}/icon-heart-filled.svg` : `${ICONS}/icon-heart.svg`}
        alt=""
        width={22}
        height={20}
        className="h-[19.5px] w-[21.5px]"
      />
    </button>
  );
}
