import React, { useState, useMemo, useRef } from 'react';
import {
  Bookmark,
  Search,
  Trash2,
  Plus,
  Globe,
  Folder,
  ExternalLink,
  Download,
  Upload,
  Copy,
  Check,
  Edit3,
  Columns,
  X,
  FileCode,
  Sparkles
} from 'lucide-react';
import { Bookmark as BookmarkType } from '../../types';

interface BookmarksViewProps {
  bookmarks: BookmarkType[];
  onNavigate: (url: string) => void;
  onDeleteBookmark: (id: string) => void;
  onAddBookmark: (title: string, url: string, folder?: string) => void;
  onUpdateBookmark?: (id: string, updated: Partial<BookmarkType>) => void;
  onImportBookmarks?: (imported: BookmarkType[]) => void;
  onOpenInNewTab?: (url: string, title?: string) => void;
  onOpenInSplit?: (url: string, title?: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onNavigate,
  onDeleteBookmark,
  onAddBookmark,
  onUpdateBookmark,
  onImportBookmarks,
  onOpenInNewTab,
  onOpenInSplit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('Research');

  // Edit modal state
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editFolder, setEditFolder] = useState('');

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folders list
  const folders = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.folder) set.add(b.folder);
    });
    return Array.from(set);
  }, [bookmarks]);

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.folder && b.folder.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFolder = !selectedFolder || b.folder === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    onAddBookmark(newTitle.trim(), newUrl.trim(), newFolder.trim() || 'General');
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const handleStartEdit = (b: BookmarkType) => {
    setEditingBookmark(b);
    setEditTitle(b.title);
    setEditUrl(b.url);
    setEditFolder(b.folder || 'General');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookmark || !onUpdateBookmark) return;
    onUpdateBookmark(editingBookmark.id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      folder: editFolder.trim(),
    });
    setEditingBookmark(null);
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'aksh-bookmarks.json';
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportBookmarks) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const validBookmarks = parsed.map((item: any, idx: number) => ({
            id: item.id || `imported-${Date.now()}-${idx}`,
            title: item.title || item.name || 'Untitled Bookmark',
            url: item.url || item.link || 'https://google.com',
            folder: item.folder || item.category || 'Imported',
            createdAt: item.createdAt || new Date().toISOString().split('T')[0],
          }));
          onImportBookmarks(validBookmarks);
        }
      } catch (err) {
        console.error('Failed to import bookmarks JSON', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSamplePack = () => {
    if (!onImportBookmarks) return;
    const samplePack: BookmarkType[] = [
      {
        id: `sample-${Date.now()}-1`,
        title: 'ArXiv Computer Science & AI Papers',
        url: 'https://arxiv.org/list/cs.AI/recent',
        folder: 'Research',
        createdAt: 'Today',
      },
      {
        id: `sample-${Date.now()}-2`,
        title: 'Hugging Face Open Models & Datasets',
        url: 'https://huggingface.co',
        folder: 'AI & Tools',
        createdAt: 'Today',
      },
      {
        id: `sample-${Date.now()}-3`,
        title: 'GitHub Trending Repositories',
        url: 'https://github.com/trending',
        folder: 'Development',
        createdAt: 'Today',
      },
      {
        id: `sample-${Date.now()}-4`,
        title: 'Stanford AI Lab Research Blog',
        url: 'https://ai.stanford.edu/blog',
        folder: 'Research',
        createdAt: 'Today',
      },
      {
        id: `sample-${Date.now()}-5`,
        title: 'MDN Web Docs & Specifications',
        url: 'https://developer.mozilla.org',
        folder: 'Development',
        createdAt: 'Today',
      },
    ];
    onImportBookmarks(samplePack);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-2xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Bookmarks Manager</h1>
              <p className="text-xs text-slate-500">
                Organize, open, and categorize your saved reading list, research papers, and web resources
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSamplePack}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Load AI & Research starter pack"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sample Pack</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Import JSON bookmarks file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={handleExportJSON}
              disabled={bookmarks.length === 0}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Export bookmarks as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bookmark</span>
            </button>
          </div>
        </div>

        {/* Search & Folder Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved bookmarks by title, url, or folder..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          {/* Folder Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                selectedFolder === null
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({bookmarks.length})
            </button>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(selectedFolder === f ? null : f)}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFolder === f
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Folder className="w-3 h-3" />
                <span>{f}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBookmarks.map((b) => (
            <div
              key={b.id}
              className="group p-4 rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  onClick={() => onNavigate(b.url)}
                  className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5 cursor-pointer hover:scale-105 transition-transform"
                  title="Open bookmark"
                >
                  <Globe className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    onClick={() => onNavigate(b.url)}
                    className="text-xs font-bold text-slate-900 hover:text-amber-600 truncate transition-colors cursor-pointer"
                  >
                    {b.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{b.url}</div>
                  {b.folder && (
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                      📁 {b.folder}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1">
                  {onOpenInNewTab && (
                    <button
                      onClick={() => onOpenInNewTab(b.url, b.title)}
                      className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>New Tab</span>
                    </button>
                  )}

                  {onOpenInSplit && (
                    <button
                      onClick={() => onOpenInSplit(b.url, b.title)}
                      className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Open in split view"
                    >
                      <Columns className="w-3 h-3" />
                      <span>Split</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(b.id, b.url)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === b.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleStartEdit(b)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                    title="Edit Bookmark"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteBookmark(b.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredBookmarks.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No bookmarks found</p>
              <p>Try clearing your search or add a new bookmark.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                + Add Bookmark
              </button>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add New Bookmark</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Aksh AI Research Papers"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">URL *</label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://arxiv.org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Folder / Category</label>
                  <input
                    type="text"
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                    placeholder="Research, AI & Tools, Dev, Reading List..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
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
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer shadow-xs"
                  >
                    Save Bookmark
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingBookmark && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Edit Bookmark</h3>
                <button
                  onClick={() => setEditingBookmark(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">URL</label>
                  <input
                    type="url"
                    required
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Folder / Category</label>
                  <input
                    type="text"
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingBookmark(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer shadow-xs"
                  >
                    Update Bookmark
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
