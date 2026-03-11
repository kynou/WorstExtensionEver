console.log("Worse Extension Ever v6.8 - Magnifier Scroll Fix");

// --- Global State ---
let matches = [];
let currentIdx = -1;
let isMulti = false;
let dimness = 0.92;
let sizeScale = 1.8;
let overlay = null;
let pathElement = null;
const svgNS = "http://www.w3.org/2000/svg";

// --- Episode 2: Earthquake State ---
let quakeTimers = [];
let quakeIntervals = [];
let fallingElements = [];
let accumulatedStackHeight = 0;
let quakeActive = false;
let letterShakeFactor = 0;
let wordShakeFactor = 0;
let bodyShakeFactor = 0;
let letterFallRate = 0;
let cascadeRate = 0;
let fireHeight = 0;

// --- Episode 3: Magnifier State ---
let isMagnifying = false;
let magnifierBlur = 5;
let magnifierZoom = 2.0;
let magnifierEl = null;
let magnifierClone = null;
let lastClientX = 0;
let lastClientY = 0;
let blurOverlay = null;

// --- Episode 4: AI Controller State ---
let aiSettings = { geminiEnabled: false, chatgptEnabled: false, claudeEnabled: false };
let isInternalEvent = false;

// --- Episode 5: Light Switch State ---
const semanticCategories = {
  images: { label: "Images & SVGs", selectors: ['img', 'svg', 'picture', 'canvas'] },
  videos: { label: "Videos & IFrames", selectors: ['video', 'iframe', 'embed', 'object'] },
  text: { label: "Text Blocks", selectors: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article'] },
  links: { label: "Links & Anchors", selectors: ['a'] },
  buttons: { label: "Buttons & Inputs", selectors: ['button', 'input[type="button"]', 'input[type="submit"]'] },
  ads: { label: "Ads (Smart)", selectors: [
    // Original basic selectors
    '.ad', '.ads', '.advertisement',
    // Google ads
    'ins.adsbygoogle', '.adsbygoogle', '[id^="google_ads"]', '[id^="div-gpt-ad"]',
    '[data-google-query-id]', '[data-ad-slot]', '[data-ad-client]',
    // Common ad classes
    '.ad-container', '.ad-slot', '.ad-wrapper', '.ad-unit', '.ad-banner',
    '.ad-box', '.ad-placement', '.ad-block', '.ad-spot', '.ad-top', '.ad-sidebar',
    '.advert', '.sponsored', '.sponsored-content', '.native-ad',
    '.gpt-ad', '.dfp-ad', '.google-ads', '.adsense',
    // CNN / news site patterns
    '[class*="ad-slot"]', '[class*="ad__"]', '[class*="ad--"]',
    '[id*="partner-zone"]',
    // Taboola
    '[id^="taboola-"]', '.trc_rbox', '.trc_related_container', '.tbl-feed',
    // Outbrain
    '.OUTBRAIN', '.ob-widget', '[data-widget-id]',
    // Common ad IDs
    '[id^="ad-"]', '[id^="ad_"]',
    // Aria labels
    '[aria-label*="advertisement" i]', '[aria-label*="sponsored" i]',
    // Heuristic-tagged
    '[data-wee-ad]'
  ] },
  nav: { label: "Navigation & Headers", selectors: ['nav', 'header', 'footer', 'aside'] }
};

// --- Episode 8: Themes State ---
const EP8_STYLE_ID = 'worse-theme-styles';

// --- Episode 6: Worse Dev Console State ---
let ep6Active = false;
let devModeActive = false;
let currentGlowEl = null;
let propertiesPanel = null;
const EP6_GLOW_CLASS = 'worse-dev-glow';
const EP6_STYLE_ID = 'worse-dev-styles';
const EP6_PERSIST_STYLE_ID = 'worse-dev-persisted-styles';
const EP6_PROP_CONFIG = {
  'display': {
    type: 'select',
    options: ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex',
              'grid', 'inline-grid', 'table', 'table-row', 'table-cell',
              'contents', 'list-item', 'flow-root']
  },
  'visibility': {
    type: 'select',
    options: ['visible', 'hidden', 'collapse']
  },
  'color': { type: 'color' },
  'background-color': { type: 'color' }
};

// --- Initialization & Per-URL Application ---

const initContentScript = () => {
  const hostname = window.location.hostname;

  const style = document.createElement('style');
  style.id = EP6_STYLE_ID;
  style.textContent = `
    .${EP6_GLOW_CLASS} {
      outline: 4px solid #ff00ff !important;
      outline-offset: -4px !important;
      box-shadow: 0 0 20px #ff00ff, inset 0 0 20px #ff00ff !important;
      transition: outline 0.1s, box-shadow 0.1s !important;
      cursor: crosshair !important;
    }
    #worse-dev-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: #1e1e1e;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      border: 2px solid #00ff00;
      z-index: 2147483647;
      padding: 15px;
      box-shadow: 10px 10px 0px #000;
      font-size: 12px;
      max-height: 80vh;
      overflow-y: auto;
    }
    #worse-dev-panel h3 { margin: 0 0 10px 0; color: #ff00ff; border-bottom: 1px solid #ff00ff; padding-bottom: 5px; }
    #worse-dev-panel .prop-row { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center; }
    #worse-dev-panel input { background: #000; color: #00ff00; border: 1px solid #00ff00; width: 120px; padding: 2px; }
    #worse-dev-panel .close-btn { position: absolute; top: 5px; right: 5px; cursor: pointer; color: red; font-weight: bold; }
    #worse-dev-panel .tag-info { color: #888; margin-bottom: 10px; font-style: italic; }
    #worse-dev-panel select { background: #000; color: #00ff00; border: 1px solid #00ff00; width: 120px; padding: 2px; font-family: 'Courier New', monospace; font-size: 12px; appearance: none; -webkit-appearance: none; cursor: pointer; }
    #worse-dev-panel input[type="color"] { background: #000; border: 1px solid #00ff00; width: 120px; height: 24px; padding: 0; cursor: pointer; }
    #worse-dev-panel input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
    #worse-dev-panel input[type="color"]::-webkit-color-swatch { border: none; }
  `;
  document.head.appendChild(style);

  chrome.storage.local.get(['episode6Enabled', 'devModeEnabled', 'ep6Styles', 'geminiEnabled', 'chatgptEnabled', 'claudeEnabled', 'urlSwitchStates'], (res) => {
    ep6Active = res.episode6Enabled || false;
    devModeActive = res.devModeEnabled || false;

    if (ep6Active) {
      applyPersistedStyles(res.ep6Styles ? res.ep6Styles[hostname] : null);
      if (devModeActive) enableDevModeListeners();
    }

    aiSettings = {
      geminiEnabled: res.geminiEnabled || false,
      chatgptEnabled: res.chatgptEnabled || false,
      claudeEnabled: res.claudeEnabled || false
    };

    chrome.storage.local.get(['ep8Settings'], (ep8Res) => {
      if (ep8Res.ep8Settings && ep8Res.ep8Settings[hostname]) {
        applyEp8Settings(ep8Res.ep8Settings[hostname]);
      }
    });

    if (res.urlSwitchStates && res.urlSwitchStates[hostname]) {
      const siteSwitches = res.urlSwitchStates[hostname];
      for (const [id, info] of Object.entries(siteSwitches)) {
        if (info.hidden) toggleCategoryVisibility(id, false);
      }
    }
  });
};

