# Personalized blog thumbnails

Generate artwork for every article, including posts scheduled for a future date:

```bash
node scripts/generate-blog-thumbnails.cjs
```

Generate one article, check existing outputs, or force a complete render:

```bash
node scripts/generate-blog-thumbnails.cjs --slug how-to-sell-old-coins-safely-in-india
node scripts/generate-blog-thumbnails.cjs --check
node scripts/generate-blog-thumbnails.cjs --force
```

The script reads the current article titles and categories from `lib/blogs.ts` and `lib/blog-content/posts.ts`. It creates a short thumbnail headline without rewriting the article title. Long headlines wrap and shrink to fit a measured text area using the bundled Plus Jakarta Sans font.

Every thumbnail uses a real coin photograph. Title keywords select a matching denomination or series from the curated assets when available. General collecting, grading, shipping, photography, trading and safety guides use a reference coin selected consistently from the appropriate market. A reference photograph does not claim to demonstrate a particular error, grade or authenticity result. There are no drawn coin illustrations.

Additional photographs live in `public/assets/blogs/real-photos/`; `credits.json` records the original source, author, license and preparation changes. Existing project coin photos are reused directly. Add a verified local photo and its credit record, then extend `PHOTO_RULES` in the generator. The generator needs no network access. Source and license links are shown below article header images for the additional photographs, and embedded in the generated WebP metadata. Share-alike photographs and their composed thumbnails retain the corresponding share-alike license.

Each article receives a 960×640 card and a 1600×668 header under `public/assets/blogs/generated/`. `lib/blog-thumbnails.json` stores the generated paths, selected artwork and text layout measurements. The article loader applies these paths to listing cards, article headers and social metadata. Header images use contain fitting so their titles remain readable on narrow screens.

Output names include a fingerprint of the title, category, source image, font and generator. Re-running unchanged inputs reuses the existing files. Changing an input creates a fresh filename, avoiding stale optimized images. Files are generated locally using the installed Sharp/TypeScript dependencies; no external image API or new package is required.

After adding a post or changing a title, run the generator and `--check`, then `node tests/blog-publication.cjs`. Commit the generated images and manifest together with the script/content changes. The publication schedule still controls which articles are visible.
