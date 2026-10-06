# Claude Code — Coinzy Web

Follow **`AGENTS.md`** for all coding rules. Use **`INDEX.md`** as the living map of routes, APIs, and gotchas. Update both when you change architecture or ship pages.

## Claude-specific notes

- Figma MCP (server `figma`) is configured for this project. File key: `YV6ArWhD2eVlLPH6M090gc`. Prefer `get_design_context` with node IDs from `PAGES-CHECKLIST.md`.
- Asset hashes from Figma MCP can attach to the wrong layer — always visually verify downloads before committing paths into constants.
- Auth contract: `docs/auth-api.md`. Coin/catalogue API: `docs/coinid-api.md`.
- Do not duplicate long tribal knowledge here; keep it in `INDEX.md` and keep this file short.
