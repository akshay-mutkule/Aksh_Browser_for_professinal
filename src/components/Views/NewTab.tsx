import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Globe,
  Compass,
  Network,
  StickyNote,
  GraduationCap,
  Command
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
    if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('aksh://') || q.startsWith('nexus://')) {
      onNavigate(q);
    } else {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-4 h-4" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Scale':
        return <Scale className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // 4 Core Simple AI Superpowers
  const AI_SUPERPOWERS = [
    {
      id: 'research',
      title: 'Deep Research',
      subtitle: 'Multi-source autonomous AI investigation with live citations',
      icon: Zap,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
      iconBg: 'bg-amber-500 text-white',
      action: () => onNavigate('aksh://research?q=Best%20AI%20trends%202026'),
      badge: 'Autonomous',
    },
    {
      id: 'mindmap',
      title: 'Concept Mindmap',
      subtitle: 'Interactive visual knowledge graphs and topic hierarchies',
      icon: Network,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70',
      iconBg: 'bg-indigo-500 text-white',
      action: () => onNavigate('aksh://mindmap?topic=Artificial%20Intelligence%202026'),
      badge: 'Visual Graph',
    },
    {
      id: 'pdf',
      title: 'PDF Intelligence',
      subtitle: 'Read research papers, extract insights, and take auto-quizzes',
      icon: FileText,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70',
      iconBg: 'bg-rose-500 text-white',
      action: () => onOpenPdf('transformer-paper'),
      badge: 'Study Mode',
    },
    {
      id: 'compare',
      title: 'Product Comparison',
      subtitle: 'Side-by-side spec showdowns with AI scoring & verdicts',
      icon: Scale,
      color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/70',
      iconBg: 'bg-pink-500 text-white',
      action: () => onNavigate('aksh://comparison'),
      badge: 'Decision Matrix',
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 select-none flex flex-col items-center justify-start p-6 md:p-10">
      <div className="w-full max-w-3xl space-y-8 my-auto">
        
        {/* Simple & Clean Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Aksh AI Browser • Powered by Gemini 3.7</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            What would you like to explore?
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Search Google, enter any website URL, or ask AI to research any topic.
          </p>
        </motion.div>

        {/* Clean Omnibox Search Box */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onSubmit={handleSearch}
          className="w-full"
        >
          <div className="relative flex items-center bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl p-2 shadow-md transition-all">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Google, ask Aksh AI, or type any URL..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none py-1.5"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Chips under search bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-600">
            <span className="text-[11px] text-slate-400 font-medium">Quick tools:</span>
            <button
              type="button"
              onClick={() => onNavigate('aksh://research?q=Best%20Python%20courses%202026')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Deep Research</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('aksh://mindmap?topic=Machine%20Learning')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Network className="w-3 h-3 text-indigo-500" />
              <span>Concept Mindmap</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPdf('transformer-paper')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3 text-rose-500" />
              <span>Study PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('aksh://comparison')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Scale className="w-3 h-3 text-pink-500" />
              <span>Compare Specs</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('aksh://notes')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <StickyNote className="w-3 h-3 text-emerald-500" />
              <span>AI Notes</span>
            </button>
          </div>
        </motion.form>

        {/* Speed Dial / Popular Websites */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Popular & Pinned Sites</span>
            </div>
            <span className="text-[11px] font-normal lowercase text-slate-400">click to open</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SPEED_DIAL_SHORTCUTS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-all text-left group shadow-2xs hover:shadow-sm cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  {getIcon(item.icon)}
                </div>
                <div className="truncate min-w-0">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {item.url.replace('https://', '').replace('http://', '')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Features Grid (Simple 4-Card Overview) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Superpowers</span>
            </div>
            <span className="text-[11px] font-normal lowercase text-slate-400">1-click intelligence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_SUPERPOWERS.map((power) => {
              const Icon = power.icon;
              return (
                <button
                  key={power.id}
                  onClick={power.action}
                  className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group shadow-2xs hover:shadow-sm flex items-start gap-3 cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg ${power.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                        {power.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium shrink-0">
                        {power.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {power.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Clean Footer Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
              Ctrl + K
            </span>
            <span className="text-[11px] text-slate-500">Quick Command Palette</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('aksh://devtools')}
              className="text-[11px] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              AI DevTools
            </button>
            <button
              onClick={() => onNavigate('aksh://readme')}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-blue-600" />
              <span>Documentation</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
