import React, { useState } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { SPEED_DIAL_SHORTCUTS } from '../../data/mockWebsites';
import { Bookmark as BookmarkType } from '../../types';

interface NewTabProps {
  onNavigate: (url: string) => void;
  bookmarks: BookmarkType[];
  onOpenResearch: (query: string) => void;
  onOpenPdf: (pdfId: string) => void;
  onOpenTour?: () => void;
}

export const NewTab: React.FC<NewTabProps> = ({
  onNavigate,
  onOpenTour,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;

    // AI Mode enabled or AI query prefixes
    if (isAiMode || q.startsWith('!ai ') || q.startsWith('!gemini ')) {
      const cleanQ = q.replace(/^!(ai|gemini)\s+/, '');
      onNavigate(`aksh://research?q=${encodeURIComponent(cleanQ)}`);
      return;
    }

    if (q.startsWith('!mindmap ') || q.startsWith('!m ')) {
      onNavigate(`aksh://mindmap?topic=${encodeURIComponent(q.replace(/^!(mindmap|m)\s+/, ''))}`);
      return;
    }

    // Direct URLs
    if (
      q.startsWith('http://') ||
      q.startsWith('https://') ||
      q.startsWith('aksh://') ||
      q.startsWith('nexus://')
    ) {
      onNavigate(q);
      return;
    }

    // Default Web Search
    onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
  };

  const getShortcutIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-emerald-600" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-indigo-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-purple-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-pink-600" />;
      default:
        return <Search className="w-5 h-5 text-blue-600" />;
    }
  };

  const AI_TOOLS = [
    {
      id: 'research',
      title: 'Deep Research',
      desc: 'Deep web search & cited answers',
      icon: Zap,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      action: () => onNavigate('aksh://research'),
    },
    {
      id: 'mindmap',
      title: 'Mindmap',
      desc: 'Visual concept knowledge graph',
      icon: Network,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      action: () => onNavigate('aksh://mindmap'),
    },
    {
      id: 'pdf',
      title: 'PDF Reader',
      desc: 'AI document study & summaries',
      icon: FileText,
      iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
      action: () => onNavigate('aksh://pdf/transformer-paper'),
    },
    {
      id: 'compare',
      title: 'Comparison',
      desc: 'Side-by-side product showdown',
      icon: Scale,
      iconColor: 'text-pink-600 bg-pink-50 border-pink-200',
      action: () => onNavigate('aksh://comparison'),
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 flex flex-col items-center justify-center px-4 py-8 select-none">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-7 my-auto">
        
        {/* Brand Logo & Name */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center space-y-2 text-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/15">
              A
            </div>
            <span className="text-3xl font-bold text-slate-800 tracking-tight">
              Aksh
            </span>
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
              placeholder={isAiMode ? "Ask AI anything..." : "Search Google or type a URL"}
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
                title="Toggle AI Search Mode"
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

        {/* Favorite & Popular Shortcuts (Clean Icon Grid) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="w-full"
        >
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
            {SPEED_DIAL_SHORTCUTS.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="flex flex-col items-center gap-2 group w-16 cursor-pointer"
                title={item.title}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition-all flex items-center justify-center shadow-2xs group-hover:-translate-y-0.5">
                  {getShortcutIcon(item.icon)}
                </div>
                <span className="text-xs text-slate-600 group-hover:text-slate-900 truncate w-full text-center font-medium">
                  {item.title.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Simplified AI Tools (4 Clean Cards) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="w-full pt-2"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AI_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  className="p-3 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${tool.iconColor} mb-2.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {tool.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Discreet Tour Button */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer pt-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Browser Guide</span>
          </button>
        )}

      </div>
    </div>
  );
};
