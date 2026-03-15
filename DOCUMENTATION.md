# Worst Extension Ever - Documentation

## Overview

**Worst Extension Ever** is a Chrome extension (Manifest V3) that applies intentionally awful visual effects to any webpage. It ships as 9 "episodes," each introducing a different way to ruin your browsing experience. The project also includes a standalone promotional landing page.

---

## Project Structure

```
WorstExtensionEver/
├── manifest.json                    # Chrome extension manifest (MV3)
├── popup.html                       # Extension popup UI
├── popup.css                        # Popup styles
├── popup.js                         # Popup logic & episode management
├── content.js                       # Content script injected into pages
├── content.css                      # Content script styles
├── icons/
│   ├── icon16.png                   # Toolbar icon (16x16)
│   ├── icon48.png                   # Extension management icon (48x48)
│   └── icon128.png                  # Chrome Web Store icon (128x128)
├── promo.html                       # Promotional landing page (references local zip)
├── WorstExtensionEverHome.html      # Standalone promo page (all assets embedded)
├── WorseExtensionEver_Store_Ready.zip  # Pre-built extension zip for distribution
├── privacy_policy.html              # Privacy policy page
├── README.md                        # Repository readme
└── DOCUMENTATION.md                 # This file
```

---

## Extension Details

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | Worst Extension Ever                                                  |
| Version     | 1.0.4                                                                 |
| Manifest    | V3                                                                    |
| Permissions | `activeTab`, `scripting`, `storage`                                   |
| Entry Point | `popup.html` (action popup), `content.js` + `content.css` (all URLs) |

---

## The 9 Episodes

### Episode 1: Worst Search Ever
Replaces the browser's Ctrl+F with a "spotlight" search. The entire page is dimmed to 92% opacity and matches are revealed through a small, movable spotlight circle. Configurable options: multi-spotlight mode, background dimness, and spotlight size.

### Episode 2: Worst Earthquake Ever
Physically shakes the DOM apart. HTML elements are displaced, rotated, and dropped with simulated gravity. A CSS "fire" effect burns across the bottom of the page. Intensity is adjustable from Mild to CATASTROPHIC.

### Episode 3: Worst Magnifying Glass Ever
Applies a heavy CSS `backdrop-filter: blur()` to the entire page. The only way to read content is through a small magnifying glass lens that follows the cursor. Configurable blur radius and zoom level.

### Episode 4: Worst AI Controller Ever
Hijacks the Enter key on ChatGPT, Gemini, and Claude. Enter inserts a newline instead of submitting; users must use Ctrl+Enter to submit. Each AI platform can be toggled independently.

### Episode 5: Worst Light Switch Ever
Scans the page for semantic content categories (images, videos, text blocks, links, buttons, ads) and provides toggle switches to hide/show each category. States are saved per hostname.

### Episode 6: Worse Dev Console Ever
Hover over any element to make it glow magenta. Click to inspect and live-edit its CSS properties. A "Dev Mode" toggle enables more aggressive element highlighting and style manipulation. Style changes can be reset per site.

### Episode 7: Worse URL Parser Ever
Parses the current page URL into its components (protocol, hostname, port, pathname, query params, hash). Includes smart detection for YouTube video IDs, Google Sheets document IDs, and Google Drive folder IDs. Results can be exported as Markdown, CSV, TSV, or HTML table.

### Episode 8: Worst Theme Selector Ever
Applies visual filter themes to any webpage. Built-in themes include: Hacker, 90s Webmaster, Hotdog Stand, Deep Fried, Cozy Reading, High Contrast, Cyberpunk, Pastel, and E-Ink. Users can also create and save custom themes with configurable brightness, contrast, hue rotation, sepia, font family, font size, and font color. Includes a Force Dark Mode toggle. Settings are saved per hostname.

### Episode 9: Worst YouTube Timeline Remover Ever
Hides all YouTube video player overlay elements for clean, unobstructed screenshots. A single toggle button activates "Clean Mode" which makes the following elements invisible:

- **Bottom controls bar** — play/pause button, volume, time display, chapter links, settings, fullscreen button, and the entire progress bar / timeline
- **Center bezel animation** — the large play/pause/seek icon that flashes when interacting with the video
- **Gradient overlays** — the dark gradients at the top and bottom of the video frame
- **Top title bar** — the video title overlay shown on hover
- **End screen elements** — suggested video cards, autoplay countdown, and end screen overlays
- **Annotations & cards** — info cards, teasers, watermarks, branding, and paid content overlays
- **Ambient mode** — the `#cinematics` glow effect behind the video
- **Miscellaneous** — tooltips, context menus, settings panels, spinners, and storyboard previews

**How it works:**
1. Adds a CSS class (`worse-yt-clean`) to the `<html>` element on YouTube pages
2. Content script CSS rules use `opacity: 0 !important` and `visibility: hidden !important` on 40+ YouTube player selectors (all `.ytp-*` prefixed classes)
3. Uses `pointer-events: none` to prevent interaction with hidden overlays
4. The video itself continues playing normally — only the UI chrome is hidden
5. Toggle state is persisted globally via `chrome.storage.local` (`ep9Enabled` key)
6. The popup button auto-disables on non-YouTube pages with a "YouTube Only" label

