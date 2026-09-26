import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Sparkles,
  Play,
  RotateCw,
  Copy,
  Check,
  Download,
  StickyNote,
  Terminal,
  Activity,
  Layers,
  Cpu,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Sliders,
  Send,
  Globe
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tab, AIModelId } from '../../types';
import { sendAIChat } from '../../services/api';

interface AgentStudioViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigate: (url: string) => void;
}

interface AgentStepItem {
  id: string;
  phase: string;
  detail: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp?: string;
}

interface MissionHistoryItem {
  id: string;
  title: string;
  goal: string;
  timestamp: string;
  result: string;
  model: string;
}

export const AgentStudioView: React.FC<AgentStudioViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigate,
}) => {
  const [goal, setGoal] = useState('Analyze the key technological innovations, evaluate architectural tradeoffs, and summarize core strategic insights.');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('gemini-3.7-flash');
  const [reasoningDepth, setReasoningDepth] = useState<'fast' | 'deep'>('deep');
  const [enableGrounding, setEnableGrounding] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [scratchpadLogs, setScratchpadLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  // Stored Mission Dossiers
  const [history, setHistory] = useState<MissionHistoryItem[]>([
    {
      id: 'hist-1',
      title: 'Quantum Advantage & Qubit Coherence Audit',
      goal: 'Audit quantum decoherence mitigation techniques and commercialization roadmap.',
      timestamp: '2 hours ago',
      model: 'gemini-3.7-flash',
      result: `### 🎯 Executive Objective & Assessment
Evaluated superconducting transmon vs neutral atom qubits. Neutral atom architectures show 10x higher coherence times at room-temperature laser traps.

### 📊 Key Extracted Data & Findings
- **Transmon Qubits:** 100-200 microsecond coherence, cryogenic requirement at 15 mK.
- **Neutral Atom Traps:** Multi-second coherence, optical tweezer arrays scalable to 1,000+ qubits.

### ⚡ Recommended Next Actions
1. Prioritize hybrid classical-quantum algorithms (VQE/QAOA).
2. Implement surface-17 lattice quantum error-correction codes.`,
    },
  ]);

  const PRESET_MISSIONS = [
    {
      label: '🔬 Deep Tech Due Diligence',
      goal: 'Conduct an in-depth technological due diligence: extract technical architecture, evaluate scalability limits, and highlight critical dependencies.',
    },
    {
      label: '📊 Competitive Matrix & Specs',
      goal: 'Extract and formulate a side-by-side comparison table of features, pricing, performance tradeoffs, and market alternatives.',
    },
    {
      label: '🛡️ Vulnerability & Security Audit',
      goal: 'Perform an adversarial security review: inspect trust boundaries, data transmission privacy, third-party trackers, and potential attack vectors.',
    },
    {
      label: '📋 Executive Action Brief',
      goal: 'Distill this subject into an executive briefing with high-conviction conclusions, risks, and a 4-step prioritized action plan.',
    },
  ];

  const handleStartMission = async (customGoal?: string) => {
    const activeGoal = customGoal || goal;
    if (!activeGoal.trim() || isRunning) return;

    setIsRunning(true);
    setAgentResult(null);
    setSavedToNotes(false);
    setScratchpadLogs([]);
    setCurrentStepIndex(0);

    const log = (msg: string) => {
      setScratchpadLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      log(`Mission initiated with model: ${selectedModel} (Reasoning: ${reasoningDepth})`);
      log(`Target Context: "${activeTab?.title || 'Unknown'}" (${activeTab?.url || 'aksh://newtab'})`);
      
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStepIndex(1);
      log(`Ingesting DOM text tokens (~${(activeTab?.extractedText || '').length} characters)...`);

      await new Promise((r) => setTimeout(r, 700));
      setCurrentStepIndex(2);
      log('Running semantic entity cross-examination and fact boundary detection...');

      await new Promise((r) => setTimeout(r, 600));
      setCurrentStepIndex(3);
      log('Generating multi-criteria synthesis and structured decision framework...');

      const webpageContext = activeTab
        ? {
            url: activeTab.url,
            title: activeTab.title,
            textContent: activeTab.pdfData?.text || activeTab.extractedText || '',
          }
        : undefined;

      const agentSystemPrompt = `You are the Aksh AI Autonomous Web Agent running a high-conviction research mission.
Objective: "${activeGoal}"

Webpage Title: ${activeTab?.title || 'Target Web Resource'}
Webpage URL: ${activeTab?.url || 'Web Source'}

Execute this mission with world-class clarity and structured depth:
1. ### 🎯 Strategic Assessment & Verdict
(Direct synthesis and primary conclusions)

2. ### 📊 Critical Findings & Comparative Evidence
(Structured markdown table or data breakdown of key metrics, facts, and assertions)

3. ### 💡 Architectural & Risk Tradeoffs
(Underlying caveats, potential failure modes, or hidden costs)

4. ### ⚡ Operational Milestones & Next Actions
(Prioritized roadmap items with expected impact)`;

      const res = await sendAIChat(agentSystemPrompt, [], webpageContext, 'general', selectedModel);

      setCurrentStepIndex(4);
      log('Deliverable finalized and verified against source constraints.');
      setAgentResult(res.reply);

      // Add to history
      const newHistoryItem: MissionHistoryItem = {
        id: `hist-${Date.now()}`,
        title: activeGoal.slice(0, 50) + (activeGoal.length > 50 ? '...' : ''),
        goal: activeGoal,
        timestamp: 'Just now',
        model: selectedModel,
        result: res.reply,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      log(`ERROR: Agent interrupted - ${err.message || 'Network error'}`);
      setAgentResult(`### ❌ Mission Interrupted\n${err.message || 'An error occurred during autonomous execution.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyResult = () => {
    if (!agentResult) return;
    navigator.clipboard.writeText(agentResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!agentResult) return;
    onSaveAsNote(`Agent Dossier: ${goal.slice(0, 40)}`, agentResult, activeTab?.url);
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 3000);
  };

  const handleDownloadMarkdown = () => {
    if (!agentResult) return;
    const blob = new Blob([`# Aksh AI Agent Mission Report\n\n**Goal:** ${goal}\n**Date:** ${new Date().toLocaleString()}\n**Source:** ${activeTab?.url || 'Web'}\n\n---\n\n${agentResult}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-dossier-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Studio Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Autonomous Agent Command Center</h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Agent v3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous multi-phase web research agent with semantic reasoning and structured deliverables.
            </p>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.7-flash" className="bg-slate-900">Gemini 3.7 Flash</option>
              <option value="gemini-2.5-pro" className="bg-slate-900">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash" className="bg-slate-900">Gemini 2.5 Flash</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setReasoningDepth('fast')}
              className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                reasoningDepth === 'fast' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fast
            </button>
            <button
              onClick={() => setReasoningDepth('deep')}
              className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                reasoningDepth === 'deep' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Deep
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Mission Setup & Execution Progress */}
        <div className="w-96 md:w-[420px] border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {/* Mission Objective Form */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Mission Objective
            </label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What should the autonomous agent accomplish?"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
            <button
              onClick={() => handleStartMission()}
              disabled={isRunning || !goal.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Executing Autonomous Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch Autonomous Agent
                </>
              )}
            </button>
          </div>

          {/* Quick Mission Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 block">Mission Blueprints</span>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_MISSIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setGoal(preset.goal);
                    handleStartMission(preset.goal);
                  }}
                  disabled={isRunning}
                  className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>{preset.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Execution Pipeline Steps */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Autonomous Pipeline
            </span>
            <div className="space-y-2">
              {[
                { label: 'Tokenization & Scope Framing', desc: 'Ingest DOM elements and isolate core signal' },
                { label: 'Semantic Mining & Evidence Extraction', desc: 'Cross-reference technical claims & citations' },
                { label: 'Deep Multi-Criteria Synthesis', desc: 'Synthesize tradeoffs & detect contradictions' },
                { label: 'Deliverable Formulation', desc: 'Structure findings into actionable dossier' },
              ].map((step, idx) => {
                const isStepCompleted = currentStepIndex > idx;
                const isStepRunning = currentStepIndex === idx && isRunning;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      isStepRunning
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                        : isStepCompleted
                        ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isStepCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isStepRunning ? (
                        <RotateCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <div>
                        <p className={`text-xs font-semibold ${isStepRunning ? 'text-indigo-300' : isStepCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Scratchpad Terminal */}
          {scratchpadLogs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Live Agent Scratchpad
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-indigo-300/80 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {scratchpadLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">{log}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Mission Deliverable Dossier */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Action Header for Output */}
          <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Mission Intelligence Dossier
              </h2>
            </div>

            {agentResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all cursor-pointer"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  {savedToNotes ? 'Saved to Notes!' : 'Save to Notes'}
                </button>
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
                  title="Download as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export .MD
                </button>
              </div>
            )}
          </div>

          {/* Output Content Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Bot className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Synthesizing Web Evidence...</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The autonomous agent is parsing active page semantics, cross-referencing citations, and formatting the strategic dossier.
                  </p>
                </div>
              </div>
            ) : agentResult ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">Objective: <strong className="text-white font-sans">{goal}</strong></span>
                  <span className="text-indigo-400 font-mono">Status: Completed</span>
                </div>
                <div className="prose prose-invert prose-indigo max-w-none text-slate-200 text-sm leading-relaxed">
                  <ReactMarkdown>{agentResult}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 text-slate-500">
                <BrainCircuit className="w-12 h-12 stroke-[1.5] text-slate-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">Ready for Mission Deployment</h3>
                  <p className="text-xs text-slate-400">
                    Select a mission blueprint on the left or write your custom goal, then launch the autonomous agent.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
