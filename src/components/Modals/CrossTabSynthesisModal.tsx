import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Layers,
  FileText,
  Copy,
  Check,
  Download,
  ArrowRight,
  Columns,
  RefreshCw,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '../../types';
import { synthesizeCrossTabs } from '../../services/api';

interface CrossTabSynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  onSaveAsNote: (title: string, content: string) => void;
}

export const CrossTabSynthesisModal: React.FC<CrossTabSynthesisModalProps> = ({
  isOpen,
  onClose,
  tabs,
  onSaveAsNote,
}) => {
  const [selectedTabIds, setSelectedTabIds] = useState<string[]>([]);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize with the first two web/research tabs
  useEffect(() => {
    if (isOpen && selectedTabIds.length === 0) {
      const candidates = tabs
        .filter((t) => t.contentType !== 'newtab' && t.contentType !== 'settings')
        .slice(0, 3)
        .map((t) => t.id);
      setSelectedTabIds(candidates.length >= 2 ? candidates : tabs.slice(0, 2).map((t) => t.id));
    }
  }, [isOpen, tabs]);

  const handleToggleTab = (id: string) => {
    setSelectedTabIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // keep at least 2
        return prev.filter((tId) => tId !== id);
      } else {
        if (prev.length >= 4) return prev; // max 4
        return [...prev, id];
      }
    });
  };

  const handleRunSynthesis = async () => {
    const targetTabs = tabs.filter((t) => selectedTabIds.includes(t.id));
    if (targetTabs.length < 2) return;

    setIsLoading(true);
    try {
      const payload = targetTabs.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        textContent: t.extractedText || t.pdfData?.text || t.metaDescription || '',
        headings: t.headings || [],
      }));

      const res = await synthesizeCrossTabs(payload);
      setSynthesis(res.synthesis || 'Synthesis complete.');
    } catch (err) {
      console.error('Error in cross-tab synthesis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!synthesis) return;
    navigator.clipboard.writeText(synthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                AI Cross-Tab Comparative Synthesis
              </h2>
              <p className="text-[11px] text-slate-500">
                Synthesize insights, compare arguments, and build a decision matrix across multiple open tabs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
            Select Tabs (2-4):
          </span>
          {tabs
            .filter((t) => t.contentType !== 'newtab')
            .map((tab) => {
              const isSelected = selectedTabIds.includes(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleToggleTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[140px] truncate">{tab.title}</span>
                </button>
              );
            })}

          <button
            onClick={handleRunSynthesis}
            disabled={isLoading || selectedTabIds.length < 2}
            className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isLoading ? 'Synthesizing...' : 'Run Comparative Analysis'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 select-text">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Cross-referencing arguments, data points, and thesis across tabs...</p>
            </div>
          ) : synthesis ? (
            <div className="prose prose-sm max-w-none text-slate-800">
              <ReactMarkdown>{synthesis}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <Columns className="w-10 h-10 text-slate-300" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-700">No synthesis generated yet</p>
                <p className="text-xs text-slate-400 max-w-md">
                  Select 2 or more open tabs above and click &quot;Run Comparative Analysis&quot; to synthesize both documents into an executive briefing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {synthesis && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Generated with Gemini 3.7 Flash Cross-Source Grounding
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Synthesis'}</span>
              </button>

              <button
                onClick={() => {
                  onSaveAsNote('Cross-Tab Comparative Synthesis', synthesis);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to AI Notes</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
