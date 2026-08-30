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
  Languages,
  GraduationCap,
  Share2,
  Copy,
  Check
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
  const [activeModal, setActiveModal] = useState<'explain' | 'translate' | 'factcheck' | 'flashcard' | null>(null);
  const [resultText, setResultText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('Spanish');
  const [copied, setCopied] = useState<boolean>(false);

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

  const handleGenerateFlashcard = async () => {
    setActiveModal('flashcard');
    setIsLoading(true);
    try {
      const res = await sendAIChat(
        `Convert this excerpt into a crisp high-yield flashcard (Front Question & Back Answer):\n"${selectedText}"`,
        [],
        undefined,
        'general'
      );
      setResultText(res.reply);
    } catch (err) {
      setResultText('Flashcard generation failed.');
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

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keep HUD within bounds
  const clampedX = Math.min(Math.max(coords.x - 120, 20), window.innerWidth - 340);
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
            className="bg-white/98 border border-slate-300 backdrop-blur-xl rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 text-slate-800 text-xs shadow-slate-900/10"
          >
            {/* Explain */}
            <button
              onClick={handleExplain}
              className="px-2.5 py-1.5 rounded-xl hover:bg-blue-50 text-blue-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Explain selected text with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Explain</span>
            </button>

            {/* Translate */}
            <button
              onClick={() => handleTranslate('Spanish')}
              className="px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Translate selected text"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600" />
              <span>Translate</span>
            </button>

            {/* Fact Check */}
            <button
              onClick={handleFactCheck}
              className="px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Fact check this assertion"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fact Check</span>
            </button>

            {/* Flashcard */}
            <button
              onClick={handleGenerateFlashcard}
              className="p-1.5 rounded-xl hover:bg-purple-50 text-purple-700 transition-colors cursor-pointer"
              title="Generate study flashcard"
            >
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </button>

            {/* Save Note */}
            <button
              onClick={handleSaveSnippetToNotes}
              className="p-1.5 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors cursor-pointer"
              title="Save selection as Cornell Note"
            >
              <StickyNote className="w-4 h-4 text-amber-600" />
            </button>

            {/* Dismiss */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-84 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 space-y-3 text-slate-900 text-xs shadow-slate-900/15"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 capitalize">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{activeModal} Insight</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Copy result"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Language selectors if in translation mode */}
            {activeModal === 'translate' && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium scrollbar-none">
                {['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setTargetLang(lang);
                      handleTranslate(lang);
                    }}
                    className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors shrink-0 ${
                      targetLang === lang
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            {/* Content area */}
            <div className="max-h-48 overflow-y-auto pr-1 text-slate-700 leading-relaxed font-sans text-xs select-text">
              {isLoading ? (
                <div className="py-4 text-center space-y-2">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
                  <p className="text-[11px] text-slate-500 font-medium">Processing with Gemini 3.7...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{resultText}</div>
              )}
            </div>

            {/* Actions footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <button
                onClick={() => {
                  onSaveAsNote(`Insight: ${selectedText.slice(0, 30)}`, resultText);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                <span>Save to Notes</span>
              </button>
              <button
                onClick={() => {
                  onOpenAiSidebarWithMessage(`Regarding: "${selectedText}"\n${resultText}`);
                  onClose();
                }}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Ask AI Co-Pilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

