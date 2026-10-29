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
  Rewind,
  Loader2,
  AlertCircle
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

interface DialogueTurn {
  id: number;
  speaker: 'Alex' | 'Sam' | 'Narrator';
  text: string;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Podcast state
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [dialogueTurns, setDialogueTurns] = useState<DialogueTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(-1);

  const turnIndexRef = useRef<number>(-1);
  turnIndexRef.current = currentTurnIndex;

  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;

  const scriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Parse podcast script into dialogue turns
  const parseScriptIntoTurns = (rawScript: string): DialogueTurn[] => {
    const lines = rawScript.split('\n').map((l) => l.trim()).filter(Boolean);
    const turns: DialogueTurn[] = [];

    lines.forEach((line, idx) => {
      if (line.toLowerCase().startsWith('alex:')) {
        turns.push({
          id: idx,
          speaker: 'Alex',
          text: line.replace(/^alex:/i, '').trim(),
        });
      } else if (line.toLowerCase().startsWith('sam:') || line.toLowerCase().startsWith('maya:')) {
        turns.push({
          id: idx,
          speaker: 'Sam',
          text: line.replace(/^(sam|maya):/i, '').trim(),
        });
      } else {
        // Fallback / narration
        turns.push({
          id: idx,
          speaker: 'Narrator',
          text: line,
        });
      }
    });

    return turns.length > 0
      ? turns
      : [
          {
            id: 0,
            speaker: 'Alex',
            text: rawScript.slice(0, 300),
          },
        ];
  };