const applyEp8Settings = (settings) => {
    let styleEl = document.getElementById(EP8_STYLE_ID);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = EP8_STYLE_ID;
        document.head.appendChild(styleEl);
    }
    
    document.documentElement.className = Array.from(document.documentElement.classList).filter(c => !c.startsWith('theme-')).join(' ');
    
    if (settings.theme && settings.theme !== 'none' && !settings.theme.startsWith('custom_')) {
        document.documentElement.classList.add(`theme-${settings.theme}`);
    }
    if (settings.forceDark) {
        document.documentElement.classList.add('theme-force-dark');
    }

    const b = settings.brightness !== undefined ? settings.brightness : 100;
    const c = settings.contrast !== undefined ? settings.contrast : 100;
    const h = settings.hue !== undefined ? settings.hue : 0;
    const s = settings.sepia !== undefined ? settings.sepia : 0;
    
    let filterStr = `brightness(${b}%) contrast(${c}%) hue-rotate(${h}deg) sepia(${s}%)`;
    if (settings.forceDark) {
        filterStr = `invert(100%) hue-rotate(180deg) ` + filterStr;
    }
    
    let fontCSS = '';
    let hasCustomFont = false;
    if (settings.fontFamily) {
        fontCSS += `font-family: ${settings.fontFamily} !important; `;
        hasCustomFont = true;
    }
    if (settings.fontSize && settings.fontSize != 100) {
        fontCSS += `font-size: ${settings.fontSize}% !important; `;
        hasCustomFont = true;
    }
    if (settings.fontColorEnable && settings.fontColor) {
        fontCSS += `color: ${settings.fontColor} !important; `;
        hasCustomFont = true;
    }

    if (hasCustomFont) {
        document.documentElement.classList.add('theme-custom-fonts');
    }

    styleEl.textContent = `
        :root {
            --ep8-filter: ${filterStr};
        }
        html {
            filter: var(--ep8-filter) !important;
        }
        html.theme-custom-fonts, html.theme-custom-fonts body, html.theme-custom-fonts p, html.theme-custom-fonts span, html.theme-custom-fonts div, html.theme-custom-fonts h1, html.theme-custom-fonts h2, html.theme-custom-fonts h3, html.theme-custom-fonts h4, html.theme-custom-fonts h5, html.theme-custom-fonts h6, html.theme-custom-fonts a, html.theme-custom-fonts li, html.theme-custom-fonts td, html.theme-custom-fonts th {
            ${fontCSS}
        }
    `;
};

