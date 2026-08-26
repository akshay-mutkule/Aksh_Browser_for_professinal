import React, { useState } from 'react';
import { History, Search, Trash2, Globe, ExternalLink, Clock, Calendar } from 'lucide-react';
import { HistoryItem } from '../../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onNavigate,
  onClearHistory,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Browsing History</h1>
              <p className="text-xs text-slate-400">Manage visited web pages and research sessions</p>
            </div>
          </div>

          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Browsing History</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search through history entries..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* History List */}
        <div className="space-y-2">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xs"
              >
                <div
                  onClick={() => onNavigate(item.url)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{item.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{item.visitedAt}</span>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">No history entries found</p>
              <p className="text-xs text-slate-500">Pages you visit will automatically appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
