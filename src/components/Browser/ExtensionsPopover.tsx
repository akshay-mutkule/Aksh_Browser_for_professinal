import React, { useRef, useEffect } from 'react';
import {
  Puzzle,
  Settings,
  ExternalLink,
  Moon,
  ShieldCheck,
  Code2,
  Pipette,
  Languages,
  Sparkles,
  KeyRound,
  Zap,
  Check
} from 'lucide-react';
import { BrowserExtension } from '../../types';

interface ExtensionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  extensions: BrowserExtension[];
  onToggleExtension: (id: string) => void;
  onOpenExtensionsManager: () => void;
  onTriggerExtensionAction?: (extId: string) => void;
}

export const ExtensionsPopover: React.FC<ExtensionsPopoverProps> = ({
  isOpen,
  onClose,
  extensions,
  onToggleExtension,
  onOpenExtensionsManager,
  onTriggerExtensionAction,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Code2':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'Pipette':
        return <Pipette className="w-4 h-4 text-pink-600" />;
      case 'Languages':
        return <Languages className="w-4 h-4 text-cyan-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'KeyRound':
        return <KeyRound className="w-4 h-4 text-rose-600" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Puzzle className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
            <Puzzle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Active Extensions</div>
            <div className="text-[10px] text-slate-500">
              {extensions.filter((e) => e.enabled).length} of {extensions.length} active
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenExtensionsManager();
          }}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Manage Extensions & Store"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Extension Items */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
        {extensions.map((ext) => (
          <div
            key={ext.id}
            className={`p-2.5 rounded-xl transition-colors flex items-center justify-between gap-3 ${
              ext.enabled ? 'hover:bg-slate-50' : 'opacity-50 hover:bg-slate-50/50'
            }`}
          >
            <div
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              onClick={() => onTriggerExtensionAction && onTriggerExtensionAction(ext.id)}
            >
              <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                {getIcon(ext.icon)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                  <span className="truncate">{ext.name}</span>
                </div>
                {ext.actionLabel && ext.enabled ? (
                  <div className="text-[10px] text-indigo-600 font-medium">
                    {ext.actionLabel}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 capitalize">{ext.category}</div>
                )}
              </div>
            </div>

            {/* Toggle checkbox */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={ext.enabled}
                onChange={() => onToggleExtension(ext.id)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Need more tools?</span>
        <button
          onClick={() => {
            onClose();
            onOpenExtensionsManager();
          }}
          className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Open Extension Store</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
