import React from 'react';
import {
  X,
  Plus,
  Globe,
  FileText,
  Sparkles,
  Layers,
  Check,
  Search,
  ExternalLink,
  Bot
} from 'lucide-react';
import { Tab } from '../../types';

interface MobileTabsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: (url?: string) => void;
  onAutoClusterTabs?: () => void;
  isClustering?: boolean;
}

export const MobileTabsSheet: React.FC<MobileTabsSheetProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onAutoClusterTabs,
  isClustering,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-100 rounded-t-3xl border-t border-slate-200 shadow-2xl flex flex-col h-[85vh] max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Sheet Top Bar */}
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">
              Open Tabs ({tabs.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onAutoClusterTabs && (
              <button
                onClick={onAutoClusterTabs}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 cursor-pointer transition-colors"
                title="Auto group tabs by topic"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Group</span>
              </button>
            )}

            <button
              onClick={() => {
                onNewTab();
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors min-h-[36px]"
              title="Open New Tab"
            >
              <Plus className="w-4 h-4" />
              <span>New Tab</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
            >
              Done
            </button>
          </div>
        </div>

        {/* Tab Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-12">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  onClose();
                }}
                className={`relative rounded-2xl bg-white border p-3.5 flex flex-col justify-between transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Card Top: Favicon, Title, Close Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <span className="text-base shrink-0">{tab.favicon || '🌐'}</span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {tab.title || 'Untitled Tab'}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {tab.url}
                      </p>
                    </div>
                  </div>

                  {/* Close Tab Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    title="Close tab"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Bottom: Badges */}
                <div className="mt-4 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tab.groupName && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        {tab.groupName}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {tab.contentType.toUpperCase()}
                    </span>
                    {tab.isReaderMode && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Reader
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <span className="flex items-center gap-1 text-blue-600 font-bold">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
