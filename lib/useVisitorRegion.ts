"use client";

import { useEffect, useState } from "react";

export type VisitorRegion = "india" | "rest-of-world" | "unknown";

let regionRequest: Promise<VisitorRegion> | undefined;

function getVisitorRegion(): Promise<VisitorRegion> {
  if (process.env.NODE_ENV === "development") {
    const override = new URLSearchParams(window.location.search).get("region");
    if (override === "india" || override === "rest-of-world") return Promise.resolve(override);
  }
  if (!regionRequest) {
    regionRequest = fetch("/api/visitor-region", { cache: "no-store" })
      .then(async (response): Promise<VisitorRegion> => {
        if (!response.ok) return "unknown";
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null || !("region" in data)) return "unknown";
        return data.region === "india" || data.region === "rest-of-world" ? data.region : "unknown";
      })
      .catch((): VisitorRegion => "unknown")
      .then((region) => {
        if (region === "unknown") regionRequest = undefined;
        return region;
      });
  }
  return regionRequest;
}

/** IP-based location; null means the lookup is still pending. */
export function useVisitorRegion(): VisitorRegion | null {
  const [region, setRegion] = useState<VisitorRegion | null>(null);

  useEffect(() => {
    let active = true;
    void getVisitorRegion().then((value) => {
      if (active) setRegion(value);
    });
    return () => { active = false; };
  }, []);

  return region;
}
