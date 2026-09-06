import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network,
  Sparkles,
  Zap,
  StickyNote,
  Search,
  Plus,
  RefreshCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Share2,
  Layers,
  Cpu,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { generateMindmap } from '../../services/api';
import { MindmapGraph, MindmapNode } from '../../types';

interface MindmapViewProps {
  initialTopic?: string;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl: (url: string) => void;
}

export const MindmapView: React.FC<MindmapViewProps> = ({
  initialTopic = 'Modern Transformer Architecture 2026',
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [isLoading, setIsLoading] = useState(false);
  const [graph, setGraph] = useState<MindmapGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchMindmap = async (targetTopic: string) => {
    setIsLoading(true);
    try {
      const res = await generateMindmap(targetTopic);
      if (res && res.graph) {
        setGraph(res.graph);
        // Select root or first node
        const rootNode = res.graph.nodes.find((n) => n.category === 'root') || res.graph.nodes[0];
        setSelectedNode(rootNode || null);
      }
    } catch (err) {
      console.error('Failed to generate mindmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMindmap(initialTopic);
  }, [initialTopic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    fetchMindmap(topic.trim());
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'root':
        return 'from-blue-600 to-indigo-600 border-blue-400 text-white shadow-md';
      case 'concept':
        return 'from-purple-50 to-indigo-50 border-purple-200 text-purple-950 shadow-2xs hover:border-purple-300';
      case 'technology':
        return 'from-cyan-50 to-blue-50 border-cyan-200 text-cyan-950 shadow-2xs hover:border-cyan-300';
      case 'application':
        return 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950 shadow-2xs hover:border-emerald-300';
      case 'challenge':
        return 'from-rose-50 to-pink-50 border-rose-200 text-rose-950 shadow-2xs hover:border-rose-300';
      case 'future':
        return 'from-amber-50 to-orange-50 border-amber-200 text-amber-950 shadow-2xs hover:border-amber-300';
      default:
        return 'from-slate-50 to-white border-slate-200 text-slate-900 shadow-2xs hover:border-slate-300';
    }
  };

  const handleSaveToNotes = () => {
    if (!graph) return;
    const noteTitle = `Concept Mindmap: ${graph.root}`;
    let md = `# Visual Mindmap & Concept Graph: ${graph.root}\n\n`;
    md += `*Generated automatically by Aksh AI on ${new Date().toLocaleDateString()}*\n\n`;
    md += `## Key Nodes & Taxonomy\n\n`;

    graph.nodes.forEach((node) => {
      md += `### ${node.label} (${node.category.toUpperCase()})\n`;
      md += `${node.description}\n\n`;
    });

    md += `## Relationship Graph Matrix\n\n`;
    graph.edges.forEach((edge) => {
      const fromNode = graph.nodes.find((n) => n.id === edge.from)?.label || edge.from;
      const toNode = graph.nodes.find((n) => n.id === edge.to)?.label || edge.to;
      md += `- **${fromNode}** → *${edge.label}* → **${toNode}**\n`;
    });

    onSaveAsNote(noteTitle, md, `aksh://mindmap?topic=${encodeURIComponent(graph.root)}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const categories = ['all', 'root', 'concept', 'technology', 'application', 'future'];
  const filteredNodes = graph?.nodes.filter((n) => activeFilter === 'all' || n.category === activeFilter) || [];

  return (
    <div className="h-full bg-slate-50 text-slate-900 flex flex-col overflow-hidden select-none">
      {/* Top Controls Header */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>AI Concept Mindmap & Knowledge Graph</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 font-semibold">
                Gemini 3.7 Graph Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Interactive topological knowledge breakdown with contextual relationships
            </p>
          </div>
        </div>

        {/* Search Topic Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g. Transformer Attention, Quantum ML)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate</span>
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToNotes}
            disabled={!graph}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
            }`}
          >
            {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <StickyNote className="w-3.5 h-3.5 text-amber-600" />}
            <span>{savedSuccess ? 'Saved to Notes!' : 'Save as Note'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-500" />
          <span>Filters:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
              activeFilter === cat
                ? 'bg-white border-cyan-400 text-cyan-800 shadow-2xs'
                : 'bg-white/70 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Canvas + Side Inspection Drawer */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Interactive Mindmap Visual Grid Canvas */}
        <div className="flex-1 overflow-auto p-6 relative flex flex-col items-center justify-start bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] bg-slate-50">
          {isLoading ? (
            <div className="my-auto text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-cyan-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-cyan-900">
                Aksh AI is synthesizing concept graph nodes & topological links...
              </p>
              <p className="text-xs text-slate-500">
                Extracting core principles, hierarchies, algorithms and downstream applications
              </p>
            </div>
          ) : graph ? (
            <div className="w-full max-w-5xl space-y-8 my-auto py-4">
              {/* Root Concept Center Card */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => {
                    const r = graph.nodes.find((n) => n.category === 'root') || graph.nodes[0];
                    setSelectedNode(r);
                  }}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 border-2 border-white text-white shadow-xl cursor-pointer hover:scale-105 transition-all text-center max-w-md"
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-100 font-bold mb-1">
                    Central Knowledge Root
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">{graph.root}</h3>
                </motion.div>
              </div>

              {/* Connected Sub-Nodes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedNode(node)}
                      className={`p-4 rounded-2xl border bg-gradient-to-b ${getCategoryColor(
                        node.category
                      )} cursor-pointer transition-all hover:scale-[1.02] relative shadow-xs ${
                        isSelected ? 'ring-2 ring-cyan-500 scale-[1.03]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 font-bold text-slate-800">
                          {node.category}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60 text-slate-600" />
                      </div>
                      <h4 className="text-sm font-bold mb-1 text-slate-900">{node.label}</h4>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Visual Relationships List */}
              {graph.edges && graph.edges.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Topological Linkages & Semantic Flow</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {graph.edges.slice(0, 8).map((edge, idx) => {
                      const fromNode = graph.nodes.find((n) => n.id === edge.from)?.label || edge.from;
                      const toNode = graph.nodes.find((n) => n.id === edge.to)?.label || edge.to;
                      return (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-700"
                        >
                          <span className="font-bold text-cyan-800 truncate">{fromNode}</span>
                          <span className="text-[10px] text-slate-400 font-mono italic shrink-0">
                            —[{edge.label}]→
                          </span>
                          <span className="font-semibold text-slate-800 truncate">{toNode}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center space-y-3">
              <Network className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600">Enter any topic above to generate a concept mindmap</p>
            </div>
          )}
        </div>

        {/* Selected Node Deep-Dive Inspector Panel */}
        {selectedNode && (
          <div className="fixed inset-x-0 bottom-0 z-30 max-h-[55vh] md:relative md:inset-auto md:max-h-none md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0 select-text overflow-y-auto shadow-2xl md:shadow-md animate-in slide-in-from-bottom duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {selectedNode.category} Node
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: #{selectedNode.id}</span>
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
                <h3 className="text-base font-bold text-slate-900">{selectedNode.label}</h3>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Action shortcuts for this concept node */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Deep Dive Actions
                </div>

                <button
                  onClick={() => {
                    onNavigateUrl(`aksh://research?q=${encodeURIComponent(selectedNode.label)}`);
                  }}
                  className="w-full p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Deep Research this Concept</span>
                  </div>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    onNavigateUrl(`https://www.google.com/search?q=${encodeURIComponent(selectedNode.label)}`);
                  }}
                  className="w-full p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Search Web for "{selectedNode.label}"</span>
                  </div>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 font-mono">
              Aksh AI Knowledge Taxonomy
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
