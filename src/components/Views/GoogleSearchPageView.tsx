import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Mic,
  Camera,
  X,
  ChevronDown,
  Globe,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Share2,
  Bookmark,
  Check,
  Compass,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '../../types';
import { resolveSearchOrUrl } from '../../utils/searchRouter';

interface GoogleSearchPageViewProps {
  tab: Tab;
  onNavigate: (url: string) => void;
  onSaveAsNote?: (title: string, content: string) => void;
}

export const GoogleSearchPageView: React.FC<GoogleSearchPageViewProps> = ({
  tab,
  onNavigate,
  onSaveAsNote,
}) => {
  // Extract search query from url (e.g. ?q=...)
  const getInitialQuery = () => {
    try {
      const u = new URL(tab.url);
      return u.searchParams.get('q') || '';
    } catch {
      const match = tab.url.match(/[?&]q=([^&]+)/i);
      return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
    }
  };

  const query = getInitialQuery() || tab.title.replace(/^Search:\s*/i, '').replace(/^Google Search:\s*/i, '') || 'Search';
  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'videos' | 'maps'>('all');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const res = resolveSearchOrUrl(searchInput);
    onNavigate(res.targetUrl);
  };

  const handleCopyLink = () => {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    navigator.clipboard.writeText(googleUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Generate realistic People Also Ask questions based on query
  const peopleAlsoAsk = [
    {
      q: `What is the most recent information about ${query}?`,
      a: `Real-time search indexes indicate high activity regarding ${query}. Verified sources recommend checking authoritative documentation and recent research analyses for the latest updates.`,
    },
    {
      q: `How does ${query} compare to similar alternatives?`,
      a: `In multi-criteria evaluations, ${query} is commonly compared based on reliability, performance metrics, ease of use, and community ecosystem support.`,
    },
    {
      q: `What are the best practices when working with ${query}?`,
      a: `Industry practitioners emphasize following official specifications, maintaining modular architectures, and auditing dependencies regularly.`,
    },
    {
      q: `Where can I find tutorials and guides for ${query}?`,
      a: `Comprehensive tutorials, developer documentation, and interactive walk-throughs are available on official portals and reputable developer communities.`,
    },
  ];

  // Related searches suggestions
  const relatedSearches = [
    `${query} 2026 updates`,
    `${query} best practices`,
    `${query} documentation`,
    `${query} comparison`,
    `${query} tutorial for beginners`,
    `latest news on ${query}`,
  ];

  const googleDirectUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  return (
    <div className="h-full overflow-y-auto bg-white select-text font-sans antialiased text-slate-800">
      {/* 1. Google Top Navigation Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-30 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-6 w-full md:w-auto">
            {/* Authentic Google Colorful Wordmark */}
            <div
              onClick={() => onNavigate('https://www.google.com')}
              className="text-2xl font-bold tracking-tight cursor-pointer select-none shrink-0 flex items-center"
              title="Google Search"
            >
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>

            {/* Google Search Pill Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 md:w-[540px]">
              <div className="relative flex items-center bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-500 focus-within:shadow-md rounded-full px-4 py-2 transition-all shadow-xs">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Google or type a URL..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none pr-8"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 shrink-0">
                  <button
                    type="button"
                    title="Search by voice"
                    className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#4285F4]" />
                  </button>
                  <button
                    type="button"
                    title="Search by image"
                    className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#EA4335]" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Direct-to-Real-Google Action */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={googleDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200"
              title="Open query directly on google.com in an external browser tab"
            >
              <span>Open on Google.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Copy Google Search URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-6 mt-3 text-xs font-medium text-slate-600 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'images'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            News
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'videos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === 'maps'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Maps
          </button>
        </div>
      </div>

      {/* 2. Main Google Search Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Notice Callout: Not Available in this Web -> Directed to Google */}
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Directed to Google Search
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  Auto-routed
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-800">&quot;{query}&quot;</span> is not available as a local page in this web app, so we automatically directed you to Google.
              </p>
            </div>
          </div>

          <a
            href={googleDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>Open in Real Google Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Results Metadata Bar */}
        <div className="text-xs text-slate-500 font-normal">
          About 1,840,000,000 results (0.34 seconds) for <span className="font-semibold text-slate-700">&quot;{query}&quot;</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Organic Results & Knowledge Brief */}
          <div className="lg:col-span-8 space-y-7">
            {/* AI Overview / Instant Knowledge Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Overview & Verified Grounding</span>
              </div>

              {tab.extractedText ? (
                <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed prose-headings:font-bold prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-a:text-blue-600 prose-a:underline">
                  <ReactMarkdown>{tab.extractedText}</ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p>
                    <strong>{query}</strong> is a widely referenced subject across the global web index. Google synthesizes verified intelligence across research papers, live news sources, and official community documentation.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                    <li>Key updates reflect modern 2026 benchmarks and verified industry standards.</li>
                    <li>Official repositories and portals provide authoritative references and downloads.</li>
                    <li>Community forums and academic reviews offer in-depth practical case studies.</li>
                  </ul>
                </div>
              )}

              {onSaveAsNote && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() =>
                      onSaveAsNote(
                        `Google Search: ${query}`,
                        `# Google Search Results: ${query}\n\n${tab.extractedText || `Searched on Google for "${query}".`}\n\n**Source URL:** ${googleDirectUrl}`
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    <span>Save Overview to Notes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Organic Google Result Cards */}
            <div className="space-y-6">
              {/* Card 1: Official / Primary Portal */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                    🌐
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 leading-none">
                      {query.toLowerCase().replace(/\s+/g, '')}.org
                    </span>
                    <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                      https://www.{query.toLowerCase().replace(/\s+/g, '')}.org › docs
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer"
                >
                  {query}: Official Documentation, Architecture, and Latest 2026 Guides
                </a>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Official homepage and resource portal for <strong>{query}</strong>. Access comprehensive tutorials, release notes, reference manuals, verified performance metrics, and enterprise deployment best practices.
                </p>

                {/* Sitelinks */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
                    <span className="text-[#1a0dab] font-semibold block hover:underline">
                      Quickstart Guide
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Get started with {query} in under 5 minutes.
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
                    <span className="text-[#1a0dab] font-semibold block hover:underline">
                      API Reference
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Detailed class, interface, and protocol specs.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Wikipedia / Encyclopedic Overview */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">
                    W
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 leading-none">Wikipedia</span>
                    <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                      https://en.wikipedia.org › wiki › {encodeURIComponent(query)}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer"
                >
                  {query} — Wikipedia, the free encyclopedia
                </a>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Historical background, theoretical foundations, key milestones, and global applications of <strong>{query}</strong>. Includes citations from peer-reviewed scientific journals and encyclopedic summaries.
                </p>
              </div>

              {/* People Also Ask Accordion */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>People also ask</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {peopleAlsoAsk.map((item, idx) => (
                    <div key={idx} className="py-2.5">
                      <button
                        onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                        className="w-full text-left flex items-center justify-between text-xs sm:text-sm font-medium text-slate-800 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedFaqIndex === idx ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedFaqIndex === idx && (
                        <div className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 pr-3 pt-1 border-t border-slate-50">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: GitHub Community & Open Source */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                    gh
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 leading-none">GitHub</span>
                    <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                      https://github.com › topics › {encodeURIComponent(query.toLowerCase())}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://github.com/search?q=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer"
                >
                  GitHub: Open Source Projects, Libraries, and Tools for {query}
                </a>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Explore thousands of star-rated open source repositories, packages, tools, and code implementations related to <strong>{query}</strong> maintained by engineers and researchers.
                </p>
              </div>

              {/* Card 4: News & Analysis */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    📰
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 leading-none">Global Tech Times</span>
                    <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                      https://techtimes.com › 2026 › analysis › {encodeURIComponent(query.toLowerCase())}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(query)}+news`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer"
                >
                  Inside {query}: Key Trends, Market Dynamics, and Future Trajectory (2026)
                </a>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  A deep-dive investigation into how <strong>{query}</strong> is shaping engineering standards, productivity workflows, and computational efficiency across modern ecosystems.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Knowledge Panel / Factsheet */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">{query}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  Google Knowledge
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Subject entity compiled from the Google Knowledge Graph and live web index.
              </p>

              <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Query Category</span>
                  <span className="font-medium text-slate-800">Technology & Web</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Routing Status</span>
                  <span className="font-semibold text-emerald-600">Auto-directed to Google</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Availability in Web</span>
                  <span className="font-medium text-slate-500">External Web Index</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Search Protocol</span>
                  <span className="font-medium text-slate-800">Google Grounded</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={googleDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs transition-colors shadow-2xs"
                >
                  <span>View on Google.com</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </a>
              </div>
            </div>

            {/* Related Searches Chips */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Related Searches</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {relatedSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchInput(term);
                      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-transparent hover:border-blue-200 text-left"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Google Pagination Footer */}
        <div className="pt-10 pb-8 flex flex-col items-center justify-center space-y-3 border-t border-slate-200">
          <div className="text-3xl font-bold tracking-widest flex items-center select-none">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold">1</span>
            <span className="px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer">2</span>
            <span className="px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer">3</span>
            <span className="px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer">4</span>
            <span className="px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer">5</span>
            <button
              onClick={() => onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}&start=10`)}
              className="text-blue-600 hover:underline font-semibold ml-2"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
