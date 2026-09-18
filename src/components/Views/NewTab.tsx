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
  Compass
} from 'lucide-react';
import { SPEED_DIAL_SHORTCUTS } from '../../data/mockWebsites';
import { Bookmark as BookmarkType, HistoryItem } from '../../types';

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

    if (isAiMode || q.startsWith('!ai ') || q.startsWith('!gemini ')) {
      const cleanQ = q.replace(/^!(ai|gemini)\s+/, '');
      onNavigate(`aksh://research?q=${encodeURIComponent(cleanQ)}`);
      return;
    }

    if (q.startsWith('!mindmap ') || q.startsWith('!m ')) {
      onNavigate(`aksh://mindmap?topic=${encodeURIComponent(q.replace(/^!(mindmap|m)\s+/, ''))}`);
      return;
    }

    const lower = q.toLowerCase();
    if (lower === 'research' || lower === 'deep research') {
      onNavigate('aksh://research');
      return;
    }
    if (lower === 'mindmap' || lower === 'concept mindmap') {
      onNavigate('aksh://mindmap');
      return;
    }
    if (lower === 'pdf' || lower === 'pdf reader') {
      onNavigate('aksh://pdf');
      return;
    }
    if (lower === 'compare' || lower === 'comparison') {
      onNavigate('aksh://comparison');
      return;
    }
    if (lower === 'notes' || lower === 'ai notes') {
      onNavigate('aksh://notes');
      return;
    }
    if (lower === 'bookmarks') {
      onNavigate('aksh://bookmarks');
      return;
    }
    if (lower === 'history') {
      onNavigate('aksh://history');
      return;
    }
    if (lower === 'downloads') {
      onNavigate('aksh://downloads');
      return;
    }
    if (lower === 'settings') {
      onNavigate('aksh://settings');
      return;
    }
    if (lower === 'devtools' || lower === 'inspect') {
      onNavigate('aksh://devtools');
      return;
    }
    if (lower === 'home' || lower === 'new tab') {
      onNavigate('aksh://newtab');
      return;
    }

    if (
      q.startsWith('http://') ||
      q.startsWith('https://') ||
      q.startsWith('aksh://') ||
      q.startsWith('nexus://')
    ) {
      onNavigate(q);
      return;
    }

    onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
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
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                isAiMode
                  ? 'Ask Gemini 3.7 anything or enter research topic...'
                  : 'Search the live web or type a URL...'
              }
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base focus:outline-none py-2 px-1"
              autoFocus
            />

            <div className="flex items-center gap-1.5 pr-1 shrink-0">
              {/* AI Mode Quick Toggle */}
              <button
                type="button"
                onClick={() => setIsAiMode(!isAiMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isAiMode
                    ? 'bg-purple-600 text-white shadow-xs shadow-purple-500/20'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
                title="Toggle Gemini Deep AI Search Mode"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
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
            {allShortcuts.slice(0, 13).map((item) => (
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
