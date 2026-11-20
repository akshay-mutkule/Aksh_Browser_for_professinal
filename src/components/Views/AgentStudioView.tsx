import React, { useState, useEffect } from 'react';
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
  Layers,
  Cpu,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sliders,
  Send,
  Code2,
  Database,
  Globe
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Tab, AIModelId } from '../../types';
import { sendAIChat, scrapeWebpage, extractStructuredData } from '../../services/api';

interface AgentStudioViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onNavigate: (url: string) => void;
}

interface ExecutionStage {
  id: string;
  step: number;
  title: string;
  role: string;
  status: 'idle' | 'running' | 'completed';
  durationMs?: number;
  detail: string;
  outputPreview?: string;
}

interface SwarmAgentLog {
  agent: 'Planner' | 'Scout' | 'Extractor' | 'Synthesizer';
  message: string;
  timestamp: string;
}

const PRESET_MISSIONS = [
  {
    label: 'Technical Due Diligence',
    goal: 'Evaluate technical architecture, scaling limits, key dependencies, and security posture.',
  },
  {
    label: 'Comparative Spec Breakdown',
    goal: 'Extract core capabilities, pricing tiers, performance tradeoffs, and alternatives into a structured comparison.',
  },
  {
    label: 'Threat & Privacy Audit',
    goal: 'Inspect trust boundaries, data transmission risks, authentication design, and attack vectors.',
  },
  {
    label: 'Executive Action Brief',
    goal: 'Distill into key strategic conclusions, quantified risks, and a prioritized 4-step roadmap.',
  },
];

