import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  Home,
  Lock,
  Search,
  Star,
  BookOpen,
  Sparkles,
  MoreVertical,
  ShieldCheck,
  Zap,
  Globe,
  FileText,
  Scale,
  History,
  Bookmark as BookmarkIcon,
  Download,
  Settings,
  StickyNote,
  ExternalLink,
  Columns,
  Code2,
  Volume2,
  Network,
  Command,
  Layers,
  PanelLeftClose,
  PanelLeft,
  Cpu,
  Copy,
  Check
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';
import { SecurityShieldPopover } from './SecurityShieldPopover';

interface AddressBarProps {
  activeTab: Tab | null;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onToggleReaderMode: () => void;
  onQuickSummarize: () => void;
  onOpenAiSidebar: () => void;
  onOpenInternalView: (view: PageContentType) => void;
  onOpenCommandPalette: () => void;
  onToggleSplitScreen: () => void;
  isSplitScreen: boolean;
  onTriggerSpeech: () => void;
  isSpeaking: boolean;
  onOpenCrossTabSynthesis?: () => void;
  tabLayout?: 'horizontal' | 'vertical';
  onToggleTabLayout?: () => void;
  onOpenFindInPage?: () => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  isBookmarked,
  onToggleBookmark,
  onToggleReaderMode,
  onQuickSummarize,
  onOpenAiSidebar,
  onOpenInternalView,
  onOpenCommandPalette,
  onToggleSplitScreen,
  isSplitScreen,
  onTriggerSpeech,
  isSpeaking,
  onOpenCrossTabSynthesis,
  tabLayout = 'horizontal',
  onToggleTabLayout,
  onOpenFindInPage,
}) => {
  const [urlInput, setUrlInput] = useState(activeTab?.url || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSecurityShield, setShowSecurityShield] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ title: string; url: string; type: string }>>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopyUrl = () => {
    if (activeTab?.url) {
      navigator.clipboard.writeText(activeTab.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Sync internal tab state to address bar input
  useEffect(() => {
    if (!isFocused && activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.url, isFocused]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (shieldRef.current && !shieldRef.current.contains(e.target as Node)) {
        setShowSecurityShield(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);

    if (val.trim().length > 1) {
      // Dynamic suggestions with Bang shortcuts
      const list = [
        { title: `Ask Gemini 3.7: "${val}"`, url: `aksh://research?q=${encodeURIComponent(val)}`, type: 'ai' },
        { title: `Search Google for "${val}"`, url: `https://www.google.com/search?q=${encodeURIComponent(val)}`, type: 'search' },
        { title: `AI Mindmap: "${val}"`, url: `aksh://mindmap?topic=${encodeURIComponent(val)}`, type: 'mindmap' },
        { title: 'Top 5 Python Courses 2026', url: 'https://learn.python.org/courses/2026-guide', type: 'site' },
        { title: 'MacBook Pro vs XPS 15 vs ThinkPad', url: 'https://tech-radar.io/laptops/flagship-comparison-2026', type: 'site' },
        { title: 'Transformer Architecture PDF', url: 'aksh://pdf/transformer-paper', type: 'pdf' },
      ].filter((s) => s.title.toLowerCase().includes(val.toLowerCase()) || s.url.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(list.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let target = urlInput.trim();

    // Bang shortcuts parsing
    if (target.startsWith('!ai ') || target.startsWith('!gemini ')) {
      const q = target.replace(/^!(ai|gemini)\s+/, '');
      onNavigate(`aksh://research?q=${encodeURIComponent(q)}`);
    } else if (target.startsWith('!mindmap ') || target.startsWith('!m ')) {
      const q = target.replace(/^!(mindmap|m)\s+/, '');
      onNavigate(`aksh://mindmap?topic=${encodeURIComponent(q)}`);
    } else if (target.startsWith('!gh ')) {
      const q = target.replace(/^!gh\s+/, '');
      onNavigate(`https://github.com/search?q=${encodeURIComponent(q)}`);
    } else if (target.startsWith('!wiki ')) {
      const q = target.replace(/^!wiki\s+/, '');
      onNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`);
    } else if (target.startsWith('!g ')) {
      const q = target.replace(/^!g\s+/, '');
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
    } else if (target.startsWith('aksh://') || target.startsWith('nexus://')) {
      onNavigate(target);
    } else if (!target.includes('.') && !target.startsWith('http://') && !target.startsWith('https://')) {
      // Search query
      target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      onNavigate(target);
    } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
      onNavigate(target);
    } else {
      onNavigate(target);
    }

    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelectSuggestion = (url: string) => {
    setUrlInput(url);
    onNavigate(url);
    setIsFocused(false);
    setSuggestions([]);
  };

  const isSecure = activeTab?.url.startsWith('https://') || activeTab?.url.startsWith('aksh://') || activeTab?.url.startsWith('nexus://');
  const isInternal = Boolean(activeTab?.url.startsWith('aksh://') || activeTab?.url.startsWith('nexus://'));

  return (
    <div className="h-11 bg-white border-b border-slate-200 px-3 flex items-center gap-2 relative z-10 select-none">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        {onToggleTabLayout && (
          <button
            onClick={onToggleTabLayout}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden md:flex ${
              tabLayout === 'vertical'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={tabLayout === 'vertical' ? 'Switch to Horizontal Tabs' : 'Switch to Arc-Style Vertical Tabs'}
          >
            {tabLayout === 'vertical' ? <PanelLeft className="w-4 h-4 text-blue-600" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={onGoBack}
          disabled={!activeTab?.canGoBack}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Back (Alt+Left Arrow)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onGoForward}
          disabled={!activeTab?.canGoForward}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Forward (Alt+Right Arrow)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title={activeTab?.isLoading ? 'Stop loading' : 'Reload page (Ctrl+R)'}
        >
          {activeTab?.isLoading ? (
            <X className="w-4 h-4 text-rose-500" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onGoHome}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Home (New Tab)"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibox / Search & URL Bar */}
      <div className="flex-1 relative">
        <form onSubmit={handleSubmit} className="relative w-full">
          <div
            className={`flex items-center gap-2 h-8 px-3 rounded-xl border text-xs transition-all ${
              isFocused
                ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 text-slate-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
            }`}
          >
            {/* Security Indicator & Popover Trigger */}
            <div className="relative" ref={shieldRef}>
              <button
                type="button"
                onClick={() => setShowSecurityShield(!showSecurityShield)}
                className="flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                title="View Privacy & Security Shield (TLS, Trackers, RAM)"
              >
                {isInternal ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                ) : isSecure ? (
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {showSecurityShield && (
                <SecurityShieldPopover
                  url={activeTab?.url || 'https://google.com'}
                  isInternal={isInternal}
                  onClose={() => setShowSecurityShield(false)}
                  onOpenDevTools={() => onOpenInternalView('devtools')}
                />
              )}
            </div>

            {/* Bang Shortcut Indicator */}
            {urlInput.startsWith('!ai ') || urlInput.startsWith('!gemini ') ? (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0">
                Gemini AI
              </span>
            ) : urlInput.startsWith('!gh ') ? (
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold shrink-0">
                GitHub
              </span>
            ) : urlInput.startsWith('!m ') || urlInput.startsWith('!mindmap ') ? (
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0">
                Mindmap
              </span>
            ) : null}

            {/* URL Input */}
            <input
              ref={inputRef}
              type="text"
              value={urlInput}
              onChange={handleInputChange}
              onFocus={() => {
                setIsFocused(true);
                inputRef.current?.select();
              }}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search Google, ask Gemini (!ai), or type URL..."
              className="flex-1 bg-transparent focus:outline-none text-slate-900 placeholder-slate-400 font-mono text-xs"
            />

            {/* Quick Actions in Omnibar */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Command Palette Trigger */}
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-[10px] font-mono transition-colors cursor-pointer"
                title="Command Palette (Ctrl+K or ⌘+K)"
              >
                <Command className="w-3 h-3 text-slate-500" />
                <span>K</span>
              </button>

              {/* Copy URL Button */}
              {activeTab && activeTab.url && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                  title={copiedUrl ? 'URL Copied!' : 'Copy URL to clipboard'}
                >
                  {copiedUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Find in Page Trigger */}
              {onOpenFindInPage && (
                <button
                  type="button"
                  onClick={onOpenFindInPage}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                  title="Find in page (Ctrl+F)"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Reader Mode Toggle */}
              {activeTab && activeTab.contentType === 'web' && (
                <button
                  type="button"
                  onClick={onToggleReaderMode}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    activeTab.isReaderMode
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'hover:bg-slate-200/80 text-slate-500 hover:text-slate-800'
                  }`}
                  title="Toggle Distraction-Free Reader Mode"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick AI Page Summary Button */}
              {activeTab && (activeTab.extractedText || activeTab.pdfData) && (
                <button
                  type="button"
                  onClick={onQuickSummarize}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all font-sans text-[11px] font-semibold cursor-pointer"
                  title="✨ Summarize Page with Aksh AI"
                >
                  <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span className="hidden sm:inline">Summarize</span>
                </button>
              )}

              {/* Bookmark Star Toggle */}
              <button
                type="button"
                onClick={onToggleBookmark}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/80'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this tab'}
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            </div>
          </div>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 py-1">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => handleSelectSuggestion(item.url)}
                className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs text-slate-800 group border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.type === 'ai' ? (
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  ) : item.type === 'mindmap' ? (
                    <Network className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  ) : item.type === 'pdf' ? (
                    <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : item.type === 'search' ? (
                    <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate">
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  {item.url}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-1">
        {/* Split Screen Toggle */}
        <button
          onClick={onToggleSplitScreen}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isSplitScreen
              ? 'bg-purple-100 text-purple-700 border border-purple-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Split-Screen View (Side-by-Side Dual Pane)"
        >
          <Columns className="w-4 h-4" />
        </button>

        {/* Read Aloud TTS / Podcastifier */}
        <button
          onClick={onTriggerSpeech}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isSpeaking
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Read Aloud Webpage & AI Audio Podcast"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Main Browser Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            showMenu ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Main Menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 text-xs">
            <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>AI Tools & Workflows</span>
              <Sparkles className="w-3 h-3 text-blue-600" />
            </div>

            {onOpenCrossTabSynthesis && (
              <button
                onClick={() => {
                  onOpenCrossTabSynthesis();
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-purple-900">Cross-Tab Synthesis</div>
                  <div className="text-[10px] text-slate-400">Synthesize multiple open tabs</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                onOpenInternalView('research');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Deep Research</div>
                <div className="text-[10px] text-slate-400">Autonomous multi-source research</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('mindmap');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Network className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Concept Mindmap</div>
                <div className="text-[10px] text-slate-400">Visual knowledge graphs</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('comparison');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Scale className="w-4 h-4 text-pink-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Product Comparison</div>
                <div className="text-[10px] text-slate-400">Side-by-side specs showdown</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('pdf');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">PDF Intelligence</div>
                <div className="text-[10px] text-slate-400">Paper analysis & quizzes</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('notes');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <StickyNote className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Cornell Notes</div>
                <div className="text-[10px] text-slate-400">Structured markdown notebook</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('devtools');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">AI DevTools</div>
                <div className="text-[10px] text-slate-400">DOM inspector & web agent</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100" />
            <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Browser Essentials
            </div>

            {onOpenFindInPage && (
              <button
                onClick={() => {
                  onOpenFindInPage();
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Find in Page</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+F</span>
              </button>
            )}

            {onToggleTabLayout && (
              <button
                onClick={() => {
                  onToggleTabLayout();
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Columns className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{tabLayout === 'vertical' ? 'Switch to Top Tabs' : 'Switch to Vertical Tabs (Arc)'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenInternalView('bookmarks');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <BookmarkIcon className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Bookmarks Manager</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('history');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-blue-500 shrink-0" />
              <span>History</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('downloads');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Downloads</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('readme');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Documentation & Guide</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('settings');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