  // Initialize Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      setVoices(avail);
      if (avail.length > 0 && !selectedVoice) {
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

  // Stop playback when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTurnIndex(-1);
    }
  }, [isOpen]);

  // Scroll active turn into view
  useEffect(() => {
    if (currentTurnIndex >= 0 && scriptScrollRef.current) {
      const el = document.getElementById(`turn-${currentTurnIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentTurnIndex]);

  if (!isOpen) return null;

  // Speak a single turn in Podcast mode
  const playPodcastTurn = (turnIdx: number, turnsList: DialogueTurn[] = dialogueTurns) => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('Speech synthesis is not supported in this browser.');
      return;
    }

    if (turnIdx >= turnsList.length) {
      setIsPlaying(false);
      setCurrentTurnIndex(-1);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentTurnIndex(turnIdx);
    setIsPlaying(true);
    setIsPaused(false);

    const turn = turnsList[turnIdx];
    const utterance = new SpeechSynthesisUtterance(turn.text);
    utterance.rate = rate;

    // Distinct character voice styling
    if (turn.speaker === 'Alex') {
      utterance.pitch = Math.max(0.7, pitch * 0.9);
      // Try to select male / deep voice if available
      const alexVoice = voices.find((v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'));
      if (alexVoice) utterance.voice = alexVoice;
      else if (selectedVoice) {
        const sel = voices.find((v) => v.name === selectedVoice);
        if (sel) utterance.voice = sel;
      }
    } else if (turn.speaker === 'Sam') {
      utterance.pitch = Math.min(1.4, pitch * 1.22);
      // Try to select female / dynamic voice if available
      const samVoice = voices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('natural'));
      if (samVoice) utterance.voice = samVoice;
      else if (selectedVoice) {
        const sel = voices.find((v) => v.name === selectedVoice);
        if (sel) utterance.voice = sel;
      }
    } else {
      utterance.pitch = pitch;
      if (selectedVoice) {
        const sel = voices.find((v) => v.name === selectedVoice);
        if (sel) utterance.voice = sel;
      }
    }

    utterance.onend = () => {
      if (turnIdx + 1 < turnsList.length) {
        setTimeout(() => {
          playPodcastTurn(turnIdx + 1, turnsList);
        }, 120);
      } else {
        setIsPlaying(false);
        setCurrentTurnIndex(-1);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('Speech synthesis is not supported in this browser.');
      return;
    }
    setErrorMessage(null);

    if (activeTab === 'podcast') {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } else {
        const startIdx = currentTurnIndex >= 0 ? currentTurnIndex : 0;
        playPodcastTurn(startIdx);
      }
      return;
    }

    // Narrator Mode
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*`_~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      setErrorMessage('No text available on this page to narrate.');
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
      setCurrentTurnIndex(-1);
    }
  };

  const handleNextTurn = () => {
    if (currentTurnIndex + 1 < dialogueTurns.length) {
      playPodcastTurn(currentTurnIndex + 1);
    }
  };

  const handlePrevTurn = () => {
    if (currentTurnIndex > 0) {
      playPodcastTurn(currentTurnIndex - 1);
    }
  };

  const handleGeneratePodcast = async () => {
    setIsGeneratingPodcast(true);
    setErrorMessage(null);
    handleStop();
    try {
      const res = await generatePodcastScript(title, sourceUrl || 'https://webpage', text);
      setPodcastScript(res.script);
      const parsed = parseScriptIntoTurns(res.script);
      setDialogueTurns(parsed);
      setActiveTab('podcast');
    } catch (err: any) {
      setErrorMessage(`Failed to generate briefing: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSpeaker = currentTurnIndex >= 0 && dialogueTurns[currentTurnIndex]
    ? dialogueTurns[currentTurnIndex].speaker
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Audio Narration Studio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Frontier AI Audio
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-sm sm:max-w-md">{title}</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleStop();
                setActiveTab('narrator');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'narrator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Solo Narrator</span>
            </button>
            <button
              onClick={() => {
                handleStop();
                setActiveTab('podcast');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'podcast'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dual-Speaker Podcast (Alex & Sam)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Speed:</span>
            {[0.8, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setRate(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors ${
                  rate === s
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 font-bold hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'narrator' ? (
            /* Solo Narrator View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-xs">
                  <label className="text-slate-600 font-medium">Select Voice Engine</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-slate-600 font-medium">Voice Pitch ({pitch}x)</label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Text Sample View */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-h-56 overflow-y-auto leading-relaxed">
                {text || 'No textual content extracted from this webpage.'}
              </div>
            </div>
          ) : (
            /* Dual-Speaker Podcast View */
            <div className="space-y-4">
              {isGeneratingPodcast ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Composing Dual-Host AI Podcast...</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Transforming webpage into a lively analytical banter between hosts Alex & Sam.
                  </p>
                </div>
              ) : dialogueTurns.length > 0 ? (
                <div className="space-y-4">
                  {/* Visual Host Equalizer Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Host Alex Card */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        currentSpeaker === 'Alex'
                          ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          AL
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Alex</div>
                          <div className="text-[10px] text-slate-500 font-mono">Lead Analyst</div>
                        </div>
                      </div>
                      {/* Animated Voice Equalizer */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              currentSpeaker === 'Alex'
                                ? 'bg-indigo-600 animate-pulse'
                                : 'bg-slate-300'
                            }`}
                            style={{
                              height: currentSpeaker === 'Alex' ? `${h * 20}px` : '4px',
                              animationDelay: `${i * 80}ms`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Host Sam Card */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        currentSpeaker === 'Sam'
                          ? 'bg-rose-50/80 border-rose-400 shadow-sm ring-2 ring-rose-500/20'
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          SM
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Sam</div>
                          <div className="text-[10px] text-slate-500 font-mono">Inquisitive Co-Host</div>
                        </div>
                      </div>
                      {/* Animated Voice Equalizer */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[0.6, 1.0, 0.5, 0.8, 0.4].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              currentSpeaker === 'Sam'
                                ? 'bg-rose-600 animate-pulse'
                                : 'bg-slate-300'
                            }`}
                            style={{
                              height: currentSpeaker === 'Sam' ? `${h * 20}px` : '4px',
                              animationDelay: `${i * 90}ms`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Dialogue Turns Teleprompter */}
                  <div
                    ref={scriptScrollRef}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-sans max-h-60 overflow-y-auto space-y-3 shadow-inner"
                  >
                    {dialogueTurns.map((turn, idx) => {
                      const isActive = currentTurnIndex === idx;
                      const isAlex = turn.speaker === 'Alex';
                      return (
                        <div
                          key={turn.id}
                          id={`turn-${idx}`}
                          onClick={() => playPodcastTurn(idx)}
                          className={`p-3 rounded-xl transition-all cursor-pointer ${
                            isActive
                              ? isAlex
                                ? 'bg-indigo-950/80 border border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                                : 'bg-rose-950/80 border border-rose-500 shadow-sm ring-1 ring-rose-500'
                              : 'hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span
                              className={`font-bold font-mono ${
                                isAlex ? 'text-indigo-400' : 'text-rose-400'
                              }`}
                            >
                              {turn.speaker}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-emerald-300 flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Speaking
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 leading-relaxed">{turn.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
                    <Radio className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">2-Host Conversational Briefing</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Turn this webpage into a deep dive conversational podcast featuring Alex & Sam with alternating voices and real-time audio visualization.
                  </p>
                  <button
                    onClick={handleGeneratePodcast}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                  >
                    Generate Dual-Host Podcast
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Playback & Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {activeTab === 'podcast' && dialogueTurns.length > 0 && (
              <button
                onClick={handlePrevTurn}
                disabled={currentTurnIndex <= 0}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="Previous dialogue turn"
              >
                <Rewind className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className={`px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                activeTab === 'podcast'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="text-xs">
                {isPlaying ? 'Pause Narration' : isPaused ? 'Resume' : 'Start Listening'}
              </span>
            </button>

            {activeTab === 'podcast' && dialogueTurns.length > 0 && (
              <button
                onClick={handleNextTurn}
                disabled={currentTurnIndex >= dialogueTurns.length - 1}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="Next dialogue turn"
              >
                <FastForward className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleStop}
              className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="Stop playback"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {podcastScript && activeTab === 'podcast' && (
              <>
                <button
                  onClick={() => handleCopyScript(podcastScript)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => onSaveAsNote(`Audio Briefing: ${title}`, podcastScript, sourceUrl)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <StickyNote className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Save Note</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
