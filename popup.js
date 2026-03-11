document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const body = document.body;
  const mainContainer = document.getElementById('mainContainer');
  const themeToggle = document.getElementById('themeToggle');
  const compactToggle = document.getElementById('compactToggle');
  const episodeSelector = document.getElementById('episodeSelector');
  const footerSlogan = document.getElementById('footerSlogan');

  // --- Utility: Get Current Hostname ---
  const getHostname = (callback) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          callback(url.hostname);
        } catch (e) { callback(null); }
      } else { callback(null); }
    });
  };

  // --- Theme Management ---
  const applyTheme = (theme) => {
    if (theme === 'light') body.classList.add('light-theme');
    else body.classList.remove('light-theme');
    chrome.storage.local.set({ theme });
  };

  const initTheme = () => {
    chrome.storage.local.get(['theme'], (res) => {
      if (res.theme) applyTheme(res.theme);
      else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
      }
    });
  };

  themeToggle.addEventListener('click', () => {
    const isLight = body.classList.contains('light-theme');
    applyTheme(isLight ? 'dark' : 'light');
  });

  // --- Compact Mode Management ---
  const applyCompactMode = (isCompact) => {
    if (isCompact) mainContainer.classList.add('compact-view');
    else mainContainer.classList.remove('compact-view');
    chrome.storage.local.set({ isCompact });
  };

  compactToggle.addEventListener('click', () => {
    const isCurrentlyCompact = mainContainer.classList.contains('compact-view');
    applyCompactMode(!isCurrentlyCompact);
  });

  // --- Episode Management ---
  const switchEpisode = (episodeId, save = true) => {
    document.querySelectorAll('.episode-content').forEach(el => el.classList.remove('active'));
    const activeEpisode = document.getElementById(episodeId);
    if (activeEpisode) activeEpisode.classList.add('active');

    const slogans = {
      episode1: "The worst visual search experience.",
      episode2: "The worst physical website destruction.",
      episode3: "The worst magnifying glass experience.",
      episode4: "The worst AI conversation delayer.",
      episode5: "The worst visibility control hub.",
      episode6: "The worst developer console experience.",
      episode7: "The worst URL breakdown.",
      episode8: "The worst aesthetic choices ever."
    };
    footerSlogan.textContent = slogans[episodeId] || "The worst extension hub.";
    
    if (save) chrome.storage.local.set({ lastEpisode: episodeId });

    // Sync compact dropdown active state
    document.querySelectorAll('.compact-dropdown-item').forEach(item => {
      item.classList.toggle('active', item.dataset.episode === episodeId);
    });
  };

  episodeSelector.addEventListener('change', (e) => switchEpisode(e.target.value));

  // --- Compact Dropdown ---
  document.getElementById('compactDropdown').addEventListener('click', (e) => {
    const item = e.target.closest('.compact-dropdown-item');
    if (item) {
      const episodeId = item.dataset.episode;
      episodeSelector.value = episodeId;
      switchEpisode(episodeId);
    }
  });

  // --- Settings Persistence & Initialization ---
  const loadSettings = () => {
    const keys = [
      'lastEpisode', 'isCompact', 'multiSpotlight', 'dimness', 'sizeScale', 
      'quakeIntensity', 'magnifyActive', 'magnifierBlur', 'magnifierZoom',
      'geminiEnabled', 'chatgptEnabled', 'claudeEnabled', 'urlSwitchStates',
      'episode6Enabled', 'devModeEnabled', 'ep8Settings', 'ep8CustomThemes'
    ];

    chrome.storage.local.get(keys, (res) => {
      if (res.lastEpisode) {
        episodeSelector.value = res.lastEpisode;
        switchEpisode(res.lastEpisode, false);
      }

      if (res.isCompact !== undefined) applyCompactMode(res.isCompact);

      if (res.multiSpotlight !== undefined) document.getElementById('multiSpotlight').checked = res.multiSpotlight;
      if (res.dimness !== undefined) {
        document.getElementById('dimnessSlider').value = res.dimness * 100;
        document.getElementById('dimnessValue').textContent = `${Math.round(res.dimness * 100)}%`;
      }
      if (res.sizeScale !== undefined) {
        document.getElementById('sizeSlider').value = res.sizeScale * 10;
        document.getElementById('sizeValue').textContent = `${res.sizeScale.toFixed(1)}x`;
      }
      if (res.quakeIntensity !== undefined) {
        document.getElementById('quakeSlider').value = res.quakeIntensity;
        updateQuakeLabel(res.quakeIntensity);
      }
      
      if (res.magnifyActive !== undefined) document.getElementById('magnifyToggle').checked = res.magnifyActive;
      if (res.magnifierBlur !== undefined) {
        document.getElementById('blurSlider').value = res.magnifierBlur;
        document.getElementById('blurValue').textContent = `${res.magnifierBlur}px`;
      }
      if (res.magnifierZoom !== undefined) {
        document.getElementById('zoomSlider').value = res.magnifierZoom * 10;
        document.getElementById('zoomValue').textContent = `${res.magnifierZoom.toFixed(1)}x`;
      }

      document.getElementById('geminiToggle').checked = res.geminiEnabled || false;
      document.getElementById('chatgptToggle').checked = res.chatgptEnabled || false;
      document.getElementById('claudeToggle').checked = res.claudeEnabled || false;

      // Episode 6 Initialization
      const ep6Toggle = document.getElementById('episode6Toggle');
      const devModeToggle = document.getElementById('devModeToggle');
      const devModeGroup = document.getElementById('devModeGroup');

      ep6Toggle.checked = res.episode6Enabled || false;
      devModeToggle.checked = res.devModeEnabled || false;
      
      if (ep6Toggle.checked) {
        devModeGroup.style.opacity = '1';
        devModeGroup.style.pointerEvents = 'auto';
      }

      // Load Custom Themes
      if (res.ep8CustomThemes) {
        const group = document.getElementById('ep8CustomThemesGroup');
        if (group && Object.keys(res.ep8CustomThemes).length > 0) {
            group.textContent = '';
            for (const themeName of Object.keys(res.ep8CustomThemes)) {
                const opt = document.createElement('option');
                opt.value = `custom_${themeName}`;
                opt.textContent = themeName;
                group.appendChild(opt);
            }
        }
      }

      getHostname((hostname) => {
        if (hostname && res.urlSwitchStates && res.urlSwitchStates[hostname]) {
          renderSwitches(res.urlSwitchStates[hostname], hostname);
        }
        if (hostname && res.ep8Settings && res.ep8Settings[hostname]) {
          const s = res.ep8Settings[hostname];
          document.getElementById('ep8ThemeSelect').value = s.theme || 'none';
          document.getElementById('ep8ForceDark').checked = s.forceDark || false;
          document.getElementById('ep8Brightness').value = s.brightness !== undefined ? s.brightness : 100;
          document.getElementById('ep8Contrast').value = s.contrast !== undefined ? s.contrast : 100;
          document.getElementById('ep8Hue').value = s.hue !== undefined ? s.hue : 0;
          document.getElementById('ep8Sepia').value = s.sepia !== undefined ? s.sepia : 0;
          
          if (document.getElementById('ep8FontFamily')) {
              document.getElementById('ep8FontFamily').value = s.fontFamily || '';
              document.getElementById('ep8FontSize').value = s.fontSize !== undefined ? s.fontSize : 100;
              document.getElementById('ep8FontColor').value = s.fontColor || '#000000';
              document.getElementById('ep8FontColorEnable').checked = s.fontColorEnable || false;
              document.getElementById('ep8FontSizeVal').textContent = `${s.fontSize !== undefined ? s.fontSize : 100}%`;
          }

          document.getElementById('ep8BrightnessVal').textContent = `${s.brightness !== undefined ? s.brightness : 100}%`;
          document.getElementById('ep8ContrastVal').textContent = `${s.contrast !== undefined ? s.contrast : 100}%`;
          document.getElementById('ep8HueVal').textContent = `${s.hue !== undefined ? s.hue : 0}deg`;
          document.getElementById('ep8SepiaVal').textContent = `${s.sepia !== undefined ? s.sepia : 0}%`;
        }
      });

      sendMessageToContentScript({ type: 'GET_STATS' }); 
    });
  };

  // --- Messaging ---
  const sendMessageToContentScript = (message, callback) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          if (callback) callback(response);
          if (response && response.stats) updateUI(response.stats);
        });
      }
    });
  };

  const updateUI = (stats) => {
    const navGroup = document.getElementById('navGroup');
    if (stats.total > 0) {
      navGroup.classList.remove('hidden');
      document.getElementById('currentIdx').textContent = stats.current + 1;
      document.getElementById('totalMatches').textContent = stats.total;
    } else {
      navGroup.classList.add('hidden');
    }
  };

  // --- Episode 1 Events ---
  const performSearch = () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      sendMessageToContentScript({
        type: 'SEARCH',
        query: query,
        multi: document.getElementById('multiSpotlight').checked,
        dimness: document.getElementById('dimnessSlider').value / 100,
        sizeScale: document.getElementById('sizeSlider').value / 10
      });
    }
  };
  document.getElementById('searchBtn').addEventListener('click', performSearch);
  document.getElementById('searchInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
  document.getElementById('multiSpotlight').addEventListener('change', (e) => {
    chrome.storage.local.set({ multiSpotlight: e.target.checked });
    sendMessageToContentScript({ type: 'UPDATE_PARAMS', multi: e.target.checked });
  });
  document.getElementById('dimnessSlider').addEventListener('input', (e) => {
    const val = e.target.value / 100;
    document.getElementById('dimnessValue').textContent = `${e.target.value}%`;
    chrome.storage.local.set({ dimness: val });
    sendMessageToContentScript({ type: 'UPDATE_PARAMS', dimness: val });
  });
  document.getElementById('sizeSlider').addEventListener('input', (e) => {
    const val = e.target.value / 10;
    document.getElementById('sizeValue').textContent = `${val.toFixed(1)}x`;
    chrome.storage.local.set({ sizeScale: val });
    sendMessageToContentScript({ type: 'UPDATE_PARAMS', sizeScale: val });
  });
  document.getElementById('firstBtn').addEventListener('click', () => sendMessageToContentScript({ type: 'NAVIGATE', action: 'first' }));
  document.getElementById('prevBtn').addEventListener('click', () => sendMessageToContentScript({ type: 'NAVIGATE', action: 'prev' }));
  document.getElementById('nextBtn').addEventListener('click', () => sendMessageToContentScript({ type: 'NAVIGATE', action: 'next' }));
  document.getElementById('lastBtn').addEventListener('click', () => sendMessageToContentScript({ type: 'NAVIGATE', action: 'last' }));
  document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('navGroup').classList.add('hidden');
    sendMessageToContentScript({ type: 'CLEAR' });
  });
  document.getElementById('clearBtnCompact').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('navGroup').classList.add('hidden');
    sendMessageToContentScript({ type: 'CLEAR' });
  });

  // --- Episode 2 Events ---
  const updateQuakeLabel = (val) => {
    let label = "Medium";
    if (val < 4) label = "Mild";
    else if (val > 7) label = "CATASTROPHIC";
    document.getElementById('quakeValue').textContent = label;
  };
  document.getElementById('quakeSlider').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    updateQuakeLabel(val);
    chrome.storage.local.set({ quakeIntensity: val });
  });
  let quakeActive = false;
  const quakeToggleBtn = document.getElementById('quakeToggleBtn');
  quakeToggleBtn.addEventListener('click', () => {
    quakeActive = !quakeActive;
    if (quakeActive) {
      quakeToggleBtn.textContent = 'Stop & Rebuild';
      quakeToggleBtn.classList.remove('primary-btn-alt');
      quakeToggleBtn.classList.add('secondary-btn');
      sendMessageToContentScript({ type: 'QUAKE_START', intensity: parseInt(document.getElementById('quakeSlider').value) });
    } else {
      quakeToggleBtn.textContent = 'Release the Quake';
      quakeToggleBtn.classList.remove('secondary-btn');
      quakeToggleBtn.classList.add('primary-btn-alt');
      sendMessageToContentScript({ type: 'QUAKE_STOP' });
    }
  });

  // --- Episode 3 Events ---
  const magnifyToggle = document.getElementById('magnifyToggle');
  const blurSlider = document.getElementById('blurSlider');
  const zoomSlider = document.getElementById('zoomSlider');

  magnifyToggle.addEventListener('change', (e) => {
    const active = e.target.checked;
    chrome.storage.local.set({ magnifyActive: active });
    if (active) {
      sendMessageToContentScript({ type: 'MAGNIFY_START', blur: parseInt(blurSlider.value), zoom: zoomSlider.value / 10 });
    } else {
      sendMessageToContentScript({ type: 'MAGNIFY_STOP' });
    }
  });

  blurSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('blurValue').textContent = `${val}px`;
    chrome.storage.local.set({ magnifierBlur: val });
    sendMessageToContentScript({ type: 'MAGNIFY_UPDATE', blur: val });
  });

  zoomSlider.addEventListener('input', (e) => {
    const val = e.target.value / 10;
    document.getElementById('zoomValue').textContent = `${val.toFixed(1)}x`;
    chrome.storage.local.set({ magnifierZoom: val });
    sendMessageToContentScript({ type: 'MAGNIFY_UPDATE', zoom: val });
  });

  // --- Episode 4 Events ---
  document.getElementById('geminiToggle').addEventListener('change', (e) => chrome.storage.local.set({ geminiEnabled: e.target.checked }));
  document.getElementById('chatgptToggle').addEventListener('change', (e) => chrome.storage.local.set({ chatgptEnabled: e.target.checked }));
  document.getElementById('claudeToggle').addEventListener('change', (e) => chrome.storage.local.set({ claudeEnabled: e.target.checked }));

  // --- Episode 5 Events ---
  const switchesList = document.getElementById('switchesList');
  const scanBtn = document.getElementById('scanSwitchesBtn');
  const resetSwitchesBtn = document.getElementById('resetSwitchesBtn');

  const renderSwitches = (categories, hostname) => {
    switchesList.textContent = '';
    if (Object.keys(categories).length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Nothing detected.';
      switchesList.appendChild(empty);
      return;
    }

    for (const [id, info] of Object.entries(categories)) {
      const group = document.createElement('div');
      group.className = 'toggle-group';
      
      const label = document.createElement('label');
      label.className = 'switch';
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `switch-${id}`;
      input.checked = !info.hidden;
      
      const slider = document.createElement('span');
      slider.className = 'slider round';
      
      label.appendChild(input);
      label.appendChild(slider);
      
      const text = document.createElement('span');
      text.textContent = `${info.label} (${info.count})`;
      
      group.appendChild(label);
      group.appendChild(text);
      switchesList.appendChild(group);

      input.addEventListener('change', (e) => {
        const isVisible = e.target.checked;
        sendMessageToContentScript({ type: 'SWITCH_TOGGLE', categoryId: id, visible: isVisible });
        
        chrome.storage.local.get(['urlSwitchStates'], (res) => {
          const states = res.urlSwitchStates || {};
          if (states[hostname] && states[hostname][id]) {
            states[hostname][id].hidden = !isVisible;
            chrome.storage.local.set({ urlSwitchStates: states });
          }
        });
      });
    }
  };

  scanBtn.addEventListener('click', () => {
    scanBtn.textContent = "Scanning...";
    sendMessageToContentScript({ type: 'SWITCH_SCAN' }, (response) => {
      scanBtn.textContent = "Scan Page";
      if (response && response.categories) {
        getHostname((hostname) => {
          if (hostname) {
            chrome.storage.local.get(['urlSwitchStates'], (res) => {
              const states = res.urlSwitchStates || {};
              states[hostname] = response.categories;
              chrome.storage.local.set({ urlSwitchStates: states });
              renderSwitches(response.categories, hostname);
            });
          }
        });
      }
    });
  });

  resetSwitchesBtn.addEventListener('click', () => {
    sendMessageToContentScript({ type: 'SWITCH_RESET' });
    getHostname((hostname) => {
      if (hostname) {
        chrome.storage.local.get(['urlSwitchStates'], (res) => {
          const states = res.urlSwitchStates || {};
          delete states[hostname];
          chrome.storage.local.set({ urlSwitchStates: states });
          switchesList.textContent = '';
          const empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.textContent = 'All restored.';
          switchesList.appendChild(empty);
        });
      }
    });
  });

  // --- Episode 6 Events ---
  const ep6Toggle = document.getElementById('episode6Toggle');
  const devModeToggle = document.getElementById('devModeToggle');
  const devModeGroup = document.getElementById('devModeGroup');
  const resetStylesBtn = document.getElementById('resetStylesBtn');

  ep6Toggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ episode6Enabled: enabled });
    
    if (enabled) {
      devModeGroup.style.opacity = '1';
      devModeGroup.style.pointerEvents = 'auto';
    } else {
      devModeGroup.style.opacity = '0.5';
      devModeGroup.style.pointerEvents = 'none';
      devModeToggle.checked = false;
      chrome.storage.local.set({ devModeEnabled: false });
    }
    
    sendMessageToContentScript({ 
      type: 'EP6_TOGGLE', 
      enabled, 
      devMode: devModeToggle.checked 
    });
  });

  devModeToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ devModeEnabled: enabled });
    sendMessageToContentScript({ 
      type: 'DEV_MODE_TOGGLE', 
      enabled 
    });
  });

  resetStylesBtn.addEventListener('click', () => {
    getHostname((hostname) => {
      if (hostname) {
        chrome.storage.local.get(['ep6Styles'], (res) => {
          const styles = res.ep6Styles || {};
          delete styles[hostname];
          chrome.storage.local.set({ ep6Styles: styles });
          sendMessageToContentScript({ type: 'EP6_RESET' });
        });
      }
    });
  });

  // --- Episode 7: URL Parser ---
  const parseUrlBtn = document.getElementById('parseUrlBtn');
  const urlParsedContainer = document.getElementById('urlParsedContainer');
  const urlCopyGroup = document.getElementById('urlCopyGroup');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const copyFormatSelect = document.getElementById('copyFormatSelect');
  let currentParsedData = [];

  const copyTextToClipboard = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = originalText; }, 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const renderParsedUrl = (urlStr) => {
    urlParsedContainer.textContent = '';
    currentParsedData = [];
    let url;
    try {
      url = new URL(urlStr);
    } catch (e) {
      const invalid = document.createElement('div');
      invalid.className = 'empty-state';
      invalid.textContent = 'Invalid URL';
      urlParsedContainer.appendChild(invalid);
      urlParsedContainer.classList.remove('hidden');
      if (urlCopyGroup) urlCopyGroup.classList.add('hidden');
      return;
    }

    const addField = (label, value) => {
      if (!value) return;
      currentParsedData.push({ label, value });
      const row = document.createElement('div');
      row.className = 'url-field-row';
      
      const labelDiv = document.createElement('div');
      labelDiv.className = 'url-field-label';
      labelDiv.textContent = label;
      
      const valueGroup = document.createElement('div');
      valueGroup.className = 'url-field-value-group';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'url-field-input';
      input.value = value;
      input.readOnly = true;
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'url-field-copy-btn';
      copyBtn.textContent = 'Copy';
      
      valueGroup.appendChild(input);
      valueGroup.appendChild(copyBtn);
      
      row.appendChild(labelDiv);
      row.appendChild(valueGroup);

      copyBtn.addEventListener('click', (e) => {
        copyTextToClipboard(value, e.target);
      });
      input.addEventListener('click', (e) => e.target.select());
      urlParsedContainer.appendChild(row);
    };

    addField('Full URL', url.href);
    addField('Origin', url.origin);
    addField('Protocol', url.protocol);
    addField('Hostname', url.hostname);
    if (url.port) addField('Port', url.port);
    addField('Pathname', url.pathname);
    if (url.hash) addField('Hash', url.hash);

    // Smart Detection
    const isYouTube = url.hostname.includes('youtube.com');
    const isGoogleSheets = url.hostname.includes('docs.google.com') && url.pathname.includes('/spreadsheets/d/');
    const isGoogleDrive = url.hostname.includes('drive.google.com') && url.pathname.includes('/folders/');

    if (isGoogleSheets) {
      const match = url.pathname.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) addField('Sheet Document ID', match[1]);
    }
    if (isGoogleDrive) {
      const match = url.pathname.match(/\/folders\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) addField('Drive Folder ID', match[1]);
    }

    url.searchParams.forEach((val, key) => {
      let label = `Query: ${key}`;
      if (isYouTube) {
        if (key === 'v') label = 'Video ID (v)';
        else if (key === 't') label = 'Start Time (t)';
      }
      addField(label, val);
    });

    urlParsedContainer.classList.remove('hidden');
    if (urlCopyGroup) urlCopyGroup.classList.remove('hidden');
  };

  if (parseUrlBtn) {
    parseUrlBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          renderParsedUrl(tabs[0].url);
        }
      });
    });
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      if (currentParsedData.length === 0) return;
      const format = copyFormatSelect.value;
      let textToCopy = '';

      if (format === 'markdown') {
        textToCopy = '| Field | Value |\n|---|---|\n' + currentParsedData.map(d => `| ${d.label} | \`${d.value}\` |`).join('\n');
      } else if (format === 'csv') {
        textToCopy = '"Field","Value"\n' + currentParsedData.map(d => `"${d.label.replace(/"/g, '""')}","${d.value.replace(/"/g, '""')}"`).join('\n');
      } else if (format === 'tsv') {
        textToCopy = 'Field\tValue\n' + currentParsedData.map(d => `${d.label}\t${d.value}`).join('\n');
      } else if (format === 'html') {
        textToCopy = '<table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>\n' + 
                     currentParsedData.map(d => `<tr><td>${d.label}</td><td>${d.value}</td></tr>`).join('\n') + 
                     '\n</tbody></table>';
      }

      copyTextToClipboard(textToCopy, copyAllBtn);
    });
  }

  // --- Episode 8: Theme Selector ---
  const updateEp8 = () => {
    const themeSelect = document.getElementById('ep8ThemeSelect');
    if (!themeSelect) return;
    let theme = themeSelect.value;
    let forceDark = document.getElementById('ep8ForceDark').checked;
    let brightness = document.getElementById('ep8Brightness').value;
    let contrast = document.getElementById('ep8Contrast').value;
    let hue = document.getElementById('ep8Hue').value;
    let sepia = document.getElementById('ep8Sepia').value;
    
    let fontFamily = document.getElementById('ep8FontFamily').value;
    let fontSize = document.getElementById('ep8FontSize').value;
    let fontColor = document.getElementById('ep8FontColor').value;
    let fontColorEnable = document.getElementById('ep8FontColorEnable').checked;

    document.getElementById('ep8BrightnessVal').textContent = `${brightness}%`;
    document.getElementById('ep8ContrastVal').textContent = `${contrast}%`;
    document.getElementById('ep8HueVal').textContent = `${hue}deg`;
    document.getElementById('ep8SepiaVal').textContent = `${sepia}%`;
    document.getElementById('ep8FontSizeVal').textContent = `${fontSize}%`;

    const settings = { theme, forceDark, brightness, contrast, hue, sepia, fontFamily, fontSize, fontColor, fontColorEnable };

    // If selecting a custom theme, fetch it and apply to settings but don't overwrite the inputs immediately
    // Wait, applying custom theme should overwrite the UI inputs too.
    if (theme.startsWith('custom_')) {
      const themeName = theme.replace('custom_', '');
      chrome.storage.local.get(['ep8CustomThemes'], (res) => {
          if (res.ep8CustomThemes && res.ep8CustomThemes[themeName]) {
              const cs = res.ep8CustomThemes[themeName];
              settings.forceDark = cs.forceDark;
              settings.brightness = cs.brightness;
              settings.contrast = cs.contrast;
              settings.hue = cs.hue;
              settings.sepia = cs.sepia;
              settings.fontFamily = cs.fontFamily;
              settings.fontSize = cs.fontSize;
              settings.fontColor = cs.fontColor;
              settings.fontColorEnable = cs.fontColorEnable;

              // Update UI to match
              document.getElementById('ep8ForceDark').checked = cs.forceDark;
              document.getElementById('ep8Brightness').value = cs.brightness;
              document.getElementById('ep8Contrast').value = cs.contrast;
              document.getElementById('ep8Hue').value = cs.hue;
              document.getElementById('ep8Sepia').value = cs.sepia;
              document.getElementById('ep8FontFamily').value = cs.fontFamily;
              document.getElementById('ep8FontSize').value = cs.fontSize;
              document.getElementById('ep8FontColor').value = cs.fontColor;
              document.getElementById('ep8FontColorEnable').checked = cs.fontColorEnable;

              document.getElementById('ep8BrightnessVal').textContent = `${cs.brightness}%`;
              document.getElementById('ep8ContrastVal').textContent = `${cs.contrast}%`;
              document.getElementById('ep8HueVal').textContent = `${cs.hue}deg`;
              document.getElementById('ep8SepiaVal').textContent = `${cs.sepia}%`;
              document.getElementById('ep8FontSizeVal').textContent = `${cs.fontSize}%`;

              saveEp8Settings(settings);
          }
      });
      return; // saveEp8Settings will be called inside
    }

    saveEp8Settings(settings);
  };

  const saveEp8Settings = (settings) => {
    getHostname((hostname) => {
      if (hostname) {
        chrome.storage.local.get(['ep8Settings'], (res) => {
          const allSettings = res.ep8Settings || {};
          allSettings[hostname] = settings;
          chrome.storage.local.set({ ep8Settings: allSettings });
        });
      }
    });
    sendMessageToContentScript({ type: 'EP8_UPDATE', settings });
  };

  const ep8Inputs = ['ep8ThemeSelect', 'ep8ForceDark', 'ep8Brightness', 'ep8Contrast', 'ep8Hue', 'ep8Sepia', 'ep8FontFamily', 'ep8FontSize', 'ep8FontColor', 'ep8FontColorEnable'];
  if (document.getElementById('ep8ThemeSelect')) {
    ep8Inputs.forEach(id => {
      const el = document.getElementById(id);
      if(el) {
          el.addEventListener('input', updateEp8);
          if (id === 'ep8ThemeSelect' || id === 'ep8ForceDark' || id === 'ep8FontColorEnable' || id === 'ep8FontFamily') {
              el.addEventListener('change', updateEp8);
          }
      }
    });
    
    document.getElementById('ep8ResetBtn').addEventListener('click', () => {
        document.getElementById('ep8ThemeSelect').value = 'none';
        document.getElementById('ep8ForceDark').checked = false;
        document.getElementById('ep8Brightness').value = 100;
        document.getElementById('ep8Contrast').value = 100;
        document.getElementById('ep8Hue').value = 0;
        document.getElementById('ep8Sepia').value = 0;
        document.getElementById('ep8FontFamily').value = '';
        document.getElementById('ep8FontSize').value = 100;
        document.getElementById('ep8FontColor').value = '#000000';
        document.getElementById('ep8FontColorEnable').checked = false;
        updateEp8();
    });

    document.getElementById('ep8SaveThemeBtn').addEventListener('click', () => {
        const nameInput = document.getElementById('ep8CustomThemeName');
        const themeName = nameInput.value.trim();
        if (!themeName) return;

        const cs = {
            theme: 'none', // Base is always none for custom saves, just variables
            forceDark: document.getElementById('ep8ForceDark').checked,
            brightness: document.getElementById('ep8Brightness').value,
            contrast: document.getElementById('ep8Contrast').value,
            hue: document.getElementById('ep8Hue').value,
            sepia: document.getElementById('ep8Sepia').value,
            fontFamily: document.getElementById('ep8FontFamily').value,
            fontSize: document.getElementById('ep8FontSize').value,
            fontColor: document.getElementById('ep8FontColor').value,
            fontColorEnable: document.getElementById('ep8FontColorEnable').checked
        };

        chrome.storage.local.get(['ep8CustomThemes'], (res) => {
            const themes = res.ep8CustomThemes || {};
            themes[themeName] = cs;
            chrome.storage.local.set({ ep8CustomThemes: themes }, () => {
                nameInput.value = '';
                // Add to dropdown
                const group = document.getElementById('ep8CustomThemesGroup');
                const placeholder = document.getElementById('ep8NoCustomYet');
                if (placeholder) placeholder.remove();
                
                const existingOpt = group.querySelector(`option[value="custom_${themeName}"]`);
                if (!existingOpt) {
                    const opt = document.createElement('option');
                    opt.value = `custom_${themeName}`;
                    opt.textContent = themeName;
                    group.appendChild(opt);
                }
                document.getElementById('ep8ThemeSelect').value = `custom_${themeName}`;
                updateEp8();
            });
        });
    });
  }

  initTheme();
  loadSettings();
});