const applyPersistedStyles = (styles) => {
  let styleEl = document.getElementById(EP6_PERSIST_STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = EP6_PERSIST_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  if (!styles || Object.keys(styles).length === 0) { styleEl.textContent = ''; return; }
  let css = '';
  for (const [selector, properties] of Object.entries(styles)) {
    css += `${selector} { `;
    for (const [prop, val] of Object.entries(properties)) css += `${prop}: ${val} !important; `;
    css += `} \n`;
  }
  styleEl.textContent = css;
};

// --- Episode 6 UI Logic ---

const getSelector = (el) => {
  if (el.id) return `#${el.id}`;
  if (el.className) {
    const classes = Array.from(el.classList).filter(c => c !== EP6_GLOW_CLASS).join('.');
    if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
  }
  return el.tagName.toLowerCase();
};

const rgbToHex = (rgb) => {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  return '#' + [match[1], match[2], match[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
};

const createPropertiesPanel = (el) => {
  if (propertiesPanel) propertiesPanel.remove();
  propertiesPanel = document.createElement('div');
  propertiesPanel.id = 'worse-dev-panel';
  const title = document.createElement('h3');
  title.textContent = 'Worse Dev Console';
  propertiesPanel.appendChild(title);
  const closeBtn = document.createElement('div');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '[X]';
  closeBtn.onclick = () => propertiesPanel.remove();
  propertiesPanel.appendChild(closeBtn);
  const tagInfo = document.createElement('div');
  tagInfo.className = 'tag-info';
  tagInfo.textContent = `Selected: <${el.tagName.toLowerCase()}>`;
  propertiesPanel.appendChild(tagInfo);
  const propsToEdit = ['color', 'background-color', 'font-size', 'opacity', 'border', 'padding', 'margin', 'display', 'visibility', 'transform', 'filter', 'width', 'height'];
  const computed = window.getComputedStyle(el);
  propsToEdit.forEach(prop => {
    const row = document.createElement('div');
    row.className = 'prop-row';
    const label = document.createElement('span');
    label.textContent = prop;
    const config = EP6_PROP_CONFIG[prop];
    const currentVal = computed.getPropertyValue(prop);
    let control;
    if (config && config.type === 'select') {
      control = document.createElement('select');
      config.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (currentVal.trim() === opt) option.selected = true;
        control.appendChild(option);
      });
    } else if (config && config.type === 'color') {
      control = document.createElement('input');
      control.type = 'color';
      control.value = rgbToHex(currentVal);
    } else {
      control = document.createElement('input');
      control.type = 'text';
      control.value = currentVal;
    }
    control.onchange = (e) => {
      const newVal = e.target.value;
      el.style.setProperty(prop, newVal, 'important');
      updateSavedStyle(el, prop, newVal);
    };
    row.appendChild(label);
    row.appendChild(control);
    propertiesPanel.appendChild(row);
  });
  document.documentElement.appendChild(propertiesPanel);
};

const updateSavedStyle = (el, prop, val) => {
  const hostname = window.location.hostname;
  const selector = getSelector(el);
  chrome.storage.local.get(['ep6Styles'], (res) => {
    const allStyles = res.ep6Styles || {};
    const siteStyles = allStyles[hostname] || {};
    const elStyles = siteStyles[selector] || {};
    elStyles[prop] = val;
    siteStyles[selector] = elStyles;
    allStyles[hostname] = siteStyles;
    chrome.storage.local.set({ ep6Styles: allStyles }, () => applyPersistedStyles(siteStyles));
  });
};

const handleMouseOver = (e) => {
  if (!devModeActive) return;
  if (currentGlowEl) currentGlowEl.classList.remove(EP6_GLOW_CLASS);
  currentGlowEl = e.target;
  if (currentGlowEl && !currentGlowEl.closest('#worse-dev-panel')) currentGlowEl.classList.add(EP6_GLOW_CLASS);
};

const handleMouseOut = (e) => {
  if (currentGlowEl) { currentGlowEl.classList.remove(EP6_GLOW_CLASS); currentGlowEl = null; }
};

const handleClick = (e) => {
  if (!devModeActive) return;
  if (e.target.closest('#worse-dev-panel')) return;
  e.preventDefault();
  e.stopPropagation();
  createPropertiesPanel(e.target);
};

const enableDevModeListeners = () => {
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', handleClick, true);
};

const disableDevModeListeners = () => {
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', handleClick, true);
  if (currentGlowEl) currentGlowEl.classList.remove(EP6_GLOW_CLASS);
  if (propertiesPanel) propertiesPanel.remove();
};

initContentScript();
chrome.storage.onChanged.addListener((changes) => {
  if (changes.geminiEnabled || changes.chatgptEnabled || changes.claudeEnabled) {
    chrome.storage.local.get(['geminiEnabled', 'chatgptEnabled', 'claudeEnabled'], (res) => {
      aiSettings = { geminiEnabled: res.geminiEnabled || false, chatgptEnabled: res.chatgptEnabled || false, claudeEnabled: res.claudeEnabled || false };
    });
  }
});

const createOverlay = () => {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'best-search-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;opacity:0;transition:opacity 0.3s;background:transparent;';
  document.documentElement.appendChild(overlay);
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  const defs = document.createElementNS(svgNS, 'defs');
  const filter = document.createElementNS(svgNS, 'filter');
  filter.id = 'spotlight-blur';
  const blur = document.createElementNS(svgNS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '5');
  filter.appendChild(blur);
  defs.appendChild(filter);
  svg.appendChild(defs);
  pathElement = document.createElementNS(svgNS, 'path');
  pathElement.setAttribute('fill', `rgba(0,0,0,${dimness})`);
  pathElement.setAttribute('fill-rule', 'evenodd');
  pathElement.setAttribute('filter', 'url(#spotlight-blur)');
  svg.appendChild(pathElement);
  overlay.appendChild(svg);
};

// --- Episode 5 Logic ---

const heuristicAdScan = () => {
  // Matches: standalone "ad"/"ads", ad- ad_ ad-- ad__ prefixes, advert*, sponsor*, promot*
  const AD_PATTERN = /\bads?\b|\bad[-_]|advert|sponsor|promot/i;
  const AD_DATA_ATTRS = ['data-ad', 'data-ad-type', 'data-native-ad', 'data-sponsorship',
    'data-ad-feedback', 'data-ad-unit', 'data-advert', 'data-ad-slot'];
  const AD_IFRAME_DOMAINS = /doubleclick|googlesyndication|amazon-adsystem|taboola|outbrain|criteo|adnxs|rubiconproject|pubmatic|openx|bidswitch/i;
  const AD_LABELS = /^(ad|ads|advertisement|advertiser\s*disclosure|sponsored|promoted|paid\s*(content|partner|post))$/i;
  let count = 0;

  const tag = (el) => {
    if (!el || el.dataset.weeAd) return;
    el.dataset.weeAd = 'true';
    count++;
  };

  // Walk up from el to find the ad container (parent with significant size)
  const tagContainer = (el) => {
    let container = el.parentElement;
    for (let i = 0; i < 8 && container; i++) {
      if (container === document.body || container === document.documentElement) break;
      const rect = container.getBoundingClientRect();
      if (rect.width > 100 && rect.height > 50) { tag(container); return; }
      container = container.parentElement;
    }
    // If no big container found, tag the element itself
    tag(el);
  };

  // 1. Regex class/ID check on all elements
  document.querySelectorAll('*').forEach(el => {
    if (el.dataset.weeAd) return;
    const cn = typeof el.className === 'string' ? el.className : '';
    if ((cn && AD_PATTERN.test(cn)) || (el.id && AD_PATTERN.test(el.id))) tag(el);
  });

  // 2. Data attribute check
  AD_DATA_ATTRS.forEach(attr => {
    document.querySelectorAll(`[${attr}]`).forEach(el => tag(el));
  });

  // 3. Iframe src check
  document.querySelectorAll('iframe[src]').forEach(iframe => {
    if (AD_IFRAME_DOMAINS.test(iframe.src)) tag(iframe);
  });

  // 4. Text label check — small elements whose text signals an ad, then walk up to container
  document.querySelectorAll('span, div, p, label, small, strong, em, a').forEach(el => {
    if (el.dataset.weeAd || el.children.length > 3) return;
    const text = el.textContent.trim();
    if (text.length > 30 || !AD_LABELS.test(text)) return;
    tagContainer(el);
  });

  // 5. Identify ad-like iframes by size (common IAB ad sizes)
  const AD_SIZES = [[300,250],[728,90],[160,600],[320,50],[300,600],[970,250],[336,280]];
  document.querySelectorAll('iframe:not([data-wee-ad])').forEach(iframe => {
    const w = iframe.offsetWidth || parseInt(iframe.width) || 0;
    const h = iframe.offsetHeight || parseInt(iframe.height) || 0;
    if (AD_SIZES.some(([aw, ah]) => Math.abs(w - aw) < 5 && Math.abs(h - ah) < 5)) tag(iframe);
  });

  return count;
};

const scanPageForSwitches = () => {
  heuristicAdScan();
  const result = {};
  for (const [id, category] of Object.entries(semanticCategories)) {
    try {
      const elements = document.querySelectorAll(category.selectors.join(','));
      if (elements.length > 0) result[id] = { label: category.label, count: elements.length, hidden: false };
    } catch (e) {}
  }
  return result;
};

const toggleCategoryVisibility = (categoryId, isVisible) => {
  const category = semanticCategories[categoryId];
  if (!category) return;
  const elements = document.querySelectorAll(category.selectors.join(','));
  elements.forEach(el => {
    if (el.id === 'best-search-overlay' || el.closest('#best-search-overlay')) return;
    if (isVisible) { el.style.display = el.dataset.originalDisplay || ''; delete el.dataset.originalDisplay; }
    else {
      if (!el.dataset.originalDisplay) { const computed = window.getComputedStyle(el).display; el.dataset.originalDisplay = computed === 'none' ? 'block' : computed; }
      el.style.setProperty('display', 'none', 'important');
    }
  });
};

const resetAllVisibility = () => {
  Object.keys(semanticCategories).forEach(id => toggleCategoryVisibility(id, true));
  document.querySelectorAll('[data-wee-ad]').forEach(el => delete el.dataset.weeAd);
};

// ============================================================
// --- Episode 2: Worst Earthquake Ever ---
// ============================================================

// Timing: intensity 1 = 60s, 5 (default) = 30s, 10 = 15s
const getQuakeDuration = (intensity) => {
  if (intensity <= 5) return 60 - (intensity - 1) * 7.5;
  return 30 - (intensity - 5) * 3;
};

const quakeSchedule = (delay, fn) => {
  quakeTimers.push(setTimeout(() => { if (quakeActive) fn(); }, delay));
};

// Text atomization: wraps chars in .quake-atom grouped into .quake-word
const atomizeText = (limit = 500) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let count = 0;
  const nodes = [];
  while (count < limit && walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (parent &&
        !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(parent.tagName) &&
        !parent.id?.startsWith('worse-dev') && !parent.id?.startsWith('quake-') &&
        !parent.closest('#best-search-overlay') &&
        node.textContent.trim().length > 0) {
      nodes.push(node);
      count++;
    }
  }
  nodes.forEach(node => {
    const text = node.textContent;
    const frag = document.createDocumentFragment();
    let wordChars = [];
    const flushWord = () => {
      if (wordChars.length === 0) return;
      const w = document.createElement('span');
      w.className = 'quake-word';
      w.style.display = 'inline-block';
      w.style.transition = 'transform 0.15s ease-out';
      wordChars.forEach(c => w.appendChild(c));
      frag.appendChild(w);
      wordChars = [];
    };
    for (const char of text) {
      if (char === ' ' || char === '\n' || char === '\t') {
        flushWord();
        const s = document.createElement('span');
        s.textContent = char;
        s.className = 'quake-atom quake-space';
        s.style.whiteSpace = 'pre';
        frag.appendChild(s);
      } else {
        const s = document.createElement('span');
        s.textContent = char;
        s.className = 'quake-atom';
        s.style.display = 'inline-block';
        s.style.whiteSpace = 'pre';
        s.style.transition = 'transform 0.1s ease-out';
        wordChars.push(s);
      }
    }
    flushWord();
    if (node.parentNode) node.parentNode.replaceChild(frag, node);
  });
};

