import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, Clock, ShieldAlert, History, Download, Database, FileText } from 'lucide-react';

interface ClearBrowsingDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: (options: {
    clearHistory: boolean;
    clearDownloads: boolean;
    clearNotes: boolean;
    clearCache: boolean;
    timeRange: 'hour' | 'day' | 'week' | 'all';
  }) => void;
  counts?: {
    history?: number;
    downloads?: number;
    notes?: number;
  };
}

export const ClearBrowsingDataModal: React.FC<ClearBrowsingDataModalProps> = ({
  isOpen,
  onClose,
  onClearData,
  counts,
}) => {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'all'>('all');
  const [clearHistory, setClearHistory] = useState(true);
  const [clearDownloads, setClearDownloads] = useState(true);
  const [clearCache, setClearCache] = useState(true);
  const [clearNotes, setClearNotes] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClearData({
      clearHistory,
      clearDownloads,
      clearNotes,
      clearCache,
      timeRange,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Clear Browsing Data</h2>
                <p className="text-xs text-slate-500">Free up disk space and clear private session activity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Time Range Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time Range</span>
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer text-slate-800"
              >
                <option value="hour">Last hour</option>
                <option value="day">Last 24 hours</option>
                <option value="week">Last 7 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Checkboxes List */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearHistory}
                  onChange={(e) => setClearHistory(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <History className="w-3.5 h-3.5 text-blue-500" />
                    <span>Browsing history</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Clears history logs and recent tab visits</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearDownloads}
                  onChange={(e) => setClearDownloads(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download records</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Clears completed and active download logs</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearCache}
                  onChange={(e) => setClearCache(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cached web pages & cookies</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Frees temporary memory and cached media</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearNotes}
                  onChange={(e) => setClearNotes(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    <span>AI Cornell Research Notes</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Delete all local saved AI research notes</p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Bookmarks and pinned tabs will remain intact.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Data</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
