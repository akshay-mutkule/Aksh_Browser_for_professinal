import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Globe,
  Compass,
  Bookmark,
  CheckCircle2,
  ListOrdered,
  FileSearch,
  Cpu,
  StickyNote,
  ChevronRight,
  Play
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
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [autoPlayWorkflow, setAutoPlayWorkflow] = useState<boolean>(true);

  const WORKFLOW_STEPS = [
    {
      id: 0,
      stepNum: '01',
      title: 'Universal Multi-Tab & Live Proxy Browsing',
      shortTitle: '1. Live Web Proxy',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description:
        'Navigate the live internet via an Express proxy engine with real-time CORS bypass, HTML sanitization, clean DOM readability extraction, and instant reader mode.',
      sampleTarget: 'https://learn.python.org/courses/2026-guide',
      actionLabel: 'Browse Python Guide',
      metric: 'Sub-100ms Proxy Pipeline',
    },
    {
      id: 1,
      stepNum: '02',
      title: 'Context-Aware In-Situ Page Intelligence',
      shortTitle: '2. AI Summarizer',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description:
        'Aksh AI automatically digests active DOM text with Gemini 3.7 Flash into 4 synthesis modes: Executive Briefs, Key Takeaways, Action Checklists, and TL;DRs.',
      sampleTarget: 'https://theverge.com/tech/2026/future-of-ai-agents-browser-revolution',
      actionLabel: 'Summarize The Verge Article',
      metric: '4 AI Synthesis Modes',
    },
    {
      id: 2,
      stepNum: '03',
      title: 'Autonomous Multi-Source Deep Research',
      shortTitle: '3. Deep Research',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description:
        'Query decomposition into sub-searches, live parallel retrieval across web citations, and synthesis of benchmark comparison tables with grounded sources.',
      sampleTarget: 'aksh://research?q=Best%20Python%20courses%20for%20beginners%20in%202026',
      actionLabel: 'Launch Deep Research Mode',
      metric: '5-Stage Auto-Pipeline',
    },
    {
      id: 3,
      stepNum: '04',
      title: 'PDF Document Intelligence & Interactive Quizzes',
      shortTitle: '4. PDF Intelligence',
      icon: FileSearch,
      color: 'from-rose-500 to-pink-500',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description:
        'Read complex papers and reports with in-viewer full-text search, jump-to-section navigation, AI note generation, and automated study flashcard quizzes.',
      sampleTarget: 'aksh://pdf/transformer-paper',
      actionLabel: 'Open Transformer Paper PDF',
      metric: 'Auto-Quiz & Study Flashcards',
    },
    {
      id: 4,
      stepNum: '05',
      title: 'AI Knowledge Base, Notes & Decision Matrix',
      shortTitle: '5. Notes & Matrix',
      icon: StickyNote,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description:
        'Save synthesized knowledge into structured markdown notes, compare products side-by-side with weighted matrices, and export notes directly to local disk.',
      sampleTarget: 'aksh://notes',
      actionLabel: 'Open Knowledge Base',
      metric: 'Markdown & JSON Export',
    },
  ];

  // Auto-advance workflow demonstration steps
  useEffect(() => {
    if (!autoPlayWorkflow) return;
    const interval = setInterval(() => {
      setActiveWorkflowStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlayWorkflow, WORKFLOW_STEPS.length]);

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

  const currentWorkflow = WORKFLOW_STEPS[activeWorkflowStep];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 select-none flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8 my-auto py-4">
        {/* Logo & Headline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-inner mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Aksh AI Browser • Chromium Intelligent Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Intelligent Web Research
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Browse the live web, synthesize complex topics with multi-source AI research, analyze PDFs, and compare products instantly.
          </p>
        </motion.div>

        {/* Hero Search Box */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSearch}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 rounded-2xl p-2 shadow-2xl transition-all">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search the web with Google or ask Aksh AI to research..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.form>

        {/* Interactive Animated Workflow Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-3xl mx-auto bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ListOrdered className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Full Browser AI Workflow Pipeline
                </h3>
                <p className="text-[11px] text-slate-400">
                  Step through the complete 5-stage intelligent research and browsing cycle
                </p>
              </div>
            </div>

            <button
              onClick={() => setAutoPlayWorkflow(!autoPlayWorkflow)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                autoPlayWorkflow
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {autoPlayWorkflow ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Auto-cycling</span>
                </>
              ) : (
                <>
                  <Play className="w-2.5 h-2.5" />
                  <span>Paused</span>
                </>
              )}
            </button>
          </div>

          {/* Workflow Step Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {WORKFLOW_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeWorkflowStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveWorkflowStep(idx);
                    setAutoPlayWorkflow(false);
                  }}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all border relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 border-slate-600 text-white shadow-md'
                      : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/70 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {step.stepNum}
                    </span>
                    <StepIcon
                      className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium truncate">{step.shortTitle}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activePillUnderline"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${step.color}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Workflow Step Display Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWorkflow.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentWorkflow.badgeColor}`}>
                    STEP {currentWorkflow.stepNum}
                  </span>
                  <h4 className="text-xs md:text-sm font-bold text-slate-100">
                    {currentWorkflow.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentWorkflow.description}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Capability: {currentWorkflow.metric}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate(currentWorkflow.sampleTarget)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${currentWorkflow.color} hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer`}
              >
                <span>{currentWorkflow.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* AI Quick Research Sparks */}
        <div className="w-full max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Try AI Deep Research & Summarization:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onOpenResearch('Best Python courses for beginners in 2026')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left text-slate-200 transition-all group shadow-sm flex flex-col justify-between cursor-pointer"
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
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left text-slate-200 transition-all group shadow-sm flex flex-col justify-between cursor-pointer"
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
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left text-slate-200 transition-all group shadow-sm flex flex-col justify-between cursor-pointer"
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
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group shadow-sm hover:scale-[1.02] cursor-pointer"
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
