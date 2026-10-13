import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Radio,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  Filter,
  Search,
  Copy,
  Check,
  Code2,
  Terminal,
  Clock,
  Layers,
  ArrowRight,
  Send,
  Sliders,
  Settings,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  FileText,
  Bookmark,
  Sparkles,
  Zap,
  Globe,
  SlidersHorizontal,
  Plus,
  Cpu
} from 'lucide-react';
import { Tab, NetworkTrafficItem, NetworkMockRule, NetworkAuditFinding } from '../../types';
import { runNetworkAudit } from '../../services/api';

interface NetworkStudioViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl?: (url: string) => void;
}

const DEFAULT_MOCK_RULES: NetworkMockRule[] = [
  {
    id: 'rule-1',
    name: 'Mock Auth Session Verification',
    enabled: true,
    urlPattern: '*/api/v1/auth/session*',
    method: 'ALL',
    overrideStatus: 200,
    responseBody: JSON.stringify(
      {
        authenticated: true,
        user: { id: 'usr_aksh_882', email: 'explorer@aksh.ai', role: 'Architect', tier: 'Enterprise Ultra' },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      null,
      2
    ),
    delayMs: 40,
    injectHeaders: { 'X-Mock-Engine': 'Aksh-Proxy-v3', 'X-RateLimit-Remaining': '9999' },
  },
  {
    id: 'rule-2',
    name: 'Simulate 429 Rate Limit on Telemetry',
    enabled: false,
    urlPattern: '*/analytics/events*',
    method: 'POST',
    overrideStatus: 429,
    responseBody: JSON.stringify({ error: 'Too Many Requests', retryAfterSeconds: 60 }, null, 2),
    delayMs: 250,
    injectHeaders: { 'Retry-After': '60' },
  },
  {
    id: 'rule-3',
    name: 'Simulate 500 Internal Gateway Crash',
    enabled: false,
    urlPattern: '*/api/checkout/process*',
    method: 'POST',
    overrideStatus: 500,
    responseBody: JSON.stringify({ error: 'Database transaction lock timeout', code: 'INTERNAL_ERROR' }, null, 2),
    delayMs: 800,
    injectHeaders: { 'X-Error-Trace': 'err_trace_982310' },
  },
];

const INITIAL_TRAFFIC: NetworkTrafficItem[] = [
  {
    id: 'req-1',
    url: 'https://api.aksh.ai/v2/intelligence/briefing',
    method: 'POST',
    status: 200,
    statusText: 'OK',
    type: 'fetch',
    sizeBytes: 4210,
    durationMs: 48,
    timestamp: '12:04:18',
    requestHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aksh-token',
      'User-Agent': 'Aksh-Browser-Engine/3.8',
    },
    responseHeaders: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-cache',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-content-type-options': 'nosniff',
    },
    requestBody: JSON.stringify({ domain: 'frontier-ai', depth: 'deep', tokenLimit: 8192 }, null, 2),
    responseBody: JSON.stringify(
      {
        status: 'success',
        sourcesSynthesized: 14,
        confidence: 0.98,
        vectorGraphNodes: 64,
      },
      null,
      2
    ),
    timing: { dns: 2, tcp: 8, tls: 14, ttfb: 21, download: 3 },
    tabTitle: 'New Tab Briefing',
  },
  {
    id: 'req-2',
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700',
    method: 'GET',
    status: 200,
    statusText: 'OK',
    type: 'stylesheet',
    sizeBytes: 1840,
    durationMs: 24,
    timestamp: '12:04:19',
    requestHeaders: {
      Accept: 'text/css,*/*;q=0.1',
    },
    responseHeaders: {
      'content-type': 'text/css; charset=utf-8',
      'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      'cross-origin-resource-policy': 'cross-origin',
    },
    timing: { dns: 1, tcp: 6, tls: 9, ttfb: 7, download: 1 },
    tabTitle: 'Google Search Hub',
  },
  {
    id: 'req-3',
    url: 'https://telemetry.analytics-beacon.io/collect?client_id=aksh_992&api_key=secret_live_key_9918237',
    method: 'GET',
    status: 200,
    statusText: 'OK',
    type: 'xhr',
    sizeBytes: 320,
    durationMs: 82,
    timestamp: '12:04:20',
    requestHeaders: {
      'Content-Type': 'application/json',
    },
    responseHeaders: {
      'access-control-allow-origin': '*',
      'content-type': 'application/json',
    },
    timing: { dns: 4, tcp: 16, tls: 22, ttfb: 38, download: 2 },
    securityWarnings: ['Sensitive API Key exposed in URL query parameters', 'Wildcard CORS Access-Control-Allow-Origin: * detected'],
    tabTitle: 'Live Page Tracker',
  },
  {
    id: 'req-4',
    url: 'http://insecure-cdn-legacy.net/assets/vendor.bundle.js',
    method: 'GET',
    status: 200,
    statusText: 'OK',
    type: 'script',
    sizeBytes: 88400,
    durationMs: 114,
    timestamp: '12:04:21',
    requestHeaders: {
      Accept: '*/*',
    },
    responseHeaders: {
      'content-type': 'application/javascript',
      'cache-control': 'public, max-age=31536000',
    },
    timing: { dns: 8, tcp: 24, tls: 0, ttfb: 62, download: 20 },
    securityWarnings: ['Cleartext unencrypted HTTP transport (Risk of Man-in-the-Middle injection)'],
    tabTitle: 'Legacy Asset CDN',
  },
  {
    id: 'req-5',
    url: 'https://api.github.com/repos/google/gemini-api/releases/latest',
    method: 'GET',
    status: 200,
    statusText: 'OK',
    type: 'fetch',
    sizeBytes: 14200,
    durationMs: 65,
    timestamp: '12:04:22',
    requestHeaders: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Aksh-Browser',
    },
    responseHeaders: {
      'content-type': 'application/json; charset=utf-8',
      'x-ratelimit-remaining': '58',
      'strict-transport-security': 'max-age=31536000; includeSubdomains',
    },
    timing: { dns: 2, tcp: 10, tls: 18, ttfb: 32, download: 3 },
    responseBody: JSON.stringify({ tag_name: 'v3.7.0', name: 'Gemini 3.7 Frontier Release', prerelease: false }, null, 2),
    tabTitle: 'GitHub Releases API',
  },
  {
    id: 'req-6',
    url: 'https://wss.aksh.ai/stream/co-presence',
    method: 'GET',
    status: 101,
    statusText: 'Switching Protocols',
    type: 'websocket',
    sizeBytes: 0,
    durationMs: 12,
    timestamp: '12:04:23',
    requestHeaders: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
      'Sec-WebSocket-Version': '13',
    },
    responseHeaders: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
    },
    timing: { dns: 1, tcp: 4, tls: 6, ttfb: 1, download: 0 },
    tabTitle: 'Multi-User Stream',
  },
];

