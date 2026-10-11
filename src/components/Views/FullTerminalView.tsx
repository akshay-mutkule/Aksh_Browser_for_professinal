import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Layers,
  Cpu,
  Shield,
  Wifi,
  ExternalLink
} from 'lucide-react';
import { Tab } from '../../types';

interface FullTerminalViewProps {
  tabs: Tab[];
  activeTab?: Tab;
  onNavigateTab?: (tabId: string, url: string) => void;
  onOpenNewTab?: (url: string) => void;
  onSaveAsNote?: (title: string, content: string) => void;
}

interface CommandLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ai';
  text: string;
  timestamp: string;
}

export const FullTerminalView: React.FC<FullTerminalViewProps> = ({
  tabs,
  activeTab,
  onNavigateTab,
  onOpenNewTab,
  onSaveAsNote,
}) => {
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Aksh AI Browser Kernel v4.2.0-omni initialized [TLS 1.3 Kyber / WebGPU active]',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Type "help" for interactive command list, or type a natural question to query Gemini.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const appendLog = (type: CommandLog['type'], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const executeCommand = async (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    appendLog('input', `$ ${raw}`);
    setHistory((prev) => [raw, ...prev]);
    setHistoryIdx(-1);
    setInputVal('');

    const [cmd, ...args] = raw.split(' ');
    const argStr = args.join(' ').trim();
    const commandLower = cmd.toLowerCase();

    if (commandLower === 'help') {
      appendLog(
        'system',
        `Available Commands:
  help              - Show this manual
  clear             - Clear terminal screen
  tabs              - List currently open tabs & memory usage
  open <url>        - Open URL in current or new tab
  crawl <url>       - Live scrape web page text through proxy
  ask <query>       - Query Gemini AI co-pilot directly
  vault / memory    - Switch to Neural Memory Vault
  diff              - Switch to Semantic Diff Studio
  tools / toolbox   - Open Micro-Tool Studio & Utility Lab
  sandbox           - Open AI Code Sandbox & REPL
  api / apibuilder  - Open Instant API Builder
  workflows         - Launch Autonomous Workflow Studio
  matrix            - Open Multi-Model Intelligence Matrix
  bench             - Run browser benchmark diagnostic
  sysinfo           - Print client runtime details`
      );
      return;
    }

    if (commandLower === 'clear') {
      setLogs([]);
      return;
    }

    if (commandLower === 'tabs') {
      const tabList = tabs
        .map(
          (t, idx) =>
            `  [${idx + 1}] ID:${t.id.slice(0, 8)} | ${t.title || 'Untitled'} (${t.url}) [${t.contentType}]`
        )
        .join('\n');
      appendLog('output', `Active Tabs (${tabs.length}):\n${tabList}`);
      return;
    }

    if (commandLower === 'open') {
      if (!argStr) {
        appendLog('error', 'Usage: open <url>');
        return;
      }
      if (onOpenNewTab) {
        onOpenNewTab(argStr);
        appendLog('system', `Opened new tab with: ${argStr}`);
      }
      return;
    }

    if (commandLower === 'vault' || commandLower === 'memory') {
      if (onOpenNewTab) {
        onOpenNewTab('aksh://memory');
        appendLog('system', 'Navigating to Neural Memory Vault...');
      }
      return;
    }

    if (commandLower === 'diff') {
      if (onOpenNewTab) {
        onOpenNewTab('aksh://diff');
        appendLog('system', 'Navigating to Semantic Diff Studio...');
      }
      return;
    }

    if (commandLower === 'workflows') {
      if (onOpenNewTab) {
        onOpenNewTab('aksh://workflows');
        appendLog('system', 'Navigating to Autonomous Workflow Studio...');
      }
      return;
    }

    if (commandLower === 'sandbox') {
      if (onOpenNewTab) {
        onOpenNewTab('aksh://sandbox');
        appendLog('system', 'Opening AI Code Sandbox & Live REPL...');
      }
      return;
    }

    if (commandLower === 'api' || commandLower === 'apibuilder') {
      if (onOpenNewTab) {
        onOpenNewTab('aksh://apibuilder');
        appendLog('system', 'Opening Instant API Builder...');
      }
      return;
    }

    if (commandLower === 'tools' || commandLower === 'toolbox' || commandLower === 'utilities') {
      if (onOpenNewTab) {
        onOpenNewTab('aksh://tools');
        appendLog('system', 'Opening Micro-Tool Studio & Utility Lab...');
      }
      return;
    }

    if (commandLower === 'bench') {
      appendLog('system', 'Running synthetic compute benchmark...');
      const start = performance.now();
      let acc = 0;
      for (let i = 0; i < 2_000_000; i++) {
        acc += Math.sin(i);
      }
      const dur = (performance.now() - start).toFixed(2);
      appendLog(
        'output',
        `Benchmark Result:
  Operations: 2,000,000 trig iterations
  Duration:   ${dur} ms
  Status:     Ultra-Fast Edge Thread [OK]
  Checksum:   ${acc.toFixed(4)}`
      );
      return;
    }

    if (commandLower === 'sysinfo') {
      appendLog(
        'system',
        `Client Diagnostics:
  Browser Engine:  Aksh Next-Gen Web Shell
  Platform:        ${navigator.platform}
  User Agent:      ${navigator.userAgent.slice(0, 60)}...
  Screen:          ${window.innerWidth}x${window.innerHeight} (${window.devicePixelRatio}x)
  Language:        ${navigator.language}
  Online:          ${navigator.onLine ? 'YES (High Speed)' : 'OFFLINE'}`
      );
      return;
    }

    if (commandLower === 'crawl') {
      if (!argStr) {
        appendLog('error', 'Usage: crawl <url>');
        return;
      }
      setIsProcessing(true);
      try {
        const res = await fetch('/api/scrape-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: argStr }),
        });
        const data = await res.json();
        if (data.textContent) {
          appendLog(
            'output',
            `Title: ${data.title}\nMeta: ${data.metaDescription}\n\nExcerpt:\n${data.textContent.slice(0, 500)}...`
          );
        } else {
          appendLog('error', 'Failed to retrieve page text content');
        }
      } catch (err: any) {
        appendLog('error', `Crawl error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Default: Query Gemini AI Co-Pilot
    setIsProcessing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: raw,
          conversationHistory: [],
          mode: 'technical',
          model: 'gemini-3.7-flash',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        appendLog('ai', data.reply || 'No response generated.');
      } else {
        appendLog('error', 'Server error communicating with AI agent.');
      }
    } catch (err: any) {
      appendLog('error', `Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex-1 flex flex-col h-full bg-slate-950 text-cyan-400 font-mono text-xs select-text overflow-hidden"
    >
      {/* Terminal Title Bar */}
      <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white text-xs">Aksh Omni Terminal Shell</span>
          <span className="text-[10px] text-slate-400">/dev/pts/0 (tty)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
          <span>UTF-8</span>
          <button
            onClick={() => setLogs([])}
            className="p-1 hover:text-white transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 leading-relaxed">
        {logs.map((log) => {
          let colorClass = 'text-slate-300';
          if (log.type === 'input') colorClass = 'text-white font-bold';
          if (log.type === 'system') colorClass = 'text-cyan-400 font-semibold';
          if (log.type === 'error') colorClass = 'text-rose-400 font-bold';
          if (log.type === 'ai') colorClass = 'text-emerald-300';

          return (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-slate-600 shrink-0 text-[10px] select-none">
                [{log.timestamp}]
              </span>
              <pre className={`whitespace-pre-wrap font-mono ${colorClass} flex-1`}>
                {log.text}
              </pre>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-amber-300 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Computing AI response...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interactive Input Prompt Line */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <span className="text-emerald-400 font-bold select-none">aksh@omni:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command or query..."
          className="flex-1 bg-transparent border-0 text-cyan-300 font-mono text-xs focus:outline-hidden placeholder-slate-600"
          autoFocus
        />
        <button
          onClick={() => executeCommand(inputVal)}
          disabled={!inputVal.trim() || isProcessing}
          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-40"
        >
          <Play className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
