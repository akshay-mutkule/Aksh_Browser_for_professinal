import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Globe,
  Plus,
  Search,
  Trash2,
  Volume2,
  StickyNote,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { ReadingListItem } from '../../types';

interface ReadingListViewProps {
  items: ReadingListItem[];
  onNavigateUrl: (url: string) => void;
  onToggleRead: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (url: string, title: string) => void;
  onTriggerSpeech?: (text: string, title: string) => void;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
}

export const ReadingListView: React.FC<ReadingListViewProps> = ({
  items,
  onNavigateUrl,
  onToggleRead,
  onDeleteItem,
  onAddItem,
  onTriggerSpeech,
  onSaveAsNote,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'unread' ? !item.isRead : item.isRead;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.domain.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    onAddItem(
      newUrl.trim(),
      newTitle.trim() || newUrl.replace(/^https?:\/\//, '').split('/')[0]
    );
    setNewUrl('');
    setNewTitle('');
    setIsAdding(false);
  };

  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Reading List & Read Later</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Save long-form articles, academic papers, and guides to read offline or listen aloud
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Article</span>
          </button>
        </div>

        {/* Add Modal/Form */}
        {isAdding && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-3 animate-in fade-in duration-150"
          >
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add New Web Page to Reading List
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Article Title (Optional)"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-2xs"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved articles..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-medium w-full sm:w-auto justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'read'
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({items.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-150 bg-white hover:border-amber-300 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isRead ? 'opacity-70 bg-slate-50/70 border-slate-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => onToggleRead(item.id)}
                  className="mt-0.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer shrink-0"
                  title={item.isRead ? 'Mark as Unread' : 'Mark as Read'}
                >
                  {item.isRead ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      onClick={() => onNavigateUrl(item.url)}
                      className={`text-sm font-bold truncate cursor-pointer hover:text-amber-600 transition-colors ${
                        item.isRead ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {item.excerpt && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.excerpt}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">{item.domain}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.readingTimeMinutes} min read
                    </span>
                    <span>•</span>
                    <span>Added {item.addedAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {onTriggerSpeech && (
                  <button
                    onClick={() =>
                      onTriggerSpeech(
                        `${item.title}. ${item.excerpt || ''}`,
                        item.title
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}

                {onSaveAsNote && (
                  <button
                    onClick={() =>
                      onSaveAsNote(
                        `Reading Note: ${item.title}`,
                        `# ${item.title}\n\nSource: ${item.url}\n\n${item.excerpt || ''}`,
                        item.url
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Create Study Note"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onNavigateUrl(item.url)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Read</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove from Reading List"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold">No saved articles in this list.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the book icon in the address bar on any page to save it for later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
