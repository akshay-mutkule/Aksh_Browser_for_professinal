import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Code,
  Laptop,
  FileText,
  Scale,
  ArrowRight,
  TrendingUp,
  Flame,
  Clock,
  Compass,
  Bookmark
} from 'lucide-react';
import { SPEED_DIAL_SHORTCUTS, SAMPLE_PDFS } from '../../data/mockWebsites';
import { Bookmark as BookmarkType } from '../../types';

interface NewTabProps {
  onNavigate: (url: string) => void;
  bookmarks: BookmarkType[];
  onOpenResearch: (query: string) => void;
  onOpenPdf: (pdfId: string) => void;
}

export const NewTab: React.FC<NewTabProps> = ({
  onNavigate,
  bookmarks,
  onOpenResearch,
  onOpenPdf,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const q = searchInput.trim();
    if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('nexus://')) {
      onNavigate(q);
    } else {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10 select-none flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8 my-auto">
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-inner mb-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Nexus AI Browser • Chromium Intelligent Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Intelligent Web Research
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Browse the live web, synthesize complex topics with multi-source AI research, analyze PDFs, and compare products instantly.
          </p>
        </div>

        {/* Hero Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 rounded-2xl p-2 shadow-2xl transition-all">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search the web with Google or ask Nexus AI to research..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* AI Quick Research Sparks */}
        <div className="w-full max-w-2xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Try AI Deep Research & Summarization:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onOpenResearch('Best Python courses for beginners in 2026')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left text-slate-200 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-indigo-400 mb-1">
                <span className="font-semibold text-[11px] uppercase tracking-wide">Courses</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-slate-300 group-hover:text-white line-clamp-2">
                "Best Python courses for beginners in 2026"
              </span>
            </button>

            <button
              onClick={() => onOpenResearch('MacBook Pro M3 vs Dell XPS 15 vs ThinkPad X1 specs')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left text-slate-200 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-pink-400 mb-1">
                <span className="font-semibold text-[11px] uppercase tracking-wide">Product Specs</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-slate-300 group-hover:text-white line-clamp-2">
                "MacBook Pro M3 vs XPS 15 showdown"
              </span>
            </button>

            <button
              onClick={() => onOpenPdf('transformer-paper')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left text-slate-200 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-rose-400 mb-1">
                <span className="font-semibold text-[11px] uppercase tracking-wide">PDF Reader</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-slate-300 group-hover:text-white line-clamp-2">
                "Attention Is All You Need" paper
              </span>
            </button>
          </div>
        </div>

        {/* Speed Dial Shortcuts Grid */}
        <div className="w-full max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Speed Dial & Pinned Sites</span>
            </div>
            <span className="text-[11px] lowercase text-slate-500">click to launch</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPEED_DIAL_SHORTCUTS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group shadow-sm hover:scale-[1.02]"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:shadow-lg transition-all`}
                >
                  {getIcon(item.icon)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {item.url.replace('https://', '')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Summarizer (4 Modes)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Source Research Mode</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>AI PDF Analysis & Quizzes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-pink-400" />
            <span>Product Comparison Matrix</span>
          </div>
        </div>
      </div>
    </div>
  );
};
