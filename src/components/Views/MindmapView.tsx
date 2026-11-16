import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Network,
  Sparkles,
  Zap,
  StickyNote,
  Search,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Layers,
  CheckCircle2,
  ExternalLink,
  X,
  GitBranch,
  BookmarkPlus,
  Download,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Globe,
  Code2,
  LayoutGrid,
  Compass
} from 'lucide-react';
import { generateMindmap, expandMindmapNode, scrapeWebpage } from '../../services/api';
import { MindmapGraph, MindmapNode, MindmapEdge } from '../../types';

interface MindmapViewProps {
  initialTopic?: string;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl: (url: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

type ViewMode = 'canvas' | 'matrix' | 'export';
type SourceMode = 'topic' | 'url';

const CANVAS_W = 1480;
const CANVAS_H = 920;
const CENTER_X = CANVAS_W / 2;
const CENTER_Y = CANVAS_H / 2;

const PRESET_TOPICS = [
  'Modern Transformer Architecture',
  'Post-Quantum Lattice Cryptography (ML-KEM)',
  'Distributed Consensus (Raft & Paxos)',
  'Zero-Knowledge Proofs (zk-SNARKs)',
];

function computeRadialLayout(graph: MindmapGraph): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};
  if (!graph.nodes.length) return positions;

  const rootNode = graph.nodes.find((n) => n.category === 'root') || graph.nodes[0];
  positions[rootNode.id] = { x: CENTER_X, y: CENTER_Y };

  const edges = graph.edges || [];
  const childrenMap: Record<string, string[]> = {};
  edges.forEach((e) => {
    if (!childrenMap[e.from]) childrenMap[e.from] = [];
    if (!childrenMap[e.from].includes(e.to)) {
      childrenMap[e.from].push(e.to);
    }
  });

  // BFS depth calculation
  const depthMap: Record<string, number> = { [rootNode.id]: 0 };
  const parentMap: Record<string, string> = {};
  const queue: string[] = [rootNode.id];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const children = childrenMap[curr] || [];
    children.forEach((childId) => {
      if (depthMap[childId] === undefined) {
        depthMap[childId] = depthMap[curr] + 1;
        parentMap[childId] = curr;
        queue.push(childId);
      }
    });
  }

  // Assign depth 1 to any disconnected non-root nodes
  const level1Nodes: MindmapNode[] = [];
  const deeperNodes: MindmapNode[] = [];
  graph.nodes.forEach((n) => {
    if (n.id === rootNode.id) return;
    if (depthMap[n.id] === undefined || depthMap[n.id] === 1) {
      depthMap[n.id] = 1;
      if (!parentMap[n.id]) parentMap[n.id] = rootNode.id;
      level1Nodes.push(n);
    } else {
      deeperNodes.push(n);
    }
  });

  // Place level 1 around central orbital ellipse
  const l1Count = Math.max(level1Nodes.length, 1);
  const angleByNode: Record<string, number> = {};
  level1Nodes.forEach((node, idx) => {
    const angle = (idx / l1Count) * Math.PI * 2 - Math.PI / 2;
    angleByNode[node.id] = angle;
    const rx = l1Count > 7 ? 380 : 320;
    const ry = l1Count > 7 ? 265 : 230;
    positions[node.id] = {
      x: Math.round(CENTER_X + Math.cos(angle) * rx),
      y: Math.round(CENTER_Y + Math.sin(angle) * ry),
    };
  });

  // Group deeper nodes by parent and fan them radially outward
  const deeperByParent: Record<string, MindmapNode[]> = {};
  deeperNodes.forEach((n) => {
    const p = parentMap[n.id] || rootNode.id;
    if (!deeperByParent[p]) deeperByParent[p] = [];
    deeperByParent[p].push(n);
  });

  // Iteratively place remaining nodes up to depth 5
  for (let d = 2; d <= 5; d++) {
    deeperNodes
      .filter((n) => depthMap[n.id] === d)
      .forEach((node) => {
        const parentId = parentMap[node.id] || rootNode.id;
        const parentPos = positions[parentId] || { x: CENTER_X, y: CENTER_Y };
        const siblings = deeperByParent[parentId] || [node];
        const sibIdx = siblings.findIndex((s) => s.id === node.id);
        const baseAngle =
          angleByNode[parentId] ??
          Math.atan2(parentPos.y - CENTER_Y, parentPos.x - CENTER_X);
        const spread = Math.min(1.1, Math.max(0.38, siblings.length * 0.28));
        const offsetAngle =
          siblings.length === 1
            ? 0
            : ((sibIdx / (siblings.length - 1)) - 0.5) * spread;
        const finalAngle = baseAngle + offsetAngle;
        angleByNode[node.id] = finalAngle;
        const dist = 205;
        positions[node.id] = {
          x: Math.max(115, Math.min(CANVAS_W - 115, Math.round(parentPos.x + Math.cos(finalAngle) * dist))),
          y: Math.max(70, Math.min(CANVAS_H - 70, Math.round(parentPos.y + Math.sin(finalAngle) * dist))),
        };
      });
  }

  return positions;
}

