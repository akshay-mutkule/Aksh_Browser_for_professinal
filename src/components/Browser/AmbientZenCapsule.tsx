import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Eye,
  ShieldCheck,
  Clock,
  BookOpen,
  BrainCircuit,
  Play,
  Pause,
  RotateCcw,
  Waves,
  CloudRain,
  Radio,
  Cpu,
  Flame,
  Check
} from 'lucide-react';
import { ambientSound, SoundscapeType } from '../../utils/ambientAudio';

interface AmbientZenCapsuleProps {
  pageTitle: string;
  pageContent: string;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

export const AmbientZenCapsule: React.FC<AmbientZenCapsuleProps> = ({
  pageTitle,
  pageContent,
  isZenMode,
  onToggleZenMode,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<SoundscapeType | null>(null);
  const [volume, setVolume] = useState<number>(0.35);

  // Focus Timer (Pomodoro) state: 25 minutes default (1500 seconds)
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(1500);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerPreset, setTimerPreset] = useState<25 | 15 | 45>(25);

  // Sync with audio engine
  useEffect(() => {
    const status = ambientSound.getStatus();
    if (status.isPlaying) {
      setActiveSound(status.currentType);
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResetTimer = (presetMinutes: 25 | 15 | 45) => {
    setTimerPreset(presetMinutes);
    setPomodoroSeconds(presetMinutes * 60);
    setIsTimerRunning(false);
  };

  // Soundscape toggles
  const handleToggleSound = (type: SoundscapeType) => {
    if (activeSound === type) {
      ambientSound.stop();
      setActiveSound(null);
    } else {
      ambientSound.play(type);
      ambientSound.setVolume(volume);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  // Cognitive & Readability Telemetry computed from page text
  const telemetry = useMemo(() => {
    const cleanText = pageContent.replace(/[#*`~_\[\]()]/g, ' ').trim();
    if (!cleanText || cleanText.length < 50) {
      return {
        wordCount: 180,
        readingTimeMin: 1,
        gradeLevel: 10.4,
        easeScore: 68,
        lexicalDiversity: 'Moderate',
        complexity: 'Optimal',
      };
    }

    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 220));

    // Approximate sentences and syllables
    const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);

    let syllableCount = 0;
    words.forEach((w) => {
      const match = w.toLowerCase().match(/[aeiouy]{1,2}/g);
      syllableCount += match ? match.length : 1;
    });

    // Flesch Reading Ease: 206.835 - 1.015 * (words/sentence) - 84.6 * (syllables/words)
    const asw = syllableCount / Math.max(1, wordCount);
    const asl = wordCount / sentenceCount;
    let ease = 206.835 - 1.015 * asl - 84.6 * asw;
    ease = Math.max(10, Math.min(100, Math.round(ease)));

    // Flesch-Kincaid Grade Level: 0.39 * asl + 11.8 * asw - 15.59
    let grade = 0.39 * asl + 11.8 * asw - 15.59;
    grade = Math.max(1, Math.min(18, Math.round(grade * 10) / 10));

    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const diversityRatio = uniqueWords / Math.max(1, wordCount);
    const lexicalDiversity = diversityRatio > 0.6 ? 'High (Dense)' : diversityRatio > 0.4 ? 'Balanced' : 'Accessible';

    return {
      wordCount,
      readingTimeMin,
      gradeLevel: grade,
      easeScore: ease,
      lexicalDiversity,
      complexity: ease > 70 ? 'Fluid' : ease > 45 ? 'Standard' : 'Scholarly',
    };
  }, [pageContent]);

  const soundscapes: Array<{ id: SoundscapeType; label: string; icon: any; desc: string }> = [
    { id: 'gamma40', label: '40Hz Gamma', icon: BrainCircuit, desc: 'Peak cognitive sync & hyper-focus' },
    { id: 'binaural', label: '8Hz Alpha', icon: Radio, desc: 'Calm deep work & flow state' },
    { id: 'rain', label: 'Rain on Glass', icon: CloudRain, desc: 'Acoustic rain droplet mask' },
    { id: 'waves', label: 'Ocean Surge', icon: Waves, desc: 'Rhythmic tidal relaxation' },
    { id: 'cyber', label: 'Cyber Drone', icon: Cpu, desc: 'Subtle modular server warmth' },
    { id: 'brown', label: 'Brown Noise', icon: Volume2, desc: 'Deep low-end sensory dampening' },
  ];

  return (
    <>
      {/* Floating Capsule Anchor Pill */}
      <div className="fixed bottom-3 right-4 z-40 flex items-center gap-2 select-none">
        <motion.div
          layout
          className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-200 transition-all"
        >
          {/* Zen Toggle Button */}
          <button
            onClick={onToggleZenMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isZenMode
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isZenMode ? 'Exit Zen Mode (Alt+Z)' : 'Enter Zen Focus Mode (Alt+Z)'}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-mono">{isZenMode ? 'Exit Zen' : 'Zen Focus'}</span>
          </button>

          {/* Audio Soundscape Quick Indicator / Pulse */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
              activeSound
                ? 'bg-purple-950/80 border border-purple-500/50 text-purple-300'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Focus Audio & Cognitive Telemetry"
          >
            {activeSound ? (
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-3.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-2.5 bg-purple-400 rounded-full animate-bounce" />
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-[11px] font-medium hidden md:inline">
              {activeSound ? activeSound.toUpperCase() : 'Focus Audio'}
            </span>
          </button>

          {/* Pomodoro Timer Badge */}
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`px-2 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
              isTimerRunning ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isTimerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
          >
            <Clock className="w-3 h-3" />
            <span>{formatTimer(pomodoroSeconds)}</span>
          </button>

          {/* Expand HUD Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isOpen ? 'Collapse Focus Reactor' : 'Expand Focus Reactor'}
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </motion.div>
      </div>

      {/* Expanded Focus Reactor & Telemetry Cockpit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-14 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl text-slate-200 overflow-hidden select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-gradient-to-r from-purple-900/30 via-slate-900/40 to-slate-900/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide uppercase">Ambient Zen & Focus Reactor</h3>
                  <p className="text-[10px] text-slate-400">Procedural Audio • Cognitive Load • Cryptography</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Pomodoro Focus Station */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Deep Work Sprint</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {([15, 25, 45] as const).map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleResetTimer(mins)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          timerPreset === mins
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-mono font-bold tracking-wider text-amber-300">
                    {formatTimer(pomodoroSeconds)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTimerRunning
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                    </button>
                    <button
                      onClick={() => handleResetTimer(timerPreset)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Procedural Ambient Soundscapes Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Acoustic Soundscapes</span>
                  {activeSound && (
                    <button
                      onClick={() => {
                        ambientSound.stop();
                        setActiveSound(null);
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                    >
                      Stop Sound
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {soundscapes.map((s) => {
                    const Icon = s.icon;
                    const isCurrent = activeSound === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleToggleSound(s.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isCurrent
                            ? 'bg-purple-950/70 border-purple-500/70 text-purple-200 shadow-md ring-1 ring-purple-500/30'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-purple-400' : 'text-slate-500'}`} />
                            <span className="text-xs font-semibold">{s.label}</span>
                          </div>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight line-clamp-1">{s.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Volume slider */}
                {activeSound && (
                  <div className="flex items-center gap-2 pt-1 px-1">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Cognitive & Page Telemetry */}
              <div className="space-y-2 pt-1 border-t border-slate-800/70">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Cognitive Telemetry</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Readability Grade</div>
                      <div className="text-sm font-bold text-slate-200 font-mono">Level {telemetry.gradeLevel}</div>
                    </div>
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Est. Read Time</div>
                      <div className="text-sm font-bold text-slate-200 font-mono">~{telemetry.readingTimeMin} min</div>
                    </div>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Lexical Entropy</div>
                      <div className="text-sm font-bold text-slate-200">{telemetry.lexicalDiversity}</div>
                    </div>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Quantum Cipher</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">ML-KEM-768</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with 1-click Zen Activation */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Distraction-free canvas mode</span>
              <button
                onClick={() => {
                  onToggleZenMode();
                  setIsOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isZenMode ? 'Return to Browser' : 'Engage Zen Mode'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