// Letter & word shake loop
const startShakeLoop = () => {
  quakeIntervals.push(setInterval(() => {
    if (!quakeActive) return;
    if (letterShakeFactor > 0) {
      document.querySelectorAll('.quake-atom:not(.quake-space)').forEach(a => {
        if (a.dataset.falling || a.closest('[data-falling]')) return;
        a.style.transform = `translate(${(Math.random()-0.5)*letterShakeFactor}px, ${(Math.random()-0.5)*letterShakeFactor}px)`;
      });
    }
    if (wordShakeFactor > 0) {
      document.querySelectorAll('.quake-word').forEach(w => {
        if (w.dataset.falling || w.closest('[data-falling]')) return;
        w.style.transform = `translate(${(Math.random()-0.5)*wordShakeFactor}px, ${(Math.random()-0.5)*wordShakeFactor}px) rotate(${(Math.random()-0.5)*wordShakeFactor*0.3}deg)`;
      });
    }
  }, 80));
};

// BODY SHAKE — shakes the entire page like a building in an earthquake
const startBodyShakeLoop = () => {
  quakeIntervals.push(setInterval(() => {
    if (!quakeActive || bodyShakeFactor <= 0) return;
    const x = (Math.random() - 0.5) * bodyShakeFactor;
    const y = (Math.random() - 0.5) * bodyShakeFactor;
    const r = (Math.random() - 0.5) * bodyShakeFactor * 0.12;
    document.body.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
  }, 25)); // 40fps for violent jitter
};

// Pictures tilt like crooked picture frames
const tiltPictures = () => {
  document.querySelectorAll('img, picture, video').forEach(img => {
    if (img.closest('#best-search-overlay') || img.closest('#worse-dev-panel') || img.dataset.quakeTilted) return;
    img.dataset.quakeTilted = 'true';
    const tilt = (Math.random() - 0.5) * 25;
    img.style.transition = 'transform 2s ease-in-out';
    img.style.transformOrigin = Math.random() > 0.5 ? 'top left' : 'top right';
    quakeTimers.push(setTimeout(() => { img.style.transform = `rotate(${tilt}deg)`; }, Math.random() * 1500));
  });
};

