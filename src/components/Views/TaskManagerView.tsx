import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  Trash2,
  RefreshCw,
  Search,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Download,
  Flame,
  ArrowUpDown,
  X,
  Globe,
  Sliders,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tab, ProcessTask } from '../../types';

interface TaskManagerViewProps {
  tabs: Tab[];
  onCloseTab: (tabId: string) => void;
  onHibernateTab: (tabId: string) => void;
  onWakeTab: (tabId: string) => void;
  onHibernateAllInactive: () => void;
  onNavigateUrl?: (url: string) => void;
}

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  tabs,
  onCloseTab,
  onHibernateTab,
  onWakeTab,
  onHibernateAllInactive,
  onNavigateUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'memory' | 'cpu' | 'name'>('memory');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isCollectingGc, setIsCollectingGc] = useState(false);
  const [gcSuccess, setGcSuccess] = useState<string | null>(null);
  const [simulatedFluctuation, setSimulatedFluctuation] = useState(0);

  // Periodic subtle CPU/Memory live tick for realism
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedFluctuation((prev) => (prev + 1) % 100);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Compute live process list combining system daemons and user tabs
  const processes: ProcessTask[] = [
    {
      pid: 1001,
      name: 'Browser Core Engine (Aksh Chromium-V8)',
      type: 'core',
      cpuPercent: Number((1.2 + (simulatedFluctuation % 3) * 0.1).toFixed(1)),
      memoryMb: 68.4,
      networkKb: 12.4,
      status: 'running',
      uptimeSeconds: 840,
    },
    {
      pid: 1002,
      name: 'Gemini 3.7 Flash AI Copilot & Reasoning Worker',
      type: 'ai',
      cpuPercent: Number((0.6 + (simulatedFluctuation % 5) * 0.2).toFixed(1)),
      memoryMb: 114.2,
      networkKb: 48.0,
      status: 'running',
      uptimeSeconds: 820,
    },
    {
      pid: 1003,
      name: 'DevTools, DOM Security & Network Inspector',
      type: 'devtools',
      cpuPercent: Number((0.3 + (simulatedFluctuation % 2) * 0.1).toFixed(1)),
      memoryMb: 36.8,
      networkKb: 4.1,
      status: 'idle',
      uptimeSeconds: 760,
    },
    {
      pid: 1004,
      name: 'Extension Sandbox & Script Host',
      type: 'extension',
      cpuPercent: 0.1,
      memoryMb: 24.5,
      networkKb: 1.2,
      status: 'idle',
      uptimeSeconds: 800,
    },
    ...tabs.map((tab, idx) => {
      const isSleeping = !!tab.isSleeping;
      // Calculate realistic memory footprint based on tab content length
      const contentLength = tab.extractedText?.length || 500;
      const baseMemory = Math.min(180, Math.max(28, Math.round(contentLength / 180) + 32));
      const memoryMb = isSleeping ? Math.round(baseMemory * 0.25) : baseMemory;
      const cpu = isSleeping ? 0.0 : Number((0.2 + ((idx + simulatedFluctuation) % 4) * 0.2).toFixed(1));

      return {
        pid: 2000 + idx + 1,
        name: `Tab: ${tab.title || tab.url}`,
        type: 'tab' as const,
        tabId: tab.id,
        cpuPercent: cpu,
        memoryMb,
        networkKb: isSleeping ? 0.0 : Number((1.5 + (idx % 3)).toFixed(1)),
        status: isSleeping ? ('sleeping' as const) : ('running' as const),
        uptimeSeconds: Math.max(60, 600 - idx * 45),
      };
    }),
  ];

  // Filter and sort
  const filteredProcesses = processes
    .filter((p) => {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.pid).includes(searchQuery) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      let result = 0;
      if (sortBy === 'memory') result = a.memoryMb - b.memoryMb;
      if (sortBy === 'cpu') result = a.cpuPercent - b.cpuPercent;
      if (sortBy === 'name') result = a.name.localeCompare(b.name);
      return sortOrder === 'desc' ? -result : result;
    });

  const totalMemory = processes.reduce((acc, p) => acc + p.memoryMb, 0);
  const totalCpu = Number(processes.reduce((acc, p) => acc + p.cpuPercent, 0).toFixed(1));
  const sleepingTabsCount = tabs.filter((t) => t.isSleeping).length;

  const handleRunGc = () => {
    setIsCollectingGc(true);
    setTimeout(() => {
      setIsCollectingGc(false);
      const freed = Math.round(totalMemory * 0.28);
      setGcSuccess(`V8 Garbage Collection reclaimed ${freed} MB of heap memory.`);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}
      setTimeout(() => setGcSuccess(null), 4000);
    }, 1200);
  };

  const handleExportProfile = () => {
    const data = {
      app: 'Aksh AI Browser Process Task Manager',
      timestamp: new Date().toISOString(),
      system: {
        totalMemoryMb: totalMemory,
        totalCpuPercent: totalCpu,
        processCount: processes.length,
        sleepingTabsCount,
      },
      processes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-process-profile-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-6 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Process & Memory Task Manager
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Live
                  </span>
                  <span className="text-xs text-slate-400 font-mono">aksh://tasks</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitor live browser memory footprint, manage active process threads, and hibernate background tabs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRunGc}
                disabled={isCollectingGc}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCollectingGc ? 'animate-spin' : ''}`} />
                {isCollectingGc ? 'Collecting Garbage...' : 'Run V8 Garbage Collection'}
              </button>
              <button
                onClick={onHibernateAllInactive}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Hibernate Inactive Tabs
              </button>
              <button
                onClick={handleExportProfile}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Profile
              </button>
              {onNavigateUrl && (
                <button
                  onClick={() => onNavigateUrl('aksh://flags')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-500" /> Flags Studio
                </button>
              )}
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total RAM Heap</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {Math.round(totalMemory)}
                </span>
                <span className="text-xs text-slate-500">MB</span>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Browser CPU Load</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {totalCpu}%
                </span>
                <span className="text-xs text-slate-500">Active</span>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Active Processes</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {processes.length}
                </span>
                <span className="text-xs text-slate-500">Threads</span>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Sleeping Tabs</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {sleepingTabsCount}
                </span>
                <span className="text-xs text-slate-500">of {tabs.length} tabs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GC Notification */}
      <AnimatePresence>
        {gcSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-600 text-white px-6 py-2.5 shadow-xs"
          >
            <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{gcSuccess}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Table Toolbar */}
      <div className="max-w-6xl mx-auto w-full px-6 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter processes by name, PID, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          <span>Sort by:</span>
          <button
            onClick={() => {
              if (sortBy === 'memory') setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
              else {
                setSortBy('memory');
                setSortOrder('desc');
              }
            }}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              sortBy === 'memory'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            RAM (MB) <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (sortBy === 'cpu') setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
              else {
                setSortBy('cpu');
                setSortOrder('desc');
              }
            }}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              sortBy === 'cpu'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            CPU % <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (sortBy === 'name') setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
              else {
                setSortBy('name');
                setSortOrder('asc');
              }
            }}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              sortBy === 'name'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Name <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Process Table */}
      <div className="max-w-6xl mx-auto w-full px-6 pb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task / Process Name</th>
                  <th className="py-3 px-3">PID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">CPU</th>
                  <th className="py-3 px-3 text-right">Memory Footprint</th>
                  <th className="py-3 px-3 text-right">Net I/O</th>
                  <th className="py-3 px-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProcesses.map((proc) => {
                  const isTab = proc.type === 'tab' && proc.tabId;
                  const isSleeping = proc.status === 'sleeping';

                  return (
                    <tr
                      key={proc.pid}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-sm sm:max-w-md truncate">
                          {proc.type === 'core' && <Cpu className="w-4 h-4 text-indigo-500 shrink-0" />}
                          {proc.type === 'ai' && <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />}
                          {proc.type === 'devtools' && <Activity className="w-4 h-4 text-amber-500 shrink-0" />}
                          {proc.type === 'extension' && <Layers className="w-4 h-4 text-blue-500 shrink-0" />}
                          {proc.type === 'tab' && <Globe className="w-4 h-4 text-slate-400 shrink-0" />}
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {proc.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500">{proc.pid}</td>

                      <td className="py-3 px-3">
                        <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {proc.type}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {isSleeping ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                            <Moon className="w-3 h-3" /> Sleeping (RAM Saved)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Running
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        {proc.cpuPercent}%
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-mono font-semibold ${
                            proc.memoryMb > 100
                              ? 'text-rose-600 dark:text-rose-400'
                              : proc.memoryMb > 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {proc.memoryMb} MB
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {proc.networkKb} KB/s
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isTab && proc.tabId && (
                            <>
                              {isSleeping ? (
                                <button
                                  onClick={() => onWakeTab(proc.tabId!)}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                  title="Wake up tab"
                                >
                                  <Sun className="w-3 h-3" /> Wake
                                </button>
                              ) : (
                                <button
                                  onClick={() => onHibernateTab(proc.tabId!)}
                                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium transition-colors flex items-center gap-1"
                                  title="Put tab to sleep to free RAM"
                                >
                                  <Moon className="w-3 h-3" /> Sleep
                                </button>
                              )}
                              <button
                                onClick={() => onCloseTab(proc.tabId!)}
                                className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                                title="End tab process"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {!isTab && (
                            <span className="text-[11px] text-slate-400 italic">Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic note */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>Shortcuts: Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Shift + Esc</kbd> anytime to toggle Task Manager.</span>
          <span>Process scheduling: Preemptive round-robin</span>
        </div>
      </div>
    </div>
  );
};
