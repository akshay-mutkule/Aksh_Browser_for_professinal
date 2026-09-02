import React, { useState } from 'react';
import {
  Plus,
  X,
  Volume2,
  Pin,
  Globe,
  FileText,
  Sparkles,
  Scale,
  History,
  Bookmark as BookmarkIcon,
  Download,
  Settings,
  StickyNote,
  Layers,
  Bot,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  FolderOpen
} from 'lucide-react';
import { Tab } from '../../types';

interface VerticalTabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onPinTab: (id: string) => void;
  onAutoClusterTabs?: () => void;
  isClustering?: boolean;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}

export const VerticalTabBar: React.FC<VerticalTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onPinTab,
  onAutoClusterTabs,
  isClustering = false,
  onToggleCollapse,
  isCollapsed = false,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState<'all' | 'research' | 'work'>('all');

  const getTabIcon = (tab: Tab) => {
    if (tab.contentType === 'pdf') return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
    if (tab.contentType === 'research') return <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />;
    if (tab.contentType === 'comparison') return <Scale className="w-4 h-4 text-pink-500 shrink-0" />;
    if (tab.contentType === 'history') return <History className="w-4 h-4 text-blue-500 shrink-0" />;
    if (tab.contentType === 'bookmarks') return <BookmarkIcon className="w-4 h-4 text-amber-500 shrink-0" />;
    if (tab.contentType === 'downloads') return <Download className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (tab.contentType === 'settings') return <Settings className="w-4 h-4 text-slate-500 shrink-0" />;
    if (tab.contentType === 'notes') return <StickyNote className="w-4 h-4 text-amber-500 shrink-0" />;
    if (tab.contentType === 'devtools') return <Bot className="w-4 h-4 text-purple-500 shrink-0" />;
    if (tab.contentType === 'readme') return <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />;
    if (tab.favicon) {
      return (
        <img
          src={tab.favicon}
          alt=""
          className="w-4 h-4 rounded-xs shrink-0 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    return <Globe className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const pinnedTabs = tabs.filter((t) => t.pinned);
  const unpinnedTabs = tabs.filter((t) => !t.pinned);

  const filteredTabs = unpinnedTabs.filter((t) => {
    if (searchFilter) {
      return (
        t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.url.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    if (activeWorkspace === 'research') {
      return (
        t.contentType === 'research' ||
        t.contentType === 'pdf' ||
        t.contentType === 'mindmap' ||
        t.contentType === 'notes' ||
        (t.groupName && t.groupName.toLowerCase().includes('research'))
      );
    }
    if (activeWorkspace === 'work') {
      return (
        t.contentType === 'devtools' ||
        t.contentType === 'comparison' ||
        (t.groupName && t.groupName.toLowerCase().includes('work'))
      );
    }
    return true;
  });

  if (isCollapsed) {
    return (
      <aside className="w-14 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-2.5 z-20 shrink-0 select-none">
        {/* Expand button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors cursor-pointer mb-2"
          title="Expand Vertical Tabs Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer mb-3"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-8 h-px bg-slate-200 mb-2" />

        {/* Pinned & Active tab icons */}
        <div className="flex-1 w-full overflow-y-auto scrollbar-none flex flex-col items-center gap-1.5 px-1.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white shadow-xs border border-slate-300 ring-2 ring-blue-500/20'
                    : 'hover:bg-slate-200/70 text-slate-600'
                }`}
                title={tab.title}
              >
                {getTabIcon(tab)}
                {tab.pinned && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-slate-50/95 border-r border-slate-200 flex flex-col z-20 shrink-0 select-none">
      {/* Top Header: Collapse button, Workspace title, and New Tab */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
            A
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">Aksh Vertical Tabs</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onNewTab}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Open New Tab (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Tabs Shelf (if any) */}
      {pinnedTabs.length > 0 && (
        <div className="px-3 pt-2.5 pb-2 border-b border-slate-200/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Pinned Apps
          </div>
          <div className="grid grid-cols-4 gap-1">
            {pinnedTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white border border-slate-300 shadow-2xs ring-1 ring-blue-500/30'
                      : 'hover:bg-slate-200/70 text-slate-600'
                  }`}
                  title={tab.title}
                >
                  {getTabIcon(tab)}
                  <span className="text-[9px] truncate w-full text-center mt-0.5 font-medium">
                    {tab.title.slice(0, 7)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Workspaces & Filter */}
      <div className="px-3 py-2 space-y-2 border-b border-slate-200/80">
        {/* Workspace Pills */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
          <button
            onClick={() => setActiveWorkspace('all')}
            className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
              activeWorkspace === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            All ({tabs.length})
          </button>
          <button
            onClick={() => setActiveWorkspace('research')}
            className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
              activeWorkspace === 'research' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Research
          </button>
          <button
            onClick={() => setActiveWorkspace('work')}
            className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
              activeWorkspace === 'work' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Work
          </button>
        </div>

        {/* Tab Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search open tabs..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tab List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                isActive
                  ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {tab.isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  getTabIcon(tab)
                )}
                <div className="truncate min-w-0">
                  <div className="truncate font-semibold text-slate-800 text-[11px] leading-tight">
                    {tab.title || 'New Tab'}
                  </div>
                  {tab.groupName && (
                    <div className="text-[9px] text-blue-600 font-medium truncate">
                      {tab.groupName}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {tab.muted === false && (
                  <Volume2 className="w-3 h-3 text-slate-500" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinTab(tab.id);
                  }}
                  className="p-0.5 rounded text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Pin Tab"
                >
                  <Pin className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Close tab (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Smart Clustering Action */}
      {onAutoClusterTabs && (
        <div className="p-2.5 border-t border-slate-200 bg-white/70">
          <button
            onClick={onAutoClusterTabs}
            disabled={isClustering}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isClustering
                ? 'bg-blue-100 text-blue-700 animate-pulse'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
            }`}
            title="Cluster tabs automatically with Gemini 3.7"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{isClustering ? 'Clustering Workspaces...' : 'AI Smart Group Tabs'}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
