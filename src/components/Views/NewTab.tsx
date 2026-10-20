import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Zap,
  Network,
  FileText,
  Scale,
  ArrowRight,
  Code,
  Laptop,
  BookOpen,
  HelpCircle,
  Play,
  Globe,
  StickyNote,
  Bookmark,
  History,
  Download,
  Settings,
  Clock,
  Plus,
  X,
  Check,
  Cpu,
  Compass,
  RefreshCw,
  Radio,
  Layers,
  Flame,
  BookmarkCheck,
  Mic,
  MicOff,
  Camera,
  ExternalLink,
  Workflow,
  Terminal,
  Code2,
  Webhook,
  Brain,
  GitCompare,
  Wrench,
  Menu,
  ChevronDown,
  ChevronUp,
  Bot
} from 'lucide-react';
import { SPEED_DIAL_SHORTCUTS } from '../../data/mockWebsites';
import { Bookmark as BookmarkType, HistoryItem } from '../../types';
import { resolveSearchOrUrl } from '../../utils/searchRouter';

interface BriefingItem {
  id: string;
  tag: string;
  title: string;
  summary: string;
  query: string;
  sourceUrl?: string;
}

const DEFAULT_BRIEFINGS: BriefingItem[] = [
  {
    id: 'b-1',
    tag: 'Frontier AI',
    title: 'Autonomous Multi-Agent Orchestration & Reasoning',
    summary: 'Next-generation reasoning architectures utilizing verifiable tool chains and persistent agent memory patterns.',
    query: 'Autonomous AI agent architectures reasoning models',
    sourceUrl: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
  },
  {
    id: 'b-2',
    tag: 'Web Engineering',
    title: 'Local-First Runtimes & WebGPU Accelerated Compute',
    summary: 'Direct client-side model inference and offline-first zero-latency synchronization frameworks transforming web browsers.',
    query: 'Local-first software WebGPU browser inference',
    sourceUrl: 'https://developer.mozilla.org',
  },
  {
    id: 'b-3',
    tag: 'Deep Tech',
    title: 'Quantum Advantage & Topological Error Correction',
    summary: 'Recent hardware benchmarks demonstrating quantum error mitigation in high-qubit logical processors.',
    query: 'Quantum error correction quantum computing breakthrough',
    sourceUrl: 'https://github.com',
  },
];

interface NewTabProps {
  onNavigate: (url: string) => void;
  bookmarks: BookmarkType[];
  history?: HistoryItem[];
  onOpenResearch: (query: string) => void;
  onOpenPdf: (pdfId: string) => void;
  onOpenTour?: () => void;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
}

