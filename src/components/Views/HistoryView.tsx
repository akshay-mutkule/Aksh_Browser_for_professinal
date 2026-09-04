import React, { useState, useMemo } from 'react';
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
  Columns
} from 'lucide-react';
import { HistoryItem } from '../../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onOpenInNewTab?: (url: string, title?: string) => void;
  onOpenInSplit?: (url: string, title?: string) => void;
  onBookmarkItem?: (title: string, url: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onNavigate,
  onClearHistory,
  onDeleteItem,
  onOpenInNewTab,
  onOpenInSplit,
  onBookmarkItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'earlier'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);

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

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Browsing History</h1>
              <p className="text-xs text-slate-500">
                Track visited research sessions, web pages, and fast jump back to past topics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Export history as JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export History</span>
            </button>

            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

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

        {/* History List */}
        <div className="space-y-2">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all shadow-xs gap-3"
              >
                <div
                  onClick={() => onNavigate(item.url)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
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
                  {/* Action buttons */}
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
    </div>
  );
};
