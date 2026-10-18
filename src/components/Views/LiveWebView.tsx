import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Share2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Code,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  Type,
  Maximize2,
  Download,
  Languages,
  Volume2,
  StickyNote,
  ListFilter,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  Globe,
  Loader2,
  X,
  Scissors,
  Zap,
  GraduationCap,
  ShieldAlert,
  Scan,
  Cpu,
  GitCompare,
  Play,
  Table,
  BrainCircuit,
  Bot,
  Send,
  CornerDownLeft,
  Minimize2,
  ChevronUp,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tab, PageAnnotation } from '../../types';
import { SAMPLE_WEBSITES } from '../../data/mockWebsites';
import { translateText, factCheckClaim, sendAIChat } from '../../services/api';
import { PageStickyNotesLayer } from '../Browser/PageStickyNotesLayer';
import { PageQuizModal } from '../Modals/PageQuizModal';
import { PageCredibilityModal } from '../Modals/PageCredibilityModal';
import { GoogleSearchPageView } from './GoogleSearchPageView';

interface LiveWebViewProps {
  tab: Tab;
  onNavigate: (url: string) => void;
  onTriggerAiSummary: () => void;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string, tags?: string[]) => void;
  onTriggerSpeech?: () => void;
  onToggleReaderMode?: () => void;
  onOpenWebClipper?: () => void;
  onOpenFindInPage?: () => void;
  onOpenDiff?: () => void;
  onOpenDataExtractor?: () => void;
  onOpenSandbox?: (initialCode?: string) => void;
  findQuery?: string;
  matchIndex?: number;
  caseSensitive?: boolean;
  onMatchesFound?: (count: number) => void;
}

const SUPPORTED_LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese (Simplified)',
  'Hindi',
  'Arabic',
  'Italian',
  'Portuguese',
  'Russian',
];

