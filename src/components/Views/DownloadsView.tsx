import React, { useState } from 'react';
import { Download, Search, CheckCircle2, Folder, FileText, Pause, Play, Trash2, ArrowDownToLine } from 'lucide-react';
import { DownloadItem } from '../../types';

interface DownloadsViewProps {
  downloads: DownloadItem[];
  onClearDownloads: () => void;
  onSimulateDownload: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  onClearDownloads,
  onSimulateDownload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = downloads.filter((d) =>
    d.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Download Manager</h1>
              <p className="text-xs text-slate-500">Track and manage downloaded files, datasets, and PDF papers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateDownload}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Simulate Download</span>
            </button>

            <button
              onClick={onClearDownloads}
              disabled={downloads.length === 0}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              Clear List
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search downloads..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Downloads List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.filename}
                    </span>
                    {item.status === 'completed' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{item.url}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  title="Show in folder"
                >
                  <Folder className="w-3.5 h-3.5 text-blue-600" />
                  <span>Show in folder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
