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
  RotateCcw
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
  const [statusMessage, setStatusMessage] = useState('Listening for voice commands...');
  const [aiVoiceReply, setAiVoiceReply] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

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

    if (clean.includes('agent') || clean.includes('autonomous') || clean.includes('mission')) {
      const reply = 'Launching Autonomous Agent Command Center.';
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

  // Start speech recognition when opened
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setTranscript('');
    setAiVoiceReply(null);
    setStatusMessage('Listening... Speak a browser command or question');

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
          setStatusMessage('Microphone offline. Click any voice preset below to test:');
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
      setStatusMessage('Voice recognition not supported in this environment. Click a command:');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
    { label: '⚖️ "Compare models on this tab"', cmd: 'Compare models' },
    { label: '🤖 "Launch Autonomous Agent"', cmd: 'Launch autonomous agent' },
    { label: '⚡ "Research Quantum Computing"', cmd: 'Research quantum computing breakthroughs' },
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

        {/* Dynamic Animated Voice Waveform Bars */}
        <div className="flex items-center gap-1.5 h-8 my-2">
          {[0.6, 1.2, 0.8, 1.5, 0.9, 1.3, 0.7, 1.1, 0.5].map((h, i) => (
            <motion.div
              key={i}
              animate={{
                height: isListening ? [10, 28 * h, 8, 24 * h, 10] : 4,
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8 + i * 0.1,
                ease: 'easeInOut',
              }}
              className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
            />
          ))}
        </div>

        {/* Spoken Query or Status */}
        <div className="text-center my-3 max-w-sm">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            Aksh Voice Co-Pilot
          </p>
          <h3 className="text-base font-bold text-white min-h-[1.75rem] flex items-center justify-center">
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
        </div>

        {/* Suggested Voice Commands */}
        <div className="w-full mt-4 pt-4 border-t border-slate-800">
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
