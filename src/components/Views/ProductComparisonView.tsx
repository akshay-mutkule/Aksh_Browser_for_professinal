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
  ShieldAlert
} from 'lucide-react';
import Markdown from 'react-markdown';
import { compareProducts } from '../../services/api';

interface ProductComparisonViewProps {
  onSaveAsNote: (title: string, content: string) => void;
}

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  onSaveAsNote,
}) => {
  const [selectedPreset, setSelectedPreset] = useState('laptops');
  const [customQuery, setCustomQuery] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const COMPARISON_PRESETS = [
    {
      id: 'laptops',
      title: 'Flagship Developer Laptops',
      description: 'MacBook Pro 14" M3 Pro vs Dell XPS 15 (OLED) vs ThinkPad X1 Carbon Gen 12',
      query: 'Compare Apple MacBook Pro 14 (M3 Pro, 18GB RAM, $1999) vs Dell XPS 15 9530 (i7-13700H, RTX 4060, 32GB RAM, $1849) vs Lenovo ThinkPad X1 Carbon Gen 12 (Core Ultra 7 155H, 32GB RAM, $1699). Focus on compile speeds, battery longevity, keyboard quality, display resolution, thermals, and price-to-performance.',
    },
    {
      id: 'headphones',
      title: 'Premium ANC Headphones',
      description: 'Sony WH-1000XM5 vs Bose QuietComfort Ultra vs Apple AirPods Max',
      query: 'Compare Sony WH-1000XM5 ($399) vs Bose QuietComfort Ultra ($429) vs Apple AirPods Max ($549). Compare Active Noise Cancellation, audio fidelity, comfort for 8hr work sessions, mic quality for Zoom, battery hours, and ecosystem convenience.',
    },
    {
      id: 'smartphones',
      title: '2026 Flagship Smartphones',
      description: 'iPhone 16 Pro Max vs Samsung Galaxy S25 Ultra vs Google Pixel 9 Pro',
      query: 'Compare Apple iPhone 16 Pro Max ($1199) vs Samsung Galaxy S25 Ultra ($1299) vs Google Pixel 9 Pro ($999). Compare camera optical zoom & low-light performance, on-device AI features, battery endurance, display brightness in direct sun, and update lifespans.',
    },
  ];

  const handleRunComparison = async (overrideQuery?: string) => {
    const q = (overrideQuery || customQuery).trim();
    if (!q && !selectedPreset) return;

    const queryToUse =
      q ||
      COMPARISON_PRESETS.find((p) => p.id === selectedPreset)?.query ||
      'Compare leading laptops';

    setIsComparing(true);
    setReport(null);

    try {
      const res = await compareProducts(queryToUse, q);
      setReport(res.report);
    } catch (err: any) {
      setReport(`❌ Error comparing products: ${err.message || 'Server error'}`);
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
      const title = customQuery ? `Comparison: ${customQuery.slice(0, 30)}` : 'AI Product Comparison';
      onSaveAsNote(title, report);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold shadow-inner">
            <Scale className="w-4 h-4 text-pink-400" />
            <span>Aksh AI Product Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            AI Product Comparison & Decision Matrix
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Extract granular hardware specifications, benchmark prices, analyze user sentiment, and find the undisputed best value choice.
          </p>
        </div>

        {/* Comparison Presets Cards */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between shadow-sm ${
                  selectedPreset === preset.id
                    ? 'bg-pink-950/30 border-pink-500/50 ring-1 ring-pink-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wide">
                      {preset.title}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{preset.description}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-pink-400">
                  <span>Compare Showdown</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Comparison Input */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Or Enter Any Custom Products / Models to Compare:</span>
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
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
            <button
              type="submit"
              disabled={!customQuery.trim() || isComparing}
              className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-pink-600/20 shrink-0"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Comparing...' : 'Compare Products'}</span>
            </button>
          </form>
        </div>

        {/* Comparison Loading State */}
        {isComparing && (
          <div className="py-16 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-3 border-pink-500 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-pink-300">
                Nexus AI is analyzing product specs & benchmarks...
              </h3>
              <p className="text-xs text-slate-400">
                Comparing processors, thermals, display metrics, and user feedback.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Report Output */}
        {report && !isComparing && (
          <div className="space-y-6 animate-in fade-in">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-semibold text-pink-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Generated Product Showdown</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
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
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
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
              </div>
            </div>

            {/* Markdown Body */}
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-slate-200">
              <div className="markdown-body prose prose-invert max-w-none">
                <Markdown>{report}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
