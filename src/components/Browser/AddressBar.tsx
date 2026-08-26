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
  ExternalLink
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';

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
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ title: string; url: string; type: string }>>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.url]);

  // Handle outside click for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);

    if (val.trim().length > 1) {
      // Dynamic suggestions
      const list = [
        { title: `Search Google for "${val}"`, url: `https://www.google.com/search?q=${encodeURIComponent(val)}`, type: 'search' },
        { title: `AI Research: "${val}"`, url: `nexus://research?q=${encodeURIComponent(val)}`, type: 'ai' },
        { title: 'Top 5 Python Courses 2026', url: 'https://learn.python.org/courses/2026-guide', type: 'site' },
        { title: 'MacBook Pro vs XPS 15 vs ThinkPad', url: 'https://tech-radar.io/laptops/flagship-comparison-2026', type: 'site' },
        { title: 'Transformer Architecture PDF', url: 'nexus://pdf/transformer-paper', type: 'pdf' },
        { title: 'Artificial Intelligence Wikipedia', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence', type: 'site' },
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
    if (target.startsWith('nexus://')) {
      onNavigate(target);
    } else if (!target.includes('.') && !target.startsWith('http://') && !target.startsWith('https://')) {
      // Treat as search query
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

  const isSecure = activeTab?.url.startsWith('https://') || activeTab?.url.startsWith('nexus://');

  return (
    <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center gap-2 relative z-10 select-none">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onGoBack}
          disabled={!activeTab?.canGoBack}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Back (Alt+Left Arrow)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onGoForward}
          disabled={!activeTab?.canGoForward}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Forward (Alt+Right Arrow)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          title={activeTab?.isLoading ? 'Stop loading' : 'Reload page (Ctrl+R)'}
        >
          {activeTab?.isLoading ? (
            <X className="w-4 h-4 text-rose-400" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onGoHome}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
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
                ? 'bg-slate-950 border-blue-500 ring-2 ring-blue-500/20 text-slate-100 shadow-md'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            {/* Security Indicator */}
            <div className="flex items-center text-slate-400 shrink-0">
              {activeTab?.url.startsWith('nexus://') ? (
                <span title="Nexus Internal Protected View">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                </span>
              ) : isSecure ? (
                <span title="Secure SSL Connection (HTTPS)">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>

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
              placeholder="Search Google or enter web address..."
              className="flex-1 bg-transparent focus:outline-none text-slate-100 placeholder-slate-500 font-mono text-xs"
            />

            {/* Quick Actions in Omnibar */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Reader Mode Toggle (available for articles/docs) */}
              {activeTab && activeTab.contentType === 'web' && (
                <button
                  type="button"
                  onClick={onToggleReaderMode}
                  className={`p-1 rounded-md transition-colors ${
                    activeTab.isReaderMode
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
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
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-all font-sans text-[11px]"
                  title="✨ Summarize Page with Nexus AI"
                >
                  <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                  <span className="hidden sm:inline">Summarize</span>
                </button>
              )}

              {/* Bookmark Star Toggle */}
              <button
                type="button"
                onClick={onToggleBookmark}
                className={`p-1 rounded-md transition-colors ${
                  isBookmarked
                    ? 'text-amber-400 hover:text-amber-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this tab'}
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => handleSelectSuggestion(item.url)}
                className="px-3.5 py-2 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs text-slate-200 group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.type === 'ai' ? (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : item.type === 'pdf' ? (
                    <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : item.type === 'search' ? (
                    <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-200 group-hover:text-white truncate">
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                  {item.url}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Menu Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          title="Nexus Browser Menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
            <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Nexus AI Features</span>
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>

            <button
              onClick={() => {
                onOpenInternalView('research');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>AI Deep Research Mode</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('comparison');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <Scale className="w-4 h-4 text-pink-400" />
              <span>AI Product Comparison</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('pdf');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>AI PDF Reader & Quiz</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('notes');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <StickyNote className="w-4 h-4 text-yellow-400" />
              <span>AI Notes & Knowledge Base</span>
            </button>

            <div className="my-1 border-t border-slate-800" />
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Browser Essentials
            </div>

            <button
              onClick={() => {
                onOpenInternalView('bookmarks');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <BookmarkIcon className="w-4 h-4 text-amber-400" />
              <span>Bookmarks Manager</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('history');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <History className="w-4 h-4 text-blue-400" />
              <span>History (Ctrl+H)</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('downloads');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Manager</span>
            </button>

            <button
              onClick={() => {
                onOpenInternalView('settings');
                setShowMenu(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
