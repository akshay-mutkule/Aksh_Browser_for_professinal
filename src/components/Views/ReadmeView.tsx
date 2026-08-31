import React, { useState } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import {
  BookOpen,
  Sparkles,
  Zap,
  Bot,
  Network,
  Radio,
  FileText,
  Columns,
  Scale,
  Layers,
  Terminal,
  ShieldCheck,
  Cpu,
  Search,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Code2,
  Bookmark,
  Volume2,
  Compass
} from 'lucide-react';

interface ReadmeViewProps {
  onNavigateUrl?: (url: string) => void;
}

const README_CONTENT = `# 🌐 Aksh AI Browser

> **Next-Generation Intelligent Chromium-Class Web Browser with In-Situ Gemini 3.7 AI Co-Pilot, Autonomous Deep Research Engine, DevTools Agent & Knowledge Base**

---

## 🌟 Executive Summary

**Aksh AI Browser** is a full-stack, browser-in-browser platform designed to reinvent how humans read, research, digest, and store knowledge across the web. Built on a modular **React 19** and **Express** architecture, it pairs Chromium-grade browsing controls (tabs, omnibox, bookmarks, download manager, history, reader mode) with an embedded **Google Gemini 3.7 Flash** engine.

Unlike traditional AI extensions that sit disconnected from the active page, Aksh AI actively extracts clean DOM text, parses PDF streams, performs grounded multi-source research across the web, generates study quizzes, clusters tabs into semantic workspaces, and manages persistent markdown notes in an all-in-one desktop experience.

---

## 🏗️ Architecture & Dataflow Pipeline

\`\`\`
┌────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 1: LIVE PROXY & MULTI-TAB NAVIGATION               │
│  • Omnibox navigation / Google search / Speed dial presets                 │
│  • Express Backend fetches remote HTML via sub-100ms proxy pipeline        │
│  • HTML sanitization & DOM readability text extraction                     │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 2: IN-SITU PAGE INTELLIGENCE                       │
│  • Aksh AI Co-Pilot attaches active page context                           │
│  • 4 Synthesis Modes: Executive Brief, Key Takeaways, Action Plan, TL;DR   │
│  • 1-Click Cornell Notes synthesis & Obsidian-compatible markdown export   │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 3: AUTONOMOUS DEEP RESEARCH                        │
│  • Multi-query decomposition & parallel web retrieval                      │
│  • Source grounding with citation links & structured synthesis             │
│  • Side-by-side product comparisons with weighted recommendation matrix    │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 4: KNOWLEDGE RETENTION & AUDIO                     │
│  • AI Podcast Dialogue (Alex & Sam two-host synthetic briefing)            │
│  • Visual Interactive Mindmap & Knowledge Graph Visualization (D3)         │
│  • In-browser DevTools Autonomous Web Agent & Security DOM Inspector       │
└────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## ⚡ Core Subsystems & Capabilities

### 1. In-Situ Gemini 3.7 Flash AI Co-Pilot
- **Automatic Page Binding**: The AI sidebar instantly receives the sanitized text of whatever page or PDF is active in the current tab.
- **4 Instant Summarization Modes**: Executive Brief, Key Takeaways, Action Checklist, and 30-second TL;DR.
- **Cornell Note Synthesizer**: Converts raw web text into high-yield Cornell study notes with cues and summary blocks.

### 2. Autonomous Multi-Source Deep Research Engine (\`aksh://research\`)
- **5-Stage Pipeline Progression**: Query decomposition, live source retrieval, perspective analysis, structured intelligence synthesis, and grounded citation linking.
- Direct 1-click **Save to Notes** or **Download as .md**.

### 3. Concept Mindmap & Knowledge Graph (\`aksh://mindmap\`)
- Interactive D3-powered concept graph clustering key ideas, core technologies, real-world applications, and future frontiers into connected visual nodes.

### 4. Autonomous Web Agent & DevTools Inspector (\`aksh://devtools\`)
- Live network telemetry, structured DOM tree inspection, SSL certificate & security audit, and autonomous goal execution with step-by-step reasoning.

### 5. Smart Tab Workspaces & Auto-Clustering
- Groups open tabs into semantic workspaces with custom labels and distinct color tags with a single click.

### 6. AI Podcast Synthesizer (\`Alex & Sam\`)
- Converts any article into a lively two-host conversational podcast with audio speech synthesis and synchronized dialogue drawer.

---

## 🧭 Custom URL Protocol Scheme (\`aksh://\`)

| URL Scheme | Target View | Description |
| :--- | :--- | :--- |
| \`aksh://newtab\` | **New Tab Homepage** | Speed dial, search bar, and interactive workflow pipeline |
| \`aksh://research\` | **Deep Research Mode** | Autonomous multi-source AI research engine |
| \`aksh://mindmap\` | **Concept Graph** | Visual interactive concept mindmap & knowledge explorer |
| \`aksh://devtools\` | **DevTools & Agent** | DOM tree, network logs, security audit & autonomous agent |
| \`aksh://pdf\` | **PDF Intelligence** | In-browser document viewer, section parser & AI quiz |
| \`aksh://notes\` | **AI Knowledge Base** | Saved summaries, research dossiers & markdown exporter |
| \`aksh://comparison\` | **Decision Matrix** | Side-by-side product benchmark comparison |
| \`aksh://history\` | **Browsing History** | Chronological timeline of visited URLs |
| \`aksh://bookmarks\` | **Bookmarks Manager**| Tagged folders, custom URLs & JSON export |
| \`aksh://downloads\` | **Downloads Manager**| File download tracker with progress bars |
| \`aksh://settings\` | **Browser Settings** | AI configuration, theme, search engine & keyboard shortcuts |
| \`aksh://readme\` | **System Documentation** | Animated and detailed interactive user manual |

---

## ⌨️ Global Keyboard Shortcuts

- **\`Ctrl + K\` / \`⌘ + K\`**: Global Spotlight Command Palette
- **\`Ctrl + J\` / \`⌘ + J\`**: Toggle Aksh AI Co-Pilot Sidebar
- **\`Ctrl + T\` / \`⌘ + T\`**: Open New Tab
- **\`Ctrl + W\` / \`⌘ + W\`**: Close Current Tab
- **\`Ctrl + R\` / \`⌘ + R\`**: Reload Current Page
- **\`Ctrl + M\` / \`⌘ + M\`**: Open Concept Mindmap
- **\`Ctrl + H\` / \`⌘ + H\`**: Open Browsing History
- **\`Ctrl + B\` / \`⌘ + B\`**: Open Bookmarks
- **\`F12\` / \`Ctrl + Shift + I\`**: Open Autonomous DevTools Inspector
- **\`?\`**: Display Full Keyboard Shortcuts Modal
`;

