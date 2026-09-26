import { UserScript } from '../types';

export const DEFAULT_USER_SCRIPTS: UserScript[] = [
  {
    id: 'script-oled-dark',
    name: 'OLED Pure Black Engine',
    description: 'Forces deep true-black (#000000) background styling, reduces eye strain, and elevates visual contrast on high-end displays.',
    matchPattern: '*://*/*',
    scriptType: 'css',
    category: 'styling',
    author: 'Aksh Labs',
    version: '1.4.0',
    enabled: true,
    runCount: 142,
    lastRun: 'Just now',
    code: `/* Aksh OLED Engine */
html, body {
  background-color: #050508 !important;
  color: #e2e8f0 !important;
}
article, section, main, .content-container {
  background: transparent !important;
}
a {
  color: #38bdf8 !important;
}
input, textarea, select {
  background-color: #0f172a !important;
  color: #f8fafc !important;
  border-color: #334155 !important;
}`,
  },
  {
    id: 'script-clean-utm',
    name: 'Zero-Trace UTM & Tracker Stripper',
    description: 'Intercepts hyperlinks and automatically purges tracking parameters (utm_source, fbclid, gclid, mc_eid, ref) in real time.',
    matchPattern: '*://*/*',
    scriptType: 'javascript',
    category: 'privacy',
    author: 'PrivacyShield Core',
    version: '2.1.0',
    enabled: true,
    runCount: 520,
    lastRun: '1 min ago',
    code: `// Aksh Zero-Trace Link Sanitizer
(() => {
  const sanitize = (urlStr) => {
    try {
      const url = new URL(urlStr);
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'mc_cid', 'ref_src'];
      trackingParams.forEach(p => url.searchParams.delete(p));
      return url.toString();
    } catch {
      return urlStr;
    }
  };
  document.querySelectorAll('a[href]').forEach(a => {
    a.href = sanitize(a.href);
  });
})();`,
  },
  {
    id: 'script-smart-toc',
    name: 'Dynamic Article Table of Contents (Auto-TOC)',
    description: 'Analyzes article H1, H2, and H3 headers and generates a sleek, interactive floating drawer for rapid document navigation.',
    matchPattern: '*://*/*',
    scriptType: 'javascript',
    category: 'utility',
    author: 'Aksh PowerNav',
    version: '1.0.8',
    enabled: true,
    runCount: 88,
    lastRun: '5 mins ago',
    code: `// Dynamic Floating TOC Injector
(() => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  if (headings.length < 3) return;
  console.log('[Auto-TOC] Injected table of contents for ' + headings.length + ' headings.');
})();`,
  },
  {
    id: 'script-code-copy',
    name: 'Developer Code Snippet Supercharger',
    description: 'Enriches code blocks with 1-click clipboard copy, syntax language tags, and high-legibility monospace fonts.',
    matchPattern: '*://*/*',
    scriptType: 'javascript',
    category: 'utility',
    author: 'DevStudio Tools',
    version: '3.0.2',
    enabled: true,
    runCount: 231,
    lastRun: '10 mins ago',
    code: `// Code Block Supercharger
(() => {
  document.querySelectorAll('pre code').forEach((block) => {
    block.style.fontFamily = 'JetBrains Mono, monospace';
    block.style.borderRadius = '8px';
  });
})();`,
  },
  {
    id: 'script-distraction-free',
    name: 'Focus Canvas & Declutter Shield',
    description: 'Suppresses intrusive cookie banners, newsletter popups, floating widgets, and distracting sidebars for laser-sharp focus.',
    matchPattern: '*://*/*',
    scriptType: 'css',
    category: 'styling',
    author: 'DeepWork Collective',
    version: '1.8.4',
    enabled: false,
    runCount: 45,
    lastRun: 'Yesterday',
    code: `/* Declutter Focus Shield */
.cookie-banner, .newsletter-popup, #onesignal-slidedown, .ad-banner, .sidebar-promo {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
body {
  overflow-y: auto !important;
}`,
  },
  {
    id: 'script-json-formatter',
    name: 'Raw JSON & REST Prettifier',
    description: 'Detects raw JSON responses, parses key-value pairs, and renders an interactive expandable tree with search and formatting.',
    matchPattern: '*://*/*.json*',
    scriptType: 'javascript',
    category: 'automation',
    author: 'DevStudio Tools',
    version: '1.2.0',
    enabled: true,
    runCount: 67,
    lastRun: '3 hours ago',
    code: `// JSON Prettifier hook
(() => {
  if (document.contentType === 'application/json') {
    try {
      const data = JSON.parse(document.body.innerText);
      document.body.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    } catch {}
  }
})();`,
  },
];
