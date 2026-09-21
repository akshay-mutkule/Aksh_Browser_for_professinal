import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Zap,
  Check,
  Copy,
  BookmarkPlus,
  ArrowRight,
  Plus,
  Trash2,
  Award,
  DollarSign,
  Flame,
  ShieldAlert,
  Layers,
  Columns,
  Download,
  Globe,
  Filter,
  ExternalLink
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Tab } from '../../types';
import { compareProducts } from '../../services/api';

interface ProductComparisonViewProps {
  tabs?: Tab[];
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onOpenInSplit?: (url: string, title?: string) => void;
  onNavigateUrl?: (url: string) => void;
}

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  tabs = [],
  onSaveAsNote,
  onOpenInSplit,
  onNavigateUrl,
}) => {
  const [activeMode, setActiveMode] = useState<'open_tabs' | 'benchmarks' | 'custom'>('open_tabs');
  const [selectedPreset, setSelectedPreset] = useState('laptops');
  const [customQuery, setCustomQuery] = useState('');
  const [selectedTabIds, setSelectedTabIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [csvDownloaded, setCsvDownloaded] = useState(false);

  // Initialize selected tabs if user has at least 2 tabs
  React.useEffect(() => {
    if (tabs.length >= 2 && selectedTabIds.length === 0) {
      // Pick first two non-internal tabs if available, or first two tabs
      const candidateTabs = tabs.filter((t) => !t.url.startsWith('aksh://'));
      if (candidateTabs.length >= 2) {
        setSelectedTabIds([candidateTabs[0].id, candidateTabs[1].id]);
      } else if (tabs.length >= 2) {
        setSelectedTabIds([tabs[0].id, tabs[1].id]);
      }
    }
  }, [tabs]);

  const COMPARISON_PRESETS = [
    {
      id: 'laptops',
      title: 'Flagship Developer Laptops',
      description: 'MacBook Pro 14" M3 Pro vs Dell XPS 15 (OLED) vs ThinkPad X1 Carbon Gen 12',
      query: 'Compare Apple MacBook Pro 14 (M3 Pro, 18GB RAM, $1999) vs Dell XPS 15 9530 (i7-13700H, RTX 4060, 32GB RAM, $1849) vs Lenovo ThinkPad X1 Carbon Gen 12 (Core Ultra 7 155H, 32GB RAM, $1699). Focus on compile speeds, battery longevity, keyboard quality, display resolution, thermals, and price-to-performance.',
    },
    {
      id: 'ai_models',
      title: 'Frontier AI Reasoning Models',
      description: 'Gemini 3.7 Flash vs Claude 3.7 Sonnet vs OpenAI GPT-4.5',
      query: 'Compare Google Gemini 3.7 Flash vs Anthropic Claude 3.7 Sonnet vs OpenAI GPT-4.5. Benchmark on extended reasoning / thinking latency, complex coding benchmarks (SWE-bench), context window throughput, tool use / function calling reliability, and API cost per million tokens.',
    },
    {
      id: 'headphones',
      title: 'Premium ANC Headphones',
      description: 'Sony WH-1000XM5 vs Bose QuietComfort Ultra vs Apple AirPods Max',
      query: 'Compare Sony WH-1000XM5 ($399) vs Bose QuietComfort Ultra ($429) vs Apple AirPods Max ($549). Compare Active Noise Cancellation, audio fidelity, comfort for 8hr work sessions, mic quality for Zoom, battery hours, and ecosystem convenience.',
    },
    {
      id: 'frameworks',
      title: 'Modern Full-Stack Web Stacks',
      description: 'Next.js 15 (App Router) vs Remix (React Router v7) vs Vite SPA + Express',
      query: 'Compare Next.js 15 App Router vs Remix / React Router v7 vs Vite React SPA + Express. Compare Server Components mental model, routing ergonomics, bundle footprint, deployment flexibility outside Vercel, and developer velocity.',
    },
    {
      id: 'smartphones',
      title: '2026 Flagship Smartphones',
      description: 'iPhone 16 Pro Max vs Samsung Galaxy S25 Ultra vs Google Pixel 9 Pro',
      query: 'Compare Apple iPhone 16 Pro Max ($1199) vs Samsung Galaxy S25 Ultra ($1299) vs Google Pixel 9 Pro ($999). Compare camera optical zoom & low-light performance, on-device AI features, battery endurance, display brightness in direct sun, and update lifespans.',
    },
  ];

  const handleToggleTabSelect = (tabId: string) => {
    setSelectedTabIds((prev) => {
      if (prev.includes(tabId)) {
        return prev.filter((id) => id !== tabId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), tabId]; // cap at 4 tabs
      }
      return [...prev, tabId];
    });
  };

  const handleRunComparison = async (overrideQuery?: string) => {
    setIsComparing(true);
    setReport(null);

    try {
      if (activeMode === 'open_tabs') {
        const pickedTabs = tabs.filter((t) => selectedTabIds.includes(t.id));
        if (pickedTabs.length < 2) {
          setIsComparing(false);
          return;
        }

        const tabsPayload = pickedTabs.map((t) => ({
          title: t.title,
          url: t.url,
          snippet: (t.extractedText || t.metaDescription || '').slice(0, 1500),
        }));

        const res = await compareProducts(
          tabsPayload,
          `Compare these ${pickedTabs.length} open browser web pages and products in depth.`
        );
        setReport(res.report);
      } else {
        const q = (overrideQuery || customQuery).trim();
        const queryToUse =
          q ||
          COMPARISON_PRESETS.find((p) => p.id === selectedPreset)?.query ||
          'Compare leading developer laptops';

        const res = await compareProducts(queryToUse, q);
        setReport(res.report);
      }
    } catch (err: any) {
      setReport(`❌ Error comparing items: ${err.message || 'Server error'}`);
    } finally {
      setIsComparing(false);
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveNote = () => {
    if (report) {
      let title = 'AI Comparison Matrix';
      if (activeMode === 'open_tabs') {
        const titles = tabs
          .filter((t) => selectedTabIds.includes(t.id))
          .map((t) => t.title.slice(0, 20))
          .join(' vs ');
        title = `Comparison: ${titles}`;
      } else if (customQuery) {
        title = `Comparison: ${customQuery.slice(0, 35)}`;
      } else {
        const preset = COMPARISON_PRESETS.find((p) => p.id === selectedPreset);
        title = preset ? preset.title : 'AI Product Comparison';
      }
      onSaveAsNote(title, report);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDownloadCsv = () => {
    if (!report) return;
    // Extract markdown table rows if present
    const lines = report.split('\n');
    const tableLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
    let csvContent = '';
    if (tableLines.length > 0) {
      // Filter out divider lines | :--- | :--- |
      const cleanRows = tableLines.filter((l) => !/^[|\s-:]+$/.test(l));
      csvContent = cleanRows
        .map((row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((cell) => `"${cell.trim().replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\n');
    } else {
      csvContent = `"Report"\n"${report.replace(/"/g, '""')}"`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparison_matrix_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2000);
  };

  const handleOpenSplitForComparedTabs = () => {
    if (selectedTabIds.length >= 2 && onOpenInSplit) {
      const tab1 = tabs.find((t) => t.id === selectedTabIds[0]);
      const tab2 = tabs.find((t) => t.id === selectedTabIds[1]);
      if (tab2) {
        onOpenInSplit(tab2.url, tab2.title);
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold shadow-2xs">
            <Scale className="w-4 h-4 text-pink-600" />
            <span>Aksh AI Multi-Tab & Decision Matrix Studio</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Compare Anything Head-to-Head
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto">
            Extract granular specifications, pricing metrics, trade-offs, and generate data-driven decision verdicts with Gemini 3.7.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-300 shadow-2xs">
            <button
              onClick={() => setActiveMode('open_tabs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'open_tabs'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-pink-600" />
              <span>Compare Open Tabs ({tabs.length})</span>
            </button>

            <button
              onClick={() => setActiveMode('benchmarks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'benchmarks'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Curated Benchmarks</span>
            </button>

            <button
              onClick={() => setActiveMode('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'custom'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>Custom Query / URLs</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Compare Open Browser Tabs */}
        {activeMode === 'open_tabs' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-600" />
                  <span>Select 2 to 4 Open Tabs to Compare</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aksh AI synthesizes live content, product specs, pricing, and architecture from your active tabs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                {selectedTabIds.length} / 4 Selected
              </span>
            </div>

            {/* Tabs Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {tabs.map((tab) => {
                const isSelected = selectedTabIds.includes(tab.id);
                return (
                  <div
                    key={tab.id}
                    onClick={() => handleToggleTabSelect(tab.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-pink-50/70 border-pink-400 ring-2 ring-pink-400/20'
                        : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected ? 'bg-pink-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-2 truncate">
                        {tab.favicon ? (
                          <img
                            src={tab.favicon}
                            alt=""
                            className="w-3.5 h-3.5 rounded-xs shrink-0 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {tab.title || 'Untitled Tab'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        {tab.url}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Button & Split Shortcut */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedTabIds.length === 2 && onOpenInSplit && (
                  <button
                    type="button"
                    onClick={handleOpenSplitForComparedTabs}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                  >
                    <Columns className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Open 2 Selected in Split-Screen</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleRunComparison()}
                disabled={selectedTabIds.length < 2 || isComparing}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-pink-500/20 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>
                  {isComparing
                    ? 'Comparing Tabs with Gemini...'
                    : `Compare ${selectedTabIds.length} Selected Tabs`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: Curated Benchmark Presets */}
        {activeMode === 'benchmarks' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Curated Benchmark Showdowns:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {COMPARISON_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset.id);
                    setCustomQuery('');
                    handleRunComparison(preset.query);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between shadow-2xs cursor-pointer ${
                    selectedPreset === preset.id
                      ? 'bg-pink-50/70 border-pink-400 ring-2 ring-pink-400/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-pink-700 uppercase tracking-wide">
                        {preset.title}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-pink-600">
                    <span>Compare Showdown</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: Custom Comparison Input */}
        {activeMode === 'custom' && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-md">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Enter Any Custom Products, Technologies, or Models:</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunComparison();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="e.g. 'RTX 4070 Ti Super vs RTX 4080 Super vs RX 7900 XTX' or 'Kindle Paperwhite vs Kobo Clara'..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-500/15"
              />
              <button
                type="submit"
                disabled={!customQuery.trim() || isComparing}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shrink-0 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>{isComparing ? 'Comparing...' : 'Compare Showdown'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Comparison Loading State */}
        {isComparing && (
          <div className="py-16 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-3 border-pink-600 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-pink-900">
                Aksh AI is extracting specifications & computing comparison matrix...
              </h3>
              <p className="text-xs text-slate-500">
                Synthesizing benchmarks, value-for-money tradeoffs, and verdict determinations.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Report Output */}
        {report && !isComparing && (
          <div className="space-y-6 animate-in fade-in">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs gap-3">
              <span className="font-bold text-pink-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Decision Matrix & Showdown</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                  title="Export matrix table to CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{csvDownloaded ? 'Exported CSV!' : 'Download CSV'}</span>
                </button>

                <button
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                >
                  {saved ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                      <span>Save to Notes</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Markdown Body */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-slate-800">
              <div className="markdown-body max-w-none text-slate-800 text-sm leading-relaxed">
                <Markdown>{report}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
