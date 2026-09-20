import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Zap,
  Sparkles,
  Columns,
  Code2,
  Volume2,
  FileText,
  Scale,
  StickyNote,
  Bookmark,
  History,
  Download,
  Settings,
  ArrowRight,
  Globe,
  Network,
  Maximize2,
  Trash2,
  Cpu,
  Layers,
  Radio,
  Table,
  Bot,
  BookOpen,
  Camera,
  Activity,
  HelpCircle,
  Database,
  Archive,
  Headphones,
  Scissors,
  Copy,
  Check,
  BookmarkPlus,
  Calculator,
  RefreshCw,
  CornerDownLeft
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Tab, PageContentType } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onNavigateTab: (tabId: string, url: string) => void;
  onOpenNewTab: (url?: string) => void;
  onToggleSplitScreen: () => void;
  onOpenAiSidebar: () => void;
  onToggleReaderMode: () => void;
  onTriggerSpeech: () => void;
  onOpenInternalView: (view: PageContentType) => void;
  onAutoClusterTabs?: () => void;
  onOpenTour?: () => void;
  onOpenSnapshot?: () => void;
  onOpenPerformance?: () => void;
  onMindmapPage?: () => void;
  onExportMarkdown?: () => void;
  onOpenDataExtractor?: () => void;
  onOpenSessionStash?: () => void;
  onToggleAmbientSound?: () => void;
  onOpenWebClipper?: () => void;
  onSaveAsNote?: (title: string, content: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onNavigateTab,
  onOpenNewTab,
  onToggleSplitScreen,
  onOpenAiSidebar,
  onToggleReaderMode,
  onTriggerSpeech,
  onOpenInternalView,
  onAutoClusterTabs,
  onOpenTour,
  onOpenSnapshot,
  onOpenPerformance,
  onMindmapPage,
  onExportMarkdown,
  onOpenDataExtractor,
  onOpenSessionStash,
  onToggleAmbientSound,
  onOpenWebClipper,
  onSaveAsNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiAnswer, setAiAnswer] = useState<{ query: string; text: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setAiAnswer(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Safe arithmetic evaluator
  const getMathResult = (expr: string): string | null => {
    const clean = expr.trim().replace(/^=/, '').trim();
    if (!clean || clean.length < 3) return null;
    // Allow digits, spaces, +, -, *, /, %, (, ), ., ^
    if (!/^[\d\s+\-*/%.()^]+$/.test(clean)) return null;
    // Must contain at least one math operator
    if (!/[+\-*/%.^]/.test(clean)) return null;
    try {
      // Replace ^ with ** for exponentiation
      const sanitized = clean.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      const res = Function(`'use strict'; return (${sanitized})`)();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        return res.toLocaleString(undefined, { maximumFractionDigits: 6 });
      }
    } catch {
      return null;
    }
    return null;
  };

  const mathResult = getMathResult(query);

  const handleAskAi = async (userPrompt: string) => {
    const cleanPrompt = userPrompt.replace(/^(!ai|\?)\s*/i, '').trim();
    if (!cleanPrompt) return;
    setIsAiLoading(true);
    setAiAnswer({ query: cleanPrompt, text: '' });
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanPrompt,
          conversationHistory: [],
          mode: 'general',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnswer({ query: cleanPrompt, text: data.reply || 'No answer returned.' });
      } else {
        setAiAnswer({ query: cleanPrompt, text: 'Unable to reach Aksh AI service.' });
      }
    } catch {
      setAiAnswer({ query: cleanPrompt, text: 'Error contacting AI engine.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Define commands
  const allCommands = [
    // Help & Discovery
    {
      id: 'browser-tour',
      title: 'Interactive User Guide & Feature Tour',
      subtitle: 'Learn how to master all AI tools, split screen, and research workflows',
      category: 'Getting Started',
      icon: HelpCircle,
      iconColor: 'text-blue-600',
      action: () => {
        if (onOpenTour) onOpenTour();
        onClose();
      },
    },
    // Advanced Tools
    {
      id: 'ai-web-clipper',
      title: 'AI Web Clipper (Clip to Notes)',
      subtitle: 'Summarize key takeaways, extract academic citations, and save to notes',
      category: 'AI Intelligence',
      icon: Scissors,
      iconColor: 'text-blue-600',
      action: () => {
        if (onOpenWebClipper) onOpenWebClipper();
        onClose();
      },
    },
    {
      id: 'ai-data-extractor',
      title: 'AI Web Scraper & Structured Table Extractor',
      subtitle: 'Extract data tables, resource links, and AI custom schemas to CSV/JSON',
      category: 'Page Tools',
      icon: Database,
      iconColor: 'text-emerald-600',
      action: () => {
        if (onOpenDataExtractor) onOpenDataExtractor();
        onClose();
      },
    },
    {
      id: 'session-stash',
      title: 'Session Stash & Tab Snapshots',
      subtitle: 'Save active tabs as named memory snapshots and restore complete workspaces',
      category: 'Productivity',
      icon: Archive,
      iconColor: 'text-amber-600',
      action: () => {
        if (onOpenSessionStash) onOpenSessionStash();
        onClose();
      },
    },
    {
      id: 'ambient-soundscapes',
      title: 'Focus Ambient Soundscapes',
      subtitle: 'Synthesize gentle rain, ocean waves, brown noise, or 432Hz alpha tones',
      category: 'Productivity',
      icon: Headphones,
      iconColor: 'text-indigo-600',
      action: () => {
        if (onToggleAmbientSound) onToggleAmbientSound();
        onClose();
      },
    },
    // Page Tools
    {
      id: 'page-snapshot',
      title: 'Page Snapshot & Gemini AI Vision',
      subtitle: 'Capture high-res viewport and analyze visual diagrams & layout',
      category: 'Page Tools',
      icon: Camera,
      iconColor: 'text-emerald-600',
      action: () => {
        if (onOpenSnapshot) onOpenSnapshot();
        onClose();
      },
    },
    {
      id: 'site-performance',
      title: 'Site Telemetry & Performance HUD',
      subtitle: 'Monitor tab memory, page latency, HTTP/3, and tracker blocks',
      category: 'Developer',
      icon: Activity,
      iconColor: 'text-amber-600',
      action: () => {
        if (onOpenPerformance) onOpenPerformance();
        onClose();
      },
    },
    {
      id: 'page-mindmap',
      title: 'Convert Current Page to Visual Mindmap',
      subtitle: 'Generate hierarchical concept graph nodes from active webpage text',
      category: 'AI Intelligence',
      icon: Network,
      iconColor: 'text-cyan-600',
      action: () => {
        if (onMindmapPage) {
          onMindmapPage();
        } else {
          const topic = activeTab?.title || 'Web Research';
          onOpenNewTab(`aksh://mindmap?topic=${encodeURIComponent(topic)}`);
        }
        onClose();
      },
    },
    {
      id: 'page-markdown',
      title: 'Export Active Page as Markdown Dossier',
      subtitle: 'Download structured .md summary document with citations',
      category: 'Productivity',
      icon: FileText,
      iconColor: 'text-rose-600',
      action: () => {
        if (onExportMarkdown) onExportMarkdown();
        onClose();
      },
    },
    // AI Tools
    {
      id: 'ai-sidebar',
      title: 'Open Aksh AI Co-Pilot',
      subtitle: 'Context-aware chat and synthesis with Gemini 3.7 Flash',
      category: 'AI Intelligence',
      icon: Sparkles,
      iconColor: 'text-indigo-600',
      action: () => {
        onOpenAiSidebar();
        onClose();
      },
    },
    {
      id: 'ai-research',
      title: 'Launch AI Deep Research Mode',
      subtitle: 'Multi-source autonomous query synthesis with live web citations',
      category: 'AI Intelligence',
      icon: Zap,
      iconColor: 'text-amber-600',
      action: () => {
        onOpenNewTab('aksh://research');
        onClose();
      },
    },
    {
      id: 'ai-mindmap',
      title: 'Generate Concept Mindmap & Knowledge Graph',
      subtitle: 'Convert current topic into an interactive visual graph',
      category: 'AI Intelligence',
      icon: Network,
      iconColor: 'text-cyan-600',
      action: () => {
        const topic = activeTab?.title || 'Artificial Intelligence 2026';
        onOpenNewTab(`aksh://mindmap?topic=${encodeURIComponent(topic)}`);
        onClose();
      },
    },
    {
      id: 'ai-devtools-agent',
      title: 'Launch Autonomous Web Agent & DOM Inspector',
      subtitle: 'AI DOM exploration, goal execution & security audit in DevTools',
      category: 'Developer',
      icon: Bot,
      iconColor: 'text-purple-600',
      action: () => {
        onOpenNewTab('aksh://devtools');
        onClose();
      },
    },
    {
      id: 'ai-organize-tabs',
      title: 'AI Smart Tab Workspaces & Auto-Grouping',
      subtitle: 'Cluster open tabs into semantic workspaces with custom labels',
      category: 'Workspace',
      icon: Layers,
      iconColor: 'text-blue-600',
      action: () => {
        if (onAutoClusterTabs) {
          onAutoClusterTabs();
        }
        onClose();
      },
    },
    {
      id: 'ai-tts',
      title: 'Read Aloud Webpage (Text-to-Speech)',
      subtitle: 'Listen to the active page content with speech synthesis',
      category: 'Audio & Accessibility',
      icon: Volume2,
      iconColor: 'text-emerald-600',
      action: () => {
        onTriggerSpeech();
        onClose();
      },
    },
    {
      id: 'ai-devtools',
      title: 'Open AI DevTools & DOM Security Inspector',
      subtitle: 'Live network requests, DOM tree, security audit & code intelligence',
      category: 'Developer',
      icon: Code2,
      iconColor: 'text-blue-600',
      action: () => {
        onOpenNewTab('aksh://devtools');
        onClose();
      },
    },
    {
      id: 'split-screen',
      title: 'Toggle Split-Screen Multitasking (Dual-Pane)',
      subtitle: 'Browse two tabs side-by-side with cross-tab AI comparison',
      category: 'Workspace',
      icon: Columns,
      iconColor: 'text-purple-600',
      action: () => {
        onToggleSplitScreen();
        onClose();
      },
    },
    {
      id: 'reader-mode',
      title: 'Toggle Distraction-Free Reader Mode',
      subtitle: 'Clean article layout stripping ads and clutter',
      category: 'Browser',
      icon: FileText,
      iconColor: 'text-slate-600',
      action: () => {
        onToggleReaderMode();
        onClose();
      },
    },
    {
      id: 'product-compare',
      title: 'AI Product Comparison & Decision Matrix',
      subtitle: 'Compare hardware specifications & benchmark ratings',
      category: 'AI Intelligence',
      icon: Scale,
      iconColor: 'text-pink-600',
      action: () => {
        onOpenNewTab('aksh://comparison');
        onClose();
      },
    },
    {
      id: 'notes-kb',
      title: 'Open AI Notes & Knowledge Base',
      subtitle: 'Cornell notes, saved dossiers & markdown exporter',
      category: 'Knowledge',
      icon: StickyNote,
      iconColor: 'text-amber-600',
      action: () => {
        onOpenNewTab('aksh://notes');
        onClose();
      },
    },
    {
      id: 'view-bookmarks',
      title: 'Open Bookmarks Manager',
      subtitle: 'Organized folders, tags and saved links',
      category: 'Browser',
      icon: Bookmark,
      iconColor: 'text-amber-600',
      action: () => {
        onOpenNewTab('aksh://bookmarks');
        onClose();
      },
    },
    {
      id: 'view-history',
      title: 'Open Browsing History',
      subtitle: 'Chronological timeline of visited URLs',
      category: 'Browser',
      icon: History,
      iconColor: 'text-blue-600',
      action: () => {
        onOpenNewTab('aksh://history');
        onClose();
      },
    },
    {
      id: 'view-downloads',
      title: 'Open Downloads Manager',
      subtitle: 'Active and completed file downloads',
      category: 'Browser',
      icon: Download,
      iconColor: 'text-emerald-600',
      action: () => {
        onOpenNewTab('aksh://downloads');
        onClose();
      },
    },
    {
      id: 'view-settings',
      title: 'Open Browser Settings',
      subtitle: 'Customize AI preferences, themes & search engines',
      category: 'System',
      icon: Settings,
      iconColor: 'text-slate-600',
      action: () => {
        onOpenNewTab('aksh://settings');
        onClose();
      },
    },
    {
      id: 'view-readme',
      title: 'Open System Documentation & README',
      subtitle: 'Interactive architectural manual, API specs & feature guide',
      category: 'Help & Docs',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      action: () => {
        onOpenNewTab('aksh://readme');
        onClose();
      },
    },
  ];

  // Also include open tabs in search results
  const tabCommands = tabs.map((t) => ({
    id: `tab-${t.id}`,
    title: t.title,
    subtitle: t.url,
    category: 'Open Tabs',
    icon: Globe,
    iconColor: 'text-blue-600',
    action: () => {
      onSelectTab(t.id);
      onClose();
    },
  }));

  const allItems = [...allCommands, ...tabCommands];

  // Dynamic AI & Bang commands when user types
  const dynamicCommands = [];
  const trimmed = query.trim();

  if (trimmed) {
    if (trimmed.startsWith('!research ')) {
      const topic = trimmed.replace(/^!research\s+/i, '');
      dynamicCommands.push({
        id: 'bang-research',
        title: `Deep Research: "${topic}"`,
        subtitle: 'Multi-source autonomous synthesis with search grounding',
        category: 'AI Quick Bang',
        icon: Zap,
        iconColor: 'text-amber-600',
        action: () => {
          onNavigateTab(activeTabId, `aksh://research?q=${encodeURIComponent(topic)}`);
          onClose();
        },
      });
    } else if (trimmed.startsWith('!mindmap ')) {
      const topic = trimmed.replace(/^!mindmap\s+/i, '');
      dynamicCommands.push({
        id: 'bang-mindmap',
        title: `Generate Mindmap: "${topic}"`,
        subtitle: 'Interactive topological knowledge graph & sub-concept branching',
        category: 'AI Quick Bang',
        icon: Network,
        iconColor: 'text-cyan-600',
        action: () => {
          onNavigateTab(activeTabId, `aksh://mindmap?topic=${encodeURIComponent(topic)}`);
          onClose();
        },
      });
    } else if (trimmed.startsWith('!compare ')) {
      const items = trimmed.replace(/^!compare\s+/i, '');
      dynamicCommands.push({
        id: 'bang-compare',
        title: `Compare Products/Tech: "${items}"`,
        subtitle: 'Head-to-head specifications matrix & buyer verdict',
        category: 'AI Quick Bang',
        icon: Scale,
        iconColor: 'text-pink-600',
        action: () => {
          onNavigateTab(activeTabId, `aksh://comparison`);
          onClose();
        },
      });
    } else {
      // General Instant AI Ask item
      dynamicCommands.push({
        id: 'ask-gemini-instant',
        title: `Ask Aksh AI: "${trimmed.replace(/^(!ai|\?)\s*/i, '')}"`,
        subtitle: 'Instant Gemini 3.7 streaming answer with markdown synthesis',
        category: 'AI Intelligence',
        icon: Sparkles,
        iconColor: 'text-blue-600',
        action: () => handleAskAi(trimmed),
      });
    }
  }

  const baseFiltered = trimmed
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(trimmed.toLowerCase()) ||
          item.category.toLowerCase().includes(trimmed.toLowerCase())
      )
    : allItems;

  const filteredItems = [...dynamicCommands, ...baseFiltered];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        // Direct navigate or search
        onOpenNewTab(
          query.startsWith('http') || query.startsWith('aksh://')
            ? query
            : `https://www.google.com/search?q=${encodeURIComponent(query)}`
        );
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh] shadow-slate-900/20"
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, ask Aksh AI, or use !research, !mindmap, !compare..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 border border-slate-300 text-[10px] text-slate-600 font-mono font-bold">
            ESC
          </kbd>
        </div>

        {/* Live Math Calculator Result Chip */}
        {mathResult && (
          <div className="mx-3.5 mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-500 font-mono">{query.trim()} =</span>
              <span className="font-mono font-extrabold text-sm text-emerald-900">{mathResult}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(mathResult);
                setAiCopied(true);
                setTimeout(() => setAiCopied(false), 2000);
              }}
              className="px-2 py-1 rounded-md bg-white border border-emerald-300 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer shadow-2xs"
            >
              {aiCopied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>
        )}

        {/* Live AI Quick Answer Card */}
        {aiAnswer && (
          <div className="mx-3.5 mt-2.5 p-3.5 rounded-xl bg-slate-900 text-white space-y-2.5 shadow-lg border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 truncate pr-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-xs font-bold text-blue-300 shrink-0">Aksh AI Answer</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">"{aiAnswer.query}"</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiAnswer.text);
                    setAiCopied(true);
                    setTimeout(() => setAiCopied(false), 2000);
                  }}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Answer"
                >
                  {aiCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {onSaveAsNote && (
                  <button
                    onClick={() => {
                      onSaveAsNote(`AI Q&A: ${aiAnswer.query}`, aiAnswer.text);
                      setAiSaved(true);
                      setTimeout(() => setAiSaved(false), 2500);
                    }}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Save to AI Notes"
                  >
                    {aiSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenAiSidebar();
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Ask in Sidebar →
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto pr-1">
              {isAiLoading ? (
                <div className="flex items-center gap-2 py-4 justify-center text-blue-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-xs font-medium">Synthesizing instant response with Gemini 3.7...</span>
                </div>
              ) : (
                <div className="markdown-body text-slate-200 text-xs">
                  <Markdown>{aiAnswer.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No matching commands found</p>
              <p className="text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600 font-bold">Enter</kbd> to search Google or navigate to "{query}"
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const ItemIcon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-slate-900 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 ${item.iconColor}`}
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono font-medium border border-slate-200">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-normal">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-3">
                    {isSelected && (
                      <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        <span>Execute</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono font-bold">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono font-bold">↵</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono font-bold">esc</kbd> to dismiss
            </span>
          </div>
          <div className="font-mono text-slate-600 font-semibold">Aksh Spotlight Engine</div>
        </div>
      </motion.div>
    </div>
  );
};

