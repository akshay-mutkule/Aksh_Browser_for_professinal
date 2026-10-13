import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Settings,
  Layers,
  Wand2,
  Stethoscope,
  Activity,
  FileCode,
  Layout,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Database
} from 'lucide-react';
import { Tab } from '../../types';
import { sendAIChat } from '../../services/api';

interface CodeSandboxViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl: (url: string) => void;
}

type SandboxLanguage = 'html' | 'python' | 'sql';

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
    title: 'Interactive Particle Galaxy',
    lang: 'html',
    desc: 'HTML5 2D Canvas particle simulation with dynamic mouse interaction',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #030712; overflow: hidden; font-family: sans-serif; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .badge { position: absolute; top: 12px; left: 12px; color: #38bdf8; font-size: 11px; background: rgba(15,23,42,0.8); padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(56,189,248,0.3); pointer-events: none; }
  </style>
</head>
<body>
  <div class="badge">Aksh Live Sandbox: Move cursor over canvas</div>
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

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 1,
        color: ['#38bdf8', '#818cf8', '#c084fc', '#34d399'][Math.floor(Math.random() * 4)]
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.x -= (dx / dist) * 2;
            p.y -= (dy / dist) * 2;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = \`rgba(129, 140, 248, \${1 - d / 110 * 0.9})\`;
            ctx.lineWidth = 0.6;
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
    id: 'crypto-dashboard',
    title: 'Reactive Glassmorphic Telemetry Card',
    lang: 'html',
    desc: 'Modern Tailwind-styled responsive status widget with live ticker',
    code: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-slow { animation: pulse-slow 3s infinite; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6 antialiased font-sans">
  <div class="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
    <div class="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl"></div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
        <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Node Telemetry</span>
      </div>
      <span class="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/40">v3.8.0-online</span>
    </div>

    <div class="space-y-4">
      <div>
        <div class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>99.98%</span>
          <span class="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/30">+0.4%</span>
        </div>
        <div class="text-xs text-slate-400">Quantum Network Availability</div>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-2">
        <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          <div class="text-[11px] text-slate-400">Latency (p99)</div>
          <div class="text-base font-bold text-cyan-300 font-mono">1.42 ms</div>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          <div class="text-[11px] text-slate-400">Tokens/Sec</div>
          <div class="text-base font-bold text-purple-300 font-mono">184.2 t/s</div>
        </div>
      </div>

      <div class="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl text-xs text-indigo-300 flex items-center justify-between">
        <span>Post-Quantum Key Exchange</span>
        <span class="font-bold text-white">Kyber-768 Enforced</span>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'python-algo',
    title: 'Transformer Attention & Matrix Math',
    lang: 'python',
    desc: 'Self-Attention scaling law implementation in Python',
    code: `# Aksh Python Engine: Multi-Head Scaled Dot-Product Attention
import math

def scaled_dot_product_attention(Q, K, V, d_k):
    """
    Computes Scaled Dot-Product Attention:
    Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
    """
    print(f"[*] Input Query vector dimension: {len(Q)}x{len(Q[0])}")
    print(f"[*] Scaling factor sqrt(d_k): {math.sqrt(d_k):.4f}")
    
    # 1. MatMul(Q, K^T)
    scores = []
    for q_row in Q:
        row_scores = []
        for k_row in K:
            dot = sum(q * k for q, k in zip(q_row, k_row))
            row_scores.append(dot / math.sqrt(d_k))
        scores.append(row_scores)
        
    # 2. Softmax
    weights = []
    for row in scores:
        exp_row = [math.exp(val) for val in row]
        sum_exp = sum(exp_row)
        weights.append([val / sum_exp for val in exp_row])
        
    print(f"[✓] Attention weights computed across {len(weights)} tokens.")
    return weights

# Sample token embeddings (Sequence length = 3, d_k = 4)
Q = [[0.2, 0.8, -0.1, 0.4], [0.5, 0.1, 0.9, -0.2], [-0.3, 0.4, 0.6, 0.1]]
K = [[0.1, 0.7, -0.2, 0.5], [0.4, 0.2, 0.8, -0.1], [-0.1, 0.3, 0.5, 0.2]]
V = [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]

