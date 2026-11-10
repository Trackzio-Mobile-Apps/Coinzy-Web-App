const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

let now = '2026-11-05T18:29:59Z';
class Clock extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return new Date(now).getTime(); }
}
const calls = [];
const errors = [];
let fail = false;
let truncate = false;
const id = (n) => n.toString(16).padStart(24, '0');
function apiPage(kind, pageNo = 0, pageSize = 1000) {
  calls.push({ kind, pageNo, pageSize });
  if (fail) throw new Error('Backend unavailable');
  const totalCount = kind === 'catalogue' ? 1001 : 2;
  const length = Math.min(pageSize, Math.max(0, totalCount - pageNo * pageSize));
  const items = Array.from({ length }, (_, i) => kind === 'catalogue'
    ? { archetypeId: id(pageNo * pageSize + i), imageUrls: [] }
    : { id: id(i + 10000), imageUrls: [] });
  if (truncate && pageSize > 1) items.pop();
  return Promise.resolve({ items, pageNo, pageSize, totalCount });
}
const api = {
  fetchArchetypesCached: ({ pageNo = 0, pageSize = 1000 }) => apiPage('catalogue', pageNo, pageSize),
  fetchPublicListingPage: (pageNo, pageSize) => apiPage('marketplace', pageNo, pageSize),
  isArchetypeId: (value) => /^[a-f0-9]{24}$/i.test(value),
};
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const exports = {};
  modules.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, {
    exports, Date: Clock, Intl, Request, Response, URL, URLSearchParams,
    process: { env: { NEXT_PUBLIC_SITE_URL: 'https://coinzy.example' } },
    console: { error: (...args) => errors.push(args) },
    require: (name) => {
      if (name === '@/lib/api/coinzy') return api;
      if (name === 'next/server') return { connection: async () => {} };
      assert.ok(name.startsWith('@/'), `Unexpected module: ${name}`);
      const relative = name.slice(2);
      return load(relative.endsWith('.json') ? relative : `${relative}.ts`);
    },
  }, { filename: file });
  return exports;
}

