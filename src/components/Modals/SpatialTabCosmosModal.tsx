import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Orbit,
  Sparkles,
  Search,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Cpu,
  Split,
  Eye,
  Check,
  Zap,
  Globe,
  Sliders,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Tab } from '../../types';

interface SpatialTabCosmosModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onSplitTab?: (tabId: string, position: 'left' | 'right') => void;
  onSynthesizeTabs?: (selectedTabIds: string[]) => void;
}

interface CosmosNode {
  id: string;
  tab: Tab;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  cluster: string;
  color: string;
  orbitRadius: number;
  angle: number;
  speed: number;
}

const CLUSTERS: Record<string, { name: string; color: string; ringColor: string; bgGlow: string }> = {
  ai: {
    name: 'AI & Intelligence',
    color: '#8b5cf6',
    ringColor: 'rgba(139, 92, 246, 0.4)',
    bgGlow: 'rgba(139, 92, 246, 0.15)',
  },
  dev: {
    name: 'Engineering & Systems',
    color: '#06b6d4',
    ringColor: 'rgba(6, 182, 212, 0.4)',
    bgGlow: 'rgba(6, 182, 212, 0.15)',
  },
  research: {
    name: 'Research & Literature',
    color: '#10b981',
    ringColor: 'rgba(16, 185, 129, 0.4)',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
  },
  media: {
    name: 'Web & Media',
    color: '#f59e0b',
    ringColor: 'rgba(245, 158, 11, 0.4)',
    bgGlow: 'rgba(245, 158, 11, 0.15)',
  },
  general: {
    name: 'General Exploration',
    color: '#6366f1',
    ringColor: 'rgba(99, 102, 241, 0.4)',
    bgGlow: 'rgba(99, 102, 241, 0.15)',
  },
};

function assignCluster(tab: Tab): string {
  const url = tab.url.toLowerCase();
  const title = tab.title.toLowerCase();
  if (
    url.includes('ai') ||
    url.includes('gemini') ||
    url.includes('chatgpt') ||
    url.includes('claude') ||
    title.includes('ai') ||
    title.includes('gpt') ||
    title.includes('model')
  ) {
    return 'ai';
  }
  if (
    url.includes('github') ||
    url.includes('localhost') ||
    url.includes('developer') ||
    url.includes('devtools') ||
    url.includes('api') ||
    tab.contentType === 'devtools' ||
    tab.contentType === 'terminal' ||
    tab.contentType === 'scripts'
  ) {
    return 'dev';
  }
  if (
    url.includes('arxiv') ||
    url.includes('wikipedia') ||
    url.includes('paper') ||
    tab.contentType === 'pdf' ||
    tab.contentType === 'research' ||
    title.includes('research')
  ) {
    return 'research';
  }
  if (
    url.includes('youtube') ||
    url.includes('news') ||
    url.includes('medium') ||
    url.includes('reddit') ||
    url.includes('twitter')
  ) {
    return 'media';
  }
  return 'general';
}