function getCategoryAccent(category: string): {
  dot: string;
  border: string;
  activeBorder: string;
  kicker: string;
} {
  switch (category) {
    case 'root':
      return {
        dot: 'bg-cyan-400',
        border: 'border-slate-900',
        activeBorder: 'ring-2 ring-cyan-500 border-slate-900',
        kicker: 'text-cyan-200',
      };
    case 'concept':
      return {
        dot: 'bg-indigo-600',
        border: 'border-slate-200 hover:border-slate-400',
        activeBorder: 'ring-2 ring-cyan-600 border-cyan-600',
        kicker: 'text-indigo-700',
      };
    case 'technology':
      return {
        dot: 'bg-cyan-600',
        border: 'border-slate-200 hover:border-slate-400',
        activeBorder: 'ring-2 ring-cyan-600 border-cyan-600',
        kicker: 'text-cyan-700',
      };
    case 'application':
      return {
        dot: 'bg-emerald-600',
        border: 'border-slate-200 hover:border-slate-400',
        activeBorder: 'ring-2 ring-cyan-600 border-cyan-600',
        kicker: 'text-emerald-700',
      };
    case 'challenge':
      return {
        dot: 'bg-rose-600',
        border: 'border-slate-200 hover:border-slate-400',
        activeBorder: 'ring-2 ring-cyan-600 border-cyan-600',
        kicker: 'text-rose-700',
      };
    case 'future':
      return {
        dot: 'bg-amber-600',
        border: 'border-slate-200 hover:border-slate-400',
        activeBorder: 'ring-2 ring-cyan-600 border-cyan-600',
        kicker: 'text-amber-700',
      };
    default:
      return {
        dot: 'bg-slate-500',
        border: 'border-slate-200 hover:border-slate-400',
        activeBorder: 'ring-2 ring-cyan-600 border-cyan-600',
        kicker: 'text-slate-600',
      };
  }
}

