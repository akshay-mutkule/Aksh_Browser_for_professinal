import { Bookmark, HistoryItem, AINote, PageContentType } from '../types';
import { SAMPLE_WEBSITES } from '../data/mockWebsites';

export interface SearchResolution {
  isAvailableInWeb: boolean;
  targetUrl: string;
  title: string;
  sourceType:
    | 'internal-view'
    | 'sample-site'
    | 'bookmark'
    | 'history'
    | 'note'
    | 'bang'
    | 'google-redirect'
    | 'external-url';
  badge?: string;
  description?: string;
  query?: string;
  matchedLabel?: string;
}

export interface InternalToolRoute {
  keywords: string[];
  url: string;
  title: string;
  contentType: PageContentType;
  description: string;
}

export const INTERNAL_TOOL_ROUTES: InternalToolRoute[] = [
  {
    keywords: ['new tab', 'newtab', 'home', 'start', 'speed dial', 'homepage'],
    url: 'aksh://newtab',
    title: 'New Tab',
    contentType: 'newtab',
    description: 'New tab launcher and intelligence briefing',
  },
  {
    keywords: ['settings', 'preferences', 'options', 'configuration', 'config', 'theme'],
    url: 'aksh://settings',
    title: 'Settings',
    contentType: 'settings',
    description: 'Browser settings, themes, and preferences',
  },
  {
    keywords: ['bookmarks', 'bookmark', 'saved', 'favorites', 'stars'],
    url: 'aksh://bookmarks',
    title: 'Bookmarks Manager',
    contentType: 'bookmarks',
    description: 'Saved bookmarks and web collections',
  },
  {
    keywords: ['history', 'recent', 'visited', 'log'],
    url: 'aksh://history',
    title: 'Browsing History',
    contentType: 'history',
    description: 'Recent browsing history and visited pages',
  },
  {
    keywords: ['notes', 'ai notes', 'notebook', 'scratchpad', 'cornell notes', 'memo'],
    url: 'aksh://notes',
    title: 'AI Notes',
    contentType: 'notes',
    description: 'AI-assisted notes and knowledge base',
  },
  {
    keywords: ['scripts', 'script', 'userscripts', 'userscript', 'tampermonkey', 'custom css', 'injector', 'stylesheet'],
    url: 'aksh://scripts',
    title: 'Userscript & Style Engine',
    contentType: 'scripts',
    description: 'Live JavaScript and CSS injection studio',
  },
  {
    keywords: ['security', 'shield', 'quantum', 'cipher', 'crypto', 'tls', 'certificate', 'kyber'],
    url: 'aksh://security',
    title: 'Quantum Security & Shield',
    contentType: 'security',
    description: 'Live cryptographic cipher and threat defense',
  },
  {
    keywords: ['agent', 'ai agent', 'autonomous', 'auto', 'agent studio', 'copilot', 'crawler'],
    url: 'aksh://agent',
    title: 'Autonomous Agent Studio',
    contentType: 'agent',
    description: 'Autonomous web agent command center',
  },
  {
    keywords: ['tasks', 'task manager', 'processes', 'memory saver', 'tabs manager', 'ram'],
    url: 'aksh://tasks',
    title: 'Task Manager',
    contentType: 'tasks',
    description: 'Browser tab processes and memory management',
  },
  {
    keywords: ['reading list', 'read later', 'reading', 'readlist', 'articles to read'],
    url: 'aksh://reading_list',
    title: 'Reading List',
    contentType: 'reading_list',
    description: 'Saved articles for distraction-free offline reading',
  },
  {
    keywords: ['extensions', 'extension', 'addons', 'add-ons', 'plugins', 'store'],
    url: 'aksh://extensions',
    title: 'Extensions Hub',
    contentType: 'extensions',
    description: 'Browser add-ons and extension management',
  },
  {
    keywords: ['devtools', 'inspect', 'dom inspector', 'console', 'elements', 'debugger'],
    url: 'aksh://devtools',
    title: 'AI DevTools',
    contentType: 'devtools',
    description: 'AI DOM inspector and network diagnostics',
  },
  {
    keywords: ['research', 'deep research', 'ai research', 'synthesize', 'literature'],
    url: 'aksh://research',
    title: 'AI Deep Research',
    contentType: 'research',
    description: 'Autonomous multi-source deep research',
  },
  {
    keywords: ['mindmap', 'concept mindmap', 'brainstorm', 'knowledge graph', 'visualize'],
    url: 'aksh://mindmap',
    title: 'AI Concept Mindmap',
    contentType: 'mindmap',
    description: 'Interactive concept mindmap generator',
  },
  {
    keywords: ['pdf', 'pdf reader', 'transformer paper', 'attention is all you need', 'arxiv'],
    url: 'aksh://pdf/transformer-paper',
    title: 'Attention Is All You Need (PDF)',
    contentType: 'pdf',
    description: 'Native PDF cognition and paper viewer',
  },
  {
    keywords: ['quantum paper', 'quantum primer', 'quantum computing pdf', 'qubit paper'],
    url: 'aksh://pdf/quantum-computing-primer',
    title: 'Quantum Computing Primer (PDF)',
    contentType: 'pdf',
    description: 'Native PDF quantum information primer',
  },
  {
    keywords: ['compare', 'comparison', 'product comparison', 'side by side', 'spec sheet'],
    url: 'aksh://comparison',
    title: 'Product Comparison',
    contentType: 'comparison',
    description: 'Side-by-side multi-product analysis',
  },
  {
    keywords: ['flags', 'experiments', 'experimental features', 'frontier'],
    url: 'aksh://flags',
    title: 'Experiments & Flags',
    contentType: 'flags',
    description: 'Browser engine experimental capabilities',
  },
  {
    keywords: ['readme', 'docs', 'documentation', 'help', 'about', 'guide'],
    url: 'aksh://readme',
    title: 'System Documentation',
    contentType: 'readme',
    description: 'System architecture and navigation guide',
  },
  {
    keywords: ['downloads', 'download manager', 'files', 'transfers'],
    url: 'aksh://downloads',
    title: 'Download Manager',
    contentType: 'downloads',
    description: 'Manage active and completed downloads',
  },
];

