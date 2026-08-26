import React, { useState, useEffect, useCallback } from 'react';
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
import { KeyboardShortcutsModal } from './components/Modals/KeyboardShortcutsModal';
import { Tab, HistoryItem, Bookmark, DownloadItem, AINote, BrowserSettings, PageContentType } from './types';
import { SAMPLE_WEBSITES, SAMPLE_PDFS, INITIAL_BOOKMARKS, INITIAL_NOTES, INITIAL_DOWNLOADS } from './data/mockWebsites';
import { scrapeWebpage } from './services/api';

export function App() {
  // Initial preloaded tabs for an instant, rich portfolio showcase
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'nexus://newtab',
      contentType: 'newtab',
      historyStack: ['nexus://newtab'],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
      favicon: '',
    },
    {
      id: 'tab-2',
      title: 'Top 5 Python Courses (2026 Guide)',
      url: 'https://learn.python.org/courses/2026-guide',
      contentType: 'web',
      extractedText: SAMPLE_WEBSITES['https://learn.python.org/courses/2026-guide'].extractedText,
      historyStack: ['https://learn.python.org/courses/2026-guide'],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
      favicon: 'https://www.python.org/static/favicon.ico',
    },
    {
      id: 'tab-3',
      title: 'Attention Is All You Need (Transformer Paper)',
      url: 'nexus://pdf/transformer-paper',
      contentType: 'pdf',
      pdfData: {
        filename: SAMPLE_PDFS[0].filename,
        text: SAMPLE_PDFS[0].text,
        pageCount: SAMPLE_PDFS[0].pageCount,
        currentPage: 1,
      },
      historyStack: ['nexus://pdf/transformer-paper'],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState<boolean>(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Persistence / Browser State
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'hist-1',
      url: 'https://learn.python.org/courses/2026-guide',
      title: 'Top 5 Python Courses for 2026 (Beginner to Advanced)',
      visitedAt: 'Today at 10:45 AM',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'hist-2',
      url: 'https://tech-radar.io/laptops/flagship-comparison-2026',
      title: 'Flagship Laptop Comparison 2026: MacBook Pro vs XPS 15 vs ThinkPad',
      visitedAt: 'Today at 09:30 AM',
      timestamp: Date.now() - 7200000,
    },
  ]);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(INITIAL_BOOKMARKS);
  const [downloads, setDownloads] = useState<DownloadItem[]>(INITIAL_DOWNLOADS);
  const [notes, setNotes] = useState<AINote[]>(INITIAL_NOTES);
  const [settings, setSettings] = useState<BrowserSettings>({
    theme: 'dark',
    searchEngine: 'google',
    aiSummaryLength: 'detailed',
    autoAttachWebContext: true,
  });

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || null;

  // Sync tab loading to page content
  const navigateTab = useCallback(
    async (tabId: string, targetUrl: string) => {
      let resolvedType: PageContentType = 'web';
      let title = targetUrl;
      let extractedText: string | undefined = undefined;
      let pdfData: any = undefined;

      // Handle internal scheme routes
      if (targetUrl === 'nexus://newtab') {
        resolvedType = 'newtab';
        title = 'New Tab';
      } else if (targetUrl.startsWith('nexus://research')) {
        resolvedType = 'research';
        title = 'AI Deep Research';
      } else if (targetUrl.startsWith('nexus://comparison')) {
        resolvedType = 'comparison';
        title = 'AI Product Comparison';
      } else if (targetUrl.startsWith('nexus://pdf')) {
        resolvedType = 'pdf';
        title = 'PDF Document Reader';
        pdfData = {
          filename: SAMPLE_PDFS[0].filename,
          text: SAMPLE_PDFS[0].text,
          pageCount: SAMPLE_PDFS[0].pageCount,
          currentPage: 1,
        };
      } else if (targetUrl === 'nexus://history') {
        resolvedType = 'history';
        title = 'Browsing History';
      } else if (targetUrl === 'nexus://bookmarks') {
        resolvedType = 'bookmarks';
        title = 'Bookmarks Manager';
      } else if (targetUrl === 'nexus://downloads') {
        resolvedType = 'downloads';
        title = 'Download Manager';
      } else if (targetUrl === 'nexus://settings') {
        resolvedType = 'settings';
        title = 'Settings';
      } else if (targetUrl === 'nexus://notes') {
        resolvedType = 'notes';
        title = 'AI Notes';
      } else if (SAMPLE_WEBSITES[targetUrl]) {
        // Preloaded curated website
        const site = SAMPLE_WEBSITES[targetUrl];
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

  const handleNewTab = (initialUrl: string = 'nexus://newtab') => {
    const newId = 'tab-' + Date.now();
    const newTabObj: Tab = {
      id: newId,
      title: 'New Tab',
      url: initialUrl,
      contentType: initialUrl.startsWith('nexus://') ? (initialUrl.replace('nexus://', '') as PageContentType) : 'newtab',
      historyStack: [initialUrl],
      historyIndex: 0,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      isReaderMode: false,
    };
    setTabs((prev) => [...prev, newTabObj]);
    setActiveTabId(newId);
    if (initialUrl !== 'nexus://newtab') {
      navigateTab(newId, initialUrl);
    }
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // Don't leave zero tabs; reset to clean new tab
      const resetTab: Tab = {
        id: 'tab-' + Date.now(),
        title: 'New Tab',
        url: 'nexus://newtab',
        contentType: 'newtab',
        historyStack: ['nexus://newtab'],
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
      { name: 'nexus_browser_source_bundle.zip', size: '48.2 MB' },
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    const newDl: DownloadItem = {
      id: String(Date.now()),
      filename: picked.name,
      url: activeTab?.url || 'https://downloads.nexus-browser.org',
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
        url: 'nexus://newtab',
        contentType: 'newtab',
        historyStack: ['nexus://newtab'],
        historyIndex: 0,
        canGoBack: false,
        canGoForward: false,
        isLoading: false,
        isReaderMode: false,
      },
    ]);
    setActiveTabId('tab-1');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle AI Assistant: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAiSidebarOpen((prev) => !prev);
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
        navigateTab(activeTabId, 'nexus://history');
      }
      // Open Bookmarks: Ctrl+B
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        navigateTab(activeTabId, 'nexus://bookmarks');
      }
      // Keyboard shortcuts modal: ? or Esc
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsShortcutsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeTabId, navigateTab]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* 1. TitleBar & Tab Strip */}
      <TitleBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab('nexus://newtab')}
        onPinTab={handlePinTab}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
      />

      {/* 2. Address Bar / Omnibox */}
      <AddressBar
        activeTab={activeTab}
        onNavigate={(url) => navigateTab(activeTabId, url)}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={() => navigateTab(activeTabId, 'nexus://newtab')}
        isBookmarked={isCurrentBookmarked}
        onToggleBookmark={handleToggleBookmark}
        onToggleReaderMode={handleToggleReaderMode}
        onQuickSummarize={() => setIsAiSidebarOpen(true)}
        onOpenAiSidebar={() => setIsAiSidebarOpen(true)}
        onOpenInternalView={(view) => navigateTab(activeTabId, `nexus://${view}`)}
      />

      {/* 3. Bookmarks Quick Bar */}
      <BookmarksBar
        bookmarks={bookmarks}
        onNavigate={(url) => navigateTab(activeTabId, url)}
        onOpenBookmarksManager={() => navigateTab(activeTabId, 'nexus://bookmarks')}
      />

      {/* 4. Main Body: Active Tab Viewport + AI Co-Pilot Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Content Viewport */}
        <main className="flex-1 h-full overflow-hidden relative bg-slate-950">
          {activeTab ? (
            <>
              {activeTab.contentType === 'newtab' && (
                <NewTab
                  onNavigate={(url) => navigateTab(activeTab.id, url)}
                  bookmarks={bookmarks}
                  onOpenResearch={(q) => {
                    navigateTab(activeTab.id, `nexus://research?q=${encodeURIComponent(q)}`);
                  }}
                  onOpenPdf={(pdfId) => {
                    navigateTab(activeTab.id, `nexus://pdf/${pdfId}`);
                  }}
                />
              )}

              {activeTab.contentType === 'web' && (
                <LiveWebView
                  tab={activeTab}
                  onNavigate={(url) => navigateTab(activeTab.id, url)}
                  onTriggerAiSummary={() => setIsAiSidebarOpen(true)}
                  onSaveAsNote={(title, content) => handleSaveAsNote(title, content, activeTab.url)}
                />
              )}

              {activeTab.contentType === 'pdf' && (
                <PDFViewer
                  tab={activeTab}
                  onSaveAsNote={handleSaveAsNote}
                  onUpdateTabPdfData={(pdfData) => {
                    setTabs((prev) =>
                      prev.map((t) => (t.id === activeTab.id ? { ...t, pdfData } : t))
                    );
                  }}
                />
              )}

              {activeTab.contentType === 'research' && (
                <ResearchMode
                  initialQuery={
                    activeTab.url.includes('?q=')
                      ? decodeURIComponent(activeTab.url.split('?q=')[1])
                      : ''
                  }
                  onSaveAsNote={handleSaveAsNote}
                  onNavigateUrl={(url) => navigateTab(activeTab.id, url)}
                />
              )}

              {activeTab.contentType === 'comparison' && (
                <ProductComparisonView onSaveAsNote={handleSaveAsNote} />
              )}

              {activeTab.contentType === 'history' && (
                <HistoryView
                  history={history}
                  onNavigate={(url) => navigateTab(activeTab.id, url)}
                  onClearHistory={() => setHistory([])}
                  onDeleteItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
                />
              )}

              {activeTab.contentType === 'bookmarks' && (
                <BookmarksView
                  bookmarks={bookmarks}
                  onNavigate={(url) => navigateTab(activeTab.id, url)}
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
                />
              )}

              {activeTab.contentType === 'downloads' && (
                <DownloadsView
                  downloads={downloads}
                  onClearDownloads={() => setDownloads([])}
                  onSimulateDownload={handleSimulateDownload}
                />
              )}

              {activeTab.contentType === 'notes' && (
                <AINotesView
                  notes={notes}
                  onDeleteNote={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
                  onNavigateUrl={(url) => navigateTab(activeTab.id, url)}
                />
              )}

              {activeTab.contentType === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
                  onClearAllLocalData={handleClearAllLocalData}
                />
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              No active tab
            </div>
          )}
        </main>

        {/* AI Co-Pilot Sidebar */}
        <AISidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
          activeTab={activeTab}
          onSaveAsNote={handleSaveAsNote}
          onOpenResearchMode={(query) => {
            handleNewTab(`nexus://research${query ? `?q=${encodeURIComponent(query)}` : ''}`);
          }}
          onOpenComparisonMode={() => {
            handleNewTab('nexus://comparison');
          }}
        />
      </div>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
