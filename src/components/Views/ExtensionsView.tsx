import React, { useState } from 'react';
import {
  Puzzle,
  Search,
  Check,
  Plus,
  Trash2,
  Settings,
  Shield,
  Star,
  Download,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  Moon,
  ShieldCheck,
  Languages,
  Pipette,
  KeyRound,
  Zap,
  FileText,
  Palette,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { BrowserExtension } from '../../types';

interface ExtensionsViewProps {
  extensions: BrowserExtension[];
  storeExtensions: BrowserExtension[];
  onToggleExtension: (id: string) => void;
  onInstallExtension: (ext: BrowserExtension) => void;
  onUninstallExtension: (id: string) => void;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({
  extensions,
  storeExtensions,
  onToggleExtension,
  onInstallExtension,
  onUninstallExtension,
}) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [developerMode, setDeveloperMode] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon':
        return <Moon className="w-5 h-5 text-indigo-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-blue-600" />;
      case 'Pipette':
        return <Pipette className="w-5 h-5 text-pink-600" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-cyan-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'KeyRound':
        return <KeyRound className="w-5 h-5 text-rose-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-sky-600" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-teal-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-violet-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <Puzzle className="w-5 h-5 text-indigo-500" />;
    }
  };

  const filteredInstalled = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ext.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredStore = storeExtensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ext.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = [
    { id: 'all', label: 'All Extensions' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'developer', label: 'Developer Tools' },
    { id: 'ai', label: 'AI Superchargers' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 p-6 md:p-10 select-text">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Extensions & Add-on Hub</h1>
              <p className="text-xs text-slate-500">
                Supercharge your browser with powerful tools, privacy shields, and developer utilities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <input
                type="checkbox"
                checked={developerMode}
                onChange={(e) => setDeveloperMode(e.target.checked)}
                className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
              />
              <span>Developer Mode</span>
            </label>

            {/* Tab switch */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setActiveTab('installed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'installed'
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Installed ({extensions.length})
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'store'
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Store / Discover
              </button>
            </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search extensions by name, capability, or tag..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Developer Mode Banner */}
        {developerMode && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Developer Mode Active:</strong> You can inspect background service workers, load unpacked extensions, and update manifests.
              </span>
            </div>
            <button
              onClick={() => alert('Unpacked extension manifest loader ready in Aksh DevTools.')}
              className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-800 hover:bg-amber-100 font-semibold cursor-pointer shadow-2xs"
            >
              Load Unpacked
            </button>
          </div>
        )}

        {/* Installed Extensions List */}
        {activeTab === 'installed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInstalled.map((ext) => (
              <div
                key={ext.id}
                className={`p-5 rounded-2xl border transition-all duration-150 bg-white ${
                  ext.enabled
                    ? 'border-slate-200 shadow-xs'
                    : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                      {getIcon(ext.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{ext.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          v{ext.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ext.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={ext.enabled}
                      onChange={() => onToggleExtension(ext.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-medium text-slate-600">{ext.category}</span>
                    <span>•</span>
                    <span>By {ext.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ext.actionLabel && ext.enabled && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-100">
                        {ext.actionLabel}
                      </span>
                    )}
                    <button
                      onClick={() => onUninstallExtension(ext.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Uninstall Extension"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {developerMode && ext.permissions && ext.permissions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Permissions: </span>
                    {ext.permissions.join(', ')}
                  </div>
                )}
              </div>
            ))}

            {filteredInstalled.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <Puzzle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold">No installed extensions matched your filter.</p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                >
                  Explore Extension Store
                </button>
              </div>
            )}
          </div>
        )}

        {/* Extension Store / Discovery Tab */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-indigo-950">Official Aksh Extension Store</h3>
                <p className="text-xs text-indigo-700/80">
                  All add-ons are sandboxed, memory-profiled, and pre-verified for maximum security and zero battery drain.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-white rounded-lg text-indigo-800 text-[11px] font-bold shadow-2xs border border-indigo-200">
                Verified Safe
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStore.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                          {getIcon(item.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              v{item.version}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-400" />
                        <span>{item.installs} users</span>
                      </div>
                      <span>•</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">By {item.author}</span>
                    <button
                      onClick={() => onInstallExtension(item)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Browser</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredStore.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  <p>All featured store extensions are already installed!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
