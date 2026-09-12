import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Minus, Square, X, PanelRight, ShieldCheck, Zap, Globe, Cpu, HelpCircle, ChevronDown, Layers, Compass, Code, BookOpen } from 'lucide-react';
import { Tab, Workspace } from '../../types';
import { TabBar } from './TabBar';

interface TitleBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onPinTab: (id: string) => void;
  isAiSidebarOpen: boolean;
  onToggleAiSidebar: () => void;
  onAutoClusterTabs?: () => void;
  isClustering?: boolean;
  tabLayout?: 'horizontal' | 'vertical';
  onDuplicateTab?: (id: string) => void;
  onReloadTab?: (id: string) => void;
  onMuteTab?: (id: string) => void;
  onSplitTab?: (id: string, position: 'left' | 'right') => void;
  onAssignTabGroup?: (id: string, groupName: string, groupColor: string) => void;
  onRemoveTabGroup?: (id: string) => void;
  onBookmarkTab?: (id: string) => void;
  onCloseOtherTabs?: (id: string) => void;
  onCloseTabsToRight?: (id: string) => void;
  onOpenTour?: () => void;
  onGoHome?: () => void;
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onPinTab,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onAutoClusterTabs,
  isClustering,
  tabLayout = 'horizontal',
  onDuplicateTab,
  onReloadTab,
  onMuteTab,
  onSplitTab,
  onAssignTabGroup,
  onRemoveTabGroup,
  onBookmarkTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
  onOpenTour,
  onGoHome,
  workspaces = [],
  activeWorkspaceId,
  onSelectWorkspace,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    };
    if (showWorkspaceMenu) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showWorkspaceMenu]);

  return (
    <div className="h-10 bg-slate-100/90 flex items-center justify-between select-none border-b border-slate-200 relative z-20">
      {/* Window Controls (macOS style dots - desktop only) */}
      <div className="hidden sm:flex items-center gap-2 px-3 shrink-0">
        <div className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 cursor-pointer shadow-xs" title="Close Window" />
        <div className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 cursor-pointer shadow-xs" title="Minimize Window" />
        <div className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer shadow-xs" title="Maximize Window" />
        <div className="h-3.5 w-px bg-slate-300 ml-1.5" />
      </div>

      {/* Brand Icon (Always visible - Click to go Home) */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-200/80 transition-colors shrink-0 cursor-pointer group"
        title="Aksh AI Browser - Go to Home Page (New Tab)"
      >
        <div className="w-4 h-4 rounded bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white text-[9px] font-black shadow-xs transition-colors">
          A
        </div>
        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 tracking-tight hidden sm:inline transition-colors">
          Aksh
        </span>
      </button>

      {/* Workspace Switcher Pill */}
      {workspaces.length > 0 && onSelectWorkspace && (
        <div className="relative shrink-0 mx-1" ref={workspaceRef}>
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer"
            title="Switch Workspace Space (Alt+1...4)"
          >
            <span>{activeWorkspace?.badge || '🪐'}</span>
            <span className="hidden md:inline max-w-[100px] truncate">{activeWorkspace?.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Spaces & Workspaces
              </div>
              {workspaces.map((ws, idx) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    ws.id === activeWorkspaceId
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{ws.badge}</span>
                    <span>{ws.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Alt+{idx + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Strip OR Active Tab Header in Vertical Mode */}
      {tabLayout === 'horizontal' ? (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onNewTab={onNewTab}
          onPinTab={onPinTab}
          onAutoClusterTabs={onAutoClusterTabs}
          isClustering={isClustering}
          onDuplicateTab={onDuplicateTab}
          onReloadTab={onReloadTab}
          onMuteTab={onMuteTab}
          onSplitTab={onSplitTab}
          onAssignTabGroup={onAssignTabGroup}
          onRemoveTabGroup={onRemoveTabGroup}
          onBookmarkTab={onBookmarkTab}
          onCloseOtherTabs={onCloseOtherTabs}
          onCloseTabsToRight={onCloseTabsToRight}
        />
      ) : (
        <div className="flex-1 px-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate font-semibold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-sm">{activeTab?.title || 'Aksh Browser'}</span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Active</span>
            </span>
            <span>TLS 1.3 Strict</span>
            <span>Gemini 3.7 Pro</span>
          </div>
        </div>
      )}

      {/* Right Controls & AI Side Panel Toggle */}
      <div className="flex items-center gap-1.5 px-2 sm:px-3 shrink-0">
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            title="Open Interactive Guide & Feature Tour"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Guide</span>
          </button>
        )}

        <button
          onClick={onToggleAiSidebar}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer ${
            isAiSidebarOpen
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
          }`}
          title="Toggle Aksh AI Assistant (Ctrl+K)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiSidebarOpen ? 'animate-pulse text-amber-200' : 'text-blue-600'}`} />
          <span className="hidden md:inline">Aksh AI</span>
        </button>

        <div className="hidden sm:flex items-center text-slate-500 ml-1">
          <button className="p-1.5 hover:bg-slate-200/80 hover:text-slate-700 rounded transition-colors" title="Minimize">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-slate-200/80 hover:text-slate-700 rounded transition-colors" title="Restore">
            <Square className="w-3 h-3" />
          </button>
          <button className="p-1.5 hover:bg-rose-100 hover:text-rose-600 rounded transition-colors" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
