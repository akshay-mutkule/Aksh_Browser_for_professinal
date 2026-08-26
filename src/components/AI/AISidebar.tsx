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
  GraduationCap
} from 'lucide-react';
import { AIMessage, Tab } from '../../types';
import { AIMessageItem } from './AIMessageItem';
import { sendAIChat, generateSummary, analyzePDFDocument } from '../../services/api';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onOpenResearchMode: (query?: string) => void;
  onOpenComparisonMode: () => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSaveAsNote,
  onOpenResearchMode,
  onOpenComparisonMode,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 **Hello! I am your Nexus AI Co-Pilot.**\n\nI can analyze this webpage, summarize long articles, generate study notes & quizzes, research across multiple sources, or compare product specs side-by-side.\n\n*Click a quick action below or ask me anything!*',
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includePageContext, setIncludePageContext] = useState(true);
  const [summaryMode, setSummaryMode] = useState<'short' | 'detailed' | 'beginner' | 'technical'>('detailed');
  const [showSummaryMenu, setShowSummaryMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  if (!isOpen) return null;

  return (
    <aside
      id="nexus-ai-sidebar"
      className="w-96 md:w-[420px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl relative select-text"
    >
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-slate-100">Nexus AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Gemini 3.7
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {activeTab ? activeTab.title : 'Ready to assist'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close AI Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Page Context Pill */}
      {activeTab && activeTab.url && activeTab.contentType !== 'newtab' && (
        <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-400">Context:</span>
            <span className="font-medium text-slate-200 truncate max-w-[210px]" title={activeTab.title}>
              {activeTab.title}
            </span>
          </div>
          <button
            onClick={() => setIncludePageContext(!includePageContext)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              includePageContext
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Toggle whether AI reads the current page content"
          >
            {includePageContext ? 'Attached' : 'Detached'}
          </button>
        </div>
      )}

      {/* Quick Action Chips Bar */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-900/90 relative">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* Summarize Action with Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSummaryMenu(!showSummaryMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Summarize</span>
              <ChevronDown className="w-3 h-3 text-blue-400 ml-0.5" />
            </button>

            {showSummaryMenu && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs">
                <button
                  onClick={() => handleQuickSummarize('short')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                >
                  <span>⚡ Short TL;DR</span>
                  {summaryMode === 'short' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
                <button
                  onClick={() => handleQuickSummarize('detailed')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                >
                  <span>📋 Structured & In-Depth</span>
                  {summaryMode === 'detailed' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
                <button
                  onClick={() => handleQuickSummarize('beginner')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                >
                  <span>👶 Beginner (ELI5)</span>
                  {summaryMode === 'beginner' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
                <button
                  onClick={() => handleQuickSummarize('technical')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                >
                  <span>🔬 Technical Deep Dive</span>
                  {summaryMode === 'technical' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Explain Simply */}
          <button
            onClick={handleExplainSimply}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            <span>Explain Simple</span>
          </button>

          {/* Research Mode */}
          <button
            onClick={() => onOpenResearchMode(activeTab?.title)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Research Mode</span>
          </button>

          {/* Generate Quiz / MCQs */}
          <button
            onClick={handleGenerateQuiz}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate MCQs</span>
          </button>

          {/* Compare Products */}
          <button
            onClick={onOpenComparisonMode}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-pink-400" />
            <span>Compare Specs</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Nexus AI is thinking & reasoning...</span>
              </div>
              <div className="h-2 bg-slate-700/60 rounded w-48 animate-pulse" />
              <div className="h-2 bg-slate-700/60 rounded w-36 animate-pulse" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="relative bg-slate-900 border border-slate-700/80 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
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
            className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none scrollbar-none"
          />

          <div className="flex items-center justify-between px-2.5 pb-2 text-slate-400">
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input (Simulated)'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              {isListening && <span className="text-rose-400 font-medium">Recording voice...</span>}
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isLoading}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-colors shadow-sm"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-1.5">
          Nexus AI may make mistakes. Verify critical facts and sources.
        </p>
      </div>
    </aside>
  );
};
