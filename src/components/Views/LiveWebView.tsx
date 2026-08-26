import React, { useState } from 'react';
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
  Maximize2
} from 'lucide-react';
import { Tab } from '../../types';
import { SAMPLE_WEBSITES } from '../../data/mockWebsites';

interface LiveWebViewProps {
  tab: Tab;
  onNavigate: (url: string) => void;
  onTriggerAiSummary: () => void;
  onSaveAsNote: (title: string, content: string) => void;
}

export const LiveWebView: React.FC<LiveWebViewProps> = ({
  tab,
  onNavigate,
  onTriggerAiSummary,
  onSaveAsNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExtractedInspector, setShowExtractedInspector] = useState(false);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [readerFontFamily, setReaderFontFamily] = useState<'sans' | 'serif'>('serif');

  const mockSite = SAMPLE_WEBSITES[tab.url];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If Reader Mode is enabled on this tab
  if (tab.isReaderMode) {
    const themeStyles = {
      dark: 'bg-slate-950 text-slate-200',
      sepia: 'bg-[#f4ecd8] text-[#433422]',
      light: 'bg-white text-slate-800',
    }[readerTheme];

    const fontSizeStyles = {
      normal: 'text-base leading-relaxed',
      large: 'text-lg leading-loose',
      huge: 'text-xl leading-loose',
    }[readerFontSize];

    const fontStyle = readerFontFamily === 'serif' ? 'font-serif-reading' : 'font-sans';

    return (
      <div className={`h-full overflow-y-auto ${themeStyles} select-text transition-colors duration-200`}>
        {/* Reader Mode Floating Toolbar */}
        <div className="sticky top-4 max-w-2xl mx-auto z-20 px-4">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 flex items-center justify-between shadow-xl text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">Reader Mode</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Font Type Toggle */}
              <button
                onClick={() => setReaderFontFamily(readerFontFamily === 'serif' ? 'sans' : 'serif')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold"
                title="Toggle Serif / Sans-Serif Font"
              >
                {readerFontFamily === 'serif' ? 'Serif' : 'Sans'}
              </button>

              {/* Font Size */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setReaderFontSize('normal')}
                  className={`px-2 py-0.5 rounded ${readerFontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize('large')}
                  className={`px-2 py-0.5 rounded text-sm ${readerFontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setReaderFontSize('huge')}
                  className={`px-2 py-0.5 rounded text-base ${readerFontSize === 'huge' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                >
                  A++
                </button>
              </div>

              {/* Theme Tones */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`w-5 h-5 rounded-full bg-slate-950 border ${readerTheme === 'dark' ? 'border-blue-400 ring-2 ring-blue-500/30' : 'border-slate-700'}`}
                  title="Dark theme"
                />
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`w-5 h-5 rounded-full bg-[#f4ecd8] border ${readerTheme === 'sepia' ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-slate-700'}`}
                  title="Sepia Paper theme"
                />
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`w-5 h-5 rounded-full bg-white border ${readerTheme === 'light' ? 'border-slate-400 ring-2 ring-slate-400/30' : 'border-slate-700'}`}
                  title="Light theme"
                />
              </div>

              {/* Quick AI Summarize in Reader */}
              <button
                onClick={onTriggerAiSummary}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reader Article Body */}
        <article className={`max-w-2xl mx-auto px-6 py-12 ${fontStyle} ${fontSizeStyles}`}>
          <div className="space-y-4 pb-8 border-b border-slate-700/40">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tab.title}</h1>
            <div className="flex items-center gap-3 text-xs opacity-75 font-sans">
              <span>{tab.url}</span>
              <span>•</span>
              <span>Distraction-free AI view</span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {tab.extractedText ? (
              tab.extractedText.split('\n\n').map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p>No content available to display in reader mode.</p>
            )}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative select-text">
      {/* Top Page Action Bar */}
      <div className="h-9 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[400px] text-slate-300 font-mono text-[11px]">
            {tab.url}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowExtractedInspector(!showExtractedInspector)}
            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Inspect text extracted for AI reasoning"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Inspect AI Context</span>
          </button>

          <button
            onClick={onTriggerAiSummary}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium transition-all"
            title="Summarize with AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Summarize</span>
          </button>
        </div>
      </div>

      {/* Main Web Page Viewport */}
      <div className="flex-1 overflow-y-auto bg-slate-950">
        {mockSite ? (
          /* High-Fidelity Rich Preloaded Website Layout */
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30">
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

              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                {mockSite.title}
              </h1>

              {mockSite.content.author && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {mockSite.content.author[0]}
                  </div>
                  <span>Written by {mockSite.content.author}</span>
                </div>
              )}

              {mockSite.content.heroImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <img
                    src={mockSite.content.heroImage}
                    alt=""
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Content Sections */}
            <div className="space-y-8 text-slate-200">
              {mockSite.content.sections.map((section, idx) => (
                <section key={idx} className="space-y-4">
                  {section.heading && (
                    <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2">
                      {section.heading}
                    </h2>
                  )}

                  {section.body && (
                    <p className="text-sm md:text-base leading-relaxed text-slate-300">
                      {section.body}
                    </p>
                  )}

                  {/* Render Table if available */}
                  {section.table && (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-md">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                          <tr>
                            {section.table.headers.map((h, i) => (
                              <th key={i} className="px-4 py-3 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-3 text-slate-300 font-medium">
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
                    <ul className="space-y-2 text-sm text-slate-300 pl-4 list-disc marker:text-blue-400">
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
          /* Live Webpage / Scraped Content Viewport */
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{tab.title}</h1>
              {tab.metaDescription && (
                <p className="text-sm text-slate-400 leading-relaxed">{tab.metaDescription}</p>
              )}
            </div>

            {tab.extractedText ? (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {tab.extractedText}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">Live Web Document Loaded</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Page content retrieved and ready for live AI reasoning, summarization, and question answering.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extracted Content Drawer / Modal for Transparency */}
      {showExtractedInspector && (
        <div className="absolute inset-y-0 right-0 w-96 bg-slate-900/98 border-l border-slate-700 shadow-2xl p-4 flex flex-col z-30 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Extracted AI Text Context</span>
            </div>
            <button
              onClick={() => setShowExtractedInspector(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="py-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Length: {tab.extractedText?.length || 0} characters</span>
            <button
              onClick={() => handleCopyText(tab.extractedText || '')}
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Clean Text'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 select-all scrollbar-none whitespace-pre-wrap">
            {tab.extractedText || 'No text extracted for this page.'}
          </div>
        </div>
      )}
    </div>
  );
};
