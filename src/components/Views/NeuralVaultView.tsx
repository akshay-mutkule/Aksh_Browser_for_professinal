import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Search,
  Sparkles,
  Network,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Tag,
  Clock,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Share2,
  BookmarkPlus,
  BookOpen,
  Sliders,
  CheckSquare,
  Square,
  Compass,
  FileText
} from 'lucide-react';
import { NeuralMemoryItem, MemoryCategory, MemorySynthesisResult, Tab } from '../../types';
import { runMemorySynthesis } from '../../services/api';

interface NeuralVaultViewProps {
  activeTab?: Tab;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl?: (url: string) => void;
}

const DEFAULT_MEMORIES: NeuralMemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Autonomous Multi-Agent Verifiable Toolchains',
    summary: 'Architectures employing dual-loop reasoning (fast heuristic planner + formal verifier) achieving 94% task completion on complex browser DOM manipulation.',
    sourceUrl: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    sourceTitle: 'Frontier AI Reasoning Paradigms',
    category: 'research',
    tags: ['Agents', 'Multi-Agent', 'Reasoning', 'Verification'],
    keyQuotes: [
      'Dual-loop reasoning separates candidate action hypothesis from formal state verification.',
      'Browser sandboxes provide safe execution traces for speculative agents.'
    ],
    entities: ['MIT CSAIL', 'OpenAI', 'DeepMind'],
    confidenceScore: 0.96,
    retentionStrength: 92,
    createdAt: Date.now() - 3600000 * 24 * 2,
    lastRecalledAt: Date.now() - 3600000 * 4,
    connections: ['mem-2', 'mem-4'],
  },
  {
    id: 'mem-2',
    title: 'Local-First Client Runtimes & WebGPU Tensors',
    summary: 'Direct client-side model execution using WebGPU shaders, reducing server inference costs to zero and enabling offline vector search across private tabs.',
    sourceUrl: 'https://developer.mozilla.org',
    sourceTitle: 'MDN Web Docs - WebGPU API',
    category: 'concept',
    tags: ['WebGPU', 'LocalFirst', 'ClientAI', 'WASM'],
    keyQuotes: [
      'WebGPU unlocks raw compute pipelines for matrix multiplications directly in the browser tab.',
      'Zero-latency vector search ensures complete privacy for personal browsing history.'
    ],
    entities: ['W3C GPUWeb', 'Google Chrome Team', 'Mozilla'],
    confidenceScore: 0.98,
    retentionStrength: 88,
    createdAt: Date.now() - 3600000 * 24 * 3,
    lastRecalledAt: Date.now() - 3600000 * 12,
    connections: ['mem-1', 'mem-3'],
  },
  {
    id: 'mem-3',
    title: 'Post-Quantum TLS 1.3 Kyber Hybrid Cryptography',
    summary: 'Standardization of ML-KEM (Kyber) key-exchange algorithms protecting current HTTPS traffic against retroactive "Harvest Now, Decrypt Later" quantum adversaries.',
    sourceUrl: 'https://cloudflare.com/learning/ssl/post-quantum-cryptography/',
    sourceTitle: 'Post-Quantum Cryptography Architecture',
    category: 'concept',
    tags: ['Security', 'Cryptography', 'Kyber', 'Quantum'],
    keyQuotes: [
      'Hybrid X25519+ML-KEM ensures classical security while neutralizing future quantum attacks.'
    ],
    entities: ['NIST', 'Cloudflare', 'IETF'],
    confidenceScore: 0.94,
    retentionStrength: 81,
    createdAt: Date.now() - 3600000 * 24 * 5,
    lastRecalledAt: Date.now() - 3600000 * 18,
    connections: ['mem-2'],
  },
  {
    id: 'mem-4',
    title: 'Self-Organizing Spatial Browsing & Tab Clustering',
    summary: 'Dynamically clustering open tabs by semantic embedding proximity rather than static domain lists, eliminating tab clutter through continuous self-pruning.',
    sourceUrl: 'https://github.com',
    sourceTitle: 'Spatial Browser Interfaces',
    category: 'thought',
    tags: ['SpatialUI', 'Tabs', 'UX', 'CognitiveLoad'],
    keyQuotes: [
      'Treat tabs as ephemeral cognitive nodes in an associative graph rather than a linear stack.'
    ],
    entities: ['Arc Browser', 'Aksh Studio', 'Figma'],
    confidenceScore: 0.89,
    retentionStrength: 95,
    createdAt: Date.now() - 3600000 * 16,
    lastRecalledAt: Date.now() - 3600000 * 2,
    connections: ['mem-1', 'mem-5'],
  },
  {
    id: 'mem-5',
    title: 'Zero-Knowledge Epistemic Credibility Scoring',
    summary: 'Evaluating media bias, citation density, and conflict of interest signals on arbitrary URLs without transmitting private reading history to external telemetry servers.',
    sourceUrl: 'https://arxiv.org',
    sourceTitle: 'Media Literacy & Truth Scoring on the Edge',
    category: 'article',
    tags: ['MediaLiteracy', 'EpistemicRigor', 'FactChecking'],
    keyQuotes: [
      'Source credibility must be computed transparently with inspectable heuristics.'
    ],
    entities: ['Pew Research', 'Reuters', 'FactCheck.org'],
    confidenceScore: 0.91,
    retentionStrength: 78,
    createdAt: Date.now() - 3600000 * 24 * 4,
    lastRecalledAt: Date.now() - 3600000 * 20,
    connections: ['mem-4'],
  },
];

