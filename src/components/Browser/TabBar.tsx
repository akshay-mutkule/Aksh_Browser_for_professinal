import React from 'react';
import { Plus, X, Volume2, Pin, Globe, FileText, Sparkles, Scale, History, Bookmark as BookmarkIcon, Download, Settings, StickyNote } from 'lucide-react';
import { Tab, PageContentType } from '../../types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onPinTab: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onPinTab,
}) => {
  const getTabIcon = (tab: Tab) => {
    if (tab.contentType === 'pdf') return <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    if (tab.contentType === 'research') return <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    if (tab.contentType === 'comparison') return <Scale className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
    if (tab.contentType === 'history') return <History className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    if (tab.contentType === 'bookmarks') return <BookmarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (tab.contentType === 'downloads') return <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (tab.contentType === 'settings') return <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    if (tab.contentType === 'notes') return <StickyNote className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    if (tab.favicon) {
      return (
        <img
          src={tab.favicon}
          alt=""
          className="w-3.5 h-3.5 rounded-xs shrink-0 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    return <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-2 pt-1.5 flex-1 max-w-[calc(100%-140px)]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-2 h-9 px-3 min-w-[120px] max-w-[220px] rounded-t-xl text-xs font-medium cursor-pointer transition-all border-t border-x ${
              isActive
                ? 'bg-slate-900 text-slate-100 border-slate-700/80 shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300 border-transparent'
            } ${tab.pinned ? 'min-w-[44px] max-w-[44px] justify-center px-2' : ''}`}
          >
            {/* Loading Spinner or Favicon */}
            {tab.isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              getTabIcon(tab)
            )}

            {/* Tab Title (hidden if pinned) */}
            {!tab.pinned && (
              <span className="truncate flex-1 text-left select-none">
                {tab.title || 'New Tab'}
              </span>
            )}

            {/* Pinned Indicator or Audio or Close Button */}
            <div className="flex items-center gap-0.5 shrink-0">
              {tab.pinned && (
                <Pin className="w-2.5 h-2.5 text-blue-400" />
              )}
              {tab.muted === false && (
                <Volume2 className="w-3 h-3 text-slate-400" />
              )}
              {!tab.pinned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className={`p-0.5 rounded-full hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors ${
                    isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Close tab (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors shrink-0"
        title="Open new tab (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
