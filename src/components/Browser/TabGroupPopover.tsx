import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Palette,
  Edit2,
  Trash2,
  Bookmark,
  Check,
  Layers,
  FileText
} from 'lucide-react';
import { Tab } from '../../types';

interface TabGroupPopoverProps {
  groupName: string;
  groupColor: string;
  tabsInGroup: Tab[];
  position: { x: number; y: number };
  onClose: () => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onChangeColor: (groupName: string, color: string) => void;
  onCloseAllInGroup: (groupName: string) => void;
  onSynthesizeGroup: (groupName: string, tabs: Tab[]) => void;
  onSaveGroupAsNotes?: (groupName: string, tabs: Tab[]) => void;
}

const PRESET_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Slate', value: '#475569' },
];

export const TabGroupPopover: React.FC<TabGroupPopoverProps> = ({
  groupName,
  groupColor,
  tabsInGroup,
  position,
  onClose,
  onRenameGroup,
  onChangeColor,
  onCloseAllInGroup,
  onSynthesizeGroup,
  onSaveGroupAsNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(groupName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onRenameGroup(groupName, nameInput.trim());
    setIsEditing(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/10" onClick={onClose} />

      {/* Popover Card */}
      <div
        style={{
          top: Math.min(position.y + 8, window.innerHeight - 340),
          left: Math.min(position.x, window.innerWidth - 300),
        }}
        className="fixed z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none text-slate-800"
      >
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: groupColor || '#3b82f6' }}
            />
            {isEditing ? (
              <form onSubmit={handleSaveName} className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  className="w-full text-xs font-bold px-2 py-1 rounded border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-slate-900 truncate">{groupName}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title="Rename group"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {tabsInGroup.length} {tabsInGroup.length === 1 ? 'tab' : 'tabs'}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Palette Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Palette className="w-3 h-3" />
            <span>Workspace Color</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map((c) => {
              const isSelected = groupColor.toLowerCase() === c.value.toLowerCase();
              return (
                <button
                  key={c.value}
                  onClick={() => onChangeColor(groupName, c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer relative ${
                    isSelected ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          {/* AI Cross-Tab Group Synthesis */}
          <button
            onClick={() => {
              onSynthesizeGroup(groupName, tabsInGroup);
              onClose();
            }}
            disabled={tabsInGroup.length < 2}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Synthesize All Tabs</span>
            </div>
            <span className="text-[10px] text-indigo-500 font-mono">Gemini</span>
          </button>

          {/* Save Group to Notes */}
          {onSaveGroupAsNotes && (
            <button
              onClick={() => {
                onSaveGroupAsNotes(groupName, tabsInGroup);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Export Group Overview to AI Notes</span>
            </button>
          )}

          {/* Close Group Tabs */}
          <button
            onClick={() => {
              onCloseAllInGroup(groupName);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Close All {tabsInGroup.length} Tabs in Group</span>
          </button>
        </div>
      </div>
    </>
  );
};
