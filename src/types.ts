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
  | 'extensions'
  | 'reading_list'
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
  // Appearance & Themes
  theme: 'dark' | 'light' | 'cyber' | 'solarized' | 'nord' | 'oled';
  tabLayout?: 'horizontal' | 'vertical';
  showBookmarksBar?: boolean;
  defaultNewTabPage?: 'speed_dial' | 'blank' | 'ai_research';
  compactMode?: boolean;
  smoothScrolling?: boolean;
  zoomLevel?: number;
  fontScale?: number; // 90, 100, 110, 125

  // Search & Navigation
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'ai' | 'kagi' | 'perplexity' | 'custom';
  customSearchUrl?: string;
  dnsProvider?: 'system' | 'cloudflare' | 'google' | 'quad9';
  userAgentPreset?: 'default' | 'safari' | 'firefox' | 'mobile';

  // AI Intelligence & Copilot
  aiModel?: 'gemini-3.7-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash';
  aiReasoningEffort?: 'fast' | 'balanced' | 'deep';
  aiPersona?: 'default' | 'coder' | 'academic' | 'executive' | 'custom';
  customAiPersonaPrompt?: string;
  aiSummaryLength: 'short' | 'detailed' | 'beginner' | 'technical';
  autoAttachWebContext: boolean;
  aiAutoSummarizeLongPages?: boolean;
  aiStreamResponses?: boolean;
  aiTemperature?: number;

  // Privacy & Shield Protection
  adBlockerEnabled?: boolean;
  shieldAggressiveness?: 'standard' | 'aggressive' | 'off';
  fingerprintProtection?: boolean;
  httpsOnlyMode?: boolean;
  blockThirdPartyCookies?: boolean;
  clearOnExit?: boolean;
  webrtcProtection?: boolean;

  // Performance & Power
  memorySaverEnabled?: boolean;
  tabSleepTimeoutMinutes?: number; // 15, 30, 60, 120, 0 (never)
  hardwareAcceleration?: boolean;
  dataSaverMode?: boolean;

  // Audio, Voice & Accessibility
  voiceSpeed?: number;
  voicePitch?: number;
  preferredLanguage?: string;
  enableKeyboardShortcuts?: boolean;
  vimKeybindings?: boolean;
  dyslexicFont?: boolean;
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

export interface BrowserExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  enabled: boolean;
  category: 'productivity' | 'privacy' | 'developer' | 'ai' | 'accessibility';
  actionLabel?: string;
  author: string;
  rating: number;
  installs: string;
  permissions: string[];
}

export interface ReadingListItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  readingTimeMinutes: number;
  addedAt: string;
  isRead: boolean;
  excerpt?: string;
  favicon?: string;
}

export type ResponsiveDevice = 'responsive' | 'iphone15' | 'pixel8' | 'ipad' | 'desktop';

export type AIModelId = 'gemini-3.7-flash' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface PageAnnotation {
  id: string;
  url: string;
  text: string;
  color: 'yellow' | 'blue' | 'emerald' | 'rose' | 'purple';
  createdAt: string;
  anchorSnippet?: string;
}

