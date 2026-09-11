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
  | 'notes'
  | 'mindmap'
  | 'devtools'
  | 'readme';

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
  isSleeping?: boolean;
  workspaceId?: string;
  contentType: PageContentType;
  extractedText?: string;
  metaDescription?: string;
  headings?: string[];
  isReaderMode?: boolean;
  groupName?: string;
  groupColor?: string;
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

export interface SplitScreenState {
  enabled: boolean;
  leftTabId: string | null;
  rightTabId: string | null;
  ratio: number; // 50 = 50%, 70 = 70/30, 30 = 30/70
}

export interface MindmapNode {
  id: string;
  label: string;
  category: 'root' | 'concept' | 'technology' | 'application' | 'challenge' | 'future';
  description: string;
}

export interface MindmapEdge {
  from: string;
  to: string;
  label: string;
}

export interface MindmapGraph {
  root: string;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export interface NetworkLog {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'FETCH';
  status: number;
  type: string;
  size: string;
  timeMs: number;
  timestamp: string;
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
  actionType?: 'summary' | 'research' | 'comparison' | 'pdf' | 'explain' | 'chat' | 'mindmap' | 'factcheck' | 'translate';
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
  voiceSpeed?: number;
  preferredLanguage?: string;
  adBlockerEnabled?: boolean;
  memorySaverEnabled?: boolean;
  tabLayout?: 'horizontal' | 'vertical';
  zoomLevel?: number;
}

export interface Workspace {
  id: string;
  name: string;
  icon: 'Compass' | 'Zap' | 'Code' | 'BookOpen';
  color: string;
  badge: string;
}

export interface AgentTaskStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  detail?: string;
}

export interface AgentTaskRun {
  id: string;
  goal: string;
  steps: AgentTaskStep[];
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: {
    summary: string;
    actionItems: string[];
    extractedInsights?: string[];
  };
}
