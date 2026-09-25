import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flag,
  Sparkles,
  ShieldCheck,
  Cpu,
  Code2,
  Sliders,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  RefreshCw,
  HardDrive,
  Download,
  Upload,
  Check,
  Flame,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { BrowserFlag } from '../../types';

interface FlagsViewProps {
  flags: BrowserFlag[];
  onToggleFlag: (flagId: string) => void;
  onResetAllFlags: () => void;
  onNavigateUrl?: (url: string) => void;
}

export const FlagsView: React.FC<FlagsViewProps> = ({
  flags,
  onToggleFlag,
  onResetAllFlags,
  onNavigateUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'security' | 'performance' | 'developer' | 'ux'>('all');
  const [needsRestart, setNeedsRestart] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const categories = [
    { id: 'all', label: 'All Experiments', icon: Flag },
    { id: 'ai', label: 'AI & Neural Labs', icon: Sparkles },
    { id: 'security', label: 'Security & Quantum Crypto', icon: ShieldCheck },
    { id: 'performance', label: 'Performance & V8', icon: Cpu },
    { id: 'developer', label: 'Developer & DOM', icon: Code2 },
    { id: 'ux', label: 'UX & Interface', icon: Sliders },
  ];

  const filteredFlags = flags.filter((flag) => {
    const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;
    const matchesSearch =
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (flagId: string) => {
    onToggleFlag(flagId);
    const flag = flags.find((f) => f.id === flagId);
    if (flag?.requiresRestart) {
      setNeedsRestart(true);
    }
  };

  const handleRestart = () => {
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
      setNeedsRestart(false);
    }, 1200);
  };

  const handleExportFlags = () => {
    const data = {
      app: 'Aksh AI Browser Flags',
      timestamp: new Date().toISOString(),
      flags: flags.reduce((acc, f) => ({ ...acc, [f.id]: f.enabled }), {}),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-flags-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-6 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Experiments & Frontier Flags
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Labs
                  </span>
                  <span className="text-xs text-slate-400 font-mono">aksh://flags</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Enable high-performance experimental browser capabilities, neural pre-fetching, and quantum cryptography.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset all to default
              </button>
              <button
                onClick={handleExportFlags}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Flags
              </button>
              {onNavigateUrl && (
                <button
                  onClick={() => onNavigateUrl('aksh://tasks')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" /> Open Task Manager
                </button>
              )}
            </div>
          </div>

          {/* Search & Categories Bar */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search experimental flags by name, keyword, or impact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Relaunch Notification Banner */}
      <AnimatePresence>
        {needsRestart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500 text-white px-6 py-3 sticky top-[152px] z-20 shadow-md"
          >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Your changes will take effect after you relaunch the browser engine.</span>
              </div>
              <button
                onClick={handleRestart}
                disabled={isRestarting}
                className="px-4 py-1.5 rounded-lg bg-white text-amber-700 hover:bg-amber-50 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin' : ''}`} />
                {isRestarting ? 'Relaunching...' : 'Relaunch Engine Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset All Experiments?</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                This will revert all experimental browser flags, neural pre-fetching settings, and crypto ciphers to their factory defaults.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetAllFlags();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flags List Content */}
      <div className="max-w-5xl mx-auto w-full p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredFlags.length}</strong> of {flags.length} experimental flags
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            V8 JIT & WebAssembly Active
          </span>
        </div>

        {filteredFlags.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Flag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No flags matched your search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try searching for "neural", "bionic", "crypto", or select "All Experiments" above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFlags.map((flag) => {
              const statusColors = {
                frontier: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
                experimental: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
                beta: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
                stable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
              };

              const impactColors = {
                High: 'text-rose-600 dark:text-rose-400',
                Medium: 'text-amber-600 dark:text-amber-400',
                Low: 'text-slate-500 dark:text-slate-400',
              };

              return (
                <div
                  key={flag.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all shadow-xs ${
                    flag.enabled
                      ? 'border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {flag.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            statusColors[flag.status]
                          }`}
                        >
                          {flag.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          #{flag.id}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {flag.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          Category: <strong className="capitalize text-slate-700 dark:text-slate-300">{flag.category}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          Impact: <strong className={impactColors[flag.impact]}>{flag.impact}</strong>
                        </span>
                        {flag.requiresRestart && (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Requires Relaunch
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0 flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(flag.id)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          flag.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        role="switch"
                        aria-checked={flag.enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            flag.enabled ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-semibold min-w-16 ${
                          flag.enabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                        }`}
                      >
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              About Experimental Flags & AI Browser Features
            </p>
            <p>
              Experimental features allow advanced users, developers, and researchers to preview frontier browser innovations ahead of public releases. All active flags persist automatically in your browser profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
