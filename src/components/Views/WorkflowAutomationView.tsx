import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Play,
  RotateCw,
  Plus,
  CheckCircle2,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  FileText,
  Sliders,
  X,
  FileJson,
  Info,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Tab, WorkflowRecipe, WorkflowStep } from '../../types';
import {
  scrapeWebpage,
  sendAIChat,
  extractStructuredData,
  inspectCode,
  generateMindmap,
} from '../../services/api';

interface WorkflowAutomationViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl: (url: string) => void;
}

const STORAGE_KEY = 'aksh_custom_workflows_v1';

const DEFAULT_RECIPES: WorkflowRecipe[] = [
  {
    id: 'recipe-market-radar',
    title: 'Tech & AI Signal Intelligence Radar',
    description:
      'Scrapes a live webpage, extracts structured entities and metrics, synthesizes an executive brief with Gemini, and exports to Notes.',
    category: 'intelligence',
    icon: 'Sparkles',
    tags: ['AI', 'Tech Radar', 'Autonomous'],
    scheduleInterval: 'daily',
    steps: [
      {
        id: 'step-1',
        type: 'scrape_url',
        title: 'Ingest Live Webpage',
        description: 'Fetch semantic content, title, and headings from target URL or active tab.',
        config: { url: 'https://news.ycombinator.com', fallbackToActiveTab: true },
      },
      {
        id: 'step-2',
        type: 'extract_entities',
        title: 'Extract Entities & Metrics',
        description: 'Isolate organizations, architectures, numbers, and technical topics.',
        config: { format: 'json' },
      },
      {
        id: 'step-3',
        type: 'ai_synthesize',
        title: 'Synthesize Intelligence Brief',
        description: 'Correlate scraped content and extracted entities into an executive brief.',
        config: { model: 'gemini-3.7-flash', tone: 'executive' },
      },
      {
        id: 'step-4',
        type: 'export_note',
        title: 'Save Deliverable to Notes',
        description: 'Persist final synthesized Markdown artifact into workspace notes.',
        config: { autoSave: false },
      },
    ],
  },
  {
    id: 'recipe-paper-deep-dive',
    title: 'Research Deconstructor & Concept Graph',
    description:
      'Extracts methodology from an active tab or URL, builds a topological concept graph, and compiles Cornell study notes.',
    category: 'research',
    icon: 'Layers',
    tags: ['ArXiv', 'Cornell Notes', 'Graph'],
    scheduleInterval: 'manual',
    steps: [
      {
        id: 'step-1',
        type: 'scrape_url',
        title: 'Ingest Paper / Article Context',
        description: 'Extract abstract, methodology, and headings from active tab or URL.',
        config: { url: 'activeTab' },
      },
      {
        id: 'step-2',
        type: 'mindmap_generate',
        title: 'Build Concept Knowledge Graph',
        description: 'Map directed relationships between core concepts and downstream applications.',
        config: { maxNodes: 12 },
      },
      {
        id: 'step-3',
        type: 'ai_synthesize',
        title: 'Generate Cornell Study Guide',
        description: 'Produce structured cues, core equations, and summary takeaways.',
        config: { format: 'cornell' },
      },
      {
        id: 'step-4',
        type: 'export_note',
        title: 'Stage Study Guide',
        description: 'Prepare study guide for saving into Notes.',
        config: { autoSave: false },
      },
    ],
  },
  {
    id: 'recipe-competitor-matrix',
    title: 'Product & Spec Comparison Extractor',
    description:
      'Ingests product specifications, extracts normalized comparison tables, and formulates a decision matrix.',
    category: 'productivity',
    icon: 'Activity',
    tags: ['Pricing', 'Comparison', 'Matrix'],
    scheduleInterval: 'manual',
    steps: [
      {
        id: 'step-1',
        type: 'scrape_url',
        title: 'Ingest Candidate Product Context',
        description: 'Capture active tab or URL product documentation and specs.',
        config: { url: 'activeTab' },
      },
      {
        id: 'step-2',
        type: 'compare_tables',
        title: 'Extract Structured Spec Table',
        description: 'Normalize tiers, limits, pricing, and key technical attributes.',
        config: { format: 'table' },
      },
      {
        id: 'step-3',
        type: 'ai_synthesize',
        title: 'Decision Tradeoff Analysis',
        description: 'Evaluate strengths, constraints, and best-fit workload verdict.',
        config: { model: 'gemini-3.7-flash' },
      },
    ],
  },
  {
    id: 'recipe-security-audit',
    title: 'Web Security & Trust Boundary Audit',
    description:
      'Probes target URL structure, inspects scripts and exposure risks, and generates a hardening report.',
    category: 'security',
    icon: 'Shield',
    tags: ['Security', 'CSP', 'Zero-Trust'],
    scheduleInterval: 'hourly',
    steps: [
      {
        id: 'step-1',
        type: 'scrape_url',
        title: 'Capture Target Page Payload',
        description: 'Inspect target page structure, links, and metadata.',
        config: { url: 'activeTab' },
      },
      {
        id: 'step-2',
        type: 'security_audit',
        title: 'Inspect Trust & Attack Surface',
        description: 'Audit transport, headers posture, and exposure indicators.',
        config: { level: 'strict' },
      },
      {
        id: 'step-3',
        type: 'ai_synthesize',
        title: 'Compile Hardening Checklist',
        description: 'Prioritize actionable security remediations.',
        config: { framework: 'OWASP/NIST' },
      },
    ],
  },
];