// Core fall mechanic — element drops to the bottom and piles up
const makeElementFall = (el) => {
  if (el.dataset.falling) return;
  el.dataset.falling = 'true';
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;
  // Reparent to <html> so position:fixed works even while <body> has a transform
  document.documentElement.appendChild(el);
  el.style.position = 'fixed';
  el.style.left = `${rect.left + (Math.random() - 0.5) * 30}px`;
  el.style.top = `${rect.top}px`;
  el.style.width = `${rect.width}px`;
  el.style.zIndex = '2147483645';
  el.style.pointerEvents = 'none';
  el.style.transition = 'top 1.2s cubic-bezier(0.45, 0, 0.85, 0.25), transform 1.2s ease-in';
  el.style.transform = `rotate(${(Math.random()-0.5)*50}deg)`;
  const elHeight = Math.max(rect.height, 8);
  const landingTop = Math.max(0, window.innerHeight - elHeight - accumulatedStackHeight);
  accumulatedStackHeight += elHeight * 0.3;
  quakeTimers.push(setTimeout(() => {
    el.style.top = `${landingTop}px`;
    fallingElements.push(el);
  }, 30));
};

// Continuous fall loop
const startFallLoop = () => {
  quakeIntervals.push(setInterval(() => {
    if (!quakeActive) return;
    if (letterFallRate > 0) {
      const atoms = [...document.querySelectorAll('.quake-atom:not([data-falling]):not(.quake-space)')];
      const available = atoms.filter(a => !a.closest('[data-falling]') && a.offsetWidth > 0);
      available.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      for (let i = 0; i < Math.min(letterFallRate, available.length); i++) makeElementFall(available[i]);
    }
    if (cascadeRate > 0) {
      const targets = [...document.querySelectorAll('.quake-word, p, h1, h2, h3, h4, h5, h6, li')];
      const available = targets.filter(el =>
        !el.dataset.falling && !el.closest('[data-falling]') &&
        !el.id?.startsWith('worse-dev') && !el.id?.startsWith('quake-') &&
        !el.closest('#best-search-overlay') && !el.closest('#worse-dev-panel') &&
        el.offsetWidth > 0 && el.offsetHeight > 0 && el.offsetHeight < 200
      );
      available.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      for (let i = 0; i < Math.min(cascadeRate, available.length); i++) makeElementFall(available[i]);
    }
  }, 300));
};

// ---- SVG FIRE ----
const startFire = (height) => {
  if (document.getElementById('quake-fire')) return;

  const w = window.innerWidth;
  const ns = 'http://www.w3.org/2000/svg';
  const container = document.createElement('div');
  container.id = 'quake-fire';
  container.style.cssText = `position:fixed;bottom:0;left:0;width:100%;height:${height}px;z-index:2147483646;pointer-events:none;overflow:visible;`;

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${w} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'position:absolute;bottom:0;left:0;overflow:visible;';

  const defs = document.createElementNS(ns, 'defs');

  // Three fire gradients for variation
  const gradientDefs = [
    [['#ff1a00',1],['#ff4400',0.9],['#ff7700',0.7],['#ffbb00',0.35],['#ffee00',0]],
    [['#ff3300',1],['#ff6600',0.85],['#ffaa00',0.6],['#ffdd00',0.25],['#ffffaa',0]],
    [['#cc0000',1],['#ff2200',0.9],['#ff6600',0.7],['#ffcc00',0.4],['#ffff44',0]]
  ];
  gradientDefs.forEach((stops, idx) => {
    const grad = document.createElementNS(ns, 'linearGradient');
    grad.id = `qflame-g${idx}`;
    grad.setAttribute('x1','0'); grad.setAttribute('y1','1');
    grad.setAttribute('x2','0'); grad.setAttribute('y2','0');
    stops.forEach(([color, opacity], si) => {
      const s = document.createElementNS(ns, 'stop');
      s.setAttribute('offset', `${si * 25}%`);
      s.setAttribute('stop-color', color);
      s.setAttribute('stop-opacity', opacity);
      grad.appendChild(s);
    });
    defs.appendChild(grad);
  });

  // Turbulence filter — makes flames wobble organically
  const turbFilter = document.createElementNS(ns, 'filter');
  turbFilter.id = 'qfire-turb';
  turbFilter.setAttribute('x','-30%'); turbFilter.setAttribute('y','-30%');
  turbFilter.setAttribute('width','160%'); turbFilter.setAttribute('height','160%');
  const turb = document.createElementNS(ns, 'feTurbulence');
  turb.setAttribute('type','turbulence');
  turb.setAttribute('baseFrequency','0.015 0.06');
  turb.setAttribute('numOctaves','3');
  turb.setAttribute('seed','1');
  const animSeed = document.createElementNS(ns, 'animate');
  animSeed.setAttribute('attributeName','seed');
  animSeed.setAttribute('from','1'); animSeed.setAttribute('to','80');
  animSeed.setAttribute('dur','2s'); animSeed.setAttribute('repeatCount','indefinite');
  turb.appendChild(animSeed);
  turbFilter.appendChild(turb);
  const displace = document.createElementNS(ns, 'feDisplacementMap');
  displace.setAttribute('in','SourceGraphic');
  displace.setAttribute('scale','30');
  turbFilter.appendChild(displace);
  defs.appendChild(turbFilter);

  // Glow filter
  const glowFilter = document.createElementNS(ns, 'filter');
  glowFilter.id = 'qfire-glow';
  glowFilter.setAttribute('x','-50%'); glowFilter.setAttribute('y','-50%');
  glowFilter.setAttribute('width','200%'); glowFilter.setAttribute('height','200%');
  const feGauss = document.createElementNS(ns, 'feGaussianBlur');
  feGauss.setAttribute('stdDeviation','10'); feGauss.setAttribute('result','glow');
  glowFilter.appendChild(feGauss);
  const feMerge = document.createElementNS(ns, 'feMerge');
  ['glow','SourceGraphic'].forEach(inp => {
    const n = document.createElementNS(ns, 'feMergeNode');
    n.setAttribute('in', inp);
    feMerge.appendChild(n);
  });
  glowFilter.appendChild(feMerge);
  defs.appendChild(glowFilter);

  svg.appendChild(defs);

  // Flame tongues — overlapping ellipses distorted by turbulence
  const flameCount = 35;
  for (let i = 0; i < flameCount; i++) {
    const x = (w / flameCount) * i + Math.random() * (w / flameCount);
    const fh = height * (0.4 + Math.random() * 0.7);
    const fw = 18 + Math.random() * 40;
    const flame = document.createElementNS(ns, 'ellipse');
    flame.setAttribute('cx', x);
    flame.setAttribute('cy', height - fh * 0.35);
    flame.setAttribute('rx', fw / 2);
    flame.setAttribute('ry', fh / 2);
    flame.setAttribute('fill', `url(#qflame-g${i % 3})`);
    flame.setAttribute('filter', 'url(#qfire-turb)');
    flame.setAttribute('opacity', 0.5 + Math.random() * 0.4);
    svg.appendChild(flame);
  }

  // Base glow layer
  const baseGlow = document.createElementNS(ns, 'rect');
  baseGlow.setAttribute('x','0'); baseGlow.setAttribute('y', `${height * 0.4}`);
  baseGlow.setAttribute('width', w); baseGlow.setAttribute('height', `${height * 0.6}`);
  baseGlow.setAttribute('fill','rgba(255,60,0,0.5)');
  baseGlow.setAttribute('filter','url(#qfire-glow)');
  svg.appendChild(baseGlow);

  container.appendChild(svg);
  document.documentElement.appendChild(container);
  fireHeight = height;

  // Start ember particles
  startEmbers();
};

