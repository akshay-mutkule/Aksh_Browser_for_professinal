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
  const currentPdf = tab.pdfData || {
    filename: SAMPLE_PDFS[0].filename,
    text: SAMPLE_PDFS[0].text,
    pageCount: SAMPLE_PDFS[0].pageCount,
    currentPage: 1,
  };

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [customQuestion, setCustomQuestion] = useState('');

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
    <div className="h-full flex flex-col md:flex-row bg-slate-950 text-slate-200 overflow-hidden select-text">
      {/* Left Panel: PDF Document Paper View */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-950 overflow-hidden">
        {/* PDF Top Toolbar */}
        <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold truncate max-w-[200px]">{currentPdf.filename}</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({currentPdf.pageCount} pages)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg text-slate-300">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Upload Custom PDF / File */}
            <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
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

        {/* Sample Switcher Pills */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase shrink-0">
            Sample PDFs:
          </span>
          {SAMPLE_PDFS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                currentPdf.filename === sample.filename
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* PDF Paper Sheet */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center bg-slate-950">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-8 md:p-12 font-serif-reading transition-transform duration-150 space-y-6 select-text min-h-[600px]"
          >
            <div className="text-center pb-6 border-b border-slate-200 space-y-2">
              <div className="text-xs uppercase tracking-widest text-slate-500 font-sans font-bold">
                Nexus AI PDF Engine
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
      <div className="w-full md:w-[460px] h-full bg-slate-900 flex flex-col shadow-xl z-10 select-text">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">AI PDF Intelligence</h3>
              <p className="text-[11px] text-slate-400">Deep document synthesis & testing</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleRunAiAction('summarize')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
              activeAction === 'summarize'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="font-semibold">Summarize PDF</div>
              <div className="text-[10px] text-slate-400">Core findings & methodology</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('notes')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
              activeAction === 'notes'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold">Study Notes</div>
              <div className="text-[10px] text-slate-400">Cornell-style breakdown</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('mcq')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
              activeAction === 'mcq'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold">Generate 5 MCQs</div>
              <div className="text-[10px] text-slate-400">Practice quiz with solutions</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('interview')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
              activeAction === 'interview'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold">Interview Q&A</div>
              <div className="text-[10px] text-slate-400">Top technical questions</div>
            </div>
          </button>
        </div>

        {/* Custom PDF Question Input */}
        <div className="p-3 border-b border-slate-800">
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
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isLoading}
              className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* AI Results Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-rose-300 font-medium">
                Gemini 3.7 is analyzing document tokens & synthesizing insights...
              </p>
            </div>
          )}

          {!isLoading && aiOutput && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-semibold text-rose-400 uppercase tracking-wider text-[11px]">
                  Analysis Output
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveToNotes}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {saved ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Saved
                      </span>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCopyResult}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copied ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="markdown-body text-slate-200 text-xs leading-relaxed">
                <Markdown>{aiOutput}</Markdown>
              </div>
            </div>
          )}

          {!isLoading && !aiOutput && (
            <div className="py-16 text-center space-y-2 text-slate-500 text-xs">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-medium text-slate-400">Ready to examine document</p>
              <p className="max-w-xs mx-auto">
                Click any action above to generate a summary, Cornell study notes, or practice MCQs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