export interface CuratedSiteKeywordMap {
  url: string;
  title: string;
  keywords: string[];
}

export const CURATED_SITE_KEYWORDS: CuratedSiteKeywordMap[] = [
  {
    url: 'https://learn.python.org/courses/2026-guide',
    title: 'Top 5 Python Developer Courses for Beginners & Career Changers (2026)',
    keywords: [
      'python',
      'python course',
      'learn python',
      'python tutorial',
      'coding bootcamp',
      '100 days of code',
      'cs50',
      'angela yu',
      'programming courses',
      'fastapi',
    ],
  },
  {
    url: 'https://tech-radar.io/laptops/flagship-comparison-2026',
    title: 'Ultimate 2026 Laptop Comparison: MacBook Pro M3 vs Dell XPS 15 vs ThinkPad X1',
    keywords: [
      'laptop',
      'laptops',
      'macbook',
      'macbook pro',
      'dell xps',
      'thinkpad',
      'thinkpad x1',
      'laptop comparison',
      'm3 pro',
      'oled laptop',
      'best laptop',
    ],
  },
  {
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    title: 'Artificial Intelligence — Wikipedia, the free encyclopedia',
    keywords: [
      'artificial intelligence',
      'ai',
      'machine learning',
      'deep learning',
      'wikipedia ai',
      'neural network',
      'turing',
      'llm',
      'transformer architecture',
    ],
  },
  {
    url: 'https://theverge.com/tech/2026/future-of-ai-agents-browser-revolution',
    title: 'The AI Browser Revolution: How Intelligent Browsers Are Replacing Traditional Search',
    keywords: [
      'the verge',
      'verge',
      'browser revolution',
      'ai agents',
      'nilay patel',
      'future of browsers',
      'smart browser',
    ],
  },
  {
    url: 'https://www.google.com',
    title: 'Google Search Hub',
    keywords: ['google', 'google search', 'google.com', 'search engine'],
  },
];

/**
 * Resolves a search query or URL:
 * 1. Checks if it matches an internal view or tool of this web app
 * 2. Checks if it matches a preloaded/curated site in this web app
 * 3. Checks if it matches existing user bookmarks or history
 * 4. IF NOT AVAILABLE in this web -> DIRECTS TO GOOGLE SEARCH!
 */
