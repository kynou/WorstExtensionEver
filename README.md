# Worse Extension Ever - The Ultimate Hub

The absolute worst (ironically best) miscellaneous extension hub for the web. This extension is organized into "Episodes," each featuring a uniquely "worst" tool or visual experience.

## Features

- **Episode Hub:** A modern, slick interface featuring an "Episode Selector" to switch between different tools.
- **Compact Mode:** A context-aware "Minimize" toggle (🗜️) that shrinks the popup to its essentials.
- **Persistent Memory:** The extension remembers your last selected episode, slider values, toggles, and theme preferences across sessions.
- **Per-URL Settings (Episode 5):** The "Light Switch" remembers exactly what categories you turned off for each specific website.
- **Smart Themes:** Includes a new Dark/Light mode engine with auto-detection and manual override.
- **Unified Branding:** Featuring the iconic spotlighted character (Comic Book Guy).

## The Episodes

### Episode 1: Worst Search Ever (Theatrical Search)
- **Cinematic Dimming:** The entire webpage dims when a search is initiated.
- **Theatrical Spotlights:** Matches are illuminated using high-fidelity radial gradients.
- **Ghost Hunter & Visual Sort:** Advanced visibility checks and natural reading order sorting.

### Episode 2: Worse Earthquake Ever (Cinematic Destruction)
- **Choreographed Sequence:** From gentle sway to full structural collapse, fire, and firetruck arrival.
- **Multi-Stage Tension:** Starts with letter-level jitter, building into a debris pile and an accidental fire.
- [Detailed Episode 2 Documentation](EPISODE2_REFINED.md)

### Episode 3: Worst Magnifying Glass Ever (Blurry Zoom)
- **Theatrical Lens:** A circular magnifying glass tracks the mouse cursor revealing a clear, zoomed-in view of blurred content.
- **Slick Toggle:** Controlled via a single switch for a cleaner UI.

### Episode 4: Worst AI Prompt Controller Ever (Conversation Delayer)
- **Accidental Submit Prevention:** Forces "Enter" to create a new line; "Ctrl+Enter" to submit on ChatGPT, Gemini, and Claude.

### Episode 5: Worst Light Switch Ever (Semantic Visibility)
- **Semantic Discovery:** Scans the page to identify categories like "Images & SVGs," "Annoying Ads," and "Navigation."
- **Visibility Toggles:** Turn specific parts of the web "on" or "off" with per-URL persistence.

### Episode 6: Worse Dev Console Ever (Visual Inspection & Persistence)
- **Glow Selection:** Neon pink glow on hover for easy (but blinding) selection — panel elements are excluded.
- **Smart Property Controls:** Dropdowns for `display`/`visibility`, color pickers for `color`/`background-color`, text inputs for everything else.
- **Per-URL Persistence:** All your visual destruction is remembered specifically for each website.
- **Two-Stage Toggles:** Separate "Application" from "Inspection" mode for maximum chaos.
- [Detailed Episode 6 Documentation](EPISODE6.md)

## Architecture
- **Manifest V3:** Modern Chrome extension standards.
- **Stable Layout (v6.0):** Version bump to confirm reload, with stability patches for content script communication.
- **Robust State Engine:** URL-aware persistence for site-specific tools.

## Version History
- **6.7:** Dev Console UX improvements.
  - Fixed self-highlighting bug: panel child elements no longer get the magenta glow.
  - Added dropdown selects for `display` (14 values) and `visibility` (3 values).
  - Added native color pickers for `color` and `background-color` with `rgbToHex()` conversion.
  - Added retro terminal CSS for `<select>` and `<input type="color">` controls.
- **6.0:** Milestone Release - Episode 6 & Cinematic Earthquake overhaul.
  - Added "Dev Mode" with interactive selection and property editing (Episode 6).
  - Complete overhaul of Earthquake progression: atomized text shaking, debris pile, cigarette dude, and fire truck rescue (Episode 2).
  - Fixed "Receiving end does not exist" script crashes and improved node-walking stability.
  - Synchronized state handling for AI controller and visibility toggles.
- **5.5:** Stability Patch: 
  - Fixed layout overflow by enforcing strict `340px` width and `overflow-x: hidden`.
  - Refined header alignment using flexbox and `white-space: nowrap` for the title.
  - Rewrote Episode 5 URL detection to use a robust hostname-keying system for per-site persistence.
  - Consolidated Episode 3 into a single functional toggle.
- **5.4:** Consolidated Episode 3 toggle switch.
- **5.3:** Compact Mode implementation.
- **5.2:** Per-URL Persistence for Episode 5.
- **5.1:** Performance Patch: Fixed page freeze.
- **5.0:** Episode 5 - Worst Light Switch Ever.
