import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  Sliders,
  Copy,
  Check,
  StickyNote,
  X,
  User,
  Users,
  FastForward,
  Loader2
} from 'lucide-react';
import { generatePodcastScript } from '../../services/api';

interface AudioNarrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  sourceUrl?: string;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
}

export const AudioNarrationModal: React.FC<AudioNarrationModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  sourceUrl,
  onSaveAsNote,
}) => {
  const [activeTab, setActiveTab] = useState<'narrator' | 'podcast'>('narrator');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Podcast mode state
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [podcastSpokenText, setPodcastSpokenText] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      setVoices(avail);
      if (avail.length > 0 && !selectedVoice) {
        // Prefer natural / English voices
        const naturalOrEn = avail.find(
          (v) => (v.name.includes('Natural') || v.lang.startsWith('en')) && v.localService
        ) || avail[0];
        setSelectedVoice(naturalOrEn.name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cleanup speech on modal close or unmount
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTextToRead = activeTab === 'podcast' && podcastSpokenText ? podcastSpokenText : text;

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser environment.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = currentTextToRead
      .replace(/[#*`_~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      alert('No textual content available to narrate.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 4500));
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoice) {
      const vObj = voices.find((v) => v.name === selectedVoice);
      if (vObj) utterance.voice = vObj;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // Generate 2-Host AI Podcast
  const handleGeneratePodcast = async () => {
    setIsGeneratingPodcast(true);
    handleStop();
    try {
      const res = await generatePodcastScript(title, sourceUrl || 'https://webpage', text);
      setPodcastScript(res.script);
      setPodcastSpokenText(res.spokenText);
      setActiveTab('podcast');
    } catch (err: any) {
      alert(`Failed to generate podcast briefing: ${err.message || 'Error'}`);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Audio Narration Studio</h3>
              <p className="text-xs text-slate-500 truncate max-w-md">{title}</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Mode Tabs */}
        <div className="flex border-b border-slate-100 bg-white px-5 pt-3 shrink-0 gap-3">
          <button
            onClick={() => {
              handleStop();
              setActiveTab('narrator');
            }}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'narrator'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Direct Text Narrator</span>
          </button>

          <button
            onClick={() => {
              handleStop();
              setActiveTab('podcast');
              if (!podcastScript && !isGeneratingPodcast) {
                handleGeneratePodcast();
              }
            }}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'podcast'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-500" />
            <span>2-Host AI Podcast Briefing</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
              AI Audio
            </span>
          </button>
        </div>

        {/* Body Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'narrator' ? (
            <div className="space-y-5">
              {/* Animated Playback Visualizer Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Web Speech Engine</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPlaying ? 'bg-emerald-400 animate-ping' : isPaused ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                    />
                    {isPlaying ? 'Speaking' : isPaused ? 'Paused' : 'Ready'}
                  </span>
                </div>

                {/* Animated Equalizer Waves */}
                <div className="h-12 flex items-center justify-center gap-1.5">
                  {[24, 40, 16, 48, 32, 20, 52, 36, 18, 44, 28, 50, 22, 38].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? 'bg-indigo-400 animate-pulse'
                          : isPaused
                          ? 'bg-amber-400/60'
                          : 'bg-slate-700'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(12, Math.round(h * Math.random()))}px` : '10px',
                      }}
                    />
                  ))}
                </div>

                {/* Primary Playback Controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={handleStop}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Stop & Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="w-14 h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2.0 : 1.0;
                      setRate(nextRate);
                      if (isPlaying) {
                        handleStop();
                        setTimeout(handlePlay, 100);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    title="Toggle Speed"
                  >
                    {rate}x
                  </button>
                </div>
              </div>

              {/* Speech Controls & Audio Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Voice Selection */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Neural / System Voice</span>
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => {
                      setSelectedVoice(e.target.value);
                      if (isPlaying) {
                        handleStop();
                        setTimeout(handlePlay, 100);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {voices.map((v, i) => (
                      <option key={i} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed & Pitch Controls */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>Reading Speed</span>
                    <span className="font-mono text-indigo-600">{rate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="2.0"
                    step="0.25"
                    value={rate}
                    onChange={(e) => {
                      setRate(parseFloat(e.target.value));
                      if (isPlaying) {
                        handleStop();
                        setTimeout(handlePlay, 100);
                      }
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.75x</span>
                    <span>1.0x</span>
                    <span>1.5x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>

              {/* Text Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>Reading Sample (~{Math.round(text.length / 5)} words)</span>
                  <button
                    onClick={() => handleCopyScript(text)}
                    className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto text-slate-700 leading-relaxed font-sans pr-2">
                  {text || 'No text extracted for narration.'}
                </div>
              </div>
            </div>
          ) : (
            /* 2-Host Podcast View */
            <div className="space-y-4">
              {isGeneratingPodcast ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Generating 2-Host AI Audio Briefing...</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Transforming webpage into a dynamic banter script featuring hosts Alex & Sam using Gemini 3.7.
                  </p>
                </div>
              ) : podcastScript ? (
                <div className="space-y-4">
                  {/* Play Podcast Spoken Text Banner */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-rose-800">
                      <Radio className="w-4 h-4 text-rose-600" />
                      <span className="font-semibold">AI Briefing Generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={isPlaying ? handlePause : handlePlay}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause Audio' : 'Listen Now'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dialogue Script */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow-inner border border-slate-800">
                    {podcastScript}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 text-xs">
                    <button
                      onClick={() => handleCopyScript(podcastScript)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Script'}</span>
                    </button>

                    <button
                      onClick={() => onSaveAsNote(`Audio Briefing: ${title}`, podcastScript, sourceUrl)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>Save as AI Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">2-Host Conversational Briefing</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Turn this article into an engaging 2-minute dialogue between two AI analysts.
                  </p>
                  <button
                    onClick={handleGeneratePodcast}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Generate Briefing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
