import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitCompare,
  X,
  Sparkles,
  ArrowRight,
  RotateCw,
  Plus,
  Minus,
  Check,
  Copy,
  FileText
} from 'lucide-react';
import { Tab, SemanticDiffResult } from '../../types';
import { runSemanticDiff } from '../../services/api';

interface PageDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
  tabs: Tab[];
  onSaveAsNote?: (title: string, content: string) => void;
}

export const PageDiffModal: React.FC<PageDiffModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  tabs,
  onSaveAsNote,
}) => {
  const otherTabs = tabs.filter((t) => t.id !== activeTab.id);
  const [selectedTargetTabId, setSelectedTargetTabId] = useState<string>(
    otherTabs[0]?.id || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<SemanticDiffResult | null>(null);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const targetTab = tabs.find((t) => t.id === selectedTargetTabId);

  const handleRunDiff = async () => {
    if (!targetTab) return;
    setIsLoading(true);
    setDiffResult(null);

    try {
      const res = await runSemanticDiff(
        activeTab.title || 'Current Tab',
        activeTab.extractedText || activeTab.metaDescription || '',
        targetTab.title || 'Compared Tab',
        targetTab.extractedText || targetTab.metaDescription || ''
      );
      setDiffResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Compare With Another Tab</h3>
              <p className="text-[11px] text-slate-400">
                AI semantic differential analysis between active page and target tab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/50 flex items-center gap-3 shrink-0 text-xs">
          <div className="flex-1 truncate">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">
              Current Active Tab
            </span>
            <span className="font-semibold text-white truncate block">
              {activeTab.title}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
              Compare With Tab
            </span>
            {otherTabs.length > 0 ? (
              <select
                value={selectedTargetTabId}
                onChange={(e) => setSelectedTargetTabId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden"
              >
                {otherTabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || t.url}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400">Open another tab to compare</span>
            )}
          </div>

          <button
            onClick={handleRunDiff}
            disabled={isLoading || !targetTab}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Diffing...' : 'Run Diff'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {diffResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      diffResult.changeLevel === 'Major Shift'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {diffResult.changeLevel}
                  </span>
                  <span className="text-xs text-slate-400 italic">
                    {diffResult.tacticalVerdict}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {diffResult.executiveSummary}
                </p>
              </div>

              {/* Additions & Removals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                  <div className="font-bold text-emerald-400 flex items-center gap-1 mb-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Key Additions</span>
                  </div>
                  <ul className="space-y-1">
                    {diffResult.additions.map((a, i) => (
                      <li key={i} className="text-[11px] text-slate-300">
                        • {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
                  <div className="font-bold text-rose-400 flex items-center gap-1 mb-2">
                    <Minus className="w-3.5 h-3.5" />
                    <span>Key Omissions</span>
                  </div>
                  <ul className="space-y-1">
                    {diffResult.removals.map((r, i) => (
                      <li key={i} className="text-[11px] text-slate-300">
                        • {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modifications */}
              {diffResult.modifications.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-2">
                  <div className="text-xs font-bold text-slate-300">Metric & Spec Differences</div>
                  {diffResult.modifications.map((m, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 font-semibold">{m.aspect}:</span>
                      <span className="line-through text-slate-500">{m.before}</span>
                      <span className="text-emerald-400">➔ {m.after}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              <GitCompare className="w-10 h-10 mb-2 opacity-40 text-cyan-400" />
              <p className="text-xs">Select a tab above and click "Run Diff" to start comparing</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {diffResult && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2 shrink-0">
            {onSaveAsNote && (
              <button
                onClick={() => {
                  onSaveAsNote(
                    `Diff: ${diffResult.leftTitle} vs ${diffResult.rightTitle}`,
                    diffResult.executiveSummary
                  );
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save to Notes'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