export const MindmapView: React.FC<MindmapViewProps> = ({
  initialTopic = 'Modern Transformer Architecture 2026',
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('topic');
  const [topic, setTopic] = useState(initialTopic);
  const [sourceUrlInput, setSourceUrlInput] = useState('https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)');
  const [sourceOriginUrl, setSourceOriginUrl] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [graph, setGraph] = useState<MindmapGraph | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [nodeSearch, setNodeSearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [nodeSavedSuccess, setNodeSavedSuccess] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  // Canvas viewport transform
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: -110, y: -40 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    type: 'node' | 'pan' | null;
    nodeId?: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({ type: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false });

  // Manual custom child node addition inside inspector
  const [newChildLabel, setNewChildLabel] = useState('');
  const [newChildRel, setNewChildRel] = useState('implements');
  const [newChildDesc, setNewChildDesc] = useState('');
  const [showAddChild, setShowAddChild] = useState(false);

  const applyNewGraph = (nextGraph: MindmapGraph) => {
    setGraph(nextGraph);
    setNodePositions(computeRadialLayout(nextGraph));
    const rootNode = nextGraph.nodes.find((n) => n.category === 'root') || nextGraph.nodes[0];
    setSelectedNode(rootNode || null);
    setZoomLevel(85);
    setPanOffset({ x: -110, y: -40 });
  };

  const fetchMindmap = async (targetTopic: string, contextText?: string, originUrl?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSourceOriginUrl(originUrl);
    try {
      const res = await generateMindmap(targetTopic, contextText);
      if (res && res.graph) {
        applyNewGraph(res.graph);
      } else {
        setErrorMsg('No knowledge graph nodes returned for this topic.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate knowledge graph.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromUrl = async (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean) return;
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const scraped = await scrapeWebpage(clean);
      const docTitle = scraped.title || clean;
      setTopic(docTitle);
      const contextBody = [
        scraped.metaDescription,
        scraped.headings?.join(' · '),
        scraped.textContent?.slice(0, 4500),
      ]
        .filter(Boolean)
        .join('\n\n');
      await fetchMindmap(docTitle, contextBody, clean);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to scrape URL for graph extraction.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMindmap(initialTopic);
  }, [initialTopic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceMode === 'url') {
      handleGenerateFromUrl(sourceUrlInput);
    } else if (topic.trim()) {
      fetchMindmap(topic.trim());
    }
  };

  const handleExpandNode = async (targetNode: MindmapNode) => {
    if (!graph || isExpanding) return;
    setIsExpanding(true);
    try {
      const res = await expandMindmapNode(targetNode.label, graph.root);
      if (res && res.nodes && res.nodes.length > 0) {
        const nextIdBase = Date.now();
        const newNodes: MindmapNode[] = res.nodes.map((n, idx) => ({
          id: `ext-${nextIdBase}-${idx}`,
          label: n.label,
          category: (n.category as MindmapNode['category']) || 'concept',
          description: n.description,
        }));

        const newEdges: MindmapEdge[] = newNodes.map((n) => ({
          from: targetNode.id,
          to: n.id,
          label: 'branches to',
        }));

        const updatedGraph: MindmapGraph = {
          ...graph,
          nodes: [...graph.nodes, ...newNodes],
          edges: [...(graph.edges || []), ...newEdges],
        };

        // Place new children radially from targetNode's current position
        const parentPos = nodePositions[targetNode.id] || { x: CENTER_X, y: CENTER_Y };
        const baseAngle = Math.atan2(parentPos.y - CENTER_Y, parentPos.x - CENTER_X);
        const addedPositions: Record<string, NodePosition> = {};
        newNodes.forEach((n, idx) => {
          const offset = ((idx - (newNodes.length - 1) / 2) * 0.45);
          const ang = (parentPos.x === CENTER_X && parentPos.y === CENTER_Y)
            ? (idx / newNodes.length) * Math.PI * 2
            : baseAngle + offset;
          addedPositions[n.id] = {
            x: Math.max(115, Math.min(CANVAS_W - 115, Math.round(parentPos.x + Math.cos(ang) * 215))),
            y: Math.max(70, Math.min(CANVAS_H - 70, Math.round(parentPos.y + Math.sin(ang) * 215))),
          };
        });

        setGraph(updatedGraph);
        setNodePositions((prev) => ({ ...prev, ...addedPositions }));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to expand node.');
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAddCustomChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!graph || !selectedNode || !newChildLabel.trim()) return;

    const childId = `custom-${Date.now()}`;
    const childNode: MindmapNode = {
      id: childId,
      label: newChildLabel.trim(),
      category: 'concept',
      description: newChildDesc.trim() || `User-defined concept linked from ${selectedNode.label}.`,
    };
    const edge: MindmapEdge = {
      from: selectedNode.id,
      to: childId,
      label: newChildRel.trim() || 'relates to',
    };

    const parentPos = nodePositions[selectedNode.id] || { x: CENTER_X, y: CENTER_Y };
    const ang = Math.atan2(parentPos.y - CENTER_Y, parentPos.x - CENTER_X) + 0.35;

    setGraph({
      ...graph,
      nodes: [...graph.nodes, childNode],
      edges: [...(graph.edges || []), edge],
    });
    setNodePositions((prev) => ({
      ...prev,
      [childId]: {
        x: Math.max(115, Math.min(CANVAS_W - 115, Math.round(parentPos.x + Math.cos(ang) * 200))),
        y: Math.max(70, Math.min(CANVAS_H - 70, Math.round(parentPos.y + Math.sin(ang) * 200))),
      },
    }));
    setNewChildLabel('');
    setNewChildDesc('');
    setShowAddChild(false);
    setSelectedNode(childNode);
  };

  // Drag handlers for SVG/HTML canvas nodes & background pan
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds.type) return;
      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        ds.moved = true;
      }

      if (ds.type === 'node' && ds.nodeId) {
        const scale = zoomLevel / 100;
        const nextX = Math.max(95, Math.min(CANVAS_W - 95, Math.round(ds.originX + dx / scale)));
        const nextY = Math.max(55, Math.min(CANVAS_H - 55, Math.round(ds.originY + dy / scale)));
        setNodePositions((prev) => ({
          ...prev,
          [ds.nodeId!]: { x: nextX, y: nextY },
        }));
      } else if (ds.type === 'pan') {
        setPanOffset({
          x: Math.round(ds.originX + dx),
          y: Math.round(ds.originY + dy),
        });
      }
    };

    const handlePointerUp = () => {
      dragStateRef.current.type = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [zoomLevel]);

  const startNodeDrag = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const pos = nodePositions[nodeId] || { x: CENTER_X, y: CENTER_Y };
    dragStateRef.current = {
      type: 'node',
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
  };

  const startCanvasPan = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-graph-node="true"]')) return;
    dragStateRef.current = {
      type: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      originX: panOffset.x,
      originY: panOffset.y,
      moved: false,
    };
  };

  const handleResetLayout = () => {
    if (!graph) return;
    setNodePositions(computeRadialLayout(graph));
    setZoomLevel(85);
    setPanOffset({ x: -110, y: -40 });
  };

  const focusOnNode = (node: MindmapNode) => {
    setSelectedNode(node);
    const pos = nodePositions[node.id];
    if (pos && viewportRef.current && viewMode === 'canvas') {
      const rect = viewportRef.current.getBoundingClientRect();
      const scale = zoomLevel / 100;
      setPanOffset({
        x: Math.round(rect.width / 2 - pos.x * scale),
        y: Math.round(rect.height / 2 - pos.y * scale),
      });
    }
  };

  // Derived Mermaid syntax
  const mermaidSyntax = useMemo(() => {
    if (!graph) return '';
    const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_]/g, '_');
    const safeLabel = (lbl: string) => lbl.replace(/"/g, "'");
    const lines: string[] = ['flowchart LR'];
    graph.nodes.forEach((n) => {
      const sid = safeId(n.id);
      if (n.category === 'root') {
        lines.push(`  ${sid}(["${safeLabel(n.label)}"])`);
      } else {
        lines.push(`  ${sid}["${safeLabel(n.label)}"]`);
      }
    });
    (graph.edges || []).forEach((e) => {
      lines.push(`  ${safeId(e.from)} -->|"${safeLabel(e.label)}"| ${safeId(e.to)}`);
    });
    return lines.join('\n');
  }, [graph]);

  const handleSaveSingleNodeNote = (node: MindmapNode) => {
    if (!graph) return;
    const noteTitle = `Concept: ${node.label} (${graph.root})`;
    let md = `# ${node.label}\n\n`;
    md += `Category: ${node.category} · Parent Domain: ${graph.root}\n\n`;
    md += `## Definition & Analysis\n${node.description}\n\n`;

    const outgoing = (graph.edges || []).filter((e) => e.from === node.id);
    const incoming = (graph.edges || []).filter((e) => e.to === node.id);

    if (incoming.length > 0 || outgoing.length > 0) {
      md += `## Knowledge Linkages\n`;
      incoming.forEach((e) => {
        const src = graph.nodes.find((n) => n.id === e.from)?.label || e.from;
        md += `- **${src}** —[${e.label}]→ *${node.label}*\n`;
      });
      outgoing.forEach((e) => {
        const tgt = graph.nodes.find((n) => n.id === e.to)?.label || e.to;
        md += `- *${node.label}* —[${e.label}]→ **${tgt}**\n`;
      });
    }

    onSaveAsNote(
      noteTitle,
      md,
      sourceOriginUrl || `aksh://mindmap?topic=${encodeURIComponent(graph.root)}`
    );
    setNodeSavedSuccess(true);
    setTimeout(() => setNodeSavedSuccess(false), 2500);
  };

  const handleSaveToNotes = () => {
    if (!graph) return;
    const noteTitle = `Knowledge Graph: ${graph.root}`;
    let md = `# Knowledge Graph: ${graph.root}\n\n`;
    md += `Generated on ${new Date().toLocaleDateString()} · ${graph.nodes.length} nodes · ${graph.edges.length} edges\n\n`;
    md += `## Taxonomy & Concepts\n\n`;

    graph.nodes.forEach((node) => {
      md += `### ${node.label} (${node.category})\n`;
      md += `${node.description}\n\n`;
    });

    md += `## Semantic Relationships\n\n`;
    graph.edges.forEach((edge) => {
      const fromNode = graph.nodes.find((n) => n.id === edge.from)?.label || edge.from;
      const toNode = graph.nodes.find((n) => n.id === edge.to)?.label || edge.to;
      md += `- **${fromNode}** → *${edge.label}* → **${toNode}**\n`;
    });

    md += `\n## Mermaid Diagram\n\`\`\`mermaid\n${mermaidSyntax}\n\`\`\`\n`;

    onSaveAsNote(
      noteTitle,
      md,
      sourceOriginUrl || `aksh://mindmap?topic=${encodeURIComponent(graph.root)}`
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadSvg = () => {
    if (!graph) return;
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const edgeSvg = (graph.edges || [])
      .map((edge) => {
        const from = nodePositions[edge.from];
        const to = nodePositions[edge.to];
        if (!from || !to) return '';
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 24;
        return `
          <path d="M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}" fill="none" stroke="#94a3b8" stroke-width="1.75" marker-end="url(#arrow)" />
          <text x="${mx}" y="${my + 10}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#475569">${esc(edge.label)}</text>
        `;
      })
      .join('');

    const nodeSvg = graph.nodes
      .map((n) => {
        const pos = nodePositions[n.id] || { x: CENTER_X, y: CENTER_Y };
        const isRoot = n.category === 'root';
        const w = isRoot ? 230 : 196;
        const h = isRoot ? 76 : 68;
        const fill = isRoot ? '#0f172a' : '#ffffff';
        const stroke = isRoot ? '#0891b2' : '#cbd5e1';
        const textFill = isRoot ? '#ffffff' : '#0f172a';
        const subFill = isRoot ? '#67e8f9' : '#64748b';
        return `
          <g transform="translate(${pos.x - w / 2}, ${pos.y - h / 2})">
            <rect width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="${subFill}">${esc(n.category.toUpperCase())}</text>
            <text x="14" y="44" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="${textFill}">${esc(n.label.slice(0, 26))}</text>
          </g>
        `;
      })
      .join('');

    const svgDoc = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" width="${CANVAS_W}" height="${CANVAS_H}" style="background:#f8fafc">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
    </marker>
  </defs>
  ${edgeSvg}
  ${nodeSvg}
</svg>`;

    const blob = new Blob([svgDoc], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graph.root.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-graph.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!graph) return;
    const blob = new Blob([JSON.stringify({ ...graph, positions: nodePositions }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graph.root.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-graph.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ['all', 'root', 'concept', 'technology', 'application', 'challenge', 'future'];

  const filteredNodes = useMemo(() => {
    if (!graph) return [];
    const q = nodeSearch.trim().toLowerCase();
    return graph.nodes.filter((n) => {
      const catOk = activeFilter === 'all' || n.category === activeFilter;
      const searchOk =
        !q ||
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [graph, activeFilter, nodeSearch]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const degreeCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    (graph?.edges || []).forEach((e) => {
      counts[e.from] = (counts[e.from] || 0) + 1;
      counts[e.to] = (counts[e.to] || 0) + 1;
    });
    return counts;
  }, [graph]);

  const activeFocusId = hoveredNodeId || selectedNode?.id || null;

  return (
    <div className="h-full bg-slate-50 text-slate-900 flex flex-col overflow-hidden select-none">
      {/* Clean Workspace Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Knowledge Graph Studio
            </h2>
            <p className="text-xs text-slate-500">
              Topological synthesis · Draggable spatial canvas · Mermaid &amp; SVG export
            </p>
          </div>
        </div>

        {/* Source Input Bar (Topic Prompt or Live URL) */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setSourceMode('topic')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                sourceMode === 'topic'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Topic
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('url')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                sourceMode === 'url'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>URL</span>
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={sourceMode === 'url' ? sourceUrlInput : topic}
              onChange={(e) =>
                sourceMode === 'url'
                  ? setSourceUrlInput(e.target.value)
                  : setTopic(e.target.value)
              }
              placeholder={
                sourceMode === 'url'
                  ? 'Paste webpage URL to extract concept graph...'
                  : 'Enter any topic or architecture...'
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{sourceMode === 'url' ? 'Extract Graph' : 'Synthesize'}</span>
          </button>
        </form>

        {/* Segmented View Switcher & Save */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Spatial</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('export')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'export'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Mermaid</span>
            </button>
          </div>

          <button
            onClick={handleSaveToNotes}
            disabled={!graph}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
              savedSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {savedSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <StickyNote className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{savedSuccess ? 'Saved' : 'Save Note'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Toolbar: Presets, Category Filters & Viewport Controls */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                activeFilter === cat
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Node Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              placeholder="Filter nodes..."
              className="w-36 bg-white border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
            />
          </div>

          {viewMode === 'canvas' && (
            <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono tabular-nums px-1 text-slate-700 min-w-[38px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
              <button
                onClick={handleResetLayout}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                title="Reset Spatial Layout"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Fit</span>
              </button>
            </div>
          )}

          {graph && (
            <span className="text-xs text-slate-500 font-mono tabular-nums hidden lg:inline">
              {graph.nodes.length} nodes · {(graph.edges || []).length} edges
            </span>
          )}
        </div>
      </div>

      {/* Topic Sparks Strip */}
      <div className="px-4 py-1.5 bg-white border-b border-slate-200 flex items-center gap-3 overflow-x-auto text-xs shrink-0">
        <span className="text-slate-400 font-medium shrink-0">Explore:</span>
        {PRESET_TOPICS.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setSourceMode('topic');
              setTopic(preset);
              fetchMindmap(preset);
            }}
            className="text-slate-600 hover:text-cyan-700 hover:underline underline-offset-4 whitespace-nowrap cursor-pointer transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Main Workspace + Inspector Drawer */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Primary Canvas / Matrix / Export Area */}
        <div
          ref={viewportRef}
          onPointerDown={viewMode === 'canvas' ? startCanvasPan : undefined}
          className={`flex-1 relative overflow-hidden ${
            viewMode === 'canvas'
              ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] bg-slate-50 cursor-grab active:cursor-grabbing'
              : 'overflow-y-auto bg-slate-50 p-6'
          }`}
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-9 h-9 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-900">
                Synthesizing topological knowledge graph...
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Mapping entities, architectural concepts, and directed semantic edges
              </p>
            </div>
          ) : errorMsg ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <p className="text-sm font-medium text-rose-700">{errorMsg}</p>
              <button
                onClick={() => fetchMindmap(topic)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer"
              >
                Retry Synthesis
              </button>
            </div>
          ) : !graph ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Network className="w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-600">
                Enter any topic or webpage URL above to build an interactive knowledge graph.
              </p>
            </div>
          ) : viewMode === 'canvas' ? (
            /* SPATIAL TOPOLOGICAL GRAPH CANVAS */
            <div
              style={{
                width: CANVAS_W,
                height: CANVAS_H,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
                transformOrigin: '0 0',
              }}
              className="relative"
            >
              {/* SVG Layer: Directed Bezier Curves + Labels */}
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                className="absolute inset-0 pointer-events-none"
              >
                <defs>
                  <marker
                    id="edge-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="edge-arrow-active"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#0891b2" />
                  </marker>
                </defs>

                {(graph.edges || []).map((edge, idx) => {
                  const fromPos = nodePositions[edge.from];
                  const toPos = nodePositions[edge.to];
                  if (!fromPos || !toPos) return null;

                  const bothVisible =
                    visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
                  const isHighlighted =
                    activeFocusId === edge.from || activeFocusId === edge.to;

                  // Smooth perpendicular curve offset
                  const dx = toPos.x - fromPos.x;
                  const dy = toPos.y - fromPos.y;
                  const cx = (fromPos.x + toPos.x) / 2 - dy * 0.08;
                  const cy = (fromPos.y + toPos.y) / 2 + dx * 0.08;

                  // Shorten end slightly so arrow stays clean near card border
                  const angle = Math.atan2(toPos.y - cy, toPos.x - cx);
                  const endX = toPos.x - Math.cos(angle) * 46;
                  const endY = toPos.y - Math.sin(angle) * 32;

                  const labelX = 0.25 * fromPos.x + 0.5 * cx + 0.25 * endX;
                  const labelY = 0.25 * fromPos.y + 0.5 * cy + 0.25 * endY;

                  return (
                    <g
                      key={`${edge.from}-${edge.to}-${idx}`}
                      opacity={bothVisible ? (activeFocusId && !isHighlighted ? 0.35 : 1) : 0.12}
                    >
                      <path
                        d={`M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${endX} ${endY}`}
                        fill="none"
                        stroke={isHighlighted ? '#0891b2' : '#cbd5e1'}
                        strokeWidth={isHighlighted ? 2.25 : 1.5}
                        markerEnd={
                          isHighlighted
                            ? 'url(#edge-arrow-active)'
                            : 'url(#edge-arrow)'
                        }
                      />
                      {edge.label && (
                        <g transform={`translate(${labelX}, ${labelY})`}>
                          <rect
                            x={-Math.min(68, edge.label.length * 3.3 + 8)}
                            y={-9}
                            width={Math.min(136, edge.label.length * 6.6 + 16)}
                            height={18}
                            rx={4}
                            fill={isHighlighted ? '#ecfeff' : '#f8fafc'}
                            stroke={isHighlighted ? '#a5f3fc' : '#e2e8f0'}
                            strokeWidth={1}
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={10}
                            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                            fill={isHighlighted ? '#0e7490' : '#64748b'}
                          >
                            {edge.label.length > 20 ? `${edge.label.slice(0, 19)}…` : edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Draggable Nodes Layer */}
              {graph.nodes.map((node) => {
                const pos = nodePositions[node.id] || { x: CENTER_X, y: CENTER_Y };
                const isRoot = node.category === 'root';
                const isSelected = selectedNode?.id === node.id;
                const isVisible = visibleNodeIds.has(node.id);
                const linksCount = degreeCountMap[node.id] || 0;
                const accent = getCategoryAccent(node.category);

                return (
                  <div
                    key={node.id}
                    data-graph-node="true"
                    onPointerDown={(e) => startNodeDrag(e, node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => {
                      if (!dragStateRef.current.moved) {
                        setSelectedNode(node);
                      }
                    }}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute w-52 rounded-xl border p-3.5 transition-shadow cursor-grab active:cursor-grabbing ${
                      isRoot
                        ? 'bg-slate-900 text-white shadow-lg w-60'
                        : 'bg-white text-slate-900 shadow-xs hover:shadow-md'
                    } ${isSelected ? accent.activeBorder : accent.border} ${
                      isVisible ? 'opacity-100' : 'opacity-20 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className={`text-[11px] font-medium capitalize truncate ${accent.kicker}`}>
                        {isRoot ? 'Central Root' : node.category}
                        <span className="mx-1 opacity-50">·</span>
                        <span className="font-mono tabular-nums">{linksCount}</span>
                      </div>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                          handleExpandNode(node);
                        }}
                        title="Expand sub-concepts"
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isRoot
                            ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-cyan-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-xs font-semibold leading-snug line-clamp-2">
                      {node.label}
                    </h4>
                    <p
                      className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                        isRoot ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {node.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'matrix' ? (
            /* STRUCTURED HIERARCHY & MATRIX VIEW */
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="pb-4 border-b border-slate-200 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Central Domain · {graph.nodes.length} Concepts · {(graph.edges || []).length} Relationships
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                    {graph.root}
                  </h3>
                </div>
                {sourceOriginUrl && (
                  <button
                    onClick={() => onNavigateUrl(sourceOriginUrl)}
                    className="text-xs text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Source Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const links = degreeCountMap[node.id] || 0;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-600 ring-2 ring-cyan-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="capitalize font-medium text-slate-700">
                          {node.category}
                        </span>
                        <span className="font-mono tabular-nums">{links} links</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                        {node.label}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {node.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {graph.edges && graph.edges.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Directed Relationship Ledger</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {graph.edges.map((edge, idx) => {
                      const fromNode = graph.nodes.find((n) => n.id === edge.from);
                      const toNode = graph.nodes.find((n) => n.id === edge.to);
                      return (
                        <div
                          key={idx}
                          className="py-2 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              onClick={() => fromNode && setSelectedNode(fromNode)}
                              className="font-medium text-slate-900 hover:text-cyan-700 cursor-pointer truncate"
                            >
                              {fromNode?.label || edge.from}
                            </button>
                            <span className="text-slate-400 font-mono text-[11px] shrink-0">
                              — {edge.label} →
                            </span>
                            <button
                              onClick={() => toNode && setSelectedNode(toNode)}
                              className="font-medium text-cyan-800 hover:underline cursor-pointer truncate"
                            >
                              {toNode?.label || edge.to}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* MERMAID & VECTOR EXPORT VIEW */
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Portable Graph Exports
                    </h3>
                    <p className="text-xs text-slate-500">
                      Export current spatial topology as scalable vector graphics, Mermaid syntax, or structured JSON
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadSvg}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SVG</span>
                    </button>
                    <button
                      onClick={handleDownloadJson}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Mermaid.js Diagram Source
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mermaidSyntax);
                        setCopiedMermaid(true);
                        setTimeout(() => setCopiedMermaid(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMermaid ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Mermaid</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed select-text">
                    {mermaidSyntax}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Node Deep-Dive Inspector Panel */}
        {selectedNode && graph && (
          <div className="fixed inset-x-0 bottom-0 z-30 max-h-[60vh] md:relative md:inset-auto md:max-h-none md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0 select-text overflow-y-auto shadow-xl md:shadow-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="text-xs text-slate-500 capitalize">
                  <span className="font-semibold text-slate-800">{selectedNode.category}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono">#{selectedNode.id.slice(0, 10)}</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Neighbor Traversal Links */}
              {(() => {
                const connected = (graph.edges || []).filter(
                  (e) => e.from === selectedNode.id || e.to === selectedNode.id
                );
                if (!connected.length) return null;
                return (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="text-xs font-medium text-slate-500">
                      Connected Neighbors ({connected.length})
                    </div>
                    <div className="space-y-1">
                      {connected.map((edge, idx) => {
                        const isOutgoing = edge.from === selectedNode.id;
                        const peerId = isOutgoing ? edge.to : edge.from;
                        const peerNode = graph.nodes.find((n) => n.id === peerId);
                        if (!peerNode) return null;
                        return (
                          <button
                            key={idx}
                            onClick={() => focusOnNode(peerNode)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <span className="truncate font-medium text-slate-800">
                              {isOutgoing ? `→ ${peerNode.label}` : `← ${peerNode.label}`}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {edge.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Custom Linked Node Addition */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Actions</span>
                  <button
                    onClick={() => setShowAddChild((v) => !v)}
                    className="text-xs font-medium text-cyan-700 hover:underline cursor-pointer"
                  >
                    {showAddChild ? 'Cancel' : '+ Add Custom Child'}
                  </button>
                </div>

                {showAddChild && (
                  <form
                    onSubmit={handleAddCustomChild}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <input
                      type="text"
                      value={newChildLabel}
                      onChange={(e) => setNewChildLabel(e.target.value)}
                      placeholder="Child concept name..."
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-600"
                    />
                    <input
                      type="text"
                      value={newChildRel}
                      onChange={(e) => setNewChildRel(e.target.value)}
                      placeholder="Relationship verb (e.g. optimizes)"
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-600"
                    />
                    <textarea
                      rows={2}
                      value={newChildDesc}
                      onChange={(e) => setNewChildDesc(e.target.value)}
                      placeholder="Brief definition (optional)"
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-600"
                    />
                    <button
                      type="submit"
                      disabled={!newChildLabel.trim()}
                      className="w-full py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium disabled:opacity-40 cursor-pointer"
                    >
                      Link Concept
                    </button>
                  </form>
                )}

                <button
                  onClick={() => handleExpandNode(selectedNode)}
                  disabled={isExpanding}
                  className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className={`w-3.5 h-3.5 ${isExpanding ? 'animate-spin' : ''}`} />
                    <span>{isExpanding ? 'Expanding Graph...' : 'Expand Sub-Concepts with AI'}</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  onClick={() => handleSaveSingleNodeNote(selectedNode)}
                  className="w-full p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {nodeSavedSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{nodeSavedSuccess ? 'Saved to Notes' : 'Save Concept to Notes'}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() =>
                    onNavigateUrl(`aksh://research?q=${encodeURIComponent(selectedNode.label)}`)
                  }
                  className="w-full p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deep Research Topic</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() =>
                    onNavigateUrl(`https://www.google.com/search?q=${encodeURIComponent(selectedNode.label)}`)
                  }
                  className="w-full p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">Search "{selectedNode.label}"</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