export const ReadmeView: React.FC<ReadmeViewProps> = ({ onNavigateUrl }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'features' | 'architecture' | 'api'>('preview');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleCopy = () => {
    navigator.clipboard.writeText(README_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const featureCards = [
    {
      title: 'In-Situ Gemini 3.7 AI Co-Pilot',
      desc: 'Seamlessly bound to active tabs with 4 synthesis modes, Cornell note clipping & contextual chat.',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Core Intelligence',
      route: 'aksh://newtab'
    },
    {
      title: 'Autonomous Deep Research Engine',
      desc: '5-stage multi-source query decomposition, live citation synthesis & grounded markdown reports.',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      tag: 'Research Mode',
      route: 'aksh://research'
    },
    {
      title: 'Autonomous Web Agent & DevTools',
      desc: 'Visual DOM tree inspector, live network request telemetry, security audit & agentic execution.',
      icon: Bot,
      color: 'from-purple-500 to-pink-600',
      tag: 'Developer',
      route: 'aksh://devtools'
    },
    {
      title: 'Concept Mindmap & Knowledge Graph',
      desc: 'Interactive D3 node network visualizing themes, technologies, challenges & future trends.',
      icon: Network,
      color: 'from-cyan-500 to-blue-600',
      tag: 'Knowledge',
      route: 'aksh://mindmap'
    },
    {
      title: 'AI Podcastifier (Alex & Sam)',
      desc: 'Converts any article into a two-host audio dialogue with speed modulation and synchronized script.',
      icon: Radio,
      color: 'from-rose-500 to-red-600',
      tag: 'Audio & Voice',
      route: 'aksh://newtab'
    },
    {
      title: 'Smart Tab Workspaces & Auto-Grouping',
      desc: 'Clusters open tabs into semantic workspaces with custom labels and color-coded tab strip badges.',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Workspace',
      route: 'aksh://newtab'
    },
  ];

  return (
    <div className="w-full h-full bg-slate-50 overflow-y-auto font-sans text-slate-800 select-text">
      {/* Animated Hero Header */}
      <div className="relative bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-12 overflow-hidden border-b border-slate-800">
        {/* Animated Background Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
        
        {/* Glowing Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 border border-white/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">Aksh AI Browser</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-xs font-bold">
                    v2.5 Release
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Official System Documentation & Interactive Architecture Specification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Markdown' : 'Copy README.md'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-blue-300 flex items-center gap-1.5 font-bold">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini 3.7 Flash</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-300 flex items-center gap-1.5 font-bold">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>React 19 + TypeScript</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-300 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Client Secret Leak</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-purple-300 flex items-center gap-1.5 font-bold">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Autonomous Web Agent</span>
            </span>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pt-4">
            {[
              { id: 'preview', label: 'Detailed Manual (Markdown)', icon: FileText },
              { id: 'features', label: 'Feature Matrix & Quick Launch', icon: Sparkles },
              { id: 'architecture', label: 'System Architecture', icon: Network },
              { id: 'api', label: 'API Specifications', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-blue-400 text-blue-300 bg-white/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Tab 1: Full Markdown Document */}
        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8"
          >
            <div className="markdown-body prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-table:border prose-table:border-slate-200 prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2">
              <Markdown>{README_CONTENT}</Markdown>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Feature Matrix with Quick Launch */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Interactive Feature Directory</h2>
                <p className="text-xs text-slate-500">Launch and test any browser subsystem instantly</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureCards.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${f.color} flex items-center justify-center text-white shadow-md`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {f.tag}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {f.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>

                    {onNavigateUrl && (
                      <button
                        onClick={() => onNavigateUrl(f.route)}
                        className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <span>Launch Tool</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab 3: System Architecture */}
        {activeTab === 'architecture' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-600" />
                <span>End-to-End Multi-Tier Architecture</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aksh AI Browser enforces a strict separation between client-side browsing presentation, server-side content extraction & proxying, and cloud-hosted Gemini 3.7 LLM reasoning.
              </p>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {`+-----------------------------------------------------------------------------------------+
|                                    CLIENT (React 19 + Vite)                             |
|                                                                                         |
|  +-----------------+  +-------------------+  +-------------------+  +----------------+  |
|  |    TitleBar     |  |    AddressBar     |  |   BookmarksBar    |  |  ShortcutsModal|  |
|  +-----------------+  +-------------------+  +-------------------+  +----------------+  |
|                                                                                         |
|  +-------------------------------------------------------------+  +------------------+  |
|  |                       ACTIVE VIEWPORT                       |  |  AKSH AI SIDEBAR |  |
|  |  * LiveWebView (Reader mode / iframe proxy / quick summary) |  |  * Gemini 3.7    |  |
|  |  * PDFViewer (Doc reader / study quiz / jump to section)    |  |  * Page Context  |  |
|  |  * ResearchMode (5-stage deep search & citations)          |  |  * 4 Summ Modes  |  |
|  |  * DevToolsView (DOM inspector / agent / security audit)    |  |  * Cornell Notes |  |
|  |  * MindmapView (Interactive visual concept graph)           |  |  * Export Notes  |  |
|  +-------------------------------------------------------------+  +------------------+  |
+--------------------------------------------▲--------------------------------------------+
                                             │ HTTP REST / JSON
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                  EXPRESS SERVER (server.ts)                             |
|                                                                                         |
|  +---------------------+  +----------------------+  +--------------------------------+  |
|  |   /api/scrape       |  |  /api/ai/chat        |  |  /api/ai/research              |  |
|  |   * Live Web Proxy  |  |  * Gemini 3.7 Flash  |  |  * Multi-Source Search Engine  |  |
|  |   * CORS Bypassing  |  |  * Context Embedding |  |  * Grounded Web Synthesis      |  |
|  |   * HTML Extraction |  |  * Markdown Delivery |  |  * Citation Linking            |  |
|  +---------------------+  +----------------------+  +--------------------------------+  |
|  +---------------------+  +----------------------+  +--------------------------------+  |
|  |   /api/ai/summarize |  |  /api/ai/compare     |  |  /api/ai/podcast               |  |
|  |   * 4 Preset Modes  |  |  * Decision Matrix   |  |  * 2-Host Dialogue Script      |  |
|  +---------------------+  +----------------------+  +--------------------------------+  |
+--------------------------------------------▲--------------------------------------------+
                                             │ @google/genai SDK
                                             ▼
                             +-------------------------------+
                             |    GOOGLE GENAI / GEMINI API  |
                             |      (Gemini 3.7 Flash)       |
                             +-------------------------------+`}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: API Specifications */}
        {activeTab === 'api' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {[
              {
                method: 'POST',
                path: '/api/scrape',
                desc: 'Proxies target URL, bypasses CSP/CORS headers and extracts clean sanitized DOM text.',
                body: '{ "url": "https://example.com" }',
                response: '{ "title": "Example Domain", "textContent": "...", "headings": [...] }'
              },
              {
                method: 'POST',
                path: '/api/ai/chat',
                desc: 'Context-grounded conversational agent with active tab document injection.',
                body: '{ "message": "Explain the architecture", "pageContext": "...", "chatHistory": [] }',
                response: '{ "reply": "Based on the page content..." }'
              },
              {
                method: 'POST',
                path: '/api/ai/research',
                desc: 'Executes 5-stage autonomous deep research with multi-source query decomposition.',
                body: '{ "query": "Quantum Machine Learning 2026", "depth": "deep" }',
                response: '{ "report": { "summary": "...", "sources": [...] } }'
              },
              {
                method: 'POST',
                path: '/api/ai/podcast',
                desc: 'Generates two-host (Alex & Sam) dynamic briefing script from page content.',
                body: '{ "title": "Page Title", "url": "https://...", "content": "..." }',
                response: '{ "script": "Alex: Welcome back...", "spokenText": "..." }'
              },
              {
                method: 'POST',
                path: '/api/ai/organize-tabs',
                desc: 'Gemini tab clustering engine grouping open tabs into workspaces.',
                body: '{ "tabs": [{ "id": "t1", "title": "...", "url": "..." }] }',
                response: '{ "groups": [{ "groupName": "Research", "color": "#3b82f6", "tabIds": ["t1"] }] }'
              },
            ].map((ep, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">{ep.path}</span>
                </div>
                <p className="text-xs text-slate-600">{ep.desc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 pb-1 border-b border-slate-800 mb-1">Payload</div>
                    <pre className="overflow-x-auto">{ep.body}</pre>
                  </div>
                  <div className="bg-slate-900 text-emerald-300 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 pb-1 border-b border-slate-800 mb-1">Response</div>
                    <pre className="overflow-x-auto">{ep.response}</pre>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
