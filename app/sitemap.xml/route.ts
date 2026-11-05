import { sitemapFileResponse, sitemapIndexResponse } from "@/lib/seo/sitemaps";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const file = new URL(request.url).searchParams.get("file");
  return file === null ? sitemapIndexResponse() : sitemapFileResponse(file);
}