export const NewTab: React.FC<NewTabProps> = ({
  onNavigate,
  bookmarks,
  history = [],
  onOpenResearch,
  onOpenTour,
  onSaveAsNote,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [searchMode, setSearchMode] = useState<'google' | 'ai' | 'agent' | 'scholar' | 'news'>('google');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');

  // Custom Speed Dials (combines defaults with any user-added ones stored locally)
  const [customShortcuts, setCustomShortcuts] = useState<Array<{ id: string; title: string; url: string; icon: string }>>(() => {
    try {
      const saved = localStorage.getItem('aksh_custom_speeddials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcutTitle, setNewShortcutTitle] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');

  // Three horizontal lines collapsible drawer state (keeps home page neat & clean by default)
  const [showExtendedDrawer, setShowExtendedDrawer] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<'all' | 'apps' | 'radar' | 'scratchpad' | 'trending'>('all');
  const [drawerFilter, setDrawerFilter] = useState('');

  // Quick Scratchpad state
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem('aksh_quick_scratchpad') || '';
  });
  const [scratchpadSaved, setScratchpadSaved] = useState(false);

  // AI Daily Briefing state
  const [briefings, setBriefings] = useState<BriefingItem[]>(() => {
    try {
      const saved = localStorage.getItem('aksh_ai_daily_briefings');
      return saved ? JSON.parse(saved) : DEFAULT_BRIEFINGS;
    } catch {
      return DEFAULT_BRIEFINGS;
    }
  });
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [briefingSaved, setBriefingSaved] = useState(false);

  const handleRefreshBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:
            'Generate 3 timely, high-impact technology & research intelligence briefing cards for today. Format strictly as JSON array of objects with keys: "id" (string), "tag" (2 words max e.g. "Frontier AI", "Biotech"), "title" (concise headline), "summary" (1-2 sentences), "query" (suggested search query). Do not wrap with extra text, output only JSON.',
          conversationHistory: [],
          mode: 'general',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const clean = (data.reply || '').replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBriefings(parsed);
          localStorage.setItem('aksh_ai_daily_briefings', JSON.stringify(parsed));
        }
      }
    } catch {
      // Rotate order gracefully
      const rotated = [...briefings.slice(1), briefings[0]];
      setBriefings(rotated);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleSaveBriefingToNotes = () => {
    if (!onSaveAsNote || briefings.length === 0) return;
    const title = `AI Daily Intelligence Briefing - ${new Date().toLocaleDateString()}`;
    let md = `# ${title}\n\n`;
    md += `*Compiled by Aksh AI Browser*\n\n---\n\n`;
    briefings.forEach((b, i) => {
      md += `### ${i + 1}. [${b.tag}] ${b.title}\n`;
      md += `${b.summary}\n\n`;
      md += `*Suggested Research Query:* \`${b.query}\`\n\n`;
    });
    onSaveAsNote(title, md, 'aksh://newtab');
    setBriefingSaved(true);
    setTimeout(() => setBriefingSaved(false), 2500);
  };

  // Update clock & greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveScratchpad = () => {
    if (!scratchpadText.trim()) return;
    localStorage.setItem('aksh_quick_scratchpad', scratchpadText);
    if (onSaveAsNote) {
      onSaveAsNote('Quick Scratchpad Note', scratchpadText, 'aksh://newtab');
      setScratchpadSaved(true);
      setTimeout(() => setScratchpadSaved(false), 2500);
    }
  };

  const handleAddCustomShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutTitle.trim() || !newShortcutUrl.trim()) return;
    let url = newShortcutUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('aksh://')) {
      url = 'https://' + url;
    }
    const newItem = {
      id: `shortcut-${Date.now()}`,
      title: newShortcutTitle.trim(),
      url,
      icon: 'Globe',
    };
    const updated = [...customShortcuts, newItem];
    setCustomShortcuts(updated);
    try {
      localStorage.setItem('aksh_custom_speeddials', JSON.stringify(updated));
    } catch {}
    setNewShortcutTitle('');
    setNewShortcutUrl('');
    setShowAddShortcut(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;

    if (searchMode === 'agent' || q.startsWith('!agent ') || q.startsWith('!swarm ') || q.startsWith('!auto ')) {
      const cleanQ = q.replace(/^!(agent|swarm|auto)\s+/, '');
      onNavigate(cleanQ ? `aksh://agent?goal=${encodeURIComponent(cleanQ)}` : 'aksh://agent');
      return;
    }

    if (searchMode === 'ai' || isAiMode || q.startsWith('!ai ') || q.startsWith('!gemini ')) {
      const cleanQ = q.replace(/^!(ai|gemini)\s+/, '');
      onNavigate(`aksh://research?q=${encodeURIComponent(cleanQ)}`);
      return;
    }

    if (searchMode === 'scholar') {
      onNavigate(`https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`);
      return;
    }

    if (searchMode === 'news') {
      onNavigate(`https://news.google.com/search?q=${encodeURIComponent(q)}`);
      return;
    }

    if (q.startsWith('!mindmap ') || q.startsWith('!m ')) {
      onNavigate(`aksh://mindmap?topic=${encodeURIComponent(q.replace(/^!(mindmap|m)\s+/, ''))}`);
      return;
    }

    if (q.startsWith('!code') || q.startsWith('!sandbox') || q.startsWith('!repl')) {
      onNavigate('aksh://sandbox');
      return;
    }

    if (q.startsWith('!term') || q.startsWith('!cli') || q.startsWith('!sh')) {
      onNavigate('aksh://terminal');
      return;
    }

    if (q.startsWith('!vault') || q.startsWith('!memory')) {
      const cleanQ = q.replace(/^!(vault|memory)\s*/, '');
      onNavigate(cleanQ ? `aksh://memory?q=${encodeURIComponent(cleanQ)}` : 'aksh://memory');
      return;
    }

    if (q.startsWith('!diff')) {
      onNavigate('aksh://diff');
      return;
    }

    if (q.startsWith('!tools') || q.startsWith('!toolbox')) {
      onNavigate('aksh://tools');
      return;
    }

    if (q.startsWith('!network') || q.startsWith('!radar')) {
      onNavigate('aksh://network');
      return;
    }

    if (q.startsWith('!api')) {
      onNavigate('aksh://apibuilder');
      return;
    }

    if (q.startsWith('!matrix') || q.startsWith('!models')) {
      onNavigate('aksh://matrix');
      return;
    }

    // Resolve search: if available in this web, navigates to it; if NOT available, directs to Google!
    const resolution = resolveSearchOrUrl(q, { bookmarks, history });
    onNavigate(resolution.targetUrl);
  };

  const handleTriggerVoiceSearch = () => {
    setIsListeningVoice(true);
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec.onresult = (evt: any) => {
          const text = evt.results[0][0].transcript;
          setSearchInput(text);
          setIsListeningVoice(false);
          onNavigate(`https://www.google.com/search?q=${encodeURIComponent(text)}`);
        };
        rec.onerror = () => setIsListeningVoice(false);
        rec.onend = () => setIsListeningVoice(false);
        rec.start();
        return;
      } catch {}
    }
    setTimeout(() => {
      setIsListeningVoice(false);
      const sample = 'Quantum Computing Breakthroughs 2026';
      setSearchInput(sample);
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(sample)}`);
    }, 1800);
  };

  const getShortcutIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-600 fill-amber-600/20" />;
      case 'Network':
        return <Network className="w-5 h-5 text-indigo-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-pink-600" />;
      case 'StickyNote':
        return <StickyNote className="w-5 h-5 text-emerald-600" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5 text-cyan-600 fill-cyan-600/20" />;
      case 'History':
        return <History className="w-5 h-5 text-purple-600" />;
      case 'Download':
        return <Download className="w-5 h-5 text-teal-600" />;
      case 'Settings':
        return <Settings className="w-5 h-5 text-slate-600" />;
      case 'Play':
        return <Play className="w-5 h-5 text-red-600 fill-red-600" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-slate-700" />;
      case 'Code':
        return <Code className="w-5 h-5 text-slate-800" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-amber-700" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-600 fill-purple-600/20" />;
      case 'Workflow':
        return <Workflow className="w-5 h-5 text-indigo-600" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-cyan-600" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-cyan-500" />;
      case 'Webhook':
        return <Webhook className="w-5 h-5 text-purple-600" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-400" />;
      case 'GitCompare':
        return <GitCompare className="w-5 h-5 text-cyan-400" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-cyan-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-blue-500" />;
      default:
        return <Search className="w-5 h-5 text-blue-600" />;
    }
  };

  const trendingPrompts = [
    'Quantum Computing Roadmap 2026',
    'React 19 vs Next.js 15 Features',
    'AI Agents & Model Context Protocol',
    'Transformer Self-Attention Explained',
  ];

  const allShortcuts = [...SPEED_DIAL_SHORTCUTS, ...customShortcuts];

  const PRIMARY_DEFAULT_IDS = [
    'app-search',
    'app-research',
    'app-memory',
    'app-notes',
    'app-sandbox',
    'app-bookmarks',
    'app-history',
    'app-devtools',
  ];

  const primaryShortcuts = React.useMemo(() => {
    const list: typeof allShortcuts = [];
    customShortcuts.forEach((cs) => list.push(cs));
    for (const s of SPEED_DIAL_SHORTCUTS) {
      if (PRIMARY_DEFAULT_IDS.includes(s.id) && !list.some((item) => item.url === s.url)) {
        list.push(s);
      }
    }
    return list.slice(0, 8);
  }, [customShortcuts]);

  return (
    <div className="h-full overflow-y-auto bg-slate-50/60 flex flex-col items-center justify-start px-4 py-8 select-none">
      <div className="w-full max-w-3xl flex flex-col items-center space-y-6 my-auto">
        
        {/* Minimalist Google / Browser Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center space-y-1.5 text-center select-none pt-2"
        >
          <div className="text-5xl sm:text-6xl font-medium tracking-tight font-sans flex items-center justify-center">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          {currentTime && (
            <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
              <span className="font-mono">{currentTime}</span>
              <span>•</span>
              <span>{greeting}</span>
            </div>
          )}
        </motion.div>

        {/* Minimalist Search Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/80 text-[11px] font-medium text-slate-500 shadow-2xs">
          <button
            onClick={() => {
              setSearchMode('google');
              setIsAiMode(false);
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'google' && !isAiMode
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'hover:text-slate-800'
            }`}
          >
            <span className="text-[#4285F4] font-bold text-xs">G</span>
            <span>Google</span>
          </button>

          <button
            onClick={() => {
              setSearchMode('ai');
              setIsAiMode(true);
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'ai' || isAiMode
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'hover:text-purple-700'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span>Gemini AI</span>
          </button>

          <button
            onClick={() => {
              setSearchMode('agent');
              setIsAiMode(false);
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'agent'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-xs'
                : 'hover:text-indigo-700'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>Agent Swarm</span>
          </button>
        </div>

        {/* Clean, Focused Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="w-full"
        >
          <form
            onSubmit={handleSearch}
            className="w-full relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md focus-within:border-blue-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-500/10 rounded-full px-4 py-2.5 shadow-xs transition-all"
          >
            <div className="pr-2.5 text-slate-400 shrink-0">
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                searchMode === 'agent'
                  ? 'Assign goal to Autonomous Agent Swarm...'
                  : searchMode === 'ai' || isAiMode
                  ? 'Ask Gemini 3.7 anything or enter deep research topic...'
                  : 'Search Google or type a web address...'
              }
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none py-1"
              autoFocus
            />

            <div className="flex items-center gap-1 shrink-0">
              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleTriggerVoiceSearch}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isListeningVoice
                    ? 'bg-rose-100 text-rose-600 animate-pulse'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-blue-600'
                }`}
                title="Search with Voice"
              >
                <Mic className="w-4 h-4 text-[#4285F4]" />
              </button>

              {/* Google Lens Trigger */}
              <button
                type="button"
                onClick={() => onNavigate('https://www.google.com/search?q=visual+search+google+lens')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                title="Google Lens Visual Search"
              >
                <Camera className="w-4 h-4 text-[#EA4335]" />
              </button>

              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0 ml-1"
                title="Search"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Live Search Routing Indicator (Available in web vs Direct to Google vs Autonomous Agent) */}
          {searchInput.trim().length > 1 && (() => {
            if (searchMode === 'agent') {
              return (
                <div className="mt-2.5 px-4 py-2 rounded-xl bg-violet-50/80 border border-violet-200 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-violet-800">Autonomous Agent Swarm:</span>
                    <span className="text-slate-700 truncate max-w-xs">
                      Will orchestrate multi-agent workflow for &quot;{searchInput.trim()}&quot;
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-2xs transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    Deploy Agents ↵
                  </button>
                </div>
              );
            }

            const res = resolveSearchOrUrl(searchInput, { bookmarks, history });
            return (
              <div className="mt-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 truncate">
                  {res.isAvailableInWeb ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-bold text-emerald-800">Available in this Web:</span>
                      <span className="text-slate-700 font-medium truncate max-w-xs">{res.title}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        G
                      </div>
                      <span className="font-bold text-blue-800">Not in this Web:</span>
                      <span className="text-slate-600 truncate max-w-xs">
                        Will direct to Google Search for &quot;{searchInput.trim()}&quot;
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ml-2 ${
                    res.isAvailableInWeb
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  }`}
                >
                  {res.isAvailableInWeb ? 'Open in Web ↵' : 'Direct to Google ↵'}
                </button>
              </div>
            );
          })()}

          {/* Contextual Intelligence Chips (Only when AI or Agent mode is selected, keeping Google mode pristine) */}
          {searchInput.trim().length === 0 && (searchMode === 'ai' || searchMode === 'agent') && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2 text-xs animate-in fade-in duration-150">
              {searchMode === 'agent' ? (
                <>
                  <span className="text-[10px] font-semibold text-violet-700 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-violet-600" /> Swarm Goals:
                  </span>
                  {[
                    'Audit web security & privacy leaks',
                    'Synthesize quantum error papers',
                    'Competitive analysis of AI browsers',
                  ].map((goal, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onNavigate(`aksh://agent?goal=${encodeURIComponent(goal)}`)}
                      className="px-2.5 py-0.5 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-800 text-[11px] font-medium transition-all cursor-pointer shadow-2xs hover:scale-105"
                    >
                      {goal}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" /> Frontier Topics:
                  </span>
                  {[
                    'Quantum computing roadmap 2026',
                    'Transformer self-attention explained',
                    'Model Context Protocol MCP guide',
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onNavigate(`aksh://research?q=${encodeURIComponent(topic)}`)}
                      className="px-2.5 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-medium transition-all cursor-pointer shadow-2xs hover:scale-105"
                    >
                      {topic}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Neat & Clean Speed Dial Row (Top 8 Favorite Shortcuts) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="w-full flex justify-center"
        >
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-3.5 justify-items-center">
            {primaryShortcuts.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="flex flex-col items-center gap-1.5 group w-18 cursor-pointer"
                title={`${item.title} (${item.url})`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 group-hover:border-blue-400 group-hover:shadow-md transition-all flex items-center justify-center shadow-2xs group-hover:-translate-y-0.5">
                  {getShortcutIcon(item.icon)}
                </div>
                <span className="text-[11px] text-slate-600 group-hover:text-blue-600 truncate w-full text-center font-medium transition-colors">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Three Horizontal Lines Menu Button (Under the clean home page) */}
        <div className="flex flex-col items-center pt-2 pb-1">
          <button
            type="button"
            onClick={() => setShowExtendedDrawer(!showExtendedDrawer)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all cursor-pointer group shadow-2xs ${
              showExtendedDrawer
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-100 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
            title="Three horizontal lines: Open extra apps, feeds & tools drawer"
          >
            {/* Three Horizontal Lines Icon (Menu) */}
            <Menu className={`w-4 h-4 transition-colors ${showExtendedDrawer ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
            <span className="text-xs font-medium">
              {showExtendedDrawer ? 'Close Extra Apps & Feeds' : 'More Apps & Tools'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showExtendedDrawer ? 'rotate-180 text-white' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </button>
        </div>

        {/* Collapsible Drawer (Contains all extra / secondary tools & feeds under three horizontal lines) */}
        <AnimatePresence>
          {showExtendedDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full space-y-6 pt-2 overflow-hidden"
            >
              {/* Category Filter Pills Inside Drawer */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs pb-1">
                <button
                  type="button"
                  onClick={() => setDrawerCategory('all')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    drawerCategory === 'all'
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  All Items ({allShortcuts.length} Apps + Feeds)
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerCategory('apps')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    drawerCategory === 'apps'
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Apps & Tools ({allShortcuts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerCategory('radar')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    drawerCategory === 'radar'
                      ? 'bg-purple-600 text-white font-semibold shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  AI Daily Radar
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerCategory('scratchpad')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    drawerCategory === 'scratchpad'
                      ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Scratchpad & History
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerCategory('trending')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    drawerCategory === 'trending'
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Trending Topics
                </button>
              </div>

              {/* 1. Trending Prompts (when all or trending) */}
              {(drawerCategory === 'all' || drawerCategory === 'trending') && (
                <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar justify-center flex-wrap">
                  <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    Trending:
                  </span>
                  {trendingPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate(`aksh://research?q=${encodeURIComponent(prompt)}`)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs text-[11px] whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Full Application Suite Grid (when all or apps) */}
              {(drawerCategory === 'all' || drawerCategory === 'apps') && (
                <div className="w-full p-4 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>All Applications & Developer Tools ({allShortcuts.length})</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={drawerFilter}
                        onChange={(e) => setDrawerFilter(e.target.value)}
                        placeholder="Filter tools..."
                        className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-28 sm:w-36 font-normal"
                      />
                      <button
                        onClick={() => setShowAddShortcut(true)}
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Tile</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 justify-items-center">
                    {allShortcuts
                      .filter(
                        (item) =>
                          !drawerFilter.trim() ||
                          item.title.toLowerCase().includes(drawerFilter.toLowerCase()) ||
                          item.url.toLowerCase().includes(drawerFilter.toLowerCase())
                      )
                      .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.url)}
                        className="flex flex-col items-center gap-1.5 group w-20 cursor-pointer"
                        title={`${item.title} (${item.url})`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition-all flex items-center justify-center shadow-2xs group-hover:-translate-y-0.5">
                          {getShortcutIcon(item.icon)}
                        </div>
                        <span className="text-[11px] text-slate-600 group-hover:text-blue-600 truncate w-full text-center font-medium transition-colors">
                          {item.title}
                        </span>
                      </button>
                    ))}

                    {/* Add Custom Shortcut Button */}
                    <button
                      onClick={() => setShowAddShortcut(true)}
                      className="flex flex-col items-center gap-1.5 group w-20 cursor-pointer"
                      title="Add Custom Shortcut"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-dashed border-slate-300 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-slate-500 group-hover:text-blue-600 font-medium">
                        Add Tile
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Recent History & Instant Scratchpad Row (when all or scratchpad) */}
              {(drawerCategory === 'all' || drawerCategory === 'scratchpad') && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Recent History Quick Jump */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-purple-600" />
                        <span>Jump Back In</span>
                      </span>
                      <button
                        onClick={() => onNavigate('aksh://history')}
                        className="text-[11px] text-indigo-600 hover:underline font-normal cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {history && history.length > 0 ? (
                        history.slice(0, 3).map((h) => (
                          <button
                            key={h.id}
                            onClick={() => onNavigate(h.url)}
                            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer"
                          >
                            <div className="truncate pr-2">
                              <p className="font-medium text-slate-800 group-hover:text-blue-600 truncate">
                                {h.title || h.url}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{h.url}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <div className="py-4 text-center text-slate-400 italic text-[11px]">
                          Recently visited pages will appear here.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Scratchpad */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quick Scratchpad</span>
                        </span>
                        {scratchpadSaved && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        )}
                      </div>
                      <textarea
                        value={scratchpadText}
                        onChange={(e) => {
                          setScratchpadText(e.target.value);
                          localStorage.setItem('aksh_quick_scratchpad', e.target.value);
                        }}
                        placeholder="Jot down a quick thought, link, or note..."
                        rows={3}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">Auto-saved to device</span>
                      <button
                        onClick={handleSaveScratchpad}
                        disabled={!scratchpadText.trim()}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Save to AI Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. AI Daily Intelligence Radar Card (when all or radar) */}
              {(drawerCategory === 'all' || drawerCategory === 'radar') && (
                <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <Flame className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">AI Daily Intelligence Radar</h4>
                        <p className="text-[10px] text-slate-400">Curated frontier research & technology insights</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onSaveAsNote && (
                        <button
                          onClick={handleSaveBriefingToNotes}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Save Daily Briefing to AI Notes"
                        >
                          {briefingSaved ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Saved</span>
                            </>
                          ) : (
                            <>
                              <BookmarkCheck className="w-3 h-3" />
                              <span>Save Briefing</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={handleRefreshBriefing}
                        disabled={isGeneratingBriefing}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                        title="Generate Fresh Daily Intelligence"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBriefing ? 'animate-spin text-purple-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Briefing Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {briefings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-slate-50/80 hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-200 transition-all flex flex-col justify-between space-y-2 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-purple-700 tracking-wide">
                              {b.tag}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-purple-900 transition-colors">
                            {b.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {b.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => onOpenResearch(b.query)}
                            className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-[10px] font-semibold text-purple-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Deep Research</span>
                          </button>
                          {b.sourceUrl && (
                            <button
                              onClick={() => onNavigate(b.sourceUrl!)}
                              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-[10px] transition-colors cursor-pointer"
                              title="Open Source"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Quick Collapse Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExtendedDrawer(false);
                    try {
                      localStorage.setItem('aksh_show_extended_hometab', 'false');
                    } catch {}
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Collapse back to neat view</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discreet Tour & Guide Link */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer pt-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Browser Guide</span>
          </button>
        )}

      </div>

      {/* Add Shortcut Modal */}
      <AnimatePresence>
        {showAddShortcut && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Add Speed Dial Shortcut</h3>
                <button
                  onClick={() => setShowAddShortcut(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomShortcut} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Name</label>
                  <input
                    type="text"
                    value={newShortcutTitle}
                    onChange={(e) => setNewShortcutTitle(e.target.value)}
                    placeholder="e.g. Hacker News"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">URL</label>
                  <input
                    type="text"
                    value={newShortcutUrl}
                    onChange={(e) => setNewShortcutUrl(e.target.value)}
                    placeholder="e.g. news.ycombinator.com"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddShortcut(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                  >
                    Add Shortcut
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
