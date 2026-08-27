import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Globe,
  CheckCircle2,
  StickyNote,
  Code2,
  X,
  Volume2,
  Zap,
  Search,
  ArrowRight,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { sendAIChat, translateText, factCheckClaim } from '../../services/api';

interface SelectionAiHudProps {
  selectedText: string;
  coords: { x: number; y: number } | null;
  onClose: () => void;
  onSaveAsNote: (title: string, content: string, sourceUrl?: string) => void;
  onOpenAiSidebarWithMessage: (message: string) => void;
}

export const SelectionAiHud: React.FC<SelectionAiHudProps> = ({
  selectedText,
  coords,
  onClose,
  onSaveAsNote,
  onOpenAiSidebarWithMessage,
}) => {
  const [activeModal, setActiveModal] = useState<'explain' | 'translate' | 'factcheck' | null>(null);
  const [resultText, setResultText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('Spanish');

  useEffect(() => {
    setActiveModal(null);
    setResultText('');
  }, [selectedText]);

  if (!coords || !selectedText || selectedText.trim().length < 2) return null;

  const handleExplain = async () => {
    setActiveModal('explain');
    setIsLoading(true);
    try {
      const res = await sendAIChat(
        `Explain the following excerpt concisely in beginner-friendly terms with 2 key points:\n"${selectedText}"`,
        [],
        undefined,
        'explain_simple'
      );
      setResultText(res.reply);
    } catch (err) {
      setResultText('Unable to explain excerpt at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (lang: string = targetLang) => {
    setActiveModal('translate');
    setIsLoading(true);
    try {
      const res = await translateText(selectedText, lang);
      setResultText(res.translatedText);
    } catch (err) {
      setResultText('Translation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFactCheck = async () => {
    setActiveModal('factcheck');
    setIsLoading(true);
    try {
      const res = await factCheckClaim(selectedText);
      setResultText(res.analysis);
    } catch (err) {
      setResultText('Fact check engine could not verify claim.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSnippetToNotes = () => {
    onSaveAsNote(
      `Excerpt: ${selectedText.slice(0, 40)}...`,
      `> "${selectedText}"\n\n*Saved from active webpage*`,
      undefined
    );
    onClose();
  };

  // Keep HUD within bounds
  const clampedX = Math.min(Math.max(coords.x - 120, 20), window.innerWidth - 320);
  const clampedY = Math.max(coords.y - 50, 60);

  return (
    <div
      style={{ top: `${clampedY}px`, left: `${clampedX}px` }}
      className="fixed z-50 select-none"
    >
      <AnimatePresence>
        {!activeModal ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl rounded-xl shadow-2xl p-1 flex items-center gap-1 text-slate-200 text-xs"
          >
            {/* Explain */}
            <button
              onClick={handleExplain}
              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-blue-300 font-medium"
              title="Explain selected text with Gemini 3.7"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain</span>
            </button>

            {/* Translate */}
            <button
              onClick={() => handleTranslate('Spanish')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-indigo-300 font-medium"
              title="Translate selected text"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Translate</span>
            </button>

            {/* Fact Check */}
            <button
              onClick={handleFactCheck}
              className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-emerald-300 font-medium"
              title="Fact check this assertion"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fact Check</span>
            </button>

            {/* Save Note */}
            <button
              onClick={handleSaveSnippetToNotes}
              className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
              title="Save selection as Cornell Note"
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-80 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 space-y-3 text-slate-100 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 capitalize">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeModal} Result</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language selectors if in translation mode */}
            {activeModal === 'translate' && (
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-medium">
                {['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setTargetLang(lang);
                      handleTranslate(lang);
                    }}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      targetLang === lang
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            {/* Content area */}
            <div className="max-h-48 overflow-y-auto pr-1 text-slate-300 leading-relaxed font-sans text-xs select-text">
              {isLoading ? (
                <div className="py-4 text-center space-y-2">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-[11px] text-slate-400">Processing with Gemini 3.7...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{resultText}</div>
              )}
            </div>

            {/* Actions footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <button
                onClick={() => {
                  onSaveAsNote(`Insight: ${selectedText.slice(0, 30)}`, resultText);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 cursor-pointer"
              >
                <StickyNote className="w-3 h-3 text-yellow-400" />
                <span>Save to Notes</span>
              </button>
              <button
                onClick={() => {
                  onOpenAiSidebarWithMessage(`Regarding: "${selectedText}"\n${resultText}`);
                  onClose();
                }}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Ask AI Co-Pilot</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
