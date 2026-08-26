import React from 'react';
import { Sparkles, Minus, Square, X, PanelRight, ShieldCheck, Zap } from 'lucide-react';
import { Tab } from '../../types';
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
}) => {
  return (
    <div className="h-10 bg-slate-950 flex items-center justify-between select-none border-b border-slate-800/80 relative z-20">
      {/* Window Controls (macOS style dots) */}
      <div className="flex items-center gap-2 px-3.5 shrink-0">
        <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer shadow-xs" title="Close Window" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer shadow-xs" title="Minimize Window" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer shadow-xs" title="Maximize Window" />
        <div className="h-3.5 w-px bg-slate-800 ml-1.5" />
        <div className="flex items-center gap-1.5 pl-1">
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">
            N
          </div>
          <span className="text-xs font-semibold text-slate-300 tracking-tight hidden sm:inline">
            Nexus
          </span>
        </div>
      </div>

      {/* Tab Strip */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onNewTab={onNewTab}
        onPinTab={onPinTab}
      />

      {/* Right Controls & AI Side Panel Toggle */}
      <div className="flex items-center gap-1.5 px-3 shrink-0">
        <button
          onClick={onToggleAiSidebar}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
            isAiSidebarOpen
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-500/25 ring-1 ring-indigo-400/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
          }`}
          title="Toggle Nexus AI Assistant (Ctrl+K)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiSidebarOpen ? 'animate-pulse text-amber-300' : 'text-blue-400'}`} />
          <span className="hidden md:inline">Nexus AI</span>
        </button>

        <div className="flex items-center text-slate-500 ml-1">
          <button className="p-1.5 hover:bg-slate-800 hover:text-slate-300 rounded transition-colors" title="Minimize">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-slate-800 hover:text-slate-300 rounded transition-colors" title="Restore">
            <Square className="w-3 h-3" />
          </button>
          <button className="p-1.5 hover:bg-rose-900/40 hover:text-rose-400 rounded transition-colors" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
