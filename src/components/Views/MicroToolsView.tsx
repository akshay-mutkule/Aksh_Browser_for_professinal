import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Sparkles,
  Code2,
  Key,
  Hash,
  Palette,
  Clock,
  Table,
  Link2,
  Layout,
  Search,
  Copy,
  Check,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Bookmark,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Tab, GeneratedMicroTool } from '../../types';
import { generateMicroTool } from '../../services/api';

interface MicroToolsViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl?: (url: string) => void;
}

type BuiltInToolId =
  | 'jwt'
  | 'regex'
  | 'crypto'
  | 'contrast'
  | 'timestamp'
  | 'table_converter'
  | 'url_parser'
  | 'flex_grid';

export const MicroToolsView: React.FC<MicroToolsViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  // Navigation State
  const [selectedTool, setSelectedTool] = useState<BuiltInToolId | 'ai_synthesizer'>('jwt');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'developer' | 'design' | 'converter' | 'custom'>('all');

  // Copy indicator helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ----------------------------------------------------
  // 1. JWT & JSON Studio State
  // ----------------------------------------------------
  const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFrc2ggRXhwbG9yZXIiLCJyb2xlIjoiQXJjaGl0ZWN0IiwiZXhwIjoxNzYwMTQwODAwLCJpYXQiOjE3NDQ1ODQwMDB9.4z_SampleSignatureAkshAIBrowser2026';
  const [jwtInput, setJwtInput] = useState(sampleJwt);
  const [jsonInput, setJsonInput] = useState('{\n  "engine": "Aksh AI Browser",\n  "version": "3.8.0",\n  "features": ["Neural Vault", "Diff Studio", "Micro-Tools"],\n  "performance": { "fps": 120, "latencyMs": 8 }\n}');
  const [jsonIndent, setJsonIndent] = useState<2 | 4 | 'compact'>(2);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const parsedJwt = useMemo(() => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length < 2) return null;
      const b64Decode = (str: string) => {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        while (output.length % 4) output += '=';
        return decodeURIComponent(
          atob(output)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };
      const header = JSON.parse(b64Decode(parts[0]));
      const payload = JSON.parse(b64Decode(parts[1]));
      let expDate: Date | null = null;
      let isExpired = false;
      if (payload.exp) {
        expDate = new Date(payload.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
      }
      return { header, payload, expDate, isExpired, signature: parts[2] || '' };
    } catch {
      return null;
    }
  }, [jwtInput]);

  const formattedJson = useMemo(() => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      if (jsonIndent === 'compact') return JSON.stringify(parsed);
      return JSON.stringify(parsed, null, jsonIndent);
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
      return jsonInput;
    }
  }, [jsonInput, jsonIndent]);

  // ----------------------------------------------------
  // 2. Regex Pattern Lab State
  // ----------------------------------------------------
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState({ g: true, i: true, m: false, s: false });
  const [regexTestText, setRegexTestText] = useState(
    'Contact team at contact@aksh-browser.dev or support@company.org. Billing queries: finance@corp.co.uk.'
  );
  const [regexError, setRegexError] = useState<string | null>(null);

  const regexResults = useMemo(() => {
    try {
      setRegexError(null);
      let flags = '';
      if (regexFlags.g) flags += 'g';
      if (regexFlags.i) flags += 'i';
      if (regexFlags.m) flags += 'm';
      if (regexFlags.s) flags += 's';

      const re = new RegExp(regexPattern, flags);
      const matches: Array<{ match: string; index: number; groups: string[] }> = [];

      if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        let guard = 0;
        while ((m = re.exec(regexTestText)) !== null && guard < 200) {
          guard++;
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(regexTestText);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }
      return matches;
    } catch (e: any) {
      setRegexError(e.message || 'Invalid Regular Expression');
      return [];
    }
  }, [regexPattern, regexFlags, regexTestText]);

  // ----------------------------------------------------
  // 3. Cryptographic Hasher & UUID Forge State
  // ----------------------------------------------------
  const [hashInput, setHashInput] = useState('Aksh AI Browser 2026 Core');
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha512Hash, setSha512Hash] = useState('');
  const [base64Encoded, setBase64Encoded] = useState('');
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  useEffect(() => {
    const calcHashes = async () => {
      try {
        const enc = new TextEncoder();
        const data = enc.encode(hashInput);
        // SHA-256
        const buf256 = await crypto.subtle.digest('SHA-256', data);
        const hex256 = Array.from(new Uint8Array(buf256))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        setSha256Hash(hex256);

        // SHA-512
        const buf512 = await crypto.subtle.digest('SHA-512', data);
        const hex512 = Array.from(new Uint8Array(buf512))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        setSha512Hash(hex512);

        // Base64
        setBase64Encoded(btoa(unescape(encodeURIComponent(hashInput))));
      } catch {
        // Fallback
      }
    };
    calcHashes();
  }, [hashInput]);

  const generateUuidBatch = (count: number = 5) => {
    const arr: string[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(crypto.randomUUID());
    }
    setGeneratedUuids(arr);
  };

  useEffect(() => {
    generateUuidBatch(5);
  }, []);

  // ----------------------------------------------------
  // 4. WCAG 2.2 Color & Contrast Matrix State
  // ----------------------------------------------------
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#f8fafc');

  const colorMetrics = useMemo(() => {
    const getLuminance = (hex: string) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map((x) => x + x).join('');
      const rgb = [
        parseInt(c.substring(0, 2), 16) / 255,
        parseInt(c.substring(2, 4), 16) / 255,
        parseInt(c.substring(4, 6), 16) / 255,
      ].map((val) => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    try {
      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const formatted = Math.round(ratio * 100) / 100;
      return {
        ratio: formatted,
        aaNormal: ratio >= 4.5,
        aaLarge: ratio >= 3.0,
        aaaNormal: ratio >= 7.0,
        aaaLarge: ratio >= 4.5,
      };
    } catch {
      return { ratio: 1, aaNormal: false, aaLarge: false, aaaNormal: false, aaaLarge: false };
    }
  }, [fgColor, bgColor]);

  // ----------------------------------------------------
  // 5. Epoch Timestamp & Chrono Bridge State
  // ----------------------------------------------------
  const [currentEpoch, setCurrentEpoch] = useState(Date.now());
  const [inputEpoch, setInputEpoch] = useState(String(Math.floor(Date.now() / 1000)));
  const [inputIso, setInputIso] = useState(new Date().toISOString().slice(0, 19));

  useEffect(() => {
    const timer = setInterval(() => setCurrentEpoch(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const epochConversion = useMemo(() => {
    try {
      let num = Number(inputEpoch.trim());
      if (isNaN(num)) return null;
      if (num < 10000000000) num *= 1000; // auto-detect seconds vs ms
      const d = new Date(num);
      return {
        iso: d.toISOString(),
        utc: d.toUTCString(),
        local: d.toLocaleString(),
        relative: Math.round((Date.now() - d.getTime()) / 60000) + ' min ago',
      };
    } catch {
      return null;
    }
  }, [inputEpoch]);

  // ----------------------------------------------------
  // 6. Markdown Table & CSV/JSON Converter State
  // ----------------------------------------------------
  const [tableData, setTableData] = useState([
    ['Model', 'Context Window', 'Latency', 'MMLU Score'],
    ['Gemini 3.7 Flash', '1,000,000', '180ms', '91.8%'],
    ['Gemini 2.5 Pro', '2,000,000', '420ms', '93.2%'],
    ['Gemini 2.5 Flash', '1,000,000', '110ms', '88.4%'],
  ]);

  const tableOutputs = useMemo(() => {
    // Markdown
    const headers = tableData[0] || [];
    const rows = tableData.slice(1);
    let md = '| ' + headers.join(' | ') + ' |\n';
    md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    rows.forEach((r) => {
      md += '| ' + r.join(' | ') + ' |\n';
    });

    // CSV
    const csv = tableData.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');

    // JSON
    const jsonArr = rows.map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = r[i] || '';
      });
      return obj;
    });

    return { md, csv, json: JSON.stringify(jsonArr, null, 2) };
  }, [tableData]);

  // ----------------------------------------------------
  // 7. URL & Query Parameter Inspector State
  // ----------------------------------------------------
  const [urlInspectorInput, setUrlInspectorInput] = useState(
    'https://api.github.com/repos/google/gemini/issues?state=open&sort=created&direction=desc&page=1&per_page=30#review'
  );

  const parsedUrl = useMemo(() => {
    try {
      const u = new URL(urlInspectorInput.trim());
      const params: Array<{ key: string; value: string }> = [];
      u.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      return {
        protocol: u.protocol,
        host: u.host,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params,
      };
    } catch {
      return null;
    }
  }, [urlInspectorInput]);

  // ----------------------------------------------------
  // 8. CSS Flexbox & Grid Builder State
  // ----------------------------------------------------
  const [flexDirection, setFlexDirection] = useState<'row' | 'column' | 'row-reverse' | 'column-reverse'>('row');
  const [justifyContent, setJustifyContent] = useState<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>('center');
  const [alignItems, setAlignItems] = useState<'stretch' | 'flex-start' | 'center' | 'flex-end'>('center');
  const [flexGap, setFlexGap] = useState(16);
  const [flexWrap, setFlexWrap] = useState<'nowrap' | 'wrap'>('wrap');

  const generatedCss = useMemo(() => {
    return `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${flexGap}px;
}`;
  }, [flexDirection, justifyContent, alignItems, flexWrap, flexGap]);

  // ----------------------------------------------------
  // 9. AI On-Demand Micro-Tool Synthesizer State
  // ----------------------------------------------------
  const [aiToolPrompt, setAiToolPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeGeneratedTool, setActiveGeneratedTool] = useState<GeneratedMicroTool | null>(null);
  const [savedTools, setSavedTools] = useState<GeneratedMicroTool[]>([]);
  const [viewSourceMode, setViewSourceMode] = useState(false);

  // Load saved tools from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aksh_saved_microtools');
      if (stored) {
        setSavedTools(JSON.parse(stored));
      } else {
        // Default seed tool
        const defaultTool: GeneratedMicroTool = {
          id: 'seed-calc',
          title: 'Mortgage & Loan EMI Amortization Calculator',
          description: 'Calculate monthly loan installments, total interest, and payoff timeline with live breakdown.',
          category: 'calculator',
          code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { padding: 24px; background: #0b0f19; color: #f1f5f9; }
    h2 { font-size: 19px; color: #60a5fa; margin-bottom: 6px; font-weight: 700; }
    p { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 14px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #f8fafc; font-size: 14px; outline: none; }
    input:focus { border-color: #3b82f6; }
    .results { margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 14px; border-radius: 8px; }
    .val { font-size: 20px; font-weight: bold; color: #34d399; }
    .lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; }
  </style>
</head>
<body>
  <h2>Mortgage & Loan EMI Calculator</h2>
  <p>Instant reactive amortization estimate powered by Aksh AI Browser.</p>
  <div class="form-group">
    <label>Loan Principal Amount ($)</label>
    <input type="number" id="p" value="350000" step="5000">
  </div>
  <div class="form-group">
    <label>Annual Interest Rate (%)</label>
    <input type="number" id="r" value="5.8" step="0.1">
  </div>
  <div class="form-group">
    <label>Loan Term (Years)</label>
    <input type="number" id="y" value="30" step="1">
  </div>
  <div class="results">
    <div class="card"><div class="val" id="emi">$0</div><div class="lbl">Monthly EMI</div></div>
    <div class="card"><div class="val" id="total">$0</div><div class="lbl">Total Payment</div></div>
    <div class="card"><div class="val" id="interest">$0</div><div class="lbl">Total Interest</div></div>
  </div>
  <script>
    function calc() {
      const p = parseFloat(document.getElementById('p').value) || 0;
      const r = (parseFloat(document.getElementById('r').value) || 0) / 1200;
      const n = (parseFloat(document.getElementById('y').value) || 0) * 12;
      if (p <= 0 || r <= 0 || n <= 0) return;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      const interest = total - p;
      document.getElementById('emi').innerText = '$' + Math.round(emi).toLocaleString();
      document.getElementById('total').innerText = '$' + Math.round(total).toLocaleString();
      document.getElementById('interest').innerText = '$' + Math.round(interest).toLocaleString();
    }
    document.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
    calc();
  </script>
</body>
</html>`,
          createdAt: Date.now(),
        };
        setSavedTools([defaultTool]);
        setActiveGeneratedTool(defaultTool);
      }
    } catch {}
  }, []);

  const handleSynthesizeTool = async () => {
    if (!aiToolPrompt.trim() || isSynthesizing) return;
    setIsSynthesizing(true);
    try {
      const res = await generateMicroTool(aiToolPrompt.trim());
      setActiveGeneratedTool(res);
      // Append to saved list
      const updated = [res, ...savedTools.filter((t) => t.id !== res.id)];
      setSavedTools(updated);
      try {
        localStorage.setItem('aksh_saved_microtools', JSON.stringify(updated));
      } catch {}
      setAiToolPrompt('');
    } catch (err: any) {
      alert('Error generating tool: ' + (err.message || 'Check connection'));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDeleteSavedTool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTools.filter((t) => t.id !== id);
    setSavedTools(updated);
    try {
      localStorage.setItem('aksh_saved_microtools', JSON.stringify(updated));
    } catch {}
    if (activeGeneratedTool?.id === id) {
      setActiveGeneratedTool(updated[0] || null);
    }
  };

  // Built-in tool definitions catalog
  const BUILT_IN_CATALOG: Array<{
    id: BuiltInToolId;
    title: string;
    description: string;
    category: 'developer' | 'design' | 'converter';
    icon: any;
  }> = [
    {
      id: 'jwt',
      title: 'JWT & JSON Studio',
      description: 'Decode tokens, parse claims, inspect expiration & format JSON structures.',
      category: 'developer',
      icon: Key,
    },
    {
      id: 'regex',
      title: 'Regex Pattern Lab',
      description: 'Test expressions, capture groups, match flags & test strings in real-time.',
      category: 'developer',
      icon: Code2,
    },
    {
      id: 'crypto',
      title: 'Hash & UUID Forge',
      description: 'Compute SHA-256/512, Base64 encode, and generate RFC4122 UUID v4 batches.',
      category: 'developer',
      icon: Hash,
    },
    {
      id: 'contrast',
      title: 'WCAG 2.2 Color Matrix',
      description: 'Test foreground vs background contrast ratio for AA & AAA compliance standards.',
      category: 'design',
      icon: Palette,
    },
    {
      id: 'timestamp',
      title: 'Epoch Timestamp Bridge',
      description: 'Convert between Unix timestamps, ISO-8601 strings, UTC, and local time.',
      category: 'converter',
      icon: Clock,
    },
    {
      id: 'table_converter',
      title: 'Markdown & CSV Matrix',
      description: 'Convert markdown tables to CSV, JSON arrays, and SQL inserts seamlessly.',
      category: 'converter',
      icon: Table,
    },
    {
      id: 'url_parser',
      title: 'URL & Query Inspector',
      description: 'Deconstruct endpoints, protocol, query parameters, path & hash fragments.',
      category: 'developer',
      icon: Link2,
    },
    {
      id: 'flex_grid',
      title: 'CSS Flexbox Visualizer',
      description: 'Interactive direction, alignment, gap playground with instant CSS export.',
      category: 'design',
      icon: Layout,
    },
  ];

  // Filter tools
  const filteredTools = useMemo(() => {
    return BUILT_IN_CATALOG.filter((t) => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory;
      const matchSearch =
        t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.description.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchFilter, activeCategory]);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header & Search Bar */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">Aksh Micro-Tool Studio</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                Frontier Utilities
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero-latency developer utilities, formatting engines & Gemini prompt-to-app synthesizer
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTool('ai_synthesizer');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedTool === 'ai_synthesizer'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-purple-950/40 text-purple-300 border border-purple-800/50 hover:bg-purple-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Synthesizer</span>
          </button>

          <button
            onClick={() => {
              onSaveAsNote(
                'Aksh Micro-Tools Session Export',
                `### Aksh AI Browser Micro-Tools Session\n\n- Active Tool: **${selectedTool}**\n- Captured at: ${new Date().toLocaleString()}\n- Status: Production Ready\n`
              );
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
            title="Save session notes"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <span>Save to Notes</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-72 bg-slate-950/40 border-r border-slate-800/70 flex flex-col shrink-0 overflow-y-auto">
          {/* Search Tools Input */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter tools..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto no-scrollbar text-[11px]">
              {(['all', 'developer', 'design', 'converter'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-md capitalize cursor-pointer transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Built-in Tools Navigation List */}
          <div className="p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Core Engineering Lab
            </div>
            {filteredTools.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTool(t.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate leading-tight">{t.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{t.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom & AI Synthesized Tools Section */}
          <div className="p-2 pt-4 border-t border-slate-800/60 mt-auto">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">
              <span>Synthesized Micro-Apps</span>
              <span className="text-slate-500 font-mono text-[9px]">{savedTools.length}</span>
            </div>

            <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => setSelectedTool('ai_synthesizer')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  selectedTool === 'ai_synthesizer'
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40'
                    : 'text-purple-300 hover:bg-purple-950/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold truncate">Prompt-to-App Studio</span>
              </button>

              {savedTools.map((st) => (
                <div
                  key={st.id}
                  onClick={() => {
                    setActiveGeneratedTool(st);
                    setSelectedTool('ai_synthesizer');
                  }}
                  className={`group px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedTool === 'ai_synthesizer' && activeGeneratedTool?.id === st.id
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2 font-medium">{st.title}</span>
                  <button
                    onClick={(e) => handleDeleteSavedTool(st.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5 cursor-pointer"
                    title="Delete saved tool"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Active Tool Viewport */}
        <div className="flex-1 bg-slate-900/60 overflow-y-auto p-6">
          {/* 1. JWT & JSON Studio */}
          {selectedTool === 'jwt' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  JWT & JSON Architecture Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect JSON Web Tokens locally without transmitting claims across external servers. Validate, beautify, and minify JSON.
                </p>
              </div>

              {/* JWT Decoder Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Encoded Token Input
                  </span>
                  <button
                    onClick={() => handleCopy('jwt_raw', jwtInput)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'jwt_raw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'jwt_raw' ? 'Copied' : 'Copy Token'}</span>
                  </button>
                </div>

                <textarea
                  value={jwtInput}
                  onChange={(e) => setJwtInput(e.target.value)}
                  placeholder="Paste JWT string (eyJ...)"
                  className="w-full h-20 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />

                {parsedJwt ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Header */}
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Header (Algorithm & Type)</span>
                        <span className="text-[10px] font-mono text-slate-500">{parsedJwt.header.alg || 'HS256'}</span>
                      </div>
                      <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg overflow-x-auto">
                        {JSON.stringify(parsedJwt.header, null, 2)}
                      </pre>
                    </div>

                    {/* Payload */}
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Payload (Claims)</span>
                        {parsedJwt.expDate && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              parsedJwt.isExpired
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            }`}
                          >
                            {parsedJwt.isExpired ? 'Expired' : 'Active'}
                          </span>
                        )}
                      </div>
                      <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg overflow-x-auto">
                        {JSON.stringify(parsedJwt.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-3 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Unable to parse JWT. Ensure token format contains valid Base64 segments.</span>
                  </div>
                )}
              </div>

              {/* JSON Formatter & Minifier */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    JSON Formatter & Validator
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                      <button
                        onClick={() => setJsonIndent(2)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          jsonIndent === 2 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        2 Spaces
                      </button>
                      <button
                        onClick={() => setJsonIndent(4)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          jsonIndent === 4 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        4 Spaces
                      </button>
                      <button
                        onClick={() => setJsonIndent('compact')}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          jsonIndent === 'compact' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        Minify
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopy('json_out', formattedJson)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'json_out' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Raw Input</label>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="w-full h-44 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Formatted Result</label>
                    <textarea
                      readOnly
                      value={formattedJson}
                      className="w-full h-44 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {jsonError && (
                  <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl">
                    Syntax Error: {jsonError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Regex Pattern Lab */}
          {selectedTool === 'regex' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Regular Expression Pattern Lab
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Test and validate RegExp expressions with real-time capture groups, match indices, and standard pattern presets.
                </p>
              </div>

              {/* Pattern Input & Flags */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      RegExp Pattern
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Flags:</span>
                      {(['g', 'i', 'm', 's'] as const).map((flag) => (
                        <button
                          key={flag}
                          onClick={() => setRegexFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono cursor-pointer ${
                            regexFlags[flag]
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {flag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs">
                    <span className="text-cyan-400 font-bold">/</span>
                    <input
                      type="text"
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      placeholder="Enter regex pattern..."
                      className="w-full bg-transparent text-slate-200 focus:outline-none"
                    />
                    <span className="text-cyan-400 font-bold">/</span>
                    <span className="text-slate-400">
                      {regexFlags.g && 'g'}
                      {regexFlags.i && 'i'}
                      {regexFlags.m && 'm'}
                      {regexFlags.s && 's'}
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                  <span className="text-slate-500 text-[11px] font-semibold uppercase">Presets:</span>
                  {[
                    { label: 'Email Address', pat: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
                    { label: 'URL / Domain', pat: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)' },
                    { label: 'IPv4 Address', pat: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
                    { label: 'Date (YYYY-MM-DD)', pat: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b' },
                    { label: 'UUID v4', pat: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setRegexPattern(p.pat)}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Test Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Test String Input
                  </label>
                  <textarea
                    value={regexTestText}
                    onChange={(e) => setRegexTestText(e.target.value)}
                    placeholder="Enter text to match against..."
                    className="w-full h-28 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Match Results Table */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Detected Matches ({regexResults.length})
                    </span>
                  </div>

                  {regexError ? (
                    <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl">
                      {regexError}
                    </div>
                  ) : regexResults.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {regexResults.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-[11px]">#{i + 1}</span>
                            <span className="text-cyan-300 font-semibold">{m.match}</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">Index: {m.index}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl text-center">
                      No matches found for current pattern.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Cryptographic Hasher & UUID Forge */}
          {selectedTool === 'crypto' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-cyan-400" />
                  Cryptographic Hasher & UUID Forge
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Client-side SHA-256/512 checksums, Base64 encoding/decoding, and bulk RFC4122 UUID v4 generation.
                </p>
              </div>

              {/* Hash Generator */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Source Text / Payload
                  </label>
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {/* SHA-256 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider">SHA-256 Digest</span>
                      <button
                        onClick={() => handleCopy('sha256', sha256Hash)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 break-all">
                      {sha256Hash || '...'}
                    </div>
                  </div>

                  {/* SHA-512 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider">SHA-512 Digest</span>
                      <button
                        onClick={() => handleCopy('sha512', sha512Hash)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'sha512' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 break-all text-[11px]">
                      {sha512Hash || '...'}
                    </div>
                  </div>

                  {/* Base64 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider">Base64 Encoded</span>
                      <button
                        onClick={() => handleCopy('b64', base64Encoded)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'b64' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-amber-300 break-all">
                      {base64Encoded || '...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* UUID v4 Generator */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      RFC4122 UUID v4 Generator
                    </span>
                    <p className="text-[11px] text-slate-400">Cryptographically secure unique identifiers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateUuidBatch(5)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={() => handleCopy('uuid_all', generatedUuids.join('\n'))}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs text-slate-950 font-bold rounded-lg cursor-pointer"
                    >
                      Copy All (5)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {generatedUuids.map((uuid, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs"
                    >
                      <span className="text-slate-200">{uuid}</span>
                      <button
                        onClick={() => handleCopy(`uuid_${i}`, uuid)}
                        className="text-slate-500 hover:text-cyan-400 text-xs cursor-pointer"
                      >
                        {copiedKey === `uuid_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. WCAG 2.2 Color & Contrast Matrix */}
          {selectedTool === 'contrast' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-400" />
                  WCAG 2.2 Color & Contrast Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ensure web accessibility compliance against WCAG Level AA and AAA standards for normal and large text.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controls & Pickers */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Foreground / Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const temp = fgColor;
                      setFgColor(bgColor);
                      setBgColor(temp);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Invert Foreground & Background</span>
                  </button>
                </div>

                {/* Scorecard */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Contrast Ratio
                    </span>
                    <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                      {colorMetrics.ratio}:1
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="text-[11px] font-bold text-slate-400">AA Normal Text</div>
                      <div className="text-xs text-slate-500">Requires 4.5:1</div>
                      <div className={`mt-2 text-xs font-bold ${colorMetrics.aaNormal ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {colorMetrics.aaNormal ? '✓ PASS' : '✕ FAIL'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="text-[11px] font-bold text-slate-400">AA Large Text (18pt+)</div>
                      <div className="text-xs text-slate-500">Requires 3.0:1</div>
                      <div className={`mt-2 text-xs font-bold ${colorMetrics.aaLarge ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {colorMetrics.aaLarge ? '✓ PASS' : '✕ FAIL'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="text-[11px] font-bold text-slate-400">AAA Normal Text</div>
                      <div className="text-xs text-slate-500">Requires 7.0:1</div>
                      <div className={`mt-2 text-xs font-bold ${colorMetrics.aaaNormal ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {colorMetrics.aaaNormal ? '✓ PASS' : '✕ FAIL'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="text-[11px] font-bold text-slate-400">AAA Large Text (18pt+)</div>
                      <div className="text-xs text-slate-500">Requires 4.5:1</div>
                      <div className={`mt-2 text-xs font-bold ${colorMetrics.aaaLarge ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {colorMetrics.aaaLarge ? '✓ PASS' : '✕ FAIL'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Simulated Render Preview
                </span>
                <div
                  style={{ backgroundColor: bgColor, color: fgColor }}
                  className="p-6 rounded-xl border border-slate-800/40 transition-colors shadow-inner"
                >
                  <h3 className="text-xl font-bold tracking-tight">Aksh AI Browser Typography Preview</h3>
                  <p className="text-sm mt-2 opacity-90 leading-relaxed">
                    This sample paragraph renders directly using the selected foreground and background colors.
                    Evaluate how effortlessly text can be read across small body paragraphs and headline scales.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      style={{ backgroundColor: fgColor, color: bgColor }}
                      className="px-4 py-2 rounded-lg font-bold text-xs"
                    >
                      Primary Action Button
                    </button>
                    <span className="text-xs underline cursor-pointer">Sample Text Link</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Epoch Timestamp & Chrono Bridge */}
          {selectedTool === 'timestamp' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Epoch Timestamp & Chrono Bridge
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time clock tracking, seconds vs milliseconds auto-detection, and humanized timezone translations.
                </p>
              </div>

              {/* Live Clock Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Epoch Timestamp</div>
                  <div className="text-3xl font-mono font-bold text-cyan-400 mt-1">
                    {Math.floor(currentEpoch / 1000)}
                    <span className="text-xs text-slate-500 font-normal ml-2">seconds</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{currentEpoch} ms</div>
                </div>
                <button
                  onClick={() => handleCopy('epoch_live', String(Math.floor(currentEpoch / 1000)))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'epoch_live' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Now</span>
                </button>
              </div>

              {/* Converter Controls */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Timestamp to Convert (Seconds or Milliseconds)
                  </label>
                  <input
                    type="text"
                    value={inputEpoch}
                    onChange={(e) => setInputEpoch(e.target.value)}
                    placeholder="e.g. 1760140800"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {epochConversion && (
                  <div className="space-y-2.5 pt-2">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">ISO 8601 String:</span>
                      <span className="font-mono text-cyan-300 font-semibold">{epochConversion.iso}</span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">UTC Date & Time:</span>
                      <span className="font-mono text-purple-300 font-semibold">{epochConversion.utc}</span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Local Browser Time:</span>
                      <span className="font-mono text-emerald-300 font-semibold">{epochConversion.local}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Markdown Table & CSV/JSON Converter */}
          {selectedTool === 'table_converter' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Table className="w-5 h-5 text-cyan-400" />
                  Markdown Table & CSV/JSON Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Two-way table transformation. Edit interactive tabular cells and export as Markdown, CSV, or structured JSON arrays.
                </p>
              </div>

              {/* Editable Matrix */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Interactive Data Grid
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTableData((prev) => [...prev, prev[0].map(() => 'New Cell')]);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Row</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800">
                        {tableData[0]?.map((col, ci) => (
                          <th key={ci} className="p-2 border-r border-slate-800 font-bold text-slate-300">
                            <input
                              type="text"
                              value={col}
                              onChange={(e) => {
                                const copy = [...tableData];
                                copy[0][ci] = e.target.value;
                                setTableData(copy);
                              }}
                              className="w-full bg-transparent font-bold focus:outline-none"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.slice(1).map((row, ri) => (
                        <tr key={ri} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                          {row.map((cell, ci) => (
                            <td key={ci} className="p-2 border-r border-slate-900 text-slate-300">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const copy = [...tableData];
                                  copy[ri + 1][ci] = e.target.value;
                                  setTableData(copy);
                                }}
                                className="w-full bg-transparent focus:outline-none font-mono"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Markdown */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Markdown Table</span>
                    <button
                      onClick={() => handleCopy('tbl_md', tableOutputs.md)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'tbl_md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-cyan-300 bg-slate-900 p-3 rounded-xl overflow-x-auto max-h-40">
                    {tableOutputs.md}
                  </pre>
                </div>

                {/* CSV */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CSV Output</span>
                    <button
                      onClick={() => handleCopy('tbl_csv', tableOutputs.csv)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'tbl_csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-purple-300 bg-slate-900 p-3 rounded-xl overflow-x-auto max-h-40">
                    {tableOutputs.csv}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 7. URL & Query Inspector */}
          {selectedTool === 'url_parser' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" />
                  URL & Query Parameter Inspector
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Deconstruct web endpoints into protocols, origins, paths, query parameters, and fragments.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Full Web URL Input
                  </label>
                  <input
                    type="text"
                    value={urlInspectorInput}
                    onChange={(e) => setUrlInspectorInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {parsedUrl && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Protocol</span>
                        <span className="text-emerald-400 font-mono font-bold mt-1 block">{parsedUrl.protocol}</span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Host</span>
                        <span className="text-cyan-400 font-mono font-bold mt-1 block truncate">{parsedUrl.host}</span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Path</span>
                        <span className="text-purple-400 font-mono font-bold mt-1 block truncate">{parsedUrl.pathname}</span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Hash Fragment</span>
                        <span className="text-amber-400 font-mono font-bold mt-1 block">{parsedUrl.hash || '(None)'}</span>
                      </div>
                    </div>

                    {/* Query Params Breakdown */}
                    <div>
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Query Parameters ({parsedUrl.params.length})
                      </div>

                      {parsedUrl.params.length > 0 ? (
                        <div className="space-y-2">
                          {parsedUrl.params.map((p, i) => (
                            <div
                              key={i}
                              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs flex items-center justify-between"
                            >
                              <span className="text-cyan-400 font-bold">{p.key}</span>
                              <span className="text-slate-300 truncate max-w-md">{p.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-xs text-slate-500 bg-slate-900/40 rounded-xl italic text-center">
                          No query parameters present in this URL.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. CSS Flexbox & Grid Builder */}
          {selectedTool === 'flex_grid' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-cyan-400" />
                  CSS Flexbox & Layout Playground
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Interact with flex directions, justify-content, align-items, and gaps with live render updates.
                </p>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Flex Direction
                  </label>
                  <select
                    value={flexDirection}
                    onChange={(e: any) => setFlexDirection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="row">row</option>
                    <option value="column">column</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Justify Content
                  </label>
                  <select
                    value={justifyContent}
                    onChange={(e: any) => setJustifyContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="center">center</option>
                    <option value="flex-end">flex-end</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Align Items
                  </label>
                  <select
                    value={alignItems}
                    onChange={(e: any) => setAlignItems(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="center">center</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="stretch">stretch</option>
                  </select>
                </div>
              </div>

              {/* Live Flex Canvas */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Live Container Canvas
                </span>

                <div
                  style={{
                    display: 'flex',
                    flexDirection,
                    justifyContent,
                    alignItems,
                    flexWrap,
                    gap: `${flexGap}px`,
                  }}
                  className="w-full min-h-[220px] p-5 bg-slate-900 border border-dashed border-slate-700 rounded-xl overflow-hidden"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-cyan-900/40"
                    >
                      Item #{n}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Export */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <pre className="font-mono text-xs text-cyan-300">{generatedCss}</pre>
                <button
                  onClick={() => handleCopy('css_flex', generatedCss)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'css_flex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy CSS</span>
                </button>
              </div>
            </div>
          )}

          {/* 9. AI On-Demand Micro-Tool Synthesizer */}
          {selectedTool === 'ai_synthesizer' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Prompt-to-App Micro-Tool Synthesizer
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Describe any utility, calculator, converter, or generator in natural language. Gemini 3.7 Flash compiles a self-contained interactive widget ready to use.
                </p>
              </div>

              {/* Prompt Input Form */}
              <div className="bg-slate-950 border border-purple-900/40 rounded-2xl p-5 shadow-xl shadow-purple-950/20 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiToolPrompt}
                    onChange={(e) => setAiToolPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSynthesizeTool()}
                    placeholder="Describe a tool (e.g. 'Aspect Ratio & Resolution Calculator', 'CSS Glassmorphism Generator', 'Unix Cron Explainer')..."
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSynthesizeTool}
                    disabled={isSynthesizing || !aiToolPrompt.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSynthesizing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Synthesize Tool</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Suggested Prompts */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="text-slate-500 text-[11px] font-semibold uppercase">Try:</span>
                  {[
                    'Aspect Ratio & Display Resizer',
                    'CSS Glassmorphism Card Studio',
                    'Password Entropy & Strength Meter',
                    'HTML Entity & Unicode Converter',
                    'Color Palette Shading Generator',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setAiToolPrompt(s)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-purple-800/80 rounded-lg text-[11px] text-purple-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Synthesized Tool Preview */}
              {activeGeneratedTool ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
                  <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{activeGeneratedTool.title}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                          {activeGeneratedTool.category}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{activeGeneratedTool.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewSourceMode(!viewSourceMode)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{viewSourceMode ? 'Interactive View' : 'View Code'}</span>
                      </button>
                      <button
                        onClick={() => handleCopy('tool_code', activeGeneratedTool.code)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'tool_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy HTML</span>
                      </button>
                    </div>
                  </div>

                  {viewSourceMode ? (
                    <div className="p-4 bg-slate-950">
                      <pre className="font-mono text-xs text-cyan-300 bg-slate-900 p-4 rounded-xl overflow-x-auto max-h-[480px]">
                        {activeGeneratedTool.code}
                      </pre>
                    </div>
                  ) : (
                    <div className="w-full h-[520px] bg-slate-950 relative">
                      <iframe
                        title={activeGeneratedTool.title}
                        srcDoc={activeGeneratedTool.code}
                        sandbox="allow-scripts allow-modals"
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl text-slate-500">
                  <Sparkles className="w-8 h-8 text-purple-500/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">No tool synthesized yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Enter a description above to create your custom micro-utility.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
