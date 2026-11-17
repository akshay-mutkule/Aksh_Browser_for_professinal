import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  Terminal,
  Eye,
  Stethoscope,
  Activity,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Table2,
  Zap,
  GitCompare,
  X,
  Monitor,
  Tablet,
  Smartphone,
  BookmarkPlus
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Tab } from '../../types';
import { sendAIChat } from '../../services/api';
import {
  executeJsInWorker,
  executeSqlStatements,
  executePythonInPyodide,
  SqlResultSet,
} from '../../utils/sandboxEngines';

interface CodeSandboxViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl: (url: string) => void;
}

type SandboxLanguage = 'html' | 'js' | 'python' | 'sql';
type OutputTabMode = 'preview' | 'table' | 'console' | 'doctor';
type ViewportSize = 'full' | 'tablet' | 'mobile';

interface TemplateOption {
  id: string;
  title: string;
  lang: SandboxLanguage;
  desc: string;
  code: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'neural-canvas',
    title: 'Particle Network (HTML5 Canvas)',
    lang: 'html',
    desc: 'Interactive HTML5 2D particle network responding to pointer motion',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #020617; overflow: hidden; font-family: system-ui, sans-serif; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .hint { position: absolute; top: 14px; left: 16px; color: #94a3b8; font-size: 12px; pointer-events: none; }
  </style>
</head>
<body>
  <div class="hint">Move pointer across canvas to interact</div>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = [];
    let mouse = { x: w / 2, y: h / 2, active: false };

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    for (let i = 0; i < 85; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        radius: Math.random() * 2 + 1,
        color: ['#38bdf8', '#818cf8', '#34d399'][i % 3]
      });
    }

    console.log('Initialized ' + particles.length + ' interactive nodes');

    function animate() {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0) {
            p.x -= (dx / dist) * 1.8;
            p.y -= (dy / dist) * 1.8;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 105) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(148, 163, 184, ' + ((1 - d / 105) * 0.45) + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`,
  },
  {
    id: 'metrics-card',
    title: 'Responsive System Dashboard (Tailwind)',
    lang: 'html',
    desc: 'Responsive editorial metrics card built with utility styles',
    code: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-6 antialiased">
  <div class="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <div class="text-xs text-slate-500">Cluster · us-east-1</div>
        <h2 class="text-lg font-semibold text-slate-900">Inference Throughput</h2>
      </div>
      <div id="clock" class="text-xs font-mono text-slate-500"></div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div class="text-xs text-slate-500">P99 Latency</div>
        <div class="text-xl font-semibold text-slate-900 font-mono mt-1">14.2 ms</div>
      </div>
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div class="text-xs text-slate-500">Token Velocity</div>
        <div class="text-xl font-semibold text-cyan-700 font-mono mt-1">192 tok/s</div>
      </div>
    </div>

    <button id="pingBtn" class="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer transition-colors">
      Run Health Check
    </button>
    <div id="status" class="text-xs text-slate-600 text-center">Ready</div>
  </div>
  <script>
    const clock = document.getElementById('clock');
    clock.textContent = new Date().toLocaleTimeString();
    document.getElementById('pingBtn').addEventListener('click', () => {
      const ms = (Math.random() * 8 + 4).toFixed(1);
      document.getElementById('status').textContent = '200 OK · Verified in ' + ms + ' ms';
      console.log('Health check passed in ' + ms + 'ms');
    });
  </script>
</body>
</html>`,
  },
  {
    id: 'js-worker-algo',
    title: 'Cosine Similarity & Vector Search (JS)',
    lang: 'js',
    desc: 'Runs in an isolated Web Worker with real async/console support',
    code: `// Sandboxed Web Worker JavaScript Runtime
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const queryVector = [0.82, 0.14, 0.55, 0.09];
const documents = [
  { id: 'doc-1', title: 'Attention Mechanisms', vec: [0.79, 0.18, 0.58, 0.11] },
  { id: 'doc-2', title: 'PostgreSQL B-Tree Index', vec: [0.12, 0.91, 0.08, 0.39] },
  { id: 'doc-3', title: 'Sparse Mixture of Experts', vec: [0.74, 0.21, 0.62, 0.14] },
];

const ranked = documents
  .map((doc) => ({
    id: doc.id,
    title: doc.title,
    similarity: Number(cosineSimilarity(queryVector, doc.vec).toFixed(4)),
  }))
  .sort((a, b) => b.similarity - a.similarity);

console.log('Top semantic matches:');
console.table(ranked);
return ranked[0];`,
  },
  {
    id: 'python-algo',
    title: 'Scaled Dot-Product Attention (Python)',
    lang: 'python',
    desc: 'Executes in genuine CPython 3.12 WebAssembly (Pyodide)',
    code: `# Genuine CPython 3.12 WebAssembly Execution
import math

def scaled_dot_product_attention(Q, K, V, d_k):
    print(f"Query matrix: {len(Q)}x{len(Q[0])} | sqrt(d_k) = {math.sqrt(d_k):.4f}")
    scores = []
    for q_row in Q:
        row_scores = []
        for k_row in K:
            dot = sum(q * k for q, k in zip(q_row, k_row))
            row_scores.append(dot / math.sqrt(d_k))
        scores.append(row_scores)

    weights = []
    for row in scores:
        exp_row = [math.exp(val) for val in row]
        total = sum(exp_row)
        weights.append([round(val / total, 4) for val in exp_row])
    return weights

Q = [[0.2, 0.8, -0.1, 0.4], [0.5, 0.1, 0.9, -0.2], [-0.3, 0.4, 0.6, 0.1]]
K = [[0.1, 0.7, -0.2, 0.5], [0.4, 0.2, 0.8, -0.1], [-0.1, 0.3, 0.5, 0.2]]
V = [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]

attn = scaled_dot_product_attention(Q, K, V, d_k=4)
for idx, row in enumerate(attn):
    print(f"Token {idx + 1} weights -> {row}")`,
  },
  {
    id: 'sql-db',
    title: 'Knowledge Graph & Entities Query (SQL)',
    lang: 'sql',
    desc: 'Real in-memory relational engine supporting JOIN, WHERE, ORDER BY, Aggregates',
    code: `-- Real In-Memory Relational SQL Engine
CREATE TABLE IF NOT EXISTS browser_tabs (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    domain TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS neural_entities (
    id INTEGER PRIMARY KEY,
    tab_id TEXT,
    entity_name TEXT NOT NULL,
    category TEXT,
    confidence_score REAL
);

INSERT INTO browser_tabs (id, url, title, domain) VALUES
('tab-1', 'https://arxiv.org/abs/2601.1299', 'Quantum Qubit Error Mitigation', 'arxiv.org'),
('tab-2', 'https://github.com/google/genai', 'Gemini TypeScript SDK', 'github.com');

INSERT INTO neural_entities (tab_id, entity_name, category, confidence_score) VALUES
('tab-1', 'Topological Surface Code', 'tech', 0.99),
('tab-1', 'Google Quantum AI', 'org', 0.96),
('tab-2', '@google/genai', 'tech', 0.98),
('tab-2', 'Gemini 3.7 Flash', 'tech', 0.99);

SELECT
    t.title,
    t.domain,
    e.entity_name,
    e.category,
    e.confidence_score
FROM browser_tabs t
JOIN neural_entities e ON t.id = e.tab_id
WHERE e.confidence_score >= 0.96
ORDER BY e.confidence_score DESC;`,
  },
];

export const CodeSandboxView: React.FC<CodeSandboxViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl: _onNavigateUrl,
}) => {
  const [lang, setLang] = useState<SandboxLanguage>('html');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [autoRunHtml, setAutoRunHtml] = useState<boolean>(true);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('full');

  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [sqlResults, setSqlResults] = useState<SqlResultSet[]>([]);
  const [lastExecDurationMs, setLastExecDurationMs] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<OutputTabMode>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Error Healing & Diff States
  const [lastDetectedError, setLastDetectedError] = useState<string | null>(null);
  const [isHealingError, setIsHealingError] = useState<boolean>(false);
  const [previousCode, setPreviousCode] = useState<string | null>(null);
  const [lastHealSummary, setLastHealSummary] = useState<string | null>(null);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const timestamp = () => new Date().toLocaleTimeString([], { hour12: false });

  // Execute Active Runtime
  const runCode = async (overrideLang?: SandboxLanguage, overrideCode?: string) => {
    const activeLang = overrideLang || lang;
    const activeSource = overrideCode !== undefined ? overrideCode : code;

    setLastDetectedError(null);
    setIsExecuting(true);

    if (activeLang === 'html') {
      const t0 = performance.now();
      if (iframeRef.current) {
        const injectedScript = `
          <script>
            (function() {
              const oldLog = console.log;
              const oldError = console.error;
              const oldWarn = console.warn;
              const fmt = (a) => {
                if (typeof a === 'object' && a !== null) {
                  try { return a.message || JSON.stringify(a); } catch { return String(a); }
                }
                return String(a);
              };
              console.log = function(...args) {
                window.parent.postMessage({ type: 'SANDBOX_LOG', msg: args.map(fmt).join(' ') }, '*');
                oldLog.apply(console, args);
              };
              console.warn = function(...args) {
                window.parent.postMessage({ type: 'SANDBOX_WARN', msg: args.map(fmt).join(' ') }, '*');
                oldWarn.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'SANDBOX_ERROR', msg: args.map(fmt).join(' ') }, '*');
                oldError.apply(console, args);
              };
              window.onerror = function(message, source, lineno, colno) {
                const detail = message + (lineno ? ' (Line ' + lineno + ':' + colno + ')' : '');
                window.parent.postMessage({ type: 'SANDBOX_ERROR', msg: detail }, '*');
                return false;
              };
              window.addEventListener('unhandledrejection', function(event) {
                const reason = event.reason ? (event.reason.message || String(event.reason)) : 'Promise Rejection';
                window.parent.postMessage({ type: 'SANDBOX_ERROR', msg: 'Unhandled Rejection: ' + reason }, '*');
              });
            })();
          </script>
        `;
        const fullDoc = activeSource.includes('<head>')
          ? activeSource.replace('<head>', `<head>${injectedScript}`)
          : `${injectedScript}${activeSource}`;

        iframeRef.current.srcdoc = fullDoc;
      }
      const dur = Math.round((performance.now() - t0) * 100) / 100;
      setLastExecDurationMs(dur);
      setConsoleLogs((prev) => [
        ...prev,
        `[${timestamp()}] Rendered HTML/CSS/JS frame in ${dur} ms`,
      ]);
      setIsExecuting(false);
    } else if (activeLang === 'js') {
      setActiveTabMode('console');
      setConsoleLogs([`[${timestamp()}] Running script in isolated Web Worker...`]);
      const res = await executeJsInWorker(activeSource);
      setLastExecDurationMs(res.durationMs);
      const nextLogs = res.logs.map((l) => {
        if (l.level === 'error') return `[ERROR]: ${l.text}`;
        if (l.level === 'warn') return `[WARN]: ${l.text}`;
        if (l.level === 'result') return `[RETURN] ${l.text}`;
        return l.text;
      });
      if (res.error) {
        nextLogs.push(`[ERROR]: ${res.error}`);
        setLastDetectedError(res.error);
      } else {
        nextLogs.push(`[OK] Finished in ${res.durationMs} ms`);
      }
      setConsoleLogs(nextLogs);
      setIsExecuting(false);
    } else if (activeLang === 'sql') {
      const output = executeSqlStatements(activeSource);
      setLastExecDurationMs(output.durationMs);
      setSqlResults(output.results);
      if (output.error) {
        setLastDetectedError(output.error);
        setActiveTabMode('console');
        setConsoleLogs([...output.logs, `[ERROR]: ${output.error}`]);
      } else {
        setActiveTabMode(output.results.length > 0 ? 'table' : 'console');
        setConsoleLogs([
          ...output.logs,
          `[OK] ${output.results.length} result set(s) computed in ${output.durationMs} ms`,
        ]);
      }
      setIsExecuting(false);
    } else if (activeLang === 'python') {
      setActiveTabMode('console');
      setConsoleLogs([`[${timestamp()}] Initializing CPython 3.12 WebAssembly (Pyodide)...`]);
      try {
        const res = await executePythonInPyodide(activeSource);
        setLastExecDurationMs(res.durationMs);
        const lines: string[] = [];
        if (res.stdout) {
          res.stdout
            .trimEnd()
            .split('\n')
            .forEach((l) => lines.push(l));
        }
        if (res.stderr) {
          lines.push(`[ERROR]: ${res.stderr}`);
          setLastDetectedError(res.stderr);
        } else {
          lines.push(`[OK] Exited 0 in ${res.durationMs} ms`);
        }
        setConsoleLogs(lines);
      } catch (err: any) {
        const msg = err?.message || 'Python WebAssembly execution failed.';
        setConsoleLogs([`[ERROR]: ${msg}`]);
        setLastDetectedError(msg);
      } finally {
        setIsExecuting(false);
      }
    }
  };

  // Load code snippet sent from active webpage or Neural HUD
  useEffect(() => {
    try {
      const pendingCode = localStorage.getItem('aksh_pending_sandbox_code');
      if (pendingCode) {
        localStorage.removeItem('aksh_pending_sandbox_code');
        let detected: SandboxLanguage = 'js';
        if (pendingCode.trim().startsWith('<') || pendingCode.includes('<!DOCTYPE') || pendingCode.includes('<html')) {
          detected = 'html';
        } else if (/\bSELECT\b|\bCREATE TABLE\b/i.test(pendingCode)) {
          detected = 'sql';
        } else if (/\bdef\s+\w+\(|import\s+\w+/.test(pendingCode) && !pendingCode.includes(';')) {
          detected = 'python';
        }
        setLang(detected);
        setCode(pendingCode);
        runCode(detected, pendingCode);
        return;
      }
    } catch {}
    runCode('html', TEMPLATES[0].code);
  }, []);

  // Debounced auto-run strictly for HTML preview when toggled on
  useEffect(() => {
    if (lang !== 'html' || !autoRunHtml) return;
    const handle = setTimeout(() => {
      runCode('html', code);
    }, 350);
    return () => clearTimeout(handle);
  }, [code, lang, autoRunHtml]);

  // Listen to console bridge from HTML iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'SANDBOX_LOG') {
        setConsoleLogs((prev) => [...prev, `[LOG] ${e.data.msg}`]);
      } else if (e.data.type === 'SANDBOX_WARN') {
        setConsoleLogs((prev) => [...prev, `[WARN] ${e.data.msg}`]);
      } else if (e.data.type === 'SANDBOX_ERROR') {
        const errMsg = e.data.msg;
        setConsoleLogs((prev) => [...prev, `[ERROR]: ${errMsg}`]);
        setLastDetectedError(errMsg);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleLanguageChange = (nextLang: SandboxLanguage) => {
    setLang(nextLang);
    const tpl = TEMPLATES.find((t) => t.lang === nextLang);
    if (tpl) {
      setSelectedTemplateId(tpl.id);
      setCode(tpl.code);
      setAiAnalysis(null);
      setLastDetectedError(null);
      if (nextLang === 'html') {
        setActiveTabMode('preview');
      } else if (nextLang === 'sql') {
        setActiveTabMode('table');
      } else {
        setActiveTabMode('console');
      }
      runCode(nextLang, tpl.code);
    }
  };

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setLang(tpl.lang);
    setCode(tpl.code);
    setAiAnalysis(null);
    setLastDetectedError(null);
    if (tpl.lang === 'html') setActiveTabMode('preview');
    else if (tpl.lang === 'sql') setActiveTabMode('table');
    else setActiveTabMode('console');
    runCode(tpl.lang, tpl.code);
  };

  // 1-Click AI Error Healing / Auto-Fix
  const handleAutoFixError = async (overrideError?: string) => {
    const errorTarget = overrideError || lastDetectedError;
    if (!errorTarget) return;

    setIsHealingError(true);
    try {
      const prompt = `You are a Senior Debugger repairing ${lang.toUpperCase()} code that threw the following error:

