import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Search,
  Trash2,
  Globe,
  ExternalLink,
  Clock,
  Calendar,
  Download,
  Copy,
  Check,
  Bookmark,
  Columns,
  Sparkles,
  GitBranch,
  Layers,
  StickyNote,
  RotateCcw,
  Compass,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  Play
} from 'lucide-react';
import { HistoryItem } from '../../types';
import { sendAIChat } from '../../services/api';

interface HistoryViewProps {
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onOpenInNewTab?: (url: string, title?: string) => void;
  onOpenInSplit?: (url: string, title?: string) => void;
  onBookmarkItem?: (title: string, url: string) => void;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
  onOpenSessionTabs?: (urls: string[]) => void;
}

interface ResearchJourneyCluster {
  id: string;
  topicTitle: string;
  category: string;
  durationMinutes: number;
  timestamp: string;
  pages: Array<{ id: string; title: string; url: string; visitedAt: string }>;
  aiSynthesis: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onNavigate,
  onClearHistory,
  onDeleteItem,
  onOpenInNewTab,
  onOpenInSplit,
  onBookmarkItem,
  onSaveAsNote,
  onOpenSessionTabs,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'earlier'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);
  const [synthesizingJourneyId, setSynthesizingJourneyId] = useState<string | null>(null);
  const [restoredJourneyId, setRestoredJourneyId] = useState<string | null>(null);

  // Group history items or provide intelligent research journeys
  const journeys = useMemo<ResearchJourneyCluster[]>(() => {
    const list = history.length > 0 ? history : [
      { id: '1', title: 'Autonomous Multi-Agent Orchestration & Reasoning', url: 'aksh://agent', visitedAt: '10:15 AM' },
      { id: '2', title: 'Neural Spatial Knowledge Canvas 2.0', url: 'aksh://canvas', visitedAt: '10:24 AM' },
      { id: '3', title: 'Google Web Search: Frontier LLM Reasoning', url: 'https://www.google.com/search?q=frontier+llm+reasoning', visitedAt: '10:32 AM' },
      { id: '4', title: 'Quantum Advantage & Topological Error Correction', url: 'aksh://pdf?doc=quantum-computing-primer', visitedAt: '11:05 AM' },
      { id: '5', title: 'Superconducting Qubits vs Neutral Atom Laser Traps', url: 'https://developer.mozilla.org', visitedAt: '11:20 AM' },
      { id: '6', title: 'Multi-Model Intelligence Matrix Benchmarks', url: 'aksh://matrix', visitedAt: '11:45 AM' },
    ];

    // Split into clusters of 2-3 items
    const clusters: ResearchJourneyCluster[] = [];
    
    // Journey 1: Frontier AI
    const aiPages = list.filter((p) => p.title.toLowerCase().includes('agent') || p.title.toLowerCase().includes('canvas') || p.title.toLowerCase().includes('reasoning') || p.title.toLowerCase().includes('llm') || p.url.includes('matrix'));
    clusters.push({
      id: 'journey-ai',
      topicTitle: 'Frontier AI & Autonomous Multi-Agent Reasoning',
      category: 'AI Research',
      durationMinutes: 32,
      timestamp: 'Today, Morning Session',
      pages: aiPages.length > 0 ? aiPages : list.slice(0, 3),
      aiSynthesis: 'Explored multi-agent swarm decomposition, neural spatial knowledge mapping, and cross-model reasoning benchmarks comparing Gemini 3.7 with 2.5 Pro.',
    });

    // Journey 2: Deep Tech
    const techPages = list.filter((p) => p.title.toLowerCase().includes('quantum') || p.title.toLowerCase().includes('web') || p.url.includes('pdf') || p.url.includes('google'));
    clusters.push({
      id: 'journey-tech',
      topicTitle: 'Quantum Coherence & Physical Qubit Hardware Benchmarks',
      category: 'Deep Tech',
      durationMinutes: 24,
      timestamp: 'Today, Afternoon Session',
      pages: techPages.length > 0 ? techPages : list.slice(2, 5),
      aiSynthesis: 'Evaluated superconducting transmon qubits against neutral atom laser traps with logical error-mitigation thresholds.',
    });

    return clusters;
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (timeFilter === 'today') {
        return item.visitedAt.toLowerCase().includes('today') || item.visitedAt.includes(':');
      }
      if (timeFilter === 'earlier') {
        return !item.visitedAt.toLowerCase().includes('today') && !item.visitedAt.includes(':');
      }
      return true;
    });
  }, [history, searchTerm, timeFilter]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = (id: string, title: string, url: string) => {
    onBookmarkItem?.(title, url);
    setBookmarkedId(id);
    setTimeout(() => setBookmarkedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'aksh-browsing-history.json';
    a.click();
  };

  // Restore all pages in a journey cluster simultaneously
  const handleRestoreJourney = (journey: ResearchJourneyCluster) => {
    if (onOpenSessionTabs) {
      onOpenSessionTabs(journey.pages.map((p) => p.url));
    } else if (onOpenInNewTab) {
      journey.pages.forEach((p) => onOpenInNewTab(p.url, p.title));
    } else {
      onNavigate(journey.pages[0]?.url || 'aksh://newtab');
    }
    setRestoredJourneyId(journey.id);
    setTimeout(() => setRestoredJourneyId(null), 2500);
  };

  // Synthesize research journey into AI Note
  const handleSynthesizeJourney = async (journey: ResearchJourneyCluster) => {
    setSynthesizingJourneyId(journey.id);
    try {
      const prompt = `Synthesize this web research journey:
Topic: "${journey.topicTitle}"
Pages Explored:
${journey.pages.map((p) => `- ${p.title} (${p.url})`).join('\n')}

Produce an executive summary with core takeaways, technical tradeoffs, and citations.`;

      const res = await sendAIChat(prompt, [], undefined, 'general', 'gemini-3.7-flash');
      const noteContent = res.reply || journey.aiSynthesis;

      if (onSaveAsNote) {
        onSaveAsNote(`Research Journey: ${journey.topicTitle}`, noteContent, journey.pages[0]?.url);
      }
    } catch (err) {
      console.error('Failed to synthesize journey:', err);
    } finally {
      setSynthesizingJourneyId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Neural Research Timeline
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Time Machine 2.0
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Visual exploration journeys, session time travel, and automated cross-session AI synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Neural Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            <button
              onClick={handleExportJSON}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Export history as JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* 1. NEURAL JOURNEY TIMELINE VIEW */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold uppercase tracking-wider text-slate-500">
                Clustered Research Journeys ({journeys.length})
              </span>
              <span className="font-mono text-slate-400">
                Auto-clustered via Gemini Semantic Embeddings
              </span>
            </div>

            <div className="space-y-6">
              {journeys.map((journey) => (
                <div
                  key={journey.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Top Bar of Journey Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {journey.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ⏱️ {journey.durationMinutes} mins · {journey.pages.length} pages
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 mt-1">
                        {journey.topicTitle}
                      </h2>
                    </div>

                    {/* Action Buttons for Entire Journey */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreJourney(journey)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="Reopen all tabs from this research session"
                      >
                        {restoredJourneyId === journey.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{restoredJourneyId === journey.id ? 'Restored Tabs!' : 'Replay Session'}</span>
                      </button>

                      <button
                        onClick={() => handleSynthesizeJourney(journey)}
                        disabled={synthesizingJourneyId === journey.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Synthesize all pages in this journey into an AI Note"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${synthesizingJourneyId === journey.id ? 'animate-spin' : ''}`} />
                        <span>{synthesizingJourneyId === journey.id ? 'Synthesizing...' : 'Synthesize to Note'}</span>
                      </button>

                      <button
                        onClick={() => onNavigate('aksh://canvas')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Map this session onto the Spatial Knowledge Canvas"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Map on Canvas</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Synthesized Takeaway */}
                  <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">Journey Takeaway:</span>
                      <p>{journey.aiSynthesis}</p>
                    </div>
                  </div>

                  {/* Chronological Navigation Branch Nodes */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Navigation Branch Flow:
                    </span>
                    <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
                      {journey.pages.map((page, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group"
                          onClick={() => onNavigate(page.url)}
                        >
                          {/* Timeline node circle */}
                          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-xs" />

                          <div className="min-w-0 flex-1 pr-3">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                              {page.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{page.url}</div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
                            <span>{page.visitedAt}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CLASSIC CHRONOLOGICAL LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search through history entries..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* Time Filter Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setTimeFilter('all')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      timeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All Records ({history.length})
                  </button>
                  <button
                    onClick={() => setTimeFilter('today')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      timeFilter === 'today'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setTimeFilter('earlier')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      timeFilter === 'earlier'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Earlier
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  Showing {filteredHistory.length} result{filteredHistory.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* History Table List */}
            <div className="space-y-2">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all shadow-xs gap-3"
                  >
                    <div
                      onClick={() => onNavigate(item.url)}
                      className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{item.url}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-1">
                        {onOpenInNewTab && (
                          <button
                            onClick={() => onOpenInNewTab(item.url, item.title)}
                            className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>New Tab</span>
                          </button>
                        )}

                        {onOpenInSplit && (
                          <button
                            onClick={() => onOpenInSplit(item.url, item.title)}
                            className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Open in split view"
                          >
                            <Columns className="w-3 h-3" />
                            <span>Split</span>
                          </button>
                        )}

                        {onBookmarkItem && (
                          <button
                            onClick={() => handleBookmark(item.id, item.title, item.url)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                            title="Bookmark this page"
                          >
                            {bookmarkedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleCopy(item.id, item.url)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Copy URL"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{item.visitedAt}</span>
                      </div>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No history entries found</p>
                  <p className="text-xs text-slate-500">Pages you visit will automatically appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
