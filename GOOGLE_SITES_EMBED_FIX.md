# Fix: Nav Links Open `about:blank` When Embedded in Google Sites

## Issue Summary

When `WorstExtensionEverHome.html` is pasted into Google Sites as a full-page embed using the **Embed** > **Embed code** feature, the page renders perfectly — styles, animations, interactive tutorial, and all visual elements display correctly. However, **clicking any navigation link (Overview, Tutorial, The 8 Episodes, Download) or CTA button (Learn How To Install, See the Tragedy) opens `about:blank` in a new tab** instead of smooth-scrolling to the target section within the page.

## Environment

- **Hosting method**: Google Sites > Insert > Embed > Embed code (full HTML pasted)
- **Affected file**: `WorstExtensionEverHome.html` (standalone promo page with embedded ZIP)
- **Source file**: `promo.html` (development version)
- **Browser behavior**: Occurs in all browsers (Chrome, Firefox, Edge, Safari) when the page is rendered inside Google Sites

## Root Cause

Google Sites renders embedded HTML content inside a **sandboxed iframe**. The sandbox attribute on the iframe restricts certain behaviors for security, including the execution of `javascript:` URIs in `href` attributes.

### The Problem Code (Before Fix)

All 6 navigation and CTA links used `href="javascript:void(0)"`:

```html
<!-- Nav links (lines 483-486) -->
<a href="javascript:void(0)" onclick="document.getElementById('overview').scrollIntoView({behavior:'smooth'})">Overview</a>
<a href="javascript:void(0)" onclick="document.getElementById('simulator').scrollIntoView({behavior:'smooth'})">Tutorial</a>
<a href="javascript:void(0)" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})">The 8 Episodes</a>
<a href="javascript:void(0)" onclick="document.getElementById('download').scrollIntoView({behavior:'smooth'})">Download</a>

<!-- CTA buttons (lines 515-516) -->
<a href="javascript:void(0)" onclick="document.getElementById('simulator').scrollIntoView({behavior:'smooth'})" class="btn btn-primary">Learn How To Install</a>
<a href="javascript:void(0)" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" class="btn">See the Tragedy</a>
```

### Why This Fails in a Sandboxed iframe

1. When the browser encounters `href="javascript:void(0)"`, it treats it as a **navigation** to a `javascript:` URI.
2. In a sandboxed iframe, `javascript:` URI navigation is **blocked by the Content Security Policy (CSP)**.
3. Instead of silently failing, the browser **opens `about:blank` in a new tab** as a fallback.
4. The `onclick` handler that performs the smooth scroll **never executes** because the navigation event takes priority and interrupts it.

### Why This Works Outside of Google Sites

When the HTML file is opened directly in a browser (not inside an iframe), there is no sandbox restriction. The browser evaluates `javascript:void(0)` as a no-op expression (returns `undefined`, so no navigation occurs), and the `onclick` handler fires normally to perform the smooth scroll.

## The Fix

### What Changed

Replaced `href="javascript:void(0)"` with `href="#"` and added `return false;` at the end of each `onclick` handler.

### Fixed Code (After Fix)

```html
<!-- Nav links (lines 483-486) -->
<a href="#" onclick="document.getElementById('overview').scrollIntoView({behavior:'smooth'}); return false;">Overview</a>
<a href="#" onclick="document.getElementById('simulator').scrollIntoView({behavior:'smooth'}); return false;">Tutorial</a>
<a href="#" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'}); return false;">The 8 Episodes</a>
<a href="#" onclick="document.getElementById('download').scrollIntoView({behavior:'smooth'}); return false;">Download</a>

<!-- CTA buttons (lines 515-516) -->
<a href="#" onclick="document.getElementById('simulator').scrollIntoView({behavior:'smooth'}); return false;" class="btn btn-primary">Learn How To Install</a>
<a href="#" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'}); return false;" class="btn">See the Tragedy</a>
```

### Why This Fix Works

1. **`href="#"`** is a standard anchor reference. It does not trigger any CSP or sandbox restrictions — it is universally safe in all iframe contexts.
2. **`return false;`** in the `onclick` handler **prevents the default anchor behavior** (which would otherwise scroll the page to the top due to the `#` fragment). This is the inline equivalent of calling `event.preventDefault()`.
3. The `onclick` handler now **executes fully** — `scrollIntoView({behavior:'smooth'})` runs, performs the smooth scroll, and then `return false` cancels the default `#` navigation.
4. This pattern works identically whether the page is:
   - Opened directly in a browser
   - Embedded in a Google Sites iframe
   - Embedded in any other sandboxed iframe context

## Files Modified

| File | Description |
|------|-------------|
| `promo.html` | Development/source version of the promo page — 6 link instances fixed |
| `WorstExtensionEverHome.html` | Standalone version with embedded ZIP (base64) — same 6 link instances fixed |

### Specific Lines Changed

- **Lines 483-486** (nav bar links): 4 instances
- **Lines 515-516** (hero CTA buttons): 2 instances
- **Total**: 6 instances across each file (12 total changes)

## Verification Steps

### Local Testing
1. Open `WorstExtensionEverHome.html` directly in a browser
2. Click each nav link — should smooth-scroll to the corresponding section
3. Click each CTA button — should smooth-scroll to the target section
4. No new tabs should open; no `about:blank` pages should appear

### Google Sites Testing
1. Open your Google Sites page in edit mode
2. Insert > Embed > Embed code
3. Paste the full contents of `WorstExtensionEverHome.html`
4. Publish the site
5. Visit the published page and click each nav link and CTA button
6. All links should smooth-scroll **within the embedded iframe** — no `about:blank` tabs

## Technical Notes

### Alternative Approaches Considered

| Approach | Verdict |
|----------|---------|
| `href="javascript:void(0)"` | **Broken** — blocked by iframe sandbox CSP |
| `href="#sectionId"` (standard anchors) | Works but causes a hard jump, not smooth scroll, and modifies the URL hash |
| `href="#" onclick="...; return false;"` | **Chosen** — universally compatible, smooth scroll, no URL modification |
| `<button>` instead of `<a>` | Would work but requires restyling all nav/CTA elements |
| `addEventListener` with `preventDefault()` | Would work but requires refactoring inline handlers to a script block |

### Google Sites iframe Sandbox Attributes

Google Sites applies the following sandbox permissions to embedded HTML:
- `allow-scripts` — JavaScript execution is allowed
- `allow-same-origin` — DOM access within the iframe is allowed
- **NOT included**: `allow-top-navigation` — the iframe cannot navigate the parent page
- The `javascript:` URI scheme is treated as a navigation attempt and is therefore blocked

This means inline `onclick` JavaScript **works fine**, but `href="javascript:..."` does **not**.
