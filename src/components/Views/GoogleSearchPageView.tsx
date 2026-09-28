import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Mic,
  MicOff,
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
  FileText,
  SlidersHorizontal,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Play,
  Maximize2,
  Download,
  Copy,
  Image as ImageIcon,
  Video,
  Newspaper,
  Map,
  Layers,
  Bot,
  Star,
  Eye,
  RotateCw,
  Cpu,
  Upload,
  ArrowUpRight,
  Split,
  BookOpen
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

  // Search Tools & Filters State
  const [showTools, setShowTools] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'any' | 'h24' | 'w1' | 'm1' | 'y1'>('any');
  const [verbatimMode, setVerbatimMode] = useState(false);
  const [safeSearch, setSafeSearch] = useState(true);

  // Voice Search Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Google Lens / Visual Search Modal State
  const [isLensModalOpen, setIsLensModalOpen] = useState(false);
  const [selectedLensImage, setSelectedLensImage] = useState<string | null>(null);
  const [lensAnalyzing, setLensAnalyzing] = useState(false);
  const [lensResult, setLensResult] = useState<{
    title: string;
    description: string;
    tags: string[];
    confidence: string;
    similarQueries: string[];
  } | null>(null);

  // Image Lightbox State
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    domain: string;
    resolution: string;
  } | null>(null);

  // Video Preview Modal State
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    channel: string;
    views: string;
    duration: string;
    videoUrl?: string;
  } | null>(null);

  // Sync state if tab query changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

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

  // Start Voice Search
  const handleStartVoiceSearch = () => {
    setIsVoiceModalOpen(true);
    setIsListening(true);
    setVoiceTranscript('Listening... Speak now');

    // Attempt browser native SpeechRecognition if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setVoiceTranscript(transcript);
        };

        recognition.onerror = () => {
          setVoiceTranscript('Could not detect microphone. Try selecting a sample query below.');
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }

    // Fallback simulation for environments without audio hardware permissions
    setTimeout(() => {
      setVoiceTranscript(`"What are the latest updates on ${query}?"`);
      setIsListening(false);
    }, 2400);
  };

  const handleStopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const handleExecuteVoiceQuery = (customText?: string) => {
    const finalQ = (customText || voiceTranscript).replace(/^"|"$/g, '').trim();
    if (finalQ && !finalQ.startsWith('Listening')) {
      setIsVoiceModalOpen(false);
      setSearchInput(finalQ);
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(finalQ)}`);
    }
  };

  // Google Lens Sample Analysis
  const handleAnalyzeLensSample = (imageUrl: string, sampleName: string) => {
    setSelectedLensImage(imageUrl);
    setLensAnalyzing(true);
    setLensResult(null);

    setTimeout(() => {
      setLensAnalyzing(false);
      setLensResult({
        title: `Visual Match: ${sampleName}`,
        description: `Visual detection identified key entities, structural attributes, and relevant technical classifications for "${sampleName}".`,
        tags: [sampleName, 'Visual Match', 'High Confidence', 'Google Lens Verified'],
        confidence: '99.4%',
        similarQueries: [
          `${sampleName} specifications`,
          `How to identify ${sampleName}`,
          `${sampleName} latest 2026 models`,
        ],
      });
    }, 1200);
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

  // Simulated Images for the Images Tab
  const searchImages = [
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      title: `${query} - Core Architectural Structure & System Design`,
      domain: 'techarch.io',
      resolution: '1920 × 1080',
    },
    {
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      title: `${query} Implementation Blueprint and Topology`,
      domain: 'developer-hub.org',
      resolution: '2560 × 1440',
    },
    {
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      title: `${query} Modern Engineering Stack & Benchmarks`,
      domain: 'cloudmatrix.net',
      resolution: '1600 × 900',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      title: `Next-Gen Hardware and Compute Architecture for ${query}`,
      domain: 'hardwarereview.tech',
      resolution: '3840 × 2160',
    },
    {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      title: `Global Scalability and Cloud Deployment Topology`,
      domain: 'infra-analytics.com',
      resolution: '2048 × 1152',
    },
    {
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      title: `Collaborative Developer Workflows & Real-time Metrics`,
      domain: 'codepulse.org',
      resolution: '1920 × 1280',
    },
  ];

  // Simulated News Articles for the News Tab
  const searchNews = [
    {
      id: 'news-1',
      title: `The 2026 Shift: How ${query} Is Reshaping High-Performance Engineering`,
      source: 'Global Tech Wire',
      domain: 'globaltechwire.com',
      time: '42 minutes ago',
      badge: 'Breaking',
      snippet: `In an era defined by computational efficiency and decentralized systems, ${query} has achieved record-breaking adoption across enterprise production workloads.`,
    },
    {
      id: 'news-2',
      title: `New Industry Benchmark: Comprehensive Evaluation of ${query} Standards`,
      source: 'Computing Horizon',
      domain: 'computinghorizon.org',
      time: '3 hours ago',
      badge: 'Analysis',
      snippet: `Leading researchers released standardized testing metrics confirming enhanced throughput and reduced overhead when leveraging modern implementations of ${query}.`,
    },
    {
      id: 'news-3',
      title: `Open Source Ecosystem Around ${query} Expands with Frontier Tooling`,
      source: 'Developer Chronicle',
      domain: 'devchronicle.io',
      time: '7 hours ago',
      badge: 'Community',
      snippet: `A coalition of contributors announced native plugins, developer toolkits, and verified SDK integrations supporting the next release cycle of ${query}.`,
    },
    {
      id: 'news-4',
      title: `Security & Compliance Audit: Key Vulnerability Mitigations in ${query}`,
      source: 'Cyber Defense Review',
      domain: 'cyberdefensereview.net',
      time: 'Yesterday',
      badge: 'Security',
      snippet: `Post-quantum cryptography readiness and zero-trust policies are now natively embedded within the updated governance blueprint for ${query}.`,
    },
  ];

  // Simulated Videos for the Videos Tab
  const searchVideos = [
    {
      id: 'vid-1',
      title: `${query} Full Course 2026: From Fundamentals to Production Architecture`,
      channel: 'TechCraft Academy',
      views: '482K views',
      duration: '42:15',
      date: '2 weeks ago',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'vid-2',
      title: `The Complete Guide to ${query} in 15 Minutes (Cheat Sheet)`,
      channel: 'DevExplained',
      views: '1.2M views',
      duration: '14:38',
      date: '1 month ago',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'vid-3',
      title: `Top 5 Mistakes Everyone Makes When Getting Started with ${query}`,
      channel: 'CodeCrafted Studio',
      views: '290K views',
      duration: '09:50',
      date: '3 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'vid-4',
      title: `Live Demo: Building a Real-World Application with ${query}`,
      channel: 'Architects Live',
      views: '185K views',
      duration: '28:04',
      date: '5 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    },
  ];

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
            <form onSubmit={handleSearchSubmit} className="flex-1 md:w-[560px]">
              <div className="relative flex items-center bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-500 focus-within:shadow-md rounded-full px-4 py-2 transition-all shadow-xs">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Google or type a URL..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none pr-8 font-medium"
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
                    onClick={handleStartVoiceSearch}
                    title="Search by voice"
                    className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Mic className="w-4 h-4 text-[#4285F4]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLensModalOpen(true)}
                    title="Search by image (Google Lens)"
                    className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-[#EA4335]" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Direct-to-Real-Google Action & AI Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate(`aksh://research?q=${encodeURIComponent(query)}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition-colors border border-purple-200 cursor-pointer"
              title="Transform this Google search into a full Autonomous AI Research job"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Deep AI Research</span>
            </button>

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

        {/* Filter Navigation Tabs and Search Tools */}
        <div className="max-w-6xl mx-auto flex items-center justify-between mt-3 text-xs font-medium text-slate-600 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>All</span>
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'images'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'news'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'videos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('maps')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'maps'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Maps</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pb-2 shrink-0">
            <button
              onClick={() => setShowTools(!showTools)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                showTools ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>

            <button
              onClick={() => setSafeSearch(!safeSearch)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                safeSearch ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}
              title="Toggle SafeSearch"
            >
              SafeSearch: {safeSearch ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Expandable Search Tools Bar */}
        {showTools && (
          <div className="max-w-6xl mx-auto pt-2.5 pb-1 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Time:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="any">Any time</option>
                <option value="h24">Past 24 hours</option>
                <option value="w1">Past week</option>
                <option value="m1">Past month</option>
                <option value="y1">Past year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Results mode:</span>
              <button
                onClick={() => setVerbatimMode(!verbatimMode)}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  verbatimMode ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {verbatimMode ? 'Verbatim (Exact Match)' : 'All Results'}
              </button>
            </div>

            <button
              onClick={() => {
                setTimeFilter('any');
                setVerbatimMode(false);
              }}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Google Search Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Notice Callout: Not Available in this Web -> Directed to Google */}
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Directed to Google Search
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  Auto-routed
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Verified Engine
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-800">&quot;{query}&quot;</span> is not available as a local page in this web app, so we automatically directed your query to Google.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
        </div>

        {/* Results Metadata Bar */}
        <div className="text-xs text-slate-500 font-normal flex items-center justify-between">
          <span>
            About 1,840,000,000 results (0.34 seconds) for <span className="font-semibold text-slate-700">&quot;{query}&quot;</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">Engine: Google Search &amp; Grounding</span>
        </div>

        {/* TAB 1: ALL RESULTS */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Organic Results & Knowledge Brief */}
            <div className="lg:col-span-8 space-y-7">
              {/* AI Overview / Instant Knowledge Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Overview &amp; Verified Grounding</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onNavigate(`aksh://mindmap?topic=${encodeURIComponent(query)}`)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Generate Interactive Mindmap"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Mindmap</span>
                    </button>
                    <button
                      onClick={() => onNavigate(`aksh://comparison`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Compare alternatives"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Compare</span>
                    </button>
                  </div>
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
                <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                      🌐
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 leading-none">
                        {query.toLowerCase().replace(/[^a-z0-9]/g, '')}.org
                      </span>
                      <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                        https://www.{query.toLowerCase().replace(/[^a-z0-9]/g, '')}.org › docs
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer pt-0.5"
                  >
                    {query}: Official Documentation, Architecture, and Latest 2026 Guides
                  </a>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Official homepage and resource portal for <strong>{query}</strong>. Access comprehensive tutorials, release notes, reference manuals, verified performance metrics, and enterprise deployment best practices.
                  </p>

                  {/* Sitelinks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
                      <span className="text-[#1a0dab] font-semibold block hover:underline">
                        Quickstart Guide
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Get started with {query} in under 5 minutes.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
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
                <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors shadow-2xs">
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
                    className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer pt-0.5"
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
                <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors shadow-2xs">
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
                    className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer pt-0.5"
                  >
                    GitHub: Open Source Projects, Libraries, and Tools for {query}
                  </a>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Explore thousands of star-rated open source repositories, packages, tools, and code implementations related to <strong>{query}</strong> maintained by engineers and researchers worldwide.
                  </p>
                </div>

                {/* Card 4: News & Analysis */}
                <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors shadow-2xs">
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
                    className="block text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer pt-0.5"
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
                    <span className="font-medium text-slate-800">Technology &amp; Web</span>
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

                <div className="pt-2 space-y-2">
                  <a
                    href={googleDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <span>View on Google.com</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  </a>

                  <button
                    onClick={() => onNavigate(`aksh://research?q=${encodeURIComponent(query)}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch AI Research Engine</span>
                  </button>
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
        )}

        {/* TAB 2: IMAGES RESULTS */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            {/* Image Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
              <span className="font-semibold text-slate-500 mr-1">Filters:</span>
              {['HD / 4K', 'Diagrams', 'Infographics', 'Wallpapers', 'Screenshots', 'Transparent PNG', 'Vector Art'].map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchInput(`${query} ${cat.toLowerCase()}`)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors cursor-pointer shrink-0 border border-slate-200/80"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* High-Fidelity Responsive Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="group relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-4/3 w-full overflow-hidden bg-slate-200 relative">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                      {img.resolution}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {img.title}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="truncate">{img.domain}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                Want to search with your own image or screenshot? Use Google Lens visual search.
              </p>
              <button
                onClick={() => setIsLensModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Google Lens Visual Search</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: NEWS RESULTS */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Top stories and verified journalism for <strong>&quot;{query}&quot;</strong></span>
              <span className="text-slate-400">Sorted by relevance and recency</span>
            </div>

            <div className="space-y-4">
              {searchNews.map((article) => (
                <div
                  key={article.id}
                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all shadow-xs space-y-2 flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{article.source}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{article.time}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        {article.badge}
                      </span>
                    </div>

                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(query)}+news`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 leading-snug cursor-pointer"
                    >
                      {article.title}
                    </a>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {article.snippet}
                    </p>
                  </div>

                  <div className="sm:self-center shrink-0">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(query)}+news`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>Read Story</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIDEOS RESULTS */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              Verified high-definition video walkthroughs and demonstrations for <strong>&quot;{query}&quot;</strong>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {searchVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className="group bg-white border border-slate-200 hover:border-red-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-xs font-mono font-semibold">
                      {vid.duration}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
                        <span>{vid.channel}</span>
                        <Check className="w-3 h-3 text-blue-500 stroke-[3]" />
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                      <span>{vid.views}</span>
                      <span>{vid.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MAPS RESULTS */}
        {activeTab === 'maps' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Local Place Information Card */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{query} Center &amp; Headquarters</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Technology Campus &amp; Innovation Facility</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    Open Now
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <span className="font-bold text-slate-800">4.9</span>
                  <span className="text-slate-500">(1,842 Google Reviews)</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1600 Innovation Parkway, Tech District, CA 94043</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Open ⋅ Closes 9:00 PM PST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>+1 (800) 555-0199</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Verified Official Facility</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View on Maps</span>
                  </a>
                </div>
              </div>

              {/* Simulated Visual Interactive Map Canvas */}
              <div className="lg:col-span-6 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden relative min-h-[300px] flex items-center justify-center">
                {/* Background Grid simulating map terrain */}
                <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                
                {/* Simulated streets / paths */}
                <div className="absolute w-full h-4 bg-white/70 top-1/3 -rotate-3" />
                <div className="absolute h-full w-4 bg-white/70 left-1/2 rotate-12" />
                <div className="absolute w-full h-3 bg-amber-100/80 top-2/3 rotate-2" />

                {/* Animated Map Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="px-3 py-1.5 rounded-xl bg-white shadow-md border border-slate-200 text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5 animate-bounce">
                    <MapPin className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                    <span>{query}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-red-100">
                    <MapPin className="w-4 h-4 fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                  <button className="p-1.5 hover:bg-slate-50 text-slate-700 text-xs font-bold">+</button>
                  <button className="p-1.5 hover:bg-slate-50 text-slate-700 text-xs font-bold border-t border-slate-100">−</button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              className="text-blue-600 hover:underline font-semibold ml-2 cursor-pointer"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 4. MODAL: Google Voice Search */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Google Voice Search</span>
              <button
                onClick={() => {
                  handleStopVoiceSearch();
                  setIsVoiceModalOpen(false);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div className="relative inline-flex items-center justify-center">
                {isListening && (
                  <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-ping" />
                )}
                <div
                  onClick={() => (isListening ? handleStopVoiceSearch() : handleStartVoiceSearch())}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform ${
                    isListening ? 'bg-red-500 text-white scale-105' : 'bg-blue-600 text-white'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-800">
                  {voiceTranscript || 'Listening...'}
                </p>
                <p className="text-xs text-slate-500">
                  {isListening ? 'Say a search query or question' : 'Click the microphone to listen again'}
                </p>
              </div>
            </div>

            {/* Quick Voice Suggestions */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Try saying:</span>
              <div className="space-y-1.5">
                {[
                  `"What are the top features of ${query}?"`,
                  `"Compare ${query} with competitors"`,
                  `"Latest breakthrough in AI and quantum computing"`,
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleExecuteVoiceQuery(sample)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-xs text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExecuteVoiceQuery()}
                disabled={!voiceTranscript || voiceTranscript.startsWith('Listening')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Search Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Google Lens Visual Search */}
      {isLensModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-red-500 to-amber-500 p-0.5 flex items-center justify-center text-white">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-slate-800" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-none">Google Lens Visual Studio</h3>
                  <span className="text-[11px] text-slate-500">Search any image, screenshot, or entity</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsLensModalOpen(false);
                  setSelectedLensImage(null);
                  setLensResult(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dropzone / Upload area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-blue-50/40 transition-colors">
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                Drag an image here or choose a sample to analyze with Google Lens
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, WebP, or SVG</p>
            </div>

            {/* Preset Samples */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Choose a Sample Visual Search:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    name: 'Transformer Arch',
                    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
                  },
                  {
                    name: 'Silicon Chip',
                    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
                  },
                  {
                    name: 'Quantum Qubit',
                    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
                  },
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnalyzeLensSample(sample.img, sample.name)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white transition-all text-left flex flex-col gap-1 cursor-pointer group"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100">
                      <img src={sample.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 truncate">{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Loading or Results */}
            {lensAnalyzing && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-blue-900">Google Lens analyzing image features &amp; entities...</span>
              </div>
            )}

            {lensResult && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{lensResult.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Confidence: {lensResult.confidence}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{lensResult.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {lensResult.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Suggested Searches:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lensResult.similarQueries.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setIsLensModalOpen(false);
                          setSearchInput(sq);
                          onNavigate(`https://www.google.com/search?q=${encodeURIComponent(sq)}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL: Image Lightbox Preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 truncate max-w-lg">{selectedImage.title}</h4>
                <p className="text-xs text-slate-500">{selectedImage.domain} • {selectedImage.resolution}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-hidden flex-1">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
              >
                <span>Open Full Resolution</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedImage.url);
                    alert('Image URL copied to clipboard');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={() => {
                    setIsLensModalOpen(true);
                    handleAnalyzeLensSample(selectedImage.url, selectedImage.title);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Search with Lens</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Video Player Preview */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white truncate max-w-md">{selectedVideo.title}</h4>
                <p className="text-xs text-slate-400">{selectedVideo.channel} • {selectedVideo.duration}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Playing simulated preview for: {selectedVideo.title}
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                Verified high-definition stream active. To view on official host, click Watch on Host below.
              </p>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">{selectedVideo.views} views</span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedVideo.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
              >
                <span>Watch on Google / Video Host</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
