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
  ArrowRight,
  RotateCw,
  Network,
  History,
  Trash2,
  Plus
} from 'lucide-react';
import Markdown from 'react-markdown';
import { runDeepResearch, sendAIChat } from '../../services/api';
import { ResearchReport } from '../../types';

interface ResearchModeProps {
  initialQuery?: string;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl?: (url: string) => void;
}

type ResearchLens = 'general' | 'engineering' | 'academic' | 'strategy';

interface StoredDossier extends ResearchReport {
  depth: 'deep' | 'flash';
  lens: ResearchLens;
  deepDives?: Array<{ inquiry: string; content: string }>;
}

const HISTORY_STORAGE_KEY = 'aksh_research_history_v1';

const RESEARCH_PRESETS = [
  'Transformer KV-cache quantization and inference bottlenecks in 2026',
  'Post-Quantum Lattice Cryptography (ML-KEM / Kyber) deployment tradeoffs',
  'React 19 vs Next.js App Router vs Astro 4 rendering benchmarks',
  'Top open-weight LLM fine-tuning frameworks (Unsloth vs Axolotl)',
];

const LENS_OPTIONS: Array<{ id: ResearchLens; label: string; directive: string }> = [
  { id: 'general', label: 'Balanced Synthesis', directive: '' },
  {
    id: 'engineering',
    label: 'Systems & Architecture',
    directive: 'Focus deeply on system architecture, latency/throughput benchmarks, failure modes, and implementation tradeoffs.',
  },
  {
    id: 'academic',
    label: 'Empirical & Literature',
    directive: 'Emphasize formal methodology, peer-reviewed evidence, mathematical formulations, and open research questions.',
  },
  {
    id: 'strategy',
    label: 'Market & Strategy',
    directive: 'Analyze unit economics, competitive moats, TCO pricing comparisons, and enterprise adoption risks.',
  },
];