// Floating ember particles
const spawnEmber = () => {
  const ember = document.createElement('div');
  ember.className = 'quake-ember';
  const x = Math.random() * window.innerWidth;
  const size = 2 + Math.random() * 5;
  const dur = 1 + Math.random() * 2;
  const colors = ['#ff4400','#ff8800','#ffcc00','#ffee66'];
  ember.style.cssText = `position:fixed;bottom:${fireHeight*0.2}px;left:${x}px;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:50%;z-index:2147483647;pointer-events:none;opacity:1;box-shadow:0 0 ${size*2}px ${size}px rgba(255,100,0,0.6);transition:all ${dur}s ease-out;`;
  document.documentElement.appendChild(ember);
  requestAnimationFrame(() => {
    ember.style.bottom = `${fireHeight + 80 + Math.random() * 250}px`;
    ember.style.left = `${x + (Math.random()-0.5)*120}px`;
    ember.style.opacity = '0';
    ember.style.transform = `scale(0.2)`;
  });
  quakeTimers.push(setTimeout(() => ember.remove(), dur * 1000 + 200));
};

const startEmbers = () => {
  quakeIntervals.push(setInterval(() => {
    if (!quakeActive || !document.getElementById('quake-fire')) return;
    for (let i = 0; i < 4; i++) spawnEmber();
  }, 150));
};

const growFire = (amount) => {
  fireHeight = Math.min(fireHeight + amount, window.innerHeight * 0.7);
  const fire = document.getElementById('quake-fire');
  if (fire) fire.style.height = `${fireHeight}px`;
};

// Fire truck with water
const spawnFireTruck = () => {
  const truck = document.createElement('div');
  truck.className = 'quake-firetruck';
  truck.textContent = '💦💦💦 🚒';
  const bottom = 10 + Math.random() * 50;
  truck.style.cssText = `position:fixed;bottom:${bottom}px;right:-400px;font-size:45px;z-index:2147483647;transition:right 4s cubic-bezier(0.19, 1, 0.22, 1);filter:drop-shadow(0 0 10px rgba(0,100,255,0.5));pointer-events:none;`;
  document.documentElement.appendChild(truck);
  quakeTimers.push(setTimeout(() => { truck.style.right = '20px'; }, 100));
  quakeTimers.push(setTimeout(() => {
    truck.style.right = '-500px';
    quakeTimers.push(setTimeout(() => truck.remove(), 4500));
  }, 8000));
};

// Escalation — intensify EVERYTHING, no new scenes
const startEscalation = () => {
  let level = 0;
  quakeIntervals.push(setInterval(() => {
    if (!quakeActive) return;
    level++;
    // Ramp shake — by 30s this thing is shaking like crazy
    bodyShakeFactor = Math.min(bodyShakeFactor + 3, 40);
    letterShakeFactor = Math.min(letterShakeFactor + 1, 15);
    wordShakeFactor = Math.min(wordShakeFactor + 1, 15);
    // Ramp fall rates
    letterFallRate = Math.min(letterFallRate + 2, 30);
    cascadeRate = Math.min(cascadeRate + 1, 10);
    // Drop images
    document.querySelectorAll('img:not([data-falling])').forEach(img => {
      if (!img.closest('[data-falling]') && !img.closest('#best-search-overlay') && Math.random() < 0.4) makeElementFall(img);
    });
    // Grow fire
    growFire(20);
    // More fire trucks every 3 ticks
    if (level % 3 === 0) spawnFireTruck();
  }, 3000));
};

// === MAIN ORCHESTRATOR ===
const startEarthquake = (intensity) => {
  stopEarthquake();
  quakeActive = true;
  const totalMs = getQuakeDuration(intensity) * 1000;
  const at = (frac) => totalMs * frac;

  // Initialize loops
  atomizeText(500);
  startShakeLoop();
  startBodyShakeLoop();
  startFallLoop();

  // Stage 1 (0%): Letters shake, body starts trembling
  letterShakeFactor = 1.5;
  bodyShakeFactor = 1.5;

  // Stage 2 (1/7): Words shake, body shake builds
  quakeSchedule(at(1/7), () => {
    letterShakeFactor = 4;
    wordShakeFactor = 4;
    bodyShakeFactor = 4;
  });

  // Stage 3 (2/7): Pictures tilt, body shakes harder
  quakeSchedule(at(2/7), () => {
    tiltPictures();
    bodyShakeFactor = 7;
  });

  // Stage 4 (3/7): Letters fall from top, strong shake
  quakeSchedule(at(3/7), () => {
    letterFallRate = 3;
    bodyShakeFactor = 10;
  });

  // Stage 5 (4/7): Cascade — letters hit words, violent shake
  quakeSchedule(at(4/7), () => {
    letterFallRate = 8;
    cascadeRate = 2;
    bodyShakeFactor = 15;
  });

  // Stage 6 (5/7): Fire starts, shake intensifies
  quakeSchedule(at(5/7), () => {
    startFire(150);
    bodyShakeFactor = 20;
  });

  // Stage 7 (6/7): Fire truck
  quakeSchedule(at(6/7), () => {
    spawnFireTruck();
    bodyShakeFactor = 25;
  });

  // Stage 8 (100%): Escalation — everything goes to 11
  quakeSchedule(totalMs, () => startEscalation());
};

