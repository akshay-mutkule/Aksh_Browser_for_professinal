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
  Check,
  Camera,
  Activity,
  HelpCircle,
  Database,
  Archive,
  Headphones,
  Calculator,
  Printer,
  Maximize2,
  Minus,
  Plus,
  Moon,
  Sun,
  Palette,
  Layout,
  Trash2,
  Shield,
  EyeOff
} from 'lucide-react';
import { Tab, PageContentType, BrowserSettings } from '../../types';
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
  onOpenTour?: () => void;
  onOpenSnapshot?: () => void;
  onOpenPerformance?: () => void;
  onMindmapPage?: () => void;
  onExportMarkdown?: () => void;
  onOpenDataExtractor?: () => void;
  onOpenSessionStash?: () => void;
  onToggleAmbientSound?: () => void;
  isAmbientPlaying?: boolean;
  // Browser settings & controls for the 3-dot menu
  settings?: BrowserSettings;
  onUpdateSettings?: (newSettings: Partial<BrowserSettings>) => void;
  onClearBrowsingData?: () => void;
  onNewTab?: () => void;
  onNewIncognitoTab?: () => void;
  onReopenClosedTab?: () => void;
  canReopenClosedTab?: boolean;
  onOpenShortcuts?: () => void;
  zoomLevel?: number;
  onChangeZoom?: (delta: number) => void;
  onResetZoom?: () => void;
  onToggleFullscreen?: () => void;
  onPrintPage?: () => void;
}

