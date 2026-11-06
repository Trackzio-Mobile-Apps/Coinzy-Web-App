#!/usr/bin/env node
/**
 * node scripts/generate-blog-thumbnails.cjs [--slug article-slug] [--force] [--check]
 * Uses the installed Next.js image stack and bundled Plus Jakarta Sans font.
 * Uses verified coin photographs for every article, with source credits retained.
 * Generic guides use reference coins, not claimed examples of errors or grades.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const sharp = require('sharp');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'public/assets/blogs/generated');
const MANIFEST = path.join(ROOT, 'lib/blog-thumbnails.json');
const FONT = path.join(ROOT, 'app/fonts/PlusJakartaSans-Variable.ttf');
const PHOTOS = require('../public/assets/blogs/real-photos/credits.json');
const LAYOUTS = { card: { width: 960, height: 640 }, hero: { width: 1600, height: 668 } };
const STYLES = {
  'Buy & sell': { accent: '#7c3c3f', pale: '#f8eae6', caption: 'BUY & SELL' },
  Collecting: { accent: '#526d5c', pale: '#edf3e9', caption: 'COLLECTING' },
  'Value guides': { accent: '#8b6335', pale: '#f7edda', caption: 'VALUE RESEARCH' },
  'Grading & appraisal': { accent: '#48576d', pale: '#eaf0f6', caption: 'GRADING & APPRAISAL' },
  'Errors & varieties': { accent: '#a76637', pale: '#fbeddc', caption: 'ERRORS & VARIETIES' },
  Trading: { accent: '#526a6d', pale: '#e8f2f0', caption: 'COLLECTOR TRADING' },
};
const PHOTO_RULES = [
  { test: /indian head cent/, id: 'indian-head-cent' },
  { test: /wheat|penny/, id: 'wheat-cent' },
  { test: /buffalo/, id: 'buffalo-nickel' },
  { test: /mercury/, id: 'mercury-dime' },
  { test: /roosevelt/, id: 'roosevelt-dime' },
  { test: /washington quarter/, id: 'washington-quarter' },
  { test: /kennedy/, id: 'kennedy-half' },
  { test: /walking liberty/, id: 'walking-liberty-half' },
  { test: /peace dollar/, id: 'peace-dollar' },
  { test: /presidential/, id: 'presidential-dollar' },
  { test: /susan b anthony/, id: 'susan-anthony-dollar' },
  { test: /two rupee/, id: 'indian-two-rupee' },
  { test: /ten rupee/, id: 'indian-ten-rupee' },
  { test: /one paisa/, id: 'indian-one-paisa' },
  { test: /ten paise/, id: 'indian-ten-paise' },
  { test: /twenty-five paise/, id: 'indian-twenty-five-paise' },
  { test: /fifty paise/, id: 'indian-fifty-paise' },
  { test: /anna/, id: 'half-anna' },
  { test: /half rupee|british india/, id: 'half-rupee' },
  { test: /morgan/, id: 'morgan-dollar', source: 'landing-page/04-marketplace/coin-morgan-dollar.png' },
  { test: /mughal/, id: 'mughal-coin', source: 'landing-page/05-browse-catalogue/coin-indian-gold.png' },
  { test: /one rupee/, id: 'indian-one-rupee', source: 'landing-page/03-identify-demo/scan-one-rupee.png' },
  { test: /five rupee/, id: 'indian-five-rupee', source: 'identify/debug/obverse-5-rupee-1994.png' },
  { test: /commemorative/, id: 'indian-commemorative', source: 'landing-page/05-browse-catalogue/coin-commemorative.png' },
];
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const hash = (input) => crypto.createHash('sha256').update(input).digest('hex');
const fileHash = (file) => hash(fs.readFileSync(file));
const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};

function loadPosts() {
  const cache = {};
  const run = (relative) => {
    if (cache[relative]) return cache[relative];
    const exports = {}; cache[relative] = exports;
    const code = ts.transpileModule(fs.readFileSync(path.join(ROOT, relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, Intl, Date, require: (name) => {
      if (name === '@/lib/blog-content/posts') return run('lib/blog-content/posts.ts');
      if (name === '@/lib/blog-thumbnails.json') return { default: previous };
      throw new Error(`Unexpected blog module dependency: ${name}`);
    } }, { filename: relative });
    return exports;
  };
  return run('lib/blogs.ts').BLOG_POSTS;
}

function headline(title) {
  // Keep the meaning and proper nouns; remove only redundant thumbnail phrasing.
  const result = title.trim().replace(/^How to\s+/i, '').replace(/: A (?:Collector’s|Practical) Guide$/i, '');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function selectArtwork(post) {
  const title = post.title.toLowerCase();
  const photo = PHOTO_RULES.find((rule) => rule.test.test(title));
  if (photo && (PHOTOS[photo.id] || photo.source)) {
    const selected = PHOTOS[photo.id] || photo;
    if (!selected.source) throw new Error(`Missing verified coin photo: ${photo.id}`);
    return { ...selected, id: photo.id, kind: 'photo' };
  }
  const indian = post.market === 'India' || post.tags.includes('India') || /indian|india/.test(title);
  const choices = indian
    ? ['indian-one-rupee', 'indian-five-rupee', 'mughal-coin', 'indian-ten-rupee', 'indian-two-rupee', 'half-rupee']
    : /silver/.test(title) ? ['morgan-dollar', 'peace-dollar', 'walking-liberty-half']
      : ['wheat-cent', 'buffalo-nickel', 'morgan-dollar', 'mercury-dime', 'peace-dollar', 'kennedy-half'];
  const available = choices.filter((id) => PHOTOS[id] || PHOTO_RULES.some((rule) => rule.id === id && rule.source));
  const id = available[parseInt(hash(post.slug).slice(0, 8), 16) % available.length];
  const selected = PHOTOS[id] || PHOTO_RULES.find((rule) => rule.id === id);
  if (!selected?.source) throw new Error(`Missing reference photograph: ${id}`);
  return { ...selected, id, kind: 'photo' };
}

async function textLayer(text, width, height, maxSize, color, bold = true) {
  for (let size = maxSize; size >= Math.min(18, maxSize); size -= 2) {
    const result = await sharp({ text: { text: `<span foreground="${color}">${escape(text)}</span>`, font: `Plus Jakarta Sans ${bold ? 'Bold' : 'Regular'} ${size}`, fontfile: FONT, width, rgba: true, wrap: 'word-char', spacing: 4 } }).png().toBuffer({ resolveWithObject: true });
    if (result.info.width <= width && result.info.height <= height) return result;
  }
  throw new Error(`Title cannot fit safely: ${text}`);
}

async function render(post, art, variant, destination) {
  const { width, height } = LAYOUTS[variant];
  const hero = variant === 'hero';
  const style = STYLES[post.tags[0]] || STYLES.Collecting;
  const margin = hero ? 92 : 60;
  const textWidth = hero ? 900 : 515;
  const imageSize = hero ? 470 : 330;
  const imageX = hero ? 1080 : 605;
  const imageY = hero ? 104 : 246;
  const layers = [];
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#fffcf7"/><stop offset="1" stop-color="${style.pale}"/></linearGradient></defs><path fill="url(#paper)" d="M0 0h${width}v${height}H0z"/><circle cx="${imageX + imageSize / 2}" cy="${imageY + imageSize / 2}" r="${imageSize / 2 + 50}" fill="${style.accent}" opacity=".04"/><circle cx="${imageX + imageSize / 2}" cy="${imageY + imageSize / 2}" r="${imageSize / 2 + 28}" fill="none" stroke="${style.accent}" opacity=".17"/><path d="M${margin} ${height - 78}h${width - margin * 2}" stroke="${style.accent}" opacity=".2"/><rect x="${margin}" y="${hero ? 133 : 130}" width="44" height="5" rx="2" fill="${style.accent}"/></svg>`);
  const addText = async (value, x, y, w, h, size, color, bold = true) => {
    const result = await textLayer(value, w, h, size, color, bold);
    layers.push({ input: result.data, left: Math.round(x), top: Math.round(y) });
    return result.info;
  };
  await addText('Coinzy', margin, hero ? 46 : 42, 190, 52, 34, style.accent);
  const market = post.market || (post.tags.includes('India') ? 'India' : post.tags.includes('US') ? 'US' : 'Collectors');
  await addText(`${style.caption} · ${market === 'US' ? 'UNITED STATES' : market.toUpperCase()}`, margin, hero ? 156 : 156, textWidth, 44, hero ? 25 : 21, style.accent);
  const fitted = await addText(headline(post.title), margin, hero ? 226 : 220, textWidth, hero ? 285 : 300, hero ? 78 : 57, '#302725');
  {
    const mask = Buffer.from(`<svg width="${imageSize}" height="${imageSize}"><circle cx="${imageSize / 2}" cy="${imageSize / 2}" r="${imageSize / 2 - 2}" fill="white"/></svg>`);
    const photo = await sharp(path.join(ROOT, 'public/assets', art.source)).resize(imageSize, imageSize, { fit: 'contain', background: '#fff' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
    layers.push({ input: photo, left: imageX, top: imageY });
  }
  await addText('COINZY JOURNAL', margin, height - 53, 350, 28, 17, '#746762');
  await addText('REFERENCE COIN PHOTO', hero ? width - 480 : width - 375, height - 53, hero ? 390 : 315, 28, 15, '#746762', false);
  let output = sharp(background).composite(layers);
  if (art.sourceUrl) output = output.withExif({ IFD0: { Artist: art.author, Copyright: `${art.title}; ${art.author}; ${art.sourceUrl}; ${art.license} ${art.licenseUrl}; cropped, resized and composed with title and background.` } });
  await output.webp({ quality: 88, effort: 4 }).toFile(destination);
  return { width, height, titleWidth: fitted.width, titleHeight: fitted.height };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg, i) => !['--slug', '--force', '--check'].includes(arg) && args[i - 1] !== '--slug')) throw new Error('Use --slug <slug>, --force or --check.');
  const slugIndex = args.indexOf('--slug');
  if (slugIndex >= 0 && (!args[slugIndex + 1] || args[slugIndex + 1].startsWith('--'))) throw new Error('--slug needs an article slug.');
  const posts = loadPosts().filter((post) => slugIndex < 0 || post.slug === args[slugIndex + 1]);
  if (!posts.length) throw new Error('No matching articles.');
  const manifest = { ...previous };
  const version = fileHash(__filename) + fileHash(FONT);
  let rendered = 0;
  if (!args.includes('--check')) fs.mkdirSync(OUTPUT, { recursive: true });
  for (const post of posts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) throw new Error(`Unsafe article slug: ${post.slug}`);
    const art = selectArtwork(post);
    const fingerprint = hash(JSON.stringify({ version, title: post.title, date: post.date, tags: post.tags, market: post.market, art, sourceHash: art.source ? fileHash(path.join(ROOT, 'public/assets', art.source)) : null })).slice(0, 12);
    const base = `/assets/blogs/generated/${post.slug}-${fingerprint}`;
    const expected = { image: `${base}.webp`, heroImage: `${base}-hero.webp` };
    const existing = manifest[post.slug];
    const sizes = {};
    for (const variant of ['card', 'hero']) {
      const source = variant === 'card' ? expected.image : expected.heroImage;
      const file = path.join(ROOT, 'public', source);
      if (args.includes('--check')) {
        if (!existing || existing.image !== expected.image || existing.heroImage !== expected.heroImage || existing.title !== post.title) throw new Error(`Outdated thumbnail: ${post.slug}. Run the generator.`);
        const meta = await sharp(file).metadata();
        if (meta.width !== LAYOUTS[variant].width || meta.height !== LAYOUTS[variant].height) throw new Error(`Wrong ${variant} dimensions: ${post.slug}`);
      } else if (args.includes('--force') || !fs.existsSync(file)) {
        sizes[variant] = await render(post, art, variant, file); rendered++;
      }
    }
    const photoCredit = art.sourceUrl ? { title: art.title, author: art.author, sourceUrl: art.sourceUrl, license: art.license, licenseUrl: art.licenseUrl, modifications: 'Cropped, resized and composed with title and background.' } : null;
    manifest[post.slug] = { ...expected, imageAlt: `${post.title} — reference photograph of ${art.id.replace(/-/g, ' ')}`, title: post.title, thumbnailTitle: headline(post.title), artwork: art.id, source: `/assets/${art.source}`, photoCredit, fingerprint, layouts: { ...existing?.layouts, ...sizes } };
  }
  if (!args.includes('--check')) {
    const temporary = `${MANIFEST}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
    fs.renameSync(temporary, MANIFEST);
  }
  console.log(args.includes('--check') ? `Verified personalized card and header images for ${posts.length} articles.` : `Prepared thumbnails for ${posts.length} articles (${rendered} images rendered).`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
