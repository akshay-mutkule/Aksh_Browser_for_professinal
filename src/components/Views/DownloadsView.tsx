import React, { useState } from 'react';
import {
  Download,
  Search,
  CheckCircle2,
  Folder,
  FileText,
  Pause,
  Play,
  Trash2,
  ArrowDownToLine,
  Plus,
  RefreshCw,
  X,
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react';
import { DownloadItem } from '../../types';

interface DownloadsViewProps {
  downloads: DownloadItem[];
  onClearDownloads: () => void;
  onSimulateDownload: () => void;
  onAddDownload?: (item: DownloadItem) => void;
  onDeleteDownload?: (id: string) => void;
  onTogglePauseDownload?: (id: string) => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  onClearDownloads,
  onSimulateDownload,
  onAddDownload,
  onDeleteDownload,
  onTogglePauseDownload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active'>('all');

  // Add download modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  // Preview file modal
  const [previewItem, setPreviewItem] = useState<DownloadItem | null>(null);

  const filtered = downloads.filter((d) => {
    const matchesSearch =
      d.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.url.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'completed') return d.status === 'completed';
    if (statusFilter === 'active') return d.status === 'downloading' || d.status === 'paused';
    return true;
  });

  const handleStartCustomDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim() || !onAddDownload) return;

    const filename =
      downloadName.trim() ||
      downloadUrl.split('/').pop()?.split('?')[0] ||
      `download-${Date.now()}.dat`;

    const newItem: DownloadItem = {
      id: `dl-${Date.now()}`,
      filename,
      size: '4.8 MB',
      progress: 0,
      status: 'downloading',
      url: downloadUrl.trim(),
      timestamp: 'Just now',
      speed: '1.4 MB/s',
    };

    onAddDownload(newItem);
    setDownloadUrl('');
    setDownloadName('');
    setShowAddModal(false);
  };

  const handleExportFile = (item: DownloadItem) => {
    const sampleContent = `# ${item.filename}\nDownloaded from: ${item.url}\nTime: ${item.timestamp}\nSize: ${item.size}\nStatus: ${item.status}\n\nThis file was securely fetched by Aksh AI Browser.`;
    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Download Manager</h1>
              <p className="text-xs text-slate-500">
                Track, pause, preview, and manage downloaded research papers, datasets, and web files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Download URL</span>
            </button>

            <button
              onClick={onSimulateDownload}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Add sample research PDF download"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
              <span>Sample PDF</span>
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

        {/* Search & Status Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search downloads by file name or URL..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({downloads.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Active & Paused
            </button>
          </div>
        </div>

        {/* Downloads List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {item.status === 'downloading' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 flex items-center gap-1 shrink-0 animate-pulse">
                          Downloading ({item.progress}%)
                        </span>
                      )}
                      {item.status === 'paused' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1 shrink-0">
                          Paused
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      {item.speed && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-semibold">{item.speed}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{item.url}</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.status === 'downloading' && onTogglePauseDownload && (
                    <button
                      onClick={() => onTogglePauseDownload(item.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Pause download"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.status === 'paused' && onTogglePauseDownload && (
                    <button
                      onClick={() => onTogglePauseDownload(item.id)}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Resume download"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Quick Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleExportFile(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                    title="Save to system"
                  >
                    <Folder className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Save</span>
                  </button>

                  {onDeleteDownload && (
                    <button
                      onClick={() => onDeleteDownload(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar for active downloading */}
              {item.status !== 'completed' && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.status === 'paused' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Download className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No downloads found</p>
              <p className="text-xs">Download papers, datasets, or files to track them here.</p>
            </div>
          )}
        </div>

        {/* Add Download Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Download from URL</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleStartCustomDownload} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">File URL *</label>
                  <input
                    type="url"
                    required
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://example.com/dataset.csv or paper.pdf"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Save As (optional)</label>
                  <input
                    type="text"
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    placeholder="research-dataset.csv"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    Start Download
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* File Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                    {previewItem.filename}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">File Size:</span>
                  <span className="font-mono font-bold text-slate-800">{previewItem.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600 capitalize">{previewItem.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="font-mono text-slate-700">{previewItem.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source URL:</span>
                  <span className="font-mono text-blue-600 truncate max-w-[240px]">
                    {previewItem.url}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleExportFile(previewItem);
                    setPreviewItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer text-xs shadow-xs"
                >
                  Download to Device
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
