import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  X,
  Check,
  FileText,
  Sparkles,
  Palette,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { PageAnnotation } from '../../types';

interface PageStickyNotesLayerProps {
  url: string;
  annotations: PageAnnotation[];
  onAddAnnotation: (text: string, color: PageAnnotation['color']) => void;
  onDeleteAnnotation: (id: string) => void;
  onExportToAiNotes: (annotations: PageAnnotation[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_MAP: Record<PageAnnotation['color'], { bg: string; border: string; header: string; text: string }> = {
  yellow: { bg: 'bg-amber-50', border: 'border-amber-300', header: 'bg-amber-100/80', text: 'text-amber-950' },
  blue: { bg: 'bg-sky-50', border: 'border-sky-300', header: 'bg-sky-100/80', text: 'text-sky-950' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', header: 'bg-emerald-100/80', text: 'text-emerald-950' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', header: 'bg-rose-100/80', text: 'text-rose-950' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', header: 'bg-purple-100/80', text: 'text-purple-950' },
};

export const PageStickyNotesLayer: React.FC<PageStickyNotesLayerProps> = ({
  url,
  annotations,
  onAddAnnotation,
  onDeleteAnnotation,
  onExportToAiNotes,
  isOpen,
  onClose,
}) => {
  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState<PageAnnotation['color']>('yellow');
  const [isAdding, setIsAdding] = useState(false);
  const [exportedNotice, setExportedNotice] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddAnnotation(newText.trim(), selectedColor);
    setNewText('');
    setIsAdding(false);
  };

  const handleExport = () => {
    onExportToAiNotes(annotations);
    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 2500);
  };

  return (
    <div className="fixed bottom-16 right-6 z-40 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[500px] overflow-hidden animate-in slide-in-from-bottom-4 duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Page Sticky Notes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                {annotations.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{new URL(url || 'https://web').hostname}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Add sticky note"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Close sticky notes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Sticky Note Box */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 border-b border-slate-200 bg-amber-50/50 space-y-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Type your note or research observation here..."
            autoFocus
            rows={2}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {(['yellow', 'blue', 'emerald', 'rose', 'purple'] as PageAnnotation['color'][]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                    c === 'yellow'
                      ? 'bg-amber-400'
                      : c === 'blue'
                      ? 'bg-sky-400'
                      : c === 'emerald'
                      ? 'bg-emerald-400'
                      : c === 'rose'
                      ? 'bg-rose-400'
                      : 'bg-purple-400'
                  } ${selectedColor === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                Pin Note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[320px]">
        {annotations.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-2">
            <StickyNote className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No sticky notes on this page yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create first sticky note</span>
            </button>
          </div>
        ) : (
          annotations.map((ann) => {
            const style = COLOR_MAP[ann.color] || COLOR_MAP.yellow;
            return (
              <div
                key={ann.id}
                className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden shadow-2xs transition-all hover:shadow-xs`}
              >
                <div className={`flex items-center justify-between px-2.5 py-1 ${style.header} text-[10px] text-slate-600`}>
                  <span className="font-mono">{ann.createdAt}</span>
                  <button
                    onClick={() => onDeleteAnnotation(ann.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                    title="Delete sticky note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className={`p-2.5 text-xs ${style.text} whitespace-pre-wrap select-text leading-relaxed font-sans`}>
                  {ann.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Actions */}
      {annotations.length > 0 && (
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs border border-slate-200 transition-all cursor-pointer"
          >
            {exportedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-blue-600" />}
            <span>{exportedNotice ? 'Exported to AI Notes!' : 'Export All to AI Notes'}</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        </div>
      )}
    </div>
  );
};