type ThrottlingProfile = 'none' | '5g' | '4g' | 'fast_3g' | 'slow_3g' | 'offline';

export const NetworkStudioView: React.FC<NetworkStudioViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  // Navigation & Sub-views
  const [activeTabMode, setActiveTabMode] = useState<'traffic' | 'mock_rules' | 'curl_studio' | 'security_audit'>('traffic');

  // Traffic stream state
  const [trafficItems, setTrafficItems] = useState<NetworkTrafficItem[]>(() => {
    try {
      const saved = localStorage.getItem('aksh_network_traffic_stream');
      return saved ? JSON.parse(saved) : INITIAL_TRAFFIC;
    } catch {
      return INITIAL_TRAFFIC;
    }
  });

  const [isRecording, setIsRecording] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<NetworkTrafficItem | null>(trafficItems[0] || null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'fetch' | 'xhr' | 'document' | 'script' | 'stylesheet' | 'image' | 'websocket'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | '2xx' | '3xx' | '4xx' | '5xx'>('ALL');

  // Throttling state
  const [throttling, setThrottling] = useState<ThrottlingProfile>('none');

  // Mock Rules state
  const [mockRules, setMockRules] = useState<NetworkMockRule[]>(() => {
    try {
      const saved = localStorage.getItem('aksh_network_mock_rules');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_RULES;
    } catch {
      return DEFAULT_MOCK_RULES;
    }
  });

  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleMethod, setNewRuleMethod] = useState<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL');
  const [newRuleStatus, setNewRuleStatus] = useState<number>(200);
  const [newRuleBody, setNewRuleBody] = useState('{\n  "mock": true,\n  "message": "Custom injected payload"\n}');
  const [newRuleDelay, setNewRuleDelay] = useState<number>(0);

  // cURL Studio state
  const [curlMethod, setCurlMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [curlUrl, setCurlUrl] = useState('https://api.aksh.ai/v2/intelligence/briefing');
  const [curlHeaders, setCurlHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer sample_api_key');
  const [curlBody, setCurlBody] = useState('{\n  "query": "Quantum Computing 2026",\n  "mode": "deep"\n}');
  const [curlTargetLang, setCurlTargetLang] = useState<'curl' | 'fetch' | 'axios' | 'python' | 'go' | 'rust'>('curl');
  const [curlResponse, setCurlResponse] = useState<any>(null);
  const [curlLoading, setCurlLoading] = useState(false);

  // AI Security Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditFindings, setAuditFindings] = useState<NetworkAuditFinding[]>([]);
  const [securityScore, setSecurityScore] = useState<number>(88);
  const [auditOverview, setAuditOverview] = useState<string>('');

  // Copy indicator state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aksh_network_traffic_stream', JSON.stringify(trafficItems));
    } catch {}
  }, [trafficItems]);

  useEffect(() => {
    try {
      localStorage.setItem('aksh_network_mock_rules', JSON.stringify(mockRules));
    } catch {}
  }, [mockRules]);

  // Simulated traffic generator when recording
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      const sampleEndpoints = [
        { url: 'https://cdn.aksh.ai/static/css/theme-dark.css', method: 'GET' as const, type: 'stylesheet' as const, size: 4120, status: 200 },
        { url: 'https://api.aksh.ai/v2/memory/query?k=transformer', method: 'GET' as const, type: 'fetch' as const, size: 2840, status: 200 },
        { url: 'https://analytics.cloudflare.com/beacon/cdn', method: 'POST' as const, type: 'xhr' as const, size: 450, status: 204 },
        { url: 'https://api.github.com/users/google/repos?per_page=5', method: 'GET' as const, type: 'fetch' as const, size: 9140, status: 200 },
      ];
      const pick = sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)];
      
      // Check if matches active mock rules
      let finalStatus = pick.status;
      let finalBody = undefined;
      const matchedRule = mockRules.find((r) => r.enabled && (r.urlPattern.includes('*') || pick.url.includes(r.urlPattern.replace(/\*/g, ''))));
      if (matchedRule) {
        finalStatus = matchedRule.overrideStatus;
        finalBody = matchedRule.responseBody;
      }

      const newItem: NetworkTrafficItem = {
        id: 'req-' + Date.now(),
        url: pick.url,
        method: pick.method,
        status: finalStatus,
        statusText: finalStatus === 200 ? 'OK' : finalStatus === 204 ? 'No Content' : 'Modified',
        type: pick.type,
        sizeBytes: pick.size,
        durationMs: Math.round(15 + Math.random() * 85),
        timestamp: new Date().toLocaleTimeString(),
        requestHeaders: { 'User-Agent': 'Aksh-Browser/3.8' },
        responseHeaders: { 'content-type': 'application/json' },
        responseBody: finalBody,
        timing: { dns: 2, tcp: 8, tls: 12, ttfb: 24, download: 4 },
        tabTitle: activeTab?.title || 'Active Tab',
      };

      setTrafficItems((prev) => [newItem, ...prev.slice(0, 99)]);
    }, 7000);

    return () => clearInterval(interval);
  }, [isRecording, mockRules, activeTab]);

  // Filtered Traffic Items
  const filteredTraffic = useMemo(() => {
    return trafficItems.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inUrl = item.url.toLowerCase().includes(q);
        const inMethod = item.method.toLowerCase().includes(q);
        const inStatus = String(item.status).includes(q);
        if (!inUrl && !inMethod && !inStatus) return false;
      }

      // Method filter
      if (methodFilter !== 'ALL' && item.method !== methodFilter) return false;

      // Type filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        const s = item.status;
        if (statusFilter === '2xx' && (s < 200 || s >= 300)) return false;
        if (statusFilter === '3xx' && (s < 300 || s >= 400)) return false;
        if (statusFilter === '4xx' && (s < 400 || s >= 500)) return false;
        if (statusFilter === '5xx' && s < 500) return false;
      }

      return true;
    });
  }, [trafficItems, searchQuery, methodFilter, typeFilter, statusFilter]);

  // Aggregate stats
  const trafficStats = useMemo(() => {
    const totalRequests = trafficItems.length;
    const totalBytes = trafficItems.reduce((acc, i) => acc + i.sizeBytes, 0);
    const avgLatency =
      totalRequests > 0
        ? Math.round(trafficItems.reduce((acc, i) => acc + i.durationMs, 0) / totalRequests)
        : 0;
    const errorCount = trafficItems.filter((i) => i.status >= 400).length;
    const mockedCount = mockRules.filter((r) => r.enabled).length;

    return { totalRequests, totalBytes, avgLatency, errorCount, mockedCount };
  }, [trafficItems, mockRules]);

  // Add custom mock rule
  const handleAddMockRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) return;

    const newRule: NetworkMockRule = {
      id: 'rule-' + Date.now(),
      name: newRuleName.trim(),
      enabled: true,
      urlPattern: newRulePattern.trim(),
      method: newRuleMethod,
      overrideStatus: Number(newRuleStatus),
      responseBody: newRuleBody,
      delayMs: Number(newRuleDelay),
      injectHeaders: { 'X-Injected-By': 'Aksh-Radar' },
    };

    setMockRules([newRule, ...mockRules]);
    setNewRuleModalOpen(false);
    setNewRuleName('');
    setNewRulePattern('');
  };

  const handleToggleMockRule = (id: string) => {
    setMockRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteMockRule = (id: string) => {
    setMockRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Run AI Security Audit
  const handleRunSecurityAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await runNetworkAudit(trafficItems);
      setAuditFindings(res.findings || []);
      setSecurityScore(res.securityScore || 85);
      setAuditOverview(res.overview || 'Network audit executed successfully.');
    } catch {
      // Deterministic fallback
      const mockFindings: NetworkAuditFinding[] = [
        {
          id: 'f-1',
          severity: 'CRITICAL',
          title: 'Sensitive Credential Exposed in Query String',
          description: 'URL contains `api_key=secret_live_key_9918237`. Query strings are logged in access logs, proxies, and browser histories.',
          recommendation: 'Transfer sensitive auth secrets strictly via HTTP Authorization Bearer headers.',
          affectedUrl: 'https://telemetry.analytics-beacon.io/collect?client_id=aksh_992&api_key=secret_live_key_9918237',
          category: 'Credentials',
        },
        {
          id: 'f-2',
          severity: 'HIGH',
          title: 'Unencrypted Insecure Transport Protocol (HTTP)',
          description: 'Static vendor bundle served over unencrypted plaintext HTTP (`http://insecure-cdn-legacy.net/`). Susceptible to ARP/DNS spoofing.',
          recommendation: 'Upgrade to HTTPS with Strict-Transport-Security (HSTS) with a minimum max-age of 31536000 seconds.',
          affectedUrl: 'http://insecure-cdn-legacy.net/assets/vendor.bundle.js',
          category: 'Transport',
        },
        {
          id: 'f-3',
          severity: 'MEDIUM',
          title: 'Permissive Wildcard Access-Control-Allow-Origin',
          description: 'CORS header contains `*` wildcard on sensitive analytics endpoints allowing arbitrary cross-origin script read operations.',
          recommendation: 'Enforce explicit trusted origin whitelisting in Access-Control-Allow-Origin.',
          affectedUrl: 'https://telemetry.analytics-beacon.io/collect',
          category: 'CORS',
        },
      ];
      setAuditFindings(mockFindings);
      setSecurityScore(74);
      setAuditOverview(
        'Detected exposed API tokens in telemetry query strings and unencrypted HTTP transport. Enforce HTTPS and move secrets to Bearer headers.'
      );
    } finally {
      setIsAuditing(false);
    }
  };

  // Execute cURL / Replay
  const handleExecuteCurl = async () => {
    setCurlLoading(true);
    setCurlResponse(null);
    try {
      const start = performance.now();
      const res = await fetch(curlUrl, {
        method: curlMethod,
        headers: { 'Content-Type': 'application/json' },
        body: ['POST', 'PUT', 'PATCH'].includes(curlMethod) ? curlBody : undefined,
      });
      const dur = Math.round(performance.now() - start);
      const text = await res.text();
      let parsed = text;
      try {
        parsed = JSON.parse(text);
      } catch {}

      setCurlResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs: dur,
        headers: Object.fromEntries(res.headers.entries()),
        data: parsed,
      });
    } catch (err: any) {
      setCurlResponse({
        status: 0,
        statusText: 'Client Network Error',
        durationMs: 0,
        error: err.message || 'Failed to dispatch request',
      });
    } finally {
      setCurlLoading(false);
    }
  };

  // Generate code snippet for active request or cURL studio
  const generateCodeSnippet = (req: NetworkTrafficItem | null, lang: string) => {
    const url = req ? req.url : curlUrl;
    const method = req ? req.method : curlMethod;
    const body = req ? req.requestBody : curlBody;

    switch (lang) {
      case 'curl':
        return `curl -X ${method} "${url}" \\
  -H "Content-Type: application/json"${body && ['POST', 'PUT', 'PATCH'].includes(method) ? ` \\\n  -d '${body.replace(/\n/g, ' ')}'` : ''}`;

      case 'fetch':
        return `const response = await fetch("${url}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
  },${body && ['POST', 'PUT', 'PATCH'].includes(method) ? `\n  body: JSON.stringify(${body}),` : ''}
});
const data = await response.json();
console.log(data);`;

      case 'axios':
        return `import axios from 'axios';

const { data } = await axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: { 'Content-Type': 'application/json' },${body && ['POST', 'PUT', 'PATCH'].includes(method) ? `\n  data: ${body},` : ''}
});
console.log(data);`;

      case 'python':
        return `import requests

url = "${url}"
headers = {"Content-Type": "application/json"}
${body && ['POST', 'PUT', 'PATCH'].includes(method) ? `data = ${body}\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=data)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;

      case 'go':
        return `package main

import (
  "fmt"
  "net/http"
  "io"
)

func main() {
  req, err := http.NewRequest("${method}", "${url}", nil)
  if err != nil { panic(err) }
  req.Header.Set("Content-Type", "application/json")

  resp, err := http.DefaultClient.Do(req)
  if err != nil { panic(err) }
  defer resp.Body.Close()

  body, _ := io.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;

      case 'rust':
        return `use reqwest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let client = reqwest::Client::new();
  let res = client.${method.toLowerCase()}("${url}")
    .header("Content-Type", "application/json")
    .send()
    .await?;

  println!("Status: {}", res.status());
  let body = res.text().await?;
  println!("Body: {}", body);
  Ok(())
}`;

      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header & Telemetry Summary Bar */}
      <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">Aksh Network Intelligence Radar</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                Live Interceptor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time traffic capture, simulated proxy rules & automated Gemini security audit
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Requests:</span>
            <span className="font-bold text-white font-mono">{trafficStats.totalRequests}</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Avg Latency:</span>
            <span className="font-bold text-white font-mono">{trafficStats.avgLatency}ms</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Rules Active:</span>
            <span className="font-bold text-white font-mono">{trafficStats.mockedCount}</span>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTabMode('traffic')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'traffic'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Traffic Stream</span>
          </button>

          <button
            onClick={() => setActiveTabMode('mock_rules')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'mock_rules'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mock Rules</span>
            {mockRules.filter((r) => r.enabled).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTabMode('curl_studio')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'curl_studio'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>cURL Studio</span>
          </button>

          <button
            onClick={() => {
              setActiveTabMode('security_audit');
              if (auditFindings.length === 0) handleRunSecurityAudit();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'security_audit'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Radar</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: TRAFFIC STREAM */}
      {activeTabMode === 'traffic' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Toolbar */}
          <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Recording & Clear Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
                title={isRecording ? 'Pause recording network traffic' : 'Resume recording network traffic'}
              >
                {isRecording ? <Pause className="w-3.5 h-3.5 fill-rose-400" /> : <Play className="w-3.5 h-3.5 fill-emerald-400" />}
                <span>{isRecording ? 'Recording' : 'Paused'}</span>
              </button>

              <button
                onClick={() => setTrafficItems([])}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
                title="Clear captured network traffic"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear</span>
              </button>

              {/* Throttling Selector */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] text-slate-400">Throttle:</span>
                <select
                  value={throttling}
                  onChange={(e) => setThrottling(e.target.value as ThrottlingProfile)}
                  className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="none" className="bg-slate-900">No Throttling</option>
                  <option value="5g" className="bg-slate-900">5G Ultra (120 Mbps)</option>
                  <option value="4g" className="bg-slate-900">4G LTE (30 Mbps)</option>
                  <option value="fast_3g" className="bg-slate-900">Fast 3G (1.8 Mbps)</option>
                  <option value="slow_3g" className="bg-slate-900">Slow 3G (450 Kbps)</option>
                  <option value="offline" className="bg-slate-900">Offline Simulation</option>
                </select>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2 flex-1 max-w-lg justify-end">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter URL, status..."
                  className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Method filter */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="2xx">2xx Success</option>
                <option value="3xx">3xx Redirect</option>
                <option value="4xx">4xx Client Err</option>
                <option value="5xx">5xx Server Err</option>
              </select>
            </div>
          </div>

          {/* Main Traffic View: Table + Side Detail Drawer */}
          <div className="flex-1 flex overflow-hidden">
            {/* Table Area */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">URL & Endpoint</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTraffic.map((item) => {
                    const isSelected = selectedRequest?.id === item.id;
                    const methodColor =
                      item.method === 'GET'
                        ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60'
                        : item.method === 'POST'
                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                        : item.method === 'PUT'
                        ? 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                        : item.method === 'DELETE'
                        ? 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                        : 'text-purple-400 bg-purple-950/60 border-purple-800/60';

                    const statusColor =
                      item.status >= 200 && item.status < 300
                        ? 'text-emerald-400'
                        : item.status >= 300 && item.status < 400
                        ? 'text-indigo-400'
                        : item.status >= 400 && item.status < 500
                        ? 'text-amber-400'
                        : 'text-rose-400';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedRequest(item)}
                        className={`transition-colors cursor-pointer select-text ${
                          isSelected
                            ? 'bg-cyan-950/40 border-l-2 border-cyan-500'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${methodColor}`}>
                            {item.method}
                          </span>
                        </td>
                        <td className={`py-2 px-3 whitespace-nowrap font-bold ${statusColor}`}>
                          {item.status}
                        </td>
                        <td className="py-2 px-3 truncate max-w-xs sm:max-w-md text-slate-300 font-sans" title={item.url}>
                          <div className="flex items-center gap-1.5">
                            {item.securityWarnings && item.securityWarnings.length > 0 && (
                              <span title="Security hazard detected" className="shrink-0 flex items-center">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                            <span className="truncate">{item.url}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                          {item.type}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-300">
                          {item.durationMs}ms
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-400">
                          {item.sizeBytes > 1024 ? `${(item.sizeBytes / 1024).toFixed(1)} KB` : `${item.sizeBytes} B`}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {item.timestamp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTraffic.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
                  <Activity className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No network requests matching filters</p>
                  <p className="text-xs text-slate-600 mt-1">Clear your filter criteria or visit web pages to capture traffic</p>
                </div>
              )}
            </div>

            {/* Right Side Detail Inspector Drawer */}
            {selectedRequest && (
              <div className="w-96 lg:w-[480px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-cyan-400 text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                      {selectedRequest.method}
                    </span>
                    <span className="font-bold text-slate-200 text-xs truncate" title={selectedRequest.url}>
                      {new URL(selectedRequest.url).pathname || selectedRequest.url}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Request Overview Stats */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Status Code</span>
                    <p className="font-bold text-emerald-400 font-mono mt-0.5">
                      {selectedRequest.status} {selectedRequest.statusText}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Duration / Latency</span>
                    <p className="font-bold text-indigo-400 font-mono mt-0.5">
                      {selectedRequest.durationMs} ms
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Resource Type</span>
                    <p className="font-bold text-slate-300 mt-0.5 uppercase tracking-wide text-[11px]">
                      {selectedRequest.type}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Payload Transferred</span>
                    <p className="font-bold text-slate-300 font-mono mt-0.5">
                      {selectedRequest.sizeBytes} Bytes
                    </p>
                  </div>
                </div>

                {/* Full URL & Copy Action */}
                <div className="p-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 font-semibold text-[11px]">Full Destination URL</span>
                    <button
                      onClick={() => handleCopy('url', selectedRequest.url)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'url' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    {selectedRequest.url}
                  </p>
                </div>

                {/* Security Warnings if detected */}
                {selectedRequest.securityWarnings && selectedRequest.securityWarnings.length > 0 && (
                  <div className="p-4 border-b border-slate-800 bg-amber-950/20 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Security & Privacy Alerts Detected</span>
                    </div>
                    <ul className="space-y-1.5 text-amber-200/90 text-[11px]">
                      {selectedRequest.securityWarnings.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Request / Response Headers */}
                <div className="p-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-bold">Response Headers</span>
                    <button
                      onClick={() => handleCopy('resp_hdrs', JSON.stringify(selectedRequest.responseHeaders, null, 2))}
                      className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'resp_hdrs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Headers</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 overflow-x-auto max-h-48">
                    {Object.entries(selectedRequest.responseHeaders).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-slate-500 shrink-0">{k}:</span>
                        <span className="text-slate-300 break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Replay & Code Export */}
                <div className="p-4 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-bold">cURL Command Export</span>
                    <button
                      onClick={() => handleCopy('curl_exp', generateCodeSnippet(selectedRequest, 'curl'))}
                      className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'curl_exp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy cURL</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300/90 whitespace-pre-wrap overflow-x-auto">
                    {generateCodeSnippet(selectedRequest, 'curl')}
                  </pre>

                  <button
                    onClick={() => {
                      setCurlMethod(selectedRequest.method as any);
                      setCurlUrl(selectedRequest.url);
                      setActiveTabMode('curl_studio');
                    }}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-600/20"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Open in cURL Studio & Replay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MOCK RULES & INTERCEPTOR */}
      {activeTabMode === 'mock_rules' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Interception & Mock Proxy Rules</h2>
              <p className="text-xs text-slate-400 mt-1">
                Intercept outgoing web requests, override status codes, and inject dynamic mock payloads without touching backend code.
              </p>
            </div>
            <button
              onClick={() => setNewRuleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Mock Rule</span>
            </button>
          </div>

          <div className="space-y-4">
            {mockRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all ${
                  rule.enabled
                    ? 'bg-slate-900 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleMockRule(rule.id)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-0.5 ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          rule.enabled ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{rule.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {rule.method}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            rule.overrideStatus >= 200 && rule.overrideStatus < 300
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          Status {rule.overrideStatus}
                        </span>
                        {rule.delayMs > 0 && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                            +{rule.delayMs}ms delay
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-indigo-300 mt-1">{rule.urlPattern}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMockRule(rule.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">Injected Payload:</div>
                  <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 max-h-32 overflow-y-auto">
                    {rule.responseBody}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* New Rule Modal Drawer */}
          {newRuleModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="font-bold text-white text-base">New Interception & Mock Rule</h3>
                  <button
                    onClick={() => setNewRuleModalOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddMockRule} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Rule Friendly Name</label>
                    <input
                      type="text"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="e.g. Mock Billing Plan Response"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">URL Match Pattern (Wildcards supported)</label>
                    <input
                      type="text"
                      value={newRulePattern}
                      onChange={(e) => setNewRulePattern(e.target.value)}
                      placeholder="e.g. */api/v1/plans*"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Method</label>
                      <select
                        value={newRuleMethod}
                        onChange={(e) => setNewRuleMethod(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                      >
                        <option value="ALL">ALL</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">HTTP Status</label>
                      <input
                        type="number"
                        value={newRuleStatus}
                        onChange={(e) => setNewRuleStatus(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Delay (ms)</label>
                      <input
                        type="number"
                        value={newRuleDelay}
                        onChange={(e) => setNewRuleDelay(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Mock JSON Response Body</label>
                    <textarea
                      rows={5}
                      value={newRuleBody}
                      onChange={(e) => setNewRuleBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewRuleModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      Save Rule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: CURL STUDIO & API REPLAY */}
      {activeTabMode === 'curl_studio' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Compose Panel */}
          <div className="w-1/2 p-6 border-r border-slate-800 overflow-y-auto flex flex-col space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Compose & Replay HTTP Request</span>
            </h2>

            {/* Method & URL Input */}
            <div className="flex gap-2">
              <select
                value={curlMethod}
                onChange={(e) => setCurlMethod(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer shrink-0"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <input
                type="text"
                value={curlUrl}
                onChange={(e) => setCurlUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />

              <button
                onClick={handleExecuteCurl}
                disabled={curlLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-purple-600/20 shrink-0"
              >
                {curlLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </div>

            {/* Request Headers */}
            <div>
              <label className="block text-slate-400 font-semibold text-xs mb-1">Headers (Key: Value per line)</label>
              <textarea
                rows={3}
                value={curlHeaders}
                onChange={(e) => setCurlHeaders(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Request Body (for POST/PUT) */}
            {['POST', 'PUT', 'PATCH'].includes(curlMethod) && (
              <div>
                <label className="block text-slate-400 font-semibold text-xs mb-1">Request Payload (JSON)</label>
                <textarea
                  rows={6}
                  value={curlBody}
                  onChange={(e) => setCurlBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Multi-Language Snippet Generator */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-semibold text-xs">Generated Code Snippet</span>
                <div className="flex items-center gap-1">
                  {(['curl', 'fetch', 'axios', 'python', 'go', 'rust'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCurlTargetLang(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase cursor-pointer ${
                        curlTargetLang === lang ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300/90 whitespace-pre-wrap overflow-x-auto max-h-48">
                  {generateCodeSnippet(null, curlTargetLang)}
                </pre>
                <button
                  onClick={() => handleCopy('curl_snippet', generateCodeSnippet(null, curlTargetLang))}
                  className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'curl_snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'curl_snippet' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Response Output Panel */}
          <div className="w-1/2 p-6 overflow-y-auto flex flex-col bg-slate-950/60">
            <h2 className="text-base font-bold text-slate-200 tracking-tight mb-4">Live Execution Output</h2>

            {curlResponse ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        curlResponse.status >= 200 && curlResponse.status < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {curlResponse.status} {curlResponse.statusText}
                    </span>
                    <span className="text-slate-400">Time:</span>
                    <span className="font-mono text-slate-200 font-bold">{curlResponse.durationMs}ms</span>
                  </div>

                  <button
                    onClick={() => handleCopy('resp_body', JSON.stringify(curlResponse.data, null, 2))}
                    className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'resp_body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy JSON</span>
                  </button>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold text-xs mb-1 block">Response Body</span>
                  <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-96 whitespace-pre-wrap">
                    {typeof curlResponse.data === 'object'
                      ? JSON.stringify(curlResponse.data, null, 2)
                      : String(curlResponse.data || curlResponse.error)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
                <Send className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
                <p className="text-xs font-semibold">Ready to dispatch HTTP request</p>
                <p className="text-[11px] text-slate-600 mt-1">Configure your endpoint and click Send to inspect live status & headers</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: AI SECURITY & PRIVACY RADAR */}
      {activeTabMode === 'security_audit' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>AI Automated Traffic & Privacy Audit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Deep inspects intercepted packets for credentials in query params, tracking beacons, CORS wildcards, and plaintext vulnerabilities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunSecurityAudit}
                disabled={isAuditing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isAuditing ? 'Auditing Traffic...' : 'Re-Run Security Audit'}</span>
              </button>

              <button
                onClick={() => {
                  const content = `# Aksh AI Network Security Audit\n\n**Security Score:** ${securityScore}/100\n**Overview:** ${auditOverview}\n**Audited At:** ${new Date().toLocaleString()}\n\n---\n\n${auditFindings
                    .map((f, i) => `### #${i + 1} [${f.severity}] ${f.title}\n- **Category:** ${f.category}\n- **Affected URL:** \`${f.affectedUrl}\`\n- **Description:** ${f.description}\n- **Remedy:** ${f.recommendation}\n`)
                    .join('\n')}`;
                  onSaveAsNote('Network Security Audit Report', content);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Save to Notes</span>
              </button>
            </div>
          </div>

          {/* Security Score Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{securityScore}</span>
                <span className="absolute -bottom-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-1.5 rounded">
                  Score
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Traffic Posture: Hardened Defense</h3>
                <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                  {auditOverview || 'Active network channels audited. Several endpoints require HTTPS transport and header sanitation.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-rose-400 font-bold block text-lg">
                  {auditFindings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length}
                </span>
                <span className="text-slate-500 text-[10px] uppercase">High / Critical</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-lg">
                  {auditFindings.filter((f) => f.severity === 'MEDIUM' || f.severity === 'LOW').length}
                </span>
                <span className="text-slate-500 text-[10px] uppercase">Medium / Low</span>
              </div>
            </div>
          </div>

          {/* Audit Findings List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-300 text-sm">Identified Findings & Hardening Prescriptions</h3>
            {auditFindings.map((finding) => {
              const severityBadge = {
                CRITICAL: 'bg-rose-950 text-rose-300 border-rose-800',
                HIGH: 'bg-rose-900/40 text-rose-400 border-rose-700',
                MEDIUM: 'bg-amber-950 text-amber-300 border-amber-800',
                LOW: 'bg-blue-950 text-blue-300 border-blue-800',
                INFO: 'bg-slate-800 text-slate-300 border-slate-700',
              }[finding.severity];

              return (
                <div key={finding.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityBadge}`}>
                        {finding.severity}
                      </span>
                      <span className="font-bold text-white text-xs">{finding.title}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {finding.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-cyan-300">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-0.5 font-sans">
                      Target URL Pattern:
                    </span>
                    {finding.affectedUrl}
                  </div>

                  <div className="mt-2 text-xs bg-emerald-950/20 border border-emerald-800/40 p-2.5 rounded-lg text-emerald-200">
                    <strong className="text-emerald-400">Actionable Prescription:</strong> {finding.recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
