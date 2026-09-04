import React, { useEffect, useRef } from 'react';
import {
  Copy,
  RefreshCw,
  Pin,
  Volume2,
  VolumeX,
  Columns,
  Bookmark,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  FolderPlus
} from 'lucide-react';
import { Tab } from '../../types';

interface TabContextMenuProps {
  x: number;
  y: number;
  tab: Tab;
  onClose: () => void;
  onDuplicate: () => void;
  onReload: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onSplit: (position: 'left' | 'right') => void;
  onAssignGroup: (groupName: string, groupColor: string) => void;
  onRemoveFromGroup: () => void;
  onBookmark: () => void;
  onCloseTab: () => void;
  onCloseOtherTabs: () => void;
  onCloseTabsToRight: () => void;
}

const PRESET_GROUPS = [
  { name: 'Research', color: '#3b82f6' },
  { name: 'AI & Tools', color: '#8b5cf6' },
  { name: 'Work', color: '#10b981' },
  { name: 'Study', color: '#f59e0b' },
  { name: 'Personal', color: '#ec4899' },
];

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  x,
  y,
  tab,
  onClose,
  onDuplicate,
  onReload,
  onTogglePin,
  onToggleMute,
  onSplit,
  onAssignGroup,
  onRemoveFromGroup,
  onBookmark,
  onCloseTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so it doesn't overflow viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 340);

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* Header with Tab Title */}
      <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 truncate">
        {tab.title}
      </div>

      {/* Primary Tab Actions */}
      <button
        onClick={() => {
          onReload();
          onClose();
        }}
        className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
        <span>Reload Tab</span>
      </button>

      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
      >
        <Copy className="w-3.5 h-3.5 text-slate-500" />
        <span>Duplicate Tab</span>
      </button>

      <button
        onClick={() => {
          onTogglePin();
          onClose();
        }}
        className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
      >
        <Pin className="w-3.5 h-3.5 text-slate-500" />
        <span>{tab.pinned ? 'Unpin Tab' : 'Pin Tab'}</span>
      </button>

      <button
        onClick={() => {
          onToggleMute();
          onClose();
        }}
        className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
      >
        {tab.muted ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Unmute Tab</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <span>Mute Tab</span>
          </>
        )}
      </button>

      <button
        onClick={() => {
          onBookmark();
          onClose();
        }}
        className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
      >
        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
        <span>Bookmark This Tab</span>
      </button>

      {/* Split Screen Action */}
      <div className="border-t border-slate-100 my-1 pt-1">
        <button
          onClick={() => {
            onSplit('right');
            onClose();
          }}
          className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer text-indigo-600 font-medium"
        >
          <Columns className="w-3.5 h-3.5 text-indigo-600" />
          <span>Open in Split View</span>
        </button>
      </div>

      {/* Tab Grouping */}
      <div className="border-t border-slate-100 my-1 pt-1">
        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3 h-3" />
          <span>Tab Group</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          {PRESET_GROUPS.map((grp) => (
            <button
              key={grp.name}
              onClick={() => {
                onAssignGroup(grp.name, grp.color);
                onClose();
              }}
              className="w-4 h-4 rounded-full border border-white/60 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
              style={{ backgroundColor: grp.color }}
              title={`Add to ${grp.name}`}
            />
          ))}
          {tab.groupName && (
            <button
              onClick={() => {
                onRemoveFromGroup();
                onClose();
              }}
              className="text-[10px] text-slate-500 hover:text-rose-600 ml-1 underline cursor-pointer"
              title="Remove from group"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Close Options */}
      <div className="border-t border-slate-100 my-1 pt-1">
        <button
          onClick={() => {
            onCloseTab();
            onClose();
          }}
          className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer text-rose-600"
        >
          <X className="w-3.5 h-3.5 text-rose-500" />
          <span>Close Tab</span>
        </button>

        <button
          onClick={() => {
            onCloseOtherTabs();
            onClose();
          }}
          className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer text-slate-600"
        >
          <span>Close Other Tabs</span>
        </button>

        <button
          onClick={() => {
            onCloseTabsToRight();
            onClose();
          }}
          className="w-full px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2.5 text-left transition-colors cursor-pointer text-slate-600"
        >
          <span>Close Tabs to the Right</span>
        </button>
      </div>
    </div>
  );
};