const STEP_TYPES: Array<{ value: WorkflowStep['type']; label: string }> = [
  { value: 'scrape_url', label: 'Scrape URL / Tab' },
  { value: 'extract_entities', label: 'Extract Entities' },
  { value: 'compare_tables', label: 'Extract Comparison Table' },
  { value: 'security_audit', label: 'Security Audit' },
  { value: 'mindmap_generate', label: 'Generate Knowledge Graph' },
  { value: 'ai_synthesize', label: 'AI Synthesis' },
  { value: 'export_note', label: 'Export / Stage Note' },
];

export const WorkflowAutomationView: React.FC<WorkflowAutomationViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [recipes, setRecipes] = useState<WorkflowRecipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_RECIPES;
  });

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || DEFAULT_RECIPES[0].id);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const [stepOutputs, setStepOutputs] = useState<Record<string, any>>({});
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [savedNoteFeedback, setSavedNoteFeedback] = useState<boolean>(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Modal state
  const [showNewRecipeModal, setShowNewRecipeModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'ai' | 'manual'>('ai');
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState<string>('');
  const [isGeneratingPipeline, setIsGeneratingPipeline] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCategory, setNewCategory] = useState<WorkflowRecipe['category']>('intelligence');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch {}
  }, [recipes]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setTerminalLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const updateSelectedRecipe = (updater: (recipe: WorkflowRecipe) => WorkflowRecipe) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === selectedRecipe.id ? updater(r) : r))
    );
  };

  const handleRunWorkflow = async () => {
    if (isRunning || !selectedRecipe) return;
    setIsRunning(true);
    setActiveStepIndex(0);
    setCompletedStepIds(new Set());
    setStepOutputs({});
    setTerminalLogs([]);
    setExecutionResult(null);

    addLog(`Starting pipeline: "${selectedRecipe.title}" (${selectedRecipe.steps.length} stages)`);

    // Shared chained execution state passed down between stages
    const ctx: {
      url: string;
      title: string;
      headings: string[];
      text: string;
      extractedEntities: string;
      tableData: string;
      securityReport: string;
      mindmapSummary: string;
    } = {
      url: activeTab?.url || 'https://example.com',
      title: activeTab?.title || selectedRecipe.title,
      headings: activeTab?.headings || [],
      text: activeTab?.pdfData?.text || activeTab?.extractedText || activeTab?.metaDescription || '',
      extractedEntities: '',
      tableData: '',
      securityReport: '',
      mindmapSummary: '',
    };

    let finalReport = '';

    try {
      for (let i = 0; i < selectedRecipe.steps.length; i++) {
        setActiveStepIndex(i);
        const step = selectedRecipe.steps[i];
        const stageStart = performance.now();
        addLog(`Stage ${i + 1}/${selectedRecipe.steps.length} [${step.type}]: ${step.title}`);

        let stageOutput: any = null;

        if (step.type === 'scrape_url') {
          const configuredUrl = String(step.config?.url || '').trim();
          const useActive = !configuredUrl || configuredUrl === 'activeTab' || !configuredUrl.startsWith('http');
          if (!useActive) {
            try {
              const scraped = await scrapeWebpage(configuredUrl);
              ctx.url = scraped.url || configuredUrl;
              ctx.title = scraped.title || ctx.title;
              ctx.headings = scraped.headings || [];
              ctx.text = scraped.textContent || scraped.metaDescription || '';
              addLog(`Scraped "${ctx.title}" (${ctx.text.length} chars, ${ctx.headings.length} headings)`);
              stageOutput = {
                source: 'live_scrape',
                url: ctx.url,
                title: ctx.title,
                headingsCount: ctx.headings.length,
                charactersCaptured: ctx.text.length,
                excerpt: ctx.text.slice(0, 320),
              };
            } catch (err: any) {
              addLog(`Live scrape fallback to active tab (${err?.message || 'unreachable'})`);
              stageOutput = {
                source: 'active_tab_fallback',
                url: ctx.url,
                title: ctx.title,
                charactersCaptured: ctx.text.length,
              };
            }
          } else {
            addLog(`Ingested active browser tab context: "${ctx.title}" (${ctx.text.length} chars)`);
            stageOutput = {
              source: 'active_tab',
              url: ctx.url,
              title: ctx.title,
              headingsCount: ctx.headings.length,
              charactersCaptured: ctx.text.length,
            };
          }
        } else if (step.type === 'extract_entities') {
          const contentSample = ctx.text.slice(0, 5000) || `Topic: ${selectedRecipe.title}. ${selectedRecipe.description}`;
          const res = await extractStructuredData(contentSample, ctx.title, ctx.url, step.config?.format || 'json');
          ctx.extractedEntities = res.data;
          addLog(`Extracted structured entities (${res.data.length} chars)`);
          stageOutput = {
            format: step.config?.format || 'json',
            preview: res.data.slice(0, 500),
          };
        } else if (step.type === 'compare_tables') {
          const contentSample = ctx.text.slice(0, 5000) || `${selectedRecipe.title}: ${selectedRecipe.description}`;
          const res = await extractStructuredData(contentSample, ctx.title, ctx.url, 'table');
          ctx.tableData = res.data;
          addLog(`Constructed comparative matrix (${res.data.length} chars)`);
          stageOutput = {
            format: 'table',
            preview: res.data.slice(0, 500),
          };
        } else if (step.type === 'security_audit') {
          const res = await inspectCode(ctx.url, ctx.title, ctx.headings, ctx.text.slice(0, 3500), 'security');
          ctx.securityReport = res.report;
          addLog(`Completed security boundary inspection (${res.report.length} chars)`);
          stageOutput = {
            targetUrl: ctx.url,
            reportPreview: res.report.slice(0, 500),
          };
        } else if (step.type === 'mindmap_generate') {
          const res = await generateMindmap(ctx.title, ctx.text.slice(0, 3500));
          const nodes = res.graph?.nodes || [];
          const edges = res.graph?.edges || [];
          ctx.mindmapSummary = nodes.map((n) => `- **${n.label}** (${n.category}): ${n.description}`).join('\n');
          addLog(`Generated knowledge graph (${nodes.length} nodes, ${edges.length} edges)`);
          stageOutput = {
            root: res.graph?.root,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            sampleNodes: nodes.slice(0, 5).map((n) => n.label),
          };
        } else if (step.type === 'ai_synthesize') {
          const chainedContext = [
            `Source Title: ${ctx.title}`,
            `Source URL: ${ctx.url}`,
            ctx.text ? `Primary Content Excerpt:\n${ctx.text.slice(0, 3500)}` : '',
            ctx.extractedEntities ? `Extracted Entities:\n${ctx.extractedEntities.slice(0, 1500)}` : '',
            ctx.tableData ? `Extracted Spec Table:\n${ctx.tableData.slice(0, 1500)}` : '',
            ctx.securityReport ? `Security Findings:\n${ctx.securityReport.slice(0, 1500)}` : '',
            ctx.mindmapSummary ? `Knowledge Graph Concepts:\n${ctx.mindmapSummary.slice(0, 1500)}` : '',
          ]
            .filter(Boolean)
            .join('\n\n---\n\n');

          const res = await sendAIChat(
            `Execute synthesis stage "${step.title}" for workflow "${selectedRecipe.title}".
Goal: ${selectedRecipe.description}
Step Instructions: ${step.description}

Using the chained stage data below, produce a structured Markdown deliverable with clear executive conclusions, supporting evidence, and prioritized next steps.

${chainedContext}`,
            [],
            undefined,
            'general',
            step.config?.model || 'gemini-3.7-flash'
          );
          finalReport = res.reply;
          setExecutionResult(finalReport);
          addLog(`Synthesis completed (${finalReport.length} chars)`);
          stageOutput = {
            model: step.config?.model || 'gemini-3.7-flash',
            outputLength: finalReport.length,
          };
        } else if (step.type === 'export_note') {
          const artifact =
            finalReport ||
            [ctx.securityReport, ctx.tableData, ctx.mindmapSummary, ctx.extractedEntities]
              .filter(Boolean)
              .join('\n\n');
          if (artifact && step.config?.autoSave) {
            onSaveAsNote(selectedRecipe.title, artifact);
            setSavedNoteFeedback(true);
            setTimeout(() => setSavedNoteFeedback(false), 2500);
            addLog(`Auto-saved artifact directly to Notes.`);
          } else {
            addLog(`Staged final artifact (${artifact.length} chars) for review/export.`);
          }
          stageOutput = {
            staged: true,
            autoSaved: Boolean(step.config?.autoSave),
          };
        }

        const durationMs = Math.round(performance.now() - stageStart);
        setStepOutputs((prev) => ({
          ...prev,
          [step.id]: {
            status: 'completed',
            durationMs,
            data: stageOutput,
          },
        }));
        setCompletedStepIds((prev) => new Set([...prev, step.id]));
      }

      if (!finalReport) {
        const fallbackArtifact = [
          ctx.tableData,
          ctx.securityReport,
          ctx.mindmapSummary,
          ctx.extractedEntities,
        ]
          .filter(Boolean)
          .join('\n\n---\n\n');
        if (fallbackArtifact) setExecutionResult(fallbackArtifact);
      }

      addLog(`Pipeline completed cleanly.`);
      setActiveStepIndex(-1);
    } catch (err: any) {
      addLog(`Pipeline error: ${err?.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!executionResult) return;
    onSaveAsNote(selectedRecipe.title, executionResult);
    setSavedNoteFeedback(true);
    setTimeout(() => setSavedNoteFeedback(false), 2200);
  };

  const handleDownloadMarkdown = () => {
    if (!executionResult) return;
    const blob = new Blob([executionResult], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedRecipe.id}-output.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateRecipe = () => {
    if (!newTitle.trim()) return;
    const newRecipe: WorkflowRecipe = {
      id: `recipe-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom multi-stage automation pipeline.',
      category: newCategory,
      icon: 'Sliders',
      tags: ['Custom'],
      scheduleInterval: 'manual',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          type: 'scrape_url',
          title: 'Ingest Target Context',
          description: 'Capture active webpage text, metadata, and headings.',
          config: { url: activeTab?.url || 'activeTab' },
        },
        {
          id: `step-${Date.now()}-2`,
          type: 'ai_synthesize',
          title: 'Synthesize Findings',
          description: 'Process captured content with custom instructions.',
          config: { model: 'gemini-3.7-flash' },
        },
        {
          id: `step-${Date.now()}-3`,
          type: 'export_note',
          title: 'Stage Output Note',
          description: 'Prepare output for personal knowledge base.',
          config: { autoSave: false },
        },
      ],
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    setSelectedRecipeId(newRecipe.id);
    setShowNewRecipeModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleGeneratePipelineWithAi = async () => {
    if (!naturalLanguagePrompt.trim() || isGeneratingPipeline) return;
    setIsGeneratingPipeline(true);
    try {
      const prompt = `You are a Workflow Automation Architect.
Convert the user's automation request into a multi-step browser pipeline.

User Prompt: "${naturalLanguagePrompt}"
Active Tab URL: "${activeTab?.url || 'https://example.com'}"

Return STRICTLY a JSON object matching this schema:
{
  "title": "<Concise 3-7 word pipeline title>",
  "description": "<1-2 sentence description>",
  "category": "intelligence" | "research" | "productivity" | "security",
  "scheduleInterval": "manual" | "hourly" | "daily",
  "steps": [
    {
      "id": "step-1",
      "type": "scrape_url" | "extract_entities" | "compare_tables" | "security_audit" | "mindmap_generate" | "ai_synthesize" | "export_note",
      "title": "<Short action title>",
      "description": "<Step objective>",
      "config": {}
    }
  ]
}`;

      const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
      const text = res.reply || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newRecipe: WorkflowRecipe = {
          id: `recipe-${Date.now()}`,
          title: parsed.title || 'AI Synthesized Pipeline',
          description: parsed.description || naturalLanguagePrompt,
          category: parsed.category || 'intelligence',
          icon: 'Sparkles',
          tags: ['AI'],
          scheduleInterval: parsed.scheduleInterval || 'manual',
          steps:
            Array.isArray(parsed.steps) && parsed.steps.length > 0
              ? parsed.steps.map((s: any, idx: number) => ({
                  id: s.id || `step-${Date.now()}-${idx}`,
                  type: s.type || 'ai_synthesize',
                  title: s.title || `Stage ${idx + 1}`,
                  description: s.description || '',
                  config: s.config || {},
                }))
              : [
                  {
                    id: `step-${Date.now()}-1`,
                    type: 'scrape_url',
                    title: 'Ingest Web Context',
                    description: 'Extract text and headings.',
                    config: { url: activeTab?.url || 'activeTab' },
                  },
                  {
                    id: `step-${Date.now()}-2`,
                    type: 'ai_synthesize',
                    title: 'Synthesize Output',
                    description: naturalLanguagePrompt,
                    config: { model: 'gemini-3.7-flash' },
                  },
                ],
        };

        setRecipes((prev) => [newRecipe, ...prev]);
        setSelectedRecipeId(newRecipe.id);
        setShowNewRecipeModal(false);
        setNaturalLanguagePrompt('');
        addLog(`Created pipeline: "${newRecipe.title}"`);
      }
    } catch (err: any) {
      addLog(`Pipeline generation failed: ${err?.message || err}`);
    } finally {
      setIsGeneratingPipeline(false);
    }
  };

  const handleAddStage = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'ai_synthesize',
      title: 'New Analysis Stage',
      description: 'Process outputs from previous stages.',
      config: { model: 'gemini-3.7-flash' },
    };
    updateSelectedRecipe((r) => ({ ...r, steps: [...r.steps, newStep] }));
    setSelectedStepId(newStep.id);
  };

  const handleMoveStage = (stepId: string, dir: -1 | 1) => {
    updateSelectedRecipe((r) => {
      const idx = r.steps.findIndex((s) => s.id === stepId);
      if (idx < 0) return r;
      const target = idx + dir;
      if (target < 0 || target >= r.steps.length) return r;
      const next = [...r.steps];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...r, steps: next };
    });
  };

  const handleDeleteStage = (stepId: string) => {
    if (selectedRecipe.steps.length <= 1) return;
    updateSelectedRecipe((r) => ({
      ...r,
      steps: r.steps.filter((s) => s.id !== stepId),
    }));
    if (selectedStepId === stepId) setSelectedStepId(null);
  };

  const handleExportManifest = () => {
    const jsonStr = JSON.stringify(selectedRecipe, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-workflow-${selectedRecipe.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedStep = selectedRecipe.steps.find((s) => s.id === selectedStepId) || null;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* Clean Header */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              Workflow Automation Studio
            </h1>
            <p className="text-xs text-slate-400">
              Chained live scraping · Entity &amp; table extraction · Multi-stage AI synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewRecipeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Pipeline</span>
          </button>

          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isRunning ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Executing...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Saved Pipelines */}
        <div className="w-full md:w-76 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto max-h-56 md:max-h-none">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Pipelines</span>
            <span className="font-mono tabular-nums text-slate-500">{recipes.length} saved</span>
          </div>

          <div className="space-y-2">
            {recipes.map((recipe) => {
              const isSelected = recipe.id === selectedRecipeId;
              return (
                <div
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipeId(recipe.id);
                    setSelectedStepId(null);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/70'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-white line-clamp-1 mb-1">
                    {recipe.title}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize mb-1.5">
                    {recipe.category} · {recipe.steps.length} stages · {recipe.scheduleInterval || 'manual'}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right Pipeline Editor & Execution View */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
          {/* Active Recipe Overview */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="text-xs text-slate-400 capitalize">
                {selectedRecipe.category} · {selectedRecipe.scheduleInterval || 'manual'} trigger · {selectedRecipe.steps.length} chained stages
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {selectedRecipe.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedRecipe.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportManifest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Manifest</span>
              </button>
              <button
                onClick={handleAddStage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 font-medium text-slate-300">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Pipeline Stages (Click a stage to configure or inspect live output)</span>
              </div>
              <span className="font-mono tabular-nums text-slate-500">
                {activeStepIndex >= 0 ? `Running stage ${activeStepIndex + 1}/${selectedRecipe.steps.length}` : 'Ready'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {selectedRecipe.steps.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isCompleted = completedStepIds.has(step.id);
                const isSelected = selectedStepId === step.id;
                const outputInfo = stepOutputs[step.id];

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(isSelected ? null : step.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/40'
                        : isActive
                        ? 'bg-slate-900 border-amber-500'
                        : isCompleted
                        ? 'bg-slate-900/70 border-emerald-500/50'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-slate-400">
                        0{idx + 1} · {step.type}
                      </span>
                      {isActive ? (
                        <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : null}
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1 line-clamp-1">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {step.description}
                    </p>
                    {outputInfo && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
                        Completed in {outputInfo.durationMs} ms
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Stage Configurator & Real Output Inspector */}
            {selectedStep && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>Stage Settings &amp; Live Payload</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMoveStage(selectedStep.id, -1)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Move earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveStage(selectedStep.id, 1)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Move later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {selectedRecipe.steps.length > 1 && (
                      <button
                        onClick={() => handleDeleteStage(selectedStep.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 cursor-pointer"
                        title="Remove Stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedStepId(null)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Stage Type</label>
                        <select
                          value={selectedStep.type}
                          onChange={(e) => {
                            const nextType = e.target.value as WorkflowStep['type'];
                            updateSelectedRecipe((r) => ({
                              ...r,
                              steps: r.steps.map((s) =>
                                s.id === selectedStep.id ? { ...s, type: nextType } : s
                              ),
                            }));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          {STEP_TYPES.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Stage Title</label>
                        <input
                          type="text"
                          value={selectedStep.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSelectedRecipe((r) => ({
                              ...r,
                              steps: r.steps.map((s) =>
                                s.id === selectedStep.id ? { ...s, title: val } : s
                              ),
                            }));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    {selectedStep.type === 'scrape_url' && (
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Target URL (or "activeTab")
                        </label>
                        <input
                          type="text"
                          value={selectedStep.config?.url || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSelectedRecipe((r) => ({
                              ...r,
                              steps: r.steps.map((s) =>
                                s.id === selectedStep.id
                                  ? { ...s, config: { ...s.config, url: val } }
                                  : s
                              ),
                            }));
                          }}
                          placeholder="https://... or activeTab"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Instructions / Description
                      </label>
                      <textarea
                        rows={2}
                        value={selectedStep.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateSelectedRecipe((r) => ({
                            ...r,
                            steps: r.steps.map((s) =>
                              s.id === selectedStep.id ? { ...s, description: val } : s
                            ),
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 block">
                      Captured Execution Payload
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono overflow-auto max-h-48 text-[11px] leading-relaxed">
                      {stepOutputs[selectedStep.id]
                        ? JSON.stringify(stepOutputs[selectedStep.id], null, 2)
                        : JSON.stringify(
                            {
                              status: 'pending_execution',
                              config: selectedStep.config || {},
                            },
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Execution Console */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-200">Execution Log</span>
              </div>
              <button
                onClick={() => setTerminalLogs([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="h-36 overflow-y-auto space-y-1 text-slate-300">
              {terminalLogs.length === 0 ? (
                <div className="text-slate-600 py-8 text-center">
                  Idle. Click Run Pipeline to execute chained stages.
                </div>
              ) : (
                terminalLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Final Synthesized Deliverable */}
          {executionResult && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">Pipeline Deliverable</h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    {savedNoteFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved to Notes</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                  <button
                    onClick={() => onNavigateUrl('aksh://notes')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                <Markdown>{executionResult}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Pipeline Modal */}
      {showNewRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Create Workflow Pipeline</h3>
              </div>
              <button
                onClick={() => setShowNewRecipeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setModalMode('ai')}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalMode === 'ai' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Pipeline Architect</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode('manual')}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalMode === 'manual' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Manual Setup</span>
              </button>
            </div>

            {modalMode === 'ai' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Describe your workflow pipeline:
                  </label>
                  <textarea
                    rows={3}
                    value={naturalLanguagePrompt}
                    onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                    placeholder="e.g., Scrape Hacker News, extract AI entities, synthesize trends, and stage notes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Quick Blueprints:</span>
                  {[
                    'Analyze active tab security exposure, generate risk report, and prepare hardening steps',
                    'Extract structured specifications from active tab and map core concepts into a knowledge graph',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNaturalLanguagePrompt(preset)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{preset}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewRecipeModal(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePipelineWithAi}
                    disabled={!naturalLanguagePrompt.trim() || isGeneratingPipeline}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-semibold text-xs cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPipeline ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingPipeline ? 'Generating...' : 'Generate Pipeline'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Weekly AI Benchmark Watcher"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe pipeline goal..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    <option value="intelligence">Intelligence</option>
                    <option value="research">Research</option>
                    <option value="productivity">Productivity</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewRecipeModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateRecipe}
                    disabled={!newTitle.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-semibold text-xs cursor-pointer"
                  >
                    Create Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