export function resolveSearchOrUrl(
  input: string,
  options?: {
    bookmarks?: Bookmark[];
    history?: HistoryItem[];
    notes?: AINote[];
  }
): SearchResolution {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isAvailableInWeb: true,
      targetUrl: 'aksh://newtab',
      title: 'New Tab',
      sourceType: 'internal-view',
      badge: 'In Web',
    };
  }

  // 1. Bang commands
  if (trimmed.startsWith('!ext') || trimmed.startsWith('!extensions')) {
    return {
      isAvailableInWeb: true,
      targetUrl: 'aksh://extensions',
      title: 'Extensions Hub',
      sourceType: 'bang',
      badge: 'In Web',
    };
  }
  if (trimmed.startsWith('!script')) {
    return {
      isAvailableInWeb: true,
      targetUrl: 'aksh://scripts',
      title: 'Userscript & Style Engine',
      sourceType: 'bang',
      badge: 'In Web',
    };
  }
  if (trimmed.startsWith('!sec') || trimmed.startsWith('!shield')) {
    return {
      isAvailableInWeb: true,
      targetUrl: 'aksh://security',
      title: 'Quantum Security & Shield',
      sourceType: 'bang',
      badge: 'In Web',
    };
  }
  if (trimmed.startsWith('!agent') || trimmed.startsWith('!auto')) {
    return {
      isAvailableInWeb: true,
      targetUrl: 'aksh://agent',
      title: 'Autonomous Agent Studio',
      sourceType: 'bang',
      badge: 'In Web',
    };
  }
  if (trimmed.startsWith('!reading') || trimmed.startsWith('!read')) {
    return {
      isAvailableInWeb: true,
      targetUrl: 'aksh://reading_list',
      title: 'Reading List',
      sourceType: 'bang',
      badge: 'In Web',
    };
  }
  if (trimmed.startsWith('!ai ') || trimmed.startsWith('!gemini ')) {
    const q = trimmed.replace(/^!(ai|gemini)\s+/, '');
    return {
      isAvailableInWeb: true,
      targetUrl: `aksh://research?q=${encodeURIComponent(q)}`,
      title: `AI Research: "${q}"`,
      sourceType: 'bang',
      badge: 'In Web',
      query: q,
    };
  }
  if (trimmed.startsWith('!mindmap ') || trimmed.startsWith('!m ')) {
    const q = trimmed.replace(/^!(mindmap|m)\s+/, '');
    return {
      isAvailableInWeb: true,
      targetUrl: `aksh://mindmap?topic=${encodeURIComponent(q)}`,
      title: `Mindmap: "${q}"`,
      sourceType: 'bang',
      badge: 'In Web',
      query: q,
    };
  }
  if (trimmed.startsWith('!gh ')) {
    const q = trimmed.replace(/^!gh\s+/, '');
    return {
      isAvailableInWeb: false,
      targetUrl: `https://github.com/search?q=${encodeURIComponent(q)}`,
      title: `GitHub: "${q}"`,
      sourceType: 'external-url',
      query: q,
    };
  }
  if (trimmed.startsWith('!wiki ')) {
    const q = trimmed.replace(/^!wiki\s+/, '');
    return {
      isAvailableInWeb: false,
      targetUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
      title: `Wikipedia: "${q}"`,
      sourceType: 'external-url',
      query: q,
    };
  }
  if (trimmed.startsWith('!g ')) {
    const q = trimmed.replace(/^!g\s+/, '');
    return {
      isAvailableInWeb: false,
      targetUrl: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      title: `Google Search: "${q}"`,
      sourceType: 'google-redirect',
      badge: 'Direct to Google',
      query: q,
    };
  }

  // 2. Direct internal protocol (aksh:// or nexus://)
  if (trimmed.startsWith('aksh://') || trimmed.startsWith('nexus://')) {
    const norm = trimmed.replace(/^nexus:\/\//, 'aksh://');
    return {
      isAvailableInWeb: true,
      targetUrl: norm,
      title: norm,
      sourceType: 'internal-view',
      badge: 'In Web',
    };
  }

  // 3. Exact match against curated preloaded websites in this web
  const cleanUrl = trimmed.replace(/\/+$/, '');
  const cleanWithHttps = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  for (const [key, site] of Object.entries(SAMPLE_WEBSITES)) {
    const normKey = key.replace(/\/+$/, '');
    if (normKey.toLowerCase() === cleanWithHttps.toLowerCase() || normKey.toLowerCase() === cleanUrl.toLowerCase()) {
      return {
        isAvailableInWeb: true,
        targetUrl: key,
        title: site.title,
        sourceType: 'sample-site',
        badge: 'In Web',
        description: site.description,
      };
    }
  }

  // 4. Keyword match against Internal Tools in this web
  const lowerQuery = trimmed.toLowerCase();
  for (const tool of INTERNAL_TOOL_ROUTES) {
    if (tool.keywords.some((kw) => lowerQuery === kw || lowerQuery === `aksh ${kw}` || lowerQuery === `open ${kw}`)) {
      return {
        isAvailableInWeb: true,
        targetUrl: tool.url,
        title: tool.title,
        sourceType: 'internal-view',
        badge: 'In Web',
        description: tool.description,
      };
    }
  }

  // 5. Keyword match against Curated Websites in this web
  for (const siteMap of CURATED_SITE_KEYWORDS) {
    if (siteMap.keywords.some((kw) => lowerQuery === kw || lowerQuery.includes(kw))) {
      return {
        isAvailableInWeb: true,
        targetUrl: siteMap.url,
        title: siteMap.title,
        sourceType: 'sample-site',
        badge: 'In Web',
        matchedLabel: siteMap.title,
      };
    }
  }

  // 6. User Bookmarks matching
  if (options?.bookmarks && options.bookmarks.length > 0) {
    const bm = options.bookmarks.find(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.url.toLowerCase().includes(lowerQuery) ||
        (b.tags && b.tags.some((t) => t.toLowerCase() === lowerQuery))
    );
    if (bm) {
      return {
        isAvailableInWeb: true,
        targetUrl: bm.url,
        title: bm.title,
        sourceType: 'bookmark',
        badge: 'Bookmarked',
      };
    }
  }

  // 7. User Browsing History matching
  if (options?.history && options.history.length > 0) {
    const hist = options.history.find(
      (h) => h.title.toLowerCase().includes(lowerQuery) || h.url.toLowerCase().includes(lowerQuery)
    );
    if (hist) {
      return {
        isAvailableInWeb: true,
        targetUrl: hist.url,
        title: hist.title,
        sourceType: 'history',
        badge: 'History',
      };
    }
  }

  // 8. User Notes matching
  if (options?.notes && options.notes.length > 0) {
    const note = options.notes.find(
      (n) => n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery)
    );
    if (note) {
      return {
        isAvailableInWeb: true,
        targetUrl: 'aksh://notes',
        title: `AI Note: ${note.title}`,
        sourceType: 'note',
        badge: 'Saved Note',
      };
    }
  }

  // 9. If the user explicitly typed a full external URL starting with http:// or https://,
  // or a domain with a standard TLD like .com, .org, .edu, .io, .net, etc.:
  const isLikelyDomain =
    /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$/i.test(trimmed) &&
    !trimmed.includes(' ');

  if (isLikelyDomain) {
    // If it's a domain/URL not in SAMPLE_WEBSITES, it's an external web destination
    const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    
    // Check if it's already a Google search URL
    if (fullUrl.includes('google.com/search')) {
      const match = fullUrl.match(/[?&]q=([^&]+)/i);
      const q = match ? decodeURIComponent(match[1]) : trimmed;
      return {
        isAvailableInWeb: false,
        targetUrl: fullUrl,
        title: `Google Search: "${q}"`,
        sourceType: 'google-redirect',
        badge: 'Direct to Google',
        query: q,
      };
    }

    return {
      isAvailableInWeb: false,
      targetUrl: fullUrl,
      title: trimmed,
      sourceType: 'external-url',
      description: 'External web page',
    };
  }

  // 10. NOT AVAILABLE IN THIS WEB -> DIRECT TO GOOGLE!
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
  return {
    isAvailableInWeb: false,
    targetUrl: googleSearchUrl,
    title: `Google Search: "${trimmed}"`,
    sourceType: 'google-redirect',
    badge: 'Direct to Google',
    description: `"${trimmed}" is not available in this web. Directing to Google Search.`,
    query: trimmed,
  };
}
