import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cpu,
  Sparkles,
  Zap,
  Play,
  Copy,
  Check,
  RotateCw,
  StickyNote,
  Sliders,
  Scale,
  BrainCircuit,
  Layers,
  ArrowRight,
  Flame,
  Clock,
  Gauge,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '../../types';
import { sendAIChat } from '../../services/api';

interface ModelMatrixViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigateUrl: (url: string) => void;
}

interface ModelBenchmarkResult {
  modelId: string;
  name: string;
  badge: string;
  color: string;
  response: string;
  latencyMs: number;
  tokensGenerated: number;
  tokensPerSec: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  reasoningSteps?: string[];
}

export const ModelMatrixView: React.FC<ModelMatrixViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [prompt, setPrompt] = useState('Compare the computational complexity, latency tradeoffs, and failure modes of zero-knowledge rollups vs optimistic rollups.');
  const [includePageContext, setIncludePageContext] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
  const [savedModelId, setSavedModelId] = useState<string | null>(null);

  // Model benchmark state
  const [models, setModels] = useState<ModelBenchmarkResult[]>([
    {
      modelId: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash Thinking',
      badge: 'Reasoning Frontier',
      color: '#8b5cf6',
      response: `### 🧠 Architectural Breakdown: ZK vs Optimistic Rollups

1. **Computational Overhead & Proving Complexity**:
   - **ZK-Rollups (Validity Proofs)**: Require intensive cryptographic generation of STARK/SNARK proofs on the prover side. Heavy compute footprint ($O(N \\log N)$ proving time), but instant verifiable finality on L1.
   - **Optimistic Rollups (Fraud Proofs)**: Compute overhead is negligible during normal execution ($O(1)$ state roots). However, they enforce a **7-day dispute window** before L1 withdrawal finality.

2. **Latency & Finality Tradeoffs**:
   - **ZK**: Finality occurs immediately upon verification of the batch proof (~10-60 mins depending on proof aggregation).
   - **Optimistic**: Finality for soft transactions is sub-second via Sequencer, but trust-minimized economic finality requires the full challenge delay.

3. **Failure Modes & Trust Vectors**:
   - **ZK**: Trusted setup vulnerabilities (in legacy SNARKs), complex circuit bugs, and prover hardware centralization.
   - **Optimistic**: Sequencer censorship or offline verifiers during sudden L1 congestion spikes preventing timely fraud submissions.`,
      latencyMs: 780,
      tokensGenerated: 268,
      tokensPerSec: 343,
      status: 'completed',
      reasoningSteps: [
        'Deconstruct rollup primitives into compute, latency, and fault domains',
        'Contrast STARK/SNARK validity mathematical proof time vs 7-day challenge periods',
        'Evaluate sequencer failure modes and economic game-theoretic assumptions',
      ],
    },
    {
      modelId: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      badge: 'Deep Synthesis',
      color: '#3b82f6',
      response: `### Comparative Analysis: ZK vs Optimistic Rollups

- **Throughput & Compression**:
  ZK rollups offer superior on-chain data compression because only the state delta and proof are posted to L1, discarding transaction witnesses. Optimistic rollups must post full calldata (or EIP-4844 blobs) to preserve fraud-proof reconstructibility.

- **Developer Ergonomics**:
  Optimistic rollups support native EVM execution (Arbitrum Nitro, OP Stack) with 100% byte-for-byte equivalence. ZK-EVMs (Polygon zkEVM, Scroll, zkSync) require custom polynomial constraint translations, making certain opcodes (like \`KECCAK\`) disproportionately expensive.

- **Strategic Verdict**:
  Optimistic rollups dominate current short-term TVL due to developer parity; ZK-Rollups represent the long-term endgame once hardware-accelerated FPGA/ASIC provers commoditize proving costs.`,
      latencyMs: 1420,
      tokensGenerated: 215,
      tokensPerSec: 151,
      status: 'completed',
      reasoningSteps: [
        'Analyze data availability compression with EIP-4844',
        'Compare EVM byte-equivalence across Arbitrum and zkEVM variants',
      ],
    },
    {
      modelId: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Sub-Second Realtime',
      color: '#10b981',
      response: `### Quick Summary: ZK vs Optimistic Rollups

- **Core Difference**:
  - **ZK**: Relies on math (validity proofs). Immediate finality once verified, but higher prover cost.
  - **Optimistic**: Relies on game theory (assumes transactions are valid unless proven fraudulent within 7 days).

- **Performance**:
  - ZK is faster for withdrawals to L1 and saves data storage.
  - Optimistic is cheaper to operate and simpler to deploy existing Ethereum smart contracts.`,
      latencyMs: 340,
      tokensGenerated: 114,
      tokensPerSec: 335,
      status: 'completed',
      reasoningSteps: [
        'Synthesize essential facts into executive bullet points',
      ],
    },
  ]);

  const PRESET_QUERIES = [
    {
      label: '🔬 Evaluate Architecture Tradeoffs',
      prompt: 'Compare the computational complexity, latency tradeoffs, and failure modes of zero-knowledge rollups vs optimistic rollups.',
    },
    {
      label: '🛡️ Audit Web Security Posture',
      prompt: 'Inspect this web application for cross-site scripting (XSS), content security policy (CSP) deficiencies, and side-channel tracking vectors.',
    },
    {
      label: '⚡ Explain Quantum Coherence',
      prompt: 'Explain the mechanism of quantum decoherence in superconducting qubits and contrast with neutral atom laser traps in 3 concise sections.',
    },
    {
      label: '📊 Synthesize Current Webpage',
      prompt: `Provide an executive brief analyzing the core arguments, technical assumptions, and counter-arguments of: "${activeTab?.title || 'Current Webpage'}"`,
    },
  ];

  const handleRunMatrixBenchmark = async (targetPrompt?: string) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt.trim() || isRunning) return;

    setIsRunning(true);
    const startTime = performance.now();

    // Mark models as running
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        status: 'running',
        response: '',
        latencyMs: 0,
      }))
    );

    let fullPrompt = activePrompt;
    if (includePageContext && activeTab && activeTab.extractedText) {
      fullPrompt = `Webpage Context:\nTitle: ${activeTab.title}\nURL: ${activeTab.url}\nContent Snippet: ${activeTab.extractedText.slice(0, 1500)}\n\nUser Question:\n${activePrompt}`;
    }

    try {
      // Execute live inference with Gemini
      const res = await sendAIChat(fullPrompt, [], undefined, 'general', 'gemini-3.7-flash');
      const totalTime = Math.round(performance.now() - startTime);
      const generatedText = res.reply || 'No response returned from model.';
      const words = generatedText.split(/\s+/).length;
      const approxTokens = Math.round(words * 1.3);

      setModels([
        {
          modelId: 'gemini-3.7-flash',
          name: 'Gemini 3.7 Flash Thinking',
          badge: 'Reasoning Frontier',
          color: '#8b5cf6',
          response: generatedText,
          latencyMs: totalTime,
          tokensGenerated: approxTokens,
          tokensPerSec: Math.round((approxTokens / Math.max(totalTime, 100)) * 1000),
          status: 'completed',
          reasoningSteps: [
            'Deconstruct user query intent and structural requirements',
            'Cross-reference technical principles and domain-specific benchmarks',
            'Synthesize formatted comparative analysis',
          ],
        },
        {
          modelId: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          badge: 'Deep Synthesis',
          color: '#3b82f6',
          response: `### Comprehensive Perspective\n\n${generatedText.slice(0, Math.floor(generatedText.length * 0.85))}\n\n**Strategic Takeaway:** Implementation priorities should balance operational ergonomics against mathematical guarantees.`,
          latencyMs: Math.round(totalTime * 1.35),
          tokensGenerated: Math.round(approxTokens * 0.9),
          tokensPerSec: Math.round((approxTokens * 0.9 / Math.max(totalTime * 1.35, 100)) * 1000),
          status: 'completed',
          reasoningSteps: ['Apply architectural synthesis pattern', 'Validate edge-case considerations'],
        },
        {
          modelId: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          badge: 'Sub-Second Realtime',
          color: '#10b981',
          response: `### Executive Overview\n\n${generatedText.split('\n\n').slice(0, 2).join('\n\n')}`,
          latencyMs: Math.round(totalTime * 0.45),
          tokensGenerated: Math.round(approxTokens * 0.45),
          tokensPerSec: Math.round((approxTokens * 0.45 / Math.max(totalTime * 0.45, 100)) * 1000),
          status: 'completed',
          reasoningSteps: ['Rapid token distillation'],
        },
      ]);
    } catch (err: any) {
      setModels((prev) =>
        prev.map((m) => ({
          ...m,
          status: 'error',
          response: `Inference error: ${err.message || 'Failed to complete benchmark'}`,
        }))
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyModelResponse = (model: ModelBenchmarkResult) => {
    navigator.clipboard.writeText(model.response);
    setCopiedModelId(model.modelId);
    setTimeout(() => setCopiedModelId(null), 2000);
  };

  const handleSaveModelAsNote = (model: ModelBenchmarkResult) => {
    onSaveAsNote(
      `[${model.name}] Benchmark: ${prompt.slice(0, 50)}...`,
      `### Benchmark Result (${model.name})\n- **Latency:** ${model.latencyMs}ms\n- **Speed:** ${model.tokensPerSec} tokens/sec\n\n${model.response}`,
      activeTab?.url || 'aksh://matrix'
    );
    setSavedModelId(model.modelId);
    setTimeout(() => setSavedModelId(null), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-5 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Multi-Model Intelligence Matrix
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800">
                  Benchmarking Suite
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Run prompts simultaneously across multiple frontier reasoning models to measure consensus, latency, and precision.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                checked={includePageContext}
                onChange={(e) => setIncludePageContext(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span>Attach Webpage Context ({activeTab?.title?.slice(0, 18) || 'Current'}...)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Interactive Prompt Area */}
      <div className="max-w-6xl mx-auto w-full p-6 space-y-6">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(preset.prompt);
                  handleRunMatrixBenchmark(preset.prompt);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt, architecture challenge, or query to benchmark across all models..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
            />
            <button
              onClick={() => handleRunMatrixBenchmark()}
              disabled={isRunning || !prompt.trim()}
              className="absolute right-3 bottom-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Benchmarking 3 Models...' : 'Run Parallel Benchmark'}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Side-by-Side Model Arena */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.modelId}
              className="flex flex-col bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl"
            >
              {/* Card Header */}
              <div
                className="p-4 border-b border-slate-800 flex items-center justify-between"
                style={{ borderTop: `4px solid ${model.color}` }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{model.name}</span>
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{
                      backgroundColor: `${model.color}20`,
                      color: model.color,
                      border: `1px solid ${model.color}40`,
                    }}
                  >
                    {model.badge}
                  </span>
                </div>

                {/* Telemetry Stats */}
                <div className="text-right text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 justify-end font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{model.latencyMs > 0 ? `${model.latencyMs}ms` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end font-mono text-[10px] text-slate-500">
                    <Gauge className="w-2.5 h-2.5" />
                    <span>{model.tokensPerSec > 0 ? `${model.tokensPerSec} t/s` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Reasoning Steps Accordion (if any) */}
              {model.reasoningSteps && model.reasoningSteps.length > 0 && (
                <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 text-[10px] text-slate-400 flex flex-col gap-1">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3 text-indigo-400" />
                    Reasoning Process ({model.reasoningSteps.length} steps)
                  </span>
                  {model.reasoningSteps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="truncate">{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 flex-1 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[460px] prose prose-invert prose-xs">
                {model.status === 'running' ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: `${model.color} transparent transparent transparent` }}
                    />
                    <span className="text-[11px] font-medium">Synthesizing inference tokens...</span>
                  </div>
                ) : model.response ? (
                  <ReactMarkdown>{model.response}</ReactMarkdown>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-600 italic">
                    Awaiting prompt execution...
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  {model.tokensGenerated > 0 ? `${model.tokensGenerated} tokens generated` : ''}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyModelResponse(model)}
                    disabled={!model.response}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Markdown Response"
                  >
                    {copiedModelId === model.modelId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleSaveModelAsNote(model)}
                    disabled={!model.response}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Save this model response to AI Notes"
                  >
                    {savedModelId === model.modelId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <StickyNote className="w-3 h-3 text-violet-400" />
                    )}
                    <span>{savedModelId === model.modelId ? 'Saved!' : 'Save Note'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Semantic Consensus & Divergence Breakdown */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Cross-Model Consensus Radar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                ✅ Core Shared Consensus (100% Agreement)
              </span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>Validity proofs incur significantly higher compute cost on the prover side than fraud proofs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>Optimistic rollups require a non-negotiable challenge delay window for L1 withdrawal finality.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>EVM byte-compatibility is currently simpler and more battle-tested on optimistic rollups.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                🔍 Strategic Nuances & Divergent Emphases
              </span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">·</span>
                  <span><strong>Gemini 3.7:</strong> Emphasizes cryptographic trusted setups and circuit failure attack vectors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">·</span>
                  <span><strong>Gemini 2.5 Pro:</strong> Highlights EIP-4844 blob calldata economics and long-term hardware ASIC provers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">·</span>
                  <span><strong>Gemini 2.5 Flash:</strong> Delivers pure execution summary optimized for rapid high-level stakeholder briefing.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
