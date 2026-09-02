import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  FastForward,
  RotateCcw,
  X,
  Sparkles,
  Radio,
  FileText,
  Copy,
  Check,
  Headphones,
  Mic
} from 'lucide-react';
import { generatePodcastScript } from '../../services/api';

interface AudioNarrationBarProps {
  textToRead: string;
  title: string;
  url?: string;
  onClose: () => void;
}

export const AudioNarrationBar: React.FC<AudioNarrationBarProps> = ({ textToRead, title, url, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1.0);
  const [activeMode, setActiveMode] = useState<'narrator' | 'podcast'>('narrator');
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState<boolean>(false);
  const [showScriptDrawer, setShowScriptDrawer] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!textToRead) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 4000));
      utterance.rate = rate;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToRead]);

  const handleTogglePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        const text = activeMode === 'podcast' && podcastScript ? podcastScript : textToRead;
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
        utterance.rate = rate;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.cancel();
      const text = activeMode === 'podcast' && podcastScript ? podcastScript : textToRead;
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
      utterance.rate = newRate;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGeneratePodcastBriefing = async () => {
    setIsGeneratingPodcast(true);
    try {
      const res = await generatePodcastScript(title, url || 'https://webpage.com', textToRead);
      setPodcastScript(res.script);
      setActiveMode('podcast');
      setShowScriptDrawer(true);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.spokenText || res.script.slice(0, 4000));
        utterance.rate = rate;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error generating podcast:', err);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleCopyScript = () => {
    if (!podcastScript) return;
    navigator.clipboard.writeText(podcastScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center max-w-xl w-full px-4 select-none">
      {/* Podcast Dialogue Script Drawer */}
      {showScriptDrawer && podcastScript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-2 bg-white/98 border border-slate-200 backdrop-blur-xl rounded-2xl shadow-2xl p-4 text-xs text-slate-800 max-h-60 overflow-y-auto select-text space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Radio className="w-4 h-4 text-rose-600" />
              <span>AI Podcast Dialogue (Alex & Sam)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Script'}</span>
              </button>
              <button
                onClick={() => setShowScriptDrawer(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-2 whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
            {podcastScript}
          </div>
        </motion.div>
      )}

      {/* Main Floating Narration Control Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full bg-white/95 border border-slate-300 backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-slate-900"
      >
        {/* Title & Animated Equalizer Waves */}
        <div className="flex items-center gap-2.5 truncate max-w-[190px]">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-0.5 bg-emerald-600 rounded-full animate-bounce h-2" />
                <span className="w-0.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.15s] h-3.5" />
                <span className="w-0.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.3s] h-2.5" />
                <span className="w-0.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.1s] h-3" />
              </div>
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-slate-900 truncate">{title || 'Audio Narration'}</div>
            <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-semibold">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{activeMode === 'podcast' ? 'Alex & Sam AI Briefing' : 'Neural Voice Synthesis'}</span>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={handleStop}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Stop reading"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* AI Podcast Mode Button */}
          <button
            onClick={handleGeneratePodcastBriefing}
            disabled={isGeneratingPodcast}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Generate two-host AI podcast dialogue"
          >
            <Radio className="w-3.5 h-3.5 text-rose-600" />
            <span>{isGeneratingPodcast ? 'Drafting...' : 'Podcastify'}</span>
          </button>
        </div>

        {/* Speed Rate Pills */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[10px] font-mono">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
            <button
              key={speed}
              onClick={() => handleRateChange(speed)}
              className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                rate === speed ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            handleStop();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close audio narrator"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