[ERROR]
${errorTarget}

[CODE]
\`\`\`${lang}
${code}
\`\`\`

Fix the issue cleanly. Format strictly as:
SUMMARY: <one sentence explaining the fix>
CODE:
<complete runnable repaired code without markdown backticks>`;

      const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
      const text = res.reply || '';

      const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=\nCODE:|$)/i);
      const summary = summaryMatch ? summaryMatch[1].trim() : 'Resolved syntax/runtime issue';

      const codeMatch = text.match(/CODE:\s*([\s\S]*)/i);
      let repairedCode = (codeMatch ? codeMatch[1] : text)
        .replace(/^```[a-z]*\n?/i, '')
        .replace(/```$/i, '')
        .trim();

      if (repairedCode) {
        setPreviousCode(code);
        setCode(repairedCode);
        setLastDetectedError(null);
        setLastHealSummary(summary);
        runCode(lang, repairedCode);
      }
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, `[AI Healing Error]: ${err.message || err}`]);
    } finally {
      setIsHealingError(false);
    }
  };

  // AI Code Generation, Security Audit & Big-O Analysis
  const handleAiAction = async (actionType: 'generate' | 'diagnose' | 'complexity') => {
    setIsAiLoading(true);
    try {
      if (actionType === 'generate') {
        const prompt = `You are a Senior Full-Stack Engineer.
Modify or write ${lang.toUpperCase()} code for this request:
"${aiPrompt || 'Build a clean interactive component'}"

Current Code:
\`\`\`${lang}
${code.slice(0, 3500)}
\`\`\`

Return ONLY pristine, directly runnable ${lang.toUpperCase()} code without conversational prose or markdown fences.`;

        const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
        const clean = res.reply.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
        setPreviousCode(code);
        setCode(clean);
        setAiPrompt('');
        runCode(lang, clean);
      } else if (actionType === 'diagnose') {
        setActiveTabMode('doctor');
        const prompt = `Audit this ${lang.toUpperCase()} code for correctness, edge cases, memory leaks, security risks (XSS/injection), and ergonomics:
\`\`\`${lang}
${code}
\`\`\`
Structure concisely:
1. **Health Assessment**
2. **Warnings & Edge Cases**
3. **Security & Performance Recommendations**`;

        const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
        setAiAnalysis(res.reply);
      } else if (actionType === 'complexity') {
        setActiveTabMode('doctor');
        const prompt = `Analyze asymptotic time & space complexity for this ${lang.toUpperCase()} implementation:
\`\`\`${lang}
${code}
\`\`\`
Provide:
1. **Time Complexity** (Best / Average / Worst)
2. **Space Complexity**
3. **Hotspot Breakdown & Optimization Path**`;

        const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
        setAiAnalysis(res.reply);
      }
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, `[AI Error]: ${err.message || err}`]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.substring(0, start) + '  ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    const title = `Code Sandbox · ${lang.toUpperCase()}${activeTab?.title ? ` (${activeTab.title})` : ''}`;
    const content = `# ${title}\n\n\`\`\`${lang}\n${code}\n\`\`\`${aiAnalysis ? `\n\n## AI Code Analysis\n\n${aiAnalysis}` : ''}`;
    onSaveAsNote(title, content);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2200);
  };

  const handleDownloadFile = () => {
    const ext = lang === 'html' ? 'html' : lang === 'js' ? 'js' : lang === 'python' ? 'py' : 'sql';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh_sandbox.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = useMemo(() => code.split('\n').length, [code]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* Top IDE Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white tracking-tight">
              Multi-Runtime Code Sandbox
            </h1>
            <p className="text-[11px] text-slate-400">
              Live HTML/DOM · Web Worker JS · CPython 3.12 Wasm · In-Memory SQL
            </p>
          </div>
        </div>

        {/* Language Segmented Control & Template Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            {(
              [
                { id: 'html', label: 'HTML' },
                { id: 'js', label: 'JavaScript' },
                { id: 'python', label: 'Python' },
                { id: 'sql', label: 'SQL' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handleLanguageChange(item.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  lang === item.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Template preset"
            value={selectedTemplateId}
            onChange={(e) => {
              const found = TEMPLATES.find((t) => t.id === e.target.value);
              if (found) handleSelectTemplate(found);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => runCode()}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            title="Run Code (Ctrl/Cmd + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Running...' : 'Run'}</span>
          </button>

          {previousCode && (
            <button
              onClick={() => {
                setCode(previousCode);
                setPreviousCode(null);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Revert Previous Snapshot"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Copy source"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadFile}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Download source file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSaveToNotes}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{noteSaved ? 'Saved' : 'Save Note'}</span>
          </button>
        </div>
      </div>

      {/* AI Co-Engineer Prompt Toolbar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex-1 flex items-center gap-2 min-w-[260px] max-w-xl">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aiPrompt.trim() && handleAiAction('generate')}
            placeholder={`Ask AI to write or refactor ${lang.toUpperCase()} code...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleAiAction('generate')}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium text-xs shrink-0 cursor-pointer border border-slate-700"
          >
            {isAiLoading ? 'Synthesizing...' : 'Synthesize'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAiAction('diagnose')}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code Audit</span>
          </button>

          <button
            onClick={() => handleAiAction('complexity')}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Big-O Analysis</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Line-Numbered Source Editor */}
        <div className="h-1/2 lg:h-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950">
          <div className="h-8 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>editor.{lang}</span>
              <span className="text-slate-600">·</span>
              <span className="tabular-nums">{lineCount} lines</span>
            </div>
            <div className="flex items-center gap-3">
              {lang === 'html' && (
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoRunHtml}
                    onChange={(e) => setAutoRunHtml(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                  <span>Live Reload</span>
                </label>
              )}
              <span className="text-[10px] text-slate-500 hidden sm:inline">Ctrl/Cmd+Enter to Run</span>
            </div>
          </div>

          <div className="flex-1 flex overflow-auto font-mono text-xs leading-6 bg-slate-950">
            {/* Line Number Gutter */}
            <div
              aria-hidden="true"
              className="py-4 px-2.5 text-right text-slate-600 select-none bg-slate-950 border-r border-slate-900 shrink-0 tabular-nums"
            >
              {Array.from({ length: lineCount }, (_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              className="flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-6 outline-none resize-none selection:bg-cyan-900/50 min-h-full"
            />
          </div>
        </div>

        {/* Right Pane: Output Tabs */}
        <div className="h-1/2 lg:h-full lg:w-1/2 flex flex-col bg-slate-900/20 overflow-hidden">
          <div className="h-8 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-1">
              {lang === 'html' && (
                <button
                  onClick={() => setActiveTabMode('preview')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTabMode === 'preview'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Preview</span>
                </button>
              )}

              {lang === 'sql' && (
                <button
                  onClick={() => setActiveTabMode('table')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTabMode === 'table'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table2 className="w-3 h-3 text-cyan-400" />
                  <span>Query Tables ({sqlResults.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTabMode('console')}
                className={`px-2.5 py-0.5 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'console'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>Console ({consoleLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveTabMode('doctor')}
                className={`px-2.5 py-0.5 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'doctor'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3 h-3 text-cyan-400" />
                <span>AI Audit</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {lang === 'html' && activeTabMode === 'preview' && (
                <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded border border-slate-800">
                  <button
                    onClick={() => setViewportSize('full')}
                    className={`p-1 rounded cursor-pointer ${
                      viewportSize === 'full' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Full Desktop Width"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewportSize('tablet')}
                    className={`p-1 rounded cursor-pointer ${
                      viewportSize === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Tablet 768px"
                  >
                    <Tablet className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewportSize('mobile')}
                    className={`p-1 rounded cursor-pointer ${
                      viewportSize === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Mobile 390px"
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                </div>
              )}

              {lastExecDurationMs !== null && (
                <span className="text-[10px] font-mono tabular-nums text-slate-400 hidden sm:inline">
                  {lastExecDurationMs} ms
                </span>
              )}

              <button
                onClick={() => setConsoleLogs([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-slate-950">
            {/* HTML LIVE PREVIEW */}
            {activeTabMode === 'preview' && lang === 'html' && (
              <div className="w-full h-full bg-slate-900 flex justify-center overflow-auto">
                <iframe
                  ref={iframeRef}
                  title="Sandbox Preview"
                  sandbox="allow-scripts allow-modals"
                  style={{
                    width:
                      viewportSize === 'mobile'
                        ? '390px'
                        : viewportSize === 'tablet'
                        ? '768px'
                        : '100%',
                  }}
                  className="h-full bg-white border-none transition-all duration-150 shrink-0 shadow-xl"
                />
              </div>
            )}

            {/* SQL QUERY RESULT TABLES */}
            {activeTabMode === 'table' && lang === 'sql' && (
              <div className="w-full h-full overflow-y-auto p-4 space-y-5 bg-slate-950">
                {sqlResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Run a SELECT query in SQL to view structured result sets here.
                  </div>
                ) : (
                  sqlResults.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
                    >
                      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300 truncate max-w-md">
                          {res.statement}
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {res.rows.length} row(s)
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                            <tr>
                              {res.columns.map((col) => (
                                <th key={col} className="px-3 py-2 font-medium">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70 text-slate-200">
                            {res.rows.map((row, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-slate-900/50">
                                {res.columns.map((col) => (
                                  <td key={col} className="px-3 py-2 tabular-nums">
                                    {row[col] === null ? (
                                      <span className="text-slate-600 italic">NULL</span>
                                    ) : (
                                      String(row[col])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CONSOLE OUTPUT + AUTO-HEALING BANNER */}
            {activeTabMode === 'console' && (
              <div className="w-full h-full flex flex-col overflow-hidden bg-slate-950">
                {lastDetectedError && (
                  <div className="px-4 py-2.5 bg-rose-950/60 border-b border-rose-800/60 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-rose-200 font-mono truncate max-w-sm" title={lastDetectedError}>
                        {lastDetectedError}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAutoFixError()}
                        disabled={isHealingError}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-slate-950 hover:bg-slate-200 font-semibold text-xs cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isHealingError ? 'Fixing...' : 'Auto-Fix with AI'}</span>
                      </button>
                      <button
                        onClick={() => setLastDetectedError(null)}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {lastHealSummary && !lastDetectedError && (
                  <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300 shrink-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{lastHealSummary}</span>
                    </div>
                    {previousCode && (
                      <button
                        onClick={() => setShowDiffModal(true)}
                        className="flex items-center gap-1 underline hover:text-white cursor-pointer"
                      >
                        <GitCompare className="w-3 h-3" />
                        <span>View Diff</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-300">
                  {consoleLogs.length === 0 ? (
                    <div className="text-slate-600 text-center py-10">
                      No output recorded yet. Click Run to execute.
                    </div>
                  ) : (
                    consoleLogs.map((log, i) => (
                      <div
                        key={i}
                        className={`leading-relaxed whitespace-pre-wrap ${
                          log.includes('[ERROR]')
                            ? 'text-rose-400 flex items-center justify-between gap-2 group'
                            : log.includes('[WARN]')
                            ? 'text-amber-300'
                            : log.includes('[OK]') || log.includes('[RETURN]')
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        <span>{log}</span>
                        {log.includes('[ERROR]') && !isHealingError && (
                          <button
                            onClick={() => handleAutoFixError(log.replace('[ERROR]: ', ''))}
                            className="hidden group-hover:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer shrink-0"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Auto-Fix</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* AI CODE AUDIT & BIG-O REPORT */}
            {activeTabMode === 'doctor' && (
              <div className="w-full h-full bg-slate-950 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-200">
                {isAiLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <div className="w-7 h-7 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                    <p className="font-medium text-xs">Analyzing AST &amp; algorithmic complexity...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <span className="text-xs font-semibold text-white">
                        Code Audit &amp; Complexity Report
                      </span>
                      <button
                        onClick={() => handleAiAction('diagnose')}
                        className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 cursor-pointer"
                      >
                        Re-Audit
                      </button>
                    </div>
                    <div className="prose prose-invert prose-xs max-w-none space-y-3">
                      <Markdown>{aiAnalysis}</Markdown>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 space-y-1.5">
                    <p className="font-medium text-slate-300">No audit generated yet</p>
                    <p className="text-xs">
                      Click Code Audit or Big-O Analysis in the toolbar above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Diff Inspection Modal */}
      {showDiffModal && previousCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="h-12 px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                <span>Code Patch Diff</span>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden font-mono text-xs">
              <div className="flex flex-col overflow-hidden bg-slate-950/60">
                <div className="px-3 py-2 bg-rose-950/30 text-rose-300 text-xs font-medium border-b border-slate-800">
                  Previous Code
                </div>
                <pre className="flex-1 p-3 text-slate-400 overflow-auto whitespace-pre leading-relaxed">
                  {previousCode}
                </pre>
              </div>

              <div className="flex flex-col overflow-hidden bg-slate-950">
                <div className="px-3 py-2 bg-emerald-950/30 text-emerald-300 text-xs font-medium border-b border-slate-800">
                  Updated Code
                </div>
                <pre className="flex-1 p-3 text-emerald-300 overflow-auto whitespace-pre leading-relaxed">
                  {code}
                </pre>
              </div>
            </div>

            <div className="h-12 px-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">{lastHealSummary || 'Patch applied'}</span>
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-medium text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
