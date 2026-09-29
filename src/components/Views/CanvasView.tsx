import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Share2,
  Download,
  StickyNote,
  Globe,
  BrainCircuit,
  Bot,
  Layers,
  ChevronRight,
  SplitSquareVertical,
  Check,
  Search,
  Move,
  Link2,
  Compass,
  FileText,
  Copy,
  Info
} from 'lucide-react';
import { Tab } from '../../types';
import { sendAIChat } from '../../services/api';

export interface CanvasNode {
  id: string;
  type: 'tab' | 'note' | 'insight' | 'search' | 'agent';
  title: string;
  subtitle?: string;
  content: string;
  url?: string;
  x: number;
  y: number;
  color?: string;
  tags?: string[];
  tabId?: string;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
}

interface CanvasViewProps {
  tabs: Tab[];
  activeTab: Tab | null;
  onNavigateTab: (tabId: string, url: string) => void;
  onOpenNewTab: (url: string) => void;
  onOpenInSplit?: (url: string) => void;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  tabs,
  activeTab,
  onNavigateTab,
  onOpenNewTab,
  onOpenInSplit,
  onSaveAsNote,
}) => {
  // Canvas transform state: pan (x, y) and zoom scale
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected node and node dragging state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // AI Generation states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isExpandingWithAi, setIsExpandingWithAi] = useState(false);
  const [copiedGraph, setCopiedGraph] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeContent, setNewNodeContent] = useState('');
  const [newNodeType, setNewNodeType] = useState<CanvasNode['type']>('note');

  // Initial Seed Nodes generated from existing tabs and research
  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    const initialNodes: CanvasNode[] = [];
    const webTabs = tabs.filter((t) => t.contentType === 'web' || t.contentType === 'newtab' || t.contentType === 'research');
    
    // Position tabs in a gentle radial / staggered grid
    webTabs.slice(0, 6).forEach((t, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      initialNodes.push({
        id: `node-tab-${t.id}`,
        type: 'tab',
        title: t.title || 'Untitled Tab',
        subtitle: t.url,
        content: t.metaDescription || (t.extractedText ? t.extractedText.slice(0, 140) + '...' : 'Live active browser tab context.'),
        url: t.url,
        x: 120 + col * 340,
        y: 120 + row * 260,
        color: '#3b82f6',
        tabId: t.id,
        tags: [t.contentType.toUpperCase(), 'ACTIVE TAB'],
      });
    });

    // Add high-level neural synthesis node
    initialNodes.push({
      id: 'node-central-insight',
      type: 'insight',
      title: 'Active Research Synthesis Core',
      subtitle: 'AI Spatial Synthesis',
      content: 'Synthesized graph mapping core relationships, technical concepts, and operational tradeoffs between currently open tabs.',
      x: 480,
      y: 420,
      color: '#8b5cf6',
      tags: ['GEMINI 3.7', 'SYNTHESIS'],
    });

    return initialNodes;
  });

  const [edges, setEdges] = useState<CanvasEdge[]>([
    {
      id: 'edge-1',
      from: 'node-central-insight',
      to: nodes[0]?.id || 'node-tab-1',
      label: 'Grounding Anchor',
      color: '#8b5cf6',
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync any newly opened tabs as unpositioned nodes on the canvas
  useEffect(() => {
    setNodes((prev) => {
      const existingTabIds = new Set(prev.filter((n) => n.tabId).map((n) => n.tabId));
      const missing = tabs.filter((t) => !existingTabIds.has(t.id) && t.contentType !== 'canvas');
      if (missing.length === 0) return prev;

      const newNodes: CanvasNode[] = missing.map((t, idx) => ({
        id: `node-tab-${t.id}`,
        type: 'tab',
        title: t.title || 'Untitled Tab',
        subtitle: t.url,
        content: t.metaDescription || (t.extractedText ? t.extractedText.slice(0, 120) + '...' : 'Active web tab context'),
        url: t.url,
        x: 150 + (prev.length % 4) * 320,
        y: 150 + Math.floor(prev.length / 4) * 240,
        color: '#0ea5e9',
        tabId: t.id,
        tags: ['TAB', t.contentType],
      }));

      return [...prev, ...newNodes];
    });
  }, [tabs]);

  // Pan handlers on container
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-canvas-node]')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    } else if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== draggingNodeId) return n;
          return {
            ...n,
            x: Math.round((e.clientX - pan.x) / scale - dragOffsetRef.current.x),
            y: Math.round((e.clientY - pan.y) / scale - dragOffsetRef.current.y),
          };
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag Start
  const handleNodeDragStart = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    const nodeScreenX = node.x * scale + pan.x;
    const nodeScreenY = node.y * scale + pan.y;
    dragOffsetRef.current = {
      x: (e.clientX - nodeScreenX) / scale,
      y: (e.clientY - nodeScreenY) / scale,
    };
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.3), 2.5);
    
    // Zoom centered towards mouse pointer
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setPan((prev) => ({
        x: mouseX - (mouseX - prev.x) * (newScale / scale),
        y: mouseY - (mouseY - prev.y) * (newScale / scale),
      }));
    }
    setScale(newScale);
  };

  // Auto Layout Nodes in circular or organized grid layout
  const handleAutoLayout = () => {
    const count = nodes.length;
    if (count === 0) return;
    
    const centerX = 500;
    const centerY = 350;
    const radius = Math.max(260, count * 55);

    setNodes((prev) =>
      prev.map((node, i) => {
        if (node.id === 'node-central-insight') {
          return { ...node, x: centerX, y: centerY };
        }
        const angle = ((2 * Math.PI) / (count - 1 || 1)) * i;
        return {
          ...node,
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        };
      })
    );
  };

  // AI Connect & Cluster: Infer connections using Gemini
  const handleAiAutoConnect = async () => {
    setIsSynthesizing(true);
    try {
      const nodeBriefs = nodes.map((n) => `ID: ${n.id} | Title: ${n.title} | Snippet: ${n.content.slice(0, 100)}`).join('\n');
      const prompt = `Analyze these spatial research nodes on the canvas and return 3 to 6 logical thematic connections between them.
Return strictly a JSON array of objects with keys "from", "to", "label" (short 2-4 word connection reason like "Technical Precedent", "Contrasting Architecture", "Implementation Spec"):
${nodeBriefs}`;

      const res = await sendAIChat(prompt, [], undefined, 'general', 'gemini-3.7-flash');
      let text = res.reply || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newEdges: CanvasEdge[] = parsed
          .filter((item: any) => nodes.some((n) => n.id === item.from) && nodes.some((n) => n.id === item.to))
          .map((item: any, idx: number) => ({
            id: `ai-edge-${Date.now()}-${idx}`,
            from: item.from,
            to: item.to,
            label: item.label || 'Related Concept',
            color: '#6366f1',
          }));

        if (newEdges.length > 0) {
          setEdges((prev) => [...prev, ...newEdges]);
        }
      }
    } catch (err) {
      console.error('Failed to auto-connect nodes:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Expand selected node with 2-3 child brainstorm concepts
  const handleExpandSelectedNode = async () => {
    if (!selectedNodeId) return;
    const targetNode = nodes.find((n) => n.id === selectedNodeId);
    if (!targetNode) return;

    setIsExpandingWithAi(true);
    try {
      const prompt = `Based on this research concept: "${targetNode.title}" (${targetNode.content.slice(0, 200)}), generate 2 novel exploration directions or deeper sub-concepts.
Return strictly a JSON array of 2 objects with keys "title", "content" (1-2 sentences), "relationship" (relation to parent).`;

      const res = await sendAIChat(prompt, [], undefined, 'general', 'gemini-3.7-flash');
      let text = res.reply || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newSpawned: CanvasNode[] = [];
        const newSpawnedEdges: CanvasEdge[] = [];

        parsed.forEach((item: any, idx: number) => {
          const newId = `ai-node-${Date.now()}-${idx}`;
          const offsetAngle = idx === 0 ? 0.8 : -0.8;
          const dist = 280;
          newSpawned.push({
            id: newId,
            type: 'insight',
            title: item.title,
            subtitle: 'AI Expansion',
            content: item.content,
            x: targetNode.x + Math.cos(offsetAngle) * dist,
            y: targetNode.y + Math.sin(offsetAngle) * dist,
            color: '#10b981',
            tags: ['AI EXPLORATION', 'GEMINI'],
          });

          newSpawnedEdges.push({
            id: `edge-expand-${Date.now()}-${idx}`,
            from: targetNode.id,
            to: newId,
            label: item.relationship || 'Explores',
            color: '#10b981',
          });
        });

        setNodes((prev) => [...prev, ...newSpawned]);
        setEdges((prev) => [...prev, ...newSpawnedEdges]);
      }
    } catch (err) {
      console.error('Failed to expand node:', err);
    } finally {
      setIsExpandingWithAi(false);
    }
  };

  // Export Canvas to AI Notes
  const handleExportCanvasToNote = () => {
    const title = `Spatial Knowledge Dossier (${nodes.length} nodes)`;
    const body = `## 🧠 Spatial Knowledge Canvas Synthesis\n\nGenerated on ${new Date().toLocaleDateString()}\n\n### 📌 Identified Concept Nodes (${nodes.length}):\n` +
      nodes.map((n) => `#### [${n.type.toUpperCase()}] ${n.title}\n- **Summary:** ${n.content}\n${n.url ? `- **URL:** ${n.url}\n` : ''}`).join('\n') +
      `\n\n### 🔗 Key Interconnections (${edges.length}):\n` +
      edges.map((e) => {
        const fromNode = nodes.find((n) => n.id === e.from)?.title || e.from;
        const toNode = nodes.find((n) => n.id === e.to)?.title || e.to;
        return `- **${fromNode}** ──[ ${e.label || 'connected to'} ]──> **${toNode}**`;
      }).join('\n');

    onSaveAsNote(title, body, 'aksh://canvas');
    setCopiedGraph(true);
    setTimeout(() => setCopiedGraph(false), 2500);
  };

  // Add custom manual node
  const handleCreateCustomNode = () => {
    if (!newNodeTitle.trim()) return;
    const newId = `custom-node-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newId,
      type: newNodeType,
      title: newNodeTitle.trim(),
      subtitle: newNodeType === 'note' ? 'Manual Note' : 'Hypothesis',
      content: newNodeContent.trim() || 'No additional details provided.',
      x: 350 + Math.random() * 200,
      y: 250 + Math.random() * 150,
      color: newNodeType === 'note' ? '#f59e0b' : '#ec4899',
      tags: [newNodeType.toUpperCase(), 'CUSTOM'],
    };

    setNodes((prev) => [...prev, newNode]);
    setShowAddModal(false);
    setNewNodeTitle('');
    setNewNodeContent('');
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 text-slate-100 select-none flex flex-col cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Blueprint Grid Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
          backgroundSize: `${32 * scale}px ${32 * scale}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Top Floating Control Bar */}
      <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              Neural Knowledge Canvas
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800">
                Spatial 2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {nodes.length} Nodes · {edges.length} Active Connections · Zoom {Math.round(scale * 100)}%
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Add a custom node or hypothesis card"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Node</span>
          </button>

          <button
            onClick={handleAutoLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Auto-organize nodes into clean layout"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto Layout</span>
          </button>

          <button
            onClick={handleAiAutoConnect}
            disabled={isSynthesizing || nodes.length < 2}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
            title="Use Gemini to find semantic links between all nodes"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Analyzing Links...' : 'AI Auto-Connect'}</span>
          </button>

          {selectedNodeId && (
            <button
              onClick={handleExpandSelectedNode}
              disabled={isExpandingWithAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
              title="Expand selected node into subtopics using AI"
            >
              <BrainCircuit className={`w-3.5 h-3.5 ${isExpandingWithAi ? 'animate-spin' : ''}`} />
              <span>{isExpandingWithAi ? 'Expanding...' : 'Expand Node'}</span>
            </button>
          )}

          <div className="w-[1px] h-5 bg-slate-800 mx-1" />

          <button
            onClick={handleExportCanvasToNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Export canvas insights into AI Notes"
          >
            {copiedGraph ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <StickyNote className="w-3.5 h-3.5 text-violet-400" />}
            <span>{copiedGraph ? 'Saved to Notes!' : 'Save to Notes'}</span>
          </button>
        </div>
      </header>

      {/* Floating Canvas Zoom & Reset Widget (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 2.5))}
          className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s / 1.2, 0.3))}
          className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 40, y: 40 });
          }}
          className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Mini Radar / Overview Map (Bottom-Right) */}
      <aside aria-label="Canvas overview minimap" className="absolute bottom-6 right-6 z-20 bg-slate-900/90 backdrop-blur-md w-44 h-32 rounded-2xl border border-slate-800 shadow-xl p-2 pointer-events-auto flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
          <span>SPATIAL RADAR</span>
          <span className="text-indigo-400">{nodes.length} NODES</span>
        </div>
        <div className="relative w-full h-24 bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/80">
          {nodes.map((n) => {
            const rx = Math.max(4, Math.min(160, (n.x / 1400) * 160));
            const ry = Math.max(4, Math.min(80, (n.y / 1000) * 80));
            return (
              <div
                key={`mini-${n.id}`}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  n.id === selectedNodeId ? 'bg-indigo-400 ring-2 ring-indigo-500' : 'bg-slate-400'
                }`}
                style={{ left: `${rx}px`, top: `${ry}px` }}
              />
            );
          })}
        </div>
      </aside>

      {/* 2D Transformation Canvas Layer */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Bezier Edges */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-0 overflow-visible">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            // Connect from right of source to left of target (or centered)
            const x1 = fromNode.x + 140;
            const y1 = fromNode.y + 70;
            const x2 = toNode.x + 140;
            const y2 = toNode.y + 70;

            const dx = Math.abs(x2 - x1) * 0.5;
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            return (
              <g key={edge.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={edge.color || '#6366f1'}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="opacity-70 transition-all"
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#cbd5e1"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-medium bg-slate-900 px-1"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Spatial Node Cards */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;

          return (
            <div
              key={node.id}
              data-canvas-node="true"
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                width: '300px',
              }}
              onMouseDown={(e) => handleNodeDragStart(e, node)}
              className={`absolute top-0 left-0 rounded-2xl p-4 bg-slate-900/95 backdrop-blur-lg border transition-shadow cursor-grab active:cursor-grabbing shadow-xl ${
                isSelected
                  ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: `${node.color || '#3b82f6'}20`,
                      color: node.color || '#3b82f6',
                      border: `1px solid ${node.color || '#3b82f6'}40`,
                    }}
                  >
                    {node.type === 'tab' && <Globe className="w-3.5 h-3.5" />}
                    {node.type === 'note' && <StickyNote className="w-3.5 h-3.5" />}
                    {node.type === 'insight' && <BrainCircuit className="w-3.5 h-3.5" />}
                    {node.type === 'search' && <Search className="w-3.5 h-3.5" />}
                    {node.type === 'agent' && <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate" title={node.title}>
                      {node.title}
                    </h3>
                    {node.subtitle && (
                      <p className="text-[10px] text-slate-400 truncate" title={node.subtitle}>
                        {node.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove Node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Node Body Content */}
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3 line-clamp-3">
                {node.content}
              </p>

              {/* Tags */}
              {node.tags && node.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {node.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[9px] font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                {node.url ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewTab(node.url!);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                      <span>Open Tab</span>
                    </button>
                    {onOpenInSplit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInSplit(node.url!);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                        title="Open in Split Screen"
                      >
                        <SplitSquareVertical className="w-3 h-3 text-emerald-400" />
                        <span>Split</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Spatial Artifact</span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveAsNote(node.title, node.content, node.url);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Save this node to AI Notes"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Node Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-100"
            >
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Create Spatial Canvas Node
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Node Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'note', label: 'Sticky Note' },
                      { id: 'insight', label: 'Hypothesis' },
                      { id: 'search', label: 'Query Link' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewNodeType(type.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                          newNodeType === type.id
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    placeholder="e.g. Memory Bandwidth Constraints in LLMs"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Details & Thoughts</label>
                  <textarea
                    rows={3}
                    value={newNodeContent}
                    onChange={(e) => setNewNodeContent(e.target.value)}
                    placeholder="Describe notes, tradeoffs, or hypothesis..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCustomNode}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    Create Node
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
