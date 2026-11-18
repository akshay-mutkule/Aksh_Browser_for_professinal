import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Copy,
  Check,
  Trash2,
  BookmarkPlus,
  Download
} from 'lucide-react';
import { Tab } from '../../types';
import { scrapeWebpage, sendAIChat } from '../../services/api';

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

const KNOWN_COMMANDS = [
  'help',
  'clear',
  'tabs',
  'focus',
  'open',
  'inspect',
  'crawl',
  'dns',
  'eval',
  'ask',
  'bench',
  'sysinfo',
  'notes',
  'mindmap',
  'research',
  'canvas',
  'diff',
  'vault',
  'tools',
  'network',
  'sandbox',
  'api',
  'workflows',
  'matrix',
  'security',
  'pdf',
  'system',
];

const ROUTE_ALIASES: Record<string, string> = {
  vault: 'aksh://memory',
  memory: 'aksh://memory',
  diff: 'aksh://diff',
  workflows: 'aksh://workflows',
  sandbox: 'aksh://sandbox',
  api: 'aksh://apibuilder',
  apibuilder: 'aksh://apibuilder',
  tools: 'aksh://tools',
  toolbox: 'aksh://tools',
  network: 'aksh://network',
  radar: 'aksh://network',
  matrix: 'aksh://matrix',
  mindmap: 'aksh://mindmap',
  security: 'aksh://security',
  pdf: 'aksh://pdf',
  system: 'aksh://system',
  notes: 'aksh://notes',
  canvas: 'aksh://canvas',
  research: 'aksh://research',
  devtools: 'aksh://devtools',
};

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
      text: 'Aksh Developer Shell ready. Type "help" for available commands, Tab to autocomplete, or enter any prompt to query AI.',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

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
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      },
    ]);
  };

  const executeCommand = async (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    appendLog('input', `$ ${raw}`);
    setHistory((prev) => [raw, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);
    setInputVal('');

    const parts = raw.split(/\s+/);
    const cmd = parts[0];
    const argStr = raw.slice(cmd.length).trim();
    const commandLower = cmd.toLowerCase();

    if (commandLower === 'help') {
      appendLog(
        'system',
        `Built-in Commands:
  help                Show command reference
  clear               Clear terminal output
  tabs                List open tabs and memory usage
  focus <index>       Navigate current tab or inspect tab by 1-based index
  open <url>          Open URL or aksh:// tool in a new tab
  inspect             Inspect active tab DOM metadata, headings & text length
  crawl <url>         Scrape webpage metadata and content through proxy
  dns <domain>        Resolve live DNS A/AAAA records via DNS-over-HTTPS
  eval <expr>         Evaluate JavaScript math/JSON expression safely
  ask <query>         Query Gemini grounded with active tab context
  bench               Run 2M-iteration floating-point compute benchmark
  sysinfo             Show runtime platform, cores, and viewport metrics

Quick Navigation Aliases:
  sandbox, api, network, workflows, diff, mindmap, pdf, canvas, matrix,
  security, vault, tools, research, notes, devtools, system`
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
            `  [${idx + 1}] ${(t.contentType || 'web').padEnd(10)} | ${(t.title || 'Untitled').slice(0, 34).padEnd(34)} | ${t.url}`
        )
        .join('\n');
      appendLog('output', `Open Tabs (${tabs.length}):\n${tabList}`);
      return;
    }

    if (commandLower === 'focus') {
      const index = parseInt(argStr, 10) - 1;
      if (Number.isNaN(index) || index < 0 || index >= tabs.length) {
        appendLog('error', `Invalid tab index. Enter 1 to ${tabs.length}.`);
        return;
      }
      const target = tabs[index];
      if (onNavigateTab && activeTab) {
        onNavigateTab(activeTab.id, target.url);
        appendLog('system', `Navigated to [${index + 1}] ${target.title} (${target.url})`);
      } else if (onOpenNewTab) {
        onOpenNewTab(target.url);
        appendLog('system', `Opened [${index + 1}] ${target.url}`);
      }
      return;
    }

    if (commandLower === 'open') {
      if (!argStr) {
        appendLog('error', 'Usage: open <url>');
        return;
      }
      const targetUrl =
        argStr.startsWith('http://') ||
        argStr.startsWith('https://') ||
        argStr.startsWith('aksh://')
          ? argStr
          : `https://${argStr}`;
      if (onOpenNewTab) {
        onOpenNewTab(targetUrl);
        appendLog('system', `Opened new tab: ${targetUrl}`);
      }
      return;
    }

    if (ROUTE_ALIASES[commandLower]) {
      const dest = ROUTE_ALIASES[commandLower];
      if (onOpenNewTab) {
        onOpenNewTab(dest);
        appendLog('system', `Opening ${dest}`);
      }
      return;
    }

    if (commandLower === 'inspect') {
      if (!activeTab) {
        appendLog('error', 'No active tab context available.');
        return;
      }
      const textLen = (activeTab.extractedText || activeTab.pdfData?.text || '').length;
      const headings = activeTab.headings?.slice(0, 8) || [];
      appendLog(
        'output',
        `Active Tab Context:
  Title:       ${activeTab.title || 'Untitled'}
  URL:         ${activeTab.url}
  Type:        ${activeTab.contentType}
  Text Length: ${textLen.toLocaleString()} chars
  Description: ${activeTab.metaDescription || '(none)'}
  Headings (${activeTab.headings?.length || 0}):${
    headings.length ? '\n    - ' + headings.join('\n    - ') : ' (none)'
  }`
      );
      return;
    }

    if (commandLower === 'dns') {
      if (!argStr) {
        appendLog('error', 'Usage: dns <domain> (e.g. dns cloudflare.com)');
        return;
      }
      const cleanDomain = argStr.replace(/^https?:\/\//, '').split('/')[0];
      setIsProcessing(true);
      try {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=A`,
          { headers: { Accept: 'application/dns-json' } }
        );
        const data = await res.json();
        const answers = data.Answer || [];
        if (answers.length === 0) {
          appendLog('output', `No A records returned for ${cleanDomain} (Status: ${data.Status})`);
        } else {
          const lines = answers.map(
            (a: any) => `  ${a.name}  TTL=${a.TTL}s  IN A  ${a.data}`
          );
          appendLog('output', `DNS Answer for ${cleanDomain}:\n${lines.join('\n')}`);
        }
      } catch (err: any) {
        appendLog('error', `DNS lookup failed: ${err?.message || err}`);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (commandLower === 'eval') {
      if (!argStr) {
        appendLog('error', 'Usage: eval <expression>');
        return;
      }
      try {
        if (!/^[\d\s+\-*/%().,MathPIEsqrtpowabsminmaxfloorroundceil\[\]{}'":truefalsenull]+$/.test(argStr.replace(/\s+/g, ''))) {
          appendLog('error', 'eval only accepts pure numeric/JSON/Math expressions.');
          return;
        }
        // eslint-disable-next-line no-new-func
        const fn = new Function(`"use strict"; return (${argStr});`);
        const val = fn();
        appendLog(
          'output',
          typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
        );
      } catch (err: any) {
        appendLog('error', `Eval error: ${err?.message || err}`);
      }
      return;
    }

    if (commandLower === 'crawl') {
      if (!argStr) {
        appendLog('error', 'Usage: crawl <url>');
        return;
      }
      const urlTarget =
        argStr.startsWith('http://') || argStr.startsWith('https://')
          ? argStr
          : `https://${argStr}`;
      setIsProcessing(true);
      try {
        const data = await scrapeWebpage(urlTarget);
        appendLog(
          'output',
          `Title:    ${data.title || '(none)'}\nURL:      ${data.url}\nMeta:     ${data.metaDescription || '(none)'}\nHeadings: ${(data.headings || []).slice(0, 5).join(' | ')}\nLength:   ${(data.textContent || '').length} chars\n\nExcerpt:\n${(data.textContent || '').slice(0, 650)}...`
        );
      } catch (err: any) {
        appendLog('error', `Crawl failed: ${err?.message || err}`);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (commandLower === 'bench') {
      const start = performance.now();
      let acc = 0;
      for (let i = 0; i < 2_000_000; i++) {
        acc += Math.sin(i);
      }
      const dur = (performance.now() - start).toFixed(2);
      appendLog(
        'output',
        `Compute Benchmark (Single-Thread JS):
  Iterations: 2,000,000 sin() evaluations
  Elapsed:    ${dur} ms
  Checksum:   ${acc.toFixed(6)}`
      );
      return;
    }

    if (commandLower === 'sysinfo') {
      const cores = navigator.hardwareConcurrency || 'unknown';
      const mem = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'N/A';
      appendLog(
        'system',
        `Runtime Diagnostics:
  Platform:       ${navigator.platform}
  CPU Cores:      ${cores}
  Device Memory:  ${mem}
  Viewport:       ${window.innerWidth} x ${window.innerHeight} @ ${window.devicePixelRatio}x DPR
  Language:       ${navigator.language}
  Network Online: ${navigator.onLine ? 'true' : 'false'}`
      );
      return;
    }

    // `ask <query>` or unrecognized command -> query AI grounded with active tab context
    const promptText = commandLower === 'ask' ? argStr : raw;
    if (!promptText) {
      appendLog('error', 'Usage: ask <question>');
      return;
    }

    setIsProcessing(true);
    try {
      const webpageContext = activeTab
        ? {
            url: activeTab.url,
            title: activeTab.title,
            textContent: (activeTab.pdfData?.text || activeTab.extractedText || '').slice(0, 3500),
          }
        : undefined;
      const res = await sendAIChat(promptText, [], webpageContext, 'technical', 'gemini-3.7-flash');
      appendLog('ai', res.reply || 'No response generated.');
    } catch (err: any) {
      appendLog('error', `AI Error: ${err?.message || 'Unable to reach Gemini endpoint'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const lower = inputVal.trim().toLowerCase();
      if (!lower) return;
      const match = KNOWN_COMMANDS.find((c) => c.startsWith(lower));
      if (match) setInputVal(`${match} `);
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

  const buildTranscript = () =>
    logs.map((l) => `[${l.timestamp}] ${l.text}`).join('\n\n');

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(buildTranscript());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveTranscript = () => {
    if (!onSaveAsNote) return;
    onSaveAsNote(
      `Terminal Session · ${new Date().toLocaleDateString()}`,
      `\`\`\`bash\n${buildTranscript()}\n\`\`\``
    );
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const handleDownloadLog = () => {
    const blob = new Blob([buildTranscript()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-terminal-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 font-mono text-xs select-text overflow-hidden"
    >
      {/* Clean Header Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white text-xs">Developer Shell</span>
          {activeTab && (
            <span className="text-[11px] text-slate-400 truncate max-w-[240px]">
              · Context: {activeTab.title || activeTab.url}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          {onSaveAsNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveTranscript();
              }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              {savedNote ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3 h-3" />
                  <span>Save Log</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyTranscript();
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadLog();
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Download .log"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLogs([]);
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Command Strip */}
      <div className="px-4 py-1.5 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 select-none">
        <span className="text-slate-500 shrink-0">Quick:</span>
        {['help', 'tabs', 'inspect', 'dns google.com', 'sysinfo', 'bench'].map((q) => (
          <button
            key={q}
            onClick={(e) => {
              e.stopPropagation();
              executeCommand(q);
            }}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 leading-relaxed">
        {logs.map((log) => {
          let colorClass = 'text-slate-300';
          if (log.type === 'input') colorClass = 'text-white font-semibold';
          if (log.type === 'system') colorClass = 'text-cyan-400';
          if (log.type === 'error') colorClass = 'text-rose-400';
          if (log.type === 'ai') colorClass = 'text-emerald-300';

          return (
            <div key={log.id} className="flex items-start gap-2.5">
              <span className="text-slate-600 shrink-0 text-[10px] select-none pt-0.5 tabular-nums">
                {log.timestamp}
              </span>
              <pre className={`whitespace-pre-wrap font-mono ${colorClass} flex-1`}>
                {log.text}
              </pre>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span>Executing command...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interactive Input Prompt Line */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <span className="text-cyan-400 font-semibold select-none">aksh:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (Tab to autocomplete) or ask AI..."
          className="flex-1 bg-transparent border-0 text-white font-mono text-xs focus:outline-hidden placeholder-slate-500"
          autoFocus
        />
        <button
          onClick={() => executeCommand(inputVal)}
          disabled={!inputVal.trim() || isProcessing}
          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs cursor-pointer disabled:opacity-40 flex items-center gap-1"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Run</span>
        </button>
      </div>
    </div>
  );
};
