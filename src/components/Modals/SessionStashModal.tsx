import React, { useState, useEffect } from 'react';
import {
  X,
  Archive,
  RotateCcw,
  Trash2,
  Download,
  Plus,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  FolderDown,
  Cpu,
  Bookmark,
  ExternalLink,
  Globe
} from 'lucide-react';
import { Tab } from '../../types';

export interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  workspaceName?: string;
  tabs: Array<{
    title: string;
    url: string;
    contentType: string;
    favicon?: string;
  }>;
}

const DEFAULT_PRESET_SESSIONS: SavedSession[] = [
  {
    id: 'preset-ai-research',
    name: '🧠 Deep Learning & Transformer Architecture',
    createdAt: '2026-09-08 14:30',
    workspaceName: 'Research & AI',
    tabs: [
      { title: 'Attention Is All You Need — Vaswani et al.', url: 'https://arxiv.org/abs/1706.03762', contentType: 'pdf' },
      { title: 'LLM Reasoning & Chain-of-Thought Guide', url: 'https://learn.deeplearning.ai/courses/llm-reasoning', contentType: 'web' },
      { title: 'Aksh AI Deep Research: Quantum Machine Learning', url: 'aksh://research?q=Quantum+Machine+Learning', contentType: 'research' }
    ],
  },
  {
    id: 'preset-flagship-comparison',
    name: '💻 Hardware Comparison & Tech Specs',
    createdAt: '2026-09-09 11:15',
    workspaceName: 'Engineering',
    tabs: [
      { title: 'MacBook Pro M4 Max vs Dell XPS 16 vs ThinkPad P1', url: 'https://tech-radar.io/laptops/flagship-comparison-2026', contentType: 'web' },
      { title: 'Aksh Side-by-Side Product Comparison', url: 'aksh://comparison', contentType: 'comparison' }
    ],
  },
];

interface SessionStashModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTabs: Tab[];
  activeWorkspaceName?: string;
  onRestoreSession: (tabs: SavedSession['tabs'], mode: 'replace' | 'append') => void;
}

export const SessionStashModal: React.FC<SessionStashModalProps> = ({
  isOpen,
  onClose,
  currentTabs,
  activeWorkspaceName = 'General',
  onRestoreSession,
}) => {
  const [sessions, setSessions] = useState<SavedSession[]>(() => {
    try {
      const saved = localStorage.getItem('aksh_browser_sessions');
      return saved ? JSON.parse(saved) : DEFAULT_PRESET_SESSIONS;
    } catch {
      return DEFAULT_PRESET_SESSIONS;
    }
  });

  const [sessionName, setSessionName] = useState('');
  const [restoredId, setRestoredId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('aksh_browser_sessions', JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  const handleSaveCurrentSession = (e: React.FormEvent) => {
    e.preventDefault();
    const name = sessionName.trim() || `Session (${currentTabs.length} tabs) - ${new Date().toLocaleDateString()}`;
    const newSession: SavedSession = {
      id: `session-${Date.now()}`,
      name,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      workspaceName: activeWorkspaceName,
      tabs: currentTabs.map((t) => ({
        title: t.title,
        url: t.url,
        contentType: t.contentType,
        favicon: t.favicon,
      })),
    };

    setSessions([newSession, ...sessions]);
    setSessionName('');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleRestore = (session: SavedSession, mode: 'replace' | 'append') => {
    onRestoreSession(session.tabs, mode);
    setRestoredId(session.id);
    setTimeout(() => {
      setRestoredId(null);
      onClose();
    }, 600);
  };

  const handleExportJson = (session: SavedSession) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Session Stash & Tab Snapshots</h3>
              <p className="text-xs text-slate-500">
                Save active tabs into memory snapshots and restore complete workspaces with one click
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Session Form */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <form onSubmit={handleSaveCurrentSession} className="flex gap-2.5">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={`Name this snapshot (e.g. "Q3 Project Specs", contains ${currentTabs.length} tabs)...`}
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>Stash Current Tabs ({currentTabs.length})</span>
            </button>
          </form>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const isRestored = restoredId === session.id;

              return (
                <div
                  key={session.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{session.name}</h4>
                        {session.workspaceName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {session.workspaceName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Saved {session.createdAt}</span>
                        <span>•</span>
                        <span>{session.tabs.length} tabs</span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRestore(session, 'replace')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                          isRestored
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title="Replace all current tabs with this session"
                      >
                        {isRestored ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        <span>{isRestored ? 'Restored!' : 'Restore'}</span>
                      </button>
                      <button
                        onClick={() => handleRestore(session, 'append')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Add these tabs to your current window without closing existing tabs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Append</span>
                      </button>
                      <button
                        onClick={() => handleExportJson(session)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Export JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tabs Preview Pill Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {session.tabs.map((tab, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 truncate"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{tab.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
              <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Saved Snapshots Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Save your open workspace tabs using the input above to restore your session at any time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
