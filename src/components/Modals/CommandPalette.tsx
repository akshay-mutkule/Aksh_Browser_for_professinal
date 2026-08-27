import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Zap,
  Sparkles,
  Columns,
  Code2,
  Volume2,
  FileText,
  Scale,
  StickyNote,
  Bookmark,
  History,
  Download,
  Settings,
  ArrowRight,
  Globe,
  Network,
  Maximize2,
  Trash2,
  Cpu
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onNavigateTab: (tabId: string, url: string) => void;
  onOpenNewTab: (url?: string) => void;
  onToggleSplitScreen: () => void;
  onOpenAiSidebar: () => void;
  onToggleReaderMode: () => void;
  onTriggerSpeech: () => void;
  onOpenInternalView: (view: PageContentType) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onNavigateTab,
  onOpenNewTab,
  onToggleSplitScreen,
  onOpenAiSidebar,
  onToggleReaderMode,
  onTriggerSpeech,
  onOpenInternalView,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Define commands
  const allCommands = [
    // AI Actions
    {
      id: 'ai-sidebar',
      title: 'Open Aksh AI Co-Pilot',
      subtitle: 'Context-aware chat and synthesis with Gemini 3.7 Flash',
      category: 'AI Tools',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      action: () => {
        onOpenAiSidebar();
        onClose();
      },
    },
    {
      id: 'ai-research',
      title: 'Launch AI Deep Research Mode',
      subtitle: 'Multi-source autonomous query synthesis with live web citations',
      category: 'AI Tools',
      icon: Zap,
      iconColor: 'text-amber-400',
      action: () => {
        onOpenNewTab('aksh://research');
        onClose();
      },
    },
    {
      id: 'ai-mindmap',
      title: 'Generate Concept Mindmap & Knowledge Graph',
      subtitle: 'Convert current topic into an interactive visual graph',
      category: 'AI Tools',
      icon: Network,
      iconColor: 'text-cyan-400',
      action: () => {
        const topic = activeTab?.title || 'Artificial Intelligence 2026';
        onOpenNewTab(`aksh://mindmap?topic=${encodeURIComponent(topic)}`);
        onClose();
      },
    },
    {
      id: 'ai-tts',
      title: 'Read Aloud Webpage (Text-to-Speech)',
      subtitle: 'Listen to the active page content with speech synthesis',
      category: 'AI Tools',
      icon: Volume2,
      iconColor: 'text-emerald-400',
      action: () => {
        onTriggerSpeech();
        onClose();
      },
    },
    {
      id: 'ai-devtools',
      title: 'Open AI DevTools & DOM Security Inspector',
      subtitle: 'Live network requests, DOM tree, security audit & code intelligence',
      category: 'Developer',
      icon: Code2,
      iconColor: 'text-blue-400',
      action: () => {
        onOpenNewTab('aksh://devtools');
        onClose();
      },
    },
    {
      id: 'split-screen',
      title: 'Toggle Split-Screen Multitasking (Dual-Pane)',
      subtitle: 'Browse two tabs or notes side-by-side in one window',
      category: 'Workspace',
      icon: Columns,
      iconColor: 'text-purple-400',
      action: () => {
        onToggleSplitScreen();
        onClose();
      },
    },
    {
      id: 'reader-mode',
      title: 'Toggle Distraction-Free Reader Mode',
      subtitle: 'Clean article layout stripping ads and clutter',
      category: 'Browser',
      icon: FileText,
      iconColor: 'text-slate-300',
      action: () => {
        onToggleReaderMode();
        onClose();
      },
    },
    {
      id: 'product-compare',
      title: 'AI Product Comparison & Decision Matrix',
      subtitle: 'Compare hardware specifications & benchmark ratings',
      category: 'AI Tools',
      icon: Scale,
      iconColor: 'text-pink-400',
      action: () => {
        onOpenNewTab('aksh://comparison');
        onClose();
      },
    },
    {
      id: 'notes-kb',
      title: 'Open AI Notes & Knowledge Base',
      subtitle: 'Cornell notes, saved dossiers & markdown exporter',
      category: 'Knowledge',
      icon: StickyNote,
      iconColor: 'text-yellow-400',
      action: () => {
        onOpenNewTab('aksh://notes');
        onClose();
      },
    },
    {
      id: 'view-bookmarks',
      title: 'Open Bookmarks Manager',
      subtitle: 'Organized folders, tags and saved links',
      category: 'Browser',
      icon: Bookmark,
      iconColor: 'text-amber-400',
      action: () => {
        onOpenNewTab('aksh://bookmarks');
        onClose();
      },
    },
    {
      id: 'view-history',
      title: 'Open Browsing History',
      subtitle: 'Chronological timeline of visited URLs',
      category: 'Browser',
      icon: History,
      iconColor: 'text-blue-400',
      action: () => {
        onOpenNewTab('aksh://history');
        onClose();
      },
    },
    {
      id: 'view-downloads',
      title: 'Open Downloads Manager',
      subtitle: 'Active and completed file downloads',
      category: 'Browser',
      icon: Download,
      iconColor: 'text-emerald-400',
      action: () => {
        onOpenNewTab('aksh://downloads');
        onClose();
      },
    },
    {
      id: 'view-settings',
      title: 'Open Browser Settings',
      subtitle: 'Customize AI preferences, themes & search engines',
      category: 'System',
      icon: Settings,
      iconColor: 'text-slate-400',
      action: () => {
        onOpenNewTab('aksh://settings');
        onClose();
      },
    },
  ];

  // Also include open tabs in search results
  const tabCommands = tabs.map((t) => ({
    id: `tab-${t.id}`,
    title: t.title,
    subtitle: t.url,
    category: 'Open Tabs',
    icon: Globe,
    iconColor: 'text-blue-400',
    action: () => {
      onSelectTab(t.id);
      onClose();
    },
  }));

  const allItems = [...allCommands, ...tabCommands];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        // Direct navigate or search
        onOpenNewTab(
          query.startsWith('http') || query.startsWith('aksh://')
            ? query
            : `https://www.google.com/search?q=${encodeURIComponent(query)}`
        );
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Header */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search open tabs, or ask Aksh AI..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No matching commands found</p>
              <p className="text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-400">Enter</kbd> to search Google or navigate to "{query}"
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const ItemIcon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0 ${item.iconColor}`}
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-normal">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-3">
                    {isSelected && (
                      <span className="text-[11px] font-medium text-blue-400 flex items-center gap-1">
                        <span>Execute</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-slate-800 rounded text-slate-400 font-mono">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-slate-800 rounded text-slate-400 font-mono">↵</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-slate-800 rounded text-slate-400 font-mono">esc</kbd> to dismiss
            </span>
          </div>
          <div className="font-mono text-slate-400">Aksh Spotlight Engine</div>
        </div>
      </motion.div>
    </div>
  );
};