(async () => {
  const { sitemapIndexResponse, sitemapFileResponse } = load('lib/seo/sitemaps.ts');
  const catalogue = load('lib/catalogue/categories.ts').CATALOGUE_CATEGORIES;
  const marketplace = load('lib/marketplace/categories.ts').MARKETPLACE_CATEGORIES;
  const site = load('lib/site.ts');
  const blog = load('lib/blogs.ts');
  const locations = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const index = await sitemapIndexResponse();
  assert.equal(index.status, 200);
  assert.match(index.headers.get('Content-Type'), /application\/xml/);
  assert.deepEqual(locations(await index.text()), ['pages.xml', 'blogs.xml', 'catalogue-0.xml', 'catalogue-1.xml', 'marketplace-0.xml'].map((file) => `https://coinzy.example/sitemap.xml?file=${file}`));
  const route = load('app/sitemap.xml/route.ts').GET;
  assert.match(await (await route(new Request('https://coinzy.example/sitemap.xml'))).text(), /<sitemapindex/);
  assert.match(await (await route(new Request('https://coinzy.example/sitemap.xml?file=pages.xml'))).text(), /<urlset/);

  const pages = locations(await (await sitemapFileResponse('pages.xml')).text());
  const expectedPages = [...site.PUBLIC_PATHS, ...Object.keys(catalogue).map((slug) => `/catalogue/${slug}`), ...Object.keys(marketplace).map((slug) => `/marketplace/${slug}`)];
  assert.deepEqual(pages.slice().sort(), Array.from(expectedPages, site.absoluteUrl).sort());
  assert.equal(new Set(pages).size, pages.length);
  for (const url of pages) assert.ok(!site.PRIVATE_PATHS.some((prefix) => new URL(url).pathname.startsWith(prefix)));

  const first = locations(await (await sitemapFileResponse('catalogue-0.xml')).text());
  const last = locations(await (await sitemapFileResponse('catalogue-1.xml')).text());
  assert.equal(first.length, 1000);
  assert.deepEqual(last, [`https://coinzy.example/catalogue/coin/${id(1000)}`]);
  assert.equal(new Set([...first, ...last]).size, 1001, 'all catalogue records covered across pages');
  assert.equal(locations(await (await sitemapFileResponse('marketplace-0.xml')).text()).length, 2);
  assert.equal((await sitemapFileResponse('catalogue-2.xml')).status, 404);
  const before = calls.length;
  for (const file of ['catalogue--1.xml', 'catalogue-01.xml', 'catalogue-999999999999999999.xml', 'private.xml', '../blogs.xml']) assert.equal((await sitemapFileResponse(file)).status, 404);
  assert.equal(calls.length, before, 'malformed paths never reach the API');

  const articles = await sitemapFileResponse('blogs.xml');
  const articleXml = await articles.text();
  assert.equal(articles.headers.get('Cache-Control'), 'no-store');
  assert.equal(locations(articleXml).length, 51);
  assert.match(articleXml, /<image:loc>/);
  for (const post of blog.BLOG_POSTS.filter((p) => p.date > '2026-11-05')) assert.ok(!articleXml.includes(`/blogs/${post.slug}<`));
  now = '2026-11-05T18:30:00Z';
  assert.equal(locations(await (await sitemapFileResponse('blogs.xml')).text()).length, 52, 'new article appears at India midnight');
  now = '2026-11-05T18:29:59Z';

  const original = blog.BLOG_POSTS[0].heroImage;
  blog.BLOG_POSTS[0].heroImage = '/image?a=1&b="x"';
  assert.match(await (await sitemapFileResponse('blogs.xml')).text(), /a=1&amp;b=&quot;x&quot;/);
  blog.BLOG_POSTS[0].heroImage = original;
  truncate = true;
  assert.equal((await sitemapFileResponse('catalogue-0.xml')).status, 503, 'short API responses must not publish incomplete sitemaps');
  truncate = false;
  fail = true;
  const unavailable = await sitemapIndexResponse();
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get('Retry-After'), '300');
  assert.equal((await sitemapFileResponse('marketplace-0.xml')).status, 503);
  fail = false;

  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  const blockedBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Claude-Web', 'anthropic-ai', 'Perplexity-User', 'Google-Extended', 'cohere-ai', 'MistralAI-User'];
  const groups = robots.trim().split(/\n\s*\n/);
  const botRule = groups.find((group) => group.includes('User-agent: GPTBot\n'));
  const edge = load('netlify/edge-functions/block-training-crawlers.ts').default;
  for (const bot of blockedBots) {
    assert.match(botRule, /Disallow: \/(?:\n|$)/);
    const request = (path) => new Request(`https://coinzy.example${path}`, { headers: { 'user-agent': bot } });
    assert.equal(edge(request('/_next/image?url=coin.png&w=256&q=75')).status, 403);
    assert.equal(edge(request('/blogs')).status, 403);
    assert.equal(edge(request('/assets/coin.png')).status, 403);
    assert.equal(edge(request('/sitemap.xml')).status, 403);
  }
  for (const bot of ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'cohere-ai']) {
    assert.equal(edge(new Request('https://coinzy.example/llms.txt', { headers: { 'user-agent': bot } })), undefined);
  }
  assert.match(groups[0], /Allow: \/llms\.txt/);
  for (const bot of ['Googlebot', 'bingbot', 'ExampleCrawler', 'ExampleSpider']) {
    assert.equal(edge(new Request('https://coinzy.example/sitemap.xml', { headers: { 'user-agent': bot } })), undefined);
  }
  assert.equal(edge(new Request('https://coinzy.example/_next/image', { headers: { 'user-agent': 'Mozilla/5.0' } })), undefined);
  for (const group of groups) {
    for (const privateRoute of ['/collection/owned', '/marketplace/my-listings', '/marketplace/my-listing/123', '/experts/new', '/evaluation-hub-preview', '/api/coin/add', '/get-app']) {
      const prefixes = [...group.matchAll(/^Disallow: (.+)$/gm)].map((match) => match[1]);
      assert.ok(prefixes.some((prefix) => privateRoute.startsWith(prefix)), `Crawler group must exclude ${privateRoute}`);
    }
  }
  const response = load('app/llms.txt/route.ts').GET();
  const llms = await response.text();
  assert.match(response.headers.get('Content-Type'), /text\/plain/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(llms, /^# Coinzy AI/);
  for (const route of expectedPages) assert.ok(llms.includes(`(${site.absoluteUrl(route)})`), `LLM map includes ${route}`);
  for (const post of blog.BLOG_POSTS) assert.equal(llms.includes(`(${site.absoluteUrl(`/blogs/${post.slug}`)})`), post.date <= '2026-11-05');
  assert.ok(!llms.includes('(https://coinzy.example/sitemap.xml)'));
  assert.match(llms, /AI bots may access this file only/);
  assert.equal(errors.length, 3);
  console.log('PASS: complete paginated discovery, public categories, India publication rollover, XML escaping, private crawler exclusions and retryable API failures');
})().catch((error) => { console.error(error); process.exitCode = 1; });
