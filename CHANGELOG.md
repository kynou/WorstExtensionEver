# Changelog

## 2026-03-13 — Google Sites Embed: Download Button Fix + White Gap Fix

### Problem
When `WorstExtensionEverHome.html` is embedded in Google Sites via **Insert > Embed > Embed code**, two bugs appeared:

1. **Download button breaks the page** — The `<a href="data:application/zip;base64,...">` link causes the sandboxed iframe to navigate to the data URI instead of downloading the ZIP. The iframe content is destroyed and replaced with raw binary data.
2. **White gap below footer** — The download section used `min-height: 50vh` while all other sections used `100vh`, exposing the Google Sites white background when scrolled to the bottom.

### Fix Applied

**Download button (WorstExtensionEverHome.html):**
- Moved base64 ZIP data from the `<a>` href into a hidden `<div id="zip-data" data-zip="...">` element
- Replaced `href="data:..."` with `href="#" onclick="downloadZip(); return false;"`
- Added `downloadZip()` function that decodes the base64 data into a Blob, creates an Object URL, and triggers download via a programmatic `<a>` click

**Download button (promo.html):**
- Replaced `href="WorseExtensionEver.zip"` with `href="#" onclick="downloadZip(); return false;"`
- Added `downloadZip()` function that uses `fetch()` to retrieve the ZIP file as a blob and triggers download via programmatic `<a>` click

**White gap:**
- Changed download section `min-height` from `50vh` to `100vh` in both files

### Why It Works
- `href="#"` avoids triggering iframe sandbox navigation restrictions
- `return false` prevents default anchor scroll-to-top behavior
- `URL.createObjectURL(blob)` creates a same-origin URL that bypasses the `allow-downloads` sandbox restriction
- Programmatic `.click()` on a dynamically created `<a download="...">` element is allowed by the `allow-scripts` sandbox permission

### Files Modified
| File | Changes |
|------|---------|
| `WorstExtensionEverHome.html` | Download section height, download button, added hidden zip-data div, added `downloadZip()` |
| `promo.html` | Download section height, download button, added fetch-based `downloadZip()` |
| `GOOGLE_SITES_EMBED_FIX.md` | Added Fix 2 documentation |

---

## 2026-03-12 — Google Sites Embed: Nav Links Fix

### Problem
Clicking any navigation link or CTA button opened `about:blank` in a new tab instead of smooth-scrolling within the embedded page.

### Root Cause
All links used `href="javascript:void(0)"`, which is blocked by iframe sandbox CSP. The browser treated it as a navigation attempt and opened `about:blank`.

### Fix Applied
- Replaced `href="javascript:void(0)"` with `href="#"` on all 6 nav/CTA links
- Added `return false;` to each `onclick` handler to prevent default anchor behavior

### Files Modified
| File | Changes |
|------|---------|
| `WorstExtensionEverHome.html` | 6 link instances fixed (4 nav + 2 CTA) |
| `promo.html` | 6 link instances fixed (4 nav + 2 CTA) |
| `GOOGLE_SITES_EMBED_FIX.md` | Initial documentation |

---

## 2026-03-11 — Initial Standalone Promo Page

### Changes
- Generated `WorstExtensionEverHome.html` — fully self-contained single-file version of `promo.html`
- All CSS, JS, SVG, and the extension ZIP (base64-encoded) embedded inline
- No external dependencies required

### Files Added
| File | Description |
|------|-------------|
| `WorstExtensionEverHome.html` | Standalone promo page with embedded ZIP |
| `DOCUMENTATION.md` | Full project documentation |
