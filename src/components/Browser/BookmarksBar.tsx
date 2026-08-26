import React from 'react';
import { Bookmark, Folder, ExternalLink, Sparkles, Scale, FileText, Globe } from 'lucide-react';
import { Bookmark as BookmarkType } from '../../types';

interface BookmarksBarProps {
  bookmarks: BookmarkType[];
  onNavigate: (url: string) => void;
  onOpenBookmarksManager: () => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onOpenBookmarksManager,
}) => {
  return (
    <div className="h-7 bg-slate-950/90 border-b border-slate-800/80 px-3 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] select-none text-slate-300">
      {bookmarks.slice(0, 10).map((b) => (
        <button
          key={b.id}
          onClick={() => onNavigate(b.url)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition-colors shrink-0 max-w-[170px]"
          title={b.title + ' (' + b.url + ')'}
        >
          {b.url.startsWith('aksh://research') || b.url.startsWith('nexus://research') ? (
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
          ) : b.url.startsWith('aksh://pdf') || b.url.startsWith('nexus://pdf') ? (
            <FileText className="w-3 h-3 text-rose-400 shrink-0" />
          ) : b.url.startsWith('aksh://comparison') || b.url.startsWith('nexus://comparison') ? (
            <Scale className="w-3 h-3 text-pink-400 shrink-0" />
          ) : b.favicon ? (
            <img
              src={b.favicon}
              alt=""
              className="w-3 h-3 rounded-xs shrink-0 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{b.title}</span>
        </button>
      ))}

      <button
        onClick={onOpenBookmarksManager}
        className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 shrink-0 pl-2"
        title="Manage all bookmarks"
      >
        <Folder className="w-3 h-3" />
        <span>All Bookmarks</span>
      </button>
    </div>
  );
};
