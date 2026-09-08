import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  BookOpen,
  GraduationCap,
  Briefcase,
  BrainCircuit,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookmarkPlus,
  ArrowRight
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Tab } from '../../types';
import { SAMPLE_PDFS } from '../../data/mockWebsites';
import { analyzePDFDocument } from '../../services/api';

interface PDFViewerProps {
  tab: Tab;
  onSaveAsNote: (title: string, content: string) => void;
  onUpdateTabPdfData: (pdfData: any) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  tab,
  onSaveAsNote,
  onUpdateTabPdfData,
}) => {
  const currentPdf = tab.pdfData || null;

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [customQuestion, setCustomQuestion] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState<'doc' | 'ai'>('doc');

  const handleSelectSample = (sample: (typeof SAMPLE_PDFS)[0]) => {
    onUpdateTabPdfData({
      filename: sample.filename,
      text: sample.text,
      pageCount: sample.pageCount,
      currentPage: 1,
    });
    setAiOutput(null);
    setActiveAction(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      onUpdateTabPdfData({
        filename: file.name,
        text: content.slice(0, 30000), // Rich preview capacity
        pageCount: Math.max(1, Math.round(content.length / 2000)),
        currentPage: 1,
      });
      setAiOutput(null);
    };
    reader.readAsText(file);
  };

  if (!currentPdf) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6 select-none">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Document & PDF Reader</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload any PDF, TXT, or Markdown document to analyze with Gemini, generate study summaries, extract key concepts, and ask questions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer shadow-xs transition-colors text-sm">
              <Upload className="w-4 h-4" />
              <span>Choose Document</span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => handleSelectSample(SAMPLE_PDFS[0])}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-sm cursor-pointer border border-slate-200"
            >
              Try Sample Paper
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Supports PDF, TXT, and Markdown files
          </div>
        </div>
      </div>
    );
  }

  const handleRunAiAction = async (action: 'summarize' | 'notes' | 'mcq' | 'interview' | 'explain_simple' | 'ask') => {
    setActiveAction(action);
    setIsLoading(true);
    setAiOutput(null);

    try {
      const res = await analyzePDFDocument(
        currentPdf.text,
        currentPdf.filename,
        action,
        action === 'ask' ? customQuestion : undefined
      );
      setAiOutput(res.result);
    } catch (err: any) {
      setAiOutput(`❌ Error analyzing document: ${err.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (aiOutput) {
      navigator.clipboard.writeText(aiOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToNotes = () => {
    if (aiOutput) {
      onSaveAsNote(`${currentPdf.filename} - ${activeAction?.toUpperCase()}`, aiOutput);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 text-slate-900 overflow-hidden select-text">
      {/* Mobile Toggle: Document vs AI Analysis (< md) */}
      <div className="md:hidden h-10 px-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileViewMode('doc')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mobileViewMode === 'doc'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PDF Document
          </button>
          <button
            onClick={() => setMobileViewMode('ai')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mobileViewMode === 'ai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Intelligence
          </button>
        </div>
        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[120px]">
          {currentPdf.filename}
        </span>
      </div>

      {/* Left Panel: PDF Document Paper View */}
      <div className={`flex-1 flex-col border-r border-slate-200 bg-slate-100 overflow-hidden ${
        mobileViewMode === 'doc' ? 'flex' : 'hidden md:flex'
      }`}>
        {/* PDF Top Toolbar */}
        <div className="h-10 px-4 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold text-slate-900 truncate max-w-[200px]">{currentPdf.filename}</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({currentPdf.pageCount} pages)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700 border border-slate-200">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="hover:text-slate-900 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-medium px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="hover:text-slate-900 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Upload Custom PDF / File */}
            <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload PDF</span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* PDF Paper Sheet */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center bg-slate-100">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 p-8 md:p-12 font-serif-reading transition-transform duration-150 space-y-6 select-text min-h-[600px]"
          >
            <div className="text-center pb-6 border-b border-slate-200 space-y-2">
              <div className="text-xs uppercase tracking-widest text-slate-500 font-sans font-bold">
                Aksh AI PDF Engine
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                {currentPdf.filename.replace(/_/g, ' ').replace('.pdf', '')}
              </h2>
            </div>

            <div className="text-sm md:text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
              {currentPdf.text}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: AI PDF Intelligence Co-Pilot */}
      <div className={`w-full md:w-[460px] h-full bg-white flex-col shadow-lg z-10 select-text border-l border-slate-200 overflow-hidden ${
        mobileViewMode === 'ai' ? 'flex flex-1 md:flex-initial' : 'hidden md:flex'
      }`}>
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI PDF Intelligence</h3>
              <p className="text-[11px] text-slate-500">Deep document synthesis & testing</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="p-3 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs bg-slate-50/50">
          <button
            onClick={() => handleRunAiAction('summarize')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
              activeAction === 'summarize'
                ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs font-semibold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Summarize PDF</div>
              <div className="text-[10px] text-slate-500">Core findings & methodology</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('notes')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
              activeAction === 'notes'
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs font-semibold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Study Notes</div>
              <div className="text-[10px] text-slate-500">Cornell-style breakdown</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('mcq')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
              activeAction === 'mcq'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs font-semibold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Generate 5 MCQs</div>
              <div className="text-[10px] text-slate-500">Practice quiz with solutions</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('interview')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
              activeAction === 'interview'
                ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs font-semibold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Interview Q&A</div>
              <div className="text-[10px] text-slate-500">Top technical questions</div>
            </div>
          </button>
        </div>

        {/* Custom PDF Question Input */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuestion.trim()) handleRunAiAction('ask');
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask anything about this PDF (e.g. 'Explain equation 1')..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isLoading}
              className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* AI Results Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-rose-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-rose-700 font-medium">
                Gemini 3.7 is analyzing document tokens & synthesizing insights...
              </p>
            </div>
          )}

          {!isLoading && aiOutput && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                <span className="font-bold text-rose-700 uppercase tracking-wider text-[11px]">
                  Analysis Output
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveToNotes}
                    className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    {saved ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Saved
                      </span>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCopyResult}
                    className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="markdown-body text-slate-800 text-xs leading-relaxed">
                <Markdown>{aiOutput}</Markdown>
              </div>
            </div>
          )}

          {!isLoading && !aiOutput && (
            <div className="py-16 text-center space-y-2 text-slate-400 text-xs">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">Ready to examine document</p>
              <p className="max-w-xs mx-auto text-slate-500">
                Click any action above to generate a summary, Cornell study notes, or practice MCQs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
