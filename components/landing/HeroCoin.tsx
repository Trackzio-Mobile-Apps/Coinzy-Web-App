"use client";

import Image from "next/image";
import { useVisitorRegion } from "@/lib/useVisitorRegion";

export function HeroCoin() {
  const isWorld = useVisitorRegion() === "rest-of-world";
  return (
    <Image
      src={isWorld ? "/assets/landing-page/02-hero/hero-coin-world.webp" : "/assets/landing-page/02-hero/hero-coin.png"}
      alt={isWorld ? "Gold coin with an eagle emblem" : "Gold coin with a crab emblem"}
      width={200}
      height={200}
      priority
      className="absolute left-[max(calc(50%+231px),calc(65.316%+10.45px))] top-[min(384px,calc(406.5px-1.5456vw))] size-[max(200px,13.736vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
    />
  );
}
