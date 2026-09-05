import React from 'react';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / ⌘K', desc: 'Open Smart Command Palette & Quick Tab Switcher' },
    { key: 'Ctrl + F', desc: 'Find in current page' },
    { key: 'Ctrl + T', desc: 'Open a new browser tab' },
    { key: 'Ctrl + W', desc: 'Close currently active tab' },
    { key: 'Ctrl + R', desc: 'Reload current web page' },
    { key: 'Ctrl + L', desc: 'Focus address / omnibar search' },
    { key: 'Ctrl + H', desc: 'Open browsing history manager' },
    { key: 'Ctrl + B', desc: 'Open bookmarks manager' },
    { key: 'Alt + Left', desc: 'Navigate back in tab history' },
    { key: 'Alt + Right', desc: 'Navigate forward in tab history' },
    { key: 'Esc', desc: 'Close modal dialogs or clear omnibox' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <span>Aksh Browser Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <span className="text-slate-700 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-800 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">Esc</kbd> anytime to close this cheat sheet.
        </div>
      </div>
    </div>
  );
};
