import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  FileCode,
  Plus,
  Play,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  Terminal,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Zap,
  Globe
} from 'lucide-react';
import { UserScript, Tab } from '../../types';

interface UserScriptsViewProps {
  userScripts: UserScript[];
  onToggleScript: (scriptId: string) => void;
  onUpdateScript: (script: UserScript) => void;
  onCreateScript: (script: Omit<UserScript, 'id'>) => void;
  onDeleteScript: (scriptId: string) => void;
  onResetDefaults: () => void;
  activeTab: Tab | null;
  onExecuteScriptInTab?: (script: UserScript) => void;
}

export const UserScriptsView: React.FC<UserScriptsViewProps> = ({
  userScripts,
  onToggleScript,
  onUpdateScript,
  onCreateScript,
  onDeleteScript,
  onResetDefaults,
  activeTab,
  onExecuteScriptInTab,
}) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>(userScripts[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'styling' | 'privacy' | 'utility' | 'automation'>('all');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [testRunNotice, setTestRunNotice] = useState<string | null>(null);

  // New script form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPattern, setNewPattern] = useState('*://*/*');
  const [newType, setNewType] = useState<'javascript' | 'css'>('javascript');
  const [newCategory, setNewCategory] = useState<'styling' | 'privacy' | 'utility' | 'automation'>('utility');
  const [newCode, setNewCode] = useState('// Enter custom script code\nconsole.log("[Aksh Script] Loaded on", window.location.href);');

  const selectedScript = userScripts.find((s) => s.id === selectedScriptId) || userScripts[0];

  const filteredScripts = userScripts.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.matchPattern.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleStartEdit = () => {
    if (!selectedScript) return;
    setEditedCode(selectedScript.code);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedScript) return;
    onUpdateScript({
      ...selectedScript,
      code: editedCode,
    });
    setIsEditing(false);
  };

  const handleCopyCode = () => {
    if (!selectedScript) return;
    navigator.clipboard.writeText(selectedScript.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestRun = () => {
    if (!selectedScript) return;
    if (onExecuteScriptInTab) {
      onExecuteScriptInTab(selectedScript);
    }
    setTestRunNotice(`Successfully executed "${selectedScript.name}" in [${activeTab?.title || 'Active Tab'}]`);
    setTimeout(() => setTestRunNotice(null), 3500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateScript({
      name: newTitle.trim(),
      description: newDescription.trim() || 'Custom user injected script.',
      matchPattern: newPattern.trim() || '*://*/*',
      scriptType: newType,
      category: newCategory,
      author: 'User Local',
      version: '1.0.0',
      enabled: true,
      runCount: 0,
      code: newCode,
    });

    setIsCreatingNew(false);
    setNewTitle('');
    setNewDescription('');
    setNewCode('// Custom script\n');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(userScripts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-userscripts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Userscript & Style Engine</h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Studio
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inject custom JavaScript and CSS live into any website with granular URL match patterns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Script
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            title="Export all scripts as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            title="Restore default curated scripts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Scripts List */}
        <div className="w-80 md:w-96 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-800/80 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scripts & patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {(['all', 'styling', 'privacy', 'utility', 'automation'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Script Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredScripts.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500">
                <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No scripts match your filter.</p>
              </div>
            ) : (
              filteredScripts.map((script) => {
                const isSelected = script.id === selectedScript?.id;
                return (
                  <div
                    key={script.id}
                    onClick={() => {
                      setSelectedScriptId(script.id);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            script.scriptType === 'javascript'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          }`}
                        >
                          {script.scriptType === 'javascript' ? 'JS' : 'CSS'}
                        </span>
                        <h3 className="text-xs font-semibold text-slate-200 truncate max-w-[170px]">
                          {script.name}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleScript(script.id);
                        }}
                        className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          script.enabled ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                        title={script.enabled ? 'Enabled' : 'Disabled'}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            script.enabled ? 'translate-x-3.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {script.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                      <span className="font-mono text-slate-400 truncate max-w-[140px]">
                        {script.matchPattern}
                      </span>
                      <span>v{script.version}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail & Code Editor Panel */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {selectedScript ? (
            <>
              {/* Script Action Bar */}
              <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">{selectedScript.name}</h2>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                          selectedScript.scriptType === 'javascript'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {selectedScript.scriptType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Pattern: <span className="text-purple-300">{selectedScript.matchPattern}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedScript.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestRun}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                    title={`Execute immediately in [${activeTab?.title || 'Current Tab'}]`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Inject & Run
                  </button>

                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Code
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Edit Code
                    </button>
                  )}

                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onDeleteScript(selectedScript.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                    title="Delete Script"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Test Run Success Banner */}
              <AnimatePresence>
                {testRunNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{testRunNotice}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Code Editor View */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {isEditing ? (
                  <textarea
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full h-full p-6 font-mono text-xs text-purple-200 bg-slate-950 focus:outline-none resize-none leading-relaxed selection:bg-purple-900 selection:text-white"
                    placeholder="Enter script code here..."
                    spellCheck={false}
                  />
                ) : (
                  <div className="w-full h-full p-6 overflow-auto font-mono text-xs text-purple-200 bg-slate-950 leading-relaxed custom-scrollbar selection:bg-purple-900 selection:text-white">
                    <pre className="whitespace-pre-wrap">{selectedScript.code}</pre>
                  </div>
                )}

                {/* Status Bar */}
                <div className="px-6 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <span>
                      Language: <strong className="text-slate-200 uppercase">{selectedScript.scriptType}</strong>
                    </span>
                    <span>
                      Author: <strong className="text-slate-200">{selectedScript.author}</strong>
                    </span>
                    <span>
                      Executions: <strong className="text-slate-200">{selectedScript.runCount || 0}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedScript.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-slate-300 font-medium">{selectedScript.enabled ? 'Active on matched pages' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <p>Select a script to view details or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create New Script Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Create New User Script</h3>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Script Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clean Medium Paywalls or OLED Dark Mod"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Engine Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="javascript">JavaScript (Executable)</option>
                    <option value="css">CSS (Stylesheet Override)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="utility">Utility & Tools</option>
                    <option value="styling">Styling & Theme</option>
                    <option value="privacy">Privacy & Security</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  URL Match Pattern (Regex or Glob)
                </label>
                <input
                  type="text"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder="*://*/* or *://*.github.com/*"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What does this script do?"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Initial Code</label>
                <textarea
                  rows={5}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-purple-200 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg cursor-pointer"
                >
                  Install Script
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
