import { AIMessage } from '../types';

export interface ScrapeResult {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  textContent: string;
  favicon?: string;
  fetchedAt?: string;
}

export interface SummaryResult {
  summary: string;
  mode: string;
  title: string;
  url?: string;
}

export interface ResearchResult {
  report: {
    query: string;
    summary: string;
    sources: Array<{ title: string; url: string }>;
    timestamp?: string;
  };
}

export interface PDFAnalysisResult {
  result: string;
  action: string;
  filename: string;
}

export interface ProductComparisonResult {
  report: string;
  timestamp?: string;
}

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { status: 'error', aiEnabled: false };
  }
}

export async function scrapeWebpage(url: string): Promise<ScrapeResult> {
  const res = await fetch('/api/scrape-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to scrape page`);
  }
  return await res.json();
}

export async function sendAIChat(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  webpageContext?: { url?: string; title?: string; textContent?: string },
  mode: string = 'general'
): Promise<{ reply: string; sources?: Array<{ title: string; url: string }> }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory,
      webpageContext,
      mode,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to send message`);
  }
  return await res.json();
}

export async function generateSummary(
  content: string,
  title: string,
  url: string,
  mode: 'short' | 'detailed' | 'beginner' | 'technical' = 'detailed'
): Promise<SummaryResult> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title, url, mode }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to summarize`);
  }
  return await res.json();
}

export async function runDeepResearch(query: string, depth: string = 'deep'): Promise<ResearchResult> {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, depth }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to perform research`);
  }
  return await res.json();
}

export async function analyzePDFDocument(
  text: string,
  filename: string,
  action: 'summarize' | 'ask' | 'notes' | 'mcq' | 'interview' | 'explain_simple',
  query?: string
): Promise<PDFAnalysisResult> {
  const res = await fetch('/api/pdf/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, filename, action, query }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to analyze PDF`);
  }
  return await res.json();
}

export async function compareProducts(
  products: any,
  query?: string
): Promise<ProductComparisonResult> {
  const res = await fetch('/api/product/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products, query }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to compare products`);
  }
  return await res.json();
}

export async function generateMindmap(
  topic: string,
  context?: string
): Promise<{ graph: { root: string; nodes: any[]; edges: any[] } }> {
  const res = await fetch('/api/ai/mindmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, context }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to generate mindmap`);
  }
  return await res.json();
}

export async function translateText(
  text: string,
  targetLanguage: string = 'Spanish'
): Promise<{ translatedText: string; targetLanguage: string }> {
  const res = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to translate`);
  }
  return await res.json();
}

export async function factCheckClaim(
  claim: string,
  context?: string
): Promise<{ analysis: string; sources?: Array<{ title: string; url: string }> }> {
  const res = await fetch('/api/ai/fact-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim, context }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to fact check`);
  }
  return await res.json();
}

export async function inspectCode(
  url: string,
  title: string,
  headings: string[] = [],
  textSnippet: string = '',
  action: string = 'audit'
): Promise<{ report: string }> {
  const res = await fetch('/api/ai/inspect-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title, headings, textSnippet, action }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to inspect code`);
  }
  return await res.json();
}

export async function executeAgentTask(
  taskGoal: string,
  webpageContext?: { url?: string; title?: string; textContent?: string }
): Promise<{ result: string }> {
  const res = await fetch('/api/ai/agent-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskGoal, webpageContext }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to execute agent task`);
  }
  return await res.json();
}

export async function extractStructuredData(
  content: string,
  title: string,
  url: string,
  format: string = 'table'
): Promise<{ data: string }> {
  const res = await fetch('/api/ai/extract-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title, url, format }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to extract data`);
  }
  return await res.json();
}

export async function synthesizeCrossTabs(
  tabs: Array<{ id: string; title: string; url: string; extractedText?: string; textContent?: string }>
): Promise<{ synthesis: string }> {
  const res = await fetch('/api/ai/cross-tab-synthesis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tabs }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to synthesize tabs`);
  }
  return await res.json();
}

export async function generatePodcastScript(
  title: string,
  url: string,
  content: string,
  style: string = 'conversational_hosts'
): Promise<{ script: string; spokenText: string }> {
  const res = await fetch('/api/ai/podcast-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, url, content, style }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to generate podcast script`);
  }
  return await res.json();
}

export async function organizeTabsSmartly(
  tabs: Array<{ id: string; title: string; url: string; contentType?: string }>
): Promise<{ groups: Array<{ name: string; color: string; tabIds: string[] }> }> {
  const res = await fetch('/api/ai/smart-tab-organizer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tabs }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to organize tabs`);
  }
  return await res.json();
}

export async function clipWebpageToNote(
  title: string,
  url: string,
  content: string
): Promise<{ noteTitle: string; markdown: string; tags: string[] }> {
  const res = await fetch('/api/ai/web-clipper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, url, content }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}: Failed to clip webpage`);
  }
  return await res.json();
}