export const LiveWebView: React.FC<LiveWebViewProps> = ({
  tab,
  onNavigate,
  onTriggerAiSummary,
  onSaveAsNote,
  onTriggerSpeech,
  onToggleReaderMode,
  onOpenWebClipper,
  onOpenFindInPage,
  onOpenDiff,
  onOpenDataExtractor,
  onOpenSandbox,
  findQuery = '',
  matchIndex = 0,
  caseSensitive = false,
  onMatchesFound,
}) => {
  const [copied, setCopied] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [showExtractedInspector, setShowExtractedInspector] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

  // Fact-check state
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState<string | null>(null);
  const [showFactCheckModal, setShowFactCheckModal] = useState(false);

  // Active Recall Quiz & Credibility Radar modals
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCredibilityModal, setShowCredibilityModal] = useState(false);
  const [isBionic, setIsBionic] = useState(tab.isBionicReading || false);

  // AI X-Ray Intelligence & Entity Lens
  const [showXRay, setShowXRay] = useState(false);
  const [xRayFilter, setXRayFilter] = useState<'all' | 'entities' | 'tech' | 'metrics'>('all');

  // AI Neural Audience Lens / Perspective Shifter
  type NeuralLensMode = 'original' | 'eli5' | 'executive' | 'architect' | 'critique';
  const [lensMode, setLensMode] = useState<NeuralLensMode>('original');
  const [lensContent, setLensContent] = useState<string | null>(null);
  const [isLensLoading, setIsLensLoading] = useState(false);
  const [cachedLenses, setCachedLenses] = useState<Record<string, string>>({});

  // Floating In-Page Copilot Capsule State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; id: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '👋 Hi! I am your live in-page copilot. Ask me anything about this page or choose one of the quick prompts below.',
    },
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const copilotEndRef = useRef<HTMLDivElement>(null);

  // Helper to transform text into bionic reading format (bold first half of each word)
  const toBionicMarkdown = (markdown: string): string => {
    return markdown
      .split('\n')
      .map((line) => {
        if (line.startsWith('```') || line.startsWith('#') || line.startsWith('!') || line.startsWith('<') || line.includes('|')) {
          return line;
        }
        return line.replace(/\b([a-zA-Z]{2,})\b/g, (match) => {
          const mid = Math.ceil(match.length / 2);
          return `**${match.slice(0, mid)}**${match.slice(mid)}`;
        });
      })
      .join('\n');
  };

  // Reader Mode styling state
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light' | 'solarized'>('light');
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [readerFontFamily, setReaderFontFamily] = useState<'sans' | 'serif'>('serif');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFloatingHudCollapsed, setIsFloatingHudCollapsed] = useState(false);

  // In-Page Sticky Notes & Annotations
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [annotations, setAnnotations] = useState<PageAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem(`aksh_page_annotations_${encodeURIComponent(tab.url)}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reload annotations when tab URL changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`aksh_page_annotations_${encodeURIComponent(tab.url)}`);
      setAnnotations(saved ? JSON.parse(saved) : []);
    } catch {
      setAnnotations([]);
    }
  }, [tab.url]);

  const handleAddAnnotation = (text: string, color: PageAnnotation['color']) => {
    const newAnn: PageAnnotation = {
      id: 'ann-' + Date.now(),
      url: tab.url,
      text,
      color,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newAnn, ...annotations];
    setAnnotations(updated);
    try {
      localStorage.setItem(`aksh_page_annotations_${encodeURIComponent(tab.url)}`, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter((a) => a.id !== id);
    setAnnotations(updated);
    try {
      localStorage.setItem(`aksh_page_annotations_${encodeURIComponent(tab.url)}`, JSON.stringify(updated));
    } catch {}
  };

  const handleExportAnnotationsToNotes = (anns: PageAnnotation[]) => {
    if (anns.length === 0) return;
    const title = `Sticky Notes: ${tab.title}`;
    let md = `# Page Sticky Notes: ${tab.title}\n\n`;
    md += `**Source URL:** ${tab.url}\n`;
    md += `**Total Notes:** ${anns.length}\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n\n---\n\n`;
    anns.forEach((a, i) => {
      md += `### Note #${i + 1} (${a.color.toUpperCase()}) — ${a.createdAt}\n`;
      md += `${a.text}\n\n`;
    });
    onSaveAsNote(title, md);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const mockSite = SAMPLE_WEBSITES[tab.url];

  // Raw content determination (with active lens support)
  const currentBaseContent = lensContent || translatedText || tab.extractedText || '';
  const activeContent = translatedText || tab.extractedText || '';
  const displayContent = useMemo(() => {
    return isBionic ? toBionicMarkdown(currentBaseContent) : currentBaseContent;
  }, [currentBaseContent, isBionic]);

  // Calculate Reading Stats (words & estimated minutes)
  const readingStats = useMemo(() => {
    const text = currentBaseContent || (mockSite ? mockSite.extractedText : '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [currentBaseContent, mockSite]);

  const handleSelectLens = async (mode: NeuralLensMode) => {
    if (mode === 'original') {
      setLensMode('original');
      setLensContent(null);
      return;
    }
    setLensMode(mode);
    const cacheKey = `${tab.url}_${mode}`;
    if (cachedLenses[cacheKey]) {
      setLensContent(cachedLenses[cacheKey]);
      return;
    }

    setIsLensLoading(true);
    try {
      const pageText = tab.extractedText || '';
      let prompt = '';
      if (mode === 'eli5') {
        prompt = `Rewrite this webpage content as "Explain Like I'm 5": Use vivid everyday metaphors, conversational language, zero technical jargon, and keep it friendly yet accurate:\n\n${pageText.slice(0, 4500)}`;
      } else if (mode === 'executive') {
        prompt = `Rewrite this webpage content as an Executive Briefing:
- Executive Summary (1 paragraph)
- Top 3 Strategic Implications
- Key Metrics & Quantitative Data Points
- Potential Risks & Tradeoffs
- 4 Prioritized Recommended Action Steps:\n\n${pageText.slice(0, 4500)}`;
      } else if (mode === 'architect') {
        prompt = `Rewrite this webpage content as a Senior Systems Architect Technical Deep-Dive:
- Architectural Breakdown & Component Interactions
- Performance, Scalability & Big-O Tradeoffs
- Security & Failure Modes
- Technical Implementation Considerations:\n\n${pageText.slice(0, 4500)}`;
      } else if (mode === 'critique') {
        prompt = `Provide an adversarial critical audit of this webpage:
- Unverified Claims or Potential Biases
- Counter-Arguments & Alternate Perspectives
- What the author omitted or glossed over
- Epistemic Rigor Score (1-100):\n\n${pageText.slice(0, 4500)}`;
      }

      const res = await sendAIChat(prompt, [], {
        url: tab.url,
        title: tab.title,
        textContent: pageText.slice(0, 4000),
      });

      setLensContent(res.reply);
      setCachedLenses((prev) => ({ ...prev, [cacheKey]: res.reply }));
    } catch (err) {
      console.error(err);
      setLensContent('⚠️ Failed to adapt page content with AI. Please try again.');
    } finally {
      setIsLensLoading(false);
    }
  };

  const handleSendCopilot = async (textToSend?: string) => {
    const q = (textToSend || copilotInput).trim();
    if (!q || isCopilotLoading) return;

    const userMsg = { id: `user-${Date.now()}`, role: 'user' as const, text: q };
    setCopilotMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setCopilotInput('');
    setIsCopilotLoading(true);

    try {
      const history = copilotMessages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await sendAIChat(q, history, {
        url: tab.url,
        title: tab.title,
        textContent: (tab.extractedText || '').slice(0, 4000),
      });

      setCopilotMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'assistant', text: res.reply },
      ]);
    } catch (err) {
      setCopilotMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Error communicating with Gemini Copilot.',
        },
      ]);
    } finally {
      setIsCopilotLoading(false);
      setTimeout(() => {
        copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSaveToVault = () => {
    try {
      const savedRaw = localStorage.getItem('aksh_neural_vault_memories');
      const memories = savedRaw ? JSON.parse(savedRaw) : [];
      let domain = 'web';
      try {
        domain = new URL(tab.url).hostname;
      } catch {}

      const newMemory = {
        id: 'mem-' + Date.now(),
        title: tab.title || 'Indexed Document',
        summary: activeContent ? activeContent.slice(0, 240) + '...' : `Indexed reference from ${tab.url}`,
        sourceUrl: tab.url,
        sourceTitle: tab.title,
        category: 'research' as const,
        tags: ['WebSnap', 'NeuralVault', domain],
        keyQuotes: activeContent ? [activeContent.slice(0, 160)] : [],
        entities: [domain, 'Live Document'],
        confidenceScore: 0.96,
        retentionStrength: 92,
        createdAt: Date.now(),
        lastRecalledAt: Date.now(),
        connections: [],
      };
      localStorage.setItem('aksh_neural_vault_memories', JSON.stringify([newMemory, ...memories]));
      setVaultSaved(true);
      setTimeout(() => setVaultSaved(false), 2200);
    } catch (err) {
      console.error(err);
    }
  };

  // Extract structured headings for Table of Contents
  const headings = useMemo(() => {
    if (tab.headings && tab.headings.length > 0) {
      return tab.headings;
    }
    if (mockSite?.content?.sections) {
      return mockSite.content.sections
        .map((s) => s.heading)
        .filter((h): h is string => Boolean(h));
    }
    // Parse markdown headings
    const matches: string[] = [];
    const lines = activeContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^#{1,3}\s+(.+)$/);
      if (match && match[1].trim().length < 90) {
        matches.push(match[1].trim());
      }
    }
    return matches.slice(0, 15);
  }, [tab.headings, mockSite, activeContent]);

  // AI X-Ray Entity & Signal Analysis
  const xRayAnalysis = useMemo(() => {
    const text = activeContent || '';
    const orgCatalog = [
      'Google', 'OpenAI', 'Anthropic', 'Apple', 'Microsoft', 'Nvidia', 'Meta',
      'Amazon', 'Tesla', 'GitHub', 'MIT', 'Stanford', 'Berkeley', 'DeepMind',
      'Hugging Face', 'Linux', 'Apache', 'Mozilla', 'Cloudflare', 'Stripe'
    ];
    const techCatalog = [
      'LLM', 'LLMs', 'Transformer', 'GPT', 'Claude', 'Gemini', 'PyTorch',
      'TensorFlow', 'React', 'TypeScript', 'Rust', 'Python', 'WebAssembly',
      'WebGPU', 'Docker', 'Kubernetes', 'HTTP/3', 'Zero-Trust', 'CSP',
      'Next.js', 'Vite', 'PostgreSQL', 'Redis', 'GraphQL', 'Tailwind CSS'
    ];

    const detectedOrgs = orgCatalog.filter((org) => new RegExp(`\\b${org}\\b`, 'i').test(text));
    const detectedTech = techCatalog.filter((tech) => new RegExp(`\\b${tech}\\b`, 'i').test(text));
    
    const metricsMatches = text.match(/\b\d+(\.\d+)?%\b|\$\d+[\d,]*(\.\d+)?|\b\d+k?\s+(?:tokens|params|parameters|requests|stars|users|ms|s)\b/gi) || [];
    const uniqueMetrics = Array.from(new Set(metricsMatches)).slice(0, 8);

    const questions = headings.slice(0, 3).map((h) => ({
      question: `What are the core conclusions regarding "${h}"?`,
      cue: `Extracted from section: "${h}".`,
    }));

    return {
      orgs: detectedOrgs,
      tech: detectedTech,
      metrics: uniqueMetrics,
      questions,
      signalScore: Math.min(99, Math.max(76, Math.round(82 + (detectedTech.length * 1.5) + (detectedOrgs.length * 1.2)))),
    };
  }, [activeContent, headings]);

  // Track scroll progress for reader mode
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const total = target.scrollHeight - target.clientHeight;
    if (total > 0) {
      setScrollProgress(Math.min(100, Math.round((target.scrollTop / total) * 100)));
    }
  };

  // Find in page match counting
  useEffect(() => {
    if (!findQuery.trim()) {
      if (onMatchesFound) onMatchesFound(0);
      return;
    }
    const textToSearch = activeContent || (mockSite ? mockSite.extractedText : '');
    const flags = caseSensitive ? 'g' : 'gi';
    try {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = textToSearch.match(new RegExp(escaped, flags));
      const count = matches ? matches.length : 0;
      if (onMatchesFound) onMatchesFound(count);
    } catch {
      if (onMatchesFound) onMatchesFound(0);
    }
  }, [findQuery, caseSensitive, activeContent, mockSite, onMatchesFound]);

  // Handle Copy
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle In-Page Translation
  const handleTranslate = async (lang: string) => {
    setShowTranslateMenu(false);
    setIsTranslating(true);
    try {
      const textToTranslate = (tab.extractedText || (mockSite ? mockSite.extractedText : '')).slice(0, 12000);
      const res = await translateText(textToTranslate, lang);
      setTranslatedText(res.translatedText);
      setCurrentLanguage(lang);
    } catch (err: any) {
      alert(`Translation error: ${err.message || 'Server error'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle Fact Check
  const handleFactCheck = async () => {
    setIsFactChecking(true);
    setShowFactCheckModal(true);
    try {
      const sampleText = (tab.extractedText || (mockSite ? mockSite.extractedText : '')).slice(0, 3000);
      const res = await factCheckClaim(sampleText);
      setFactCheckResult(res.analysis);
    } catch (err: any) {
      setFactCheckResult(`Failed to fact-check page: ${err.message || 'Server error'}`);
    } finally {
      setIsFactChecking(false);
    }
  };

  // Export as Markdown File
  const handleDownloadMarkdown = () => {
    setShowExportMenu(false);
    const content = `# ${tab.title}\n\n**Source URL:** ${tab.url}\n**Exported At:** ${new Date().toLocaleString()}\n\n---\n\n${activeContent}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(tab.title || 'webpage').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as HTML File
  const handleDownloadHtml = () => {
    setShowExportMenu(false);
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${tab.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    a { color: #2563eb; }
    pre { background: #f1f5f9; padding: 12px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${tab.title}</h1>
  <p><small>Source: <a href="${tab.url}">${tab.url}</a> | Exported: ${new Date().toLocaleString()}</small></p>
  <hr/>
  <div>${activeContent.replace(/\n\n/g, '<br/><br/>')}</div>
</body>
</html>`;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(tab.title || 'webpage').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Smooth scroll to heading section
  const scrollToHeading = (headingText: string) => {
    setShowOutline(false);
    const elements = containerRef.current?.querySelectorAll('h1, h2, h3, h4');
    if (elements) {
      for (const el of Array.from(elements)) {
        if (el.textContent?.toLowerCase().includes(headingText.toLowerCase())) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
  };

  // If Reader Mode is active on this tab
  if (tab.isReaderMode) {
    const themeStyles = {
      dark: 'bg-slate-950 text-slate-200',
      sepia: 'bg-[#f4ecd8] text-[#433422]',
      light: 'bg-white text-slate-900',
      solarized: 'bg-[#fdf6e3] text-[#586e75]',
    }[readerTheme];

    const fontSizeStyles = {
      normal: 'text-base leading-relaxed',
      large: 'text-lg leading-loose',
      huge: 'text-xl leading-loose',
    }[readerFontSize];

    const fontStyle = readerFontFamily === 'serif' ? 'font-serif' : 'font-sans';

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`h-full overflow-y-auto ${themeStyles} select-text transition-colors duration-200 relative`}
      >
        {/* Reading Progress Indicator */}
        <div
          className="fixed top-0 left-0 h-1 bg-blue-600 z-50 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Reader Mode Sticky Control Toolbar */}
        <div className="sticky top-3 max-w-2xl mx-auto z-30 px-4">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 flex items-center justify-between shadow-lg text-xs text-slate-800 ring-1 ring-black/5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900">Reader Mode</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {readingStats.minutes} min read • {readingStats.words} words
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Font Family Toggle */}
              <button
                onClick={() => setReaderFontFamily(readerFontFamily === 'serif' ? 'sans' : 'serif')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer text-xs"
                title="Toggle Serif / Sans Font"
              >
                {readerFontFamily === 'serif' ? 'Serif' : 'Sans'}
              </button>

              {/* Font Size Adjuster */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setReaderFontSize('normal')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    readerFontSize === 'normal' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize('large')}
                  className={`px-2 py-0.5 rounded text-sm cursor-pointer ${
                    readerFontSize === 'large' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A+
                </button>
                <button
                  onClick={() => setReaderFontSize('huge')}
                  className={`px-2 py-0.5 rounded text-base cursor-pointer ${
                    readerFontSize === 'huge' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A++
                </button>
              </div>

              {/* Theme Tone Selectors */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`w-4 h-4 rounded-full bg-white border cursor-pointer ${
                    readerTheme === 'light' ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-slate-300'
                  }`}
                  title="Light Theme"
                />
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`w-4 h-4 rounded-full bg-[#f4ecd8] border border-amber-300 cursor-pointer ${
                    readerTheme === 'sepia' ? 'ring-2 ring-amber-600 ring-offset-1' : ''
                  }`}
                  title="Sepia Paper Theme"
                />
                <button
                  onClick={() => setReaderTheme('solarized')}
                  className={`w-4 h-4 rounded-full bg-[#fdf6e3] border border-stone-300 cursor-pointer ${
                    readerTheme === 'solarized' ? 'ring-2 ring-emerald-600 ring-offset-1' : ''
                  }`}
                  title="Solarized Warm Theme"
                />
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`w-4 h-4 rounded-full bg-slate-900 border border-slate-700 cursor-pointer ${
                    readerTheme === 'dark' ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                  title="Twilight Dark Theme"
                />
              </div>

              {/* Bionic Reading Toggle */}
              <button
                onClick={() => setIsBionic(!isBionic)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isBionic
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                title="Toggle Bionic Reading (Accelerated eye fixation)"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Bionic</span>
              </button>

              {/* Listen to Audio */}
              {onTriggerSpeech && (
                <button
                  onClick={onTriggerSpeech}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Listen via Neural Voice"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}

              {/* Quick AI Summarize */}
              <button
                onClick={onTriggerAiSummary}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize</span>
              </button>

              {/* Active Recall Quiz */}
              <button
                onClick={() => setShowQuizModal(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
                title="Active Recall Quiz from this Article"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Quiz Me</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reader Article Body */}
        <article className={`max-w-2xl mx-auto px-6 py-10 ${fontStyle} ${fontSizeStyles}`}>
          <div className="space-y-4 pb-6 border-b border-slate-200/40">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tab.title}</h1>
            <div className="flex items-center gap-3 text-xs opacity-75 font-sans">
              <span>{new URL(tab.url).hostname}</span>
              <span>•</span>
              <span>{readingStats.minutes} min read</span>
              <span>•</span>
              <span>Distraction-free Reader</span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {activeContent ? (
              <div className="prose max-w-none">
                <ReactMarkdown
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a
                        href={href}
                        onClick={(e) => {
                          if (href && !href.startsWith('#')) {
                            e.preventDefault();
                            onNavigate(href);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                        title={`Navigate to ${href}`}
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 italic">No textual content extracted to render in reader mode.</p>
            )}
          </div>
        </article>
      </div>
    );
  }

  // Standard Web Page Viewport
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative select-text">
      {/* Top Interactive Page Toolbar */}
      <div className="h-10 px-4 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shadow-2xs z-20 shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-[360px] text-slate-700 font-mono text-[11px]" title={tab.url}>
            {tab.url}
          </span>
          <span className="text-slate-300 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{readingStats.minutes} min read</span>
            <span>({readingStats.words} words)</span>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Table of Contents Outline Button */}
          {headings.length > 0 && (
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                showOutline
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Page Table of Contents Outline"
            >
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Outline</span>
              <span className="px-1 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {headings.length}
              </span>
            </button>
          )}

          {/* Translate Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTranslateMenu(!showTranslateMenu)}
              disabled={isTranslating}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer text-xs disabled:opacity-50"
              title="Translate Webpage"
            >
              {isTranslating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="hidden sm:inline">Translate</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTranslateMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleTranslate(lang)}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{lang}</span>
                    {currentLanguage === lang && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fact-Check Button */}
          <button
            onClick={handleFactCheck}
            disabled={isFactChecking}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer text-xs disabled:opacity-50"
            title="Fact-check key claims on this page"
          >
            {isFactChecking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="hidden sm:inline">Fact-Check</span>
          </button>

          {/* AI Active Recall Quiz Button */}
          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors cursor-pointer text-xs shadow-2xs"
            title="Generate conceptual active recall quiz from this page"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">AI Quiz</span>
          </button>

          {/* Source Credibility & Bias Radar Button */}
          <button
            onClick={() => setShowCredibilityModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 font-semibold transition-colors cursor-pointer text-xs shadow-2xs"
            title="Source Credibility & Epistemic Bias Radar"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Credibility</span>
          </button>

          {/* AI Semantic Diff / Tab Delta Inspector */}
          {onOpenDiff && (
            <button
              onClick={onOpenDiff}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyan-200 bg-cyan-50/80 hover:bg-cyan-100 text-cyan-800 font-semibold transition-colors cursor-pointer text-xs shadow-2xs"
              title="Compare with another tab (Semantic Diff)"
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden md:inline">Diff</span>
            </button>
          )}

          {/* AI X-Ray Lens & Entity Radar Button */}
          <button
            onClick={() => setShowXRay(!showXRay)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              showXRay
                ? 'bg-purple-600 border-purple-700 text-white shadow-xs'
                : 'border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-800'
            }`}
            title="AI X-Ray Intelligence & Entity Lens"
          >
            <Scan className={`w-3.5 h-3.5 ${showXRay ? 'text-white' : 'text-purple-600'}`} />
            <span className="hidden sm:inline">AI X-Ray</span>
          </button>

          {/* Bionic Reading Toggle */}
          <button
            onClick={() => setIsBionic(!isBionic)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isBionic
                ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Toggle Bionic Reading (Accelerates eye fixation speed)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bionic</span>
          </button>

          {/* Audio Listen */}
          {onTriggerSpeech && (
            <button
              onClick={onTriggerSpeech}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Listen to this page (Audio Narration)"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            </button>
          )}

          {/* Save to Notes */}
          <button
            onClick={() =>
              onSaveAsNote(
                tab.title,
                `### ${tab.title}\n\n**Source:** [${tab.url}](${tab.url})\n\n${(activeContent || '').slice(0, 1500)}...`
              )
            }
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Save Page to Cornell AI Notes"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Download or Export Page"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
                <button
                  onClick={handleDownloadMarkdown}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Markdown (.md)</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download HTML (.html)</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    handleCopyText(activeContent);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Clean Text</span>
                </button>
              </div>
            )}
          </div>

          {/* Inspect AI Context */}
          <button
            onClick={() => setShowExtractedInspector(!showExtractedInspector)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Inspect AI context tokens"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
          </button>

          {/* AI Summarize Primary Action */}
          <button
            onClick={onTriggerAiSummary}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer shadow-xs text-xs"
            title="Summarize with Aksh AI Co-Pilot"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summarize</span>
          </button>
        </div>
      </div>

      {/* Translation Alert Banner */}
      {translatedText && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center justify-between text-xs text-indigo-900 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>
              Page translated to <strong>{currentLanguage}</strong> using Gemini AI.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTranslatedText(null);
                setCurrentLanguage(null);
              }}
              className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
            >
              Show Original English
            </button>
            <button
              onClick={() => handleCopyText(translatedText)}
              className="flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Cognitive Lens Bar (Perspective & Depth Shifter) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2 border-b border-indigo-900/60 flex items-center justify-between flex-wrap gap-2 text-xs shadow-inner shrink-0 z-10 select-none">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
            <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-slate-100 font-semibold tracking-wide">Cognitive Lens:</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => handleSelectLens('original')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                lensMode === 'original'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => handleSelectLens('eli5')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                lensMode === 'eli5'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Explain Like I'm 5 (Plain English & Metaphors)"
            >
              <span>👶 ELI5</span>
            </button>
            <button
              onClick={() => handleSelectLens('executive')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                lensMode === 'executive'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Executive Briefing (Strategic takeaways, risks & metrics)"
            >
              <span>💼 Executive</span>
            </button>
            <button
              onClick={() => handleSelectLens('architect')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                lensMode === 'architect'
                  ? 'bg-purple-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Senior Systems Architect (Deep technical architecture & tradeoffs)"
            >
              <span>🔬 Architect</span>
            </button>
            <button
              onClick={() => handleSelectLens('critique')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                lensMode === 'critique'
                  ? 'bg-rose-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Critical & Adversarial Audit (Missing facts & counter-points)"
            >
              <span>⚖️ Critique</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLensLoading && (
            <span className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              Synthesizing perspective with Gemini 3.7...
            </span>
          )}
          {lensMode !== 'original' && lensContent && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopyText(lensContent)}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy adapted text"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => onSaveAsNote(`${lensMode.toUpperCase()} Lens: ${tab.title}`, lensContent, tab.url)}
                className="px-2 py-0.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Save adapted note"
              >
                <StickyNote className="w-3 h-3" />
                <span>Save Note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport Content Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-slate-50 relative">
        {/* Floating Table of Contents Outline Sidebar */}
        {showOutline && headings.length > 0 && (
          <div className="absolute top-4 left-4 w-72 max-h-[80%] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 z-30 flex flex-col animate-in fade-in slide-in-from-left-4 duration-150 ring-1 ring-black/5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ListFilter className="w-4 h-4 text-blue-600" />
                <span>Table of Contents</span>
              </div>
              <button
                onClick={() => setShowOutline(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 space-y-1 text-xs">
              {headings.map((h, i) => (
                <button
                  key={i}
                  onClick={() => scrollToHeading(h)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors flex items-center gap-2 group cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  <span className="truncate">{h}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fact-Check Result Modal / Drawer */}
        {showFactCheckModal && (
          <div className="absolute top-4 right-4 w-96 max-h-[85%] bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 z-30 flex flex-col animate-in fade-in slide-in-from-right-4 duration-150 ring-1 ring-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>AI Fact-Check & Verification</span>
              </div>
              <button
                onClick={() => setShowFactCheckModal(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mt-3 text-xs text-slate-800 leading-relaxed space-y-3">
              {isFactChecking ? (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  <p className="font-semibold text-slate-700">Verifying claims against search index...</p>
                </div>
              ) : (
                <div className="prose prose-xs max-w-none">
                  <ReactMarkdown>{factCheckResult || 'No analysis available.'}</ReactMarkdown>
                </div>
              )}
            </div>
            {!isFactChecking && factCheckResult && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() =>
                    onSaveAsNote(`Fact-Check: ${tab.title}`, factCheckResult)
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs cursor-pointer"
                >
                  Save to Notes
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI X-Ray Intelligence & Entity Radar Panel */}
        {showXRay && (
          <div className="absolute top-4 right-4 w-96 max-h-[85%] bg-white/95 backdrop-blur-md rounded-2xl border border-purple-200 shadow-2xl p-5 z-30 flex flex-col animate-in fade-in slide-in-from-right-4 duration-150 ring-1 ring-purple-500/10">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-purple-100 text-purple-700">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI X-Ray Entity & Signal Radar</h4>
                  <p className="text-[10px] text-purple-700 font-medium">
                    Signal Quality Index: {xRayAnalysis.signalScore}%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowXRay(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 my-2.5 bg-slate-100/80 p-1 rounded-xl text-[11px]">
              {(['all', 'entities', 'tech', 'metrics'] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setXRayFilter(tabKey)}
                  className={`flex-1 py-1 rounded-lg font-semibold transition-all capitalize cursor-pointer ${
                    xRayFilter === tabKey
                      ? 'bg-white text-purple-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tabKey}
                </button>
              ))}
            </div>

            {/* Entities & Insights Content */}
            <div className="flex-1 overflow-y-auto space-y-3.5 text-xs text-slate-800 pr-1">
              {/* Core Questions Answered */}
              {(xRayFilter === 'all' || xRayFilter === 'entities') && xRayAnalysis.questions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                    Core Inquiries Answered
                  </span>
                  <div className="space-y-1.5">
                    {xRayAnalysis.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-purple-50/70 border border-purple-150 text-[11px]"
                      >
                        <p className="font-semibold text-purple-950 mb-0.5">{q.question}</p>
                        <p className="text-[10px] text-purple-700">{q.cue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies & Frameworks */}
              {(xRayFilter === 'all' || xRayFilter === 'tech') && xRayAnalysis.tech.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Detected Technologies & Protocols ({xRayAnalysis.tech.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {xRayAnalysis.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-semibold"
                      >
                        ⚙️ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations & Entities */}
              {(xRayFilter === 'all' || xRayFilter === 'entities') && xRayAnalysis.orgs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Institutions & Organizations ({xRayAnalysis.orgs.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {xRayAnalysis.orgs.map((o) => (
                      <span
                        key={o}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium text-[10px]"
                      >
                        🏛️ {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Quantitative Metrics */}
              {(xRayFilter === 'all' || xRayFilter === 'metrics') && xRayAnalysis.metrics.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quantitative Figures & Benchmarks ({xRayAnalysis.metrics.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {xRayAnalysis.metrics.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-bold"
                      >
                        📊 {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-purple-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={onTriggerAiSummary}
                className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep Ask Co-Pilot</span>
              </button>

              <button
                onClick={() => {
                  const summaryNote = `# AI X-Ray Radar: ${tab.title}\n\n**Source URL:** ${tab.url}\n**Signal Score:** ${xRayAnalysis.signalScore}%\n\n### Technologies\n${xRayAnalysis.tech.join(', ') || 'N/A'}\n\n### Entities\n${xRayAnalysis.orgs.join(', ') || 'N/A'}\n\n### Quantitative Benchmarks\n${xRayAnalysis.metrics.join(', ') || 'N/A'}`;
                  onSaveAsNote(`X-Ray: ${tab.title}`, summaryNote);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Save X-Ray Note
              </button>
            </div>
          </div>
        )}

        {/* Active Neural Lens Perspective View */}
        {lensMode !== 'original' ? (
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                  {lensMode === 'eli5' ? '👶' : lensMode === 'executive' ? '💼' : lensMode === 'architect' ? '🔬' : '⚖️'}
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-indigo-950">
                    {lensMode === 'eli5' && "Explain Like I'm 5 (ELI5) Lens Active"}
                    {lensMode === 'executive' && 'Executive Briefing & Strategic Decision Lens Active'}
                    {lensMode === 'architect' && 'Senior Systems Architect Technical Deep-Dive Active'}
                    {lensMode === 'critique' && 'Adversarial Critical Audit & Rigor Lens Active'}
                  </h3>
                  <p className="text-xs text-indigo-800/80">
                    Grounded on active page &bull; Real-time cognitive adaptation by Gemini 3.7 Flash
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSelectLens('original')}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-100/60 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Restore Original Page
              </button>
            </div>

            {isLensLoading ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Synthesizing Lens Perspective...</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Gemini 3.7 is analyzing the entire page, extracting core semantic relationships, and adapting tone & depth.
                </p>
              </div>
            ) : lensContent ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-slate-800 text-sm md:text-base leading-relaxed">
                <div className="prose max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed prose-a:text-blue-600 prose-code:font-mono prose-code:text-xs">
                  <ReactMarkdown>{lensContent}</ReactMarkdown>
                </div>
              </div>
            ) : null}
          </div>
        ) : (tab.url.includes('google.com/search') ||
          tab.url.includes('google.com/?q=') ||
          tab.url.replace(/\/+$/, '') === 'https://www.google.com' ||
          tab.url.replace(/\/+$/, '') === 'http://www.google.com' ||
          tab.url.replace(/\/+$/, '') === 'https://google.com') && !translatedText ? (
          <GoogleSearchPageView
            tab={tab}
            onNavigate={onNavigate}
            onSaveAsNote={onSaveAsNote}
          />
        ) : mockSite && !translatedText ? (
          /* High-Fidelity Rich Preloaded Website Layout */
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {/* Hero Section */}
            <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-bold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                  {mockSite.category.toUpperCase()}
                </span>
                <span>•</span>
                <span>{mockSite.domain}</span>
                {mockSite.content.publishedDate && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500">{mockSite.content.publishedDate}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {mockSite.title}
              </h1>

              {mockSite.content.author && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {mockSite.content.author[0]}
                  </div>
                  <span className="font-medium">Written by {mockSite.content.author}</span>
                </div>
              )}

              {mockSite.content.heroImage && (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs mt-4">
                  <img
                    src={mockSite.content.heroImage}
                    alt=""
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {mockSite.content.sections.map((section, idx) => (
                <section key={idx} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  {section.heading && (
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                      {section.heading}
                    </h2>
                  )}

                  {section.body && (
                    <p className="text-sm md:text-base leading-relaxed text-slate-700">
                      {section.body}
                    </p>
                  )}

                  {/* Render Table if available */}
                  {section.table && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                          <tr>
                            {section.table.headers.map((h, i) => (
                              <th key={i} className="px-4 py-3 font-bold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-3 text-slate-800 font-medium">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Render List if available */}
                  {section.list && (
                    <ul className="space-y-2 text-sm text-slate-700 pl-4 list-disc marker:text-blue-600">
                      {section.list.map((item, lIdx) => (
                        <li key={lIdx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        ) : (
          /* Live Webpage / Scraped Content Viewport with Rich Markdown & Layout */
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Header Card */}
            <div className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-bold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                  {new URL(tab.url).hostname}
                </span>
                <span>•</span>
                <span className="text-slate-500 font-normal">Live Document</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {tab.title}
              </h1>
              {tab.metaDescription && (
                <p className="text-sm text-slate-600 leading-relaxed border-l-3 border-blue-500 pl-3 italic">
                  {tab.metaDescription}
                </p>
              )}
            </div>

            {/* Extracted Body with Structured Markdown */}
            {activeContent ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-slate-800 text-sm md:text-base leading-relaxed">
                <div className="prose max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-table:w-full prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-td:border-b">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children, ...props }) => (
                        <a
                          href={href}
                          onClick={(e) => {
                            if (href && !href.startsWith('#')) {
                              e.preventDefault();
                              onNavigate(href);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer inline-flex items-center gap-0.5"
                          title={`Navigate to ${href}`}
                          {...props}
                        >
                          <span>{children}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 inline-block opacity-70 shrink-0" />
                        </a>
                      ),
                      pre: ({ children, ...props }) => {
                        const rawCode = String((children as any)?.props?.children || children || '');
                        return (
                          <div className="relative group my-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                                <Code className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Code Snippet</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                {onOpenSandbox && (
                                  <button
                                    onClick={() => onOpenSandbox(rawCode)}
                                    className="px-2 py-0.5 rounded-md bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-semibold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Open and run in Code Sandbox"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
                                    <span>Run in Sandbox</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCopyText(rawCode)}
                                  className="px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Copy</span>
                                </button>
                              </div>
                            </div>
                            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed bg-slate-950" {...props}>
                              {children}
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Live Web Page Ready</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Page loaded. Click &quot;AI Summarize&quot; or ask the Aksh AI Co-Pilot in the sidebar to analyze this page.
                </p>
              </div>
            )}

            {/* Neural Action Studio */}
            <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-blue-50/80 border border-indigo-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Neural Action Studio:</span>
                <span className="text-slate-500 font-normal">Instant recommended steps for this document</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={onTriggerAiSummary}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Executive Brief</span>
                </button>
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Comprehension Quiz</span>
                </button>
                <button
                  onClick={() => setShowCredibilityModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>Check Bias & Rigor</span>
                </button>
                {onOpenDataExtractor && (
                  <button
                    onClick={onOpenDataExtractor}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Extract structured tables and data"
                  >
                    <Table className="w-3.5 h-3.5 text-rose-600" />
                    <span>Extract Tables</span>
                  </button>
                )}
                <button
                  onClick={handleSaveToVault}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    vaultSaved
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white hover:bg-purple-50 border-purple-200 text-purple-800'
                  }`}
                  title="Index document to Neural Memory Vault"
                >
                  {vaultSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />}
                  <span>{vaultSaved ? 'Indexed to Vault!' : 'Add to Vault'}</span>
                </button>
                <button
                  onClick={() => onNavigate('aksh://agent')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Launch autonomous multi-agent research swarm on this page"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>Launch Agent</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Content Drawer / Modal for Transparency */}
      {showExtractedInspector && (
        <div className="absolute inset-y-0 right-0 w-96 bg-white/98 border-l border-slate-200 shadow-2xl p-4 flex flex-col z-40 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Code className="w-4 h-4 text-indigo-600" />
              <span>Extracted AI Text Context</span>
            </div>
            <button
              onClick={() => setShowExtractedInspector(false)}
              className="text-slate-500 hover:text-slate-900 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="py-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Length: {activeContent.length} chars</span>
            <button
              onClick={() => handleCopyText(activeContent)}
              className="text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Clean Text'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 select-all scrollbar-none whitespace-pre-wrap">
            {activeContent || 'No text extracted for this page.'}
          </div>
        </div>
      )}

      {/* Floating Smart Page Tools HUD */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
        {isFloatingHudCollapsed ? (
          <button
            onClick={() => setIsFloatingHudCollapsed(false)}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all cursor-pointer group"
            title="Open AI Page Tools"
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-xl text-xs text-slate-700">
            {onOpenWebClipper && (
              <button
                onClick={onOpenWebClipper}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                title="Clip to AI Notes with Key Takeaways & Citation"
              >
                <Scissors className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold">Clip</span>
              </button>
            )}

            {onToggleReaderMode && (
              <button
                onClick={onToggleReaderMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  tab.isReaderMode
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Toggle Reader Mode"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px]">Reader</span>
              </button>
            )}

            {/* Bionic Reading Toggle */}
            <button
              onClick={() => setIsBionic(!isBionic)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                isBionic
                  ? 'bg-amber-500 text-white font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Toggle Bionic Reading (Faster cognitive reading speed)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[11px]">Bionic</span>
            </button>

            <button
              onClick={() => setShowTranslateMenu(!showTranslateMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                showTranslateMenu
                  ? 'bg-indigo-100 text-indigo-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Translate Page"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px]">Translate</span>
            </button>

            {onTriggerSpeech && (
              <button
                onClick={onTriggerSpeech}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                title="Listen to Page Narration"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px]">Listen</span>
              </button>
            )}

            <button
              onClick={handleFactCheck}
              disabled={isFactChecking}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Fact Check Claims"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px]">Fact Check</span>
            </button>

            {/* Sticky Notes Toggle */}
            <button
              onClick={() => setShowStickyNotes(!showStickyNotes)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                showStickyNotes
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Page Sticky Notes & Annotations"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px]">Notes</span>
              {annotations.length > 0 && (
                <span className="text-[9px] px-1 rounded-full bg-amber-200 text-amber-900 font-mono">
                  {annotations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                showOutline
                  ? 'bg-blue-100 text-blue-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Table of Contents / Outline"
            >
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
            </button>

            {onOpenFindInPage && (
              <button
                onClick={onOpenFindInPage}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                title="Find in Page (Ctrl+F)"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            <button
              onClick={() => setIsFloatingHudCollapsed(true)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Collapse Toolbar"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* In-Page Sticky Notes Layer */}
      <PageStickyNotesLayer
        url={tab.url}
        annotations={annotations}
        onAddAnnotation={handleAddAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        onExportToAiNotes={handleExportAnnotationsToNotes}
        isOpen={showStickyNotes}
        onClose={() => setShowStickyNotes(false)}
      />

      {/* AI Page Active Recall Comprehension Quiz Modal */}
      <PageQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        pageTitle={tab.title}
        pageUrl={tab.url}
        pageContent={activeContent || ''}
        onSaveAsNote={onSaveAsNote}
      />

      {/* AI Page Credibility & Bias Radar Modal */}
      <PageCredibilityModal
        isOpen={showCredibilityModal}
        onClose={() => setShowCredibilityModal(false)}
        pageTitle={tab.title}
        pageUrl={tab.url}
        pageContent={activeContent || ''}
        onSaveAsNote={onSaveAsNote}
      />
    </div>
  );
};
