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
  BookOpen
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';
import { TabContextMenu } from './TabContextMenu';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onPinTab: (id: string) => void;
  onAutoClusterTabs?: () => void;
  isClustering?: boolean;
  onDuplicateTab?: (id: string) => void;
  onReloadTab?: (id: string) => void;
  onMuteTab?: (id: string) => void;
  onSplitTab?: (id: string, position: 'left' | 'right') => void;
  onAssignTabGroup?: (id: string, groupName: string, groupColor: string) => void;
  onRemoveTabGroup?: (id: string) => void;
  onBookmarkTab?: (id: string) => void;
  onCloseOtherTabs?: (id: string) => void;
  onCloseTabsToRight?: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onPinTab,
  onAutoClusterTabs,
  isClustering = false,
  onDuplicateTab,
  onReloadTab,
  onMuteTab,
  onSplitTab,
  onAssignTabGroup,
  onRemoveTabGroup,
  onBookmarkTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tab: Tab;
  } | null>(null);
  const getTabIcon = (tab: Tab) => {
    if (tab.contentType === 'pdf') return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    if (tab.contentType === 'research') return <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
    if (tab.contentType === 'comparison') return <Scale className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
    if (tab.contentType === 'history') return <History className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (tab.contentType === 'bookmarks') return <BookmarkIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (tab.contentType === 'downloads') return <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (tab.contentType === 'settings') return <Settings className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    if (tab.contentType === 'notes') return <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (tab.contentType === 'devtools') return <Bot className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
    if (tab.contentType === 'readme') return <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
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
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTabId;
        const prevTab = tabs[idx - 1];
        const isNewGroup = tab.groupName && (!prevTab || prevTab.groupName !== tab.groupName);

        return (
          <React.Fragment key={tab.id}>
            {/* Tab Group Chip */}
            {isNewGroup && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 bg-slate-200/90 border border-slate-300 shadow-2xs shrink-0 select-none mr-0.5"
                style={{ borderLeftColor: tab.groupColor || '#3b82f6', borderLeftWidth: 3 }}
              >
                <span>{tab.groupName}</span>
              </div>
            )}

            <div
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY, tab });
              }}
              className={`group relative flex items-center gap-2 h-9 px-3 min-w-[120px] max-w-[220px] rounded-t-xl text-xs font-medium cursor-pointer transition-all border-t border-x ${
                isActive
                  ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border-transparent'
              } ${tab.pinned ? 'min-w-[44px] max-w-[44px] justify-center px-2' : ''}`}
            >
              {/* Loading Spinner or Favicon */}
              {tab.isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                getTabIcon(tab)
              )}

              {/* Tab Title (hidden if pinned) */}
              {!tab.pinned && (
                <span className="truncate flex-1 text-left select-none font-semibold">
                  {tab.title || 'New Tab'}
                </span>
              )}

              {/* Pinned Indicator or Audio or Close Button */}
              <div className="flex items-center gap-0.5 shrink-0">
                {tab.pinned && (
                  <Pin className="w-2.5 h-2.5 text-blue-600" />
                )}
                {tab.muted === false && (
                  <Volume2 className="w-3 h-3 text-slate-500" />
                )}
                {!tab.pinned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className={`p-0.5 rounded-full hover:bg-slate-300 text-slate-500 hover:text-slate-800 transition-colors ${
                      isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title="Close tab (Ctrl+W)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
        title="Open new tab (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* AI Smart Tab Cluster Button */}
      {onAutoClusterTabs && tabs.length > 1 && (
        <button
          onClick={onAutoClusterTabs}
          disabled={isClustering}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
            isClustering
              ? 'bg-blue-100 text-blue-700 animate-pulse'
              : 'hover:bg-blue-50 text-blue-600 hover:text-blue-800 border border-transparent hover:border-blue-200'
          }`}
          title="Cluster tabs into semantic workspaces with Gemini"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden xl:inline">{isClustering ? 'Organizing...' : 'Smart Group'}</span>
        </button>
      )}
      {/* Tab Context Menu */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tab={contextMenu.tab}
          onClose={() => setContextMenu(null)}
          onReload={() => onReloadTab?.(contextMenu.tab.id)}
          onDuplicate={() => onDuplicateTab?.(contextMenu.tab.id)}
          onTogglePin={() => onPinTab(contextMenu.tab.id)}
          onToggleMute={() => onMuteTab?.(contextMenu.tab.id)}
          onSplit={(pos) => onSplitTab?.(contextMenu.tab.id, pos)}
          onAssignGroup={(name, color) => onAssignTabGroup?.(contextMenu.tab.id, name, color)}
          onRemoveFromGroup={() => onRemoveTabGroup?.(contextMenu.tab.id)}
          onBookmark={() => onBookmarkTab?.(contextMenu.tab.id)}
          onCloseTab={() => onCloseTab(contextMenu.tab.id)}
          onCloseOtherTabs={() => onCloseOtherTabs?.(contextMenu.tab.id)}
          onCloseTabsToRight={() => onCloseTabsToRight?.(contextMenu.tab.id)}
        />
      )}
    </div>
  );
};

