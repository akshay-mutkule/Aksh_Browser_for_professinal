import React, { useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FindInPageBarProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  matchIndex: number;
  matchCount: number;
  onNext: () => void;
  onPrev: () => void;
  caseSensitive: boolean;
  onToggleCaseSensitive: () => void;
}

export const FindInPageBar: React.FC<FindInPageBarProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  matchIndex,
  matchCount,
  onNext,
  onPrev,
  caseSensitive,
  onToggleCaseSensitive,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="absolute top-3 right-5 z-40 bg-white/98 backdrop-blur-md border border-slate-300 shadow-xl rounded-xl p-1.5 flex items-center gap-1.5 text-xs text-slate-800 select-none ring-1 ring-black/5"
      >
        <div className="flex items-center gap-1.5 pl-2 pr-1">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in page..."
            className="w-36 sm:w-48 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none py-0.5"
          />
        </div>

        {/* Match Count Badge */}
        <div className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-slate-600 shrink-0 min-w-[50px] text-center">
          {query.trim().length === 0 ? (
            '0 found'
          ) : matchCount > 0 ? (
            <span>
              {matchIndex + 1} / {matchCount}
            </span>
          ) : (
            <span className="text-rose-600 font-semibold">0 of 0</span>
          )}
        </div>

        {/* Case Sensitive Toggle */}
        <button
          onClick={onToggleCaseSensitive}
          className={`px-1.5 py-1 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
            caseSensitive
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
          title="Match Case (Aa)"
        >
          Aa
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Navigation Buttons */}
        <button
          onClick={onPrev}
          disabled={matchCount === 0}
          className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={onNext}
          disabled={matchCount === 0}
          className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer ml-0.5"
          title="Close (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
