import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookmarkPlus,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { QuizQuestion, PageQuizResult, generatePageQuiz } from '../../services/api';

interface PageQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageUrl: string;
  pageContent: string;
  onSaveAsNote: (title: string, content: string) => void;
}

export const PageQuizModal: React.FC<PageQuizModalProps> = ({
  isOpen,
  onClose,
  pageTitle,
  pageUrl,
  pageContent,
  onSaveAsNote,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<PageQuizResult | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (!quizData) {
        handleLoadQuiz();
      }
    } else {
      setSavedToNotes(false);
    }
  }, [isOpen]);

  const handleLoadQuiz = async () => {
    setIsLoading(true);
    setIsFinished(false);
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIdx(0);

    try {
      const data = await generatePageQuiz(pageTitle, pageUrl, pageContent);
      setQuizData(data);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      // Fallback
      setQuizData({
        title: `Comprehension Challenge: ${pageTitle}`,
        summary: 'Conceptual verification test based on page content.',
        questions: [
          {
            id: 1,
            question: `What is the primary architectural concept covered in "${pageTitle}"?`,
            options: [
              'Technical scaling and resilient systems design',
              'Monolithic non-redundant computation',
              'Traditional consumer manufacturing',
              'None of the above',
            ],
            correctIndex: 0,
            explanation: 'The page discusses modern software and computing architectures.',
            conceptTag: 'Core Architecture',
          },
          {
            id: 2,
            question: 'What is the optimal strategy for maintaining high availability in distributed applications?',
            options: [
              'Single point of failure configurations',
              'Stateless scaling, health checks, and redundant instances',
              'Manual server restarts during traffic spikes',
              'Disabling telemetry metrics',
            ],
            correctIndex: 1,
            explanation: 'Stateless instances and automated failovers ensure continuous availability.',
            conceptTag: 'Availability',
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  };

  const calculateScore = () => {
    if (!quizData) return { score: 0, total: 0, percent: 0 };
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return {
      score: correct,
      total: quizData.questions.length,
      percent: Math.round((correct / quizData.questions.length) * 100),
    };
  };

  const handleSaveAsStudyCards = () => {
    if (!quizData) return;
    const { score, total, percent } = calculateScore();
    let md = `# 🎓 Active Recall Study Deck: ${quizData.title}\n\n`;
    md += `**Source Document:** [${pageTitle}](${pageUrl})\n`;
    md += `**Score Achieved:** ${score}/${total} (${percent}%)\n`;
    md += `**Generated At:** ${new Date().toLocaleDateString()}\n\n---\n\n`;

    quizData.questions.forEach((q, idx) => {
      md += `### ❓ Card #${idx + 1}: ${q.question}\n`;
      if (q.conceptTag) md += `*Tag: #${q.conceptTag.replace(/\s+/g, '')}*\n\n`;
      q.options.forEach((opt, oIdx) => {
        const marker = oIdx === q.correctIndex ? '✅' : '⚪';
        md += `- ${marker} **${String.fromCharCode(65 + oIdx)}:** ${opt}\n`;
      });
      md += `\n**💡 Explanation & Proof:**\n${q.explanation}\n\n---\n\n`;
    });

    onSaveAsNote(`Quiz Deck: ${pageTitle.slice(0, 30)}`, md);
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2500);
  };

  if (!isOpen) return null;

  const currentQ = quizData?.questions[currentIdx];
  const isLastQuestion = quizData ? currentIdx === quizData.questions.length - 1 : false;
  const hasAnsweredCurrent = currentQ ? selectedAnswers[currentQ.id] !== undefined : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Active Recall & Comprehension Quiz</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                Grounded verification based on "{pageTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Generating Rigorous Conceptual Quiz...</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Gemini 3.7 is analyzing the active document to formulate high-yield active recall questions.
                </p>
              </div>
            </div>
          ) : isFinished ? (
            /* Results Screen */
            <div className="py-6 space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h3>
                <p className="text-xs text-slate-500">{quizData?.summary}</p>
              </div>

              {/* Score Metric Card */}
              {(() => {
                const { score, total, percent } = calculateScore();
                return (
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 max-w-sm mx-auto space-y-3 shadow-xs">
                    <div className="text-4xl font-black text-slate-900">{score} / {total}</div>
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {percent}% Conceptual Mastery
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSaveAsStudyCards}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {savedToNotes ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved to AI Notes!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Export as Study Deck to Notes</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleLoadQuiz}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question View */
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">
                    Question {currentIdx + 1} of {quizData?.questions.length}
                  </span>
                  {currentQ.conceptTag && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                      #{currentQ.conceptTag}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {quizData?.questions.map((q, idx) => (
                    <span
                      key={q.id}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx === currentIdx
                          ? 'bg-emerald-600 scale-110'
                          : selectedAnswers[q.id] !== undefined
                          ? selectedAnswers[q.id] === q.correctIndex
                            ? 'bg-emerald-300'
                            : 'bg-rose-300'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <h4 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  const hasAnswered = selectedAnswers[currentQ.id] !== undefined;

                  let cardStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
                  if (hasAnswered) {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-2 ring-emerald-400/20';
                    } else if (isSelected) {
                      cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold ring-2 ring-rose-400/20';
                    } else {
                      cardStyle = 'bg-white opacity-50 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 shadow-2xs cursor-pointer ${cardStyle}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                          hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {showExplanation[currentQ.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1"
                >
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scientific Proof & Explanation</span>
                  </div>
                  <p className="text-emerald-950 leading-relaxed">{currentQ.explanation}</p>
                </motion.div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Navigation */}
        {!isLoading && !isFinished && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-3 py-1.5 rounded-xl hover:bg-slate-200 text-slate-600 text-xs font-semibold disabled:opacity-30 transition-colors cursor-pointer"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {isLastQuestion ? (
                <button
                  onClick={() => setIsFinished(true)}
                  disabled={!hasAnsweredCurrent}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Finish & View Score</span>
                  <Award className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  disabled={!hasAnsweredCurrent}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
