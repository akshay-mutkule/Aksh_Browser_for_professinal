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
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '../../types';
import { SAMPLE_WEBSITES } from '../../data/mockWebsites';
import { translateText, factCheckClaim } from '../../services/api';

interface LiveWebViewProps {
  tab: Tab;
  onNavigate: (url: string) => void;
  onTriggerAiSummary: () => void;
  onSaveAsNote: (title: string, content: string) => void;
  onTriggerSpeech?: () => void;
  onToggleReaderMode?: () => void;
  onOpenWebClipper?: () => void;
  onOpenFindInPage?: () => void;
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
  findQuery = '',
  matchIndex = 0,
  caseSensitive = false,
  onMatchesFound,
}) => {
  const [copied, setCopied] = useState(false);
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

  // Reader Mode styling state
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light' | 'solarized'>('light');
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [readerFontFamily, setReaderFontFamily] = useState<'sans' | 'serif'>('serif');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFloatingHudCollapsed, setIsFloatingHudCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mockSite = SAMPLE_WEBSITES[tab.url];

  // Raw content determination
  const activeContent = translatedText || tab.extractedText || '';

  // Calculate Reading Stats (words & estimated minutes)
  const readingStats = useMemo(() => {
    const text = activeContent || (mockSite ? mockSite.extractedText : '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [activeContent, mockSite]);

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
                  {activeContent}
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

        {mockSite && !translatedText ? (
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
                <div className="prose max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-table:w-full prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-td:border-b">
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
                    }}
                  >
                    {activeContent}
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
    </div>
  );
};
