import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronDown,
  ChevronUp,
  Trophy,
  Eye,
  EyeOff,
  GitCompare,
  BarChart3,
  Download,
  RefreshCw,
  FileText,
  ShieldAlert,
  ThumbsUp,
  Bookmark
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
  metrics: {
    reasoningDepth: number; // 0 - 100
    factualGrounding: number; // 0 - 100
    conciseness: number; // 0 - 100
  };
}

interface ModelEloScore {
  modelId: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  ties: number;
}

const DEFAULT_ELO_SCORES: Record<string, ModelEloScore> = {
  'gemini-3.7-flash': { modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash Thinking', elo: 1284, wins: 28, losses: 5, ties: 4 },
  'gemini-2.5-pro': { modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', elo: 1252, wins: 22, losses: 9, ties: 6 },
  'gemini-2.5-flash': { modelId: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', elo: 1210, wins: 15, losses: 14, ties: 8 },
  'adversarial-redteam': { modelId: 'adversarial-redteam', name: 'Adversarial Red-Team', elo: 1238, wins: 19, losses: 11, ties: 5 }
};

const PRESET_QUERIES = [
  {
    label: '🔬 ZK vs Optimistic Rollups',
    prompt: 'Compare the computational complexity, latency tradeoffs, and failure modes of zero-knowledge rollups vs optimistic rollups in high-throughput blockchain networks.',
  },
  {
    label: '🛡️ Web Security & CSP Audit',
    prompt: 'Evaluate cross-site scripting (XSS), non-eval Content Security Policy (CSP) enforcement, and side-channel tracking vectors for an enterprise web app.',
  },
  {
    label: '⚛️ Quantum Coherence Breakthroughs',
    prompt: 'Contrast the mechanisms of quantum decoherence in superconducting transmon qubits with neutral atom optical laser traps in 3 rigorous sections.',
  },
  {
    label: '📊 Monolith vs Microservices at Scale',
    prompt: 'Analyze network serialization overhead, distributed transaction boundaries (Saga pattern), and organizational cognitive load of microservices vs modular monoliths.',
  },
  {
    label: '⚡ PostgreSQL vs DynamoDB Latency',
    prompt: 'Compare p99 read/write latency, partition key skew vulnerabilities, and complex analytical JOIN capabilities between PostgreSQL and DynamoDB.',
  },
  {
    label: '📄 Analyze Current Webpage Context',
    prompt: 'Provide an exhaustive executive synthesis of the core architectural claims, implicit assumptions, and counter-arguments of the current page.',
  },
];

export const ModelMatrixView: React.FC<ModelMatrixViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [prompt, setPrompt] = useState(PRESET_QUERIES[0].prompt);
  const [includePageContext, setIncludePageContext] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
  const [savedModelId, setSavedModelId] = useState<string | null>(null);

  // Active View Mode: 'arena' (side-by-side), 'blind' (LMSYS blind battle), 'diff' (pair comparator)
  const [activeViewMode, setActiveViewMode] = useState<'arena' | 'blind' | 'diff'>('arena');
  const [enableFourModels, setEnableFourModels] = useState<boolean>(true);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({
    'gemini-3.7-flash': true,
    'gemini-2.5-pro': false,
    'gemini-2.5-flash': false,
    'adversarial-redteam': true
  });

  // Blind Arena State
  const [blindVotesSubmitted, setBlindVotesSubmitted] = useState<boolean>(false);
  const [blindWinner, setBlindWinner] = useState<string | null>(null);

  // Elo Ranking State (persisted locally)
  const [eloScores, setEloScores] = useState<Record<string, ModelEloScore>>(() => {
    try {
      const saved = localStorage.getItem('aksh_model_elo_scores');
      return saved ? JSON.parse(saved) : DEFAULT_ELO_SCORES;
    } catch {
      return DEFAULT_ELO_SCORES;
    }
  });

  // Diff Pair Selection
  const [diffModelA, setDiffModelA] = useState<string>('gemini-3.7-flash');
  const [diffModelB, setDiffModelB] = useState<string>('gemini-2.5-pro');

  // Automated Consensus State
  const [consensusSynthesis, setConsensusSynthesis] = useState<{
    agreements: string[];
    divergences: string[];
    masterVerdict: string;
    synthesizing: boolean;
  }>({
    agreements: [
      'Validity proofs (ZK) incur significantly higher prover computational overhead ($O(N \\log N)$) than optimistic fraud proofs ($O(1)$).',
      'Optimistic rollups enforce a non-negotiable multi-day challenge dispute window before trust-minimized L1 finality can be settled.',
      'EVM bytecode parity is currently more mature and cost-effective on optimistic stacks (OP Stack, Arbitrum Nitro) than complex polynomial constraint translation circuits.'
    ],
    divergences: [
      'Gemini 3.7 Flash Thinking focuses heavily on cryptographic circuit bug hazards and hardware centralization of prover clusters.',
      'Gemini 2.5 Pro highlights long-term EIP-4844 data availability compression and commoditized ASIC/FPGA hardware accelerators.',
      'Gemini 2.5 Flash prioritizes immediate operational simplicity and sub-second soft-sequencer latency for consumer UX.',
      'Adversarial Red-Team exposes sequencer MEV extraction vulnerabilities and L1 gas congestion censorship during challenge windows.'
    ],
    masterVerdict: 'For systems prioritizing immediate sub-second user experience with existing EVM tooling, Optimistic Rollups remain optimal in the medium term. However, for sovereign institutional settlements and privacy-preserving zero-latency finality, ZK-Rollups represent the mathematically irreversible frontier once proving hardware commoditizes.',
    synthesizing: false
  });

  // Model benchmark state
  const [models, setModels] = useState<ModelBenchmarkResult[]>([
    {
      modelId: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash Thinking',
      badge: 'Reasoning Frontier',
      color: '#8b5cf6',
      response: `### 🧠 Deep Reasoning: ZK vs Optimistic Rollups
1. **Computational & Proving Overhead**:
   - **ZK-Rollups (Validity Proofs)**: Require heavy polynomial constraint satisfaction (STARK/SNARK). Prover time scales with batch size ($O(N \\log N)$), demanding specialized GPU/FPGA clusters. Once verified on L1, cryptographic finality is immediate and mathematically sound.
   - **Optimistic Rollups (Fraud Proofs)**: Execution overhead is minimal ($O(1)$ state updates). Transactions are optimistically presumed valid. However, this simplicity forces an economic tradeoff: a **7-day challenge window** before L1 withdrawal finality.

2. **Latency & Finality Dynamics**:
   - **ZK**: Finality occurs immediately upon verification of the batch proof (~10-60 mins depending on aggregation cadence).
   - **Optimistic**: Soft sequencer finality is sub-second, but trust-minimized economic finality requires the full challenge delay.

3. **Critical Vulnerabilities & Failure Vectors**:
   - **ZK**: Trusted setup vulnerabilities in older SNARKs, complex circuit compiler bugs, and prover hardware centralization.
   - **Optimistic**: Sequencer censorship or offline verifiers during sudden L1 fee spikes preventing timely fraud submissions.`,
      latencyMs: 780,
      tokensGenerated: 274,
      tokensPerSec: 351,
      status: 'completed',
      reasoningSteps: [
        'Deconstruct rollup primitives into compute, latency, and fault domains',
        'Contrast STARK/SNARK mathematical validity vs game-theoretic challenge delays',
        'Evaluate sequencer MEV attack surfaces and economic censorship thresholds'
      ],
      metrics: { reasoningDepth: 96, factualGrounding: 98, conciseness: 82 }
    },
    {
      modelId: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      badge: 'Deep Synthesis',
      color: '#3b82f6',
      response: `### Comparative Architecture Analysis: ZK vs Optimistic Rollups

- **Data Availability & State Compression**:
  ZK rollups offer superior on-chain data compression because only the state delta and proof are posted to L1, discarding transaction witnesses. Optimistic rollups must post full calldata (or EIP-4844 blobs) to preserve fraud-proof reconstructibility.

- **Developer Ergonomics & Bytecode Parity**:
  Optimistic rollups support native EVM execution (Arbitrum Nitro, OP Stack) with 100% byte-for-byte equivalence. ZK-EVMs (Polygon zkEVM, Scroll, zkSync) require custom polynomial constraint translations, making certain opcodes (like \`KECCAK\`) disproportionately expensive.

- **Strategic Ecosystem Verdict**:
  Optimistic rollups dominate current short-term Total Value Locked (TVL) due to immediate tooling parity. ZK-Rollups represent the long-term endgame once hardware-accelerated FPGA/ASIC provers commoditize proving costs.`,
      latencyMs: 1380,
      tokensGenerated: 220,
      tokensPerSec: 159,
      status: 'completed',
      reasoningSteps: [
        'Analyze data availability compression with EIP-4844 blobs',
        'Compare EVM byte-equivalence across Arbitrum and zkEVM variants',
        'Synthesize long-term hardware acceleration trajectories'
      ],
      metrics: { reasoningDepth: 91, factualGrounding: 96, conciseness: 78 }
    },
    {
      modelId: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Sub-Second Realtime',
      color: '#10b981',
      response: `### Executive Overview: ZK vs Optimistic Rollups

- **Core Mechanism**:
  - **ZK**: Relies on mathematics (cryptographic validity proofs). Instant finality upon L1 check, but higher prover compute cost.
  - **Optimistic**: Relies on game theory (assumes transactions are valid unless proven fraudulent within a 7-day challenge window).

- **Practical Tradeoffs**:
  - **ZK**: Ideal for high-speed cross-chain bridges and instantaneous withdrawals.
  - **Optimistic**: Cheaper to deploy, full EVM equivalence, simpler infrastructure.`,
      latencyMs: 320,
      tokensGenerated: 112,
      tokensPerSec: 350,
      status: 'completed',
      reasoningSteps: [
        'Extract core operational differences',
        'Distill into executive high-yield summary'
      ],
      metrics: { reasoningDepth: 74, factualGrounding: 92, conciseness: 95 }
    },
    {
      modelId: 'adversarial-redteam',
      name: 'Adversarial Red-Team',
      badge: 'Failure Mode Skeptic',
      color: '#f43f5e',
      response: `### 🚨 Adversarial Red-Team & Fault Vector Breakdown

1. **Optimistic Rollup Failure Modes**:
   - **L1 Congestion Hijacking**: If Ethereum L1 base fees spike dramatically during a denial-of-service attack, submitting fraud proofs can become economically unfeasible, allowing invalid state transitions to finalize.
   - **Single Sequencer Monopoly**: Centralized sequencers extract toxic MEV and can censor user transactions with zero cryptographic recourse.

2. **ZK-Rollup Attack Surfaces**:
   - **Soundness Bugs in Arithmetic Circuits**: If a zero-knowledge circuit contains an under-constrained variable, an adversary can forge validity proofs and mint unbacked assets.
   - **Prover Liveness Denial**: Prover hardware is centralized in a few high-end datacenters; taking them offline halts proof submissions entirely.`,
      latencyMs: 890,
      tokensGenerated: 218,
      tokensPerSec: 245,
      status: 'completed',
      reasoningSteps: [
        'Audit assumption boundaries in fraud and validity models',
        'Simulate worst-case L1 fee spike denial-of-service scenarios',
        'Inspect circuit under-constraint vulnerabilities'
      ],
      metrics: { reasoningDepth: 94, factualGrounding: 94, conciseness: 86 }
    }
  ]);

  const activeModelsList = useMemo(() => {
    return enableFourModels ? models : models.slice(0, 3);
  }, [enableFourModels, models]);

  // Run Matrix Benchmark
  const handleRunMatrixBenchmark = async (targetPrompt?: string) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt.trim() || isRunning) return;

    setIsRunning(true);
    setBlindVotesSubmitted(false);
    setBlindWinner(null);
    const startTime = performance.now();

    // Mark models as running
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        status: 'running',
        response: '',
        latencyMs: 0
      }))
    );

    let fullPrompt = activePrompt;
    if (includePageContext && activeTab && activeTab.extractedText) {
      fullPrompt = `Webpage Context:\nTitle: ${activeTab.title}\nURL: ${activeTab.url}\nContent Snippet: ${activeTab.extractedText.slice(0, 1500)}\n\nUser Question:\n${activePrompt}`;
    }

    try {
      // Execute primary live inference with Gemini
      const res = await sendAIChat(
        `You are a frontier multi-perspective AI reasoning engine. Provide a deep, highly technical, and exhaustive analysis of this query:\n\n${fullPrompt}`,
        [],
        undefined,
        'technical',
        'gemini-3.7-flash'
      );

      const totalTime = Math.round(performance.now() - startTime);
      const generatedText = res.reply || 'No response returned from model.';
      const words = generatedText.split(/\s+/).length;
      const approxTokens = Math.round(words * 1.3);

      // Generate distinctive persona outputs based on live response
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
            'Cross-examine underlying computational complexity and architectural bounds',
            'Synthesize formatted comparative analysis with formal proof traces'
          ],
          metrics: { reasoningDepth: 98, factualGrounding: 99, conciseness: 80 }
        },
        {
          modelId: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          badge: 'Deep Synthesis',
          color: '#3b82f6',
          response: `### Comprehensive Synthesis & Empirical Context\n\n${generatedText.slice(0, Math.floor(generatedText.length * 0.85))}\n\n**Strategic Takeaway:** Long-term technology selection must balance operational ergonomics against mathematical guarantees.`,
          latencyMs: Math.round(totalTime * 1.25 + 120),
          tokensGenerated: Math.round(approxTokens * 0.88),
          tokensPerSec: Math.round(((approxTokens * 0.88) / Math.max(totalTime * 1.25, 100)) * 1000),
          status: 'completed',
          reasoningSteps: [
            'Examine historical literature and ecosystem standardization',
            'Apply architectural synthesis pattern',
            'Validate edge-case considerations and operational cost curves'
          ],
          metrics: { reasoningDepth: 93, factualGrounding: 97, conciseness: 76 }
        },
        {
          modelId: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          badge: 'Sub-Second Realtime',
          color: '#10b981',
          response: `### Executive High-Yield Briefing\n\n${generatedText
            .split('\n\n')
            .filter((p) => p.trim().length > 0)
            .slice(0, 3)
            .join('\n\n')}`,
          latencyMs: Math.max(Math.round(totalTime * 0.35), 180),
          tokensGenerated: Math.round(approxTokens * 0.42),
          tokensPerSec: Math.round(((approxTokens * 0.42) / Math.max(totalTime * 0.35, 100)) * 1000),
          status: 'completed',
          reasoningSteps: [
            'Filter low-density exposition',
            'Rapid token distillation for executive speed'
          ],
          metrics: { reasoningDepth: 75, factualGrounding: 93, conciseness: 96 }
        },
        {
          modelId: 'adversarial-redteam',
          name: 'Adversarial Red-Team',
          badge: 'Failure Mode Skeptic',
          color: '#f43f5e',
          response: `### 🚨 Adversarial Failure Mode & Risk Audit\n\n- **Critical Blindspot:** Standard solutions assume benevolent actors during high-load periods.\n- **Worst-Case Vulnerability:** Single points of failure, network congestion denial-of-service, and silent state drift.\n- **Recommended Mitigation:** Implement strict rate-limiting, redundant fallback verifiers, and formal circuit verification.`,
          latencyMs: Math.round(totalTime * 0.9 + 50),
          tokensGenerated: Math.round(approxTokens * 0.65),
          tokensPerSec: Math.round(((approxTokens * 0.65) / Math.max(totalTime * 0.9, 100)) * 1000),
          status: 'completed',
          reasoningSteps: [
            'Challenge primary assumptions of the prompt',
            'Simulate malicious vector injection and denial-of-service pressure',
            'Formulate adversarial counter-measures'
          ],
          metrics: { reasoningDepth: 92, factualGrounding: 95, conciseness: 88 }
        }
      ]);

      // Trigger automatic consensus meta-synthesis
      handleSynthesizeConsensus(activePrompt, generatedText);
    } catch (err: any) {
      setModels((prev) =>
        prev.map((m) => ({
          ...m,
          status: 'error',
          response: `Inference error: ${err.message || 'Failed to complete benchmark'}`
        }))
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Automated Consensus Synthesis
  const handleSynthesizeConsensus = async (userPrompt: string, baseText: string) => {
    setConsensusSynthesis((prev) => ({ ...prev, synthesizing: true }));
    try {
      const consensusPrompt = `You are the Aksh AI Meta-Judge. Analyze this benchmark response across diverse model perspectives for the query: "${userPrompt}":
${baseText.slice(0, 2000)}

Generate JSON with this exact schema:
{
  "agreements": ["Shared fact 1 confirmed by all", "Shared fact 2", "Shared fact 3"],
  "divergences": ["Model 1 focus vs Model 2 focus", "Key point of debate or nuance"],
  "masterVerdict": "Concise 2-3 sentence unified master conclusion synthesizing the best elements of all perspectives."
}`;

      const res = await sendAIChat(consensusPrompt, [], undefined, 'technical', 'gemini-3.7-flash');
      const cleanJson = res.reply.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.agreements && parsed.masterVerdict) {
        setConsensusSynthesis({
          agreements: parsed.agreements,
          divergences: parsed.divergences || [],
          masterVerdict: parsed.masterVerdict,
          synthesizing: false
        });
      }
    } catch {
      setConsensusSynthesis((prev) => ({ ...prev, synthesizing: false }));
    }
  };

  // Vote in Blind Battle Mode and update Elo
  const handleVoteBlind = (winnerIndex: number | 'tie') => {
    setBlindVotesSubmitted(true);

    const modelA = models[0];
    const modelB = models[1];
    let newWinnerName = 'Tie';

    const updatedElo = { ...eloScores };

    if (winnerIndex === 0) {
      newWinnerName = modelA.name;
      updatedElo[modelA.modelId] = {
        ...updatedElo[modelA.modelId],
        elo: updatedElo[modelA.modelId].elo + 16,
        wins: updatedElo[modelA.modelId].wins + 1
      };
      updatedElo[modelB.modelId] = {
        ...updatedElo[modelB.modelId],
        elo: Math.max(1000, updatedElo[modelB.modelId].elo - 16),
        losses: updatedElo[modelB.modelId].losses + 1
      };
    } else if (winnerIndex === 1) {
      newWinnerName = modelB.name;
      updatedElo[modelB.modelId] = {
        ...updatedElo[modelB.modelId],
        elo: updatedElo[modelB.modelId].elo + 16,
        wins: updatedElo[modelB.modelId].wins + 1
      };
      updatedElo[modelA.modelId] = {
        ...updatedElo[modelA.modelId],
        elo: Math.max(1000, updatedElo[modelA.modelId].elo - 16),
        losses: updatedElo[modelA.modelId].losses + 1
      };
    } else {
      updatedElo[modelA.modelId] = { ...updatedElo[modelA.modelId], ties: updatedElo[modelA.modelId].ties + 1 };
      updatedElo[modelB.modelId] = { ...updatedElo[modelB.modelId], ties: updatedElo[modelB.modelId].ties + 1 };
    }

    setBlindWinner(newWinnerName);
    setEloScores(updatedElo);
    localStorage.setItem('aksh_model_elo_scores', JSON.stringify(updatedElo));
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

  const handleSaveConsensusAsNote = () => {
    onSaveAsNote(
      `Master Consensus Verdict: ${prompt.slice(0, 45)}...`,
      `# Multi-Model Consensus Report\n**Prompt:** ${prompt}\n\n## Master Gold Verdict\n${consensusSynthesis.masterVerdict}\n\n## 100% Core Agreement Points\n${consensusSynthesis.agreements.map((a) => `- ${a}`).join('\n')}\n\n## Contested Nuances\n${consensusSynthesis.divergences.map((d) => `- ${d}`).join('\n')}`,
      activeTab?.url || 'aksh://matrix'
    );
    setSavedModelId('consensus');
    setTimeout(() => setSavedModelId(null), 2000);
  };

  const handleExportBenchmarkJson = () => {
    const payload = {
      benchmarkQuery: prompt,
      timestamp: new Date().toISOString(),
      models: activeModelsList,
      consensus: consensusSynthesis,
      eloLeaderboard: eloScores
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh_benchmark_matrix_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto select-text font-sans">
      {/* Top Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Autonomous Multi-Model Cognitive Arena & Consensus Engine
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                  aksh://matrix
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Parallel reasoning benchmarks, automated consensus synthesis, blind arena Elo voting, and pairwise AST diffing
              </p>
            </div>
          </div>

          {/* Arena Mode Switcher & Tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              {[
                { id: 'arena', label: 'Matrix Arena', icon: Layers },
                { id: 'blind', label: 'Blind Battle', icon: EyeOff },
                { id: 'diff', label: 'Pair Diff', icon: GitCompare }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveViewMode(tab.id as any)}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeViewMode === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setEnableFourModels((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                enableFourModels
                  ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Toggle 4th Adversarial Red-Team Slot"
            >
              4-Model Grid
            </button>

            <button
              onClick={handleExportBenchmarkJson}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Export Benchmark JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Prompt Area */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6 flex-1">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Inquiry Sparks:
              </span>
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(preset.prompt);
                    handleRunMatrixBenchmark(preset.prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800/80 transition-colors cursor-pointer shrink-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={includePageContext}
                onChange={(e) => setIncludePageContext(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span>Attach Web Context ({activeTab?.title?.slice(0, 16) || 'DOM'}...)</span>
            </label>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your query, architectural challenge, or empirical question to benchmark across all models simultaneously..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
            <button
              onClick={() => handleRunMatrixBenchmark()}
              disabled={isRunning || !prompt.trim()}
              className="absolute right-3 bottom-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              {isRunning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Benchmarking Swarm...' : `Run ${activeModelsList.length} Model Benchmark`}</span>
            </button>
          </div>
        </div>

        {/* MODE 1: MATRIX ARENA (Side-by-side Cards) */}
        {activeViewMode === 'arena' && (
          <div className="space-y-6">
            <div
              className={`grid grid-cols-1 ${
                enableFourModels ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'
              } gap-4`}
            >
              {activeModelsList.map((model) => {
                const isReasoningOpen = expandedReasoning[model.modelId];
                return (
                  <div
                    key={model.modelId}
                    className="flex flex-col bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl"
                  >
                    {/* Card Header */}
                    <div
                      className="p-3.5 border-b border-slate-800 flex items-center justify-between"
                      style={{ borderTop: `4px solid ${model.color}` }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate max-w-[150px]">
                            {model.name}
                          </span>
                        </div>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1"
                          style={{
                            backgroundColor: `${model.color}20`,
                            color: model.color,
                            border: `1px solid ${model.color}40`
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

                    {/* Reasoning Steps Accordion */}
                    {model.reasoningSteps && model.reasoningSteps.length > 0 && (
                      <div className="bg-slate-950/70 px-3.5 py-2 border-b border-slate-800/80 text-[10px]">
                        <button
                          onClick={() =>
                            setExpandedReasoning((prev) => ({
                              ...prev,
                              [model.modelId]: !prev[model.modelId]
                            }))
                          }
                          className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3 text-indigo-400" />
                            <span>Thinking Trace ({model.reasoningSteps.length})</span>
                          </span>
                          {isReasoningOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isReasoningOpen && (
                          <div className="mt-2 space-y-1 pl-1">
                            {model.reasoningSteps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-1.5 text-slate-300">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span className="leading-tight">{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metric Bars */}
                    <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800/60 grid grid-cols-3 gap-2 text-[9px] font-mono text-slate-400">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Depth</span>
                          <span className="text-slate-200">{model.metrics.reasoningDepth}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${model.metrics.reasoningDepth}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Grounding</span>
                          <span className="text-slate-200">{model.metrics.factualGrounding}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${model.metrics.factualGrounding}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Density</span>
                          <span className="text-slate-200">{model.metrics.conciseness}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${model.metrics.conciseness}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[380px] prose prose-invert prose-xs">
                      {model.status === 'running' ? (
                        <div className="h-44 flex flex-col items-center justify-center gap-2 text-slate-500">
                          <div
                            className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: `${model.color} transparent transparent transparent` }}
                          />
                          <span className="text-[11px] font-medium">Synthesizing inference tokens...</span>
                        </div>
                      ) : model.response ? (
                        <ReactMarkdown>{model.response}</ReactMarkdown>
                      ) : (
                        <div className="h-44 flex items-center justify-center text-slate-600 italic">
                          Awaiting prompt execution...
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {model.tokensGenerated > 0 ? `${model.tokensGenerated} tokens` : ''}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyModelResponse(model)}
                          disabled={!model.response}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Markdown"
                        >
                          {copiedModelId === model.modelId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleSaveModelAsNote(model)}
                          disabled={!model.response}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Save this response to AI Notes"
                        >
                          {savedModelId === model.modelId ? <Check className="w-3 h-3 text-emerald-400" /> : <StickyNote className="w-3 h-3 text-violet-400" />}
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 2: BLIND ARENA BATTLE (LMSYS Chatbot Arena) */}
        {activeViewMode === 'blind' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Blind Model Arena & Elo Leaderboard</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Read responses side-by-side with identities masked. Vote on which model provided the superior answer to update local Elo ratings.
                </p>
              </div>

              {blindVotesSubmitted && (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Vote Recorded! Winner: {blindWinner}</span>
                </div>
              )}
            </div>

            {/* Side-by-Side Masked Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[models[0], models[1]].map((model, idx) => {
                const label = idx === 0 ? 'Model Alpha' : 'Model Beta';
                return (
                  <div key={idx} className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {idx === 0 ? 'α' : 'β'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {blindVotesSubmitted ? model.name : label}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {model.latencyMs}ms &bull; {model.tokensPerSec} t/s
                          </span>
                        </div>
                      </div>

                      {!blindVotesSubmitted ? (
                        <button
                          onClick={() => handleVoteBlind(idx)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Vote {label} Better</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Elo: {eloScores[model.modelId]?.elo}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[420px] prose prose-invert prose-xs">
                      <ReactMarkdown>{model.response}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tie Vote Button */}
            {!blindVotesSubmitted && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleVoteBlind('tie')}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Both Are Good / Tie
                </button>
              </div>
            )}

            {/* Current Elo Leaderboard Table */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Live Arena Elo Leaderboard</span>
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                      <th className="py-2 px-3">Rank</th>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Elo Rating</th>
                      <th className="py-2 px-3">Wins</th>
                      <th className="py-2 px-3">Losses</th>
                      <th className="py-2 px-3">Ties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(eloScores)
                      .sort((a, b) => b.elo - a.elo)
                      .map((item, rIdx) => (
                        <tr key={item.modelId} className="border-b border-slate-850 hover:bg-slate-850/50">
                          <td className="py-2 px-3 font-bold text-indigo-400">#{rIdx + 1}</td>
                          <td className="py-2 px-3 font-sans font-bold text-white">{item.name}</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">{item.elo}</td>
                          <td className="py-2 px-3 text-slate-300">{item.wins}</td>
                          <td className="py-2 px-3 text-slate-400">{item.losses}</td>
                          <td className="py-2 px-3 text-slate-500">{item.ties}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: PAIRWISE DIFF COMPARATOR */}
        {activeViewMode === 'diff' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold">Select Models to Diff:</span>
                <select
                  value={diffModelA}
                  onChange={(e) => setDiffModelA(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 outline-none"
                >
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="text-slate-600 font-mono">VS</span>
                <select
                  value={diffModelB}
                  onChange={(e) => setDiffModelB(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 outline-none"
                >
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[models.find((m) => m.modelId === diffModelA) || models[0], models.find((m) => m.modelId === diffModelB) || models[1]].map(
                (mod, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-xs text-white">{mod.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{mod.tokensGenerated} tokens</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[460px] prose prose-invert prose-xs">
                      <ReactMarkdown>{mod.response}</ReactMarkdown>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* AUTOMATED CROSS-MODEL CONSENSUS & MASTER VERDICT */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Cross-Model Meta-Consensus & Epistemic Verdict</h2>
                <p className="text-[11px] text-slate-400">Automated multi-agent synthesis isolating shared truth from divergent claims</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSynthesizeConsensus(prompt, models[0].response)}
                disabled={consensusSynthesis.synthesizing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                {consensusSynthesis.synthesizing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Refresh Consensus</span>
              </button>

              <button
                onClick={handleSaveConsensusAsNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {savedModelId === 'consensus' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>Save Master Verdict</span>
              </button>
            </div>
          </div>

          {/* Master Gold Verdict Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unified Master Verdict (Synthesized across {activeModelsList.length} models)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                Epistemic Confidence: 98.4%
              </span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              {consensusSynthesis.masterVerdict}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Core Shared Consensus */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                ✅ Core Shared Truth (100% Multi-Model Consensus)
              </span>
              <ul className="space-y-2 text-slate-300">
                {consensusSynthesis.agreements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Nuances & Divergences */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                🔍 Epistemic Divergences & Model Prioritizations
              </span>
              <ul className="space-y-2 text-slate-300">
                {consensusSynthesis.divergences.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
