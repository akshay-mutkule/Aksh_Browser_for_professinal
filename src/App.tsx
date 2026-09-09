import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TitleBar } from './components/Browser/TitleBar';
import { AddressBar } from './components/Browser/AddressBar';
import { BookmarksBar } from './components/Browser/BookmarksBar';
import { AISidebar } from './components/AI/AISidebar';
import { NewTab } from './components/Views/NewTab';
import { LiveWebView } from './components/Views/LiveWebView';
import { PDFViewer } from './components/Views/PDFViewer';
import { ResearchMode } from './components/Views/ResearchMode';
import { ProductComparisonView } from './components/Views/ProductComparisonView';
import { HistoryView } from './components/Views/HistoryView';
import { BookmarksView } from './components/Views/BookmarksView';
import { DownloadsView } from './components/Views/DownloadsView';
import { SettingsView } from './components/Views/SettingsView';
import { AINotesView } from './components/Views/AINotesView';
import { MindmapView } from './components/Views/MindmapView';
import { DevToolsView } from './components/Views/DevToolsView';
import { ReadmeView } from './components/Views/ReadmeView';
import { CommandPalette } from './components/Modals/CommandPalette';
import { AudioNarrationBar } from './components/Browser/AudioNarrationBar';
import { SelectionAiHud } from './components/Browser/SelectionAiHud';
import { SplitScreenContainer } from './components/Browser/SplitScreenContainer';
import { VerticalTabBar } from './components/Browser/VerticalTabBar';
import { FindInPageBar } from './components/Browser/FindInPageBar';
import { MobileBottomNav } from './components/Browser/MobileBottomNav';
import { MobileTabsSheet } from './components/Browser/MobileTabsSheet';
import { CrossTabSynthesisModal } from './components/Modals/CrossTabSynthesisModal';
import { KeyboardShortcutsModal } from './components/Modals/KeyboardShortcutsModal';
import { QuickTourModal } from './components/Modals/QuickTourModal';
import { PageSnapshotModal } from './components/Modals/PageSnapshotModal';
import { SitePerformanceModal } from './components/Modals/SitePerformanceModal';
import { Tab, HistoryItem, Bookmark, DownloadItem, AINote, BrowserSettings, PageContentType } from './types';
import { SAMPLE_WEBSITES, SAMPLE_PDFS, INITIAL_BOOKMARKS, INITIAL_NOTES, INITIAL_DOWNLOADS } from './data/mockWebsites';
import { scrapeWebpage, organizeTabsSmartly } from './services/api';

