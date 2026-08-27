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
  Sliders
} from 'lucide-react';

interface AudioNarrationBarProps {
  textToRead: string;
  title: string;
  onClose: () => void;
}

export const AudioNarrationBar: React.FC<AudioNarrationBarProps> = ({ textToRead, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (!textToRead) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 4000));
      utterance.rate = rate;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
      };
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
        const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 4000));
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
      const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 4000));
      utterance.rate = newRate;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-2.5 flex items-center gap-4 text-slate-100 select-none max-w-xl w-full"
    >
      {/* Title & Pulse Indicator */}
      <div className="flex items-center gap-2.5 truncate max-w-xs">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="truncate">
          <div className="text-[11px] font-bold text-slate-200 truncate">{title || 'Audio Narration'}</div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Voice Synthesizer</span>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePlay}
          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        <button
          onClick={handleStop}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Stop reading"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Speed Rate Pills */}
      <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px] font-mono">
        {[0.75, 1.0, 1.25, 1.5].map((speed) => (
          <button
            key={speed}
            onClick={() => handleRateChange(speed)}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              rate === speed ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
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
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-auto transition-colors cursor-pointer"
        title="Close reader"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
