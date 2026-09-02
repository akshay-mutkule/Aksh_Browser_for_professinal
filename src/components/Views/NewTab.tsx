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
  Command,
  Cpu,
  Shield,
  Activity,
  Layers,
  Terminal,
  Sliders,
  ExternalLink,
  Check
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
  const [isProMode, setIsProMode] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'google' | 'gemini' | 'duckduckgo' | 'github' | 'arxiv'>('google');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const q = searchInput.trim();

    // Check for Bang shortcuts first
    if (q.startsWith('!ai ') || q.startsWith('!gemini ')) {
      onNavigate(`aksh://research?q=${encodeURIComponent(q.replace(/^!(ai|gemini)\s+/, ''))}`);
      return;
    }
    if (q.startsWith('!mindmap ') || q.startsWith('!m ')) {
      onNavigate(`aksh://mindmap?topic=${encodeURIComponent(q.replace(/^!(mindmap|m)\s+/, ''))}`);
      return;
    }
    if (q.startsWith('!gh ')) {
      onNavigate(`https://github.com/search?q=${encodeURIComponent(q.replace(/^!gh\s+/, ''))}`);
      return;
    }
    if (q.startsWith('!wiki ')) {
      onNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q.replace(/^!wiki\s+/, ''))}`);
      return;
    }

    if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('aksh://') || q.startsWith('nexus://')) {
      onNavigate(q);
      return;
    }

    // Engine-specific routing
    if (selectedEngine === 'gemini') {
      onNavigate(`aksh://research?q=${encodeURIComponent(q)}`);
    } else if (selectedEngine === 'duckduckgo') {
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`);
    } else if (selectedEngine === 'github') {
      onNavigate(`https://github.com/search?q=${encodeURIComponent(q)}`);
    } else if (selectedEngine === 'arxiv') {
      onNavigate(`https://arxiv.org/search/?query=${encodeURIComponent(q)}&searchtype=all`);
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

  const AI_SUPERPOWERS = [
    {
      id: 'research',
      title: 'Deep Research Agent',
      subtitle: 'Multi-source autonomous AI investigation with live citations & deep web queries',
      icon: Zap,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
      iconBg: 'bg-amber-500 text-white',
      action: () => onNavigate('aksh://research?q=Best%20AI%20trends%202026'),
      badge: 'Autonomous',
    },
    {
      id: 'mindmap',
      title: 'Visual Mindmap & Knowledge Graph',
      subtitle: 'Dynamic hierarchical graph synthesis for complex systems and concepts',
      icon: Network,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70',
      iconBg: 'bg-indigo-500 text-white',
      action: () => onNavigate('aksh://mindmap?topic=Artificial%20Intelligence%202026'),
      badge: 'Visual Graph',
    },
    {
      id: 'pdf',
      title: 'PDF Intelligence & Study Engine',
      subtitle: 'Parse papers, extract citations, generate Cornell notes and dynamic quizzes',
      icon: FileText,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70',
      iconBg: 'bg-rose-500 text-white',
      action: () => onOpenPdf('transformer-paper'),
      badge: 'Study Mode',
    },
    {
      id: 'compare',
      title: 'Product Comparison & Decision Matrix',
      subtitle: 'Side-by-side spec showdowns with AI scoring, pros/cons, and final verdicts',
      icon: Scale,
      color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/70',
      iconBg: 'bg-pink-500 text-white',
      action: () => onNavigate('aksh://comparison'),
      badge: 'Decision Matrix',
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 select-none flex flex-col items-center justify-start p-6 md:p-10">
      <div className="w-full max-w-4xl space-y-6 my-auto">
        
        {/* Top Header: Badge, Title & Pro Mode Switch */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center relative">
          {/* Pro Mode Toggle at Top Right */}
          <div className="md:absolute right-0 top-0 mb-2 md:mb-0">
            <button
              onClick={() => setIsProMode(!isProMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isProMode
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="Toggle Advanced Pro Telemetry & Developer HUD"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{isProMode ? 'Pro Mode Active' : 'Enable Pro Mode'}</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Aksh AI Browser • Gemini 3.7 Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              What would you like to explore?
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Search the web, parse documents, run autonomous research, or synthesize tabs.
            </p>
          </motion.div>
        </div>

        {/* Pro Telemetry HUD (Only when Pro Mode is Active) */}
        {isProMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Engine Telemetry & System Status</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-mono font-bold">
                OPTIMAL • MEMORY SAVER ON
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Cpu className="w-3 h-3 text-blue-500" />
                  <span>Active Memory</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">248 MB</div>
                <div className="text-[10px] text-emerald-600">Saved: 1.2 GB (12 tabs)</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>Privacy Shield</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">18 Blocked</div>
                <div className="text-[10px] text-slate-500">Trackers & Telemetry</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Activity className="w-3 h-3 text-amber-500" />
                  <span>Engine Latency</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">22 ms</div>
                <div className="text-[10px] text-slate-500">TLS 1.3 Handshake</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>AI Architecture</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Gemini 3.7</div>
                <div className="text-[10px] text-purple-600 font-medium">Multimodal Thinking</div>
              </div>
            </div>

            {/* Bang Shortcuts Reference */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Bang Shortcuts:</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">!ai &lt;query&gt;</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">!m &lt;mindmap&gt;</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">!gh &lt;repo&gt;</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">!wiki &lt;topic&gt;</span>
            </div>
          </motion.div>
        )}

        {/* Search Engine Selector (When in Pro Mode) */}
        {isProMode && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] mr-1">Search via:</span>
            <button
              onClick={() => setSelectedEngine('google')}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedEngine === 'google'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setSelectedEngine('gemini')}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                selectedEngine === 'gemini'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Gemini AI</span>
            </button>
            <button
              onClick={() => setSelectedEngine('github')}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedEngine === 'github'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              GitHub
            </button>
            <button
              onClick={() => setSelectedEngine('arxiv')}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedEngine === 'arxiv'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ArXiv Papers
            </button>
            <button
              onClick={() => setSelectedEngine('duckduckgo')}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedEngine === 'duckduckgo'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              DuckDuckGo
            </button>
          </div>
        )}

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
              placeholder={
                selectedEngine === 'gemini'
                  ? 'Ask Gemini 3.7 to research, code, or synthesize anything...'
                  : selectedEngine === 'github'
                  ? 'Search GitHub repositories, code, and developer docs...'
                  : selectedEngine === 'arxiv'
                  ? 'Search ArXiv academic papers and machine learning research...'
                  : 'Search Google, ask Gemini (!ai), or type any URL...'
              }
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none py-1.5"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>Explore</span>
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

        {/* AI Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Autonomous AI Workflows</span>
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
              AI DevTools & DOM Inspector
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
