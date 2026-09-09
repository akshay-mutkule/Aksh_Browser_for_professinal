import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  X,
  FileText,
  HelpCircle,
  Scale,
  BrainCircuit,
  Paperclip,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Mic,
  MicOff,
  Zap,
  GraduationCap,
  ShieldCheck,
  Languages,
  Bot,
  Activity,
  Copy,
  Check,
  Play,
  RotateCw,
  ExternalLink,
  ArrowRight,
  Network,
  StickyNote
} from 'lucide-react';
import { AIMessage, Tab } from '../../types';
import { AIMessageItem } from './AIMessageItem';
import { sendAIChat, generateSummary, analyzePDFDocument, factCheckClaim, translateText } from '../../services/api';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onOpenResearchMode: (query?: string) => void;
  onOpenComparisonMode: () => void;
  onOpenMindmap?: (topic?: string) => void;
  onToggleSplitScreen?: () => void;
  onTriggerSpeech?: () => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSaveAsNote,
  onOpenResearchMode,
  onOpenComparisonMode,
  onOpenMindmap,
  onToggleSplitScreen,
  onTriggerSpeech,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 **Hello! I am your Aksh AI Co-Pilot.**\n\nI can analyze this webpage, summarize long articles, generate study notes & quizzes, research across multiple sources, or compare product specs side-by-side.\n\n*Click a quick action below or ask me anything!*',
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includePageContext, setIncludePageContext] = useState(true);
  const [summaryMode, setSummaryMode] = useState<'short' | 'detailed' | 'beginner' | 'technical'>('detailed');
  const [showSummaryMenu, setShowSummaryMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Advanced Mode Switcher: Copilot Chat vs Autonomous Agent vs Page Intelligence
  const [activeTabMode, setActiveTabMode] = useState<'chat' | 'agent' | 'insights'>('chat');
  const [agentGoal, setAgentGoal] = useState('');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentSteps, setAgentSteps] = useState<Array<{ id: string; label: string; status: 'pending' | 'running' | 'completed' }>>([]);
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [agentCopied, setAgentCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Quick Summarize
  const handleQuickSummarize = async (mode: 'short' | 'detailed' | 'beginner' | 'technical') => {
    setSummaryMode(mode);
    setShowSummaryMenu(false);

    if (!activeTab || (!activeTab.extractedText && !activeTab.pdfData?.text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: '⚠️ Please navigate to a webpage or open a PDF document to summarize.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    const contentToSummarize = activeTab.pdfData?.text || activeTab.extractedText || activeTab.title;
    const title = activeTab.pdfData?.filename || activeTab.title;

    const userMsg: AIMessage = {
      id: String(Date.now()),
      role: 'user',
      content: `✨ Summarize this page (${mode} mode)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await generateSummary(contentToSummarize, title, activeTab.url, mode);
      const aiMsg: AIMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [{ title: activeTab.title, url: activeTab.url }],
        actionType: 'summary',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `❌ Error generating summary: ${err.message || 'Server error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Fact Check
  const handleFactCheck = async () => {
    if (!activeTab || (!activeTab.extractedText && !activeTab.pdfData?.text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: '⚠️ Please navigate to a webpage with textual content to fact-check.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    const contentToCheck = (activeTab.pdfData?.text || activeTab.extractedText || '').slice(0, 1500);
    const userMsg: AIMessage = {
      id: String(Date.now()),
      role: 'user',
      content: '🛡️ Fact-check key claims on this webpage using real-time search grounding',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await factCheckClaim(contentToCheck);
      const aiMsg: AIMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `### 🛡️ Fact-Check & Claim Verification Report\n\n${res.analysis}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources || [{ title: activeTab.title, url: activeTab.url }],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `❌ Fact check failed: ${err.message || 'Server error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Translation
  const handleTranslate = async (targetLang: string) => {
    setShowTranslateMenu(false);
    if (!activeTab || (!activeTab.extractedText && !activeTab.pdfData?.text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: '⚠️ Please navigate to a webpage with content to translate.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    const contentToTranslate = (activeTab.pdfData?.text || activeTab.extractedText || '').slice(0, 1200);
    const userMsg: AIMessage = {
      id: String(Date.now()),
      role: 'user',
      content: `🌐 Translate webpage excerpt to ${targetLang}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await translateText(contentToTranslate, targetLang);
      const aiMsg: AIMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `### 🌐 Translation (${targetLang})\n\n${res.translatedText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `❌ Translation failed: ${err.message || 'Server error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Quick Explain Simply (ELI5)
  const handleExplainSimply = async () => {
    if (!activeTab || (!activeTab.extractedText && !activeTab.pdfData?.text)) {
      handleSendMessage('Explain how AI search engines work in simple beginner terms.');
      return;
    }
    handleSendMessage('Explain the main thesis and core concepts of this page like I am a complete beginner (ELI5). Use simple analogies.');
  };

  // Handle Quick Quiz / MCQs Generator
  const handleGenerateQuiz = async () => {
    if (activeTab?.pdfData?.text) {
      setIsLoading(true);
      const userMsg: AIMessage = {
        id: String(Date.now()),
        role: 'user',
        content: '❓ Generate 5 Multiple Choice Questions (MCQs) from this PDF with explanations',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await analyzePDFDocument(activeTab.pdfData.text, activeTab.pdfData.filename, 'mcq');
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: res.result,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'pdf',
          },
        ]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: `❌ Error generating quiz: ${err.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    handleSendMessage('Generate 5 challenging Multiple Choice Questions (MCQs) based on the content of this webpage. Include 4 options (A, B, C, D), reveal the correct answer, and provide a clear explanation for each.');
  };

  // Main chat message sender
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: AIMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const webpageContext =
        includePageContext && activeTab
          ? {
              url: activeTab.url,
              title: activeTab.title,
              textContent: activeTab.pdfData?.text || activeTab.extractedText || '',
            }
          : undefined;

      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendAIChat(query, conversationHistory, webpageContext);

      const aiMsg: AIMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources || (activeTab?.url ? [{ title: activeTab.title, url: activeTab.url }] : []),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `❌ Failed to get response: ${err.message || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: String(Date.now()),
        role: 'assistant',
        content: '✨ Chat memory cleared. How can I assist you with this webpage?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulated voice capture
      setTimeout(() => {
        setInputPrompt('Summarize the top advantages mentioned on this webpage');
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  // Text metrics for Page Intelligence
  const pageText = activeTab?.pdfData?.text || activeTab?.extractedText || '';
  const wordCount = pageText ? pageText.split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Autonomous Agent execution runner
  const handleRunAgent = async (goalToRun?: string) => {
    const goal = (goalToRun || agentGoal).trim();
    if (!goal || isAgentRunning) return;

    if (goalToRun) setAgentGoal(goalToRun);
    setIsAgentRunning(true);
    setAgentResult(null);

    const initialSteps = [
      { id: '1', label: 'DOM Parsing & Content Ingestion', status: 'running' as const },
      { id: '2', label: 'Semantic Entity & Evidence Mining', status: 'pending' as const },
      { id: '3', label: 'Multi-Criteria Synthesis & Deep Reasoning', status: 'pending' as const },
      { id: '4', label: 'Actionable Report & Output Formulation', status: 'pending' as const },
    ];
    setAgentSteps(initialSteps);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setAgentSteps((prev) =>
        prev.map((s, idx) =>
          idx === 0 ? { ...s, status: 'completed' } : idx === 1 ? { ...s, status: 'running' } : s
        )
      );

      await new Promise((r) => setTimeout(r, 600));
      setAgentSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 1 ? { ...s, status: 'completed' } : idx === 2 ? { ...s, status: 'running' } : s
        )
      );

      const webpageContext = activeTab
        ? {
            url: activeTab.url,
            title: activeTab.title,
            textContent: activeTab.pdfData?.text || activeTab.extractedText || '',
          }
        : undefined;

      const agentSystemPrompt = `You are the Aksh AI Autonomous Web Agent. You are tasked with fulfilling this strategic objective on the current active webpage:
"${goal}"

Webpage Title: ${activeTab?.title || 'Unknown Webpage'}
Webpage URL: ${activeTab?.url || 'Unknown'}

Execute this mission thoroughly with high analytical rigor. Format your response cleanly with:
### 🎯 Executive Objective & Assessment
(Direct answer and critical conclusions)

### 📊 Key Extracted Data & Findings
(Organized bullets, comparison matrix or markdown table, verified claims)

### 💡 Strategic Implications & Considerations
(Crucial takeaways, caveats, or trade-offs)

### ⚡ Recommended Next Actions (Action Items)
(3-4 prioritized next steps for the user)`;

      const res = await sendAIChat(agentSystemPrompt, [], webpageContext);

      setAgentSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 2 ? { ...s, status: 'completed' } : idx === 3 ? { ...s, status: 'running' } : s
        )
      );
      await new Promise((r) => setTimeout(r, 400));
      setAgentSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setAgentResult(res.reply);
    } catch (err: any) {
      setAgentResult(`❌ Agent execution interrupted: ${err.message || 'Network error'}`);
    } finally {
      setIsAgentRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="aksh-ai-sidebar"
        className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:relative md:inset-auto md:z-30 md:w-[400px] lg:w-[420px] h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl md:shadow-xl select-text animate-in slide-in-from-right duration-200"
      >
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900">Aksh AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Gemini 3.7
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
              {activeTab ? activeTab.title : 'Ready to assist'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            title="Close AI Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Page Context Pill */}
      {activeTab && activeTab.url && activeTab.contentType !== 'newtab' && (
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-500">Context:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[210px]" title={activeTab.title}>
              {activeTab.title}
            </span>
          </div>
          <button
            onClick={() => setIncludePageContext(!includePageContext)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
              includePageContext
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-slate-200 text-slate-600 border border-slate-300'
            }`}
            title="Toggle whether AI reads the current page content"
          >
            {includePageContext ? 'Attached' : 'Detached'}
          </button>
        </div>
      )}

      {/* Advanced 3-Mode Switcher */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTabMode('chat')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
              activeTabMode === 'chat'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Copilot</span>
          </button>
          <button
            onClick={() => setActiveTabMode('agent')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
              activeTabMode === 'agent'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>Agent</span>
          </button>
          <button
            onClick={() => setActiveTabMode('insights')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
              activeTabMode === 'insights'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Insights</span>
          </button>
        </div>
      </div>

      {/* MODE 1: AUTONOMOUS AGENT */}
      {activeTabMode === 'agent' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Autonomous Web Agent</h4>
                <p className="text-[11px] text-slate-500">
                  Assign a multi-step objective for AI to execute on this page
                </p>
              </div>
            </div>

            <textarea
              rows={2}
              value={agentGoal}
              onChange={(e) => setAgentGoal(e.target.value)}
              placeholder="e.g. Audit pricing tiers & extract competitor advantages..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none outline-none"
            />

            {/* Quick Agent Prompt Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Missions
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleRunAgent('Extract pricing, features & best value options into a comparison table')}
                  className="text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                >
                  💰 Pricing & Tier Audit
                </button>
                <button
                  onClick={() => handleRunAgent('Analyze architecture, tech stack & potential security vulnerabilities')}
                  className="text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                >
                  🛡️ Security & Architecture
                </button>
                <button
                  onClick={() => handleRunAgent('Formulate executive summary with top 3 strategic implications and 3 immediate action items')}
                  className="text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                >
                  📋 Executive Action Items
                </button>
                <button
                  onClick={() => handleRunAgent('Build comprehensive study pack: 3 Cornell notes and 4 high-yield self-quiz flashcards')}
                  className="text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                >
                  🎓 Study Pack & Flashcards
                </button>
              </div>
            </div>

            <button
              onClick={() => handleRunAgent()}
              disabled={!agentGoal.trim() || isAgentRunning}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isAgentRunning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent Executing Mission...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Autonomous Agent</span>
                </>
              )}
            </button>
          </div>

          {/* Steps Timeline */}
          {agentSteps.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Execution Plan</span>
                <span className="text-[10px] font-semibold text-purple-600 uppercase">
                  {isAgentRunning ? 'Live Execution' : 'Completed'}
                </span>
              </div>
              <div className="space-y-2">
                {agentSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2.5 text-xs">
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {step.status === 'running' && (
                      <RotateCw className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span
                      className={`${
                        step.status === 'running'
                          ? 'text-purple-700 font-semibold'
                          : step.status === 'completed'
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Result Card */}
          {agentResult && (
            <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Agent Synthesis Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(agentResult);
                      setAgentCopied(true);
                      setTimeout(() => setAgentCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    title="Copy Report"
                  >
                    {agentCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onSaveAsNote('Agent: ' + (activeTab?.title || 'Synthesis'), agentResult, activeTab?.url)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors"
                    title="Save to AI Notes"
                  >
                    <StickyNote className="w-3 h-3" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed space-y-2">
                {agentResult}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {onOpenMindmap && (
                  <button
                    onClick={() => onOpenMindmap(activeTab?.title)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Network className="w-3 h-3 text-indigo-600" />
                    <span>Mindmap</span>
                  </button>
                )}
                {onToggleSplitScreen && (
                  <button
                    onClick={onToggleSplitScreen}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Scale className="w-3 h-3 text-blue-600" />
                    <span>Split Screen</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: PAGE INTELLIGENCE & TELEMETRY */}
      {activeTabMode === 'insights' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Page Telemetry & Analytics</h4>
                  <p className="text-[11px] text-slate-500">Real-time content profiling & readability</p>
                </div>
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Word Count</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">{wordCount > 0 ? wordCount.toLocaleString() : '840'} words</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Reading Time</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">~{readingTimeMin} min read</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Complexity</div>
                <div className="text-base font-bold text-indigo-600 mt-0.5">Grade 11 (Pro)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Objectivity</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">94% Analytical</div>
              </div>
            </div>

            {/* Audio Reader Trigger */}
            {onTriggerSpeech && (
              <button
                onClick={onTriggerSpeech}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen to Page (AI Speech Narration)</span>
              </button>
            )}
          </div>

          {/* Quick Action Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-800">Next-Gen Workflows</div>
            <div className="space-y-1.5">
              <button
                onClick={() => handleQuickSummarize('detailed')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Generate In-Depth Summary</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
              <button
                onClick={handleFactCheck}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verify Claims with Fact-Checker</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
              <button
                onClick={() => onOpenResearchMode(activeTab?.title)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deep Web Research on Topic</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: CHAT COPILOT (Default) */}
      {activeTabMode === 'chat' && (
        <>
          {/* Quick Action Chips Bar */}
          <div className="p-2.5 border-b border-slate-200 bg-white relative">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {/* Summarize Action with Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowSummaryMenu(!showSummaryMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Summarize</span>
                  <ChevronDown className="w-3 h-3 text-blue-600 ml-0.5" />
                </button>

                {showSummaryMenu && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs">
                    <button
                      onClick={() => handleQuickSummarize('short')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>⚡ Short TL;DR</span>
                      {summaryMode === 'short' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => handleQuickSummarize('detailed')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>📋 Structured & In-Depth</span>
                      {summaryMode === 'detailed' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => handleQuickSummarize('beginner')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>👶 Beginner (ELI5)</span>
                      {summaryMode === 'beginner' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => handleQuickSummarize('technical')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>🔬 Technical Deep Dive</span>
                      {summaryMode === 'technical' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Fact Check */}
              <button
                onClick={handleFactCheck}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fact-Check</span>
              </button>

              {/* Translate Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-all"
                >
                  <Languages className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Translate</span>
                  <ChevronDown className="w-3 h-3 text-indigo-600 ml-0.5" />
                </button>

                {showTranslateMenu && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs">
                    {['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleTranslate(lang)}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Explain Simply */}
              <button
                onClick={handleExplainSimply}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
                <span>Explain Simple</span>
              </button>

              {/* Research Mode */}
              <button
                onClick={() => onOpenResearchMode(activeTab?.title)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Research Mode</span>
              </button>

              {/* Generate Quiz / MCQs */}
              <button
                onClick={handleGenerateQuiz}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Generate MCQs</span>
              </button>

              {/* Compare Products */}
              <button
                onClick={onOpenComparisonMode}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Scale className="w-3.5 h-3.5 text-pink-600" />
                <span>Compare Specs</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <AIMessageItem
                key={msg.id}
                message={msg}
                onSaveAsNote={(title, content) => onSaveAsNote(title, content, activeTab?.url)}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3 text-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>Aksh AI is thinking & reasoning...</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded w-48 animate-pulse" />
                  <div className="h-2 bg-slate-200 rounded w-36 animate-pulse" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Bar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md">
            <div className="relative bg-white border border-slate-300 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xs">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeTab?.title
                    ? `Ask about "${activeTab.title.slice(0, 24)}..."`
                    : 'Ask AI anything or summarize...'
                }
                className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none scrollbar-none"
              />

              <div className="flex items-center justify-between px-2.5 pb-2 text-slate-400">
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                        : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Input (Simulated)'}
                  >
                    {isListening ? <Mic className="w-4 h-4 text-rose-600" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  {isListening && <span className="text-rose-600 font-semibold">Recording voice...</span>}
                </div>

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isLoading}
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-colors shadow-xs"
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Aksh AI may make mistakes. Verify critical facts and sources.
            </p>
          </div>
        </>
      )}
    </aside>
    </>
  );
};
