# QA issues tracker — 5 November 2026

Keep the fix log below current as work is completed; record any verification still pending.

## Open

| ID | Issue | Expected / retest | Status | Fix notes |
| --- | --- | --- | --- | --- |
| 3 | A subscription expired on mobile still appears active on web, including after refresh and logout. | The same account should show its current subscription status across devices after refresh and signing in again. | Open | Pending investigation; web uses `auth/me` subscription status with a JWT fallback. |
| 7 | Blogs need testing and proper data. | Test blog list and articles; replace or supply appropriate approved data. | Open | Pending testing and content. |
| 8 | Removing a coin image in identification can show “Flip the coin” again. | The flip prompt should appear only once, and not reappear when an image is removed. | Open | Current flow resets the dismissal when both image slots are filled or empty. |

## Done

| ID | Issue | Expected / retest | Status | Fix notes |
| --- | --- | --- | --- | --- |
| 2 | Navigation selection sometimes takes 1–2 seconds. | Navigation should respond promptly, show the destination loading state, and remain usable while loading. | Done | Sidebar links immediately show the destination's selected navigation and loading placeholder; navigation remains available. Browser retest pending. |
| 4 | Images uploaded on mobile appear enlarged in the web Feed. | Mobile-uploaded images should display at an appropriate size and aspect ratio. | Done locally | Feed images use contain fitting to show the complete image without cover cropping; marked done locally per user confirmation. |
| 5 | Circular cropped images sometimes appear square in the Expert flow. | The displayed image should preserve the intended circular crop. | Done locally | Expert crops export transparent circular PNGs, and uploads preserve PNG transparency. Existing uploaded images are unchanged. |

## Go Pro popup and scan counts

- Successful scans: the free-plan card uses the server's `successThreshold`; it displays **30** only as a fallback until a server value arrives. The actual threshold and exact scan at which a popup appears still need verification against the QA account and API.
- Failed scans: the server supplies `errorThreshold`; the web code does not specify a fixed failed-scan count. Verify the actual value and popup timing on QA.
- The identification flow handles a scan-limit response as an error toast; its scan code does not automatically open a Go Pro popup based on either counter. The free-plan card has a manual Premium upgrade button. Record observed behavior and API thresholds after testing.

## Fix log

- 5 November 2026 — **2:** Added immediate destination loading state to sidebar navigation, including nested links. TypeScript passed; browser retest pending. ESLint unavailable in the current installation.
- 5 November 2026 — **2:** Kept sidebar navigation clickable on both the immediate pending screen and route loading screens; browser retest pending.
- 5 November 2026 — **4:** Changed Feed post images from cover to contain within the existing image area. Visual review with mobile uploads pending.
- 5 November 2026 — **4:** Marked done locally per user confirmation.
- 5 November 2026 — **5:** Added circular PNG export for Expert crops and retained PNG transparency during upload. TypeScript passed; visual and upload retest pending.
- 5 November 2026 — **5:** Marked done locally per user confirmation.
