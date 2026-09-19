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
  StickyNote,
  Copy,
  Check,
  Scale,
  ArrowRight,
  ArrowLeftRight,
  Compass,
  BrainCircuit,
  Wrench
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';
import { synthesizeCrossTabs } from '../../services/api';

interface SplitScreenContainerProps {
  leftTab: Tab | null;
  rightTab: Tab | null;
  allTabs: Tab[];
  ratio: number; // 50, 70, 30
  onRatioChange: (ratio: number) => void;
  onSelectRightTab: (tabId: string) => void;
  onCloseSplitScreen: () => void;
  renderTabContent: (tab: Tab | null) => React.ReactNode;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
  onSwapPanes?: () => void;
  onOpenCompanion?: (view: string) => void;
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
  onSaveAsNote,
  onSwapPanes,
  onOpenCompanion,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mobileActivePane, setMobileActivePane] = useState<'left' | 'right'>('left');

  const handleCrossTabSynthesis = async () => {
    if (!leftTab || !rightTab) return;
    setIsSynthesizing(true);
    setSynthesisResult(null);

    try {
      const res = await synthesizeCrossTabs([
        {
          id: leftTab.id,
          title: leftTab.title,
          url: leftTab.url,
          extractedText: leftTab.extractedText || leftTab.pdfData?.text || leftTab.metaDescription,
        },
        {
          id: rightTab.id,
          title: rightTab.title,
          url: rightTab.url,
          extractedText: rightTab.extractedText || rightTab.pdfData?.text || rightTab.metaDescription,
        },
      ]);
      setSynthesisResult(res.synthesis);
    } catch (err: any) {
      setSynthesisResult(`### ❌ Synthesis Error\nCould not perform comparative synthesis: ${err.message || 'Server error'}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopy = () => {
    if (!synthesisResult) return;
    navigator.clipboard.writeText(synthesisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 relative">
      {/* Mobile Header Switcher (Visible only on screens < md) */}
      <div className="md:hidden h-10 px-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileActivePane('left')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mobileActivePane === 'left'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pane 1: {leftTab?.title?.slice(0, 10) || 'Left'}
          </button>
          <button
            onClick={() => setMobileActivePane('right')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mobileActivePane === 'right'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pane 2: {rightTab?.title?.slice(0, 10) || 'Right'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCrossTabSynthesis}
            disabled={isSynthesizing || !leftTab || !rightTab}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Compare and synthesize both tabs side-by-side using Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px]">{isSynthesizing ? '...' : 'AI Compare'}</span>
          </button>

          <button
            onClick={onCloseSplitScreen}
            className="p-1 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            title="Exit Split-Screen Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Active Pane Content (< md) */}
      <div className="flex-1 md:hidden flex flex-col overflow-hidden">
        {renderTabContent(mobileActivePane === 'left' ? leftTab : rightTab)}
      </div>

      {/* Desktop Side-by-Side Dual Pane Container (Hidden on < md, flex on md+) */}
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        {/* Left Viewport Pane */}
        <div
          style={{ width: `${ratio}%` }}
          className="h-full border-r border-slate-200 flex flex-col overflow-hidden relative"
        >
          <div className="h-8 px-3.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="font-bold text-slate-900 truncate">{leftTab?.title || 'Primary Pane'}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Left ({ratio}%)</span>
          </div>
          <div className="flex-1 overflow-hidden">{renderTabContent(leftTab)}</div>
        </div>

        {/* Center Resizer & Controls Bar */}
        <div className="w-2 hover:w-2.5 bg-slate-200 hover:bg-blue-600 transition-all flex flex-col items-center justify-center cursor-col-resize z-20 group">
          <div className="w-1 h-8 rounded-full bg-slate-400 group-hover:bg-white" />
        </div>

        {/* Right Viewport Pane */}
        <div
          style={{ width: `${100 - ratio}%` }}
          className="h-full flex flex-col overflow-hidden relative"
        >
          {/* Right Pane Control Header */}
          <div className="h-8 px-3.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <select
                value={rightTab?.id || ''}
                onChange={(e) => onSelectRightTab(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer truncate max-w-[160px] font-medium shadow-2xs"
              >
                {allTabs
                  .filter((t) => t.id !== leftTab?.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.contentType.toUpperCase()})
                    </option>
                  ))}
              </select>

              {/* Quick Companion Shortcuts */}
              {onOpenCompanion && (
                <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-200 text-[11px]">
                  <button
                    onClick={() => onOpenCompanion('notes')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    title="Open AI Notes in this pane"
                  >
                    📝 Notes
                  </button>
                  <button
                    onClick={() => onOpenCompanion('mindmap')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    title="Open Concept Mindmap in this pane"
                  >
                    🧠 Mindmap
                  </button>
                  <button
                    onClick={() => onOpenCompanion('research')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    title="Open Deep Research in this pane"
                  >
                    ⚡ Research
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Swap Panes Button */}
              {onSwapPanes && (
                <button
                  onClick={onSwapPanes}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Swap Left and Right Panes"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* AI Cross-Tab Comparative Synthesis Trigger */}
              <button
                onClick={handleCrossTabSynthesis}
                disabled={isSynthesizing || !leftTab || !rightTab}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Compare and synthesize both tabs side-by-side using Gemini"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isSynthesizing ? 'Synthesizing...' : 'AI Compare'}</span>
              </button>

              {/* Quick Ratio Toggles */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => onRatioChange(30)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${ratio === 30 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                  title="30% Left / 70% Right"
                >
                  30/70
                </button>
                <button
                  onClick={() => onRatioChange(50)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${ratio === 50 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                  title="50% / 50% Even Split"
                >
                  50/50
                </button>
                <button
                  onClick={() => onRatioChange(70)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${ratio === 70 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                  title="70% Left / 30% Right"
                >
                  70/30
                </button>
              </div>

              {/* Close Split Screen */}
              <button
                onClick={onCloseSplitScreen}
                className="p-1 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                title="Exit Split-Screen Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Pane Viewport */}
          <div className="flex-1 overflow-hidden">{renderTabContent(rightTab)}</div>
        </div>
      </div>

      {/* Floating AI Cross-Tab Comparative Synthesis Modal Overlay */}
      {synthesisResult && (
        <div className="absolute inset-x-8 bottom-6 top-16 bg-white/98 border border-slate-300 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Cross-Tab Comparative Synthesis</h3>
                <p className="text-xs text-slate-500">Gemini 3.7 Flash dual-source intelligence analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onSaveAsNote && (
                <button
                  onClick={() => {
                    onSaveAsNote(
                      `Dual Synthesis: ${leftTab?.title} vs ${rightTab?.title}`,
                      synthesisResult,
                      leftTab?.url
                    );
                    setSynthesisResult(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>Save to Notes</span>
                </button>
              )}

              <button
                onClick={() => setSynthesisResult(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-800 space-y-4 select-text leading-relaxed whitespace-pre-wrap">
            {synthesisResult}
          </div>
        </div>
      )}
    </div>
  );
};

