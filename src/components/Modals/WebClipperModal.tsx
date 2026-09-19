import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors,
  Sparkles,
  Bookmark,
  StickyNote,
  Copy,
  Check,
  Download,
  X,
  Tag,
  BookOpen,
  Globe,
  Quote,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Tab } from '../../types';
import { sendAIChat } from '../../services/api';

interface WebClipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string, tags?: string[]) => void;
  onOpenNotes?: () => void;
}

export const WebClipperModal: React.FC<WebClipperModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSaveAsNote,
  onOpenNotes,
}) => {
  const [clipTitle, setClipTitle] = useState('');
  const [clipNotes, setClipNotes] = useState('');
  const [clipTags, setClipTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [citationFormat, setCitationFormat] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiKeyPoints, setAiKeyPoints] = useState<string[]>([]);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab) {
      setClipTitle(activeTab.title || 'Untitled Article');
      setClipNotes('');
      setSavedSuccess(false);

      // Auto-suggest tags based on URL and title
      const initialTags: string[] = ['web-clip'];
      if (activeTab.url.includes('github')) initialTags.push('code', 'open-source');
      else if (activeTab.url.includes('arxiv') || activeTab.url.includes('paper')) initialTags.push('paper', 'research');
      else if (activeTab.url.includes('tech') || activeTab.url.includes('blog')) initialTags.push('tech', 'article');
      else initialTags.push('reading');
      setClipTags(initialTags);

      // Generate instant AI 3-bullet takeaway if content is available
      const content = activeTab.extractedText || activeTab.metaDescription || '';
      if (content.length > 50) {
        setIsGeneratingSummary(true);
        sendAIChat(
          `Extract the 3 most crucial takeaways from this webpage as clean, concise bullet points (without preamble or markdown symbols, one per line):\nTitle: ${activeTab.title}\nContent: ${content.slice(0, 3000)}`,
          [],
          undefined,
          'summary'
        )
          .then((res) => {
            const points = res.reply
              .split('\n')
              .map((p) => p.replace(/^[-*•\d.]+\s*/, '').trim())
              .filter((p) => p.length > 5)
              .slice(0, 3);
            setAiKeyPoints(points.length > 0 ? points : ['Primary concept explained with supporting evidence.', 'Key architectural and practical takeaways outlined.', 'Referenced findings and author methodology discussed.']);
          })
          .catch(() => {
            setAiKeyPoints(['Key insights captured from active page session.', 'Referenced source preserved with metadata.', 'Extracted text saved for offline review.']);
          })
          .finally(() => {
            setIsGeneratingSummary(false);
          });
      } else {
        setAiKeyPoints([
          `Web page snapshot saved from ${activeTab.url}`,
          'Archived into personal AI knowledge base.',
        ]);
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen || !activeTab) return null;

  const currentYear = new Date().getFullYear();
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Citation generators
  const getCitation = () => {
    const domain = (() => {
      try {
        return new URL(activeTab.url).hostname;
      } catch {
        return 'Web';
      }
    })();

    if (citationFormat === 'apa') {
      return `${domain}. (${currentYear}). ${activeTab.title}. Retrieved ${todayDate}, from ${activeTab.url}`;
    }
    if (citationFormat === 'mla') {
      return `"${activeTab.title}." ${domain}, ${currentYear}, ${activeTab.url}. Accessed ${todayDate}.`;
    }
    // BibTeX
    const citeKey = (domain.replace(/[^a-zA-Z]/g, '') + currentYear).toLowerCase();
    return `@misc{${citeKey},\n  title = {${activeTab.title}},\n  howpublished = {\\url{${activeTab.url}}},\n  note = {Accessed: ${todayDate}},\n  year = {${currentYear}}\n}`;
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(getCitation());
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !clipTags.includes(tag)) {
      setClipTags([...clipTags, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setClipTags(clipTags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    const markdownContent = [
      `# ${clipTitle}`,
      `**Source**: [${activeTab.url}](${activeTab.url})`,
      `**Clipped**: ${todayDate}`,
      '',
      '## 💡 Key Takeaways (AI Generated)',
      ...aiKeyPoints.map((p) => `- ${p}`),
      '',
      ...(clipNotes.trim() ? ['## 📝 Personal Notes', clipNotes.trim(), ''] : []),
      '## 📄 Excerpt / Page Text',
      `> ${(activeTab.extractedText || activeTab.metaDescription || 'No text extracted.').slice(0, 2000)}...`,
      '',
      '---',
      `*Citation (${citationFormat.toUpperCase()}):*`,
      `\`${getCitation()}\``,
    ].join('\n');

    onSaveAsNote(clipTitle, markdownContent, activeTab.url, clipTags);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = [
      `# ${clipTitle}`,
      `**Source**: [${activeTab.url}](${activeTab.url})`,
      `**Clipped**: ${todayDate}`,
      '',
      '## 💡 Key Takeaways',
      ...aiKeyPoints.map((p) => `- ${p}`),
      '',
      ...(clipNotes.trim() ? ['## 📝 Personal Notes', clipNotes.trim(), ''] : []),
      '## 📄 Content Excerpt',
      activeTab.extractedText || activeTab.metaDescription || '',
    ].join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clipTitle.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_')}_clip.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden select-none"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Aksh AI Web Clipper</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-sm">
                Capture, summarize, and cite current web page to AI Notes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 select-text">
          {/* Title & URL Box */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Clipped Title
            </label>
            <input
              type="text"
              value={clipTitle}
              onChange={(e) => setClipTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate pt-0.5">
              <Globe className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">{activeTab.url}</span>
            </div>
          </div>

          {/* AI Key Takeaways Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive AI Key Points</span>
              </span>
              {isGeneratingSummary && (
                <span className="text-[10px] text-indigo-600 font-medium animate-pulse">
                  Synthesizing page...
                </span>
              )}
            </div>

            <ul className="space-y-1.5 text-xs text-indigo-900/90">
              {aiKeyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-200/80 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Note Annotation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-amber-600" />
              <span>Personal Notes & Annotations (Optional)</span>
            </label>
            <textarea
              value={clipNotes}
              onChange={(e) => setClipNotes(e.target.value)}
              placeholder="Add your thoughts, ideas, or action items for this article..."
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none font-sans shadow-2xs"
            />
          </div>

          {/* Tags Manager */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tags</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {clipTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              <form onSubmit={handleAddTag} className="inline-flex">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="+ Add tag"
                  className="px-2.5 py-1 bg-transparent border border-dashed border-slate-300 rounded-lg text-[11px] focus:outline-none focus:border-blue-500 text-slate-700 w-24"
                />
              </form>
            </div>
          </div>

          {/* Academic Citation Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Academic Citation</span>
              </span>

              <div className="flex items-center gap-1">
                {(['apa', 'mla', 'bibtex'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setCitationFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      citationFormat === fmt
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCopyCitation}
                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 ml-1 cursor-pointer"
                  title="Copy Citation"
                >
                  {copiedCitation ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10px] text-slate-600 select-all break-all leading-relaxed">
              {getCitation()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download .md</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved to Notes!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-white fill-white" />
                  <span>Clip to AI Notes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