export const SpatialTabCosmosModal: React.FC<SpatialTabCosmosModalProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onSplitTab,
  onSynthesizeTabs,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<CosmosNode | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isRotating, setIsRotating] = useState(true);
  const [hibernatedTabs, setHibernatedTabs] = useState<Set<string>>(new Set());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const nodesRef = useRef<CosmosNode[]>([]);
  const isDraggingCanvasRef = useRef(false);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Initialize or update nodes based on tabs
  useEffect(() => {
    if (!isOpen) return;

    const width = 1200;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;

    const existingMap = new Map(nodesRef.current.map((n) => [n.id, n]));

    const newNodes: CosmosNode[] = tabs.map((tab, idx) => {
      const existing = existingMap.get(tab.id);
      const clusterKey = assignCluster(tab);
      const clusterInfo = CLUSTERS[clusterKey] || CLUSTERS.general;
      const memMb = tab.memoryMb || (50 + (tab.id.charCodeAt(0) % 70));
      const radius = Math.max(22, Math.min(42, 18 + memMb * 0.22));

      // Orbital parameters
      const orbitTier = (idx % 3) + 1;
      const baseOrbitRadius = 130 * orbitTier;
      const initialAngle = (idx / Math.max(1, tabs.length)) * Math.PI * 2;
      const speed = (0.0015 / orbitTier) * (idx % 2 === 0 ? 1 : -1);

      if (existing) {
        return {
          ...existing,
          tab,
          radius,
          cluster: clusterKey,
          color: clusterInfo.color,
        };
      }

      return {
        id: tab.id,
        tab,
        x: centerX + Math.cos(initialAngle) * baseOrbitRadius,
        y: centerY + Math.sin(initialAngle) * baseOrbitRadius,
        vx: 0,
        vy: 0,
        radius,
        cluster: clusterKey,
        color: clusterInfo.color,
        orbitRadius: baseOrbitRadius,
        angle: initialAngle,
        speed,
      };
    });

    nodesRef.current = newNodes;
  }, [isOpen, tabs]);

  // Main canvas animation loop with gravity and orbital physics
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2 + panOffsetRef.current.x;
      const centerY = height / 2 + panOffsetRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // Save context for camera transformation (Pan & Zoom)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Draw background space coordinates & orbital tracks
      const primaryCenter = { x: width / 2, y: height / 2 };

      // Orbital rings
      [130, 260, 390].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(primaryCenter.x, primaryCenter.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.08 - idx * 0.02})`;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Central core node (AI Kernel / User session hub)
      const coreGradient = ctx.createRadialGradient(
        primaryCenter.x,
        primaryCenter.y,
        0,
        primaryCenter.x,
        primaryCenter.y,
        50
      );
      coreGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
      coreGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
      coreGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.beginPath();
      ctx.arc(primaryCenter.x, primaryCenter.y, 50, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(primaryCenter.x, primaryCenter.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw connections between related tabs (same cluster or matching terms)
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const isSameCluster = a.cluster === b.cluster;
          const isSameGroup = a.tab.groupName && a.tab.groupName === b.tab.groupName;

          if (isSameCluster || isSameGroup) {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 260) {
              const alpha = Math.max(0.04, (1 - dist / 260) * (isSameGroup ? 0.35 : 0.18));
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = isSameGroup ? a.tab.groupColor || '#ec4899' : a.color;
              ctx.globalAlpha = alpha;
              ctx.lineWidth = isSameGroup ? 1.5 : 1;
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }

      // Update positions if rotating
      if (isRotating && !draggedNodeId) {
        localAngle += 0.001;
        nodes.forEach((node) => {
          node.angle += node.speed;
          node.x = primaryCenter.x + Math.cos(node.angle) * node.orbitRadius;
          node.y = primaryCenter.y + Math.sin(node.angle) * node.orbitRadius;
        });
      }

      // Render tab nodes
      nodes.forEach((node) => {
        const isActive = node.id === activeTabId;
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNodes.has(node.id);
        const isHibernated = hibernatedTabs.has(node.id);

        const passesFilter =
          (selectedClusterFilter === 'all' || node.cluster === selectedClusterFilter) &&
          (!searchFilter.trim() ||
            node.tab.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
            node.tab.url.toLowerCase().includes(searchFilter.toLowerCase()));

        const nodeAlpha = passesFilter ? 1.0 : 0.25;
        ctx.globalAlpha = nodeAlpha;

        // Outer glow on hover or active
        if (isActive || isHovered || isSelected) {
          const glowGrad = ctx.createRadialGradient(
            node.x,
            node.y,
            node.radius * 0.8,
            node.x,
            node.y,
            node.radius * 1.8
          );
          glowGrad.addColorStop(0, node.color);
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Node circle background
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHibernated ? '#1e293b' : '#0f172a';
        ctx.fill();

        // Node stroke ring
        ctx.lineWidth = isActive ? 3 : isSelected ? 2.5 : 1.5;
        ctx.strokeStyle = isActive
          ? '#38bdf8'
          : isSelected
          ? '#ec4899'
          : isHibernated
          ? '#475569'
          : node.color;
        ctx.stroke();

        // Active pulsing ring
        if (isActive) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5 + Math.sin(Date.now() / 250) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Selected marker checkbox badge
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x + node.radius * 0.7, node.y - node.radius * 0.7, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ec4899';
          ctx.fill();
        }

        // Tab label truncated
        ctx.fillStyle = isHibernated ? '#94a3b8' : '#f8fafc';
        ctx.font = `600 ${Math.max(10, Math.min(12, node.radius * 0.38))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const shortTitle =
          node.tab.title.length > 12 ? node.tab.title.slice(0, 10) + '…' : node.tab.title || 'Tab';
        ctx.fillText(shortTitle, node.x, node.y);

        // Subtext: Memory MB
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 9px monospace';
        const memText = isHibernated ? 'Zzz' : `${Math.round(node.tab.memoryMb || 65)}MB`;
        ctx.fillText(memText, node.x, node.y + 12);

        ctx.globalAlpha = 1.0;
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isOpen,
    zoom,
    isRotating,
    draggedNodeId,
    activeTabId,
    hoveredNode,
    selectedNodes,
    selectedClusterFilter,
    searchFilter,
    hibernatedTabs,
  ]);

  // Coordinate conversion helper from Screen to Canvas World
  const getCanvasWorldPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + panOffsetRef.current.x;
    const centerY = height / 2 + panOffsetRef.current.y;

    const worldX = (screenX - centerX) / zoom + width / 2;
    const worldY = (screenY - centerY) / zoom + height / 2;

    return { x: worldX, y: worldY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasWorldPos(e);
    const hitNode = nodesRef.current.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    if (hitNode) {
      if (e.shiftKey) {
        // Multi-select toggle
        setSelectedNodes((prev) => {
          const next = new Set(prev);
          if (next.has(hitNode.id)) next.delete(hitNode.id);
          else next.add(hitNode.id);
          return next;
        });
      } else {
        setDraggedNodeId(hitNode.id);
      }
    } else {
      isDraggingCanvasRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasWorldPos(e);

    if (draggedNodeId) {
      const node = nodesRef.current.find((n) => n.id === draggedNodeId);
      if (node) {
        node.x = x;
        node.y = y;
        const canvas = canvasRef.current;
        if (canvas) {
          const primaryCenter = { x: canvas.width / 2, y: canvas.height / 2 };
          const dx = node.x - primaryCenter.x;
          const dy = node.y - primaryCenter.y;
          node.orbitRadius = Math.sqrt(dx * dx + dy * dy);
          node.angle = Math.atan2(dy, dx);
        }
      }
    } else if (isDraggingCanvasRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      panOffsetRef.current = {
        x: panOffsetRef.current.x + dx,
        y: panOffsetRef.current.y + dy,
      };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const hitNode = nodesRef.current.find((node) => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius;
      });
      setHoveredNode(hitNode || null);
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    isDraggingCanvasRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasWorldPos(e);
    const hitNode = nodesRef.current.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    if (hitNode && !e.shiftKey) {
      onSelectTab(hitNode.id);
      onClose();
    }
  };

  const handleReorganizeConstellations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const clustersList = Object.keys(CLUSTERS);
    const clusterAngles = clustersList.reduce<Record<string, number>>((acc, key, i) => {
      acc[key] = (i / clustersList.length) * Math.PI * 2;
      return acc;
    }, {});

    nodesRef.current.forEach((node, idx) => {
      const baseAngle = clusterAngles[node.cluster] || 0;
      const offset = ((idx % 4) - 1.5) * 0.35;
      const finalAngle = baseAngle + offset;
      node.orbitRadius = 180 + (idx % 3) * 75;
      node.angle = finalAngle;
      node.x = centerX + Math.cos(finalAngle) * node.orbitRadius;
      node.y = centerY + Math.sin(finalAngle) * node.orbitRadius;
    });
  };

  const handlePurgeMemory = () => {
    const toHibernate = new Set<string>();
    tabs.forEach((tab) => {
      if (tab.id !== activeTabId && (tab.memoryMb || 60) > 70) {
        toHibernate.add(tab.id);
      }
    });
    setHibernatedTabs(toHibernate);
  };

  const totalCosmosMemory = useMemo(() => {
    return tabs.reduce((acc, tab) => acc + (tab.memoryMb || 65), 0);
  }, [tabs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Orbit className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm tracking-wide">Tab Cosmos 2D Graph</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {tabs.length} tabs • {totalCosmosMemory} MB RAM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive spatial semantic galaxy. Click any node to switch; Shift+Click to multi-select.
              </p>
            </div>
          </div>

          {/* Quick Filter & Cluster Select */}
          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search cosmic nodes..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Clusters Filter */}
            <select
              value={selectedClusterFilter}
              onChange={(e) => setSelectedClusterFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Sectors</option>
              {Object.entries(CLUSTERS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.name}
                </option>
              ))}
            </select>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Tab Cosmos (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cosmos Workspace Canvas */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="w-full h-full block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
          />

          {/* Floating Canvas Controls */}
          <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                panOffsetRef.current = { x: 0, y: 0 };
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => setIsRotating((r) => !r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isRotating
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>{isRotating ? 'Orbit Active' : 'Static'}</span>
            </button>
            <button
              onClick={handleReorganizeConstellations}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Constellations</span>
            </button>
            <button
              onClick={handlePurgeMemory}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Hibernate heavy background tabs"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hibernate Idle</span>
            </button>
          </div>

          {/* Hovered Node Inspection Card */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute top-5 right-5 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-20 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: hoveredNode.color }}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {CLUSTERS[hoveredNode.cluster]?.name || 'General'}
                    </span>
                  </div>
                  {hoveredNode.id === activeTabId && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      Active Tab
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-slate-100 line-clamp-2 leading-tight">
                    {hoveredNode.tab.title || 'Untitled Tab'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {hoveredNode.tab.url}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Memory RAM</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {Math.round(hoveredNode.tab.memoryMb || 65)} MB
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {hibernatedTabs.has(hoveredNode.id) ? 'Sleeping (RAM Freed)' : 'Alive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectTab(hoveredNode.id);
                      onClose();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Focus Tab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onSplitTab && (
                    <button
                      onClick={() => {
                        onSplitTab(hoveredNode.id, 'right');
                        onClose();
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                      title="Split View with this tab"
                    >
                      <Split className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onCloseTab(hoveredNode.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                    title="Close tab"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Multi-Selection Synthesis Action Bar */}
          <AnimatePresence>
            {selectedNodes.size > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-5 right-5 bg-indigo-900/90 border border-indigo-500/50 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs z-20"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  <span className="font-semibold text-indigo-100">
                    {selectedNodes.size} Tabs Selected
                  </span>
                </div>
                {onSynthesizeTabs && (
                  <button
                    onClick={() => {
                      onSynthesizeTabs(Array.from(selectedNodes));
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cross-Synthesize</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedNodes(new Set())}
                  className="p-1 text-indigo-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
