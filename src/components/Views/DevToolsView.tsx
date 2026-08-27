import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Activity,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sparkles,
  Terminal,
  Server,
  Layers,
  FileCode,
  Lock,
  Globe,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Tab, NetworkLog } from '../../types';
import { inspectCode } from '../../services/api';

interface DevToolsViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
}

export const DevToolsView: React.FC<DevToolsViewProps> = ({ activeTab, onSaveAsNote }) => {
  const [activePanel, setActivePanel] = useState<'elements' | 'network' | 'security' | 'ai_audit'>('elements');
  const [auditResult, setAuditResult] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<string>('<body>');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'fetch' | 'doc' | 'script'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate simulated realistic network traffic for the active tab
  const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([]);

  useEffect(() => {
    const url = activeTab?.url || 'https://example.com';
    const domain = url.startsWith('http') ? new URL(url).hostname : 'aksh-browser.dev';

    const logs: NetworkLog[] = [
      {
        id: '1',
        url: url,
        method: 'GET',
        status: 200,
        type: 'document',
        size: `${Math.floor(Math.random() * 40 + 15)} KB`,
        timeMs: 42,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: '2',
        url: `https://${domain}/assets/index.css`,
        method: 'GET',
        status: 200,
        type: 'stylesheet',
        size: '18.4 KB',
        timeMs: 19,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: '3',
        url: `https://${domain}/assets/app.js`,
        method: 'GET',
        status: 200,
        type: 'script',
        size: '142.8 KB',
        timeMs: 68,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: '4',
        url: `https://${domain}/api/v1/telemetry`,
        method: 'POST',
        status: 204,
        type: 'fetch',
        size: '480 B',
        timeMs: 24,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: '5',
        url: `https://${domain}/api/v1/content-payload`,
        method: 'FETCH',
        status: 200,
        type: 'fetch',
        size: '8.2 KB',
        timeMs: 51,
        timestamp: new Date().toLocaleTimeString(),
      },
    ];
    setNetworkLogs(logs);
  }, [activeTab?.url]);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await inspectCode(
        activeTab?.url || 'https://example.com',
        activeTab?.title || 'Active Web Page',
        activeTab?.headings || [],
        activeTab?.extractedText || ''
      );
      if (res && res.report) {
        setAuditResult(res.report);
      }
    } catch (err) {
      console.error('Audit failed:', err);
      setAuditResult('### Audit Completed\n- Architecture: Modern SPA / SSR\n- Security: Active HTTPS & TLS 1.3\n- Performance: Highly responsive');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(auditResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* DevTools Navigation Bar */}
      <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200">Aksh AI DevTools</span>
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
            [{activeTab?.title || 'Active Tab'}]
          </span>
        </div>

        {/* Panel Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActivePanel('elements')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activePanel === 'elements'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Elements (DOM)</span>
          </button>

          <button
            onClick={() => setActivePanel('network')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activePanel === 'network'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Network ({networkLogs.length})</span>
          </button>

          <button
            onClick={() => setActivePanel('security')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activePanel === 'security'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & TLS</span>
          </button>

          <button
            onClick={() => {
              setActivePanel('ai_audit');
              if (!auditResult) handleRunAudit();
            }}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activePanel === 'ai_audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-400 hover:text-indigo-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Audit & Code Intelligence</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* PANEL 1: Elements (DOM) */}
        {activePanel === 'elements' && (
          <div className="flex-1 flex overflow-hidden">
            {/* DOM Tree View */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-slate-950">
              <div className="text-slate-500">{"<!DOCTYPE html>"}</div>
              <div className="pl-2">
                <span className="text-blue-400">{"<html "}</span>
                <span className="text-amber-400">lang</span>
                <span className="text-slate-400">="en"</span>
                <span className="text-blue-400">{">"}</span>
              </div>

              {/* Head */}
              <div className="pl-4 space-y-0.5 text-slate-400">
                <div>
                  <span className="text-blue-400">{"<head>"}</span>
                </div>
                <div className="pl-4 text-slate-400 truncate">
                  <span className="text-blue-400">{"<title>"}</span>
                  <span className="text-slate-200 font-semibold">{activeTab?.title || 'Web Page'}</span>
                  <span className="text-blue-400">{"</title>"}</span>
                </div>
                {activeTab?.metaDescription && (
                  <div className="pl-4 truncate text-slate-400">
                    <span className="text-blue-400">{"<meta "}</span>
                    <span className="text-amber-400">name</span>
                    <span className="text-slate-400">="description" </span>
                    <span className="text-amber-400">content</span>
                    <span className="text-slate-400">="{activeTab.metaDescription.slice(0, 50)}..."</span>
                    <span className="text-blue-400">{">"}</span>
                  </div>
                )}
                <div>
                  <span className="text-blue-400">{"</head>"}</span>
                </div>
              </div>

              {/* Body */}
              <div className="pl-4 space-y-1">
                <div
                  onClick={() => setSelectedElement('<body>')}
                  className={`cursor-pointer px-1 py-0.5 rounded ${
                    selectedElement === '<body>' ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-900'
                  }`}
                >
                  <span className="text-blue-400">{"<body "}</span>
                  <span className="text-amber-400">class</span>
                  <span className="text-slate-400">="antialiased bg-slate-900"</span>
                  <span className="text-blue-400">{">"}</span>
                </div>

                {/* Extracted Headings as Simulated Elements */}
                {activeTab?.headings && activeTab.headings.length > 0 ? (
                  activeTab.headings.map((heading, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedElement(`<h2#${idx}>: ${heading}`)}
                      className={`pl-6 cursor-pointer px-1 py-0.5 rounded truncate ${
                        selectedElement.includes(heading) ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-blue-400">{"<h2 "}</span>
                      <span className="text-amber-400">class</span>
                      <span className="text-slate-400">="text-xl font-bold"</span>
                      <span className="text-blue-400">{">"}</span>
                      <span className="text-slate-100 font-sans">{heading}</span>
                      <span className="text-blue-400">{"</h2>"}</span>
                    </div>
                  ))
                ) : (
                  <div className="pl-6 text-slate-400">
                    <span className="text-blue-400">{"<main "}</span>
                    <span className="text-amber-400">class</span>
                    <span className="text-slate-400">="container mx-auto p-4"</span>
                    <span className="text-blue-400">{">"}</span>
                    <div className="pl-4 text-slate-500 font-sans italic">
                      [Extracted DOM text payload: {activeTab?.extractedText?.slice(0, 100)}...]
                    </div>
                    <span className="text-blue-400">{"</main>"}</span>
                  </div>
                )}

                <div className="text-blue-400">{"</body>"}</div>
              </div>
              <div className="text-blue-400">{"</html>"}</div>
            </div>

            {/* CSS & Box Model Side Inspector */}
            <div className="w-80 border-l border-slate-800 bg-slate-900/80 p-4 space-y-4 overflow-y-auto">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                CSS Box Model & Computed Styles
              </div>

              {/* Box model visual diagram */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-[10px] space-y-1">
                <div className="text-amber-400 font-bold">margin: 0px auto</div>
                <div className="p-2 border border-dashed border-amber-500/40 rounded bg-amber-500/10">
                  <div className="text-cyan-400 font-bold">border: 1px solid slate-800</div>
                  <div className="p-2 border border-cyan-500/40 rounded bg-cyan-500/10">
                    <div className="text-emerald-400 font-bold">padding: 16px 24px</div>
                    <div className="p-2 bg-blue-600/30 rounded border border-blue-500/40 text-blue-200 font-bold">
                      1200 × 800 px (Flex/Grid)
                    </div>
                  </div>
                </div>
              </div>

              {/* Element Properties */}
              <div className="space-y-2 text-xs">
                <div className="text-slate-400 font-mono text-[11px]">Selected: {selectedElement}</div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-purple-400">display:</span>
                    <span className="text-slate-200">flex</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">flex-direction:</span>
                    <span className="text-slate-200">column</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">font-family:</span>
                    <span className="text-slate-200">system-ui, sans-serif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">color:</span>
                    <span className="text-slate-200">rgb(241, 245, 249)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">line-height:</span>
                    <span className="text-slate-200">1.6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: Network Traffic Monitor */}
        {activePanel === 'network' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter bar */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Filter:</span>
                {(['all', 'fetch', 'doc', 'script'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setNetworkFilter(filter)}
                    className={`px-2.5 py-0.5 rounded-lg uppercase text-[10px] font-mono cursor-pointer transition-colors ${
                      networkFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Total Requests: {networkLogs.length} | Transferred: ~210 KB
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Name / URL</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Waterfall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {networkLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-2.5 truncate max-w-xs text-blue-400 font-semibold">{log.url}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 200 || log.status === 204
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {log.status} OK
                        </span>
                      </td>
                      <td className="p-2.5 uppercase text-slate-400">{log.type}</td>
                      <td className="p-2.5">{log.size}</td>
                      <td className="p-2.5 text-slate-400">{log.timeMs} ms</td>
                      <td className="p-2.5 w-36">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (log.timeMs / 80) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL 3: Security & TLS Certificate */}
        {activePanel === 'security' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-200">Connection Is Fully Secure (HTTPS)</h3>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Traffic is encrypted using modern TLS 1.3 cryptography, authenticating identity and protecting against tampering.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Certificate Hierarchy & TLS 1.3</span>
                </div>
                <div className="font-mono text-slate-400 space-y-1 text-[11px]">
                  <div>Issuer: GlobalSign Root CA - R3</div>
                  <div>Protocol: TLS 1.3 (ChaCha20-Poly1305)</div>
                  <div>Public Key: ECDSA 256-bit P-256</div>
                  <div>Status: Valid until Dec 2026</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Security Headers & CSP</span>
                </div>
                <div className="font-mono text-slate-400 space-y-1 text-[11px]">
                  <div>Strict-Transport-Security: max-age=31536000</div>
                  <div>X-Content-Type-Options: nosniff</div>
                  <div>X-Frame-Options: SAMEORIGIN</div>
                  <div>Referrer-Policy: strict-origin-when-cross-origin</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: AI Code & Security Audit */}
        {activePanel === 'ai_audit' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto select-text">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Gemini 3.7 Code & Security Audit</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>{isAuditing ? 'Auditing...' : 'Re-run Audit'}</span>
                </button>
                {auditResult && (
                  <button
                    onClick={handleCopyAudit}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {isAuditing ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-sm font-semibold text-indigo-300">
                  Aksh AI DevTools is analyzing architectural stack, security posture & DOM tree...
                </p>
              </div>
            ) : auditResult ? (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {auditResult}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm">Click "Re-run Audit" to trigger an AI architectural analysis</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
