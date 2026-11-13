import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  GitCompare,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  RotateCw,
  Plus,
  Minus,
  Split,
  Globe,
  Code2,
  Layers,
  AlignLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  Bookmark
} from 'lucide-react';
import { Tab, SemanticDiffResult } from '../../types';
import { runSemanticDiff, scrapeWebpage } from '../../services/api';

interface SemanticDiffViewProps {
  tabs: Tab[];
  activeTab?: Tab;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl?: (url: string) => void;
}

type DiffSourceMode = 'tabs' | 'urls' | 'raw';
type DiffVisualMode = 'ai' | 'split' | 'unified';

interface DiffLine {
  type: 'equal' | 'add' | 'remove';
  text: string;
  leftLineNum: number | null;
  rightLineNum: number | null;
}

interface DiffPreset {
  id: string;
  label: string;
  leftTitle: string;
  rightTitle: string;
  leftText: string;
  rightText: string;
}

const DIFF_PRESETS: DiffPreset[] = [
  {
    id: 'api-v2',
    label: 'REST API v1 -> v2 Schema',
    leftTitle: 'Payment Gateway API v1.4',
    rightTitle: 'Payment Gateway API v2.0',
    leftText: `{
  "apiVersion": "1.4.0",
  "authMethod": "API_KEY_QUERY",
  "endpoint": "/api/v1/charges",
  "rateLimit": {
    "requestsPerMinute": 60,
    "burst": false
  },
  "payload": {
    "amount": "number (float USD)",
    "currency": "string",
    "cardToken": "string"
  },
  "webhooks": {
    "signing": "none",
    "retries": 1
  }
}`,
    rightText: `{
  "apiVersion": "2.0.0",
  "authMethod": "OAUTH2_BEARER_PKCE",
  "endpoint": "/api/v2/payment-intents",
  "idempotencyKeyRequired": true,
  "rateLimit": {
    "requestsPerMinute": 600,
    "burst": true
  },
  "payload": {
    "amountCents": "integer (ISO 4217 minor units)",
    "currency": "string (ISO-4217)",
    "paymentMethodId": "string"
  },
  "webhooks": {
    "signing": "HMAC-SHA256",
    "retries": 5,
    "exponentialBackoff": true
  }
}`
  },
  {
    id: 'react-19',
    label: 'React 18 -> React 19 Compiler',
    leftTitle: 'Frontend Architecture (React 18)',
    rightTitle: 'Frontend Architecture (React 19)',
    leftText: `# Frontend Component Pattern (React 18)
- Manual memoization required via useMemo, useCallback, and React.memo
- Forwarding refs requires React.forwardRef wrapper boilerplate
- Form submissions tracked via manual isSubmitting useState flags
- Context consumed via useContext(ThemeContext) inside component body
- Metadata tags managed externally via react-helmet-async`,
    rightText: `# Frontend Component Pattern (React 19)
- Automatic build-time memoization via React Compiler (zero manual useMemo)
- Direct ref prop support on functional components (forwardRef deprecated)
- Native async form Actions with useActionState and useOptimistic hooks
- Conditional context & promise reading via unified use() API
- Native Document Metadata (<title>, <meta>) hoisted automatically to <head>`
  },
  {
    id: 'sla-terms',
    label: 'Enterprise SLA & Privacy Revision',
    leftTitle: 'Cloud Terms of Service (2025)',
    rightTitle: 'Cloud Terms of Service (2026)',
    leftText: `1. Uptime Commitment: 99.9% monthly availability target.
2. Data Retention: Customer logs retained for 365 days across regional backups.
3. AI Training Policy: Anonymized telemetry may be used to improve diagnostic models unless opted out.
4. Incident Notification: Critical security events disclosed within 72 hours.
5. Arbitration: Disputes resolved exclusively in Delaware Chancery jurisdiction.`,
    rightText: `1. Uptime Commitment: 99.99% monthly availability target with automatic 25% SLA credit.
2. Data Retention: Zero-knowledge ephemeral processing; customer logs purged after 30 days by default.
3. AI Training Policy: Zero-training guarantee — customer prompts and payloads are strictly excluded from model training.
4. Incident Notification: Real-time security webhook alert within 4 hours of confirmed anomaly.
5. Compliance: Full GDPR, SOC2 Type II, and EU AI Act High-Risk conformity attestation.`
  },
  {
    id: 'security-tls',
    label: 'TLS 1.2 -> Post-Quantum Policy',
    leftTitle: 'Legacy Edge Gateway Config',
    rightTitle: 'Zero-Trust Quantum Gateway Config',
    leftText: `ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
add_header X-Frame-Options SAMEORIGIN;
add_header Access-Control-Allow-Origin *;
session_cookie SameSite=Lax;`,
    rightText: `ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519Kyber768Draft00:X25519;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none';";
add_header X-Frame-Options DENY;
session_cookie Secure; HttpOnly; SameSite=Strict; Partitioned;`
  }
];

