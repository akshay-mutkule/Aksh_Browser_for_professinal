import React, { useState, useMemo } from 'react';
import {
  X,
  Table,
  Link2,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Sparkles,
  Search,
  Layers,
  Database,
  Code,
  ArrowUpRight,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Tab } from '../../types';
import { sendAIChat } from '../../services/api';

interface DataExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab | null;
  onOpenUrlInTab: (url: string) => void;
}

export const DataExtractorModal: React.FC<DataExtractorModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onOpenUrlInTab,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'tables' | 'links' | 'custom' | 'raw'>('tables');
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('Extract all products/tools mentioned with their category, key features, and pricing if available.');
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState<any[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const pageText = activeTab?.pdfData?.text || activeTab?.extractedText || '';

  // Extract links from content
  const extractedLinks = useMemo(() => {
    if (!pageText) return [];
    const urlRegex = /https?:\/\/[^\s)\]"'>]+/gi;
    const matches = pageText.match(urlRegex) || [];
    const uniqueUrls = Array.from(new Set(matches));

    return uniqueUrls.map((url, idx) => {
      let hostname = 'link';
      try {
        hostname = new URL(url).hostname;
      } catch (e) {
        // ignore
      }
      return {
        id: `link-${idx}`,
        url,
        domain: hostname,
      };
    });
  }, [pageText]);

  // Extract markdown tables
  const extractedTables = useMemo(() => {
    if (!pageText) return [];
    const lines = pageText.split('\n');
    const tables: Array<{ headers: string[]; rows: string[][] }> = [];
    let currentTable: { headers: string[]; rows: string[][] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());

        // Check if separator line (|---|---|)
        if (cells.every((c) => /^[:-]+$/.test(c))) {
          continue;
        }

        if (!currentTable) {
          currentTable = { headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
      } else {
        if (currentTable && currentTable.rows.length > 0) {
          tables.push(currentTable);
        }
        currentTable = null;
      }
    }
    if (currentTable && currentTable.rows.length > 0) {
      tables.push(currentTable);
    }
    return tables;
  }, [pageText]);

  // AI Schema Extraction
  const handleRunAiExtraction = async () => {
    if (!customPrompt.trim() || !activeTab) return;
    setIsAiExtracting(true);
    setAiError(null);
    setAiExtractedData(null);

    try {
      const systemPrompt = `You are a high-precision Data Extraction & Web Scraper Agent.
Given the webpage text, extract the requested information into a STRICT JSON ARRAY of objects.
Do not output markdown code blocks. Output ONLY raw JSON array: [{"column1": "val", "column2": "val"}].
Extraction Objective: "${customPrompt}"`;

      const response = await sendAIChat(
        systemPrompt,
        [],
        {
          url: activeTab.url,
          title: activeTab.title,
          textContent: pageText.slice(0, 15000),
        }
      );

      let cleaned = response.reply.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        setAiExtractedData(parsed);
      } else {
        setAiExtractedData([parsed]);
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to extract structured data. Please try a different query.');
    } finally {
      setIsAiExtracting(false);
    }
  };

  // Export to CSV
  const handleExportCsv = (data: any[], filename = 'extracted-data.csv') => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
  };

  // Export to JSON
  const handleExportJson = (data: any, filename = 'extracted-data.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Web Scraper & Data Extractor</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Extraction
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {activeTab ? activeTab.title : 'Active Webpage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTabMode('tables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTabMode === 'tables'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Tables ({extractedTables.length})</span>
            </button>
            <button
              onClick={() => setActiveTabMode('custom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTabMode === 'custom'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Schema Extractor</span>
            </button>
            <button
              onClick={() => setActiveTabMode('links')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTabMode === 'links'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Extracted Links ({extractedLinks.length})</span>
            </button>
            <button
              onClick={() => setActiveTabMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTabMode === 'raw'
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw Page Corpus</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyText(pageText)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
            <button
              onClick={() => handleExportJson({ title: activeTab?.title, url: activeTab?.url, content: pageText, tables: extractedTables, links: extractedLinks }, 'page-dataset.json')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Bundle</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: DATA TABLES */}
          {activeTabMode === 'tables' && (
            <div className="space-y-6">
              {extractedTables.length > 0 ? (
                extractedTables.map((table, tIdx) => {
                  const tableRowsObj = table.rows.map((r) => {
                    const obj: any = {};
                    table.headers.forEach((h, hIdx) => {
                      obj[h || `Col_${hIdx + 1}`] = r[hIdx] || '';
                    });
                    return obj;
                  });

                  return (
                    <div key={tIdx} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Table #{tIdx + 1} ({table.rows.length} rows, {table.headers.length} columns)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportCsv(tableRowsObj, `table-${tIdx + 1}.csv`)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Download CSV</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200">
                              {table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-2.5 font-bold text-slate-700 whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-2 text-slate-800 whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
                  <Table className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">No Standard Tables Detected</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    This webpage may not contain markdown tables. Use the <strong>AI Schema Extractor</strong> to auto-discover and format structured lists or grids into a clean table.
                  </p>
                  <button
                    onClick={() => setActiveTabMode('custom')}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try AI Schema Extractor</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI SCHEMA EXTRACTOR */}
          {activeTabMode === 'custom' && (
            <div className="space-y-4">
              <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Custom AI Extraction Prompt</span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Gemini 3.7 Pro
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Extract company names, funding amount, and website URL..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-medium"
                  />
                  <button
                    onClick={handleRunAiExtraction}
                    disabled={isAiExtracting || !customPrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAiExtracting ? 'animate-spin' : ''}`} />
                    <span>{isAiExtracting ? 'Extracting...' : 'Extract Data'}</span>
                  </button>
                </div>

                {/* Pre-built Prompt Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Templates:</span>
                  <button
                    onClick={() => {
                      setCustomPrompt('Extract all tools/products with name, category, pricing, and pros/cons');
                    }}
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                  >
                    🏷️ Products & Pricing
                  </button>
                  <button
                    onClick={() => {
                      setCustomPrompt('Extract all key statistics, figures, percentages, and metrics with context');
                    }}
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                  >
                    📊 Stats & Metrics
                  </button>
                  <button
                    onClick={() => {
                      setCustomPrompt('Extract FAQs: question and concise answer');
                    }}
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                  >
                    ❓ FAQ Q&A Pairs
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {aiError}
                </div>
              )}

              {aiExtractedData && aiExtractedData.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Extracted {aiExtractedData.length} records
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportCsv(aiExtractedData, 'ai-extracted-data.csv')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => handleExportJson(aiExtractedData, 'ai-extracted-data.json')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs"
                      >
                        <Code className="w-3.5 h-3.5 text-purple-600" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200">
                          {Object.keys(aiExtractedData[0]).map((key) => (
                            <th key={key} className="px-4 py-2.5 font-bold text-slate-700 whitespace-nowrap">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {aiExtractedData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            {Object.keys(aiExtractedData[0]).map((key) => (
                              <td key={key} className="px-4 py-2 text-slate-800 whitespace-nowrap max-w-xs truncate">
                                {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXTRACTED LINKS */}
          {activeTabMode === 'links' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {extractedLinks.length} Outbound / Resource Links Found
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter links..."
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 outline-none w-48"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {extractedLinks
                  .filter((l) => l.url.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((link) => (
                    <div
                      key={link.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                          {link.domain}
                        </span>
                        <span className="text-slate-800 truncate font-mono text-[11px]">{link.url}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onOpenUrlInTab(link.url)}
                          className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyText(link.url)}
                          className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: RAW CORPUS */}
          {activeTabMode === 'raw' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs text-slate-500">
                <span>Total Characters: {pageText.length.toLocaleString()}</span>
                <span>Total Words: ~{pageText.split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
              </div>
              <textarea
                readOnly
                rows={16}
                value={pageText}
                className="w-full font-mono text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 resize-none outline-none leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
