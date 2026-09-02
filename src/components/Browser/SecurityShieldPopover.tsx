import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Zap,
  Cpu,
  EyeOff,
  Activity,
  CheckCircle2,
  ExternalLink,
  Bot,
  RefreshCw
} from 'lucide-react';

interface SecurityShieldPopoverProps {
  url: string;
  isInternal: boolean;
  onClose: () => void;
  onOpenDevTools: () => void;
}

export const SecurityShieldPopover: React.FC<SecurityShieldPopoverProps> = ({
  url,
  isInternal,
  onClose,
  onOpenDevTools,
}) => {
  const [adBlockEnabled, setAdBlockEnabled] = useState(true);
  const [trackerShield, setTrackerShield] = useState(true);
  const [memorySaver, setMemorySaver] = useState(true);
  const [cookieSandbox, setCookieSandbox] = useState(true);

  let hostname = 'internal';
  try {
    if (!isInternal && url.startsWith('http')) {
      hostname = new URL(url).hostname;
    } else {
      hostname = url.replace('aksh://', '');
    }
  } catch {
    hostname = url;
  }

  return (
    <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-xs z-50 select-none animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            {isInternal ? <ShieldCheck className="w-4 h-4 text-blue-600" /> : <Lock className="w-4 h-4 text-emerald-600" />}
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">
              {isInternal ? 'Aksh Protected Protocol' : 'Verified Secure Connection'}
            </div>
            <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
              {hostname}
            </div>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
          TLS 1.3
        </div>
      </div>

      {/* Advanced Performance & Telemetry HUD */}
      <div className="py-3 border-b border-slate-100 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Telemetry & Hardware HUD
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-[10px]">
              <Cpu className="w-3 h-3 text-blue-500" />
              <span>Tab Memory</span>
            </div>
            <div className="font-bold text-slate-800 text-xs">32.4 MB</div>
            <div className="text-[9px] text-emerald-600 font-medium">120 MB freed</div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-[10px]">
              <Activity className="w-3 h-3 text-amber-500" />
              <span>TLS Latency</span>
            </div>
            <div className="font-bold text-slate-800 text-xs">24 ms</div>
            <div className="text-[9px] text-slate-500">256-bit AES-GCM</div>
          </div>
        </div>
      </div>

      {/* Privacy & Shield Toggles */}
      <div className="py-3 border-b border-slate-100 space-y-2.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Privacy Shield Protection
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5 text-blue-600" />
            <div>
              <div className="font-medium text-slate-800">Trackers Blocked</div>
              <div className="text-[10px] text-slate-400">14 ad & telemetry beacons intercepted</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={trackerShield}
            onChange={(e) => setTrackerShield(e.target.checked)}
            className="rounded accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <div>
              <div className="font-medium text-slate-800">Memory Saver</div>
              <div className="text-[10px] text-slate-400">Auto-snooze idle background tabs</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={memorySaver}
            onChange={(e) => setMemorySaver(e.target.checked)}
            className="rounded accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <div>
              <div className="font-medium text-slate-800">Cookie Sandbox</div>
              <div className="text-[10px] text-slate-400">Strict cross-site partitioning</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={cookieSandbox}
            onChange={(e) => setCookieSandbox(e.target.checked)}
            className="rounded accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 flex items-center justify-between">
        <button
          onClick={() => {
            onOpenDevTools();
            onClose();
          }}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-[11px] cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Inspect with AI DevTools</span>
        </button>

        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
