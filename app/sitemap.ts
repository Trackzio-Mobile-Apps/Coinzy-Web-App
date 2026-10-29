import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blogs";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { absoluteUrl, PUBLIC_PATHS } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "daily",
    priority: path === "/" ? 1 : 0.8,
  }));
  const marketplace: MetadataRoute.Sitemap = Object.keys(MARKETPLACE_CATEGORIES)
    .filter((slug) => slug !== "all")
    .map((slug) => ({ url: absoluteUrl(`/marketplace/${slug}`), changeFrequency: "daily", priority: 0.6 }));
  const blogs: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: absoluteUrl(`/blogs/${p.slug}`),
    lastModified: p.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...pages, ...marketplace, ...blogs];
}