export const ResearchMode: React.FC<ResearchModeProps> = ({
  initialQuery = '',
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [researchDepth, setResearchDepth] = useState<'deep' | 'flash'>('deep');
  const [researchLens, setResearchLens] = useState<ResearchLens>('general');
  const [isResearching, setIsResearching] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [history, setHistory] = useState<StoredDossier[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [report, setReport] = useState<StoredDossier | null>(null);
  const [deepDiveAppend, setDeepDiveAppend] = useState<Array<{ inquiry: string; content: string }>>([]);
  const [followUpProbes, setFollowUpProbes] = useState<string[]>([]);
  const [customFollowUp, setCustomFollowUp] = useState('');
  const [isProbing, setIsProbing] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 15)));
    } catch {}
  }, [history]);

  const buildFollowUpProbes = (q: string, lens: ResearchLens): string[] => {
    if (lens === 'engineering') {
      return [
        `Identify architectural bottlenecks and scaling limits of ${q}`,
        `Compare reference implementation patterns and observability requirements`,
        `Produce a concrete migration & hardening checklist for production teams`,
      ];
    }
    if (lens === 'academic') {
      return [
        `Evaluate methodological assumptions and benchmark validity in ${q}`,
        `Contrast competing formal approaches and asymptotic bounds`,
        `Summarize open research problems and reproducibility constraints`,
      ];
    }
    return [
      `Examine practical tradeoffs, hidden costs, and failure modes of ${q}`,
      `Compare leading alternatives side by side with clear selection criteria`,
      `Outline a phased adoption roadmap with measurable milestones`,
    ];
  };

  const handleStartResearch = async (researchQuery?: string) => {
    const q = (researchQuery || query).trim();
    if (!q || isResearching) return;

    setQuery(q);
    setIsResearching(true);
    setCurrentStep(1);
    setReport(null);
    setDeepDiveAppend([]);
    setFollowUpProbes([]);

    const stepInterval = researchDepth === 'flash' ? 600 : 1100;
    const t1 = setTimeout(() => setCurrentStep(2), stepInterval);
    const t2 = setTimeout(() => setCurrentStep(3), stepInterval * 2);
    const t3 = setTimeout(() => setCurrentStep(4), stepInterval * 3);

    const lensObj = LENS_OPTIONS.find((l) => l.id === researchLens);
    const framedQuery = lensObj?.directive ? `${q}\n\n[Analytical Focus: ${lensObj.directive}]` : q;

    try {
      const res = await runDeepResearch(framedQuery, researchDepth);
      setCurrentStep(5);
      const created: StoredDossier = {
        id: String(Date.now()),
        query: q,
        summary: res.report.summary,
        sources: res.report.sources || [],
        depth: researchDepth,
        lens: researchLens,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        deepDives: [],
      };
      setReport(created);
      setHistory((prev) => [created, ...prev.filter((h) => h.query !== q)].slice(0, 15));
      setFollowUpProbes(buildFollowUpProbes(q, researchLens));
    } catch (err: any) {
      setReport({
        id: String(Date.now()),
        query: q,
        summary: `Research synthesis error: ${err?.message || 'Unable to reach research endpoint'}.`,
        sources: [],
        depth: researchDepth,
        lens: researchLens,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsResearching(false);
    }
  };

  const handleRunFollowUpProbe = async (inquiry: string) => {
    const cleanInquiry = inquiry.trim();
    if (!cleanInquiry || isProbing || !report) return;
    setIsProbing(true);
    setCustomFollowUp('');
    try {
      const prompt = `You are a Senior Research Analyst.
Original Research Topic: "${report.query}"
Existing Report Summary Excerpt:
${report.summary.slice(0, 2200)}

Investigate this specific follow-up inquiry concisely and rigorously:
"${cleanInquiry}"

Structure with:
1. Direct Evidence & Mechanics
2. Tradeoffs & Edge Cases
3. Actionable Takeaways`;

      const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
      const nextEntry = { inquiry: cleanInquiry, content: res.reply || 'Analysis completed.' };
      setDeepDiveAppend((prev) => {
        const updated = [...prev, nextEntry];
        setHistory((hPrev) =>
          hPrev.map((item) =>
            item.id === report.id ? { ...item, deepDives: updated } : item
          )
        );
        return updated;
      });
    } catch (err: any) {
      setDeepDiveAppend((prev) => [
        ...prev,
        { inquiry: cleanInquiry, content: `Error generating follow-up: ${err?.message || err}` },
      ]);
    } finally {
      setIsProbing(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleStartResearch(initialQuery);
    }
  }, [initialQuery]);

  const assembleFullMarkdown = (r: StoredDossier) => {
    const parts = [
      `# ${r.query}`,
      `Generated: ${r.timestamp} · Depth: ${r.depth} · Lens: ${r.lens}`,
      '',
      r.summary,
    ];
    if (r.sources && r.sources.length > 0) {
      parts.push('\n## Cited Sources');
      r.sources.forEach((s) => parts.push(`- [${s.title || s.url}](${s.url})`));
    }
    deepDiveAppend.forEach((d) => {
      parts.push(`\n## Follow-Up Investigation: ${d.inquiry}\n\n${d.content}`);
    });
    return parts.join('\n');
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(assembleFullMarkdown(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!report) return;
    onSaveAsNote(`Research: ${report.query}`, assembleFullMarkdown(report));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownloadFile = () => {
    if (!report) return;
    const blob = new Blob([assembleFullMarkdown(report)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-research-${report.query.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenCitation = (url: string) => {
    if (onNavigateUrl) {
      onNavigateUrl(url);
    }
  };

  const wordCount = report
    ? report.summary.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="h-full flex bg-slate-950 text-slate-100 select-text font-sans overflow-hidden">
      {/* Collapsible Research History Sidebar */}
      {showHistoryDrawer && (
        <aside className="w-72 border-r border-slate-800 bg-slate-900/70 flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Saved Dossiers ({history.length})</span>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-slate-400 hover:text-rose-400 cursor-pointer"
                title="Clear history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Completed investigations will appear here.
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setReport(item);
                    setQuery(item.query);
                    setDeepDiveAppend(item.deepDives || []);
                    setFollowUpProbes(buildFollowUpProbes(item.query, item.lens));
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                    report?.id === item.id
                      ? 'bg-slate-800 border-cyan-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-medium line-clamp-2 leading-snug">{item.query}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {item.depth} · {item.sources?.length || 0} sources
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Utility Strip */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => setShowHistoryDrawer((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer transition-colors"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>History ({history.length})</span>
            </button>

            {report && (
              <button
                onClick={() => {
                  setReport(null);
                  setQuery('');
                  setDeepDiveAppend([]);
                  setFollowUpProbes([]);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </button>
            )}
          </div>

          {/* Clean Editorial Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white text-balance">
              Deep Research &amp; Grounded Synthesis
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Multi-source synthesis, empirical comparisons, and verified citations organized into portable Markdown dossiers.
            </p>
          </div>

          {/* Search & Controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartResearch();
            }}
            className="max-w-2xl mx-auto space-y-3"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setResearchDepth('deep')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    researchDepth === 'deep'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Deep Multi-Hop
                </button>
                <button
                  type="button"
                  onClick={() => setResearchDepth('flash')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    researchDepth === 'flash'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quick Brief
                </button>
              </div>

              <select
                aria-label="Research analytical lens"
                value={researchLens}
                onChange={(e) => setResearchLens(e.target.value as ResearchLens)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {LENS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    Lens: {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-cyan-500 rounded-xl p-1.5 transition-colors">
              <Search className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a technical, academic, or strategic research question..."
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none py-2"
              />
              <button
                type="submit"
                disabled={!query.trim() || isResearching}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isResearching ? 'animate-spin' : ''}`} />
                <span>{isResearching ? 'Investigating...' : 'Research'}</span>
              </button>
            </div>
          </form>

          {/* Preset Sparks */}
          {!report && !isResearching && (
            <div className="max-w-2xl mx-auto space-y-2.5">
              <div className="text-xs font-medium text-slate-400">
                Suggested Inquiries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RESEARCH_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStartResearch(preset)}
                    className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="line-clamp-2 leading-snug">{preset}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Investigation Progress */}
          {isResearching && (
            <div className="max-w-2xl mx-auto p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Investigating ({researchDepth === 'deep' ? 'Multi-Hop' : 'Quick Brief'})...
                </span>
                <span className="font-mono tabular-nums text-cyan-400">
                  Stage {currentStep}/4
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  'Decomposing research question into semantic search sub-queries',
                  'Aggregating external references and empirical benchmarks',
                  'Extracting comparative tradeoffs, edge cases, and architectural data',
                  'Synthesizing grounded Markdown research dossier',
                ].map((label, i) => {
                  const active = currentStep >= i + 1;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        active
                          ? 'bg-slate-950 border-cyan-500/40 text-slate-100'
                          : 'bg-slate-950/40 border-slate-800/70 text-slate-500'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-cyan-400' : 'text-slate-700'
                        }`}
                      />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Synthesized Research Report */}
          {report && !isResearching && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="capitalize">{report.depth} synthesis</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{report.lens} lens</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{wordCount} words</span>
                    <span aria-hidden="true">·</span>
                    <span>{report.timestamp}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white tracking-tight leading-snug">
                    {report.query}
                  </h2>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onNavigateUrl && (
                    <button
                      onClick={() =>
                        onNavigateUrl(`aksh://mindmap?topic=${encodeURIComponent(report.query)}`)
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Network className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Graph</span>
                    </button>
                  )}

                  <button
                    onClick={handleSaveToNotes}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    {saved ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Saved
                      </span>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

              {/* Cited Sources */}
              {report.sources && report.sources.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Referenced Sources ({report.sources.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.sources.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleOpenCitation(src.url)}
                        className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-left text-xs text-cyan-400 hover:text-cyan-300 border border-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <span className="truncate font-mono">{src.title || src.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Dossier */}
              <div className="p-6 md:p-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                  <Markdown>{report.summary}</Markdown>
                </div>
              </div>

              {/* Appended Deep-Dive Investigations */}
              {deepDiveAppend.map((deep, dIdx) => (
                <div
                  key={dIdx}
                  className="p-6 rounded-xl bg-slate-900 border border-slate-700 space-y-3"
                >
                  <div className="pb-2.5 border-b border-slate-800 text-xs font-semibold text-cyan-400">
                    Follow-Up: {deep.inquiry}
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                    <Markdown>{deep.content}</Markdown>
                  </div>
                </div>
              ))}

              {/* Follow-Up Probe + Custom Question Bar */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Continue Investigation</span>
                  {isProbing && (
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Investigating...</span>
                    </span>
                  )}
                </div>

                {followUpProbes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {followUpProbes.map((probe, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleRunFollowUpProbe(probe)}
                        disabled={isProbing}
                        className="text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 space-y-1.5"
                      >
                        <div className="line-clamp-2 leading-snug">{probe}</div>
                        <div className="text-[11px] text-cyan-400 flex items-center gap-1">
                          <span>Investigate</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunFollowUpProbe(customFollowUp);
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={customFollowUp}
                    onChange={(e) => setCustomFollowUp(e.target.value)}
                    placeholder="Ask a follow-up question about this dossier..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!customFollowUp.trim() || isProbing}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-medium cursor-pointer"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