// Full cleanup and restoration
const stopEarthquake = () => {
  quakeActive = false;
  quakeTimers.forEach(t => clearTimeout(t));
  quakeIntervals.forEach(i => clearInterval(i));
  quakeTimers = [];
  quakeIntervals = [];
  letterShakeFactor = 0;
  wordShakeFactor = 0;
  bodyShakeFactor = 0;
  letterFallRate = 0;
  cascadeRate = 0;
  fireHeight = 0;
  document.body.style.transform = '';

  // Remove fire
  const fire = document.getElementById('quake-fire');
  if (fire) fire.remove();
  const fireStyle = document.getElementById('quake-fire-style');
  if (fireStyle) fireStyle.remove();

  // Remove embers
  document.querySelectorAll('.quake-ember').forEach(e => e.remove());

  // Remove fire trucks
  document.querySelectorAll('.quake-firetruck').forEach(t => t.remove());

  // Restore falling elements (reparented to <html>, move back to <body>)
  fallingElements.forEach(el => {
    el.style.cssText = '';
    delete el.dataset.falling;
    if (el.parentNode === document.documentElement) document.body.appendChild(el);
  });
  fallingElements = [];
  accumulatedStackHeight = 0;

  // Restore tilted images
  document.querySelectorAll('[data-quake-tilted]').forEach(img => {
    img.style.transform = ''; img.style.transition = ''; img.style.transformOrigin = '';
    delete img.dataset.quakeTilted;
  });

  // Unwrap quake-word spans
  document.querySelectorAll('.quake-word').forEach(w => {
    const parent = w.parentNode;
    if (parent) { while (w.firstChild) parent.insertBefore(w.firstChild, w); w.remove(); }
  });

  // Replace quake-atom spans with text nodes
  document.querySelectorAll('.quake-atom').forEach(a => {
    const parent = a.parentNode;
    if (parent) parent.replaceChild(document.createTextNode(a.textContent), a);
  });

  document.body.normalize();
};

// ============================================================
// --- Episode 3: Worst Magnifying Glass Ever ---
// ============================================================
const startMagnifier = (blur, zoom) => {
  stopMagnifier();
  isMagnifying = true;
  magnifierBlur = blur;
  magnifierZoom = zoom;
  blurOverlay = document.createElement('div');
  blurOverlay.id = 'magnify-blur-overlay';
  blurOverlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483640;pointer-events:none;backdrop-filter:blur(${magnifierBlur}px);transition:backdrop-filter 0.3s;`;
  document.documentElement.appendChild(blurOverlay);
  magnifierEl = document.createElement('div');
  magnifierEl.id = 'magnifier-lens';
  const size = 200;
  magnifierEl.style.cssText = `position:fixed;width:${size}px;height:${size}px;border:4px solid #fff;border-radius:50%;z-index:2147483641;pointer-events:none;overflow:hidden;box-shadow:0 0 20px rgba(0,0,0,0.5);display:none;background:#fff;`;
  magnifierClone = document.body.cloneNode(true);
  magnifierClone.style.transformOrigin = '0 0';
  magnifierClone.style.position = 'absolute';
  magnifierClone.style.width = document.body.scrollWidth + 'px';
  magnifierClone.style.height = document.body.scrollHeight + 'px';
  magnifierClone.style.filter = 'none';
  magnifierEl.appendChild(magnifierClone);
  document.documentElement.appendChild(magnifierEl);
  document.addEventListener('mousemove', handleMagnifierMove);
  document.addEventListener('scroll', handleMagnifierScroll, { passive: true });
};

const handleMagnifierMove = (e) => {
  if (!isMagnifying || !magnifierEl || !magnifierClone) return;
  lastClientX = e.clientX;
  lastClientY = e.clientY;
  updateMagnifierPosition();
};

const handleMagnifierScroll = () => {
  if (!isMagnifying || !magnifierEl || !magnifierClone) return;
  updateMagnifierPosition();
};

const updateMagnifierPosition = () => {
  magnifierEl.style.display = 'block';
  const size = 200;
  magnifierEl.style.left = `${lastClientX - size/2}px`;
  magnifierEl.style.top = `${lastClientY - size/2}px`;
  
  const pageX = lastClientX + window.scrollX;
  const pageY = lastClientY + window.scrollY;
  
  const moveX = -(pageX * magnifierZoom) + (size / 2);
  const moveY = -(pageY * magnifierZoom) + (size / 2);
  magnifierClone.style.transform = `scale(${magnifierZoom})`;
  magnifierClone.style.left = `${moveX}px`;
  magnifierClone.style.top = `${moveY}px`;
};

const updateMagnifier = (blur, zoom) => {
  if (blur !== undefined) { magnifierBlur = blur; if (blurOverlay) blurOverlay.style.backdropFilter = `blur(${magnifierBlur}px)`; }
  if (zoom !== undefined) magnifierZoom = zoom;
  if (isMagnifying) updateMagnifierPosition();
};

const stopMagnifier = () => {
  isMagnifying = false;
  document.removeEventListener('mousemove', handleMagnifierMove);
  document.removeEventListener('scroll', handleMagnifierScroll);
  if (blurOverlay) blurOverlay.remove();
  if (magnifierEl) magnifierEl.remove();
  blurOverlay = null; magnifierEl = null; magnifierClone = null;
};

// --- Episode 4: Worst AI Prompt Controller ---
window.addEventListener('keydown', (e) => {
  if (isInternalEvent) return;
  const isGemini = window.location.hostname.includes('gemini.google.com');
  const isChatGPT = window.location.hostname.includes('chatgpt.com') || window.location.hostname.includes('chat.openai.com');
  const isClaude = window.location.hostname.includes('claude.ai');
  const isEnabled = (isGemini && aiSettings.geminiEnabled) || (isChatGPT && aiSettings.chatgptEnabled) || (isClaude && aiSettings.claudeEnabled);
  if (!isEnabled) return;
  const isInput = e.target.id === 'prompt-textarea' || e.target.getAttribute('contenteditable') === 'true' || e.target.tagName === 'TEXTAREA';
  if (isInput && e.key === 'Enter') {
    if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.stopImmediatePropagation(); e.preventDefault();
      isInternalEvent = true;
      e.target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, shiftKey: true, bubbles: true, cancelable: true }));
      isInternalEvent = false;
    } else if (e.ctrlKey && !e.shiftKey) {
      e.stopImmediatePropagation(); e.preventDefault();
      isInternalEvent = true;
      e.target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, ctrlKey: false, bubbles: true, cancelable: true }));
      isInternalEvent = false;
    }
  }
}, true);

