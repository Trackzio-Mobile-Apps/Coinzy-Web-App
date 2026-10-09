# Coinzy Web — Agent Rules

Shared instructions for **Cursor**, **Claude Code**, and **Codex**. Read `INDEX.md` for the live file map and gotchas; keep that file current when you ship meaningful work.

## Product

Coinzy (Trackzio) is an AI coin identifier and collector platform. This repo is the **Next.js 15 App Router** marketing + browse site (React 19, TypeScript, Tailwind CSS 4). Android is the source of truth for API contracts.

## Stack (do not reinvent)

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 App Router + Turbopack (`npm run dev`) |
| UI | React 19 server components by default; `"use client"` only when needed |
| Styles | Tailwind 4 (`@import "tailwindcss"` + `@theme` in `app/globals.css`) |
| Fonts | Geist + Plus Jakarta via `next/font` — variable classes on `<html>`, not `<body>` |
| Images | `next/image`; API/S3 photos stay optimized (no `unoptimized`) |
| Design | Figma file `YV6ArWhD2eVlLPH6M090gc`; checklist in `PAGES-CHECKLIST.md` |

## Layout of the repo

```
app/                 routes, layouts, API route handlers
components/          landing | catalogue | marketplace | blogs | auth | ui | layout
lib/                 constants, view-models, API/auth clients, category rules
public/assets/       shipped images/icons (prefer over design/ at runtime)
docs/                coinid-api.md, auth-api.md
design/              Figma export reference (not always runtime)
tests/               Node scripts (e.g. auth-api.cjs)
INDEX.md             living project map — update when pages/APIs change
```

## Hard rules

1. **Match Figma, don't freestyle.** Use node IDs from `PAGES-CHECKLIST.md`. Pixel-sensitive padding/sizes may need `!` overrides against `SectionShell` defaults.
2. **Server secrets stay on the server.** Never import `lib/api/coinzy.ts` or `lib/api/marketplace-session.ts` into client components. Guest JWTs for catalogue/marketplace stay in module memory on the server. Browser sessions use HTTP-only cookies via same-origin `/api/*` route handlers (auth, coin add, marketplace sell, etc.) — never expose session JWTs in client code or JSON.
3. **Two API backends.** Catalogue → `COINZY_API_ORIGIN` (default `https://coins-api.trackzio.com`). Marketplace listings → `COINZY_MARKETPLACE_API_ORIGIN` (default `https://coins-api-prod.trackzio.com`). Auth paths are root `/auth/*`; data paths are `/api/*`. Always **https**.
4. **Reuse shared UI.** `SectionShell`, `SectionHeader`, `PageHero`, `HeroBanner`, `FallbackImage`, `CoinPlaceholder`, `DetailsBreadcrumb`, `CoinPhotos`, grids/pagers — extend props; don't fork.
5. **Full-bleed backgrounds** go in `SectionShell`'s `background` prop, not as children (children live in the 1440px column).
6. **API field types vary.** Newer archetypes send numbers; older ones send strings. Normalize in view-models (`lib/catalogue/coinDetails.ts` pattern) — never assume string methods on raw API fields.
7. **Figma SVG exports are often wrong** (hearts, arcs, wrong layer hashes). Prefer hand-written Hugeicons under `public/assets/...` or `icons/shared/`. Eyeball every downloaded asset.
8. **After replacing an image under the same filename**, delete `.next/cache/images` or the optimizer keeps serving the old bytes.
9. **No new deps** unless required; prefer the existing stack. No Inter/Roboto defaults — use theme tokens from `@theme`.
10. **Google auth** uses Firebase Google popup → Google ID token → same-origin `POST /api/auth/google` → upstream `auth/social-login/google` (never expose the Coinzy JWT). **Shared auth entry pop-ups** (Figma `908:*` / `905:*`) are **not built on web** — logged-out CTAs use `/auth?next=` instead.

## Coding conventions

- TypeScript strict; prefer explicit props interfaces near the component.
- Colocate page-specific components under `components/<area>/`; shared primitives under `components/ui/`.
- Static/marketing data in `lib/*.ts`; category filter rules in `lib/catalogue/categories.ts` and `lib/marketplace/categories.ts`.
- Prefer URL search params for browse state (`?page=`, `?category=`, `?from=`).
- Use `unstable_cache` + tags when fetch cache would bust on rotating Bearer tokens (see archetype/listing details).
- Streaming: shell + Suspense for slow details; pair with `loading.tsx` skeletons.
- Broken remote images → `FallbackImage` + `CoinPlaceholder`.
- Add remote image hosts only in `next.config.ts` `images.remotePatterns`.

## Auth (web)

- Browser calls only `/api/auth/{login|signup|guest|forgot|reset}` via `lib/auth/client.ts`.
- Proxy validates origin, maps Android contract (`docs/auth-api.md`), strips tokens from JSON, sets `coinzy_session` (and `coinzy_guest_id`) HTTP-only cookies.
- Catalogue server reads remain on the independent guest client in `lib/api/coinzy.ts` — do not conflate the two.

## What not to build yet

Pricing/FAQ/download/legal pages on this domain (unless asked), and Phase-3 parity features from `COINZY-WEB-SPEC.md`. Prefer completing checklist items over inventing scope.

## When finishing work

1. Update `INDEX.md` (routes, components, API notes, gotchas).
2. Tick/adjust `PAGES-CHECKLIST.md` when a Figma screen ships or scope changes.
3. Keep timeline HTML/XLSX in sync only when the user asks about scheduling/progress.
4. Run `npm run lint` / typecheck mentally for touched files; fix what you broke.

## Quick commands

```bash
npm run dev      # next dev --turbopack
npm run build
npm run lint
node tests/auth-api.cjs
```