export const AgentStudioView: React.FC<AgentStudioViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigate,
}) => {
  const [goal, setGoal] = useState(
    'Analyze key technical capabilities, evaluate architectural tradeoffs, and summarize strategic insights.'
  );
  const [targetSourceMode, setTargetSourceMode] = useState<'activeTab' | 'customUrl'>('activeTab');
  const [customTargetUrl, setCustomTargetUrl] = useState('https://example.com');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('gemini-3.7-flash');
  const [executionMode, setExecutionMode] = useState<'single' | 'swarm'>('swarm');

  const [isRunning, setIsRunning] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'pipeline' | 'dossier' | 'context' | 'data' | 'recipe'>('pipeline');
  const [selectedStageId, setSelectedStageId] = useState<string>('planner');

  const [hitlConstraints, setHitlConstraints] = useState<string[]>([]);
  const [injectedDirective, setInjectedDirective] = useState<string>('');
  const [injectedSuccess, setInjectedSuccess] = useState<boolean>(false);

  const [scratchpadLogs, setScratchpadLogs] = useState<string[]>([]);
  const [swarmLogs, setSwarmLogs] = useState<SwarmAgentLog[]>([]);
  const [stages, setStages] = useState<ExecutionStage[]>([
    {
      id: 'planner',
      step: 1,
      title: 'Mission Framing & Plan Decomposition',
      role: 'Planner Agent',
      status: 'idle',
      detail: 'Structures objective and applies user HITL constraints.',
    },
    {
      id: 'scout',
      step: 2,
      title: 'Web Context Ingestion & Heading Audit',
      role: 'Scout Agent',
      status: 'idle',
      detail: 'Captures target URL content, headings, and metadata.',
    },
    {
      id: 'extractor',
      step: 3,
      title: 'Structured Entity & Schema Extraction',
      role: 'Extractor Agent',
      status: 'idle',
      detail: 'Parses structured entities and metrics into portable JSON.',
    },
    {
      id: 'synthesizer',
      step: 4,
      title: 'Grounded Executive Dossier Synthesis',
      role: 'Synthesizer Agent',
      status: 'idle',
      detail: 'Compiles verified findings and actionable recommendations.',
    },
  ]);

  // Captured real run metrics & outputs
  const [capturedContext, setCapturedContext] = useState<{
    url: string;
    title: string;
    headings: string[];
    textLength: number;
    excerpt: string;
  } | null>(null);
  const [runMetrics, setRunMetrics] = useState<{
    totalDurationMs: number;
    sourceChars: number;
    outputWords: number;
    modelUsed: string;
  } | null>(null);
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [extractedJsonData, setExtractedJsonData] = useState<any>(null);

  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  const updateStage = (id: string, patch: Partial<ExecutionStage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleStartMission = async (customGoal?: string) => {
    const activeGoal = (customGoal || goal).trim();
    if (!activeGoal || isRunning) return;

    setIsRunning(true);
    setAgentResult(null);
    setExtractedJsonData(null);
    setSavedToNotes(false);
    setScratchpadLogs([]);
    setSwarmLogs([]);
    setRunMetrics(null);
    setStages((prev) => prev.map((s) => ({ ...s, status: 'idle', durationMs: undefined, outputPreview: undefined })));

    const missionStart = performance.now();
    const log = (msg: string) => {
      setScratchpadLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`,
      ]);
    };
    const addSwarmLog = (agent: SwarmAgentLog['agent'], message: string) => {
      setSwarmLogs((prev) => [
        ...prev,
        { agent, message, timestamp: new Date().toLocaleTimeString([], { hour12: false }) },
      ]);
    };

    try {
      // Stage 1: Planner
      const s1Start = performance.now();
      updateStage('planner', { status: 'running' });
      log(`Mission started (${executionMode} · ${selectedModel}).`);
      addSwarmLog('Planner', `Framed goal: "${activeGoal.slice(0, 80)}"${hitlConstraints.length ? ` with ${hitlConstraints.length} HITL constraint(s).` : '.'}`);
      updateStage('planner', {
        status: 'completed',
        durationMs: Math.round(performance.now() - s1Start),
        outputPreview: JSON.stringify({ goal: activeGoal, constraints: hitlConstraints, mode: executionMode }, null, 2),
      });

      // Stage 2: Scout (real tab context or live scrape)
      const s2Start = performance.now();
      updateStage('scout', { status: 'running' });
      let targetUrl = activeTab?.url || 'aksh://newtab';
      let targetTitle = activeTab?.title || 'Active Session';
      let targetHeadings = activeTab?.headings || [];
      let targetText = activeTab?.pdfData?.text || activeTab?.extractedText || activeTab?.metaDescription || '';

      if (targetSourceMode === 'customUrl' && customTargetUrl.trim()) {
        const normalizedUrl =
          customTargetUrl.startsWith('http://') || customTargetUrl.startsWith('https://')
            ? customTargetUrl.trim()
            : `https://${customTargetUrl.trim()}`;
        const scraped = await scrapeWebpage(normalizedUrl);
        targetUrl = scraped.url || normalizedUrl;
        targetTitle = scraped.title || normalizedUrl;
        targetHeadings = scraped.headings || [];
        targetText = scraped.textContent || scraped.metaDescription || '';
        log(`Scraped ${targetUrl} (${targetText.length} chars, ${targetHeadings.length} headings).`);
      } else {
        log(`Ingested active tab "${targetTitle}" (${targetText.length} chars).`);
      }

      const contextSnapshot = {
        url: targetUrl,
        title: targetTitle,
        headings: targetHeadings,
        textLength: targetText.length,
        excerpt: targetText.slice(0, 1200),
      };
      setCapturedContext(contextSnapshot);
      addSwarmLog('Scout', `Captured ${targetText.length} chars and ${targetHeadings.length} headings from ${targetUrl}.`);
      updateStage('scout', {
        status: 'completed',
        durationMs: Math.round(performance.now() - s2Start),
        outputPreview: JSON.stringify({ url: targetUrl, title: targetTitle, headings: targetHeadings.slice(0, 6), chars: targetText.length }, null, 2),
      });

      // Stage 3: Extractor (real structured data call in swarm mode or if text exists)
      const s3Start = performance.now();
      updateStage('extractor', { status: 'running' });
      let extractedPayload: any = null;
      if (executionMode === 'swarm') {
        try {
          const extRes = await extractStructuredData(
            targetText.slice(0, 4500) || `Topic: ${activeGoal}`,
            targetTitle,
            targetUrl,
            'json'
          );
          try {
            const match = extRes.data.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            extractedPayload = match ? JSON.parse(match[0]) : { raw: extRes.data };
          } catch {
            extractedPayload = { extractedMarkdown: extRes.data };
          }
          addSwarmLog('Extractor', `Extracted structured schema (${extRes.data.length} chars).`);
        } catch (err: any) {
          extractedPayload = { note: 'Structured extraction skipped', reason: err?.message };
        }
      } else {
        extractedPayload = {
          mode: 'single_agent_pass',
          sourceUrl: targetUrl,
          headingsCaptured: targetHeadings,
        };
      }
      setExtractedJsonData(extractedPayload);
      updateStage('extractor', {
        status: 'completed',
        durationMs: Math.round(performance.now() - s3Start),
        outputPreview: JSON.stringify(extractedPayload, null, 2).slice(0, 800),
      });

      // Stage 4: Synthesizer (real Gemini call with HITL constraints & scraped context)
      const s4Start = performance.now();
      updateStage('synthesizer', { status: 'running' });
      const constraintBlock =
        hitlConstraints.length > 0
          ? `\nStrict User Constraints (HITL):\n${hitlConstraints.map((c) => `- ${c}`).join('\n')}`
          : '';

      const prompt = `Execute the following autonomous web intelligence mission cleanly and rigorously.

Mission Objective: ${activeGoal}
Source Title: ${targetTitle}
Source URL: ${targetUrl}${constraintBlock}

${extractedPayload ? `Extracted Structured Context:\n${JSON.stringify(extractedPayload).slice(0, 1800)}` : ''}

Deliver a well-structured Markdown report with:
1. Executive Assessment & Conclusions
2. Key Findings & Evidence Table
3. Architectural / Risk Tradeoffs
4. Prioritized Next Actions`;

      const res = await sendAIChat(
        prompt,
        [],
        { url: targetUrl, title: targetTitle, textContent: targetText.slice(0, 5000) },
        'general',
        selectedModel
      );

      const replyText = res.reply || 'No output generated.';
      setAgentResult(replyText);
      const totalDurationMs = Math.round(performance.now() - missionStart);
      const outputWords = replyText.trim().split(/\s+/).filter(Boolean).length;

      setRunMetrics({
        totalDurationMs,
        sourceChars: targetText.length,
        outputWords,
        modelUsed: selectedModel,
      });

      updateStage('synthesizer', {
        status: 'completed',
        durationMs: Math.round(performance.now() - s4Start),
        outputPreview: replyText.slice(0, 600),
      });
      addSwarmLog('Synthesizer', `Completed executive dossier (${outputWords} words) in ${totalDurationMs} ms.`);
      log(`Mission completed in ${totalDurationMs} ms.`);
    } catch (err: any) {
      log(`Mission error: ${err?.message || 'Execution failed'}`);
      setAgentResult(`### Mission Interrupted\n${err?.message || 'An error occurred during execution.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleInjectConstraint = () => {
    const clean = injectedDirective.trim();
    if (!clean) return;
    setHitlConstraints((prev) => [...prev, clean]);
    setScratchpadLogs((prev) => [...prev, `[HITL] Added constraint: "${clean}"`]);
    setInjectedDirective('');
    setInjectedSuccess(true);
    setTimeout(() => setInjectedSuccess(false), 2000);
  };

  const handleCopyResult = () => {
    if (!agentResult) return;
    navigator.clipboard.writeText(agentResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!agentResult) return;
    onSaveAsNote(
      `Agent Dossier: ${goal.slice(0, 48)}`,
      agentResult,
      capturedContext?.url || activeTab?.url
    );
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!agentResult) return;
    const blob = new Blob(
      [
        `# Agent Mission Dossier\n\nObjective: ${goal}\nSource: ${capturedContext?.url || activeTab?.url || 'Web'}\n\n---\n\n${agentResult}`,
      ],
      { type: 'text/markdown;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-dossier-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targetUrlForScript =
    targetSourceMode === 'customUrl'
      ? customTargetUrl
      : activeTab?.url || 'https://example.com';

  const generatedAutomationScript = `// Autonomous Playwright Extraction Script
// Objective: "${goal}"
import { chromium } from 'playwright';

async function runMission() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('${targetUrlForScript}', { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  const headings = await page.$$eval('h1, h2, h3', els => els.map(e => e.textContent?.trim()).filter(Boolean));
  const bodyText = await page.locator('main, article, body').first().innerText();

  console.log({ title, headingsCount: headings.length, chars: bodyText.length });
  await browser.close();
}

runMission();`;

  const activeStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-text">
      {/* Clean Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              Autonomous Web Agent Studio
            </h1>
            <p className="text-xs text-slate-400">
              Multi-stage web ingestion, structured schema extraction, HITL constraints &amp; grounded synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setExecutionMode('single')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                executionMode === 'single' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Single Pass
            </button>
            <button
              onClick={() => setExecutionMode('swarm')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                executionMode === 'swarm' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Agent Pipeline</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              aria-label="Agent AI Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as AIModelId)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.7-flash" className="bg-slate-900">Gemini 3.7 Flash</option>
              <option value="gemini-2.5-pro" className="bg-slate-900">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash" className="bg-slate-900">Gemini 2.5 Flash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Configuration Column */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0 overflow-y-auto p-5 space-y-5 max-h-72 lg:max-h-none">
          {/* Source Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Target Context</span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTargetSourceMode('activeTab')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    targetSourceMode === 'activeTab' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Active Tab
                </button>
                <button
                  type="button"
                  onClick={() => setTargetSourceMode('customUrl')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    targetSourceMode === 'customUrl' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Custom URL
                </button>
              </div>
            </div>

            {targetSourceMode === 'activeTab' ? (
              <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 truncate">
                {activeTab?.title || 'Current Tab'} ({activeTab?.url || 'aksh://newtab'})
              </div>
            ) : (
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customTargetUrl}
                  onChange={(e) => setCustomTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Objective Form */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">Mission Objective</label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Define what the autonomous agent should investigate and extract..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
            />
            <button
              onClick={() => handleStartMission()}
              disabled={isRunning || !goal.trim()}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Agent Mission</span>
                </>
              )}
            </button>
          </div>

          {/* Mission Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400 block">Mission Blueprints</span>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_MISSIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setGoal(preset.goal);
                    handleStartMission(preset.goal);
                  }}
                  disabled={isRunning}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate pr-2">{preset.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Swarm Log Stream */}
          {swarmLogs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-400 block">Agent Activity</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-h-40 overflow-y-auto text-[11px]">
                {swarmLogs.map((logItem, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-mono text-cyan-400">
                      {logItem.agent} · {logItem.timestamp}
                    </div>
                    <p className="text-slate-300 leading-snug">{logItem.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scratchpadLogs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-400 block">Execution Log</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1 max-h-28 overflow-y-auto">
                {scratchpadLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Workspace */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto text-xs font-medium">
              {(
                [
                  { id: 'pipeline', label: 'Pipeline & HITL', icon: BrainCircuit },
                  { id: 'dossier', label: 'Executive Dossier', icon: FileText },
                  { id: 'context', label: 'Captured Context', icon: Globe },
                  { id: 'data', label: 'Extracted JSON', icon: Database },
                  { id: 'recipe', label: 'Playwright Script', icon: Code2 },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOutputTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeOutputTab === tab.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('aksh://canvas')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Canvas</span>
              </button>

              {agentResult && (
                <>
                  <button
                    onClick={handleSaveToNotes}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>{savedToNotes ? 'Saved' : 'Save Note'}</span>
                  </button>
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeOutputTab === 'pipeline' && (
              <div className="max-w-5xl mx-auto space-y-6">
                {runMetrics && (
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pb-3 border-b border-slate-800">
                    <span>Model: {runMetrics.modelUsed}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Elapsed: {runMetrics.totalDurationMs} ms</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Source: {runMetrics.sourceChars.toLocaleString()} chars</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Output: {runMetrics.outputWords} words</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pipeline Stages */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="text-xs font-medium text-slate-300">
                      Execution Stages (Click a stage to inspect artifacts)
                    </div>
                    <div className="space-y-2.5">
                      {stages.map((stage) => {
                        const isSelected = selectedStageId === stage.id;
                        return (
                          <button
                            key={stage.id}
                            onClick={() => setSelectedStageId(stage.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-slate-900 border-cyan-500/70 text-white'
                                : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs text-cyan-400 shrink-0">
                                0{stage.step}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate">
                                  {stage.title}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {stage.role} · {stage.detail}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                              {stage.durationMs !== undefined && (
                                <span className="text-slate-400 tabular-nums">{stage.durationMs} ms</span>
                              )}
                              {stage.status === 'running' && (
                                <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              )}
                              {stage.status === 'completed' && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage Inspector + HITL Constraints */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="pb-2.5 border-b border-slate-800">
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{activeStage.role} Artifact</span>
                        </div>
                      </div>

                      {activeStage.outputPreview ? (
                        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-auto max-h-44 whitespace-pre-wrap">
                          {activeStage.outputPreview}
                        </pre>
                      ) : (
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500">
                          Run the mission to inspect this stage's real output payload.
                        </div>
                      )}

                      {/* Human-In-The-Loop Constraints */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-800">
                        <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Prompt Constraints (HITL)</span>
                        </div>

                        {hitlConstraints.length > 0 && (
                          <div className="space-y-1 text-xs">
                            {hitlConstraints.map((c, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                              >
                                <span className="truncate">{c}</span>
                                <button
                                  onClick={() =>
                                    setHitlConstraints((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="text-slate-500 hover:text-rose-400 cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <input
                          type="text"
                          placeholder="e.g. Prioritize TCO pricing over latency..."
                          value={injectedDirective}
                          onChange={(e) => setInjectedDirective(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleInjectConstraint()}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={handleInjectConstraint}
                          disabled={!injectedDirective.trim()}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {injectedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{injectedSuccess ? 'Constraint Added' : 'Add Constraint'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeOutputTab === 'dossier' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {isRunning ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">
                      Synthesizing mission deliverable...
                    </p>
                  </div>
                ) : agentResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="truncate max-w-2xl">
                        Objective: <strong className="text-white">{goal}</strong>
                      </span>
                      <span className="text-emerald-400 font-mono">Completed</span>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                      <Markdown>{agentResult}</Markdown>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-2 text-slate-500 text-xs">
                    <BrainCircuit className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-slate-300 font-medium">Ready for mission deployment</p>
                    <p>Configure your target context and click Run Agent Mission.</p>
                  </div>
                )}
              </div>
            )}

            {activeOutputTab === 'context' && (
              <div className="max-w-4xl mx-auto space-y-4">
                {capturedContext ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-xs font-semibold text-white">{capturedContext.title}</div>
                      <div className="text-xs font-mono text-cyan-400 truncate">{capturedContext.url}</div>
                      <div className="text-xs text-slate-400 font-mono tabular-nums">
                        {capturedContext.textLength.toLocaleString()} characters · {capturedContext.headings.length} headings captured
                      </div>
                    </div>

                    {capturedContext.headings.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="text-xs font-medium text-slate-300">Extracted DOM Headings</div>
                        <ul className="space-y-1 text-xs text-slate-400 font-mono">
                          {capturedContext.headings.map((h, i) => (
                            <li key={i}>· {h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-xs font-medium text-slate-300">Captured Content Excerpt</div>
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {capturedContext.excerpt || '(No text content extracted from this tab.)'}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-500 text-xs">
                    Run a mission to inspect real captured DOM headings and page text.
                  </div>
                )}
              </div>
            )}

            {activeOutputTab === 'data' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Extracted Structured JSON
                  </span>
                  {extractedJsonData && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(extractedJsonData, null, 2));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy JSON</span>
                    </button>
                  )}
                </div>

                {extractedJsonData ? (
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs font-mono text-cyan-300">
                    {JSON.stringify(extractedJsonData, null, 2)}
                  </pre>
                ) : (
                  <div className="py-20 text-center text-slate-500 text-xs">
                    Run a mission in Multi-Agent Pipeline mode to extract structured JSON.
                  </div>
                )}
              </div>
            )}

            {activeOutputTab === 'recipe' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Playwright Automation Script
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedAutomationScript);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs font-mono text-emerald-400">
                  {generatedAutomationScript}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
