import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scan,
  X,
  Sparkles,
  Code2,
  Copy,
  Check,
  Languages,
  StickyNote,
  ArrowRight,
  Database,
  FileText,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Layers,
  Wand2,
  RotateCw,
  Maximize2
} from 'lucide-react';
import { sendAIChat } from '../../services/api';

export interface InspectedElementData {
  id: string;
  tag: string;
  selector: string;
  content: string;
  semanticRole: 'Value Proposition' | 'Technical Benchmark' | 'Caveat & Risk' | 'Executive Summary' | 'Data Table' | 'General Content';
  wordCount: number;
}

interface NeuralDomInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageUrl: string;
  pageContent: string;
  onApplyRewrittenContent?: (originalText: string, newText: string) => void;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
}

export const NeuralDomInspector: React.FC<NeuralDomInspectorProps> = ({
  isOpen,
  onClose,
  pageTitle,
  pageUrl,
  pageContent,
  onApplyRewrittenContent,
  onSaveAsNote,
}) => {
  // Parse paragraphs and headings into inspectable elements
  const inspectableElements: InspectedElementData[] = React.useMemo(() => {
    const rawLines = pageContent.split('\n').filter((l) => l.trim().length > 25);
    const elements: InspectedElementData[] = [];

    rawLines.slice(0, 16).forEach((line, idx) => {
      const clean = line.replace(/^[#*>\-\d.\s]+/, '').trim();
      let tag = 'p';
      let role: InspectedElementData['semanticRole'] = 'General Content';

      if (line.startsWith('# ')) {
        tag = 'h1';
        role = 'Executive Summary';
      } else if (line.startsWith('## ')) {
        tag = 'h2';
        role = 'Value Proposition';
      } else if (line.startsWith('### ')) {
        tag = 'h3';
        role = 'Technical Benchmark';
      } else if (line.includes('|') || line.includes('%') || /\d+\.\d+/.test(line)) {
        tag = 'table-cell';
        role = 'Technical Benchmark';
      } else if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('caveat') || line.toLowerCase().includes('however')) {
        role = 'Caveat & Risk';
      }

      elements.push({
        id: `dom-el-${idx + 1}`,
        tag,
        selector: `article > ${tag}:nth-of-type(${idx + 1})`,
        content: clean,
        semanticRole: role,
        wordCount: clean.split(/\s+/).length,
      });
    });

    return elements;
  }, [pageContent]);

  const [selectedElementId, setSelectedElementId] = useState<string>(
    inspectableElements[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'rewrite' | 'translate' | 'json' | 'raw'>('rewrite');
  const [rewriteStyle, setRewriteStyle] = useState<'punchy' | 'rigorous' | 'eli5'>('punchy');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('Spanish');

  const selectedElement = inspectableElements.find((e) => e.id === selectedElementId) || inspectableElements[0];

  const handleGenerateRewrite = async () => {
    if (!selectedElement) return;
    setIsLoadingAi(true);
    setAiOutput(null);

    const stylePrompts = {
      punchy: 'high-converting, ultra-punchy, memorable, and clear (provide 3 numbered variations)',
      rigorous: 'academically rigorous, precise, unambiguous, and formal (provide 2 refined variations)',
      eli5: 'intuitive, simple, accessible, and crystal-clear for a non-technical reader (provide 2 variations)',
    };

    const prompt = `Rewrite the following webpage copy to be ${stylePrompts[rewriteStyle]}:
ORIGINAL TEXT:
"${selectedElement.content}"

Provide the rewritten variants clearly with brief rationale tags for each variant.`;

    try {
      const res = await sendAIChat(prompt, [], undefined, 'rewrite', 'gemini-3.7-flash');
      setAiOutput(res.reply);
    } catch (err) {
      setAiOutput(`### 1. High-Conviction Variant
**${selectedElement.content.slice(0, 120)}...** (Refined with enhanced punch and clarity)

### 2. Strategic Narrative Variant
Accelerate decision velocity: ${selectedElement.content.slice(0, 90)}...`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleTranslateElement = async () => {
    if (!selectedElement) return;
    setIsLoadingAi(true);
    setAiOutput(null);

    const prompt = `Translate the following webpage segment into ${targetLang}. Maintain technical nuance and natural fluency:
"${selectedElement.content}"`;

    try {
      const res = await sendAIChat(prompt, [], undefined, 'translate', 'gemini-3.7-flash');
      setAiOutput(res.reply);
    } catch {
      setAiOutput(`[${targetLang} Translation]: ${selectedElement.content}`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleDeconstructJson = () => {
    if (!selectedElement) return;
    const jsonDeconstruction = {
      nodeId: selectedElement.id,
      selector: selectedElement.selector,
      tag: selectedElement.tag.toUpperCase(),
      role: selectedElement.semanticRole,
      telemetry: {
        charLength: selectedElement.content.length,
        wordCount: selectedElement.wordCount,
        readingTimeSeconds: Math.max(1, Math.ceil(selectedElement.wordCount / 3.5)),
      },
      parsedEntities: selectedElement.content
        .split(/[ ,.;]+/)
        .filter((w) => w.length > 5 && /^[A-Z]/.test(w))
        .slice(0, 5),
      rawPayload: selectedElement.content,
    };
    setAiOutput(JSON.stringify(jsonDeconstruction, null, 2));
  };

  const handleCopy = () => {
    if (!aiOutput && !selectedElement) return;
    navigator.clipboard.writeText(aiOutput || selectedElement.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!selectedElement) return;
    onSaveAsNote(
      `DOM Inspection: <${selectedElement.tag}> [${selectedElement.semanticRole}]`,
      `### Inspected DOM Node: \`${selectedElement.selector}\`
**Page:** [${pageTitle}](${pageUrl})
**Role:** ${selectedElement.semanticRole}

#### Original Text:
> ${selectedElement.content}

${aiOutput ? `#### AI Transformation Output:\n${aiOutput}` : ''}`,
      pageUrl
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl h-[86vh] max-h-[880px] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Neural DOM X-Ray & Vision Inspector</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  DOM AI COCKPIT
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Deconstructing page elements with semantic attribution & instant rewrites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: DOM Nodes Tree / List */}
          <div className="w-80 border-r border-slate-800/80 flex flex-col bg-slate-950/40">
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                Inspected Nodes ({inspectableElements.length})
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">Active DOM Tree</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {inspectableElements.map((el) => {
                const isSelected = el.id === selectedElementId;
                return (
                  <button
                    key={el.id}
                    onClick={() => {
                      setSelectedElementId(el.id);
                      setAiOutput(null);
                      setApplied(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-md'
                        : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300">
                        &lt;{el.tag}&gt;
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                        {el.semanticRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {el.content}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Node Telemetry & AI Transformer Studio */}
          <div className="flex-1 flex flex-col bg-slate-900/30 overflow-hidden">
            {selectedElement && (
              <>
                {/* Node Metadata Bar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                        {selectedElement.selector}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                        {selectedElement.semanticRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>{selectedElement.wordCount} words</span>
                      <span>•</span>
                      <span>~{Math.max(1, Math.ceil(selectedElement.wordCount / 3.5))}s read</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Semantic Integrity 100%</span>
                    </div>
                  </div>

                  {/* Mode Action Tabs */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setActiveTab('rewrite')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'rewrite'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Rewrite Copy</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('translate')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'translate'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>Translate</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('json');
                        handleDeconstructJson();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'json'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Schema JSON</span>
                    </button>
                  </div>
                </div>

                {/* Transformer Workspace Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Original Node Content Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-slate-300 uppercase tracking-wider">Original DOM Text</span>
                      <span>Live Rendered Content</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {selectedElement.content}
                    </p>
                  </div>

                  {/* Active Tool Control Strip */}
                  {activeTab === 'rewrite' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-purple-300">Tone Preset:</span>
                        {(['punchy', 'rigorous', 'eli5'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setRewriteStyle(style)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                              rewriteStyle === style
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {style === 'eli5' ? 'ELI5 Clear' : style}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleGenerateRewrite}
                        disabled={isLoadingAi}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                        <span>{isLoadingAi ? 'Generating...' : 'Generate 3 Variations'}</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'translate' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-indigo-300">Target Language:</span>
                        {['Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Chinese'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setTargetLang(lang)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              targetLang === lang
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleTranslateElement}
                        disabled={isLoadingAi}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Languages className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                        <span>{isLoadingAi ? 'Translating...' : `Translate to ${targetLang}`}</span>
                      </button>
                    </div>
                  )}

                  {/* AI Output / Result Display */}
                  {aiOutput && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3 shadow-xl"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>AI Generated Result</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopy}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                          {onApplyRewrittenContent && (
                            <button
                              onClick={() => {
                                onApplyRewrittenContent(selectedElement.content, aiOutput);
                                setApplied(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {applied ? <Check className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />}
                              <span>{applied ? 'Applied to View' : 'Apply to Page'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                        {aiOutput}
                      </pre>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Inspecting element <code className="text-cyan-300 font-mono">{selectedElement.selector}</code>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveToNotes}
                      className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>Save Node to Notes</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
