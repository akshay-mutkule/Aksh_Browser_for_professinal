import React, { useState } from 'react';
import {
  X,
  Activity,
  Cpu,
  Shield,
  Zap,
  Lock,
  Globe,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Tab } from '../../types';

interface SitePerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab | null;
  onOpenDevTools?: () => void;
}

export const SitePerformanceModal: React.FC<SitePerformanceModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onOpenDevTools = () => {},
}) => {
  const [ramFreed, setRamFreed] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [activeMemory, setActiveMemory] = useState('28.4 MB');

  if (!isOpen || !activeTab) return null;

  const handleFreeRam = () => {
    setActiveMemory('14.2 MB');
    setRamFreed(true);
    setTimeout(() => setRamFreed(false), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Site Telemetry & Performance Inspector
              </h2>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                Real-time hardware metrics and network performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target URL Info */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">{activeTab.title}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{activeTab.url}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
              HTTP/3 • TLS 1.3
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Tab Memory</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{activeMemory}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Heap within limits</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Page Latency</span>
              </div>
              <div className="text-lg font-bold text-slate-900">18 ms</div>
              <div className="text-[10px] text-slate-500">TTFB: 4.2 ms</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Trackers Blocked</span>
              </div>
              <div className="text-lg font-bold text-slate-900">14 Intercepted</div>
              <div className="text-[10px] text-emerald-600 font-semibold">100% telemetry safe</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>DOM Elements</span>
              </div>
              <div className="text-lg font-bold text-slate-900">428 Nodes</div>
              <div className="text-[10px] text-slate-500">0 Layout Shifts</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Cipher Suite</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1 font-mono truncate">AES-256-GCM</div>
              <div className="text-[10px] text-slate-500">ECDSA P-256</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Frame Rate</span>
              </div>
              <div className="text-lg font-bold text-slate-900">60 FPS</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Hardware VSync</div>
            </div>
          </div>

          {/* Quick Optimization Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              One-Click Performance Boosters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleFreeRam}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Hibernate Background Tabs</span>
                </div>
                {ramFreed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={handleClearCache}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Purge Site Cache & Temp Data</span>
                </div>
                {cacheCleared && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onOpenDevTools();
              onClose();
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open AI DOM Inspector & DevTools</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