**YouTube player selectors targeted (content.css):**

| Category | Selectors |
|----------|-----------|
| Controls | `.ytp-chrome-bottom`, `.ytp-chrome-top` |
| Timeline | `.ytp-progress-bar-container`, `.ytp-scrubber-container` |
| Bezel | `.ytp-bezel`, `.ytp-bezel-text-wrapper` |
| Gradients | `.ytp-gradient-bottom`, `.ytp-gradient-top` |
| Title | `.ytp-title`, `.ytp-title-text` |
| End screen | `.ytp-endscreen-content`, `.ytp-autonav-endscreen`, `.ytp-ce-element` |
| Cards | `.ytp-cards-button`, `.ytp-cards-teaser` |
| Branding | `.ytp-watermark`, `.iv-branding`, `.branding-img-container` |
| Overlays | `.ytp-pause-overlay`, `.ytp-paid-content-overlay`, `.ytp-impression-link` |
| Annotations | `.ytp-iv-video-content`, `.video-annotations`, `.annotation` |
| UI misc | `.ytp-tooltip`, `.ytp-popup`, `.ytp-settings-menu`, `.ytp-spinner` |
| Ambient | `#cinematics` |

---

## Key Files

### `manifest.json`
Chrome extension manifest (Manifest V3). Registers `popup.html` as the browser action, injects `content.js` and `content.css` into all URLs, and requests `activeTab`, `scripting`, and `storage` permissions.

### `popup.html` / `popup.js` / `popup.css`
The extension popup UI. Contains the episode selector, all controls for each episode, a compact mode toggle, and light/dark theme support. Communicates with `content.js` via `chrome.tabs.sendMessage`. All user preferences are persisted in `chrome.storage.local`.

### `content.js` / `content.css`
The content script injected into every page. Listens for messages from the popup and applies visual effects (spotlight overlays, earthquake physics, magnifier lens, Enter key hijacking, element visibility toggles, CSS inspection overlays, URL parsing, theme filters, and YouTube overlay hiding). Manages its own DOM overlays and cleanup.

### `promo.html`
Apple-style promotional landing page featuring:
- Animated W1 chip SVG hero artwork
- Interactive 5-step installation simulator with terminal narration
- Bento grid layout showcasing all 9 episodes with inline SVG illustrations
- Scroll-reveal animations and an easter egg "glitch mode" (click the W1 chip)
- Download link to the extension zip

### `WorstExtensionEverHome.html`
A fully standalone, single-file version of `promo.html`. All CSS, JavaScript, SVG graphics, and the extension zip file (as a base64 data URI) are embedded directly in the HTML. No external dependencies are required to render or use this page. The download button delivers the file as `WorseExtensionEver.zip`.

### `privacy_policy.html`
Privacy policy confirming the extension collects no user data. All settings are stored locally via `chrome.storage.local`. No analytics, tracking, or third-party data sharing.

---

## Installation (Developer / Unpacked)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. The extension icon appears in the toolbar - click it to open the popup and select an episode

---

## Data Storage

All data is stored locally using `chrome.storage.local`:

| Key                | Description                                      |
|--------------------|--------------------------------------------------|
| `theme`            | Popup UI theme (`light` / `dark`)                |
| `isCompact`        | Compact mode state                               |
| `lastEpisode`      | Last selected episode ID                         |
| `multiSpotlight`   | Ep 1: multi-spotlight toggle                     |
| `dimness`          | Ep 1: background dimness (0-1)                   |
| `sizeScale`        | Ep 1: spotlight size multiplier                  |
| `quakeIntensity`   | Ep 2: earthquake intensity (1-10)                |
| `magnifyActive`    | Ep 3: magnifier on/off                           |
| `magnifierBlur`    | Ep 3: blur radius in px                          |
| `magnifierZoom`    | Ep 3: zoom level multiplier                      |
| `chatgptEnabled`   | Ep 4: ChatGPT Enter key hijack                   |
| `geminiEnabled`    | Ep 4: Gemini Enter key hijack                    |
| `claudeEnabled`    | Ep 4: Claude Enter key hijack                    |
| `urlSwitchStates`  | Ep 5: per-hostname visibility toggle states      |
| `episode6Enabled`  | Ep 6: dev console enabled                        |
| `devModeEnabled`   | Ep 6: dev mode toggle                            |
| `ep6Styles`        | Ep 6: per-hostname style overrides               |
| `ep8Settings`      | Ep 8: per-hostname theme settings                |
| `ep8CustomThemes`  | Ep 8: user-created custom theme definitions      |
| `ep8ApplyAllPages` | Ep 8: apply theme globally toggle                |
| `ep8GlobalSettings`| Ep 8: global theme settings                      |
| `ep9Enabled`       | Ep 9: YouTube clean mode on/off                  |

---

## Standalone Promo Page

`WorstExtensionEverHome.html` is a completely self-contained HTML5 file that can be hosted anywhere or opened directly from disk. It embeds:

- All CSS (inline `<style>`)
- All JavaScript (inline `<script>`)
- All graphics (inline SVGs)
- The extension zip (base64-encoded data URI with `download="WorseExtensionEver.zip"`)

No server, CDN, or external resources required.
