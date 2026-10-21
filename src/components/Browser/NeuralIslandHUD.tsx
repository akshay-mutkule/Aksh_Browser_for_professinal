import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  Volume2,
  ShieldCheck,
  BrainCircuit,
  Wrench,
  Radio,
  FileCode2,
  GitCompare,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Loader2,
  Check,
  Copy,
  Table,
  BookmarkPlus,
  Eye,
  Activity,
  Terminal,
  Cpu,
  Bot,
  Workflow,
  Scale,
  Mic
} from 'lucide-react';
import { Tab, NeuralMemoryItem } from '../../types';
import { sendAIChat } from '../../services/api';

interface NeuralIslandHUDProps {
  activeTab: Tab | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onNavigateUrl: (url: string) => void;
  onTriggerAiSummary: () => void;
  onTriggerSpeech: () => void;
  onOpenDataExtractor: () => void;
  onOpenInternalView: (view: string) => void;
  isAmbientPlaying?: boolean;
  onToggleVoiceHud?: () => void;
  onToggleOmniTerminal?: () => void;
}

export const NeuralIslandHUD: React.FC<NeuralIslandHUDProps> = ({
  activeTab,
  isOpen,
  onToggleOpen,
  onNavigateUrl,
  onTriggerAiSummary,
  onTriggerSpeech,
  onOpenDataExtractor,
  onOpenInternalView,
  isAmbientPlaying = false,
  onToggleVoiceHud,
  onToggleOmniTerminal,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);
  const [promptResponse, setPromptResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Compute live page signals
  const pageText = activeTab?.extractedText || activeTab?.pdfData?.text || '';
  const wordCount = pageText ? pageText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickPrompt.trim() || isPrompting) return;

    setIsPrompting(true);
    setPromptResponse(null);

    try {
      const webpageCtx = activeTab ? {
        url: activeTab.url,
        title: activeTab.title,
        textContent: pageText ? pageText.slice(0, 5000) : undefined,
      } : undefined;
      const res = await sendAIChat(
        quickPrompt.trim(),
        [],
        webpageCtx,
        'general',
        'gemini-3.7-flash'
      );
      setPromptResponse(res.reply);
    } catch (err) {
      setPromptResponse(err instanceof Error ? err.message : 'Error processing AI query');
    } finally {
      setIsPrompting(false);
    }
  };

  const handleSaveToVault = () => {
    if (!activeTab) return;
    try {
      const savedRaw = localStorage.getItem('aksh_neural_vault_memories');
      const memories: NeuralMemoryItem[] = savedRaw ? JSON.parse(savedRaw) : [];

      const newMemory: NeuralMemoryItem = {
        id: 'mem-' + Date.now(),
        title: activeTab.title || 'Untitled Memory',
        summary: pageText ? pageText.slice(0, 240) + '...' : `Indexed reference from ${activeTab.url}`,
        sourceUrl: activeTab.url,
        sourceTitle: activeTab.title,
        category: 'research',
        tags: ['WebSnap', 'AutoIndex', activeTab.contentType || 'web'],
        keyQuotes: pageText ? [pageText.slice(0, 160)] : [],
        entities: ['Web Reader', 'Aksh Neural Engine'],
        confidenceScore: 0.95,
        retentionStrength: 90,
        createdAt: Date.now(),
        lastRecalledAt: Date.now(),
        connections: [],
      };

      const updated = [newMemory, ...memories];
      localStorage.setItem('aksh_neural_vault_memories', JSON.stringify(updated));
      setVaultSaved(true);
      setTimeout(() => setVaultSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save to vault:', err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-40 flex justify-center w-full px-4 select-none pointer-events-none">
      <motion.div
        layout
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="pointer-events-auto"
      >
        {!isOpen ? (
          /* COLLAPSED CAPSULE HUD */
          <div
            onClick={onToggleOpen}
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-xl backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/60 transition-all cursor-pointer ring-1 ring-white/10"
          >
            {/* Pulsing AI Neural Core */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] tracking-tight hidden sm:inline">AI 3.7 HUD</span>
            </div>

            <div className="w-px h-3.5 bg-slate-700/80" />

            {/* Shield & Reading Signals */}
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline font-mono text-[10px]">KYBER-768</span>
              </span>

              {wordCount > 0 && (
                <span className="text-slate-400 hidden sm:inline font-mono text-[10px]">
                  ⏱️ {readingTime}m
                </span>
              )}

              {isAmbientPlaying && (
                <span className="flex items-center gap-1 text-purple-300 animate-pulse font-mono text-[10px]">
                  🎧 Lo-Fi
                </span>
              )}
            </div>

            <div className="w-px h-3.5 bg-slate-700/80" />

            {/* Quick Micro Action Pills */}
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onTriggerAiSummary}
                className="px-2 py-0.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-indigo-500/30"
                title="Instant AI Executive Summary"
              >
                <Zap className="w-2.5 h-2.5 text-indigo-400" />
                <span>Brief</span>
              </button>

              <button
                onClick={onTriggerSpeech}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Audio Podcast Briefing"
              >
                <Volume2 className="w-3 h-3 text-emerald-400" />
              </button>

              <button
                onClick={() => onOpenInternalView('tools')}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Micro-Tool Studio"
              >
                <Wrench className="w-3 h-3 text-cyan-400" />
              </button>

              <button
                onClick={() => onOpenInternalView('network')}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Network Radar & Proxy"
              >
                <Radio className="w-3 h-3 text-amber-400" />
              </button>

              <button
                onClick={handleSaveToVault}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  vaultSaved ? 'bg-emerald-500/30 text-emerald-300' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Save to Neural Vault"
              >
                {vaultSaved ? <Check className="w-3 h-3 text-emerald-400" /> : <BookmarkPlus className="w-3 h-3 text-purple-400" />}
              </button>

              {onToggleVoiceHud && (
                <button
                  onClick={onToggleVoiceHud}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Hands-Free Voice Co-Pilot (Alt+V)"
                >
                  <Mic className="w-3 h-3 text-rose-400" />
                </button>
              )}

              {onToggleOmniTerminal && (
                <button
                  onClick={onToggleOmniTerminal}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Omni Terminal Shell (~)"
                >
                  <Terminal className="w-3 h-3 text-emerald-400" />
                </button>
              )}
            </div>

            {/* Expand Indicator */}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-0.5" />
          </div>
        ) : (
          /* EXPANDED NEURAL COCKPIT ISLAND */
          <div className="w-[94vw] max-w-2xl bg-slate-950/95 text-white rounded-3xl shadow-2xl border border-cyan-500/30 backdrop-blur-2xl p-4.5 space-y-4 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs tracking-tight text-slate-100">Aksh Neural Island</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-mono text-[9px]">
                      Gemini 3.7 Flash Engine
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-sm">
                    {activeTab?.title || 'Browser System Shell'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hidden sm:inline">
                  Ctrl+I
                </span>
                <button
                  onClick={onToggleOpen}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Minimize Island"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instant AI Question / Command Omnibox */}
            <form onSubmit={handleAskAI} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask AI anything about this page, synthesize ideas, or command..."
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400/80 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!quickPrompt.trim() || isPrompting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-white transition-all cursor-pointer"
                title="Execute Query"
              >
                {isPrompting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {/* AI Response Display */}
            {promptResponse && (
              <div className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-3.5 text-xs text-slate-200 max-h-48 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] text-cyan-400 font-semibold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Neural Synthesis</span>
                  </span>
                  <button
                    onClick={() => handleCopy(promptResponse)}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
                  {promptResponse}
                </div>
              </div>
            )}

            {/* Supercharged Action Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  onTriggerAiSummary();
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Zap className="w-4 h-4 text-indigo-400 group-hover:animate-pulse" />
                  <span className="text-[9px] font-mono text-indigo-400 font-bold">TLDR</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Executive Brief</div>
                <div className="text-[9px] text-slate-400">Structured AI summary</div>
              </button>

              <button
                onClick={() => {
                  onTriggerSpeech();
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Volume2 className="w-4 h-4 text-emerald-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">TTS</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Audio Briefing</div>
                <div className="text-[9px] text-slate-400">Podcast voice narration</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('diff');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <GitCompare className="w-4 h-4 text-cyan-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">DIFF</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Semantic Diff</div>
                <div className="text-[9px] text-slate-400">Evolution & code delta</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('network');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Radio className="w-4 h-4 text-amber-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-amber-400 font-bold">MOCK</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Network Radar</div>
                <div className="text-[9px] text-slate-400">Live traffic & proxy rules</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('tools');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Wrench className="w-4 h-4 text-cyan-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">UTIL</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Micro-Tool Studio</div>
                <div className="text-[9px] text-slate-400">JWT, Regex & Code Gen</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('sandbox');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <FileCode2 className="w-4 h-4 text-blue-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-blue-400 font-bold">REPL</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Code Sandbox</div>
                <div className="text-[9px] text-slate-400">Interactive live runtime</div>
              </button>

              <button
                onClick={() => {
                  onOpenDataExtractor();
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Table className="w-4 h-4 text-rose-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-rose-400 font-bold">DATA</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Extract Tables</div>
                <div className="text-[9px] text-slate-400">Convert to CSV & JSON</div>
              </button>

              <button
                onClick={handleSaveToVault}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer group hover:scale-[1.02] ${
                  vaultSaved
                    ? 'bg-emerald-950/60 border-emerald-500/60'
                    : 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-700/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {vaultSaved ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <BrainCircuit className="w-4 h-4 text-purple-400 group-hover:scale-110" />
                  )}
                  <span className="text-[9px] font-mono text-purple-400 font-bold">VAULT</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">
                  {vaultSaved ? 'Indexed to Vault!' : 'Save to Vault'}
                </div>
                <div className="text-[9px] text-slate-400">Neural second brain</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('agent');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Bot className="w-4 h-4 text-violet-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-violet-400 font-bold">SWARM</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Agent Studio</div>
                <div className="text-[9px] text-slate-400">Autonomous multi-agent</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('terminal');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/50 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">BASH</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Omni Terminal</div>
                <div className="text-[9px] text-slate-400">System CLI & curl suite</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('matrix');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Scale className="w-4 h-4 text-blue-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-blue-400 font-bold">ARENA</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Model Matrix</div>
                <div className="text-[9px] text-slate-400">Side-by-side LLM benchmark</div>
              </button>

              <button
                onClick={() => {
                  onOpenInternalView('workflows');
                  onToggleOpen();
                }}
                className="p-2.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/30 text-left transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <Workflow className="w-4 h-4 text-indigo-400 group-hover:scale-110" />
                  <span className="text-[9px] font-mono text-indigo-400 font-bold">FLOW</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200">Workflow Studio</div>
                <div className="text-[9px] text-slate-400">Node graph automation</div>
              </button>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>Words: <strong className="text-slate-300 font-mono">{wordCount}</strong></span>
                <span>Reading Time: <strong className="text-slate-300 font-mono">~{readingTime} min</strong></span>
                <span className="text-emerald-400 font-medium">Kyber-768 Shielded</span>
              </div>
              <button
                onClick={() => {
                  onOpenInternalView('memory');
                  onToggleOpen();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline cursor-pointer"
              >
                Open Neural Vault Graph →
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
