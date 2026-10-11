import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Columns,
  Zap,
  Network,
  BookOpen,
  FileText,
  Volume2,
  ShieldCheck,
  Search,
  Command,
  ArrowRight,
  CheckCircle2,
  Layers,
  Code2,
  Camera,
  Play,
  Brain,
  GitCompare,
  Terminal,
  Webhook,
  Wrench
} from 'lucide-react';
import { PageContentType } from '../../types';

interface QuickTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInternalView?: (view: PageContentType) => void;
  onToggleSplitScreen?: () => void;
  onOpenAiSidebar?: () => void;
  onTriggerSpeech?: () => void;
  onOpenCommandPalette?: () => void;
}

export const QuickTourModal: React.FC<QuickTourModalProps> = ({
  isOpen,
  onClose,
  onOpenInternalView = () => {},
  onToggleSplitScreen = () => {},
  onOpenAiSidebar = () => {},
  onTriggerSpeech = () => {},
  onOpenCommandPalette = () => {},
}) => {
  const [activeTourIndex, setActiveTourIndex] = useState(0);

  if (!isOpen) return null;

  const tourSections = [
    {
      id: 'ai-copilot',
      title: 'Aksh AI Co-Pilot',
      badge: 'Gemini 3.7 Intelligence',
      icon: Sparkles,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200',
      description:
        'Your intelligent browsing companion that reads and analyzes any page in real time.',
      points: [
        '✨ Summarize articles in 4 custom modes: Short TL;DR, In-Depth, Beginner (ELI5), or Technical.',
        '🛡️ Real-Time Fact-Checking: Audits claims with live web search grounding and trust scores.',
        '📝 Automatic Cornell Notes: Converts key takeaways directly into your personal research notebook.',
        '🎙️ Podcastifier Audio: Generates multi-speaker podcast discussions from any article.',
      ],
      tryLabel: 'Open AI Assistant',
      tryAction: () => {
        onClose();
        onOpenAiSidebar();
      },
    },
    {
      id: 'split-screen',
      title: 'Dual-Pane Split Screen',
      badge: 'Multitasking',
      icon: Columns,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-200',
      description:
        'Compare articles, study papers alongside your notes, or cross-reference documentation side-by-side.',
      points: [
        '⚖️ True dual-pane layout with an interactive drag slider to resize left and right panes.',
        '🔗 Open any link, bookmark, or history item directly into split-screen via right-click.',
        '🔄 Independent navigation, back/forward history, and address bar for each pane.',
        '📑 Synthesize both open panes simultaneously using Cross-Tab Synthesis.',
      ],
      tryLabel: 'Toggle Split Screen',
      tryAction: () => {
        onClose();
        onToggleSplitScreen();
      },
    },
    {
      id: 'deep-research',
      title: 'Autonomous Research & Mindmaps',
      badge: 'Deep Knowledge',
      icon: Zap,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      description:
        'Self-directed multi-source investigation and interactive concept graphs for complex topics.',
      points: [
        '🔍 Deep Research Agent generates multi-page synthetic reports with inline verifiable citations.',
        '🧠 Concept Mindmap visualizes topics into hierarchical, interactive graph nodes with drag & zoom.',
        '📊 Product Comparison Engine pits laptops, phones, or software against each other in decision matrices.',
        '📚 PDF Intelligence parses academic papers into summaries, extracted tables, and interactive quizzes.',
      ],
      tryLabel: 'Explore Deep Research',
      tryAction: () => {
        onClose();
        onOpenInternalView('research');
      },
    },
    {
      id: 'omnibox-bangs',
      title: 'Smart Omnibox & Bang Shortcuts',
      badge: 'Speed Navigation',
      icon: Search,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200',
      description:
        'Type natural questions, execute fast bang shortcuts, or launch power tools with zero friction.',
      points: [
        '🚀 Bang shortcut "!ai <query>" jumps straight into AI research.',
        '🧠 Bang shortcut "!m <topic>" generates an instant visual mindmap.',
        '🐙 Bang shortcut "!gh <repo>" searches GitHub code and repositories.',
        '⚡ Command Palette (Ctrl+K or ⌘+K) lets you jump to open tabs and run any browser action.',
      ],
      tryLabel: 'Launch Command Palette',
      tryAction: () => {
        onClose();
        onOpenCommandPalette();
      },
    },
    {
      id: 'tabs-privacy',
      title: 'Modern Tab Layouts & Privacy Shield',
      badge: 'Power Architecture',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      description:
        'Switch between horizontal tabs and Arc-style vertical tabs, organize into color-coded groups, and enjoy hardware-accelerated privacy.',
      points: [
        '📐 Vertical Tabs: Arc-style collapsible sidebar for wide screen real estate and clear tab hierarchy.',
        '🎨 Tab Groups & AI Auto-Cluster: Automatically groups related tabs by research topic.',
        '🛡️ Privacy & Security Shield: Intercepts trackers, sandboxes cookies, and displays live memory stats.',
        '📸 Page Snapshot Tool: Capture high-res viewports and run AI Vision analysis on diagrams and charts.',
      ],
      tryLabel: 'View Privacy Shield',
      tryAction: () => {
        onClose();
        onOpenInternalView('devtools');
      },
    },
    {
      id: 'neural-vault',
      title: 'Neural Memory & Second Brain',
      badge: 'Cognitive Vault',
      icon: Brain,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200',
      description:
        'Persistent cognitive memory that indexes your browsing knowledge into an interactive vector constellation graph.',
      points: [
        '🌌 Interactive Constellation Graph: Drag, zoom, and inspect interconnected concepts with physics simulation.',
        '🔍 Semantic Vector Search: Query across all captured reading memories, tags, and citations with cosine similarity.',
        '⚡ One-Click Page Ingestion: Instantly ingest any open tab into your second brain with auto-extracted entities.',
        '🧬 Cross-Concept Macro Synthesis: Synthesize multiple memories into overarching executive theses with Gemini.',
      ],
      tryLabel: 'Open Neural Vault',
      tryAction: () => {
        onClose();
        onOpenInternalView('memory');
      },
    },
    {
      id: 'diff-developer',
      title: 'Semantic Diff & Developer Engine',
      badge: 'Advanced Suite',
      icon: GitCompare,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50 border-cyan-200',
      description:
        'AI delta analysis across web pages, in-browser code sandbox REPL, instant API generator, and full Linux-style terminal.',
      points: [
        '⚖️ Semantic Diff Studio: Compares any two tabs or texts to reveal factual shifts, additions, and removals.',
        '⚡ AI Code Sandbox: Live HTML/JS/TypeScript code editor and instant iframe execution preview.',
        '🔌 Instant API Builder: Transforms web pages into production REST endpoints, OpenAPI specs & TypeScript SDK types.',
        '💻 Omni Terminal (CLI): Real command-line environment with network diagnostics, curl, DNS lookup, and curl tracer.',
      ],
      tryLabel: 'Explore Semantic Diff',
      tryAction: () => {
        onClose();
        onOpenInternalView('diff');
      },
    },
    {
      id: 'micro-tools',
      title: 'Micro-Tool Studio & Prompt-to-App Lab',
      badge: 'Frontier Utilities',
      icon: Wrench,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      description:
        'Zero-latency developer utilities, formatting engines, and on-demand AI Prompt-to-App mini-tool synthesizer.',
      points: [
        '🔑 JWT & JSON Studio: Decode headers, claims, exp dates, and format JSON structures offline.',
        '🎯 Regex Pattern Lab: Real-time match testing, capture group inspection, and instant pattern presets.',
        '🎨 WCAG 2.2 Color Matrix: Interactive foreground/background contrast calculator with live AA/AAA compliance.',
        '✨ Prompt-to-App Synthesizer: Ask Gemini to generate any interactive calculator, widget, or tool and run it instantly.',
      ],
      tryLabel: 'Open Micro-Tool Studio',
      tryAction: () => {
        onClose();
        onOpenInternalView('tools');
      },
    },
  ];

  const current = tourSections[activeTourIndex];
  const CurrentIcon = current.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Aksh AI Browser • User Guide & Feature Tour
              </h2>
              <p className="text-[11px] text-slate-500">
                Master the next-generation AI browser in 2 minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Pills */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/30">
          {tourSections.map((sec, idx) => {
            const SecIcon = sec.icon;
            const isSelected = idx === activeTourIndex;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTourIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <SecIcon className="w-3.5 h-3.5" />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tour Content Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${current.iconBg} border flex items-center justify-center ${current.iconColor} shrink-0 shadow-xs`}
            >
              <CurrentIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {current.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Step {activeTourIndex + 1} of {tourSections.length}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{current.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          {/* Key capability bullets */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Core Superpowers & How To Use
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {current.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={activeTourIndex === 0}
              onClick={() => setActiveTourIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={activeTourIndex === tourSections.length - 1}
              onClick={() => setActiveTourIndex((prev) => Math.min(tourSections.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Skip
            </button>

            <button
              onClick={current.tryAction}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{current.tryLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
