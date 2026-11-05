import type { MetadataRoute } from "next";
import { fetchArchetypesCached, fetchPublicListingPage, isArchetypeId } from "@/lib/api/coinzy";
import { getPublishedPosts } from "@/lib/blogs";
import { CATALOGUE_CATEGORIES } from "@/lib/catalogue/categories";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { absoluteUrl, PUBLIC_PATHS } from "@/lib/site";

/** One API page per sitemap keeps response size and backend work bounded. */
export const SITEMAP_PAGE_SIZE = 1000;
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);

function xmlResponse(body: string, cacheSeconds: number): Response {
  return new Response(body, { headers: {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": cacheSeconds ? `public, max-age=0, s-maxage=${cacheSeconds}` : "no-store",
  } });
}

function unavailable(error: unknown): Response {
  console.error("Sitemap data unavailable:", error instanceof Error ? error.message : "Unknown error");
  return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "300" } });
}

function pageCount(totalCount: number): number {
  if (!Number.isSafeInteger(totalCount) || totalCount < 0) throw new Error("Invalid sitemap pagination count");
  return Math.ceil(totalCount / SITEMAP_PAGE_SIZE);
}

export async function sitemapIndexResponse(): Promise<Response> {
  try {
    const [catalogue, marketplace] = await Promise.all([
      fetchArchetypesCached({ pageNo: 0, pageSize: 1 }),
      fetchPublicListingPage(0, 1),
    ]);
    const files = ["pages.xml", "blogs.xml"];
    for (const [kind, count] of [["catalogue", catalogue.totalCount], ["marketplace", marketplace.totalCount]] as const) {
      for (let page = 0; page < pageCount(count); page++) files.push(`${kind}-${page}.xml`);
    }
    // Root-level query URLs give every child sitemap scope over the whole site.
    const entries = files.map((file) => `<sitemap><loc>${escapeXml(absoluteUrl(`/sitemap.xml?file=${file}`))}</loc></sitemap>`).join("\n");
    return xmlResponse(`${XML_HEADER}\n<sitemapindex xmlns="${NAMESPACE}">\n${entries}\n</sitemapindex>\n`, 300);
  } catch (error) {
    return unavailable(error);
  }
}

function urlset(entries: MetadataRoute.Sitemap): string {
  const unique = [...new Map(entries.map((entry) => [entry.url, entry])).values()];
  const urls = unique.map((entry) => {
    const modified = entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified;
    const images = entry.images?.map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join("") ?? "";
    return `<url><loc>${escapeXml(entry.url)}</loc>${modified ? `<lastmod>${escapeXml(modified)}</lastmod>` : ""}${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ""}${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ""}${images}</url>`;
  }).join("\n");
  return `${XML_HEADER}\n<urlset xmlns="${NAMESPACE}" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}

export async function sitemapFileResponse(file: string): Promise<Response> {
  try {
    if (file === "pages.xml") {
      const entries: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({ url: absoluteUrl(path), changeFrequency: "weekly", priority: path === "/" ? 1 : 0.8 }));
      for (const slug of Object.keys(CATALOGUE_CATEGORIES)) entries.push({ url: absoluteUrl(`/catalogue/${slug}`), changeFrequency: "daily", priority: 0.6 });
      for (const slug of Object.keys(MARKETPLACE_CATEGORIES)) entries.push({ url: absoluteUrl(`/marketplace/${slug}`), changeFrequency: "daily", priority: 0.6 });
      return xmlResponse(urlset(entries), 3600);
    }
    if (file === "blogs.xml") {
      return xmlResponse(urlset(getPublishedPosts().map((post) => ({
        url: absoluteUrl(`/blogs/${post.slug}`), lastModified: post.modifiedDate ?? post.date,
        changeFrequency: "monthly", priority: 0.7, images: [absoluteUrl(post.heroImage ?? post.image)],
      }))), 0);
    }
    const match = /^(catalogue|marketplace)-(0|[1-9]\d*)\.xml$/.exec(file);
    if (!match || !Number.isSafeInteger(Number(match[2]))) return new Response("Not found", { status: 404 });
    const pageNo = Number(match[2]);
    const catalogue = match[1] === "catalogue";
    const metadata = catalogue
      ? await fetchArchetypesCached({ pageNo: 0, pageSize: 1 })
      : await fetchPublicListingPage(0, 1);
    if (pageNo >= pageCount(metadata.totalCount)) return new Response("Not found", { status: 404 });
    const page = catalogue
      ? await fetchArchetypesCached({ pageNo, pageSize: SITEMAP_PAGE_SIZE })
      : await fetchPublicListingPage(pageNo, SITEMAP_PAGE_SIZE);
    if (pageNo >= pageCount(page.totalCount)) return new Response("Not found", { status: 404 });
    const expectedCount = Math.min(SITEMAP_PAGE_SIZE, page.totalCount - pageNo * SITEMAP_PAGE_SIZE);
    if (page.pageNo !== pageNo || page.pageSize !== SITEMAP_PAGE_SIZE || page.items.length !== expectedCount) throw new Error("Incomplete sitemap API page");
    const entries: MetadataRoute.Sitemap = page.items.flatMap((item) => {
      const id = "id" in item ? item.id : item.archetypeId;
      return isArchetypeId(id) ? [{ url: absoluteUrl(`${catalogue ? "/catalogue/coin" : "/marketplace/listing"}/${id}`), changeFrequency: catalogue ? "monthly" : "daily", priority: 0.5 }] : [];
    });
    return xmlResponse(urlset(entries), catalogue ? 3600 : 300);
  } catch (error) {
    return unavailable(error);
  }
}
