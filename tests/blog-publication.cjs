const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObj = {};
const source = ts.transpileModule(fs.readFileSync('lib/blogs.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const contentExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/blog-content/posts.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: contentExports });
vm.runInNewContext(source, { exports: exportsObj, Intl, Date, require: (path) => { if (path === "@/lib/blog-thumbnails.json") return { default: JSON.parse(fs.readFileSync("lib/blog-thumbnails.json", "utf8")) }; assert.equal(path, "@/lib/blog-content/posts"); return contentExports; } });
const posts = exportsObj.BLOG_POSTS;
const thumbnails = JSON.parse(fs.readFileSync('lib/blog-thumbnails.json', 'utf8'));
assert.ok(Object.values(thumbnails).every((entry) => entry.source && !entry.artwork.startsWith('illustration-')), 'every thumbnail uses a real coin photograph');
for (const entry of Object.values(thumbnails)) {
  if (entry.source.startsWith('/assets/blogs/real-photos/')) assert.ok(entry.photoCredit?.sourceUrl && entry.photoCredit?.licenseUrl, 'sourced photographs retain credit and license links');
}
assert.equal(posts.length, 100, "the editorial set contains 100 articles");
assert.equal(new Set(posts.map((p) => p.slug)).size, 100, "article URLs are unique");
assert.equal(new Set(posts.map((p) => p.date)).size, 100, "only one article is assigned per day");
const dates = posts.map((p) => p.date).sort();
assert.equal(dates[0], "2026-09-16");
assert.equal(dates[99], "2026-12-24");
for (let i = 1; i < dates.length; i++) assert.equal(Date.parse(dates[i]) - Date.parse(dates[i - 1]), 86400000, "publication schedule has no gaps");
assert.equal(exportsObj.getPublishedPosts(new Date("2026-11-05T12:00:00Z")).length, 51);
assert.equal(exportsObj.getPublishedPosts(new Date("2026-12-24T00:00:00Z")).length, 100);
const slugs = new Set(posts.map((p) => p.slug));
assert.equal(new Set(posts.map((p) => p.image)).size, 100, "each article has its own thumbnail");
assert.equal(new Set(posts.map((p) => p.heroImage)).size, 100, "each article has its own header image");
const crypto = require("node:crypto");
assert.equal(new Set(posts.map((p) => crypto.createHash("sha256").update(fs.readFileSync(`public${p.image}`)).digest("hex"))).size, 100, "thumbnail pixels differ between articles");
for (const post of posts) {
  const paragraphs = post.body.flatMap((b) => b.type === "ul" ? b.items : b.type === "table" ? b.rows.flat() : b.type === "faq" ? b.items.flatMap((x) => [x.question, x.answer]) : [b.text || ""]);
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 600, `${post.slug} must contain a complete article (${words} words)`);
  assert.ok(fs.existsSync(`public${post.image}`), `${post.slug} image exists`);
  assert.ok(post.heroImage && fs.existsSync(`public${post.heroImage}`), `${post.slug} header exists`);
  assert.ok(post.body.some((b) => b.type === "link" && b.href.startsWith("https://")), `${post.slug} cites sources`);
  for (const block of post.body) {
    if (block.type === "link" && block.href.startsWith("/blogs/")) assert.ok(slugs.has(block.href.slice(7).split(/[?#]/)[0]), `${post.slug} links to an existing article`);
  }
}
const base = exportsObj.BLOG_POSTS[0];
exportsObj.BLOG_POSTS.push({ ...base, slug: 'future-test', date: '2026-11-06' });
assert.equal(exportsObj.publishedBlogDate(new Date('2026-11-05T18:29:59Z')), '2026-11-05');
assert.equal(exportsObj.getPost('future-test', new Date('2026-11-05T18:29:59Z')), null);
assert.equal(exportsObj.getPost('future-test', new Date('2026-11-05T18:30:00Z')).slug, 'future-test');
assert.ok(!exportsObj.getPublishedPosts(new Date('2026-11-05T18:29:59Z')).some((p) => p.slug === 'future-test'));
console.log('PASS: 100 complete articles, unique daily dates, sources, assets and midnight India publication gate');
