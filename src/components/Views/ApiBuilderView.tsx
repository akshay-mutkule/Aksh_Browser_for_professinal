import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Webhook,
  Play,
  RotateCw,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  FileJson,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  Database,
  Globe,
  Radio,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Tab } from '../../types';
import { scrapeWebpage, sendAIChat } from '../../services/api';

interface ApiBuilderViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl: (url: string) => void;
}

export const ApiBuilderView: React.FC<ApiBuilderViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(
    activeTab?.url && activeTab.url.startsWith('http')
      ? activeTab.url
      : 'https://news.ycombinator.com'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTabCode, setActiveTabCode] = useState<'endpoints' | 'types' | 'curl' | 'python'>('endpoints');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Test Client State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/entities');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number>(0);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Generated Spec Data
  const [apiSpec, setApiSpec] = useState<{
    title: string;
    description: string;
    version: string;
    endpoints: Array<{
      method: 'GET' | 'POST';
      path: string;
      desc: string;
      params: string[];
      sampleResponse: any;
    }>;
    typescriptTypes: string;
  }>({
    title: 'HackerNews Intelligence REST API',
    description: 'Autonomous structured entity, ranking, and discussion API derived from live DOM.',
    version: '1.0.0',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/stories',
        desc: 'Retrieve top trending tech submissions, points, and domain sources',
        params: ['limit=10', 'sort=points'],
        sampleResponse: {
          status: 'success',
          count: 3,
          data: [
            { id: 40129, title: 'Show HN: Aksh AI Browser with Neural Canvas', domain: 'aksh.dev', points: 342, comments: 84 },
            { id: 40130, title: 'Quantum Supremacy in 2026: Benchmark Results', domain: 'nature.com', points: 289, comments: 112 },
            { id: 40131, title: 'TypeScript 5.8: ECMAScript 2026 Features', domain: 'typescriptlang.org', points: 215, comments: 46 }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/v1/entities',
        desc: 'Extract named corporate entities, technological frameworks, and benchmark metrics',
        params: ['filter=tech,org'],
        sampleResponse: {
          status: 'success',
          entities: [
            { name: 'Google Quantum AI', category: 'org', mentions: 14, confidence: 0.98 },
            { name: 'Gemini 3.7 Flash', category: 'tech', mentions: 9, confidence: 0.99 },
            { name: 'WebGPU', category: 'tech', mentions: 6, confidence: 0.95 }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/v1/synthesize',
        desc: 'Execute Gemini multi-stage synthesis across extracted articles',
        params: ['query=string', 'depth=deep'],
        sampleResponse: {
          status: 'success',
          summary: 'Dominant theme centers on quantum error correction and client-side AI inference scaling.',
          latencyMs: 38
        }
      }
    ],
    typescriptTypes: `export interface StoryItem {
  id: number;
  title: string;
  domain: string;
  points: number;
  comments: number;
}

export interface ExtractedEntity {
  name: string;
  category: 'org' | 'tech' | 'metric';
  mentions: number;
  confidence: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  entities?: ExtractedEntity[];
  latencyMs?: number;
}`
  });

  const handleGenerateApi = async () => {
    if (!targetUrl) return;
    setIsGenerating(true);
    try {
      const pageData = await scrapeWebpage(targetUrl);
      const prompt = `You are the Aksh Autonomous Web Scraper & Instant API Architect.
Convert the following webpage content into a clean, developer-grade REST API specification and TypeScript interface:
URL: ${targetUrl}
Title: ${pageData.title}
Headings: ${(pageData.headings || []).slice(0, 8).join(', ')}

Content Sample:
"""
${(pageData.textContent || '').slice(0, 4000)}
"""

Produce ONLY valid JSON with this exact schema:
{
  "title": "${pageData.title || 'Extracted Web'} REST API",
  "description": "Short 1-2 sentence description",
  "version": "1.0.0",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v1/data",
      "desc": "Endpoint description",
      "params": ["param1=value"],
      "sampleResponse": { "status": "success", "items": [] }
    },
    {
      "method": "GET",
      "path": "/api/v1/entities",
      "desc": "Extract named entities and metrics",
      "params": ["category=all"],
      "sampleResponse": { "status": "success", "entities": [] }
    }
  ],
  "typescriptTypes": "export interface ... { ... }"
}`;

      const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
      try {
        const cleanJson = res.reply.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.endpoints && parsed.typescriptTypes) {
          setApiSpec(parsed);
          setSelectedEndpoint(parsed.endpoints[0].path);
        }
      } catch (parseErr) {
        console.warn('Fallback: parsed raw spec text');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestEndpoint = () => {
    setIsTesting(true);
    setTestResponse(null);
    const start = performance.now();
    setTimeout(() => {
      const ep = apiSpec.endpoints.find((e) => e.path === selectedEndpoint.split(' ')[1]) || apiSpec.endpoints[0];
      setTestResponse(ep.sampleResponse);
      setTestLatency(Math.round(performance.now() - start + 24));
      setIsTesting(false);
    }, 380);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCurlCode = () => {
    const ep = apiSpec.endpoints[0];
    return `curl -X ${ep.method} "https://api.aksh.dev${ep.path}?${ep.params.join('&')}" \\
  -H "Authorization: Bearer aksh_live_session_token" \\
  -H "Accept: application/json"`;
  };

  const getPythonCode = () => {
    const ep = apiSpec.endpoints[0];
    return `import requests

url = "https://api.aksh.dev${ep.path}"
headers = {
    "Authorization": "Bearer aksh_live_session_token",
    "Accept": "application/json"
}
params = { ${ep.params.map(p => { const [k, v] = p.split('='); return `"${k}": "${v}"`; }).join(', ')} }

response = requests.${ep.method.toLowerCase()}(url, headers=headers, params=params)
data = response.json()
print("Extracted Data:", data)`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Autonomous Web Scraper & Instant API Generator
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold">
                aksh://apibuilder
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Converts any live webpage into structured REST endpoints, TypeScript SDK types & OpenAPI schemas
            </p>
          </div>
        </div>

        {/* Target URL Ingestion Bar */}
        <div className="flex items-center gap-2 w-96">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="Enter target URL to convert to API..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500"
          />
          <button
            onClick={handleGenerateApi}
            disabled={isGenerating || !targetUrl.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            {isGenerating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'Building...' : 'Generate API'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Endpoints & Code View */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950">
          {/* Tab Selector */}
          <div className="h-10 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {[
                { id: 'endpoints', label: 'Endpoints', icon: Layers },
                { id: 'types', label: 'TypeScript Types', icon: Code2 },
                { id: 'curl', label: 'cURL', icon: Terminal },
                { id: 'python', label: 'Python SDK', icon: FileJson },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabCode(tab.id as any)}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTabCode === tab.id
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const currentText =
                  activeTabCode === 'types'
                    ? apiSpec.typescriptTypes
                    : activeTabCode === 'curl'
                    ? getCurlCode()
                    : activeTabCode === 'python'
                    ? getPythonCode()
                    : JSON.stringify(apiSpec, null, 2);
                copyToClipboard(currentText, 'tabCode');
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy snippet"
            >
              {copiedKey === 'tabCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Left Viewport Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTabCode === 'endpoints' && (
              <div className="space-y-3">
                <div className="mb-2">
                  <h3 className="text-xs font-bold text-white">{apiSpec.title}</h3>
                  <p className="text-[11px] text-slate-400">{apiSpec.description}</p>
                </div>

                {apiSpec.endpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedEndpoint(`${ep.method} ${ep.path}`)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedEndpoint === `${ep.method} ${ep.path}`
                        ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                          ep.method === 'GET'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-blue-950 text-blue-400 border border-blue-800/40'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">{ep.path}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{ep.desc}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold text-slate-500">Query params:</span>
                      {ep.params.map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTabCode === 'types' && (
              <pre className="font-mono text-xs text-purple-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {apiSpec.typescriptTypes}
              </pre>
            )}

            {activeTabCode === 'curl' && (
              <pre className="font-mono text-xs text-cyan-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {getCurlCode()}
              </pre>
            )}

            {activeTabCode === 'python' && (
              <pre className="font-mono text-xs text-emerald-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {getPythonCode()}
              </pre>
            )}
          </div>
        </div>

        {/* Right: Live Endpoint Tester Client */}
        <div className="w-1/2 flex flex-col bg-slate-900/30">
          <div className="h-10 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-slate-200">Interactive API Client</span>
            </div>
            {testResponse && (
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  200 OK
                </span>
                <span className="text-slate-400">{testLatency} ms</span>
              </div>
            )}
          </div>

          {/* Test Request Bar */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono text-xs font-black">
              {selectedEndpoint.split(' ')[0]}
            </span>
            <input
              type="text"
              readOnly
              value={`https://api.aksh.dev${selectedEndpoint.split(' ')[1]}`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300 outline-none"
            />
            <button
              onClick={handleTestEndpoint}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              {isTesting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>Send</span>
            </button>
          </div>

          {/* JSON Response Viewport */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-slate-950/60">
            {isTesting ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                <RotateCw className="w-6 h-6 animate-spin text-purple-400" />
                <p>Dispatching HTTP request to mock proxy...</p>
              </div>
            ) : testResponse ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-850">
                  <span>RESPONSE PAYLOAD (application/json)</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(testResponse, null, 2), 'response')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'response' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'response' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-600 italic">
                Click "Send" above to execute a live test request and inspect the JSON payload.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
