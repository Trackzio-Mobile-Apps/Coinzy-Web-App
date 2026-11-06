import { unstable_cache } from "next/cache";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { getCatalogueGuestToken } from "@/lib/api/coinzy";
import { fetchExpertsDirectory } from "@/lib/api/experts-session";
import { expertDirectoryName, type ExpertsDirectoryItem } from "@/lib/experts/types";

const loadAppraisers = unstable_cache(async () => {
  let result = await fetchExpertsDirectory(await getCatalogueGuestToken(), { available: true });
  if (result.status === 401) {
    result = await fetchExpertsDirectory(await getCatalogueGuestToken(true), { available: true });
  }
  if (!result.ok || result.body?.error || !Array.isArray(result.body?.data?.experts)) {
    throw new Error("Experts directory unavailable");
  }
  return result.body.data.experts.slice(0, 4);
}, ["landing-appraisers"], { revalidate: 300 });

function photoUrl(expert: ExpertsDirectoryItem): string | null {
  try {
    const url = new URL(expert.profilePicture || "");
    const hosts = ["progresspal-assets.s3.us-west-2.amazonaws.com", "coins-api-prod.trackzio.com", "trackzio-coinzy-archetypes-images-v3.s3.amazonaws.com", "trackzio-archetype-images.s3.us-west-2.amazonaws.com", "trackzio-coins-identifier.s3.us-west-2.amazonaws.com", "firebasestorage.googleapis.com", "coinzy-dev.firebasestorage.app", "coinzy-26a4d.firebasestorage.app"];
    return url.protocol === "https:" && hosts.includes(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

export async function LandingAppraisers() {
  let experts: ExpertsDirectoryItem[];
  try {
    experts = await loadAppraisers();
  } catch {
    return <p className="text-sm text-muted">Appraisers are unavailable right now. Please try again later.</p>;
  }
  if (!experts.length) return <p className="text-sm text-muted">No appraisers are available right now.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {experts.map((expert, index) => {
        const name = expertDirectoryName(expert);
        const photo = photoUrl(expert);
        const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
        const fallback = <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">{initials}</span>;
        return (
          <div key={expert._id || expert.id || index} className="flex items-start gap-5 rounded-2xl border-[0.5px] border-[#e3cfac] bg-[#f7f4f1] p-[12.5px]">
            {photo ? <FallbackImage src={photo} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" fallback={fallback} /> : fallback}
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium leading-5 text-ink">{name}</p>
              {(expert.expertise?.trim() || expert.oneLineDescription?.trim()) && <p className="text-xs leading-4 text-muted-body">{expert.expertise?.trim() || expert.oneLineDescription?.trim()}</p>}
              {expert.yearsOfXp?.trim() && <p className="text-xs leading-4 text-muted">{expert.yearsOfXp.trim()}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