// Longest Common Subsequence (LCS) line diff algorithm
function computeLineDiff(leftText: string, rightText: string): DiffLine[] {
  const leftLines = leftText.replace(/\r\n/g, '\n').split('\n');
  const rightLines = rightText.replace(/\r\n/g, '\n').split('\n');

  const n = leftLines.length;
  const m = rightLines.length;

  // Guard for very large inputs to keep UI instant
  if (n * m > 250000) {
    const result: DiffLine[] = [];
    const maxLen = Math.max(n, m);
    for (let i = 0; i < maxLen; i++) {
      if (i < n && i < m && leftLines[i] === rightLines[i]) {
        result.push({ type: 'equal', text: leftLines[i], leftLineNum: i + 1, rightLineNum: i + 1 });
      } else {
        if (i < n) result.push({ type: 'remove', text: leftLines[i], leftLineNum: i + 1, rightLineNum: null });
        if (i < m) result.push({ type: 'add', text: rightLines[i], leftLineNum: null, rightLineNum: i + 1 });
      }
    }
    return result;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (leftLines[i] === rightLines[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let leftNum = 1;
  let rightNum = 1;

  while (i < n && j < m) {
    if (leftLines[i] === rightLines[j]) {
      diff.push({ type: 'equal', text: leftLines[i], leftLineNum: leftNum++, rightLineNum: rightNum++ });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: 'remove', text: leftLines[i], leftLineNum: leftNum++, rightLineNum: null });
      i++;
    } else {
      diff.push({ type: 'add', text: rightLines[j], leftLineNum: null, rightLineNum: rightNum++ });
      j++;
    }
  }

  while (i < n) {
    diff.push({ type: 'remove', text: leftLines[i], leftLineNum: leftNum++, rightLineNum: null });
    i++;
  }
  while (j < m) {
    diff.push({ type: 'add', text: rightLines[j], leftLineNum: null, rightLineNum: rightNum++ });
    j++;
  }

  return diff;
}

export const SemanticDiffView: React.FC<SemanticDiffViewProps> = ({
  tabs,
  onSaveAsNote,
}) => {
  const [sourceMode, setSourceMode] = useState<DiffSourceMode>(tabs.length >= 2 ? 'tabs' : 'raw');
  const [diffMode, setDiffMode] = useState<DiffVisualMode>('ai');

  // Tab mode state
  const [leftTabId, setLeftTabId] = useState<string>(tabs[0]?.id || '');
  const [rightTabId, setRightTabId] = useState<string>(
    tabs.length > 1 ? tabs[1]?.id : tabs[0]?.id || ''
  );

  // Live URL fetch mode state
  const [leftUrl, setLeftUrl] = useState<string>('https://news.ycombinator.com');
  const [rightUrl, setRightUrl] = useState<string>('https://github.com/trending');
  const [fetchedLeftTitle, setFetchedLeftTitle] = useState<string>('Baseline URL');
  const [fetchedRightTitle, setFetchedRightTitle] = useState<string>('Target URL');
  const [fetchedLeftText, setFetchedLeftText] = useState<string>('');
  const [fetchedRightText, setFetchedRightText] = useState<string>('');
  const [isFetchingUrls, setIsFetchingUrls] = useState<boolean>(false);

  // Raw / Code input mode state (pre-seeded with meaningful example)
  const [leftRawTitle, setLeftRawTitle] = useState<string>(DIFF_PRESETS[0].leftTitle);
  const [rightRawTitle, setRightRawTitle] = useState<string>(DIFF_PRESETS[0].rightTitle);
  const [leftCustomText, setLeftCustomText] = useState<string>(DIFF_PRESETS[0].leftText);
  const [rightCustomText, setRightCustomText] = useState<string>(DIFF_PRESETS[0].rightText);

  // Visual diff toggles
  const [hideUnchanged, setHideUnchanged] = useState<boolean>(false);
  const [isRunningDiff, setIsRunningDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<SemanticDiffResult | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const leftTab = tabs.find((t) => t.id === leftTabId);
  const rightTab = tabs.find((t) => t.id === rightTabId);

  // Resolve current left/right text and titles based on active sourceMode
  const activeSides = useMemo(() => {
    if (sourceMode === 'tabs') {
      return {
        leftTitle: leftTab?.title || 'Baseline Tab',
        rightTitle: rightTab?.title || 'Comparison Tab',
        leftText: leftTab?.pdfData?.text || leftTab?.extractedText || leftTab?.metaDescription || '',
        rightText: rightTab?.pdfData?.text || rightTab?.extractedText || rightTab?.metaDescription || '',
      };
    }
    if (sourceMode === 'urls') {
      return {
        leftTitle: fetchedLeftTitle || leftUrl,
        rightTitle: fetchedRightTitle || rightUrl,
        leftText: fetchedLeftText,
        rightText: fetchedRightText,
      };
    }
    return {
      leftTitle: leftRawTitle || 'Baseline A',
      rightTitle: rightRawTitle || 'Revision B',
      leftText: leftCustomText,
      rightText: rightCustomText,
    };
  }, [
    sourceMode,
    leftTab,
    rightTab,
    fetchedLeftTitle,
    fetchedRightTitle,
    fetchedLeftText,
    fetchedRightText,
    leftUrl,
    rightUrl,
    leftRawTitle,
    rightRawTitle,
    leftCustomText,
    rightCustomText,
  ]);

  // Algorithmic line-by-line LCS diff & quantitative telemetry
  const lineDiff = useMemo(() => {
    return computeLineDiff(activeSides.leftText, activeSides.rightText);
  }, [activeSides.leftText, activeSides.rightText]);

  const diffMetrics = useMemo(() => {
    const added = lineDiff.filter((l) => l.type === 'add').length;
    const removed = lineDiff.filter((l) => l.type === 'remove').length;
    const equal = lineDiff.filter((l) => l.type === 'equal').length;
    const total = Math.max(added + removed + equal, 1);
    const similarity = Math.round((equal / total) * 100);
    const drift = 100 - similarity;
    return { added, removed, equal, similarity, drift };
  }, [lineDiff]);

  const displayedDiffLines = useMemo(() => {
    if (!hideUnchanged) return lineDiff;
    return lineDiff.filter((l) => l.type !== 'equal');
  }, [lineDiff, hideUnchanged]);

  const unifiedPatchText = useMemo(() => {
    const header = `--- ${activeSides.leftTitle}\n+++ ${activeSides.rightTitle}\n@@ -1,${activeSides.leftText.split('\n').length} +1,${activeSides.rightText.split('\n').length} @@\n`;
    const body = lineDiff
      .map((line) => {
        if (line.type === 'add') return `+ ${line.text}`;
        if (line.type === 'remove') return `- ${line.text}`;
        return `  ${line.text}`;
      })
      .join('\n');
    return header + body;
  }, [lineDiff, activeSides]);

  const handleSwapSides = () => {
    if (sourceMode === 'tabs') {
      const temp = leftTabId;
      setLeftTabId(rightTabId);
      setRightTabId(temp);
    } else if (sourceMode === 'urls') {
      const tempUrl = leftUrl;
      setLeftUrl(rightUrl);
      setRightUrl(tempUrl);
      const tempText = fetchedLeftText;
      setFetchedLeftText(fetchedRightText);
      setFetchedRightText(tempText);
      const tempTitle = fetchedLeftTitle;
      setFetchedLeftTitle(fetchedRightTitle);
      setFetchedRightTitle(tempTitle);
    } else {
      const tempTitle = leftRawTitle;
      setLeftRawTitle(rightRawTitle);
      setRightRawTitle(tempTitle);
      const tempText = leftCustomText;
      setLeftCustomText(rightCustomText);
      setRightCustomText(tempText);
    }
  };

  const handleLoadPreset = (preset: DiffPreset) => {
    setSourceMode('raw');
    setLeftRawTitle(preset.leftTitle);
    setRightRawTitle(preset.rightTitle);
    setLeftCustomText(preset.leftText);
    setRightCustomText(preset.rightText);
    setDiffResult(null);
    setDiffError(null);
  };

  const handleFetchAndCompareUrls = async () => {
    if (!leftUrl.trim() || !rightUrl.trim()) return;
    setIsFetchingUrls(true);
    setDiffError(null);
    try {
      const [resA, resB] = await Promise.all([
        scrapeWebpage(leftUrl.trim()),
        scrapeWebpage(rightUrl.trim()),
      ]);
      const titleA = resA.title || leftUrl;
      const titleB = resB.title || rightUrl;
      const textA = resA.textContent || resA.metaDescription || '';
      const textB = resB.textContent || resB.metaDescription || '';

      setFetchedLeftTitle(titleA);
      setFetchedRightTitle(titleB);
      setFetchedLeftText(textA);
      setFetchedRightText(textB);

      setIsRunningDiff(true);
      const semantic = await runSemanticDiff(titleA, textA, titleB, textB);
      setDiffResult(semantic);
    } catch (err: any) {
      setDiffError(err.message || 'Failed to fetch target URLs for comparison');
    } finally {
      setIsFetchingUrls(false);
      setIsRunningDiff(false);
    }
  };

  const handleRunDiff = async () => {
    if (sourceMode === 'urls' && (!fetchedLeftText || !fetchedRightText)) {
      await handleFetchAndCompareUrls();
      return;
    }

    setIsRunningDiff(true);
    setDiffResult(null);
    setDiffError(null);

    try {
      const res = await runSemanticDiff(
        activeSides.leftTitle,
        activeSides.leftText || 'No content provided',
        activeSides.rightTitle,
        activeSides.rightText || 'No content provided'
      );
      setDiffResult(res);
    } catch (err: any) {
      setDiffError(err.message || 'Semantic diff analysis encountered an error');
    } finally {
      setIsRunningDiff(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyMarkdown = () => {
    if (!diffResult) return;
    const md = `# Semantic Diff Report: ${diffResult.leftTitle} vs ${diffResult.rightTitle}
**Change Magnitude:** ${diffResult.changeLevel}
**Structural Similarity:** ${diffMetrics.similarity}% (+${diffMetrics.added} / -${diffMetrics.removed} lines)
**Tactical Verdict:** ${diffResult.tacticalVerdict}

## Executive Summary
${diffResult.executiveSummary}

## Key Additions
${diffResult.additions.map((a) => `- [ADDED] ${a}`).join('\n')}

## Key Removals
${diffResult.removals.map((r) => `- [REMOVED] ${r}`).join('\n')}

## Modifications
${diffResult.modifications.map((m) => `- **${m.aspect}**: Before: "${m.before}" -> After: "${m.after}"`).join('\n')}
`;
    handleCopy(md, 'markdown');
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([unifiedPatchText], { type: 'text/x-diff' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-semantic-diff-${Date.now()}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToNotes = () => {
    if (!diffResult || !onSaveAsNote) return;
    const content = `### Executive Summary\n${diffResult.executiveSummary}\n\n### Tactical Verdict\n${diffResult.tacticalVerdict}\n\n### Quantitative Structural Delta\n- **Similarity:** ${diffMetrics.similarity}%\n- **Lines Added:** +${diffMetrics.added}\n- **Lines Removed:** -${diffMetrics.removed}\n\n### Additions\n${diffResult.additions.map((a) => `- ${a}`).join('\n')}\n\n### Modifications\n${diffResult.modifications.map((m) => `- **${m.aspect}**: ${m.before} -> ${m.after}`).join('\n')}`;
    onSaveAsNote(`Diff: ${diffResult.leftTitle} vs ${diffResult.rightTitle}`, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-text">
      {/* 1. Clean Professional Top Header */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <h1 className="font-bold tracking-tight text-white truncate">
                Semantic &amp; Structural Diff Studio
              </h1>
              <span className="text-slate-600 hidden sm:inline" aria-hidden="true">&middot;</span>
              <span className="text-xs text-cyan-400 font-medium hidden sm:inline">
                LCS + AI Delta Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              Compare open tabs, live URLs, schemas, or contracts with line-level LCS diffing and AI impact analysis
            </p>
          </div>
        </div>

        {/* Visualization Mode Switcher & Source Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'ai', label: 'AI Semantic Delta', icon: Sparkles },
              { id: 'split', label: 'Split Line Diff', icon: Split },
              { id: 'unified', label: 'Unified Patch', icon: AlignLeft },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setDiffMode(mode.id as DiffVisualMode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    diffMode === mode.id
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Source Mode & Presets Bar */}
      <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Source Selector Tabs */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setSourceMode('tabs')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceMode === 'tabs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Open Tabs ({tabs.length})</span>
            </button>
            <button
              onClick={() => setSourceMode('urls')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceMode === 'urls' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Live URLs</span>
            </button>
            <button
              onClick={() => setSourceMode('raw')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceMode === 'raw' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3 h-3 text-indigo-400" />
              <span>Raw / Code</span>
            </button>
          </div>

          {/* Preset Scenarios */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Presets:
            </span>
            {DIFF_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Structural Delta Summary Metrics */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            Similarity: <strong className="text-slate-200">{diffMetrics.similarity}%</strong>
          </span>
          <span className="text-emerald-400">+{diffMetrics.added}</span>
          <span className="text-rose-400">-{diffMetrics.removed}</span>
          <button
            onClick={handleDownloadPatch}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-sans text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            title="Download Unified .patch File"
          >
            <Download className="w-3 h-3" />
            <span>.patch</span>
          </button>
        </div>
      </div>

      {/* 3. Target Selector Toolbar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        {sourceMode === 'tabs' && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Baseline (A):
              </span>
              <select
                value={leftTabId}
                onChange={(e) => setLeftTabId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || t.url}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwapSides}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer shrink-0"
              title="Swap Baseline and Revision"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Revision (B):
              </span>
              <select
                value={rightTabId}
                onChange={(e) => setRightTabId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || t.url}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {sourceMode === 'urls' && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
            <input
              type="text"
              value={leftUrl}
              onChange={(e) => setLeftUrl(e.target.value)}
              placeholder="Baseline URL (https://...)"
              className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSwapSides}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer shrink-0"
              title="Swap URLs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              value={rightUrl}
              onChange={(e) => setRightUrl(e.target.value)}
              placeholder="Comparison URL (https://...)"
              className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {sourceMode === 'raw' && (
          <div className="flex items-center gap-2 text-xs text-slate-300 flex-1">
            <span className="font-semibold text-white">{leftRawTitle}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-cyan-300">{rightRawTitle}</span>
            <button
              onClick={handleSwapSides}
              className="ml-2 p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              title="Swap A and B"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {diffMode !== 'ai' && (
            <button
              onClick={() => setHideUnchanged((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                hideUnchanged
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {hideUnchanged ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideUnchanged ? 'Showing Changes Only' : 'Hide Unchanged'}</span>
            </button>
          )}

          <button
            onClick={sourceMode === 'urls' ? handleFetchAndCompareUrls : handleRunDiff}
            disabled={isRunningDiff || isFetchingUrls}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunningDiff || isFetchingUrls ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>
              {isFetchingUrls
                ? 'Fetching URLs...'
                : isRunningDiff
                ? 'Analyzing Diff...'
                : sourceMode === 'urls'
                ? 'Fetch & Run Semantic Diff'
                : 'Run Semantic Diff'}
            </span>
          </button>
        </div>
      </div>

      {/* Optional Raw Text / Code Editor Split when in Raw mode and viewing AI mode */}
      {sourceMode === 'raw' && diffMode === 'ai' && (
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-800 bg-slate-950 h-44 shrink-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between text-[11px]">
              <input
                type="text"
                value={leftRawTitle}
                onChange={(e) => setLeftRawTitle(e.target.value)}
                className="bg-transparent font-semibold text-rose-300 focus:outline-none w-2/3"
              />
              <span className="text-slate-500 font-mono">{leftCustomText.split('\n').length} lines</span>
            </div>
            <textarea
              value={leftCustomText}
              onChange={(e) => setLeftCustomText(e.target.value)}
              placeholder="Paste Baseline version A text, JSON, or code..."
              className="flex-1 w-full bg-transparent p-3 font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between text-[11px]">
              <input
                type="text"
                value={rightRawTitle}
                onChange={(e) => setRightRawTitle(e.target.value)}
                className="bg-transparent font-semibold text-emerald-300 focus:outline-none w-2/3"
              />
              <span className="text-slate-500 font-mono">{rightCustomText.split('\n').length} lines</span>
            </div>
            <textarea
              value={rightCustomText}
              onChange={(e) => setRightCustomText(e.target.value)}
              placeholder="Paste Revision version B text, JSON, or code..."
              className="flex-1 w-full bg-transparent p-3 font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {diffError && (
        <div className="px-6 py-2.5 bg-rose-950/60 border-b border-rose-800/60 text-xs text-rose-200 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{diffError}</span>
        </div>
      )}

      {/* 4. Main Diff Output Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: AI SEMANTIC DELTA */}
        {diffMode === 'ai' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6 w-full">
            {diffResult ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Structural Telemetry Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Change Magnitude</span>
                    <div
                      className={`text-sm font-bold mt-1 ${
                        diffResult.changeLevel === 'Major Shift'
                          ? 'text-rose-400'
                          : diffResult.changeLevel === 'Moderate Revision'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {diffResult.changeLevel}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Structural Similarity</span>
                    <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">{diffMetrics.similarity}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Lines Added</span>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">+{diffMetrics.added}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Lines Removed</span>
                    <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">-{diffMetrics.removed}</div>
                  </div>
                </div>

                {/* Executive Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{diffResult.leftTitle}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-cyan-300">{diffResult.rightTitle}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyMarkdown}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'markdown' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'markdown' ? 'Copied' : 'Copy Report'}</span>
                      </button>

                      {onSaveAsNote && (
                        <button
                          onClick={handleSaveToNotes}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {saved ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                          <span>{saved ? 'Saved to Notes' : 'Save Note'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{diffResult.executiveSummary}</p>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-200 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">Tactical Verdict:</span>
                    <span className="leading-relaxed">{diffResult.tacticalVerdict}</span>
                  </div>
                </div>

                {/* Additions & Removals Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                      <Plus className="w-4 h-4" />
                      <span>Key Additions &amp; Advancements</span>
                    </div>
                    <ul className="space-y-2">
                      {diffResult.additions.map((add, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/15"
                        >
                          <span className="text-emerald-400 font-bold shrink-0">+</span>
                          <span className="leading-relaxed">{add}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-slate-800 pb-2">
                      <Minus className="w-4 h-4" />
                      <span>Omissions &amp; Deprecations</span>
                    </div>
                    <ul className="space-y-2">
                      {diffResult.removals.map((rem, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 flex items-start gap-2 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/15"
                        >
                          <span className="text-rose-400 font-bold shrink-0">-</span>
                          <span className="leading-relaxed">{rem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Modifications Table */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <RotateCw className="w-4 h-4 text-cyan-400" />
                    <span>Specification &amp; Metric Shifts</span>
                  </div>

                  <div className="space-y-2.5">
                    {diffResult.modifications.map((mod, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="font-semibold text-cyan-300">{mod.aspect}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-200">
                            <span className="text-[10px] font-bold text-rose-400 block uppercase mb-0.5">
                              Before (Baseline)
                            </span>
                            {mod.before}
                          </div>
                          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-400 block uppercase mb-0.5">
                              After (Revision)
                            </span>
                            {mod.after}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <GitCompare className="w-10 h-10 mb-3 text-cyan-400 opacity-70" />
                <h3 className="text-sm font-bold text-white mb-1">
                  Ready to compute semantic &amp; structural diff
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
                  Analyze specifications, API schemas, pricing contracts, or live webpages. Switch to{' '}
                  <strong className="text-slate-200">Split Line Diff</strong> or{' '}
                  <strong className="text-slate-200">Unified Patch</strong> at any time for instant LCS line comparison.
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={sourceMode === 'urls' ? handleFetchAndCompareUrls : handleRunDiff}
                    disabled={isRunningDiff || isFetchingUrls}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Run AI Semantic Diff
                  </button>
                  <button
                    onClick={() => setDiffMode('split')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Inspect Line-by-Line Diff
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ALGORITHMIC SPLIT LINE DIFF */}
        {diffMode === 'split' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-900/70 text-xs font-mono shrink-0 divide-x divide-slate-800">
              <div className="px-4 py-2 flex items-center justify-between text-rose-300 font-semibold">
                <span className="truncate">Baseline A: {activeSides.leftTitle}</span>
                <span className="text-[11px] text-rose-400">-{diffMetrics.removed} lines</span>
              </div>
              <div className="px-4 py-2 flex items-center justify-between text-emerald-300 font-semibold">
                <span className="truncate">Revision B: {activeSides.rightTitle}</span>
                <span className="text-[11px] text-emerald-400">+{diffMetrics.added} lines</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs divide-y divide-slate-900/50">
              {displayedDiffLines.length === 0 ? (
                <div className="py-16 text-center text-slate-500 font-sans">
                  No line differences detected between Baseline A and Revision B.
                </div>
              ) : (
                displayedDiffLines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-2 divide-x divide-slate-800/80">
                    {/* Left Half */}
                    <div
                      className={`flex items-start px-3 py-1 ${
                        line.type === 'remove'
                          ? 'bg-rose-950/35 text-rose-200'
                          : line.type === 'add'
                          ? 'bg-slate-900/20 text-slate-600'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-8 shrink-0 text-[10px] text-slate-500 select-none text-right pr-2 pt-0.5">
                        {line.leftLineNum ?? ''}
                      </span>
                      <span className="w-4 shrink-0 select-none font-bold">
                        {line.type === 'remove' ? '-' : ''}
                      </span>
                      <span className="whitespace-pre-wrap break-all leading-relaxed">
                        {line.type === 'add' ? '' : line.text}
                      </span>
                    </div>

                    {/* Right Half */}
                    <div
                      className={`flex items-start px-3 py-1 ${
                        line.type === 'add'
                          ? 'bg-emerald-950/35 text-emerald-200'
                          : line.type === 'remove'
                          ? 'bg-slate-900/20 text-slate-600'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-8 shrink-0 text-[10px] text-slate-500 select-none text-right pr-2 pt-0.5">
                        {line.rightLineNum ?? ''}
                      </span>
                      <span className="w-4 shrink-0 select-none font-bold">
                        {line.type === 'add' ? '+' : ''}
                      </span>
                      <span className="whitespace-pre-wrap break-all leading-relaxed">
                        {line.type === 'remove' ? '' : line.text}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: UNIFIED PATCH VIEW */}
        {diffMode === 'unified' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between text-xs shrink-0">
              <span className="font-mono text-slate-300 font-semibold">
                Unified Diff Patch ({activeSides.leftTitle} &rarr; {activeSides.rightTitle})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(unifiedPatchText, 'patch')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  {copiedKey === 'patch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'patch' ? 'Copied Patch' : 'Copy Patch'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
              <div className="text-slate-400 pb-2 border-b border-slate-800 mb-2">
                <div>--- {activeSides.leftTitle}</div>
                <div>+++ {activeSides.rightTitle}</div>
                <div className="text-cyan-400">
                  @@ -1,{activeSides.leftText.split('\n').length} +1,{activeSides.rightText.split('\n').length} @@
                </div>
              </div>

              {displayedDiffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded ${
                    line.type === 'add'
                      ? 'bg-emerald-950/35 text-emerald-300'
                      : line.type === 'remove'
                      ? 'bg-rose-950/35 text-rose-300'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-8 shrink-0 text-[10px] text-slate-600 select-none text-right pr-2">
                    {line.leftLineNum ?? ' '}
                  </span>
                  <span className="w-8 shrink-0 text-[10px] text-slate-600 select-none text-right pr-2">
                    {line.rightLineNum ?? ' '}
                  </span>
                  <span className="w-4 shrink-0 font-bold select-none">
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all leading-relaxed">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
