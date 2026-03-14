# E-Ink Theme Fix for Kindle Cloud Reader

## Date: 2026-03-14

## Problem

The extension's E-Ink theme was broken on Amazon Kindle Cloud Reader (`read.amazon.com`). When the E-Ink theme was applied, the Kindle reader page turned completely white/blank - no book text was visible.

Meanwhile, the same E-Ink theme worked perfectly on regular websites like CNN, producing a newspaper-like grayscale appearance.

## Root Cause

Two separate issues were identified:

### 1. CSS Class Name Collision

The Kindle Cloud Reader uses its own class `theme-eink` on the `<html>` element as part of Amazon's built-in reader theming system. The extension's `content.css` also used `html.theme-eink` selectors for its E-Ink theme.

This caused:
- The extension's grayscale filter and background overrides to apply **immediately on page load** (before the user even activated the theme), because the Kindle page already had the `theme-eink` class.
- The `applyEp8Settings()` function in `content.js` (line 184) stripped ALL `theme-*` classes from `<html>`, which removed Amazon's own `theme-eink` class that the Kindle reader needed for its internal functionality.

### 2. Background Color Override Breaking Blob Image Rendering

The Kindle Cloud Reader renders book pages as **blob images** (`<img src="blob:https://read.amazon.com/...">`) rather than DOM text. The E-Ink theme's `background-color: #e5e5e5 !important` on `body` overrode the Kindle reader's inline background styles, causing the book content area to become a flat gray that washed out the blob image text.

## Solution

### Fix 1: Namespace All Theme Classes (content.css + content.js)

Renamed all extension theme classes from `theme-*` to `worse-theme-*`:

| Before | After |
|--------|-------|
| `theme-eink` | `worse-theme-eink` |
| `theme-hacker` | `worse-theme-hacker` |
| `theme-retro90s` | `worse-theme-retro90s` |
| `theme-hotdog` | `worse-theme-hotdog` |
| `theme-deepfried` | `worse-theme-deepfried` |
| `theme-cozy` | `worse-theme-cozy` |
| `theme-highcontrast` | `worse-theme-highcontrast` |
| `theme-cyberpunk` | `worse-theme-cyberpunk` |
| `theme-pastel` | `worse-theme-pastel` |
| `theme-force-dark` | `worse-theme-force-dark` |
| `theme-custom-fonts` | `worse-theme-custom-fonts` |

Updated `content.js` class stripping filter from:
```js
// OLD - strips ALL theme-* classes including Amazon's own
document.documentElement.className = Array.from(document.documentElement.classList)
    .filter(c => !c.startsWith('theme-')).join(' ');
```
To:
```js
// NEW - only strips extension's own classes
document.documentElement.className = Array.from(document.documentElement.classList)
    .filter(c => !c.startsWith('worse-theme-')).join(' ');
```

### Fix 2: Redesigned E-Ink Theme CSS

The E-Ink theme was redesigned to:
1. Apply `grayscale(100%) contrast(130%)` filter on `<html>` - does the heavy lifting
2. Apply paper-gray backgrounds (`#d8d8d8`, `#e0e0e0`) to structural elements (div, section, article, etc.) but NOT to `<body>` directly - avoids overriding Kindle's inline body styles
3. Force dark text color (`#111`) on all text elements
4. Apply `mix-blend-mode: multiply` on images for a printed-on-paper look
5. Remove all box-shadows and text-shadows for clean e-ink aesthetic

### Fix 3: Kindle-Specific CSS Overrides

Added targeted CSS rules for the Kindle Cloud Reader:
- `body.kr-fullpage-body` gets paper background (`#e0e0e0`) using the Kindle-specific class
- Reader chrome (header, footer, toolbar, title bar) gets paper-gray backgrounds with dark text
- Book image containers (`.kg-full-page-img`, `.kg-view`, etc.) get `transparent` backgrounds so blob images render correctly
- Book images themselves get `filter: none` to preserve natural rendering

## Files Modified

| File | Changes |
|------|---------|
| `content.css` | Renamed all `html.theme-*` selectors to `html.worse-theme-*`; redesigned E-Ink theme with paper-gray styling; added Kindle Cloud Reader overrides |
| `content.js` | Updated class stripping filter and class application to use `worse-theme-*` prefix |

## Testing

Verified on:
- **CNN.com** - Full newspaper-like e-ink appearance with gray paper background, grayscale images, high-contrast black text
- **read.amazon.com** (Kindle Cloud Reader) - Book text visible and readable, reader chrome styled with paper-gray tones, book blob images render correctly

## Chrome Extension Staleness Note

During debugging, a related issue was discovered: Chrome caches content scripts from unpacked developer extensions. After modifying extension files on disk, Chrome does NOT automatically pick up the changes. You must either:
1. Click the **reload** button on `chrome://extensions`
2. Or restart Chrome entirely

### Extension Details (this machine)
- **Chrome Extension ID**: `cfbjdfkeciaclnkckjgkikhlpbaoflfm`
- **Load path**: `C:\GIT_SOURCE\installmyextension\WorstExtensionEver` (unpacked, location type 4)
- **First installed**: 2026-03-12 18:57:57
- **Stored in**: Chrome Secure Preferences (not regular Preferences)
