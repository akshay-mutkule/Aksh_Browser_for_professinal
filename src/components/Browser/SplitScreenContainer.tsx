import React, { useState } from 'react';
import {
  Columns,
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  FileText,
  StickyNote
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';

interface SplitScreenContainerProps {
  leftTab: Tab | null;
  rightTab: Tab | null;
  allTabs: Tab[];
  ratio: number; // 50, 70, 30
  onRatioChange: (ratio: number) => void;
  onSelectRightTab: (tabId: string) => void;
  onCloseSplitScreen: () => void;
  renderTabContent: (tab: Tab | null) => React.ReactNode;
}

export const SplitScreenContainer: React.FC<SplitScreenContainerProps> = ({
  leftTab,
  rightTab,
  allTabs,
  ratio,
  onRatioChange,
  onSelectRightTab,
  onCloseSplitScreen,
  renderTabContent,
}) => {
  const [isSelectingTab, setIsSelectingTab] = useState(false);

  return (
    <div className="h-full flex overflow-hidden bg-slate-950">
      {/* Left Viewport Pane */}
      <div
        style={{ width: `${ratio}%` }}
        className="h-full border-r border-slate-800 flex flex-col overflow-hidden relative"
      >
        <div className="h-7 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-slate-200 truncate">{leftTab?.title || 'Primary Pane'}</span>
          </div>
          <span className="text-[10px] text-slate-500">Left ({ratio}%)</span>
        </div>
        <div className="flex-1 overflow-hidden">{renderTabContent(leftTab)}</div>
      </div>

      {/* Center Resizer & Controls Bar */}
      <div className="w-1.5 hover:w-2 bg-slate-800 hover:bg-blue-600 transition-all flex flex-col items-center justify-center cursor-col-resize z-20 group">
        <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-white" />
      </div>

      {/* Right Viewport Pane */}
      <div
        style={{ width: `${100 - ratio}%` }}
        className="h-full flex flex-col overflow-hidden relative"
      >
        {/* Right Pane Control Header */}
        <div className="h-7 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <select
              value={rightTab?.id || ''}
              onChange={(e) => onSelectRightTab(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none cursor-pointer truncate max-w-xs font-sans"
            >
              {allTabs
                .filter((t) => t.id !== leftTab?.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.contentType.toUpperCase()})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Ratio Toggles */}
            <button
              onClick={() => onRatioChange(30)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${ratio === 30 ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              title="30% Left / 70% Right"
            >
              30/70
            </button>
            <button
              onClick={() => onRatioChange(50)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${ratio === 50 ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              title="50% / 50% Even Split"
            >
              50/50
            </button>
            <button
              onClick={() => onRatioChange(70)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${ratio === 70 ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              title="70% Left / 30% Right"
            >
              70/30
            </button>

            {/* Close Split Screen */}
            <button
              onClick={onCloseSplitScreen}
              className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-1"
              title="Exit Split-Screen Mode"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Pane Viewport */}
        <div className="flex-1 overflow-hidden">{renderTabContent(rightTab)}</div>
      </div>
    </div>
  );
};