// --- Episode 1: Search Logic ---
const findMatches = (query) => {
  let found = [];
  if (!query || query.length < 1) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'gi');
  while (node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || (parent.checkVisibility && !parent.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(parent.tagName) || parent.closest('#best-search-overlay')) continue;
    let match;
    while ((match = regex.exec(node.textContent)) !== null) {
      const range = document.createRange();
      range.setStart(node, match.index); range.setEnd(node, match.index + query.length);
      const rects = range.getClientRects();
      if (rects.length > 0 && rects[0].width > 0) {
        found.push({ node, index: match.index, length: query.length, top: rects[0].top + window.scrollY, left: rects[0].left + window.scrollX });
      }
    }
  }
  found.sort((a, b) => Math.abs(a.top - b.top) < 15 ? a.left - b.left : a.top - b.top);
  matches = found;
};

const updateSpotlights = () => {
  if (!pathElement) return;
  const w = window.innerWidth, h = window.innerHeight;
  let d = `M 0 0 H ${w} V ${h} H 0 Z`;
  if (matches.length > 0) {
    const getRects = (m) => { const r = document.createRange(); r.setStart(m.node, m.index); r.setEnd(m.node, m.index + m.length); return Array.from(r.getClientRects()); };
    const addHole = (rect, scale) => {
      const p = 15 * scale, r = Math.max(rect.width + p, rect.height + p, 30) / 2, cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      d += ` M ${cx},${cy - r} A ${r},${r} 0 1,0 ${cx},${cy + r} A ${r},${r} 0 1,0 ${cx},${cy - r} Z`;
    };
    if (isMulti) matches.forEach((m, i) => getRects(m).forEach(r => addHole(r, i === currentIdx ? sizeScale * 1.2 : sizeScale * 0.8)));
    else if (currentIdx >= 0) { const rs = getRects(matches[currentIdx]); if (rs.length > 0) { rs.forEach(r => addHole(r, sizeScale)); scrollToMatch(rs[0]); } }
  }
  pathElement.setAttribute('d', d); pathElement.setAttribute('fill', `rgba(0,0,0,${dimness})`);
};

const scrollToMatch = (rect) => window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 2, behavior: 'smooth' });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  createOverlay();
  if (request.type === 'SEARCH') {
    isMulti = request.multi; dimness = request.dimness || 0.92; sizeScale = request.sizeScale || 1.8;
    findMatches(request.query); currentIdx = matches.length > 0 ? 0 : -1;
    if (matches.length > 0) { overlay.style.opacity = '1'; overlay.classList.add('active'); }
    else { overlay.style.opacity = '0'; overlay.classList.remove('active'); }
    updateSpotlights();
  } else if (request.type === 'UPDATE_PARAMS') {
    isMulti = request.multi ?? isMulti; dimness = request.dimness ?? dimness; sizeScale = request.sizeScale ?? sizeScale;
    if (overlay && overlay.classList.contains('active')) updateSpotlights();
  } else if (request.type === 'NAVIGATE') {
    if (matches.length > 0) {
      if (request.action === 'next') currentIdx = (currentIdx + 1) % matches.length;
      else if (request.action === 'prev') currentIdx = (currentIdx - 1 + matches.length) % matches.length;
      else if (request.action === 'first') currentIdx = 0;
      else if (request.action === 'last') currentIdx = matches.length - 1;
      updateSpotlights();
    }
  } else if (request.type === 'CLEAR') {
    if (overlay) { overlay.style.opacity = '0'; overlay.classList.remove('active'); }
    setTimeout(() => { if (pathElement) pathElement.setAttribute('d', ''); matches = []; currentIdx = -1; }, 400);
  } else if (request.type === 'QUAKE_START') { startEarthquake(request.intensity); }
  else if (request.type === 'QUAKE_STOP') { stopEarthquake(); }
  else if (request.type === 'MAGNIFY_START') { startMagnifier(request.blur, request.zoom); }
  else if (request.type === 'MAGNIFY_UPDATE') { updateMagnifier(request.blur, request.zoom); }
  else if (request.type === 'MAGNIFY_STOP') { stopMagnifier(); }
  else if (request.type === 'SWITCH_SCAN') { sendResponse({ categories: scanPageForSwitches() }); return true; }
  else if (request.type === 'SWITCH_TOGGLE') { toggleCategoryVisibility(request.categoryId, request.visible); }
  else if (request.type === 'SWITCH_RESET') { resetAllVisibility(); }
  else if (request.type === 'EP6_TOGGLE') {
    ep6Active = request.enabled;
    devModeActive = request.devMode;
    if (ep6Active) {
      chrome.storage.local.get(['ep6Styles'], (res) => {
        applyPersistedStyles(res.ep6Styles ? res.ep6Styles[window.location.hostname] : null);
      });
      if (devModeActive) enableDevModeListeners();
      else disableDevModeListeners();
    } else {
      applyPersistedStyles(null);
      disableDevModeListeners();
    }
  } else if (request.type === 'DEV_MODE_TOGGLE') {
    devModeActive = request.enabled;
    if (devModeActive) enableDevModeListeners();
    else disableDevModeListeners();
  } else if (request.type === 'EP6_RESET') {
    applyPersistedStyles(null);
  } else if (request.type === 'EP8_UPDATE') {
    applyEp8Settings(request.settings);
  }

  sendResponse({ stats: { current: currentIdx, total: matches.length } });
  return true;
});

// Throttled UI events
let scrollTimer, resizeTimer;
window.addEventListener('scroll', () => { if (overlay && overlay.classList.contains('active')) { clearTimeout(scrollTimer); scrollTimer = setTimeout(updateSpotlights, 10); } }, { passive: true });
window.addEventListener('resize', () => { if (overlay && overlay.classList.contains('active')) { clearTimeout(resizeTimer); resizeTimer = setTimeout(updateSpotlights, 50); } }, { passive: true });