const evaluateMathExpression = (expr: string): string | null => {
  const clean = expr.trim();
  const percentMatch = clean.match(/^([\d.]+)\s*%\s*(?:of|\*)\s*([\d.]+)$/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    if (!isNaN(p) && !isNaN(total)) {
      return String((p / 100) * total);
    }
  }

  if (/^[\d\s+\-*/().^%]+$/.test(clean) && /[+\-*/^%]/.test(clean)) {
    try {
      const sanitized = clean.replace(/\^/g, '**');
      const result = new Function(`"use strict"; return (${sanitized});`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(4)));
      }
    } catch {
      return null;
    }
  }
  return null;
};

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
  onOpenTour,
  onOpenSnapshot,
  onOpenPerformance,
  onMindmapPage,
  onExportMarkdown,
  onOpenDataExtractor,
  onOpenSessionStash,
  onToggleAmbientSound,
  isAmbientPlaying = false,
  settings,
  onUpdateSettings,
  onClearBrowsingData,
  onNewTab,
  onNewIncognitoTab,
  onReopenClosedTab,
  canReopenClosedTab = false,
  onOpenShortcuts,
  zoomLevel = 100,
  onChangeZoom,
  onResetZoom,
  onToggleFullscreen,
  onPrintPage,
}) => {
  const [urlInput, setUrlInput] = useState(activeTab?.url || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuTab, setMenuTab] = useState<'tools' | 'settings'>('tools');
  const [showSecurityShield, setShowSecurityShield] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [calcResult, setCalcResult] = useState<string | null>(null);
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

    // Live math calculation
    const calc = evaluateMathExpression(val);
    setCalcResult(calc);

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

    // If there is an active calculation and user presses enter, copy and insert calculation
    if (calcResult !== null) {
      navigator.clipboard.writeText(calcResult);
      setUrlInput(calcResult);
      setIsFocused(false);
      return;
    }

    // Bang shortcuts parsing
    if (target.startsWith('!scrape') || target.startsWith('!extract')) {
      onOpenDataExtractor?.();
      setIsFocused(false);
      return;
    } else if (target.startsWith('!stash') || target.startsWith('!session')) {
      onOpenSessionStash?.();
      setIsFocused(false);
      return;
    } else if (target.startsWith('!sound') || target.startsWith('!ambient')) {
      onToggleAmbientSound?.();
      setIsFocused(false);
      return;
    } else if (target.startsWith('!zen') || target.startsWith('!focus')) {
      onToggleReaderMode();
      setIsFocused(false);
      return;
    } else if (target.startsWith('!ai ') || target.startsWith('!gemini ')) {
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

        {/* Autocomplete Suggestions & Math Dropdown */}
        {isFocused && (calcResult !== null || suggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 py-1">
            {/* Live Calculation Preview */}
            {calcResult !== null && (
              <div
                onMouseDown={() => {
                  setUrlInput(calcResult);
                  navigator.clipboard.writeText(calcResult);
                }}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/70 border-b border-emerald-100 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-emerald-600 text-white">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-slate-600 font-mono">{urlInput} = </span>
                    <span className="font-bold text-emerald-800 font-mono text-sm">{calcResult}</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                  Click to Copy
                </span>
              </div>
            )}

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

      {/* Toolbar Controls (Hidden on small mobile screens to prevent omnibox squishing) */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {/* AI Web Scraper & Data Extractor */}
        {onOpenDataExtractor && (
          <button
            onClick={onOpenDataExtractor}
            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="AI Web Scraper & Structured Table Extractor"
          >
            <Database className="w-4 h-4 text-emerald-600" />
          </button>
        )}

        {/* Session Stash & Snapshots */}
        {onOpenSessionStash && (
          <button
            onClick={onOpenSessionStash}
            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
            title="Session Stash & Tab Snapshots (Save / Restore Workspaces)"
          >
            <Archive className="w-4 h-4 text-amber-600" />
          </button>
        )}

        {/* Focus Ambient Soundscapes */}
        {onToggleAmbientSound && (
          <button
            onClick={onToggleAmbientSound}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isAmbientPlaying
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 shadow-2xs'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Procedural Focus Soundscapes (Rain, Ocean Waves, Brown Noise, 432Hz)"
          >
            <Headphones className={`w-4 h-4 ${isAmbientPlaying ? 'animate-pulse text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Page Snapshot & AI Vision */}
        {onOpenSnapshot && (
          <button
            onClick={onOpenSnapshot}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Capture Page Snapshot & Gemini Vision Analysis"
          >
            <Camera className="w-4 h-4 text-slate-600 hover:text-emerald-600" />
          </button>
        )}

        {/* Site Performance HUD */}
        {onOpenPerformance && (
          <button
            onClick={onOpenPerformance}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Site Telemetry & Performance HUD (RAM, Latency, HTTP/3)"
          >
            <Activity className="w-4 h-4 text-slate-600 hover:text-amber-600" />
          </button>
        )}

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

        {/* Interactive Feature Tour & Guide */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border border-blue-200 shadow-2xs"
            title="Interactive Feature Guide & Tour"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        )}
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
          <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-88 max-h-[85vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 text-xs overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100">
            {/* Header: Browser Info & Engine Status */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  A
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[12px] flex items-center gap-1.5 leading-tight">
                    <span>Aksh AI Browser</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">v2.4</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini 3.7 Flash Engine Active</span>
                  </div>
                </div>
              </div>
              {activeTab?.groupName === 'Incognito' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px] font-semibold flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Incognito
                </span>
              )}
            </div>

            {/* Quick Actions: Zoom Controls, Fullscreen & Print */}
            <div className="px-3 py-2 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-500 mr-0.5">Zoom</span>
                <button
                  onClick={() => onChangeZoom && onChangeZoom(-10)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 font-bold cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onResetZoom && onResetZoom()}
                  className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-800 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                  title="Reset Zoom to 100%"
                >
                  {zoomLevel}%
                </button>
                <button
                  onClick={() => onChangeZoom && onChangeZoom(10)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 font-bold cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                {onToggleFullscreen && (
                  <button
                    onClick={() => onToggleFullscreen()}
                    className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onPrintPage && (
                  <button
                    onClick={() => {
                      onPrintPage();
                      setShowMenu(false);
                    }}
                    className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Print Page (Ctrl+P)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Copy Page URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Menu Tab Switcher */}
            <div className="p-2 border-b border-slate-200 bg-white shrink-0">
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setMenuTab('tools')}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    menuTab === 'tools'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Browser Tools</span>
                </button>
                <button
                  onClick={() => setMenuTab('settings')}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    menuTab === 'settings'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Quick Settings</span>
                </button>
              </div>
            </div>

            {/* Scrollable Tab Body */}
            <div className="flex-1 overflow-y-auto py-1">
              {menuTab === 'settings' ? (
                /* ALL BROWSER SETTINGS TAB */
                <div className="px-3 py-2 space-y-4 text-xs">
                  {/* Theme / Appearance */}
                  <div>
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-indigo-600" />
                      <span>Appearance & Theme</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'cyber', label: 'Cyber', icon: Sparkles },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateSettings && onUpdateSettings({ theme: t.id as any })}
                          className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            settings?.theme === t.id
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <t.icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Strip Layout */}
                  <div>
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                      <Layout className="w-3 h-3 text-blue-600" />
                      <span>Tab Strip Layout</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          if (tabLayout === 'vertical' && onToggleTabLayout) onToggleTabLayout();
                          if (onUpdateSettings) onUpdateSettings({ tabLayout: 'horizontal' });
                        }}
                        className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          tabLayout !== 'vertical'
                            ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>Top Tabs</span>
                      </button>
                      <button
                        onClick={() => {
                          if (tabLayout !== 'vertical' && onToggleTabLayout) onToggleTabLayout();
                          if (onUpdateSettings) onUpdateSettings({ tabLayout: 'vertical' });
                        }}
                        className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          tabLayout === 'vertical'
                            ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>Arc Vertical</span>
                      </button>
                    </div>
                  </div>

                  {/* Default Search Engine */}
                  <div>
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-blue-600" />
                      <span>Default Search Engine</span>
                    </div>
                    <select
                      value={settings?.searchEngine || 'google'}
                      onChange={(e) => onUpdateSettings && onUpdateSettings({ searchEngine: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="google">Google Search (Default)</option>
                      <option value="duckduckgo">DuckDuckGo (Strict Privacy)</option>
                      <option value="bing">Microsoft Bing</option>
                      <option value="ai">Gemini AI Search</option>
                    </select>
                  </div>

                  {/* Privacy & Efficiency Toggles */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Privacy & Protection</span>
                    </div>

                    {/* Strict Ad & Tracker Shield */}
                    <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Ad & Tracker Shield</div>
                          <div className="text-[10px] text-slate-500">Block popups, analytics & ads</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings?.adBlockerEnabled !== false}
                        onChange={(e) => onUpdateSettings && onUpdateSettings({ adBlockerEnabled: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </label>

                    {/* Memory Saver */}
                    <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-amber-600" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Memory Saver (Eco Mode)</div>
                          <div className="text-[10px] text-slate-500">Discard inactive background tabs</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings?.memorySaverEnabled !== false}
                        onChange={(e) => onUpdateSettings && onUpdateSettings({ memorySaverEnabled: e.target.checked })}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                      />
                    </label>

                    {/* Bookmarks Bar Visibility */}
                    <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Show Bookmarks Bar</div>
                          <div className="text-[10px] text-slate-500">Always visible under address bar</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings?.showBookmarksBar !== false}
                        onChange={(e) => onUpdateSettings && onUpdateSettings({ showBookmarksBar: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </label>

                    {/* AI Web Context */}
                    <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Auto Web Context</div>
                          <div className="text-[10px] text-slate-500">Inject page text into AI prompts</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings?.autoAttachWebContext !== false}
                        onChange={(e) => onUpdateSettings && onUpdateSettings({ autoAttachWebContext: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* AI Summary Mode */}
                  <div className="pt-1 border-t border-slate-100">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>AI Summary Detail Mode</span>
                    </div>
                    <select
                      value={settings?.aiSummaryLength || 'detailed'}
                      onChange={(e) => onUpdateSettings && onUpdateSettings({ aiSummaryLength: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="short">Short (3-5 Bullet Points)</option>
                      <option value="detailed">Detailed & Structured Analysis</option>
                      <option value="beginner">Beginner (ELI5 Simple Terms)</option>
                      <option value="technical">Technical In-Depth Analysis</option>
                    </select>
                  </div>

                  {/* Voice Speed */}
                  <div className="pt-1 border-t border-slate-100">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                      <Volume2 className="w-3 h-3 text-emerald-600" />
                      <span>Read-Aloud Voice Speed</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => onUpdateSettings && onUpdateSettings({ voiceSpeed: speed })}
                          className={`py-1 rounded-lg text-center font-mono text-[11px] border transition-colors cursor-pointer ${
                            (settings?.voiceSpeed || 1.0) === speed
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* BROWSER TOOLS & WORKFLOWS TAB */
                <div className="divide-y divide-slate-100">
                  {/* Tabs & Window */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tabs & Window
                    </div>
                    {onNewTab && (
                      <button
                        onClick={() => {
                          onNewTab();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Plus className="w-4 h-4 text-blue-600" />
                          <span>New Tab</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+T</span>
                      </button>
                    )}
                    {onNewIncognitoTab && (
                      <button
                        onClick={() => {
                          onNewIncognitoTab();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-slate-700" />
                          <span>New Incognito Window</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+N</span>
                      </button>
                    )}
                    {canReopenClosedTab && onReopenClosedTab && (
                      <button
                        onClick={() => {
                          onReopenClosedTab();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <RotateCw className="w-4 h-4 text-amber-600" />
                          <span>Reopen Closed Tab</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+T</span>
                      </button>
                    )}
                    {onOpenSessionStash && (
                      <button
                        onClick={() => {
                          onOpenSessionStash();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Archive className="w-4 h-4 text-amber-600" />
                          <span>Session Stash & Snapshots</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Save</span>
                      </button>
                    )}
                  </div>

                  {/* Essentials & History */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Library & Essentials
                    </div>
                    <button
                      onClick={() => {
                        onOpenInternalView('bookmarks');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookmarkIcon className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Bookmarks Manager</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+O</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenInternalView('history');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Browsing History</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+H</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenInternalView('downloads');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Downloads Shelf</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+J</span>
                    </button>
                    {onOpenFindInPage && (
                      <button
                        onClick={() => {
                          onOpenFindInPage();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Search className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Find in Page</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+F</span>
                      </button>
                    )}
                    {onExportMarkdown && (
                      <button
                        onClick={() => {
                          onExportMarkdown();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Export Page as Markdown (.md)</span>
                      </button>
                    )}
                  </div>

                  {/* AI Superpowers */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>AI Intelligence Suite</span>
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                    </div>

                    {onOpenDataExtractor && (
                      <button
                        onClick={() => {
                          onOpenDataExtractor();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="text-left">
                          <div className="font-semibold text-emerald-950">AI Data Scraper & Tables</div>
                          <div className="text-[10px] text-slate-400">Extract tables & links to CSV/JSON</div>
                        </div>
                      </button>
                    )}

                    {onToggleAmbientSound && (
                      <button
                        onClick={() => {
                          onToggleAmbientSound();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Headphones className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="text-left">
                          <div className="font-semibold text-indigo-950">Focus Ambient Soundscapes</div>
                          <div className="text-[10px] text-slate-400">{isAmbientPlaying ? 'Pause soundscape' : 'Rain, ocean waves & brown noise'}</div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenInternalView('research');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold">Deep Research Agent</div>
                        <div className="text-[10px] text-slate-400">Autonomous multi-source research</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenInternalView('mindmap');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
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
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Scale className="w-4 h-4 text-pink-500 shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold">Product Comparison</div>
                        <div className="text-[10px] text-slate-400">Side-by-side specs comparison</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenInternalView('pdf');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
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
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <StickyNote className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold">Cornell Notes Notebook</div>
                        <div className="text-[10px] text-slate-400">Structured markdown notebook</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenInternalView('devtools');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="text-left">
                          <div className="font-semibold">AI DevTools & Console</div>
                          <div className="text-[10px] text-slate-400">DOM inspector & agent terminal</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">F12</span>
                    </button>

                    {onOpenPerformance && (
                      <button
                        onClick={() => {
                          onOpenPerformance();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Activity className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Site Telemetry & Performance HUD</span>
                      </button>
                    )}
                  </div>

                  {/* Help, Guide & Shortcuts */}
                  <div className="py-1">
                    {onOpenTour && (
                      <button
                        onClick={() => {
                          onOpenTour();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-blue-900">Interactive User Guide & Tour</span>
                        </div>
                        <span className="text-[10px] text-blue-600 font-bold px-1.5 py-0.5 bg-blue-50 rounded">New</span>
                      </button>
                    )}

                    {onOpenShortcuts && (
                      <button
                        onClick={() => {
                          onOpenShortcuts();
                          setShowMenu(false);
                        }}
                        className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Command className="w-4 h-4 text-slate-600 shrink-0" />
                          <span>Keyboard Shortcuts</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">?</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenInternalView('readme');
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Documentation & Guide</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Persistent Bottom Bar with All Settings and Clear Data */}
            <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-1.5 shrink-0">
              <button
                onClick={() => {
                  onOpenInternalView('settings');
                  setShowMenu(false);
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Open Full Browser & AI Settings Page (aksh://settings)"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>All Settings</span>
              </button>

              {onClearBrowsingData && (
                <button
                  onClick={() => {
                    onClearBrowsingData();
                    setShowMenu(false);
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-700 font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Clear Browsing History, Cache and Downloads"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear Data</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
