# Episode 8: Theme Management

## Overview

Episode 8 ("Worst Theme Selector Ever") provides full theme management for any website. Themes can be applied globally as a default, per-site, or removed individually and in bulk.

## Features

### Built-in Themes

| Theme | Description |
|-------|-------------|
| No Theme (Boring) | Removes all theme effects |
| Hacker (L33t) | Green-on-black terminal aesthetic |
| 90s Webmaster | Comic Sans, tiled backgrounds, neon colors |
| Hotdog Stand | Classic red/yellow Windows 3.1 throwback |
| Deep Fried | Skewed, over-saturated, glowing chaos |
| Cozy Reading | Warm sepia-toned, easy on the eyes |
| High Contrast | Black/white with yellow links |
| Cyberpunk | Dark purple/magenta neon glow |
| Pastel | Soft pinks and purples |
| E-Ink | Grayscale, high contrast, paper-like |

### Custom Themes

Save any combination of settings as a named custom theme:

1. Adjust sliders/options to your liking
2. Type a name in the "Theme Name" field
3. Click **Save Custom**
4. The theme appears in the dropdown under "Custom Themes"

### Apply Theme to All Pages (Global Default)

Toggle **"Set Theme for All Pages"** to ON:

- The current theme settings become the global default
- Every page that loads will use this theme automatically
- Any further changes to settings are saved globally in real-time
- Per-site overrides are still saved underneath, so turning the toggle OFF restores individual site themes

### Per-Site Themes

With "Set Theme for All Pages" OFF (default behavior):

- Theme settings are saved per hostname (e.g., `google.com`, `github.com`)
- Each site remembers its own theme independently
- Revisiting a site automatically re-applies its saved theme

### Remove Theme

- **Single site**: Navigate to the site, click **"Reset Page Theme"** — resets all sliders/options to defaults and removes the theme from that site
- **All sites**: Toggle "Set Theme for All Pages" ON, select "No Theme (Boring)", reset all sliders to defaults — this clears the global theme. Then toggle it OFF to stop overriding per-site settings

### Additional Controls

| Control | Description |
|---------|-------------|
| Font Override | Change font family (Serif, Sans-Serif, Monospace, Comic Sans, System UI) |
| Font Size | Scale text from 50% to 300% |
| Font Color | Override text color (must enable the checkbox) |
| Force Dark Mode | Inverts the page colors (images/videos re-invert to look normal) |
| Brightness | 0%–200% brightness filter |
| Contrast | 0%–300% contrast filter |
| Hue Rotate | 0–360 degree color rotation |
| Sepia / Temp | 0%–100% sepia warmth filter |

## Technical Details

### Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `ep8Settings` | `Object<hostname, settings>` | Per-site theme settings |
| `ep8GlobalSettings` | `Object` | Global default theme settings |
| `ep8ApplyAllPages` | `boolean` | Whether global theme is active |
| `ep8CustomThemes` | `Object<name, settings>` | Saved custom themes |

### Settings Object Shape

```json
{
  "theme": "none|hacker|retro90s|hotdog|deepfried|cozy|highcontrast|cyberpunk|pastel|eink|custom_<name>",
  "forceDark": false,
  "brightness": 100,
  "contrast": 100,
  "hue": 0,
  "sepia": 0,
  "fontFamily": "",
  "fontSize": 100,
  "fontColor": "#000000",
  "fontColorEnable": false
}
```

### Auto-Apply Logic (content.js)

On every page load, the content script checks storage:

1. If `ep8ApplyAllPages` is `true` AND `ep8GlobalSettings` exists → apply global settings
2. Otherwise, if per-site settings exist for the current hostname → apply per-site settings
3. Otherwise → no theme applied

### CSS Class Convention

Theme classes on `<html>` use the `worse-theme-` prefix to avoid collisions with website styles:

- `worse-theme-hacker`, `worse-theme-retro90s`, `worse-theme-hotdog`, etc.
- `worse-theme-force-dark` — triggers media re-inversion for images/video
- `worse-theme-custom-fonts` — enables font override rules
