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
  ExternalLink
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
  const [searchMode, setSearchMode] = useState<'google' | 'ai' | 'scholar' | 'news'>('google');
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

  return (
    <div className="h-full overflow-y-auto bg-slate-50/60 flex flex-col items-center justify-start px-4 py-8 select-none">
      <div className="w-full max-w-3xl flex flex-col items-center space-y-6 my-auto">
        
        {/* Live Clock & Gentle Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center space-y-1 text-center"
        >
          {currentTime && (
            <div className="text-4xl sm:text-5xl font-extralight tracking-tight text-slate-800 font-mono">
              {currentTime}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>{greeting}, Explorer</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Gemini 3.7 Active</span>
          </div>
        </motion.div>

        {/* Search Engine Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => {
              setSearchMode('google');
              setIsAiMode(false);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'google' && !isAiMode
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-[#4285F4] font-bold">G</span>
            <span>Google Search</span>
          </button>

          <button
            onClick={() => {
              setSearchMode('ai');
              setIsAiMode(true);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'ai' || isAiMode
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini 3.7 Research</span>
          </button>

          <button
            onClick={() => {
              setSearchMode('scholar');
              setIsAiMode(false);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'scholar'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scholar</span>
          </button>

          <button
            onClick={() => {
              setSearchMode('news');
              setIsAiMode(false);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'news'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>News</span>
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
            className="w-full relative flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl p-1.5 shadow-sm transition-all"
          >
            <div className="pl-3.5 pr-2 text-slate-400 shrink-0">
              <Search className="w-5 h-5 text-blue-600" />
            </div>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                searchMode === 'ai' || isAiMode
                  ? 'Ask Gemini 3.7 anything or enter deep research topic...'
                  : searchMode === 'scholar'
                  ? 'Search academic papers, journals, citations...'
                  : searchMode === 'news'
                  ? 'Search breaking global news and live headlines...'
                  : 'Search Google or type a web address...'
              }
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base focus:outline-none py-2 px-1"
              autoFocus
            />

            <div className="flex items-center gap-1.5 pr-1 shrink-0">
              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleTriggerVoiceSearch}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
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
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                title="Google Lens Visual Search"
              >
                <Camera className="w-4 h-4 text-[#EA4335]" />
              </button>

              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
                title="Search"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Live Search Routing Indicator (Available in web vs Direct to Google) */}
          {searchInput.trim().length > 1 && (() => {
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
        </motion.div>

        {/* AI Suggested Trending Research Chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="w-full flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar justify-center flex-wrap"
        >
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
        </motion.div>

        {/* Application Shortcuts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="w-full"
        >
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 justify-items-center">
            {allShortcuts.slice(0, 16).map((item) => (
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
        </motion.div>

        {/* Recent History & Instant Scratchpad Row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
        >
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
        </motion.div>

        {/* AI Daily Intelligence Radar Card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3"
        >
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
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100/70 text-purple-800">
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
        </motion.div>

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