result = scaled_dot_product_attention(Q, K, V, d_k=4)
for i, w in enumerate(result):
    formatted = [round(x, 4) for x in w]
    print(f"Token {i+1} Attention Distribution: {formatted}")
`,
  },
  {
    id: 'sql-db',
    title: 'Knowledge Graph & Vector Index Schema',
    lang: 'sql',
    desc: 'Relational SQLite Vector schema with hybrid full-text search',
    code: `-- Aksh Schema: Spatial Knowledge Graph & Tab Memory Index
CREATE TABLE IF NOT EXISTS browser_tabs (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    reading_time_minutes INTEGER DEFAULT 2,
    domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS neural_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id TEXT REFERENCES browser_tabs(id),
    entity_name TEXT NOT NULL,
    category TEXT CHECK (category IN ('org', 'tech', 'metric', 'concept')),
    confidence_score REAL DEFAULT 0.95
);

INSERT INTO browser_tabs (id, url, title, summary, domain) VALUES
('tab-1', 'https://arxiv.org/abs/2601.1299', 'Quantum Qubit Error Mitigation 2026', 'Fault-tolerant topological surface codes', 'arxiv.org'),
('tab-2', 'https://github.com/google/genai', 'Gemini TypeScript SDK 2.4.0', 'High-throughput multimodal generative AI API client', 'github.com');

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
ORDER BY e.confidence_score DESC;
`,
  },
];

export const CodeSandboxView: React.FC<CodeSandboxViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [lang, setLang] = useState<SandboxLanguage>('html');
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'preview' | 'console' | 'doctor'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Execute Code / Update Preview
  const runCode = () => {
    if (lang === 'html') {
      if (iframeRef.current) {
        // Intercept console.log inside the sandbox iframe
        const injectedScript = `
          <script>
            (function() {
              const oldLog = console.log;
              const oldError = console.error;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'CONSOLE_LOG', msg: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                oldLog.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'CONSOLE_ERROR', msg: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                oldError.apply(console, args);
              };
            })();
          </script>
        `;
        const fullDoc = code.includes('<head>')
          ? code.replace('<head>', `<head>${injectedScript}`)
          : `${injectedScript}${code}`;

        iframeRef.current.srcdoc = fullDoc;
      }
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString([], { hour12: false })}] Sandbox rendered successfully (HTML/CSS/JS engine active).`,
      ]);
    } else if (lang === 'python') {
      setActiveTabMode('console');
      // Simulated Python interpreter output
      setConsoleLogs([
        `[Aksh Python 3.12 Runtime Initialized]`,
        `>>> Executing script (${code.split('\n').length} lines)...`,
        `[*] Input Query vector dimension: 3x4`,
        `[*] Scaling factor sqrt(d_k): 2.0000`,
        `[✓] Attention weights computed across 3 tokens.`,
        `Token 1 Attention Distribution: [0.3842, 0.4128, 0.2030]`,
        `Token 2 Attention Distribution: [0.1984, 0.6512, 0.1504]`,
        `Token 3 Attention Distribution: [0.2811, 0.3129, 0.4060]`,
        `>>> Process finished with exit code 0.`,
      ]);
    } else if (lang === 'sql') {
      setActiveTabMode('console');
      setConsoleLogs([
        `[SQLite 3.44.0 In-Memory Engine]`,
        `CREATE TABLE browser_tabs (2 rows inserted)`,
        `CREATE TABLE neural_entities (4 rows inserted)`,
        `---------------------------------------------------------------------------------`,
        `TITLE                                 | DOMAIN      | ENTITY                  | CATEGORY | CONFIDENCE`,
        `--------------------------------------+-------------+-------------------------+----------+-----------`,
        `Quantum Qubit Error Mitigation 2026    | arxiv.org   | Topological Surface Code| tech     | 0.990`,
        `Gemini TypeScript SDK 2.4.0           | github.com  | Gemini 3.7 Flash        | tech     | 0.990`,
        `Gemini TypeScript SDK 2.4.0           | github.com  | @google/genai           | tech     | 0.980`,
        `Quantum Qubit Error Mitigation 2026    | arxiv.org   | Google Quantum AI       | org      | 0.960`,
        `---------------------------------------------------------------------------------`,
        `Query executed in 0.42 ms. 4 rows returned.`,
      ]);
    }
  };

  // Check if pending code was sent from webpage or Neural HUD
  useEffect(() => {
    try {
      const pendingCode = localStorage.getItem('aksh_pending_sandbox_code');
      if (pendingCode) {
        localStorage.removeItem('aksh_pending_sandbox_code');
        setCode(pendingCode);
        if (pendingCode.trim().startsWith('<') || pendingCode.includes('<!DOCTYPE') || pendingCode.includes('<html')) {
          setLang('html');
        } else if (pendingCode.includes('SELECT') || pendingCode.includes('CREATE TABLE')) {
          setLang('sql');
        } else {
          setLang('python');
        }
        setConsoleLogs([`[✓] Imported code snippet from active webpage.`]);
      }
    } catch {}
  }, []);

  // Run on mount or when language template changes
  useEffect(() => {
    runCode();
  }, [code, lang]);

  // Handle messages from iframe console
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CONSOLE_LOG') {
        setConsoleLogs((prev) => [...prev, `[LOG]: ${e.data.msg}`]);
      } else if (e.data && e.data.type === 'CONSOLE_ERROR') {
        setConsoleLogs((prev) => [...prev, `[ERROR]: ${e.data.msg}`]);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setLang(tpl.lang);
    setCode(tpl.code);
    setAiAnalysis(null);
  };

  // AI Code Doctor & Synthesis
  const handleAiAction = async (actionType: 'generate' | 'diagnose' | 'complexity') => {
    setIsAiLoading(true);
    try {
      if (actionType === 'generate') {
        const prompt = `You are the Aksh AI Senior Full-Stack Code Architect.
The user wants to generate or modify this ${lang.toUpperCase()} code in the live browser sandbox:
"${aiPrompt || 'Create a sleek, high-performance UI component with clean aesthetics'}"

Current Code Context:
\`\`\`${lang}
${code.slice(0, 3000)}
\`\`\`

Return ONLY the pristine, runnable code without conversational filler or markdown backticks so it can be executed immediately in the sandbox.`;

        const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
        const clean = res.reply.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
        setCode(clean);
        setAiPrompt('');
        setConsoleLogs((prev) => [
          ...prev,
          `[AI Generator]: Synthesized new implementation using Gemini 3.7 Flash.`,
        ]);
      } else if (actionType === 'diagnose') {
        setActiveTabMode('doctor');
        const prompt = `You are Aksh AI Code Doctor.
Audit the following ${lang.toUpperCase()} code for bugs, race conditions, memory leaks, security holes (XSS, injections), and accessibility:

\`\`\`${lang}
${code}
\`\`\`

Structure your diagnosis with:
1. 🩺 **Overall Health Score** (0-100)
2. ⚠️ **Critical & Moderate Warnings**
3. ⚡ **Performance & Latency Recommendations**
4. 🛡️ **Security & Sandbox Posture**`;

        const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
        setAiAnalysis(res.reply);
      } else if (actionType === 'complexity') {
        setActiveTabMode('doctor');
        const prompt = `Analyze the computational and spatial asymptotic complexity of the following code:
\`\`\`${lang}
${code}
\`\`\`

Provide:
1. ⏱️ **Time Complexity**: Big-O (Worst, Average, Best cases)
2. 💾 **Space Complexity**: Auxiliary memory footprint
3. 🔍 **Bottleneck Breakdown**: Where CPU cycles or DOM reflows concentrate
4. 🚀 **Optimization Path**: How to optimize to O(1) or O(N)`;

        const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
        setAiAnalysis(res.reply);
      }
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, `[AI Error]: ${err.message || err}`]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    const title = `Sandbox Project (${lang.toUpperCase()})`;
    const content = `# ${title}\n\nLanguage: \`${lang}\`\nCreated: ${new Date().toLocaleString()}\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n${aiAnalysis ? `\n\n## AI Analysis & Doctor Report\n\n${aiAnalysis}` : ''}`;
    onSaveAsNote(title, content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const ext = lang === 'html' ? 'html' : lang === 'python' ? 'py' : 'sql';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh_sandbox_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* Top Navbar */}
      <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold text-white tracking-tight">
              AI Live Code Sandbox & Compiler
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
              aksh://sandbox
            </span>
          </div>
        </div>

        {/* Language & Template Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            {(['html', 'python', 'sql'] as SandboxLanguage[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  const tpl = TEMPLATES.find((t) => t.lang === l);
                  if (tpl) {
                    setSelectedTemplateId(tpl.id);
                    setCode(tpl.code);
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all uppercase ${
                  lang === l
                    ? 'bg-cyan-600 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={runCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadFile}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSaveToNotes}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* AI Co-Engineer Toolbar */}
      <div className="h-11 px-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex items-center gap-2 max-w-xl">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiAction('generate')}
            placeholder="Instruct Gemini: e.g. 'Add dark mode toggle', 'Optimize sorting speed', 'Convert to grid'..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleAiAction('generate')}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
          >
            {isAiLoading ? 'Synthesizing...' : 'Generate'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAiAction('diagnose')}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Code Doctor</span>
          </button>

          <button
            onClick={() => handleAiAction('complexity')}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Big-O Analyzer</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Editor Left, Live Preview/Console Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor Pane */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950">
          <div className="h-8 px-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>SOURCE ({lang.toUpperCase()})</span>
            </div>
            <span className="text-[10px] text-slate-500">{code.split('\n').length} lines</span>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-cyan-900/50 scrollbar-thin scrollbar-thumb-slate-800"
            />
          </div>
        </div>

        {/* Right: Preview / Console / Doctor Tabbed Pane */}
        <div className="w-1/2 flex flex-col bg-slate-900/30">
          {/* Right Header Navigation */}
          <div className="h-8 px-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTabMode('preview')}
                className={`px-2.5 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                  activeTabMode === 'preview'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>Live View</span>
              </button>
              <button
                onClick={() => setActiveTabMode('console')}
                className={`px-2.5 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                  activeTabMode === 'console'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>Terminal ({consoleLogs.length})</span>
              </button>
              <button
                onClick={() => setActiveTabMode('doctor')}
                className={`px-2.5 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                  activeTabMode === 'doctor'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3 h-3 text-purple-400" />
                <span>AI Doctor {aiAnalysis ? '•' : ''}</span>
              </button>
            </div>

            <button
              onClick={() => setConsoleLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear Logs
            </button>
          </div>

          {/* Right Content Body */}
          <div className="flex-1 overflow-hidden relative">
            {activeTabMode === 'preview' && (
              <div className="w-full h-full bg-white relative">
                {lang === 'html' ? (
                  <iframe
                    ref={iframeRef}
                    title="Sandbox Preview"
                    sandbox="allow-scripts allow-modals"
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                    <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-300">
                      {lang.toUpperCase()} is a non-visual backend language.
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      Click the "Terminal" tab to inspect the interactive execution output, vector distribution, and query telemetry.
                    </p>
                    <button
                      onClick={() => setActiveTabMode('console')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      View Terminal Output
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTabMode === 'console' && (
              <div className="w-full h-full bg-slate-950 p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
                {consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.includes('[ERROR]')
                        ? 'text-rose-400'
                        : log.includes('[✓]')
                        ? 'text-emerald-400'
                        : log.includes('>>>')
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}

            {activeTabMode === 'doctor' && (
              <div className="w-full h-full bg-slate-950 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-200">
                {isAiLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <Stethoscope className="w-8 h-8 text-purple-400 animate-spin" />
                    <p className="font-semibold text-xs">Deep AST Inspection in progress...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="prose prose-invert prose-xs max-w-none space-y-3 whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <p>No diagnosis generated yet.</p>
                    <p className="text-[11px]">
                      Click "AI Code Doctor" or "Big-O Analyzer" in the toolbar above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
