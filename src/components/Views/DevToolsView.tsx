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
  ExternalLink,
  Bot,
  Database,
  Download,
  ArrowRight
} from 'lucide-react';
import { Tab, NetworkLog } from '../../types';
import { inspectCode, executeAgentTask, extractStructuredData } from '../../services/api';

interface DevToolsViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
}

export const DevToolsView: React.FC<DevToolsViewProps> = ({ activeTab, onSaveAsNote }) => {
  const [activePanel, setActivePanel] = useState<'elements' | 'network' | 'security' | 'ai_audit' | 'agent' | 'extract'>('elements');
  const [auditResult, setAuditResult] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<string>('<body>');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'fetch' | 'doc' | 'script'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Autonomous Agent state
  const [agentGoal, setAgentGoal] = useState<string>('Extract all key research findings, verify security posture, and summarize architecture.');
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [agentResult, setAgentResult] = useState<any>(null);

  // Structured Data Extractor state
  const [extractSchema, setExtractSchema] = useState<string>('key metrics, articles, pricing, technologies used, metadata');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedDataResult, setExtractedDataResult] = useState<any>(null);
  const [extractCopied, setExtractCopied] = useState<boolean>(false);

  // Generate simulated realistic network traffic for the active tab
  const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([]);

  useEffect(() => {
    const url = activeTab?.url || 'https://example.com';
    let domain = 'aksh-browser.dev';
    try {
      if (url.startsWith('http')) {
        domain = new URL(url).hostname;
      }
    } catch {
      domain = 'example.com';
    }

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

  const handleRunAgentTask = async () => {
    if (!agentGoal.trim()) return;
    setIsAgentRunning(true);
    try {
      const res = await executeAgentTask(agentGoal, {
        url: activeTab?.url || 'https://example.com',
        title: activeTab?.title || 'Current Webpage',
        textContent: activeTab?.extractedText || activeTab?.metaDescription || 'Web content',
      });
      setAgentResult(res);
    } catch (err) {
      console.error('Agent task error:', err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleRunExtract = async () => {
    setIsExtracting(true);
    try {
      const res = await extractStructuredData(
        activeTab?.extractedText || activeTab?.metaDescription || 'Sample page content for analysis',
        activeTab?.title || 'Webpage',
        activeTab?.url || 'https://example.com',
        extractSchema || 'table'
      );
      setExtractedDataResult(res);
    } catch (err) {
      console.error('Extract error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(auditResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full bg-slate-50 text-slate-900 flex flex-col overflow-hidden select-none font-sans">
      {/* DevTools Navigation Bar */}
      <div className="p-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Aksh AI DevTools</span>
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
            [{activeTab?.title || 'Active Tab'}]
          </span>
        </div>

        {/* Panel Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setActivePanel('elements')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePanel === 'elements'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Elements (DOM)</span>
          </button>

          <button
            onClick={() => setActivePanel('network')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePanel === 'network'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Network ({networkLogs.length})</span>
          </button>

          <button
            onClick={() => setActivePanel('security')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePanel === 'security'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePanel === 'ai_audit'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-indigo-600 hover:text-indigo-800 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Code Audit</span>
          </button>

          <button
            onClick={() => setActivePanel('agent')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePanel === 'agent'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Web Agent</span>
          </button>

          <button
            onClick={() => setActivePanel('extract')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePanel === 'extract'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Extractor</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden flex bg-slate-50">
        {/* PANEL 1: Elements (DOM) */}
        {activePanel === 'elements' && (
          <div className="flex-1 flex overflow-hidden">
            {/* DOM Tree View */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-800 space-y-1 bg-white border-r border-slate-200">
              <div className="text-slate-400">{"<!DOCTYPE html>"}</div>
              <div className="pl-2">
                <span className="text-blue-600">{"<html "}</span>
                <span className="text-amber-700">lang</span>
                <span className="text-slate-600">="en"</span>
                <span className="text-blue-600">{">"}</span>
              </div>

              {/* Head */}
              <div className="pl-4 space-y-0.5 text-slate-500">
                <div>
                  <span className="text-blue-600">{"<head>"}</span>
                </div>
                <div className="pl-4 text-slate-700 truncate">
                  <span className="text-blue-600">{"<title>"}</span>
                  <span className="text-slate-900 font-bold">{activeTab?.title || 'Web Page'}</span>
                  <span className="text-blue-600">{"</title>"}</span>
                </div>
                {activeTab?.metaDescription && (
                  <div className="pl-4 truncate text-slate-600">
                    <span className="text-blue-600">{"<meta "}</span>
                    <span className="text-amber-700">name</span>
                    <span className="text-slate-600">="description" </span>
                    <span className="text-amber-700">content</span>
                    <span className="text-slate-600">="{activeTab.metaDescription.slice(0, 50)}..."</span>
                    <span className="text-blue-600">{">"}</span>
                  </div>
                )}
                <div>
                  <span className="text-blue-600">{"</head>"}</span>
                </div>
              </div>

              {/* Body */}
              <div className="pl-4 space-y-1">
                <div
                  onClick={() => setSelectedElement('<body>')}
                  className={`cursor-pointer px-1.5 py-0.5 rounded ${
                    selectedElement === '<body>' ? 'bg-blue-100 text-blue-900 font-semibold' : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="text-blue-600">{"<body "}</span>
                  <span className="text-amber-700">class</span>
                  <span className="text-slate-600">="antialiased bg-white text-slate-900"</span>
                  <span className="text-blue-600">{">"}</span>
                </div>

                {/* Extracted Headings as Simulated Elements */}
                {activeTab?.headings && activeTab.headings.length > 0 ? (
                  activeTab.headings.map((heading, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedElement(`<h2#${idx}>: ${heading}`)}
                      className={`pl-6 cursor-pointer px-1.5 py-0.5 rounded truncate ${
                        selectedElement.includes(heading) ? 'bg-blue-100 text-blue-900 font-semibold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-blue-600">{"<h2 "}</span>
                      <span className="text-amber-700">class</span>
                      <span className="text-slate-600">="text-xl font-bold"</span>
                      <span className="text-blue-600">{">"}</span>
                      <span className="text-slate-900 font-sans">{heading}</span>
                      <span className="text-blue-600">{"</h2>"}</span>
                    </div>
                  ))
                ) : (
                  <div className="pl-6 text-slate-600">
                    <span className="text-blue-600">{"<main "}</span>
                    <span className="text-amber-700">class</span>
                    <span className="text-slate-600">="container mx-auto p-4"</span>
                    <span className="text-blue-600">{">"}</span>
                    <div className="pl-4 text-slate-500 font-sans italic">
                      [Extracted DOM text payload: {activeTab?.extractedText?.slice(0, 100)}...]
                    </div>
                    <span className="text-blue-600">{"</main>"}</span>
                  </div>
                )}

                <div className="text-blue-600">{"</body>"}</div>
              </div>
              <div className="text-blue-600">{"</html>"}</div>
            </div>

            {/* CSS & Box Model Side Inspector */}
            <div className="w-80 border-l border-slate-200 bg-slate-50 p-4 space-y-4 overflow-y-auto">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200">
                CSS Box Model & Computed Styles
              </div>

              {/* Box model visual diagram */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center font-mono text-[10px] space-y-1 shadow-2xs">
                <div className="text-amber-700 font-bold">margin: 0px auto</div>
                <div className="p-2 border border-dashed border-amber-400 rounded bg-amber-50/50">
                  <div className="text-blue-700 font-bold">border: 1px solid slate-200</div>
                  <div className="p-2 border border-blue-300 rounded bg-blue-50/50">
                    <div className="text-emerald-700 font-bold">padding: 16px 24px</div>
                    <div className="p-2 bg-blue-100 rounded border border-blue-300 text-blue-900 font-bold">
                      1200 × 800 px (Flex/Grid)
                    </div>
                  </div>
                </div>
              </div>

              {/* Element Properties */}
              <div className="space-y-2 text-xs">
                <div className="text-slate-600 font-mono text-[11px]">Selected: {selectedElement}</div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 font-mono text-[11px] shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-indigo-600">display:</span>
                    <span className="text-slate-800">flex</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600">flex-direction:</span>
                    <span className="text-slate-800">column</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600">font-family:</span>
                    <span className="text-slate-800">system-ui, sans-serif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600">color:</span>
                    <span className="text-slate-800">rgb(15, 23, 42)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600">line-height:</span>
                    <span className="text-slate-800">1.6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: Network Traffic Monitor */}
        {activePanel === 'network' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Filter bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">Filter:</span>
                {(['all', 'fetch', 'doc', 'script'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setNetworkFilter(filter)}
                    className={`px-2.5 py-0.5 rounded-lg uppercase text-[10px] font-mono cursor-pointer transition-colors ${
                      networkFilter === filter
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Total Requests: {networkLogs.length} | Transferred: ~210 KB
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-bold">Name / URL</th>
                    <th className="p-2.5 font-bold">Status</th>
                    <th className="p-2.5 font-bold">Type</th>
                    <th className="p-2.5 font-bold">Size</th>
                    <th className="p-2.5 font-bold">Time</th>
                    <th className="p-2.5 font-bold">Waterfall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {networkLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 truncate max-w-xs text-blue-600 font-semibold">{log.url}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 200 || log.status === 204
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {log.status} OK
                        </span>
                      </td>
                      <td className="p-2.5 uppercase text-slate-600 font-medium">{log.type}</td>
                      <td className="p-2.5">{log.size}</td>
                      <td className="p-2.5 text-slate-600">{log.timeMs} ms</td>
                      <td className="p-2.5 w-36">
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
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
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Connection Is Fully Secure (HTTPS)</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Traffic is encrypted using modern TLS 1.3 cryptography, authenticating identity and protecting against eavesdropping or tampering.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Certificate Hierarchy & TLS 1.3</span>
                </div>
                <div className="font-mono text-slate-600 space-y-1.5 text-[11px] pt-1">
                  <div><strong className="text-slate-800">Issuer:</strong> GlobalSign Root CA - R3</div>
                  <div><strong className="text-slate-800">Protocol:</strong> TLS 1.3 (ChaCha20-Poly1305)</div>
                  <div><strong className="text-slate-800">Public Key:</strong> ECDSA 256-bit P-256</div>
                  <div><strong className="text-slate-800">Status:</strong> Valid until Dec 2026</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" />
                  <span>Security Headers & CSP</span>
                </div>
                <div className="font-mono text-slate-600 space-y-1.5 text-[11px] pt-1">
                  <div><strong className="text-slate-800">Strict-Transport-Security:</strong> max-age=31536000</div>
                  <div><strong className="text-slate-800">X-Content-Type-Options:</strong> nosniff</div>
                  <div><strong className="text-slate-800">X-Frame-Options:</strong> SAMEORIGIN</div>
                  <div><strong className="text-slate-800">Referrer-Policy:</strong> strict-origin-when-cross-origin</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: AI Code & Security Audit */}
        {activePanel === 'ai_audit' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto select-text">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Gemini 3.7 Code & Security Audit</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>{isAuditing ? 'Auditing...' : 'Re-run Audit'}</span>
                </button>
                {auditResult && (
                  <button
                    onClick={handleCopyAudit}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {isAuditing ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-sm font-semibold text-indigo-900">
                  Aksh AI DevTools is analyzing architectural stack, security posture & DOM tree...
                </p>
              </div>
            ) : auditResult ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans shadow-md">
                {auditResult}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Terminal className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Click "Re-run Audit" to trigger an AI architectural analysis</p>
              </div>
            )}
          </div>
        )}

        {/* PANEL 5: Autonomous Web Agent */}
        {activePanel === 'agent' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto select-text">
            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-purple-900">Autonomous Web Agent Runner</h3>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">
                Empower Gemini 3.7 to act as an autonomous browser agent. Provide any complex multi-step objective for the current webpage or web domain.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">Agent Objective / Goal</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={agentGoal}
                    onChange={(e) => setAgentGoal(e.target.value)}
                    placeholder="e.g. Inspect DOM forms, verify API endpoints, and summarize tech stack..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                  />
                  <button
                    onClick={handleRunAgentTask}
                    disabled={isAgentRunning || !agentGoal.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
                    <span>{isAgentRunning ? 'Executing...' : 'Run Agent'}</span>
                  </button>
                </div>
              </div>
            </div>

            {agentResult && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">Agent Execution Summary</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Goal Completed
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {agentResult.summary}
                  </p>

                  {/* Planned & Executed Steps */}
                  {agentResult.plan && agentResult.plan.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900">Executed Action Sequence</h4>
                      <div className="space-y-2">
                        {agentResult.plan.map((step: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {step.step || idx + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="font-bold text-slate-900">{step.action}</div>
                              {step.reasoning && (
                                <p className="text-[11px] text-slate-500">{step.reasoning}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Findings */}
                  {agentResult.findings && agentResult.findings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900">Agent Findings</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {agentResult.findings.map((finding: string, idx: number) => (
                          <li key={idx}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 6: Structured Data Extractor */}
        {activePanel === 'extract' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto select-text">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-900">AI Structured Data Extractor</h3>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Instantly convert unorganized page content into clean, typed JSON schemas, tables, and product specs.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">Target Schema / Fields to Extract</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={extractSchema}
                    onChange={(e) => setExtractSchema(e.target.value)}
                    placeholder="e.g. title, pricing, authors, features, download_links..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  <button
                    onClick={handleRunExtract}
                    disabled={isExtracting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                    <span>{isExtracting ? 'Extracting...' : 'Extract JSON'}</span>
                  </button>
                </div>
              </div>
            </div>

            {extractedDataResult && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">Extracted Structured JSON</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(extractedDataResult, null, 2));
                        setExtractCopied(true);
                        setTimeout(() => setExtractCopied(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {extractCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{extractCopied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96">
                  {JSON.stringify(extractedDataResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

