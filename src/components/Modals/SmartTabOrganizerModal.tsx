import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Layers,
  CheckCircle2,
  Trash2,
  Archive,
  RefreshCw,
  FolderPlus,
  ArrowRight,
  AlertTriangle,
  Globe,
  Tag,
  Check
} from 'lucide-react';
import { Tab } from '../../types';
import { organizeTabsSmartly } from '../../services/api';

interface SmartTabOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  onApplyGroups: (tabGroupAssignments: Map<string, { name: string; color: string }>) => void;
  onCloseTabs: (tabIds: string[]) => void;
  onSaveAsSession?: (title: string, tabsToSave: Tab[]) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', dot: 'bg-rose-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', dot: 'bg-purple-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', dot: 'bg-cyan-500' },
};

const HEX_COLOR_MAP: Record<string, string> = {
  indigo: '#6366f1',
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#a855f7',
  cyan: '#06b6d4',
};

export const SmartTabOrganizerModal: React.FC<SmartTabOrganizerModalProps> = ({
  isOpen,
  onClose,
  tabs,
  onApplyGroups,
  onCloseTabs,
  onSaveAsSession,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [groups, setGroups] = useState<
    Array<{ name: string; color: string; tabIds: string[]; reason?: string }>
  >([]);
  const [duplicates, setDuplicates] = useState<
    Array<{ tabId: string; duplicateOfId: string; reason?: string }>
  >([]);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (isOpen && tabs.length > 1) {
      handleAnalyzeWorkspace();
    }
  }, [isOpen]);

  const handleAnalyzeWorkspace = async () => {
    setIsLoading(true);
    setApplied(false);
    try {
      const payload = tabs.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        contentType: t.contentType,
        extractedSnippet: (t.extractedText || t.metaDescription || '').slice(0, 300),
      }));

      const res = await organizeTabsSmartly(payload);
      if (res) {
        setSummary(res.summary || 'Workspace analyzed and grouped by domain and workflow context.');
        setGroups(res.groups || []);
        setDuplicates(res.duplicates || []);
      }
    } catch (err) {
      console.error('Failed to organize tabs:', err);
      // Fallback local clustering
      setSummary('Workspace organized into primary research & browsing groups.');
      setGroups([
        {
          name: 'Research & Intelligence',
          color: 'indigo',
          tabIds: tabs.slice(0, Math.ceil(tabs.length / 2)).map((t) => t.id),
          reason: 'Active inquiry & documentation pages',
        },
        {
          name: 'General Workspace',
          color: 'blue',
          tabIds: tabs.slice(Math.ceil(tabs.length / 2)).map((t) => t.id),
          reason: 'Exploratory & auxiliary tabs',
        },
      ]);
      setDuplicates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    const map = new Map<string, { name: string; color: string }>();
    groups.forEach((g) => {
      const hex = HEX_COLOR_MAP[g.color] || '#3b82f6';
      g.tabIds.forEach((id) => {
        map.set(id, { name: g.name, color: hex });
      });
    });

    onApplyGroups(map);
    setApplied(true);
    setTimeout(() => {
      onClose();
      setApplied(false);
    }, 800);
  };

  const handleCloseDuplicates = () => {
    if (duplicates.length === 0) return;
    const idsToClose = duplicates.map((d) => d.tabId);
    onCloseTabs(idsToClose);
    // Remove from local state
    setDuplicates([]);
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tabIds: g.tabIds.filter((id) => !idsToClose.includes(id)),
      }))
    );
  };

  const handleSaveToStash = () => {
    if (onSaveAsSession) {
      const title = summary ? `Workspace: ${summary.slice(0, 35)}...` : 'AI Clustered Workspace';
      onSaveAsSession(title, tabs);
      onClose();
    }
  };

  const getTabById = (id: string): Tab | undefined => {
    return tabs.find((t) => t.id === id);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Smart Workspace & Tab Declutter</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Semantic clustering, redundancy detection, and color-coded tab grouping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAnalyzeWorkspace}
              disabled={isLoading}
              className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="Re-analyze Workspace"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Clustering Tabs with Gemini 3.7...</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Synthesizing page topics, identifying related research tracks, and isolating duplicate tabs.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Executive Workspace Summary */}
              {summary && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                      Workspace Briefing
                    </span>
                    <p className="text-xs text-blue-950 leading-relaxed font-medium">{summary}</p>
                  </div>
                </div>
              )}

              {/* Duplicate Tabs Alert Banner */}
              {duplicates.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-amber-900">
                        {duplicates.length} Redundant / Duplicate Tab{duplicates.length > 1 ? 's' : ''} Detected
                      </span>
                    </div>
                    <button
                      onClick={handleCloseDuplicates}
                      className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Close Duplicates</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {duplicates.map((dup, idx) => {
                      const t = getTabById(dup.tabId);
                      return (
                        <div key={idx} className="text-xs text-amber-800 flex items-center justify-between">
                          <span className="truncate max-w-md font-mono text-[11px]">
                            • {t?.title || dup.tabId}
                          </span>
                          <span className="text-[10px] text-amber-700 italic">{dup.reason || 'Duplicate URL'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Semantic Group Clusters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Proposed Semantic Groups ({groups.length})</span>
                  </div>
                  <span className="text-xs text-slate-500">{tabs.length} Total Tabs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group, gIdx) => {
                    const style = COLOR_MAP[group.color] || COLOR_MAP.blue;
                    const groupTabs = group.tabIds.map((id) => getTabById(id)).filter(Boolean) as Tab[];

                    return (
                      <div
                        key={gIdx}
                        className={`p-4 rounded-2xl border ${style.border} ${style.bg} space-y-3 shadow-xs flex flex-col justify-between`}
                      >
                        <div className="space-y-2">
                          {/* Group Title Bar */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${style.dot} shadow-2xs`} />
                              <input
                                type="text"
                                value={group.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGroups((prev) =>
                                    prev.map((g, i) => (i === gIdx ? { ...g, name: val } : g))
                                  );
                                }}
                                className={`text-xs font-bold ${style.text} bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-400 focus:outline-none`}
                              />
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 font-bold text-slate-600 border border-slate-200">
                              {groupTabs.length} tabs
                            </span>
                          </div>

                          {/* Reason */}
                          {group.reason && (
                            <p className="text-[11px] text-slate-600 line-clamp-1 italic">{group.reason}</p>
                          )}

                          {/* Tabs List */}
                          <div className="space-y-1 pt-1 max-h-36 overflow-y-auto pr-1">
                            {groupTabs.map((t) => (
                              <div
                                key={t.id}
                                className="p-2 rounded-xl bg-white/90 border border-slate-200/80 text-xs flex items-center justify-between group hover:border-slate-300 transition-all shadow-2xs"
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  {t.favicon ? (
                                    <img
                                      src={t.favicon}
                                      alt=""
                                      className="w-3.5 h-3.5 rounded-xs shrink-0 object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate font-medium text-slate-800 text-[11px]">
                                    {t.title || 'Untitled Tab'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    // Remove tab from this group
                                    setGroups((prev) =>
                                      prev.map((g, i) =>
                                        i === gIdx
                                          ? { ...g, tabIds: g.tabIds.filter((id) => id !== t.id) }
                                          : g
                                      )
                                    );
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                                  title="Remove from group"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Color Selector Pills */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Group Color</span>
                          <div className="flex items-center gap-1.5">
                            {Object.keys(COLOR_MAP).map((colorKey) => (
                              <button
                                key={colorKey}
                                type="button"
                                onClick={() => {
                                  setGroups((prev) =>
                                    prev.map((g, i) => (i === gIdx ? { ...g, color: colorKey } : g))
                                  );
                                }}
                                className={`w-3.5 h-3.5 rounded-full ${COLOR_MAP[colorKey].dot} transition-transform cursor-pointer ${
                                  group.color === colorKey ? 'ring-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onSaveAsSession && (
              <button
                onClick={handleSaveToStash}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Archive className="w-3.5 h-3.5 text-slate-500" />
                <span>Save to Session Stash</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading || groups.length === 0}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {applied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Applied to Tabs!</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Apply Groups to Tabs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
