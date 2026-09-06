import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Layers,
  Sparkles,
  MoreHorizontal,
  Home,
  BookOpen,
  Volume2,
  Columns,
  Camera,
  Activity,
  HelpCircle,
  Bookmark,
  History,
  Download,
  Settings,
  StickyNote,
  Search,
  Network,
  Scale,
  X,
  Share2,
  RotateCw
} from 'lucide-react';
import { Tab, PageContentType } from '../../types';

interface MobileBottomNavProps {
  tabs: Tab[];
  activeTab: Tab | null;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onNewTab: () => void;
  onOpenTabsSheet: () => void;
  onToggleAiSidebar: () => void;
  isAiSidebarOpen: boolean;
  onOpenCommandPalette: () => void;
  onToggleReaderMode: () => void;
  onTriggerSpeech: () => void;
  isSpeaking: boolean;
  onOpenSnapshot?: () => void;
  onOpenPerformance?: () => void;
  onOpenTour?: () => void;
  onOpenInternalView: (view: PageContentType) => void;
  onToggleSplitScreen: () => void;
  isSplitScreen: boolean;
  onMindmapPage?: () => void;
  onExportMarkdown?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  tabs,
  activeTab,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  onNewTab,
  onOpenTabsSheet,
  onToggleAiSidebar,
  isAiSidebarOpen,
  onOpenCommandPalette,
  onToggleReaderMode,
  onTriggerSpeech,
  isSpeaking,
  onOpenSnapshot,
  onOpenPerformance,
  onOpenTour,
  onOpenInternalView,
  onToggleSplitScreen,
  isSplitScreen,
  onMindmapPage,
  onExportMarkdown,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const canGoBack = activeTab?.canGoBack ?? false;
  const canGoForward = activeTab?.canGoForward ?? false;

  return (
    <>
      {/* Mobile Drawer Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 pb-8 max-h-[80vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200"
          >
            {/* Drawer Drag Pill & Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-1 rounded-full bg-slate-300" />
              <div className="w-full flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    A
                  </div>
                  <span className="font-bold text-sm text-slate-900">Aksh Browser Tools</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Page Superpowers
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    onToggleReaderMode();
                    setIsMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center min-h-[64px] transition-all cursor-pointer ${
                    activeTab?.isReaderMode
                      ? 'bg-blue-100 text-blue-800 font-bold border border-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px]">Reader</span>
                </button>

                <button
                  onClick={() => {
                    onTriggerSpeech();
                    setIsMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center min-h-[64px] transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px]">Listen</span>
                </button>

                <button
                  onClick={() => {
                    onToggleSplitScreen();
                    setIsMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center min-h-[64px] transition-all cursor-pointer ${
                    isSplitScreen
                      ? 'bg-purple-100 text-purple-800 font-bold border border-purple-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Columns className="w-5 h-5 text-purple-600" />
                  <span className="text-[11px]">Split</span>
                </button>

                {onOpenSnapshot && (
                  <button
                    onClick={() => {
                      onOpenSnapshot();
                      setIsMenuOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex flex-col items-center gap-1.5 text-center min-h-[64px] transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-amber-600" />
                    <span className="text-[11px]">Snapshot</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Intelligence Workflows */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Autonomous AI Workflows
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    onOpenInternalView('research');
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-indigo-950 flex items-center justify-between min-h-[48px] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Deep Research Agent</div>
                      <div className="text-[10px] text-indigo-700">Autonomous multi-source synthesis</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                    Pro
                  </span>
                </button>

                {onMindmapPage && (
                  <button
                    onClick={() => {
                      onMindmapPage();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-3 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 text-cyan-950 flex items-center justify-between min-h-[48px] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Network className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Mindmap This Page</div>
                        <div className="text-[10px] text-cyan-700">Interactive concept node tree</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-200 text-cyan-900">
                      Graph
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenInternalView('comparison');
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200 text-pink-950 flex items-center justify-between min-h-[48px] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-pink-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Product Spec Matrix</div>
                      <div className="text-[10px] text-pink-700">Compare hardware side-by-side</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Navigation & Utilities */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Browser Navigation & Tools
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    onOpenInternalView('bookmarks');
                    setIsMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Bookmarks</span>
                </button>

                <button
                  onClick={() => {
                    onOpenInternalView('history');
                    setIsMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <History className="w-4 h-4 text-blue-500" />
                  <span>History</span>
                </button>

                <button
                  onClick={() => {
                    onOpenInternalView('notes');
                    setIsMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <StickyNote className="w-4 h-4 text-emerald-500" />
                  <span>AI Notes</span>
                </button>

                <button
                  onClick={() => {
                    onOpenInternalView('downloads');
                    setIsMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-500" />
                  <span>Downloads</span>
                </button>

                {onOpenPerformance && (
                  <button
                    onClick={() => {
                      onOpenPerformance();
                      setIsMenuOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>Performance HUD</span>
                  </button>
                )}

                {onOpenTour && (
                  <button
                    onClick={() => {
                      onOpenTour();
                      setIsMenuOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>User Guide & Tour</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenInternalView('settings');
                    setIsMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Settings</span>
                </button>

                {onExportMarkdown && (
                  <button
                    onClick={() => {
                      onExportMarkdown();
                      setIsMenuOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <span>Export Markdown</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Mobile Bottom Action Bar (Fixed at bottom on screens < md) */}
      <nav
        id="aksh-mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around select-none shadow-lg pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      >
        {/* Back Button */}
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className="p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-700 active:scale-95 transition-all cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Forward Button */}
        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className="p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-700 active:scale-95 transition-all cursor-pointer"
          title="Forward"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Home / New Tab Button */}
        <button
          onClick={onGoHome}
          className="p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
          title="New Tab / Home"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Tabs Switcher Sheet Button (Displays tab count e.g. [3]) */}
        <button
          onClick={onOpenTabsSheet}
          className="p-1.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer"
          title={`View Open Tabs (${tabs.length})`}
        >
          <div className="w-7 h-7 rounded-lg border-2 border-slate-800 flex items-center justify-center font-bold text-xs">
            {tabs.length}
          </div>
        </button>

        {/* AI Co-Pilot Assistant Sparkle Button */}
        <button
          onClick={onToggleAiSidebar}
          className={`p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all cursor-pointer relative ${
            isAiSidebarOpen
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
          title="Toggle Aksh AI Co-Pilot"
        >
          <Sparkles className={`w-5 h-5 ${isAiSidebarOpen ? 'text-amber-300 animate-pulse' : ''}`} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
        </button>

        {/* More Tools Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer ${
            isMenuOpen ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="Browser Menu & Tools"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </nav>
    </>
  );
};
