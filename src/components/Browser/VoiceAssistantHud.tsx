import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  ArrowRight,
  BrainCircuit,
  Layers,
  Scale,
  Bot,
  SplitSquareVertical,
  Search,
  BookOpen,
  Check,
  RotateCcw,
  Send,
  Code2,
  Zap
} from 'lucide-react';
import { sendAIChat } from '../../services/api';

interface VoiceAssistantHudProps {
  isOpen: boolean;
  onClose: () => void;
  activeUrl?: string;
  activeTitle?: string;
  onNavigate: (url: string) => void;
  onTriggerAiSummary: () => void;
  onToggleSplitScreen: () => void;
  onOpenQuiz?: () => void;
}

export const VoiceAssistantHud: React.FC<VoiceAssistantHudProps> = ({
  isOpen,
  onClose,
  activeUrl,
  activeTitle,
  onNavigate,
  onTriggerAiSummary,
  onToggleSplitScreen,
  onOpenQuiz,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('Listening for voice commands...');
  const [aiVoiceReply, setAiVoiceReply] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Real Web Audio FFT Analyser Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const speakReply = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExecuteCommand = async (commandText: string) => {
    const clean = commandText.trim().toLowerCase();
    if (!clean) return;

    setIsProcessing(true);
    setStatusMessage(`Executing: "${commandText}"`);

    // Voice command dispatching
    if (clean.includes('summarize') || clean.includes('summary')) {
      const reply = `Summarizing ${activeTitle || 'current webpage'} using Gemini.`;
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onTriggerAiSummary();
        onClose();
      }, 1200);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('sandbox') || clean.includes('compiler') || clean.includes('code')) {
      const reply = 'Opening AI Live Code Sandbox and Compiler.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate('aksh://sandbox');
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('synapse') || clean.includes('cross tab') || clean.includes('cross-tab')) {
      const reply = 'Launching Neural Multi-Tab Synapse Matrix.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate('aksh://synapse');
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('canvas') || clean.includes('spatial') || clean.includes('graph')) {
      const reply = 'Navigating to Neural Spatial Knowledge Canvas.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate('aksh://canvas');
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('matrix') || clean.includes('benchmark') || clean.includes('models')) {
      const reply = 'Opening Multi-Model Intelligence Matrix.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate('aksh://matrix');
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('agent') || clean.includes('autonomous') || clean.includes('mission') || clean.includes('swarm')) {
      const reply = 'Launching Autonomous Multi-Agent Swarm Orchestrator.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate('aksh://agent');
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('split') || clean.includes('dual pane')) {
      const reply = 'Toggling side-by-side split screen view.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onToggleSplitScreen();
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('quiz') || clean.includes('test')) {
      const reply = 'Generating active recall comprehension quiz for this page.';
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onOpenQuiz?.();
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('research')) {
      const query = clean.replace(/^(?:run|do|conduct)?\s*research\s*(?:on|about)?\s*/i, '').trim();
      const reply = `Initiating deep research for: ${query || 'Frontier Topics'}.`;
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate(`aksh://research?q=${encodeURIComponent(query || 'AI Architectures')}`);
        onClose();
      }, 1200);
      setIsProcessing(false);
      return;
    }

    if (clean.includes('search') || clean.includes('google')) {
      const query = clean.replace(/^(?:search|google|find)\s*(?:for)?\s*/i, '').trim();
      const reply = `Searching Google for ${query}...`;
      setAiVoiceReply(reply);
      speakReply(reply);
      setTimeout(() => {
        onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        onClose();
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // Natural conversation answer using Gemini
    try {
      const prompt = `You are Aksh Voice Assistant. Give a concise, conversational 1-2 sentence spoken reply to this voice query: "${commandText}"`;
      const res = await sendAIChat(prompt, [], undefined, 'general', 'gemini-3.7-flash');
      const spokenText = res.reply || 'Command processed.';
      setAiVoiceReply(spokenText);
      speakReply(spokenText);
    } catch {
      const fallback = `Processed command: "${commandText}".`;
      setAiVoiceReply(fallback);
      speakReply(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  // Web Audio Analyser & Speech Recognition Lifecycle
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsListening(false);
      return;
    }

    setTranscript('');
    setCustomQuery('');
    setAiVoiceReply(null);
    setStatusMessage('Listening... Speak a browser command or question');

    // Attempt to initialize real Web Audio Analyser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          streamRef.current = stream;
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioCtxRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
          }
        })
        .catch(() => {
          // Microphone permission not granted or hardware absent
        });
    }

    // High-performance canvas animation loop
    let time = 0;
    const drawSpectrum = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const barCount = 28;
          const barWidth = 4;
          const barSpacing = (width - barCount * barWidth) / (barCount - 1 || 1);

          if (analyserRef.current) {
            const data = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(data);

            for (let i = 0; i < barCount; i++) {
              const binIndex = Math.min(i, data.length - 1);
              const val = data[binIndex] / 255;
              const barHeight = Math.max(3, val * height * 0.9);
              const x = i * (barWidth + barSpacing);
              const y = (height - barHeight) / 2;

              const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
              gradient.addColorStop(0, '#c084fc');
              gradient.addColorStop(1, '#6366f1');

              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.roundRect(x, y, barWidth, barHeight, 2);
              ctx.fill();
            }
          } else {
            // Synthetic Harmonic Fourier Fallback
            time += 0.08;
            for (let i = 0; i < barCount; i++) {
              const harmonic = Math.sin(time + i * 0.35) * Math.cos(time * 0.5 + i * 0.2);
              const amp = Math.abs(harmonic) * (isListening ? 0.85 : 0.3);
              const barHeight = Math.max(3, amp * height);
              const x = i * (barWidth + barSpacing);
              const y = (height - barHeight) / 2;

              const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
              gradient.addColorStop(0, '#38bdf8');
              gradient.addColorStop(1, '#a855f7');

              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.roundRect(x, y, barWidth, barHeight, 2);
              ctx.fill();
            }
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(drawSpectrum);
    };

    animFrameRef.current = requestAnimationFrame(drawSpectrum);

    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e: any) => {
          const current = Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join(' ');
          setTranscript(current);

          // Check if speech was finalized
          const isFinal = e.results[e.results.length - 1].isFinal;
          if (isFinal) {
            handleExecuteCommand(current);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setStatusMessage('Microphone offline. Type or click any voice preset below:');
        };

        recognition.onend = () => setIsListening(false);
        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        setIsListening(false);
        setStatusMessage('Click a voice command preset to execute:');
      }
    } else {
      setIsListening(false);
      setStatusMessage('Voice recognition idle. Type query or click preset:');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const SUGGESTED_COMMANDS = [
    { label: '✨ "Summarize this page"', cmd: 'Summarize this page' },
    { label: '🎨 "Open Knowledge Canvas"', cmd: 'Open neural canvas in split screen' },
    { label: '⚡ "Launch Code Sandbox"', cmd: 'Open code sandbox' },
    { label: '🧠 "Neural Synapse Matrix"', cmd: 'Launch neural synapse cross tab' },
    { label: '🤖 "Launch Autonomous Swarm"', cmd: 'Launch autonomous multi agent swarm' },
    { label: '⚖️ "Compare models on tab"', cmd: 'Compare models' },
    { label: '🔀 "Toggle Split Screen"', cmd: 'Toggle split screen' },
    { label: '❓ "Generate Page Quiz"', cmd: 'Generate quiz' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col items-center relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Glow & Voice Orb */}
        <div className="relative my-4 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.25, 1.05, 1.2, 1] : 1,
              opacity: isListening ? [0.6, 0.9, 0.7, 0.9, 0.6] : 0.3,
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute -inset-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 blur-xl -z-10"
          />

          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
              isListening
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/40'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Real Web Audio FFT Frequency Spectrum Canvas */}
        <div className="my-2 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={280}
            height={36}
            className="rounded-xl bg-slate-950/60 border border-slate-800/80 px-2 shadow-inner"
          />
          <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
            {analyserRef.current ? 'Live FFT Audio Stream' : 'Harmonic Spectrum Synthesizer'}
          </span>
        </div>

        {/* Spoken Query or Status */}
        <div className="text-center my-2 max-w-sm w-full">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            Aksh Voice & AI Co-Pilot
          </p>
          <h3 className="text-sm font-bold text-white min-h-[1.75rem] flex items-center justify-center px-4">
            {transcript ? `"${transcript}"` : statusMessage}
          </h3>
          {aiVoiceReply && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-400 mt-2 font-medium bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl"
            >
              🔊 {aiVoiceReply}
            </motion.p>
          )}

          {/* Quick Command Text Input */}
          <div className="flex items-center gap-2 mt-3 w-full">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && customQuery.trim() && handleExecuteCommand(customQuery)}
              placeholder="Or type voice command (e.g. 'sandbox', 'synapse')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => customQuery.trim() && handleExecuteCommand(customQuery)}
              disabled={!customQuery.trim() || isProcessing}
              className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white cursor-pointer transition-colors shadow-md"
              title="Send Command"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Suggested Voice Commands */}
        <div className="w-full mt-3 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center">
            Or Click a Voice Command Preset:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {SUGGESTED_COMMANDS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(item.cmd);
                  handleExecuteCommand(item.cmd);
                }}
                disabled={isProcessing}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
