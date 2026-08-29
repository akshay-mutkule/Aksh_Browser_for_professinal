import React, { useState } from 'react';
import { StickyNote, Search, Trash2, Copy, Check, ExternalLink, Download, Sparkles, Plus } from 'lucide-react';
import Markdown from 'react-markdown';
import { AINote } from '../../types';

interface AINotesViewProps {
  notes: AINote[];
  onDeleteNote: (id: string) => void;
  onNavigateUrl?: (url: string) => void;
}

export const AINotesView: React.FC<AINotesViewProps> = ({
  notes,
  onDeleteNote,
  onNavigateUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<AINote | null>(notes[0] || null);
  const [copied, setCopied] = useState(false);

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    if (selectedNote) {
      navigator.clipboard.writeText(selectedNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportAll = () => {
    const markdownBundle = notes
      .map((n) => `# ${n.title}\n*Saved: ${n.createdAt} | Source: ${n.sourceUrl || 'AI Query'}*\n\n${n.content}\n\n---\n`)
      .join('\n');
    const blob = new Blob([markdownBundle], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aksh-ai-knowledge-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 text-slate-900 overflow-hidden select-text">
      {/* Left List of Notes */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-50 text-yellow-600 border border-yellow-200 flex items-center justify-center">
                <StickyNote className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">AI Knowledge Notes</h2>
            </div>

            <button
              onClick={handleExportAll}
              disabled={notes.length === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Export all notes to Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-3 rounded-xl cursor-pointer transition-all border text-xs ${
                selectedNote?.id === note.id
                  ? 'bg-yellow-50/70 border-yellow-400 text-slate-900 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-xs truncate text-slate-900 mb-1">{note.title}</div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {note.content.replace(/[#*`]/g, '')}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                <span>{note.createdAt}</span>
                {note.tags && note.tags[0] && (
                  <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                    #{note.tags[0]}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs p-4">
              No notes found. Click "Save to Notes" on any AI summary or research result!
            </div>
          )}
        </div>
      </div>

      {/* Right Note Detail Viewer */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {selectedNote ? (
          <>
            {/* Note Top Bar */}
            <div className="h-12 px-6 bg-white border-b border-slate-200 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-3 truncate">
                <span className="font-bold text-sm text-slate-900 truncate max-w-md">
                  {selectedNote.title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({selectedNote.createdAt})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedNote.sourceUrl && onNavigateUrl && (
                  <button
                    onClick={() => onNavigateUrl(selectedNote.sourceUrl!)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Source</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                  title="Copy Note"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    onDeleteNote(selectedNote.id);
                    setSelectedNote(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4">
              <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-md">
                <div className="markdown-body max-w-none text-slate-800 text-sm leading-relaxed">
                  <Markdown>{selectedNote.content}</Markdown>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
            <StickyNote className="w-12 h-12 text-slate-400" />
            <h3 className="text-base font-semibold text-slate-800">Select or Create a Note</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Use Aksh AI to summarize articles, research complex topics, or save study guides directly to this knowledge base.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
