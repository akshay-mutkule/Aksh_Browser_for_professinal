import React from 'react';
import { Settings, Shield, Sparkles, Moon, Sun, Monitor, Search, Keyboard, RefreshCw, Cpu, Database } from 'lucide-react';
import { BrowserSettings } from '../../types';

interface SettingsViewProps {
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onClearAllLocalData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllLocalData,
}) => {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Browser & AI Settings</h1>
            <p className="text-xs text-slate-500">Configure Aksh AI assistant, default engine, shortcuts, and privacy</p>
          </div>
        </div>

        {/* AI Co-Pilot Preferences */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Co-Pilot & Synthesis Engine</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <div className="font-semibold text-slate-900">Default Summarization Mode</div>
                <div className="text-slate-500">Choose preferred summary format for web pages and PDFs</div>
              </div>
              <select
                value={settings.aiSummaryLength}
                onChange={(e) =>
                  onUpdateSettings({
                    aiSummaryLength: e.target.value as any,
                  })
                }
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="short">Short (3-5 Bullet TL;DR)</option>
                <option value="detailed">Structured & Detailed</option>
                <option value="beginner">Beginner ELI5 Mode</option>
                <option value="technical">Technical In-Depth</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <div className="font-semibold text-slate-900">AI Model Backend</div>
                <div className="text-slate-500">High-throughput reasoning model powering web synthesis</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
                Gemini 3.7 Flash
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold text-slate-900">Automatic Web Context Attachment</div>
                <div className="text-slate-500">Inject visible web page context automatically into AI questions</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAttachWebContext}
                onChange={(e) =>
                  onUpdateSettings({
                    autoAttachWebContext: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Search & Engine Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Search className="w-4 h-4 text-blue-600" />
            <span>Search Engine & Navigation</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold text-slate-900">Default Search Provider</div>
                <div className="text-slate-500">Used when typing standard queries into the address bar</div>
              </div>
              <select
                value={settings.searchEngine}
                onChange={(e) =>
                  onUpdateSettings({
                    searchEngine: e.target.value as any,
                  })
                }
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
              >
                <option value="google">Google Search</option>
                <option value="duckduckgo">DuckDuckGo (Privacy)</option>
                <option value="bing">Microsoft Bing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Keyboard className="w-4 h-4 text-amber-600" />
            <span>Browser Keyboard Shortcuts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">Toggle Aksh AI Co-Pilot</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-amber-700 font-bold shadow-2xs">
                Ctrl + K
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">New Browser Tab</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-700 font-bold shadow-2xs">
                Ctrl + T
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">Close Active Tab</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-700 font-bold shadow-2xs">
                Ctrl + W
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">Reload Current Page</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-700 font-bold shadow-2xs">
                Ctrl + R
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">Focus Address Bar</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-700 font-bold shadow-2xs">
                Ctrl + L
              </kbd>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">Browsing History</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] text-slate-700 font-bold shadow-2xs">
                Ctrl + H
              </kbd>
            </div>
          </div>
        </div>

        {/* Data & Privacy Reset */}
        <div className="p-6 rounded-2xl bg-white border border-rose-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
            <Shield className="w-4 h-4" />
            <span>Privacy & Storage Reset</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-900">Reset Local Storage & Session Data</div>
              <div className="text-slate-500">Deletes all saved tabs, history records, and custom notes</div>
            </div>
            <button
              onClick={onClearAllLocalData}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors cursor-pointer"
            >
              Reset Browser Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
