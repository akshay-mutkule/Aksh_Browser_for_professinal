import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Zap,
  Globe,
  ExternalLink,
  Copy,
  Check,
  BookmarkPlus,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import Markdown from 'react-markdown';
import { runDeepResearch } from '../../services/api';
import { ResearchReport } from '../../types';

interface ResearchModeProps {
  initialQuery?: string;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl?: (url: string) => void;
}

export const ResearchMode: React.FC<ResearchModeProps> = ({
  initialQuery = '',
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isResearching, setIsResearching] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const RESEARCH_PRESETS = [
    'Best Python courses for beginners in 2026',
    'Best Cloud certifications for software engineers in 2026',
    'MacBook Pro M3 vs Dell XPS 15 vs ThinkPad X1 specs comparison',
    'Top LLM fine-tuning frameworks (Unsloth vs Llama-Factory vs Axolotl)',
    'React 19 vs Next.js App Router vs Astro 4 benchmarks',
  ];

  const handleStartResearch = async (researchQuery?: string) => {
    const q = (researchQuery || query).trim();
    if (!q || isResearching) return;

    setQuery(q);
    setIsResearching(true);
    setCurrentStep(1);
    setReport(null);

    // Multi-stage research pipeline progression
    const timer1 = setTimeout(() => setCurrentStep(2), 1200);
    const timer2 = setTimeout(() => setCurrentStep(3), 2600);
    const timer3 = setTimeout(() => setCurrentStep(4), 4200);

    try {
      const res = await runDeepResearch(q, 'deep');
      setCurrentStep(5);
      setReport({
        id: String(Date.now()),
        query: q,
        summary: res.report.summary,
        sources: res.report.sources || [],
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err: any) {
      setReport({
        id: String(Date.now()),
        query: q,
        summary: `❌ Research generation error: ${err.message || 'Server error'}. Please verify your network connection.`,
        sources: [],
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsResearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleStartResearch(initialQuery);
    }
  }, [initialQuery]);

  const handleCopyMarkdown = () => {
    if (report) {
      navigator.clipboard.writeText(report.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToNotes = () => {
    if (report) {
      onSaveAsNote(`Research: ${report.query}`, report.summary);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDownloadFile = () => {
    if (!report) return;
    const blob = new Blob([report.summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-research-${report.query.slice(0, 25).replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Nexus AI Deep Research Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Autonomous Web Research
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Search multi-source web indices, extract comparative matrices, and synthesize structured research briefs with verified citations.
          </p>
        </div>

        {/* Research Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartResearch();
          }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="flex items-center bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 rounded-2xl p-2 shadow-2xl transition-all">
            <div className="pl-3 pr-2 text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research topic (e.g. 'Best Python courses for beginners in 2026')..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
            />
            <button
              type="submit"
              disabled={!query.trim() || isResearching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isResearching ? 'Synthesizing...' : 'Start Research'}</span>
            </button>
          </div>
        </form>

        {/* Preset Sparks */}
        {!report && !isResearching && (
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Popular Research Inquiries:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RESEARCH_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartResearch(preset)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5 shadow-xs"
                >
                  <span>{preset}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Research Progress Pipeline */}
        {isResearching && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-sm font-semibold text-indigo-300">
                  Executing Autonomous Research Protocol...
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Step {currentStep} of 4</span>
            </div>

            <div className="space-y-3 text-xs">
              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  currentStep >= 1 ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/30' : 'text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${currentStep >= 1 ? 'text-indigo-400' : 'text-slate-600'}`}
                />
                <span>1. Decomposing research thesis into multi-perspective search queries</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  currentStep >= 2 ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/30' : 'text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${currentStep >= 2 ? 'text-indigo-400' : 'text-slate-600'}`}
                />
                <span>2. Scraping and aggregating live authority sources and benchmark matrices</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  currentStep >= 3 ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/30' : 'text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${currentStep >= 3 ? 'text-indigo-400' : 'text-slate-600'}`}
                />
                <span>3. Extracting comparative specifications, pricing, pros/cons, and real metrics</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  currentStep >= 4 ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/30' : 'text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${currentStep >= 4 ? 'text-indigo-400' : 'text-slate-600'}`}
                />
                <span>4. Cross-synthesizing Gemini reasoning & compiling executive comparison report</span>
              </div>
            </div>
          </div>
        )}

        {/* Synthesized Research Report Output */}
        {report && !isResearching && (
          <div className="space-y-6 animate-in fade-in">
            {/* Report Header Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesized Research Brief</span>
                </div>
                <h2 className="text-lg font-bold text-white">{report.query}</h2>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Generated: {report.timestamp}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToNotes}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  {saved ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Save to Notes</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .MD</span>
                </button>
              </div>
            </div>

            {/* Cited Web Sources Chips */}
            {report.sources && report.sources.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Verified Web Citations & Referenced Sources:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-blue-300 hover:text-blue-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                      <span className="truncate max-w-[240px]">{src.title || src.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Report Body with Formatted Table */}
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-slate-200">
              <div className="markdown-body prose prose-invert max-w-none">
                <Markdown>{report.summary}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