export const NeuralVaultView: React.FC<NeuralVaultViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [memories, setMemories] = useState<NeuralMemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aksh_neural_vault_memories');
      return saved ? JSON.parse(saved) : DEFAULT_MEMORIES;
    } catch {
      return DEFAULT_MEMORIES;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(memories[0]?.id || null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'constellation' | 'cards' | 'timeline'>('constellation');
  
  // Quick Capture Thought State
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('thought');
  const [newTags, setNewTags] = useState('');

  // AI Synthesis State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<MemorySynthesisResult | null>(null);
  const [copiedSynthesis, setCopiedSynthesis] = useState(false);

  // Graph drag/interactive states
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aksh_neural_vault_memories', JSON.stringify(memories));
  }, [memories]);

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        (m.entities && m.entities.some((e) => e.toLowerCase().includes(q)))
      );
    });
  }, [memories, selectedCategory, searchQuery]);

  const activeMemory = useMemo(() => {
    return memories.find((m) => m.id === activeMemoryId) || filteredMemories[0] || null;
  }, [memories, activeMemoryId, filteredMemories]);

  // Handle Ingest Current Tab
  const handleIngestCurrentTab = () => {
    if (!activeTab) return;
    const title = activeTab.title || 'Captured Webpage';
    const summary = activeTab.metaDescription || activeTab.extractedText?.slice(0, 240) || 'Archived knowledge fragment from live browsing session.';
    const newMem: NeuralMemoryItem = {
      id: `mem-${Date.now()}`,
      title,
      summary,
      sourceUrl: activeTab.url,
      sourceTitle: activeTab.title,
      category: 'article',
      tags: ['LiveBrowsing', activeTab.groupName || 'Web', 'Captured'],
      keyQuotes: activeTab.headings?.slice(0, 2) || [],
      entities: ['Current Session'],
      confidenceScore: 0.95,
      retentionStrength: 100,
      createdAt: Date.now(),
      lastRecalledAt: Date.now(),
      connections: memories.length > 0 ? [memories[0].id] : [],
    };

    setMemories((prev) => [newMem, ...prev]);
    setActiveMemoryId(newMem.id);
  };

  // Add Manual Memory
  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newMem: NeuralMemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      category: newCategory,
      tags: parsedTags.length > 0 ? parsedTags : ['SecondBrain', 'Synthesis'],
      confidenceScore: 0.99,
      retentionStrength: 100,
      createdAt: Date.now(),
      lastRecalledAt: Date.now(),
      connections: [],
    };

    setMemories((prev) => [newMem, ...prev]);
    setActiveMemoryId(newMem.id);
    setNewTitle('');
    setNewSummary('');
    setNewTags('');
    setIsAddingMemory(false);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (activeMemoryId === id) {
      setActiveMemoryId(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMemories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMemories.map((m) => m.id));
    }
  };

  // Run AI Synthesis across selected memories
  const handleSynthesizeSelected = async () => {
    const targetItems = memories.filter((m) =>
      selectedIds.length > 0 ? selectedIds.includes(m.id) : true
    );
    if (targetItems.length === 0) return;

    setIsSynthesizing(true);
    setSynthesisResult(null);

    try {
      const res = await runMemorySynthesis(targetItems);
      setSynthesisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Export Vault to Markdown (Obsidian format)
  const handleExportMarkdown = () => {
    let md = `# Aksh Neural Memory Vault Export\nGenerated: ${new Date().toISOString()}\nTotal Nodes: ${memories.length}\n\n`;
    memories.forEach((m) => {
      md += `## ${m.title}\n`;
      md += `**Category:** #${m.category} | **Tags:** ${m.tags.map((t) => `#${t}`).join(' ')}\n`;
      if (m.sourceUrl) md += `**Source:** [${m.sourceTitle || m.sourceUrl}](${m.sourceUrl})\n`;
      md += `**Retention:** ${m.retentionStrength}% | **Captured:** ${new Date(m.createdAt).toLocaleDateString()}\n\n`;
      md += `> ${m.summary}\n\n`;
      if (m.keyQuotes && m.keyQuotes.length > 0) {
        md += `### Salient Highlights\n`;
        m.keyQuotes.forEach((q) => (md += `- "${q}"\n`));
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-neural-vault-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Graph Node Positions (Deterministic Orbit/Constellation coordinates)
  const nodePositions = useMemo(() => {
    const total = filteredMemories.length;
    const width = 640;
    const height = 440;
    const cx = width / 2;
    const cy = height / 2;
    const rOuter = 160;
    const rInner = 80;

    return filteredMemories.map((m, idx) => {
      const isInner = idx % 2 === 0;
      const radius = isInner ? rInner : rOuter;
      const angle = (idx / (total || 1)) * 2 * Math.PI - Math.PI / 2;
      return {
        id: m.id,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        item: m,
      };
    });
  }, [filteredMemories]);

  // Color mapping by category
  const categoryColors: Record<MemoryCategory, { bg: string; text: string; ring: string }> = {
    concept: { bg: 'bg-indigo-500', text: 'text-indigo-400', ring: 'ring-indigo-500/30' },
    entity: { bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    research: { bg: 'bg-blue-500', text: 'text-blue-400', ring: 'ring-blue-500/30' },
    article: { bg: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-500/30' },
    thought: { bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/30' },
    snippet: { bg: 'bg-rose-500', text: 'text-rose-400', ring: 'ring-rose-500/30' },
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">Neural Memory Vault</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Cognitive Second Brain
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Continuous cross-session memory index, knowledge graph, and AI associative recall
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab && (
            <button
              onClick={handleIngestCurrentTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
              title="Capture active tab knowledge into Neural Vault"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Ingest Active Tab</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingMemory(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Thought</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="Export Vault to Obsidian / Markdown"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Search Filter Bar */}
      <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Semantic query (e.g., 'quantum algorithms', 'agent verification')..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {['all', 'research', 'concept', 'thought', 'article'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80">
          <button
            onClick={() => setViewMode('constellation')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'constellation' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3 h-3" />
            <span>Graph</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Visualization & List (65%) */}
        <div className="flex-1 flex flex-col border-r border-slate-800/80 overflow-hidden relative">
          {viewMode === 'constellation' ? (
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-radial from-indigo-950/20 via-slate-950 to-slate-950">
              {/* Background Graph Grid */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Constellation Canvas SVG */}
              <svg
                ref={svgRef}
                viewBox="0 0 640 440"
                className="w-full h-full max-w-3xl max-h-[500px] select-none"
              >
                {/* Connecting Lines */}
                {nodePositions.map((node) => {
                  return (node.item.connections || []).map((connId) => {
                    const target = nodePositions.find((n) => n.id === connId);
                    if (!target) return null;
                    const isHovered = hoveredNodeId === node.id || hoveredNodeId === target.id;
                    const isSelected = activeMemoryId === node.id || activeMemoryId === target.id;

                    return (
                      <line
                        key={`${node.id}-${connId}`}
                        x1={node.x}
                        y1={node.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={isSelected ? '#818cf8' : isHovered ? '#6366f1' : '#334155'}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray={isSelected ? 'none' : '4 4'}
                        className="transition-colors duration-200"
                      />
                    );
                  });
                })}

                {/* Central Brain Hub */}
                <circle cx="320" cy="220" r="28" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                <text
                  x="320"
                  y="223"
                  textAnchor="middle"
                  fill="#c7d2fe"
                  fontSize="10"
                  fontWeight="bold"
                >
                  VAULT
                </text>

                {/* Orbit Nodes */}
                {nodePositions.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isActive = activeMemoryId === node.id;
                  const isChecked = selectedIds.includes(node.id);
                  const radius = isActive ? 18 : isHovered ? 16 : 13;

                  return (
                    <g
                      key={node.id}
                      onClick={() => setActiveMemoryId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer transition-transform duration-200"
                    >
                      {/* Aura ring if active */}
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 8}
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                          className="animate-spin"
                          style={{ animationDuration: '10s' }}
                        />
                      )}

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={isActive ? '#4f46e5' : isChecked ? '#0284c7' : '#1e293b'}
                        stroke={isActive ? '#a5b4fc' : isChecked ? '#38bdf8' : '#475569'}
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />

                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize={isActive ? 11 : 9}
                        fontWeight="bold"
                      >
                        {node.item.category.slice(0, 1).toUpperCase()}
                      </text>

                      {/* Node Label Tooltip */}
                      {(isActive || isHovered) && (
                        <g>
                          <rect
                            x={node.x - 70}
                            y={node.y - 32}
                            width="140"
                            height="20"
                            rx="4"
                            fill="#0f172a"
                            stroke="#334155"
                            strokeWidth="1"
                          />
                          <text
                            x={node.x}
                            y={node.y - 18}
                            textAnchor="middle"
                            fill="#e2e8f0"
                            fontSize="9"
                            fontWeight="600"
                          >
                            {node.item.title.length > 20
                              ? node.item.title.slice(0, 18) + '...'
                              : node.item.title}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Bottom Multi-Select Action Pill */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg pointer-events-auto text-xs">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {selectedIds.length === filteredMemories.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>
                      {selectedIds.length > 0
                        ? `${selectedIds.length} Selected`
                        : 'Select Memories'}
                    </span>
                  </button>

                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleSynthesizeSelected}
                      disabled={isSynthesizing}
                      className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Meta-Thesis'}</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  {filteredMemories.length} Knowledge Nodes Active
                </div>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  {selectedIds.length === filteredMemories.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Select All ({filteredMemories.length})</span>
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleSynthesizeSelected}
                    disabled={isSynthesizing}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesize ({selectedIds.length})</span>
                  </button>
                )}
              </div>

              {filteredMemories.map((m) => {
                const isSelected = selectedIds.includes(m.id);
                const isActive = activeMemoryId === m.id;
                const colors = categoryColors[m.category] || categoryColors.thought;

                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMemoryId(m.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-800/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(m.id);
                          }}
                          className="mt-1 w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors.text} bg-slate-800 border border-slate-700`}
                            >
                              {m.category}
                            </span>
                            <h3 className="text-xs font-bold text-white truncate">{m.title}</h3>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {m.summary}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                            <span>Retention: {m.retentionStrength}%</span>
                            {m.sourceTitle && (
                              <span className="truncate max-w-[150px] text-indigo-400">
                                🔗 {m.sourceTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMemory(m.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Active Memory Details & AI Synthesis Drawer (35%) */}
        <div className="w-80 md:w-96 flex flex-col bg-slate-900/80 overflow-y-auto">
          {/* If AI Synthesis is ready, show it on top */}
          <AnimatePresence>
            {synthesisResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 border-b border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 to-slate-900/80"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Cross-Memory Meta-Thesis</span>
                  </div>
                  <button
                    onClick={() => setSynthesisResult(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-xs font-bold text-white mb-2">
                  {synthesisResult.synthesisTitle}
                </h3>
                <p className="text-[11px] text-indigo-100/90 leading-relaxed mb-3 bg-indigo-900/30 p-2.5 rounded-lg border border-indigo-500/20">
                  {synthesisResult.executiveSummary}
                </p>

                <div className="mb-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Emergent Patterns
                  </div>
                  <ul className="space-y-1">
                    {synthesisResult.emergentPatterns.map((pat, idx) => (
                      <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{pat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20">
                  <button
                    onClick={() => {
                      if (onSaveAsNote) {
                        onSaveAsNote(
                          `Meta-Thesis: ${synthesisResult.synthesisTitle}`,
                          `${synthesisResult.executiveSummary}\n\n### Emergent Patterns\n${synthesisResult.emergentPatterns.map((p) => `- ${p}`).join('\n')}`
                        );
                        setCopiedSynthesis(true);
                        setTimeout(() => setCopiedSynthesis(false), 2000);
                      }
                    }}
                    className="flex-1 py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    {copiedSynthesis ? <Check className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                    <span>{copiedSynthesis ? 'Saved to Notes' : 'Save as Note'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Memory Deep Inspector */}
          {activeMemory ? (
            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeMemory.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleSelect(activeMemory.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {selectedIds.includes(activeMemory.id) ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>+ Select</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(activeMemory.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-sm font-bold text-white leading-snug">{activeMemory.title}</h2>
              </div>

              {/* Memory Summary Box */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Knowledge Summary</span>
                  <span className="text-emerald-400 font-mono">
                    {Math.round(activeMemory.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{activeMemory.summary}</p>
              </div>

              {/* Salient Quotes if present */}
              {activeMemory.keyQuotes && activeMemory.keyQuotes.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Extracted Signals
                  </div>
                  <div className="space-y-2">
                    {activeMemory.keyQuotes.map((q, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200 italic"
                      >
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Link if present */}
              {activeMemory.sourceUrl && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Source Provenance
                  </div>
                  <button
                    onClick={() => onNavigateUrl && onNavigateUrl(activeMemory.sourceUrl!)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-cyan-300 font-medium group transition-colors cursor-pointer"
                  >
                    <span className="truncate">{activeMemory.sourceTitle || activeMemory.sourceUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0 ml-2" />
                  </button>
                </div>
              )}

              {/* Tags & Entities */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Semantic Tags & Entities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeMemory.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{t}
                    </span>
                  ))}
                  {(activeMemory.entities || []).map((e, idx) => (
                    <span
                      key={`ent-${idx}`}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                    >
                      🏛 {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSaveAsNote) {
                      onSaveAsNote(
                        `Memory: ${activeMemory.title}`,
                        `${activeMemory.summary}\n\nSource: ${activeMemory.sourceUrl || 'Aksh Vault'}`
                      );
                    }
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Push to Notes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Brain className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
              <p className="text-xs">Select a memory node from the graph to view epistemic details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Memory Modal */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Capture Cognitive Memory</span>
              </h3>
              <button
                onClick={() => setIsAddingMemory(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Memory Concept / Headline
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. WebGPU client tensor pipelines"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
                >
                  <option value="thought">Personal Thought</option>
                  <option value="concept">Technical Concept</option>
                  <option value="research">Scientific Research</option>
                  <option value="article">Article Synopsis</option>
                  <option value="snippet">Code / Architectural Snippet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Synthesized Insights & Takeaways
                </label>
                <textarea
                  rows={3}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="What is the core breakthrough, takeaway, or thesis?..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="WebGPU, MachineLearning, Performance"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
