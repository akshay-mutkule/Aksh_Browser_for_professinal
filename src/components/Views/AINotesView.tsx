import React, { useState, useMemo } from 'react';
import {
  StickyNote,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  Plus,
  Edit3,
  Eye,
  Tag,
  Clock,
  FileText,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import { AINote } from '../../types';

interface AINotesViewProps {
  notes: AINote[];
  onDeleteNote: (id: string) => void;
  onUpdateNote?: (id: string, updatedNote: Partial<AINote>) => void;
  onCreateNote?: (note: Omit<AINote, 'id' | 'createdAt'>) => void;
  onNavigateUrl?: (url: string) => void;
}

export const AINotesView: React.FC<AINotesViewProps> = ({
  notes,
  onDeleteNote,
  onUpdateNote,
  onCreateNote,
  onNavigateUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<AINote | null>(notes[0] || null);
  const [copied, setCopied] = useState(false);

  // Edit note state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  // Create new note modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((n) => {
      n.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [notes]);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesTag = !selectedTag || (n.tags && n.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const handleCopy = () => {
    if (selectedNote) {
      navigator.clipboard.writeText(selectedNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportSingle = () => {
    if (!selectedNote) return;
    const blob = new Blob(
      [
        `# ${selectedNote.title}\n*Saved: ${selectedNote.createdAt} | Source: ${selectedNote.sourceUrl || 'Aksh Browser'}*\n\n${selectedNote.content}`
      ],
      { type: 'text/markdown' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const markdownBundle = notes
      .map(
        (n) =>
          `# ${n.title}\n*Saved: ${n.createdAt} | Source: ${n.sourceUrl || 'AI Query'} | Tags: ${(n.tags || []).join(', ')}*\n\n${n.content}\n\n---\n`
      )
      .join('\n');
    const blob = new Blob([markdownBundle], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aksh-ai-knowledge-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditing = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setEditTags((selectedNote.tags || []).join(', '));
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedNote || !onUpdateNote) return;
    const parsedTags = editTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onUpdateNote(selectedNote.id, {
      title: editTitle.trim() || 'Untitled Note',
      content: editContent,
      tags: parsedTags,
    });

    setSelectedNote((prev) =>
      prev
        ? {
            ...prev,
            title: editTitle.trim() || 'Untitled Note',
            content: editContent,
            tags: parsedTags,
          }
        : null
    );
    setIsEditing(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !onCreateNote) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onCreateNote({
      title: newTitle.trim(),
      content: newContent,
      tags: parsedTags,
      sourceUrl: newSourceUrl.trim() || undefined,
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setNewSourceUrl('');
    setShowCreateModal(false);
  };

  const wordCount = selectedNote ? selectedNote.content.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 text-slate-900 overflow-hidden select-text relative">
      {/* Left List of Notes */}
      <div className="w-full md:w-84 border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">AI Knowledge Notes</h2>
                <span className="text-[10px] text-slate-400 font-medium">{notes.length} saved</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-2xs"
                title="Create a new note"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportAll}
                disabled={notes.length === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Export all notes to Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, tag, or text..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tags Chips Bar */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedTag === null
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                #all
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer shrink-0 ${
                    selectedTag === tag
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all border text-xs ${
                selectedNote?.id === note.id
                  ? 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-2xs ring-1 ring-amber-500/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-xs truncate text-slate-900 mb-1">{note.title}</div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {note.content.replace(/[#*`_>]/g, '')}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span>{note.createdAt}</span>
                <div className="flex items-center gap-1">
                  {note.tags &&
                    note.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 rounded-md bg-amber-100/70 text-amber-800 font-semibold"
                      >
                        #{t}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs p-4 space-y-2">
              <StickyNote className="w-8 h-8 mx-auto text-slate-300" />
              <p>No matching notes found.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-amber-600 hover:underline font-semibold cursor-pointer"
              >
                + Create new note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Note Detail Viewer & Editor */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {selectedNote ? (
          <>
            {/* Note Top Bar */}
            <div className="h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between text-xs shadow-2xs shrink-0">
              <div className="flex items-center gap-3 truncate min-w-0 flex-1 mr-4">
                <span className="font-bold text-sm text-slate-900 truncate">
                  {selectedNote.title}
                </span>
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedNote.createdAt}
                  </span>
                  <span>•</span>
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>~{readTime} min read</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedNote.sourceUrl && onNavigateUrl && (
                  <button
                    onClick={() => onNavigateUrl(selectedNote.sourceUrl!)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Open Source</span>
                  </button>
                )}

                <button
                  onClick={() => (isEditing ? saveEdit() : startEditing())}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isEditing
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                  title={isEditing ? 'Save edits' : 'Edit note'}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                <button
                  onClick={handleExportSingle}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Export note as Markdown file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Copy Note Content"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    onDeleteNote(selectedNote.id);
                    setSelectedNote(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note Content Body or Editor */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4">
              {isEditing ? (
                <div className="max-w-4xl mx-auto space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Note Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-base font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="research, ai, architecture"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Markdown Content</label>
                    <textarea
                      rows={16}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* Tags Pill Bar */}
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedNote.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="markdown-body max-w-none text-slate-800 text-sm leading-relaxed">
                      <Markdown>{selectedNote.content}</Markdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <StickyNote className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Knowledge Notes</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Capture research papers, code snippets, synthesis summaries, and personal notes. Click below to create your first note.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Note</span>
            </button>
          </div>
        )}
      </div>

      {/* Create New Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <StickyNote className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Create Knowledge Note</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Note Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Transformer Architecture Notes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="ai, deep-learning, papers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Source URL (optional)</label>
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/1706.03762"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Markdown Content *</label>
                <textarea
                  required
                  rows={8}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write or paste your markdown notes here..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