export function App() {
  const [isClustering, setIsClustering] = useState<boolean>(false);
  // Initial clean tab
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'aksh://newtab',
      contentType: 'newtab',
      historyStack: ['aksh://newtab'],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
      favicon: '',
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState<boolean>(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [tabLayout, setTabLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isVerticalCollapsed, setIsVerticalCollapsed] = useState<boolean>(false);
  const [isSynthesisModalOpen, setIsSynthesisModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState<boolean>(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState<boolean>(false);
  const [isMobileTabsOpen, setIsMobileTabsOpen] = useState<boolean>(false);

  // Auto-detect mobile screen on mount to collapse sidebar
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsAiSidebarOpen(false);
    }
  }, []);

  // Advanced Feature States: Split-Screen, Audio TTS, and Selection HUD
  const [splitScreen, setSplitScreen] = useState<{
    enabled: boolean;
    leftTabId: string;
    rightTabId: string;
    ratio: number;
  }>({
    enabled: false,
    leftTabId: 'tab-1',
    rightTabId: 'tab-1',
    ratio: 50,
  });

  const [audioNarration, setAudioNarration] = useState<{
    isOpen: boolean;
    text: string;
    title: string;
  }>({
    isOpen: false,
    text: '',
    title: '',
  });

  const [selectionHud, setSelectionHud] = useState<{
    selectedText: string;
    coords: { x: number; y: number } | null;
  }>({
    selectedText: '',
    coords: null,
  });

  // In-Page Find (Ctrl+F) State
  const [isFindInPageOpen, setIsFindInPageOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findMatchIndex, setFindMatchIndex] = useState(0);
  const [findMatchCount, setFindMatchCount] = useState(0);
  const [findCaseSensitive, setFindCaseSensitive] = useState(false);

  const handleFindNext = () => {
    if (findMatchCount <= 0) return;
    setFindMatchIndex((prev) => (prev + 1) % findMatchCount);
  };

  const handleFindPrev = () => {
    if (findMatchCount <= 0) return;
    setFindMatchIndex((prev) => (prev - 1 + findMatchCount) % findMatchCount);
  };

  // Persistence / Browser State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(INITIAL_BOOKMARKS);
  const [downloads, setDownloads] = useState<DownloadItem[]>(INITIAL_DOWNLOADS);
  const [notes, setNotes] = useState<AINote[]>(INITIAL_NOTES);
  const [settings, setSettings] = useState<BrowserSettings>({
    theme: 'light',
    searchEngine: 'google',
    aiSummaryLength: 'detailed',
    autoAttachWebContext: true,
  });

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || null;

  // Listen for text selection across web pages for floating AI HUD
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';

      if (text && text.length > 3 && !(e.target as HTMLElement).closest('input, textarea, [data-ignore-selection]')) {
        setSelectionHud({
          selectedText: text,
          coords: { x: e.clientX, y: e.clientY },
        });
      } else {
        // Clear if not clicking inside the HUD
        if (!(e.target as HTMLElement).closest('[data-hud]')) {
          setSelectionHud({ selectedText: '', coords: null });
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Sync tab loading to page content
  const navigateTab = useCallback(
    async (tabId: string, targetUrl: string) => {
      let resolvedType: PageContentType = 'web';
      let title = targetUrl;
      let extractedText: string | undefined = undefined;
      let headings: string[] | undefined = undefined;
      let metaDescription: string | undefined = undefined;
      let pdfData: any = undefined;

      // Normalize protocol alias
      const normalizedUrl = targetUrl.replace(/^nexus:\/\//, 'aksh://');

      // Handle internal scheme routes
      if (normalizedUrl === 'aksh://newtab') {
        resolvedType = 'newtab';
        title = 'New Tab';
      } else if (normalizedUrl.startsWith('aksh://research')) {
        resolvedType = 'research';
        title = 'AI Deep Research';
      } else if (normalizedUrl.startsWith('aksh://comparison')) {
        resolvedType = 'comparison';
        title = 'AI Product Comparison';
      } else if (normalizedUrl.startsWith('aksh://mindmap')) {
        resolvedType = 'mindmap';
        title = 'AI Concept Mindmap';
      } else if (normalizedUrl.startsWith('aksh://devtools')) {
        resolvedType = 'devtools';
        title = 'AI DevTools & DOM Inspector';
      } else if (normalizedUrl.startsWith('aksh://pdf')) {
        resolvedType = 'pdf';
        title = 'PDF Document Reader';
        if (normalizedUrl.includes('transformer-paper')) {
          pdfData = {
            filename: SAMPLE_PDFS[0].filename,
            text: SAMPLE_PDFS[0].text,
            pageCount: SAMPLE_PDFS[0].pageCount,
            currentPage: 1,
          };
        }
      } else if (normalizedUrl === 'aksh://history') {
        resolvedType = 'history';
        title = 'Browsing History';
      } else if (normalizedUrl === 'aksh://bookmarks') {
        resolvedType = 'bookmarks';
        title = 'Bookmarks Manager';
      } else if (normalizedUrl === 'aksh://downloads') {
        resolvedType = 'downloads';
        title = 'Download Manager';
      } else if (normalizedUrl === 'aksh://settings') {
        resolvedType = 'settings';
        title = 'Settings';
      } else if (normalizedUrl === 'aksh://notes') {
        resolvedType = 'notes';
        title = 'AI Notes';
      } else if (normalizedUrl === 'aksh://readme' || normalizedUrl === 'aksh://docs') {
        resolvedType = 'readme';
        title = 'System Documentation & README';
      } else if (SAMPLE_WEBSITES[targetUrl] || SAMPLE_WEBSITES[normalizedUrl]) {
        // Preloaded curated website
        const site = SAMPLE_WEBSITES[targetUrl] || SAMPLE_WEBSITES[normalizedUrl];
        resolvedType = 'web';
        title = site.title;
        extractedText = site.extractedText;
      }

      // Update tab with immediate URL and loading state
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== tabId) return t;
          const newStack = [...t.historyStack.slice(0, t.historyIndex + 1), targetUrl];
          return {
            ...t,
            url: targetUrl,
            title,
            contentType: resolvedType,
            extractedText,
            headings,
            metaDescription,
            pdfData,
            isLoading: resolvedType === 'web' && !SAMPLE_WEBSITES[targetUrl],
            historyStack: newStack,
            historyIndex: newStack.length - 1,
            canGoBack: newStack.length > 1,
            canGoForward: false,
          };
        })
      );

      // Record to history
      setHistory((prev) => [
        {
          id: String(Date.now()),
          url: targetUrl,
          title,
          visitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        },
        ...prev.slice(0, 99),
      ]);

      // If it's a live unknown web page, asynchronously scrape through server proxy
      if (resolvedType === 'web' && !SAMPLE_WEBSITES[targetUrl]) {
        try {
          const scraped = await scrapeWebpage(targetUrl);
          setTabs((prev) =>
            prev.map((t) => {
              if (t.id !== tabId) return t;
              return {
                ...t,
                title: scraped.title || targetUrl,
                extractedText: scraped.textContent,
                headings: scraped.headings,
                metaDescription: scraped.metaDescription,
                isLoading: false,
              };
            })
          );
        } catch (e) {
          setTabs((prev) =>
            prev.map((t) => {
              if (t.id !== tabId) return t;
              return {
                ...t,
                isLoading: false,
              };
            })
          );
        }
      }
    },
    []
  );

  const handleNewTab = (initialUrl: string = 'aksh://newtab') => {
    const newId = 'tab-' + Date.now();
    const cleanUrl = initialUrl.replace(/^nexus:\/\//, 'aksh://');
    let resolvedType: PageContentType = 'newtab';
    if (cleanUrl.startsWith('aksh://')) {
      const route = cleanUrl.replace('aksh://', '').split('?')[0];
      resolvedType = (route as PageContentType) || 'newtab';
    }

    const newTabObj: Tab = {
      id: newId,
      title: resolvedType === 'newtab' ? 'New Tab' : `Aksh ${resolvedType}`,
      url: cleanUrl,
      contentType: resolvedType,
      historyStack: [cleanUrl],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
    };
    setTabs((prev) => [...prev, newTabObj]);
    setActiveTabId(newId);
    if (cleanUrl !== 'aksh://newtab') {
      navigateTab(newId, cleanUrl);
    }
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // Don't leave zero tabs; reset to clean new tab
      const resetTab: Tab = {
        id: 'tab-' + Date.now(),
        title: 'New Tab',
        url: 'aksh://newtab',
        contentType: 'newtab',
        historyStack: ['aksh://newtab'],
        historyIndex: 0,
        canGoBack: false,
        canGoForward: false,
        isLoading: false,
        isReaderMode: false,
      };
      setTabs([resetTab]);
      setActiveTabId(resetTab.id);
      return;
    }

    const idx = tabs.findIndex((t) => t.id === id);
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);

    if (activeTabId === id) {
      const nextActive = remaining[Math.min(idx, remaining.length - 1)];
      setActiveTabId(nextActive.id);
    }
  };

  const handlePinTab = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  const handleGoBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIndex = activeTab.historyIndex - 1;
    const targetUrl = activeTab.historyStack[newIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: targetUrl,
              historyIndex: newIndex,
              canGoBack: newIndex > 0,
              canGoForward: newIndex < t.historyStack.length - 1,
            }
          : t
      )
    );
  };

  const handleGoForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.historyStack.length - 1) return;
    const newIndex = activeTab.historyIndex + 1;
    const targetUrl = activeTab.historyStack[newIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: targetUrl,
              historyIndex: newIndex,
              canGoBack: newIndex > 0,
              canGoForward: newIndex < t.historyStack.length - 1,
            }
          : t
      )
    );
  };

  const handleReload = () => {
    if (!activeTab) return;
    navigateTab(activeTab.id, activeTab.url);
  };

  const handleToggleReaderMode = () => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id ? { ...t, isReaderMode: !t.isReaderMode } : t
      )
    );
  };

  const isCurrentBookmarked = !!activeTab && bookmarks.some((b) => b.url === activeTab.url);

  const handleToggleBookmark = () => {
    if (!activeTab) return;
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      const newBm: Bookmark = {
        id: String(Date.now()),
        url: activeTab.url,
        title: activeTab.title,
        folder: 'Quick Access',
        favicon: activeTab.favicon,
        tags: [],
        createdAt: 'Just now',
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  };

  const handleSaveAsNote = (title: string, content: string, sourceUrl?: string) => {
    const newNote: AINote = {
      id: String(Date.now()),
      title,
      content,
      sourceUrl: sourceUrl || activeTab?.url,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      tags: ['AI-Research'],
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleSimulateDownload = () => {
    const sampleFiles = [
      { name: 'transformer_attention_paper.pdf', size: '2.4 MB' },
      { name: 'python_mastery_2026_dataset.csv', size: '14.8 MB' },
      { name: 'aksh_browser_source_bundle.zip', size: '48.2 MB' },
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    const newDl: DownloadItem = {
      id: String(Date.now()),
      filename: picked.name,
      url: activeTab?.url || 'https://downloads.aksh-browser.org',
      size: picked.size,
      progress: 100,
      status: 'completed',
      timestamp: 'Just now',
    };
    setDownloads((prev) => [newDl, ...prev]);
  };

  const handleClearAllLocalData = () => {
    setHistory([]);
    setNotes([]);
    setDownloads([]);
    setTabs([
      {
        id: 'tab-1',
        title: 'New Tab',
        url: 'aksh://newtab',
        contentType: 'newtab',
        historyStack: ['aksh://newtab'],
        historyIndex: 0,
        canGoBack: false,
        canGoForward: false,
        isLoading: false,
        isReaderMode: false,
      },
    ]);
    setActiveTabId('tab-1');
  };

  // Tab Context Actions
  const handleDuplicateTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    const newId = 'tab-' + Date.now();
    const duplicated: Tab = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      historyStack: [...target.historyStack],
    };
    setTabs((prev) => [...prev, duplicated]);
    setActiveTabId(newId);
  };

  const handleReloadTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    navigateTab(target.id, target.url);
  };

  const handleToggleMuteTab = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, muted: !t.muted } : t))
    );
  };

  const handleSplitTab = (id: string, position: 'left' | 'right' = 'right') => {
    if (!splitScreen.enabled) {
      if (position === 'right') {
        setSplitScreen({
          enabled: true,
          leftTabId: activeTabId,
          rightTabId: id,
          ratio: 50,
        });
      } else {
        setSplitScreen({
          enabled: true,
          leftTabId: id,
          rightTabId: activeTabId,
          ratio: 50,
        });
        setActiveTabId(id);
      }
    } else {
      if (position === 'right') {
        setSplitScreen((s) => ({ ...s, rightTabId: id }));
      } else {
        setSplitScreen((s) => ({ ...s, leftTabId: id }));
      }
    }
  };

  const handleAssignTabGroup = (id: string, groupName: string, groupColor: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, groupName, groupColor } : t))
    );
  };

  const handleRemoveTabGroup = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, groupName: undefined, groupColor: undefined } : t))
    );
  };

  const handleCloseOtherTabs = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    setTabs([target]);
    setActiveTabId(target.id);
  };

  const handleCloseTabsToRight = (id: string) => {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const kept = tabs.slice(0, idx + 1);
    setTabs(kept);
    if (!kept.some((t) => t.id === activeTabId)) {
      setActiveTabId(id);
    }
  };

  const handleBookmarkTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    if (!bookmarks.some((b) => b.url === target.url)) {
      const newBm: Bookmark = {
        id: String(Date.now()),
        url: target.url,
        title: target.title,
        folder: target.groupName || 'Quick Access',
        createdAt: 'Today',
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  };

  const handleMindmapPage = () => {
    const topic = activeTab?.title || 'Web Research & Intelligence';
    handleNewTab(`aksh://mindmap?topic=${encodeURIComponent(topic)}`);
  };

  const handleExportMarkdown = () => {
    if (!activeTab) return;
    const content = activeTab.extractedText || 'No page content extracted.';
    const md = `# ${activeTab.title}\n\n**Source URL:** ${activeTab.url}\n**Date:** ${new Date().toLocaleString()}\n**Engine:** Aksh AI Gemini 3.7\n\n---\n\n## Webpage Content\n\n${content}\n\n---\n*Exported from Aksh AI Browser*`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeTab.title || 'webpage').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Note updates
  const handleUpdateNote = (id: string, updated: Partial<AINote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
    );
  };

  const handleCreateNoteDirect = (noteData: Omit<AINote, 'id' | 'createdAt'>) => {
    const newNote: AINote = {
      id: String(Date.now()),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      sourceUrl: noteData.sourceUrl,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  // Bookmark updates
  const handleUpdateBookmark = (id: string, updated: Partial<Bookmark>) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
  };

  const handleImportBookmarks = (imported: Bookmark[]) => {
    setBookmarks((prev) => {
      const existingUrls = new Set(prev.map((b) => b.url));
      const newItems = imported.filter((b) => !existingUrls.has(b.url));
      return [...newItems, ...prev];
    });
  };

  // Open in split view directly from Bookmarks / History
  const handleOpenInSplit = (url: string, title?: string) => {
    const newId = 'tab-' + Date.now();
    const cleanUrl = url.replace(/^nexus:\/\//, 'aksh://');
    let resolvedType: PageContentType = 'web';
    if (cleanUrl.startsWith('aksh://')) {
      const route = cleanUrl.replace('aksh://', '').split('?')[0];
      resolvedType = (route as PageContentType) || 'newtab';
    }

    const newTab: Tab = {
      id: newId,
      title: title || 'Split Page',
      url: cleanUrl,
      contentType: resolvedType,
      historyStack: [cleanUrl],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setSplitScreen({
      enabled: true,
      leftTabId: activeTabId,
      rightTabId: newId,
      ratio: 50,
    });
    navigateTab(newId, cleanUrl);
  };

  // Downloads manager actions
  const handleAddDownload = (item: DownloadItem) => {
    setDownloads((prev) => [item, ...prev]);
    if (item.status === 'downloading') {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setDownloads((prev) =>
            prev.map((d) =>
              d.id === item.id
                ? { ...d, progress: 100, status: 'completed', speed: undefined }
                : d
            )
          );
        } else {
          setDownloads((prev) =>
            prev.map((d) =>
              d.id === item.id
                ? { ...d, progress: currentProgress }
                : d
            )
          );
        }
      }, 500);
    }
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleTogglePauseDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const newStatus = d.status === 'downloading' ? 'paused' : 'downloading';
        return { ...d, status: newStatus };
      })
    );
  };

  // Trigger Speech Narration
  const handleTriggerSpeech = () => {
    if (!activeTab) return;
    const text = activeTab.extractedText || activeTab.pdfData?.text || activeTab.title;
    setAudioNarration({
      isOpen: true,
      text: text.slice(0, 3500),
      title: activeTab.title,
    });
  };

  // Toggle Split-Screen
  const handleToggleSplitScreen = () => {
    if (splitScreen.enabled) {
      setSplitScreen((prev) => ({ ...prev, enabled: false }));
    } else {
      const rightTabCandidate = tabs.find((t) => t.id !== activeTabId) || tabs[0];
      setSplitScreen({
        enabled: true,
        leftTabId: activeTabId,
        rightTabId: rightTabCandidate?.id || activeTabId,
        ratio: 50,
      });
    }
  };

  // Auto Cluster Tabs with Gemini Smart Tab Organizer
  const handleAutoClusterTabs = async () => {
    if (tabs.length <= 1) return;
    setIsClustering(true);
    try {
      const tabsPayload = tabs.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        extractedSnippet: (t.extractedText || t.metaDescription || '').slice(0, 300),
      }));

      const res = await organizeTabsSmartly(tabsPayload);
      if (res && res.groups && res.groups.length > 0) {
        // Map group names and colors back to tabs
        const tabToGroupMap = new Map<string, { name: string; color: string }>();
        res.groups.forEach((g: any) => {
          g.tabIds.forEach((id: string) => {
            tabToGroupMap.set(id, { name: g.groupName, color: g.color || '#3b82f6' });
          });
        });

        setTabs((prev) => {
          const updated = prev.map((t) => {
            const group = tabToGroupMap.get(t.id);
            if (group) {
              return { ...t, groupName: group.name, groupColor: group.color };
            }
            return t;
          });

          // Sort tabs so grouped tabs sit contiguously
          return [...updated].sort((a, b) => {
            const groupA = a.groupName || '';
            const groupB = b.groupName || '';
            return groupA.localeCompare(groupB);
          });
        });
      }
    } catch (err) {
      console.error('Error clustering tabs:', err);
    } finally {
      setIsClustering(false);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // AI Assistant Sidebar: Ctrl+J or Cmd+J
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsAiSidebarOpen((prev) => !prev);
      }
      // Find in page: Ctrl+F or Cmd+F
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindInPageOpen(true);
      }
      // New Tab: Ctrl+T or Cmd+T
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      }
      // Close Tab: Ctrl+W or Cmd+W
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTab) handleCloseTab(activeTab.id);
      }
      // Reload: Ctrl+R or Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReload();
      }
      // Open History: Ctrl+H
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigateTab(activeTabId, 'aksh://history');
      }
      // Open Bookmarks: Ctrl+B
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        navigateTab(activeTabId, 'aksh://bookmarks');
      }
      // Open Mindmap: Ctrl+M
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        navigateTab(activeTabId, 'aksh://mindmap');
      }
      // DevTools: F12 or Ctrl+Shift+I
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        navigateTab(activeTabId, 'aksh://devtools');
      }
      // Keyboard shortcuts modal: ? or Esc
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsShortcutsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsCommandPaletteOpen(false);
        setSelectionHud({ selectedText: '', coords: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeTabId, navigateTab]);

  // Modular Tab View Renderer function
  const renderTabContent = (targetTab: Tab | null) => {
    if (!targetTab) {
      return (
        <div className="h-full flex items-center justify-center text-slate-500">
          No tab selected
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        {targetTab.contentType === 'newtab' && (
          <NewTab
            onNavigate={(url) => navigateTab(targetTab.id, url)}
            bookmarks={bookmarks}
            onOpenResearch={(q) => {
              navigateTab(targetTab.id, `aksh://research?q=${encodeURIComponent(q)}`);
            }}
            onOpenPdf={(pdfId) => {
              navigateTab(targetTab.id, `aksh://pdf/${pdfId}`);
            }}
            onOpenTour={() => setIsTourOpen(true)}
          />
        )}

        {targetTab.contentType === 'web' && (
          <LiveWebView
            tab={targetTab}
            onNavigate={(url) => navigateTab(targetTab.id, url)}
            onTriggerAiSummary={() => setIsAiSidebarOpen(true)}
            onSaveAsNote={(title, content) => handleSaveAsNote(title, content, targetTab.url)}
            onTriggerSpeech={handleTriggerSpeech}
            findQuery={isFindInPageOpen ? findQuery : ''}
            matchIndex={findMatchIndex}
            caseSensitive={findCaseSensitive}
            onMatchesFound={setFindMatchCount}
          />
        )}

        {targetTab.contentType === 'pdf' && (
          <PDFViewer
            tab={targetTab}
            onSaveAsNote={handleSaveAsNote}
            onUpdateTabPdfData={(pdfData) => {
              setTabs((prev) =>
                prev.map((t) => (t.id === targetTab.id ? { ...t, pdfData } : t))
              );
            }}
          />
        )}

        {targetTab.contentType === 'research' && (
          <ResearchMode
            initialQuery={
              targetTab.url.includes('?q=')
                ? decodeURIComponent(targetTab.url.split('?q=')[1])
                : ''
            }
            onSaveAsNote={handleSaveAsNote}
            onNavigateUrl={(url) => navigateTab(targetTab.id, url)}
          />
        )}

        {targetTab.contentType === 'mindmap' && (
          <MindmapView
            initialTopic={
              targetTab.url.includes('?topic=')
                ? decodeURIComponent(targetTab.url.split('?topic=')[1])
                : activeTab?.title || 'Quantum Computing & LLMs'
            }
            onSaveAsNote={handleSaveAsNote}
            onNavigateUrl={(url) => navigateTab(targetTab.id, url)}
          />
        )}

        {targetTab.contentType === 'devtools' && (
          <DevToolsView
            activeTab={tabs.find((t) => t.id === splitScreen.leftTabId) || activeTab}
            onSaveAsNote={handleSaveAsNote}
          />
        )}

        {targetTab.contentType === 'comparison' && (
          <ProductComparisonView onSaveAsNote={handleSaveAsNote} />
        )}

        {targetTab.contentType === 'history' && (
          <HistoryView
            history={history}
            onNavigate={(url) => navigateTab(targetTab.id, url)}
            onClearHistory={() => setHistory([])}
            onDeleteItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
            onOpenInNewTab={(url, title) => handleNewTab(url)}
            onOpenInSplit={handleOpenInSplit}
            onBookmarkItem={(title, url) => {
              if (!bookmarks.some((b) => b.url === url)) {
                setBookmarks((prev) => [
                  {
                    id: String(Date.now()),
                    title,
                    url,
                    folder: 'History',
                    createdAt: 'Today',
                  },
                  ...prev,
                ]);
              }
            }}
          />
        )}

        {targetTab.contentType === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onNavigate={(url) => navigateTab(targetTab.id, url)}
            onDeleteBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
            onAddBookmark={(title, url, folder) => {
              const newBm: Bookmark = {
                id: String(Date.now()),
                title,
                url,
                folder: folder || 'Custom',
                tags: [],
                createdAt: 'Today',
              };
              setBookmarks((prev) => [newBm, ...prev]);
            }}
            onUpdateBookmark={handleUpdateBookmark}
            onImportBookmarks={handleImportBookmarks}
            onOpenInNewTab={(url) => handleNewTab(url)}
            onOpenInSplit={handleOpenInSplit}
          />
        )}

        {targetTab.contentType === 'downloads' && (
          <DownloadsView
            downloads={downloads}
            onClearDownloads={() => setDownloads([])}
            onSimulateDownload={handleSimulateDownload}
            onAddDownload={handleAddDownload}
            onDeleteDownload={handleDeleteDownload}
            onTogglePauseDownload={handleTogglePauseDownload}
          />
        )}

        {targetTab.contentType === 'notes' && (
          <AINotesView
            notes={notes}
            onDeleteNote={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
            onUpdateNote={handleUpdateNote}
            onCreateNote={handleCreateNoteDirect}
            onNavigateUrl={(url) => navigateTab(targetTab.id, url)}
          />
        )}

        {targetTab.contentType === 'readme' && (
          <ReadmeView
            onNavigateUrl={(url) => navigateTab(targetTab.id, url)}
          />
        )}

        {targetTab.contentType === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
            onClearAllLocalData={handleClearAllLocalData}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-slate-900 overflow-hidden font-sans select-none antialiased">
      {/* 1. TitleBar & Tab Strip */}
      <TitleBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab('aksh://newtab')}
        onPinTab={handlePinTab}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
        onAutoClusterTabs={handleAutoClusterTabs}
        isClustering={isClustering}
        tabLayout={tabLayout}
        onDuplicateTab={handleDuplicateTab}
        onReloadTab={handleReloadTab}
        onMuteTab={handleToggleMuteTab}
        onSplitTab={handleSplitTab}
        onAssignTabGroup={handleAssignTabGroup}
        onRemoveTabGroup={handleRemoveTabGroup}
        onBookmarkTab={handleBookmarkTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onCloseTabsToRight={handleCloseTabsToRight}
        onOpenTour={() => setIsTourOpen(true)}
        onGoHome={() => navigateTab(activeTabId, 'aksh://newtab')}
      />

      {/* 2. Address Bar / Omnibox */}
      <AddressBar
        activeTab={activeTab}
        onNavigate={(url) => navigateTab(activeTabId, url)}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={() => navigateTab(activeTabId, 'aksh://newtab')}
        isBookmarked={isCurrentBookmarked}
        onToggleBookmark={handleToggleBookmark}
        onToggleReaderMode={handleToggleReaderMode}
        onQuickSummarize={() => setIsAiSidebarOpen(true)}
        onOpenAiSidebar={() => setIsAiSidebarOpen(true)}
        onOpenInternalView={(view) => navigateTab(activeTabId, `aksh://${view}`)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleSplitScreen={handleToggleSplitScreen}
        isSplitScreen={splitScreen.enabled}
        onTriggerSpeech={handleTriggerSpeech}
        isSpeaking={audioNarration.isOpen}
        onOpenCrossTabSynthesis={() => setIsSynthesisModalOpen(true)}
        tabLayout={tabLayout}
        onToggleTabLayout={() => setTabLayout((l) => (l === 'horizontal' ? 'vertical' : 'horizontal'))}
        onOpenFindInPage={() => setIsFindInPageOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        onOpenPerformance={() => setIsPerformanceOpen(true)}
        onMindmapPage={handleMindmapPage}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* 3. Bookmarks Quick Bar */}
      <BookmarksBar
        bookmarks={bookmarks}
        onNavigate={(url) => navigateTab(activeTabId, url)}
        onOpenBookmarksManager={() => navigateTab(activeTabId, 'aksh://bookmarks')}
      />

      {/* 4. Main Body: (Optional Vertical TabBar) + Active Tab Viewport + Split-Screen + AI Sidebar */}
      <div className="flex-1 flex overflow-hidden relative bg-white">
        {/* Arc-Style Vertical Tab Bar */}
        {tabLayout === 'vertical' && (
          <VerticalTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onNewTab={() => handleNewTab('aksh://newtab')}
            onPinTab={handlePinTab}
            onAutoClusterTabs={handleAutoClusterTabs}
            isClustering={isClustering}
            onToggleCollapse={() => setIsVerticalCollapsed(!isVerticalCollapsed)}
            isCollapsed={isVerticalCollapsed}
            onDuplicateTab={handleDuplicateTab}
            onReloadTab={handleReloadTab}
            onMuteTab={handleToggleMuteTab}
            onSplitTab={handleSplitTab}
            onAssignTabGroup={handleAssignTabGroup}
            onRemoveTabGroup={handleRemoveTabGroup}
            onBookmarkTab={handleBookmarkTab}
            onCloseOtherTabs={handleCloseOtherTabs}
            onCloseTabsToRight={handleCloseTabsToRight}
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 h-full overflow-hidden relative bg-white pb-14 md:pb-0">
          {/* Find In Page Floating Bar */}
          <FindInPageBar
            isOpen={isFindInPageOpen}
            onClose={() => {
              setIsFindInPageOpen(false);
              setFindQuery('');
              setFindMatchCount(0);
            }}
            query={findQuery}
            onQueryChange={(q) => {
              setFindQuery(q);
              setFindMatchIndex(0);
            }}
            matchIndex={findMatchIndex}
            matchCount={findMatchCount}
            onNext={handleFindNext}
            onPrev={handleFindPrev}
            caseSensitive={findCaseSensitive}
            onToggleCaseSensitive={() => setFindCaseSensitive((prev) => !prev)}
          />

          {splitScreen.enabled ? (
            <SplitScreenContainer
              leftTab={tabs.find((t) => t.id === splitScreen.leftTabId) || activeTab}
              rightTab={tabs.find((t) => t.id === splitScreen.rightTabId) || tabs[0]}
              allTabs={tabs}
              ratio={splitScreen.ratio}
              onRatioChange={(r) => setSplitScreen((prev) => ({ ...prev, ratio: r }))}
              onSelectRightTab={(rTabId) => setSplitScreen((prev) => ({ ...prev, rightTabId: rTabId }))}
              onCloseSplitScreen={() => setSplitScreen((prev) => ({ ...prev, enabled: false }))}
              renderTabContent={renderTabContent}
            />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab ? (
                <motion.div
                  key={activeTab.id + '-' + activeTab.contentType}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="w-full h-full"
                >
                  {renderTabContent(activeTab)}
                </motion.div>
              ) : (
                <motion.div
                  key="no-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-slate-500"
                >
                  No active tab
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        {/* AI Co-Pilot Sidebar */}
        <AISidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
          activeTab={activeTab}
          onSaveAsNote={handleSaveAsNote}
          onOpenResearchMode={(query) => {
            handleNewTab(`aksh://research${query ? `?q=${encodeURIComponent(query)}` : ''}`);
          }}
          onOpenComparisonMode={() => {
            handleNewTab('aksh://comparison');
          }}
          onOpenMindmap={handleMindmapPage}
          onToggleSplitScreen={handleToggleSplitScreen}
          onTriggerSpeech={handleTriggerSpeech}
        />
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        tabs={tabs}
        activeTab={activeTab}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={() => navigateTab(activeTabId, 'aksh://newtab')}
        onNewTab={() => handleNewTab('aksh://newtab')}
        onOpenTabsSheet={() => setIsMobileTabsOpen(true)}
        onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
        isAiSidebarOpen={isAiSidebarOpen}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleReaderMode={handleToggleReaderMode}
        onTriggerSpeech={handleTriggerSpeech}
        isSpeaking={audioNarration.isOpen}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        onOpenPerformance={() => setIsPerformanceOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenInternalView={(view) => navigateTab(activeTabId, `aksh://${view}`)}
        onToggleSplitScreen={handleToggleSplitScreen}
        isSplitScreen={splitScreen.enabled}
        onMindmapPage={handleMindmapPage}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Mobile Tab Management Sheet (< md) */}
      <MobileTabsSheet
        isOpen={isMobileTabsOpen}
        onClose={() => setIsMobileTabsOpen(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => {
          setActiveTabId(id);
          setIsMobileTabsOpen(false);
        }}
        onCloseTab={handleCloseTab}
        onNewTab={() => {
          handleNewTab('aksh://newtab');
          setIsMobileTabsOpen(false);
        }}
        onAutoClusterTabs={handleAutoClusterTabs}
        isClustering={isClustering}
      />

      {/* Floating Audio Narration Player */}
      <AnimatePresence>
        {audioNarration.isOpen && (
          <AudioNarrationBar
            textToRead={audioNarration.text}
            title={audioNarration.title}
            onClose={() => setAudioNarration({ isOpen: false, text: '', title: '' })}
          />
        )}
      </AnimatePresence>

      {/* Floating Contextual AI Selection HUD */}
      <div data-hud="true">
        <SelectionAiHud
          selectedText={selectionHud.selectedText}
          coords={selectionHud.coords}
          onClose={() => setSelectionHud({ selectedText: '', coords: null })}
          onSaveAsNote={handleSaveAsNote}
          onOpenAiSidebarWithMessage={(msg) => {
            setIsAiSidebarOpen(true);
          }}
        />
      </div>

      {/* Global Command Palette (Ctrl+K or ⌘+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => setActiveTabId(id)}
        onNavigateTab={(tabId, url) => navigateTab(tabId, url)}
        onOpenNewTab={(url) => handleNewTab(url)}
        onToggleSplitScreen={handleToggleSplitScreen}
        onOpenAiSidebar={() => setIsAiSidebarOpen(true)}
        onToggleReaderMode={handleToggleReaderMode}
        onTriggerSpeech={handleTriggerSpeech}
        onOpenInternalView={(view) => {
          navigateTab(activeTabId, `aksh://${view}`);
        }}
        onAutoClusterTabs={handleAutoClusterTabs}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        onOpenPerformance={() => setIsPerformanceOpen(true)}
        onMindmapPage={handleMindmapPage}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Cross-Tab AI Synthesis Modal */}
      <CrossTabSynthesisModal
        isOpen={isSynthesisModalOpen}
        onClose={() => setIsSynthesisModalOpen(false)}
        tabs={tabs}
        onSaveAsNote={handleSaveAsNote}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Interactive Quick Tour & Feature Guide Modal */}
      <QuickTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenInternalView={(view) => navigateTab(activeTabId, `aksh://${view}`)}
        onToggleSplitScreen={handleToggleSplitScreen}
        onOpenAiSidebar={() => setIsAiSidebarOpen(true)}
        onTriggerSpeech={handleTriggerSpeech}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* High-Fidelity Page Snapshot & AI Vision Inspector */}
      <PageSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        activeTab={activeTab}
        onAnalyzeWithAiVision={(prompt) => setIsAiSidebarOpen(true)}
      />

      {/* Site Telemetry & Performance Optimization HUD */}
      <SitePerformanceModal
        isOpen={isPerformanceOpen}
        onClose={() => setIsPerformanceOpen(false)}
        activeTab={activeTab}
        onOpenDevTools={() => navigateTab(activeTabId, 'aksh://devtools')}
      />
    </div>
  );
}

export default App;

