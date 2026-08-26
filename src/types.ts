export type PageContentType =
  | 'web'
  | 'newtab'
  | 'pdf'
  | 'research'
  | 'comparison'
  | 'history'
  | 'bookmarks'
  | 'downloads'
  | 'settings'
  | 'notes';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  historyStack: string[];
  historyIndex: number;
  pinned?: boolean;
  muted?: boolean;
  contentType: PageContentType;
  extractedText?: string;
  metaDescription?: string;
  isReaderMode?: boolean;
  pdfData?: {
    filename: string;
    text: string;
    pageCount: number;
    currentPage: number;
  };
  productData?: {
    query: string;
    products: any[];
  };
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  folder?: string;
  tags?: string[];
  createdAt?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitedAt: string;
  timestamp?: number;
  favicon?: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'failed';
  url: string;
  timestamp: string;
  speed?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
  actionType?: 'summary' | 'research' | 'comparison' | 'pdf' | 'explain' | 'chat';
  isLoading?: boolean;
}

export interface AINote {
  id: string;
  title: string;
  content: string;
  sourceUrl?: string;
  sourceTitle?: string;
  tags?: string[];
  createdAt: string;
}

export interface ResearchReport {
  id: string;
  query: string;
  summary: string;
  sources: Array<{ title: string; url: string }>;
  timestamp: string;
}

export interface BrowserSettings {
  theme: 'dark' | 'light' | 'cyber';
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'ai';
  aiSummaryLength: 'short' | 'detailed' | 'beginner' | 'technical';
  autoAttachWebContext: boolean;
  showBookmarksBar?: boolean;
  defaultNewTabPage?: 'speed_dial' | 'blank' | 'ai_research';
  enableKeyboardShortcuts?: boolean;
}
