import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Shield,
  Sparkles,
  Moon,
  Sun,
  Search,
  Keyboard,
  Cpu,
  Palette,
  Layout,
  Volume2,
  ShieldCheck,
  Zap,
  Download,
  Upload,
  Trash2,
  Globe,
  Sliders,
  HardDrive,
  Check,
  RotateCcw,
  Layers,
  Lock,
  Wifi,
  Activity,
  Code2,
  BookOpen,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { BrowserSettings } from '../../types';

interface SettingsViewProps {
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onClearAllLocalData: () => void;
  historyCount?: number;
  bookmarksCount?: number;
  notesCount?: number;
  readingListCount?: number;
  tabsCount?: number;
  onExportAllData?: () => void;
  onImportAllData?: (jsonData: any) => void;
  onClearHistory?: () => void;
}

type SettingsSection =
  | 'appearance'
  | 'ai'
  | 'privacy'
  | 'performance'
  | 'network'
  | 'accessibility'
  | 'shortcuts'
  | 'data';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllLocalData,
  historyCount = 0,
  bookmarksCount = 0,
  notesCount = 0,
  readingListCount = 0,
  tabsCount = 1,
  onExportAllData,
  onImportAllData,
  onClearHistory,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [shortcutFilter, setShortcutFilter] = useState('');

  const navItems: { id: SettingsSection; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
    { id: 'ai', label: 'AI Engine & Reasoning', icon: Sparkles, badge: 'Gemini 3.7' },
    { id: 'privacy', label: 'Privacy & Security Shields', icon: ShieldCheck, badge: 'Protected' },
    { id: 'performance', label: 'Performance & Power', icon: Cpu },
    { id: 'network', label: 'Search & Networking', icon: Search },
    { id: 'accessibility', label: 'Audio & Accessibility', icon: Volume2 },
    { id: 'shortcuts', label: 'Keyboard & Vim Keys', icon: Keyboard },
    { id: 'data', label: 'Data, Backup & Reset', icon: HardDrive },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (onImportAllData) {
          onImportAllData(parsed);
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        }
      } catch (err) {
        console.error('Failed to parse backup JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleDefaultExport = () => {
    if (onExportAllData) {
      onExportAllData();
      return;
    }
    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aksh-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Shortcuts catalog
  const shortcutsList = [
    { key: 'Ctrl + K / Cmd + K', action: 'Open Universal Command Palette & Search' },
    { key: 'Ctrl + J / Cmd + J', action: 'Toggle Aksh Gemini AI Co-Pilot Sidebar' },
    { key: 'Ctrl + T / Cmd + T', action: 'Open New Browser Tab' },
    { key: 'Ctrl + W / Cmd + W', action: 'Close Active Browser Tab' },
    { key: 'Ctrl + R / Cmd + R', action: 'Reload Active Webpage' },
    { key: 'Ctrl + L / Cmd + L', action: 'Focus Address Bar / Omnibox' },
    { key: 'Ctrl + F / Cmd + F', action: 'In-Page Text Find with Match Highlighter' },
    { key: 'Ctrl + H / Cmd + H', action: 'Open Browsing History Studio' },
    { key: 'Ctrl + B / Cmd + B', action: 'Open Bookmarks Manager' },
    { key: 'Ctrl + M / Cmd + M', action: 'Generate AI Knowledge Mindmap from Active Page' },
    { key: 'F12 / Ctrl+Shift+I', action: 'Toggle Inspect & Network Developer Tools' },
    { key: '?', action: 'Show Interactive Keyboard Shortcuts Modal' },
    { key: 'Escape', action: 'Dismiss Modals, Menus, or Selection AI HUD' },
  ];

  const filteredShortcuts = shortcutsList.filter(
    (s) =>
      s.key.toLowerCase().includes(shortcutFilter.toLowerCase()) ||
      s.action.toLowerCase().includes(shortcutFilter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 text-slate-900 select-text overflow-hidden">
      {/* Settings Left Navigation Sidebar */}
      <div className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Browser Settings</h2>
            <p className="text-[11px] text-slate-500">System Preferences & AI</p>
          </div>
        </div>

        {/* Section Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-900 font-bold shadow-2xs border border-indigo-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive ? 'bg-indigo-200/70 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Version Footer */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Aksh AI Engine v3.7</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online & Grounded" />
        </div>
      </div>

      {/* Settings Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
          {/* ================= APPEARANCE & THEMES ================= */}
          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <span>Appearance & Themes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the browser layout, color palette, tab density, and typography.
                </p>
              </div>

              {/* Theme Palette Chooser */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Color Palette Theme</h3>
                    <p className="text-xs text-slate-500">Select visual styling for chrome, tabs, and navigation</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                    {settings.theme}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { id: 'light', label: 'Clean Slate Light', desc: 'Minimalist white & slate', bg: 'bg-slate-50', border: 'border-slate-300' },
                    { id: 'dark', label: 'Midnight Dark', desc: 'Deep slate-900 background', bg: 'bg-slate-900 text-white', border: 'border-slate-700' },
                    { id: 'cyber', label: 'Cyberpunk Neon', desc: 'Vibrant indigo & violet glow', bg: 'bg-indigo-950 text-indigo-200', border: 'border-indigo-500' },
                    { id: 'solarized', label: 'Warm Solarized', desc: 'Amber paper sepia warmth', bg: 'bg-amber-50 text-amber-900', border: 'border-amber-300' },
                    { id: 'nord', label: 'Arctic Nord', desc: 'Cool arctic frost blue-gray', bg: 'bg-slate-800 text-sky-200', border: 'border-sky-700' },
                    { id: 'oled', label: 'Pure OLED Pitch', desc: 'Absolute true black #000000', bg: 'bg-black text-emerald-400', border: 'border-neutral-800' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${t.bg} ${
                        settings.theme === t.id
                          ? 'ring-2 ring-indigo-500 shadow-md font-bold scale-[1.02]'
                          : 'hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{t.label}</span>
                        {settings.theme === t.id && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />}
                      </div>
                      <span className="text-[10px] opacity-75">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Strip Layout & UI Density */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Tab Strip Placement & Density</h3>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Tab Layout Format</div>
                    <div className="text-slate-500">Traditional top tab strip vs. modern Arc-style vertical sidebar</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateSettings({ tabLayout: 'horizontal' })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        settings.tabLayout !== 'vertical'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Top Horizontal
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ tabLayout: 'vertical' })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        settings.tabLayout === 'vertical'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Arc Vertical
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Bookmarks Toolbar</div>
                    <div className="text-slate-500">Show persistent bookmarks bar beneath the Omnibox</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showBookmarksBar !== false}
                    onChange={(e) => onUpdateSettings({ showBookmarksBar: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Compact Density Mode</div>
                    <div className="text-slate-500">Reduces padding across toolbars to maximize screen space</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings.compactMode}
                    onChange={(e) => onUpdateSettings({ compactMode: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Default New Tab Experience</div>
                    <div className="text-slate-500">Page displayed when opening a fresh browser tab</div>
                  </div>
                  <select
                    value={settings.defaultNewTabPage || 'speed_dial'}
                    onChange={(e) => onUpdateSettings({ defaultNewTabPage: e.target.value as any })}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                  >
                    <option value="speed_dial">Speed Dial & Quick Access</option>
                    <option value="ai_research">AI Deep Research Hub</option>
                    <option value="blank">Minimal Blank Zen</option>
                  </select>
                </div>
              </div>

              {/* Font Scale & UI Zoom */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Global Zoom & Typography Scale</h3>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Interface Zoom Level</div>
                    <div className="text-slate-500">Current display zoom: {settings.zoomLevel || 100}%</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[80, 90, 100, 110, 125, 150].map((z) => (
                      <button
                        key={z}
                        onClick={() => onUpdateSettings({ zoomLevel: z })}
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                          (settings.zoomLevel || 100) === z
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {z}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= AI INTELLIGENCE & REASONING ================= */}
          {activeSection === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>AI Engine & Reasoning Co-Pilot</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the Gemini multimodal reasoning backend, personas, summarization, and temperature.
                </p>
              </div>

              {/* Foundation Model Selection */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Active Gemini Foundation Model</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'gemini-3.7-flash',
                      name: 'Gemini 3.7 Flash',
                      badge: 'Recommended',
                      desc: 'Hybrid adaptive reasoning engine with instant web synthesis & deep thought mode.',
                    },
                    {
                      id: 'gemini-2.5-pro',
                      name: 'Gemini 2.5 Pro',
                      badge: 'Maximum Depth',
                      desc: 'Heavy-duty complex analytical reasoning, multi-document synthesis & long context.',
                    },
                    {
                      id: 'gemini-2.5-flash',
                      name: 'Gemini 2.5 Flash',
                      badge: 'Ultra Fast',
                      desc: 'Lowest latency, ideal for rapid inline Q&A and instant text conversions.',
                    },
                  ].map((m) => {
                    const isSelected = (settings.aiModel || 'gemini-3.7-flash') === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onUpdateSettings({ aiModel: m.id as any })}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{m.name}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active Reasoning Model</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Persona & System Stance */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">AI Assistant Persona & Tone</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {[
                    { id: 'default', label: 'Polymath General', desc: 'Balanced, helpful & articulate' },
                    { id: 'coder', label: 'Senior Architect', desc: 'Code-first, trade-offs, architecture' },
                    { id: 'academic', label: 'Peer Reviewer', desc: 'Rigorous citations & methodology' },
                    { id: 'executive', label: 'Executive Brief', desc: 'High-level ROI, bullets & decisions' },
                  ].map((p) => {
                    const isSelected = (settings.aiPersona || 'default') === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onUpdateSettings({ aiPersona: p.id as any })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs">{p.label}</div>
                        <div className="text-[10px] opacity-75">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Persona Textarea */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Custom System Instructions (Optional Override)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Always format responses with actionable engineering steps and mention security implications..."
                    value={settings.customAiPersonaPrompt || ''}
                    onChange={(e) => onUpdateSettings({ customAiPersonaPrompt: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Synthesis & Context Pipeline */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Context Injection & Summarization</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Default Summarization Format</div>
                      <div className="text-slate-500">Length and structural density for web pages and PDFs</div>
                    </div>
                    <select
                      value={settings.aiSummaryLength}
                      onChange={(e) => onUpdateSettings({ aiSummaryLength: e.target.value as any })}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                    >
                      <option value="short">Short (3-5 Bullet TL;DR)</option>
                      <option value="detailed">Detailed & Structured Analysis</option>
                      <option value="beginner">Beginner ELI5 Mode</option>
                      <option value="technical">Technical In-Depth with Code</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Automatic Web Context Injection</div>
                      <div className="text-slate-500">Inject visible web page DOM context into sidebar questions automatically</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoAttachWebContext}
                      onChange={(e) => onUpdateSettings({ autoAttachWebContext: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Proactive Long-Page Summaries</div>
                      <div className="text-slate-500">Automatically prepare executive bullet notes for articles over 1,500 words</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settings.aiAutoSummarizeLongPages}
                      onChange={(e) => onUpdateSettings({ aiAutoSummarizeLongPages: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-slate-900">Stream Token Responses</div>
                      <div className="text-slate-500">Render AI tokens in real-time as they are synthesized</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.aiStreamResponses !== false}
                      onChange={(e) => onUpdateSettings({ aiStreamResponses: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Temperature & Creativity</h3>
                    <p className="text-xs text-slate-500">Current value: {settings.aiTemperature ?? 0.3}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {(settings.aiTemperature ?? 0.3) < 0.3
                      ? 'Deterministic & Precise'
                      : (settings.aiTemperature ?? 0.3) <= 0.7
                      ? 'Balanced'
                      : 'Creative & Speculative'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={settings.aiTemperature ?? 0.3}
                  onChange={(e) => onUpdateSettings({ aiTemperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.0 (Factual / Code)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative Fiction)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PRIVACY & SHIELDS ================= */}
          {activeSection === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Privacy, Security & Shield Protection</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enforce browser-level tracker blocking, canvas fingerprint resistance, and HTTPS enforcement.
                </p>
              </div>

              {/* Shield Protection Level */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Aksh Shield Engine</h3>
                    <p className="text-xs text-slate-500">Block telemetry beacons, intrusive banners, and cross-site cookies</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Active Shield</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { id: 'standard', label: 'Standard Shield', desc: 'Blocks known trackers & ads without breaking sites' },
                    { id: 'aggressive', label: 'Aggressive Shield', desc: 'Strict third-party blocking, script audits & cookie isolation' },
                    { id: 'off', label: 'Disabled', desc: 'Allow all network requests & scripts' },
                  ].map((s) => {
                    const isSelected = (settings.shieldAggressiveness || 'standard') === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onUpdateSettings({ shieldAggressiveness: s.id as any })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs ring-2 ring-emerald-300/30'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{s.label}</div>
                        <div className="text-[10px] opacity-75">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Privacy Toggles */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Advanced Anti-Tracking Controls</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Canvas & Audio Fingerprinting Resistance</div>
                      <div className="text-slate-500">Injects minute, imperceptible noise to defeat browser canvas hardware fingerprinting</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.fingerprintProtection !== false}
                      onChange={(e) => onUpdateSettings({ fingerprintProtection: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">HTTPS-Only Enforcement</div>
                      <div className="text-slate-500">Automatically upgrades all insecure HTTP links to encrypted HTTPS connections</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.httpsOnlyMode !== false}
                      onChange={(e) => onUpdateSettings({ httpsOnlyMode: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Block Third-Party Cookies</div>
                      <div className="text-slate-500">Prevent advertising networks from tracking browsing activity across distinct origins</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.blockThirdPartyCookies !== false}
                      onChange={(e) => onUpdateSettings({ blockThirdPartyCookies: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">WebRTC Local IP Leak Protection</div>
                      <div className="text-slate-500">Hides internal LAN IP addresses during peer-to-peer WebRTC video or data calls</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.webrtcProtection !== false}
                      onChange={(e) => onUpdateSettings({ webrtcProtection: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-slate-900">Clear Cache & Cookies on Close</div>
                      <div className="text-slate-500">Automatically erase ephemeral session tokens and web storage when the browser terminates</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settings.clearOnExit}
                      onChange={(e) => onUpdateSettings({ clearOnExit: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Live Shield Metrics Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-200 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-emerald-800">142</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Trackers Intercepted</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-800">3.8 MB</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Bandwidth Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-800">100%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Origin Isolation</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PERFORMANCE & POWER ================= */}
          {activeSection === 'performance' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-600" />
                  <span>Performance, Memory & Battery Saver</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Optimize RAM consumption, sleep background tabs, and manage GPU hardware acceleration.
                </p>
              </div>

              {/* Memory Saver Mode */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Memory Saver (Eco Mode)</h3>
                    <p className="text-xs text-slate-500">Automatically hibernate inactive background tabs to liberate RAM for active tasks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.memorySaverEnabled !== false}
                    onChange={(e) => onUpdateSettings({ memorySaverEnabled: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Tab Inactivity Sleep Threshold</div>
                    <div className="text-slate-500">Hibernate tabs after period of non-interaction</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { val: 15, label: '15m' },
                      { val: 30, label: '30m' },
                      { val: 60, label: '1h' },
                      { val: 120, label: '2h' },
                      { val: 0, label: 'Never' },
                    ].map((t) => (
                      <button
                        key={t.val}
                        onClick={() => onUpdateSettings({ tabSleepTimeoutMinutes: t.val })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          (settings.tabSleepTimeoutMinutes ?? 30) === t.val
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hardware Acceleration & Data Saver */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">GPU & Network Acceleration</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Hardware Acceleration Pipeline</div>
                      <div className="text-slate-500">Use GPU acceleration for smooth compositing, CSS transforms, and video rendering</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.hardwareAcceleration !== false}
                      onChange={(e) => onUpdateSettings({ hardwareAcceleration: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-slate-900">Low-Bandwidth Data Saver Mode</div>
                      <div className="text-slate-500">Defer heavy images and videos on metered cellular connections</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settings.dataSaverMode}
                      onChange={(e) => onUpdateSettings({ dataSaverMode: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SEARCH & NETWORKING ================= */}
          {activeSection === 'network' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>Search Engine & Networking</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage search providers, DNS-over-HTTPS (DoH) resolution, and custom omnibox templates.
                </p>
              </div>

              {/* Search Provider */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Default Search Provider</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { id: 'google', label: 'Google Search', icon: '🌐' },
                    { id: 'duckduckgo', label: 'DuckDuckGo (Privacy)', icon: '🦆' },
                    { id: 'bing', label: 'Microsoft Bing', icon: '🟦' },
                    { id: 'ai', label: 'Gemini AI Deep Search', icon: '✨' },
                    { id: 'kagi', label: 'Kagi Premium Search', icon: '🔍' },
                    { id: 'perplexity', label: 'Perplexity AI', icon: '🔮' },
                  ].map((engine) => {
                    const isSelected = settings.searchEngine === engine.id;
                    return (
                      <button
                        key={engine.id}
                        onClick={() => onUpdateSettings({ searchEngine: engine.id as any })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{engine.icon}</span>
                        <span className="text-xs">{engine.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DNS-over-HTTPS & User-Agent */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Encrypted DNS (DoH) Resolver</h3>

                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">DNS Provider</div>
                    <div className="text-slate-500">Encrypts domain resolution requests to prevent ISP eavesdropping</div>
                  </div>
                  <select
                    value={settings.dnsProvider || 'system'}
                    onChange={(e) => onUpdateSettings({ dnsProvider: e.target.value as any })}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="system">System Default</option>
                    <option value="cloudflare">Cloudflare (1.1.1.1)</option>
                    <option value="google">Google Public DNS (8.8.8.8)</option>
                    <option value="quad9">Quad9 Secure (9.9.9.9)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs py-2">
                  <div>
                    <div className="font-semibold text-slate-900">User-Agent Identity Spoofing</div>
                    <div className="text-slate-500">Report custom browser client string to test site responsiveness</div>
                  </div>
                  <select
                    value={settings.userAgentPreset || 'default'}
                    onChange={(e) => onUpdateSettings({ userAgentPreset: e.target.value as any })}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="default">Default (Aksh Chromium 128)</option>
                    <option value="safari">Apple Safari (macOS)</option>
                    <option value="firefox">Mozilla Firefox (Linux)</option>
                    <option value="mobile">Apple iPhone (iOS Safari)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= AUDIO & ACCESSIBILITY ================= */}
          {activeSection === 'accessibility' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  <span>Audio, Speech & Accessibility</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust text-to-speech narration speed, pitch, and accessible readability features.
                </p>
              </div>

              {/* Speech Narration Rate */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">AI Speech Read-Aloud Speed</h3>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Narration Playback Rate</div>
                    <div className="text-slate-500">Speed multiplier for in-page voice reading</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => onUpdateSettings({ voiceSpeed: s })}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                          (settings.voiceSpeed || 1.0) === s
                            ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dyslexic & Readability Options */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Readability & Visual Accessibility</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Dyslexic-Friendly Typography</div>
                      <div className="text-slate-500">Increases letter-spacing and weighted character bases to reduce reading fatigue</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settings.dyslexicFont}
                      onChange={(e) => onUpdateSettings({ dyslexicFont: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-slate-900">Preferred Language Output</div>
                      <div className="text-slate-500">AI responses and translations default language</div>
                    </div>
                    <select
                      value={settings.preferredLanguage || 'en'}
                      onChange={(e) => onUpdateSettings({ preferredLanguage: e.target.value })}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語 (Japanese)</option>
                      <option value="zh">中文 (Chinese)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SHORTCUTS & VIM ================= */}
          {activeSection === 'shortcuts' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-amber-600" />
                  <span>Keyboard Shortcuts & Vim Keybindings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Master lightning-fast browser control with hotkeys and modal navigation.
                </p>
              </div>

              {/* Vim Navigation Mode Toggle */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Vim-Style Navigation Mode</h3>
                    <p className="text-xs text-slate-500">
                      Use <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] font-mono">j</kbd> /{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] font-mono">k</kbd> to scroll,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] font-mono">t</kbd> for new tab,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] font-mono">d</kbd> to close tab
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings.vimKeybindings}
                    onChange={(e) => onUpdateSettings({ vimKeybindings: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Searchable Hotkeys Table */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-900">System Hotkey Reference</h3>
                  <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={shortcutFilter}
                    onChange={(e) => setShortcutFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-48 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {filteredShortcuts.map((s, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{s.action}</span>
                      <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 font-mono text-[11px] text-slate-800 font-bold shadow-2xs">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= DATA, BACKUP & RESET ================= */}
          {activeSection === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-rose-600" />
                  <span>Data Diagnostics, Backup & Factory Reset</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Export complete snapshots of your browser workspace, restore backups, or selectively purge data.
                </p>
              </div>

              {/* Live Storage Metrics Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Active Storage Diagnostics</h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xl font-extrabold text-slate-900">{tabsCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Open Tabs</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xl font-extrabold text-slate-900">{bookmarksCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Bookmarks</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xl font-extrabold text-slate-900">{notesCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">AI Notes</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xl font-extrabold text-slate-900">{historyCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">History Items</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xl font-extrabold text-slate-900">{readingListCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Reading List</div>
                  </div>
                </div>
              </div>

              {/* JSON Backup & Restore Studio */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Workspace Backup & Restore</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-indigo-600" />
                        <span>Export Full Browser Snapshot</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Generates a portable JSON archive containing bookmarks, AI notes, reading list, history, and all custom preferences.
                      </p>
                    </div>

                    <button
                      onClick={handleDefaultExport}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Restore from JSON Archive</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Load a previously exported .json configuration to instantly restore your tabs, notes, and custom settings.
                      </p>
                    </div>

                    <label className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{importSuccess ? 'Restored Successfully!' : 'Select Backup File'}</span>
                      <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Granular Purge & Factory Reset */}
              <div className="p-6 rounded-3xl bg-white border border-rose-200 space-y-5 shadow-xs">
                <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Purge Data & Factory Reset</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {onClearHistory && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <div className="font-semibold text-slate-900">Clear Browsing History</div>
                        <div className="text-slate-500">Removes all past visited URLs and navigation timestamps</div>
                      </div>
                      <button
                        onClick={onClearHistory}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200"
                      >
                        Clear History ({historyCount})
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-rose-700">Factory Reset Browser State</div>
                      <div className="text-slate-500">Deletes all saved tabs, AI notes, history records, and resets preferences to default</div>
                    </div>

                    {showResetConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClearAllLocalData();
                            setShowResetConfirm(false);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer text-xs"
                        >
                          Yes, Reset All
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Factory Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
