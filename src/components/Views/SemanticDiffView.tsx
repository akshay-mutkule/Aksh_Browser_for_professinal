import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitCompare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Download,
  RotateCw,
  Plus,
  Minus,
  Layers,
  ExternalLink,
  Split,
  Eye
} from 'lucide-react';
import { Tab, SemanticDiffResult } from '../../types';
import { runSemanticDiff } from '../../services/api';

interface SemanticDiffViewProps {
  tabs: Tab[];
  activeTab?: Tab;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl?: (url: string) => void;
}

export const SemanticDiffView: React.FC<SemanticDiffViewProps> = ({
  tabs,
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [leftTabId, setLeftTabId] = useState<string>(tabs[0]?.id || '');
  const [rightTabId, setRightTabId] = useState<string>(
    tabs.length > 1 ? tabs[1]?.id : tabs[0]?.id || ''
  );

  const [leftCustomText, setLeftCustomText] = useState<string>('');
  const [rightCustomText, setRightCustomText] = useState<string>('');
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);

  const [diffMode, setDiffMode] = useState<'ai' | 'visual_split'>('ai');
  const [isRunningDiff, setIsRunningDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<SemanticDiffResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const leftTab = tabs.find((t) => t.id === leftTabId);
  const rightTab = tabs.find((t) => t.id === rightTabId);

  const handleRunDiff = async () => {
    setIsRunningDiff(true);
    setDiffResult(null);

    const leftTitle = useCustomInput
      ? 'Custom Baseline A'
      : leftTab?.title || 'Left Page';
    const leftContent = useCustomInput
      ? leftCustomText
      : leftTab?.extractedText || leftTab?.metaDescription || 'No content provided';

    const rightTitle = useCustomInput
      ? 'Custom Revision B'
      : rightTab?.title || 'Right Page';
    const rightContent = useCustomInput
      ? rightCustomText
      : rightTab?.extractedText || rightTab?.metaDescription || 'No content provided';

    try {
      const res = await runSemanticDiff(
        leftTitle,
        leftContent,
        rightTitle,
        rightContent
      );
      setDiffResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunningDiff(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!diffResult) return;
    const md = `# Semantic Diff Report: ${diffResult.leftTitle} vs ${diffResult.rightTitle}
**Change Magnitude:** ${diffResult.changeLevel}
**Tactical Verdict:** ${diffResult.tacticalVerdict}

## Executive Summary
${diffResult.executiveSummary}

## Key Additions
${diffResult.additions.map((a) => `- [ADDED] ${a}`).join('\n')}

## Key Removals
${diffResult.removals.map((r) => `- [REMOVED] ${r}`).join('\n')}

## Modifications
${diffResult.modifications.map((m) => `- **${m.aspect}**: Before: "${m.before}" ➔ After: "${m.after}"`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!diffResult || !onSaveAsNote) return;
    const content = `### Executive Summary\n${diffResult.executiveSummary}\n\n### Tactical Verdict\n${diffResult.tacticalVerdict}\n\n### Additions\n${diffResult.additions.map((a) => `- ${a}`).join('\n')}\n\n### Modifications\n${diffResult.modifications.map((m) => `- **${m.aspect}**: ${m.before} -> ${m.after}`).join('\n')}`;
    onSaveAsNote(`Diff: ${diffResult.leftTitle} vs ${diffResult.rightTitle}`, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Header */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                Semantic Diff & Page Evolution
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI Delta Inspector
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Analyze semantic drift, specification shifts, pricing revisions, and architecture changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-xs">
            <button
              onClick={() => setDiffMode('ai')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                diffMode === 'ai' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Delta Matrix</span>
            </button>
            <button
              onClick={() => setDiffMode('visual_split')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                diffMode === 'visual_split' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Split Comparison</span>
            </button>
          </div>

          <button
            onClick={() => setUseCustomInput(!useCustomInput)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              useCustomInput
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            {useCustomInput ? 'Using Raw Text' : 'Custom Text Input'}
          </button>
        </div>
      </div>

      {/* 2. Source Selector Toolbar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
        {!useCustomInput ? (
          <div className="flex items-center gap-4 flex-1">
            {/* Version A Dropdown */}
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Baseline (A):
              </span>
              <select
                value={leftTabId}
                onChange={(e) => setLeftTabId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden"
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || t.url}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            {/* Version B Dropdown */}
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Revision (B):
              </span>
              <select
                value={rightTabId}
                onChange={(e) => setRightTabId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden"
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || t.url}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="text-xs text-indigo-300 font-medium">
            Paste or edit raw text in the left and right panels below, then click "Run Semantic Diff".
          </div>
        )}

        <button
          onClick={handleRunDiff}
          disabled={isRunningDiff}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isRunningDiff ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          )}
          <span>{isRunningDiff ? 'Analyzing Diff...' : 'Run Semantic Diff'}</span>
        </button>
      </div>

      {/* 3. Main Diff Display */}
      <div className="flex-1 flex overflow-hidden">
        {diffMode === 'ai' ? (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6 w-full">
            {diffResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Executive Header Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/80 shadow-xl">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        {diffResult.leftTitle} ➔ {diffResult.rightTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          diffResult.changeLevel === 'Major Shift'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : diffResult.changeLevel === 'Moderate Revision'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {diffResult.changeLevel}
                      </span>

                      <button
                        onClick={handleCopyMarkdown}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={handleSaveToNotes}
                        className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        {saved ? <Check className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span>{saved ? 'Saved' : 'Save to Notes'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed mb-3">
                    {diffResult.executiveSummary}
                  </p>

                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">⚖ Tactical Verdict:</span>
                    <span>{diffResult.tacticalVerdict}</span>
                  </div>
                </div>

                {/* Additions & Removals Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Additions */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">
                      <Plus className="w-4 h-4" />
                      <span>Key Additions & Advancements</span>
                    </div>
                    <ul className="space-y-2">
                      {diffResult.additions.map((add, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10">
                          <span className="text-emerald-400 font-bold shrink-0">+</span>
                          <span className="leading-relaxed">{add}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Removals */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/20 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-rose-500/20 pb-2">
                      <Minus className="w-4 h-4" />
                      <span>Omissions & Deprecations</span>
                    </div>
                    <ul className="space-y-2">
                      {diffResult.removals.map((rem, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-rose-950/20 p-2 rounded-lg border border-rose-500/10">
                          <span className="text-rose-400 font-bold shrink-0">-</span>
                          <span className="leading-relaxed">{rem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Modifications Table */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <RotateCw className="w-4 h-4 text-cyan-400" />
                    <span>Specification & Metric Shifts</span>
                  </div>

                  <div className="space-y-2.5">
                    {diffResult.modifications.map((mod, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs"
                      >
                        <div className="font-semibold text-cyan-300">{mod.aspect}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-rose-200">
                            <span className="text-[10px] font-bold text-rose-400 block uppercase">
                              Before (Baseline)
                            </span>
                            {mod.before}
                          </div>
                          <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                              After (Updated)
                            </span>
                            {mod.after}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                <GitCompare className="w-12 h-12 mb-3 text-cyan-400 opacity-40 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-300 mb-1">
                  Ready to compute semantic diff
                </h3>
                <p className="text-xs max-w-sm mb-4">
                  Select two open tabs or enter custom text to analyze changes, feature deltas, and strategic shifts with Gemini.
                </p>
                <button
                  onClick={handleRunDiff}
                  disabled={isRunningDiff}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Start Comparison Now
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Visual Split Screen View */
          <div className="flex-1 flex overflow-hidden divide-x divide-slate-800">
            {/* Left Content Side */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/30">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-rose-300 flex items-center justify-between">
                <span>Baseline A: {leftTab?.title || 'Custom Input'}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {leftTab?.url || 'raw text'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
                {useCustomInput ? (
                  <textarea
                    value={leftCustomText}
                    onChange={(e) => setLeftCustomText(e.target.value)}
                    placeholder="Enter Baseline version text here..."
                    className="w-full h-full bg-transparent border-0 text-slate-200 focus:outline-hidden resize-none font-mono text-xs"
                  />
                ) : (
                  leftTab?.extractedText || leftTab?.metaDescription || 'No content found on tab.'
                )}
              </div>
            </div>

            {/* Right Content Side */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/30">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>Revision B: {rightTab?.title || 'Custom Input'}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {rightTab?.url || 'raw text'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
                {useCustomInput ? (
                  <textarea
                    value={rightCustomText}
                    onChange={(e) => setRightCustomText(e.target.value)}
                    placeholder="Enter Updated version text here..."
                    className="w-full h-full bg-transparent border-0 text-slate-200 focus:outline-hidden resize-none font-mono text-xs"
                  />
                ) : (
                  rightTab?.extractedText || rightTab?.metaDescription || 'No content found on tab.'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
