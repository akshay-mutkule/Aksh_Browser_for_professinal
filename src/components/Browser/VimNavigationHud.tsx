import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, Zap, X, HelpCircle } from 'lucide-react';

interface VimNavigationHudProps {
  enabled: boolean;
  onToggleEnabled: () => void;
  onNavigate?: (url: string) => void;
  onCloseTab?: () => void;
  onNewTab?: () => void;
  onReloadTab?: () => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onFocusAddressBar?: () => void;
}

interface HintTarget {
  id: string;
  hint: string;
  rect: DOMRect;
  element: HTMLElement;
  text?: string;
}

// Letter pairs for quick hints: AA, AB, AC, ...
const HINT_CHARS = 'ASDFJKLGHWERUIO';

function generateHints(count: number): string[] {
  const hints: string[] = [];
  for (let i = 0; i < count; i++) {
    const firstChar = HINT_CHARS[Math.floor(i / HINT_CHARS.length) % HINT_CHARS.length];
    const secondChar = HINT_CHARS[i % HINT_CHARS.length];
    hints.push(`${firstChar}${secondChar}`);
  }
  return hints;
}

export const VimNavigationHud: React.FC<VimNavigationHudProps> = ({
  enabled,
  onToggleEnabled,
  onNavigate,
  onCloseTab,
  onNewTab,
  onReloadTab,
  onGoBack,
  onGoForward,
  onFocusAddressBar,
}) => {
  const [isHintsMode, setIsHintsMode] = useState(false);
  const [hintTargets, setHintTargets] = useState<HintTarget[]>([]);
  const [typedChars, setTypedChars] = useState('');
  const [showVimHelp, setShowVimHelp] = useState(false);
  const lastKeyTimeRef = useRef<number>(0);
  const gCountRef = useRef<number>(0);

  // Scan viewport for clickable links and buttons when hints mode is activated
  const scanClickableElements = useCallback(() => {
    const selector = 'a, button, [role="button"], input[type="submit"], [data-vim-hint]';
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    
    // Filter to visible elements in viewport
    const visibleElements = elements.filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top >= 0 &&
        rect.top <= window.innerHeight &&
        rect.left >= 0 &&
        rect.left <= window.innerWidth &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      );
    });

    const hints = generateHints(visibleElements.length);
    const targets: HintTarget[] = visibleElements.map((el, idx) => ({
      id: `vim-${idx}`,
      hint: hints[idx] || `H${idx}`,
      rect: el.getBoundingClientRect(),
      element: el,
      text: el.innerText?.slice(0, 15),
    }));

    setHintTargets(targets);
  }, []);

  // Global key listener for Vim commands
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // If user presses Escape, always exit hints or blur
      if (e.key === 'Escape') {
        if (isHintsMode) {
          setIsHintsMode(false);
          setTypedChars('');
          e.preventDefault();
          return;
        }
        if (isInput) {
          (activeElement as HTMLElement).blur();
          e.preventDefault();
          return;
        }
      }

      // If inside an input/textarea and not Escape, do nothing
      if (isInput) return;

      // Handle hints mode typing
      if (isHintsMode) {
        const char = e.key.toUpperCase();
        if (HINT_CHARS.includes(char)) {
          e.preventDefault();
          const nextTyped = typedChars + char;
          setTypedChars(nextTyped);

          if (nextTyped.length === 2) {
            // Find matching hint
            const match = hintTargets.find((t) => t.hint === nextTyped);
            if (match) {
              match.element.click();
              // If it's a link with href, navigate
              const href = match.element.getAttribute('href');
              if (href && onNavigate && !href.startsWith('#')) {
                onNavigate(href);
              }
            }
            setIsHintsMode(false);
            setTypedChars('');
          }
          return;
        } else {
          // Any other key exits hints mode
          setIsHintsMode(false);
          setTypedChars('');
          return;
        }
      }

      // Normal mode Vim shortcuts
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        scanClickableElements();
        setIsHintsMode(true);
        setTypedChars('');
        return;
      }

      // Smooth scrolling
      if (e.key === 'j') {
        e.preventDefault();
        window.scrollBy({ top: 140, behavior: 'smooth' });
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        window.scrollBy({ top: -140, behavior: 'smooth' });
        return;
      }
      if (e.key === 'd' && !e.ctrlKey) {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' });
        return;
      }
      if (e.key === 'u' && !e.ctrlKey) {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.5, behavior: 'smooth' });
        return;
      }

      // gg / G (top / bottom of page)
      if (e.key === 'g') {
        const now = Date.now();
        if (now - lastKeyTimeRef.current < 400) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          gCountRef.current = 0;
        } else {
          gCountRef.current = 1;
        }
        lastKeyTimeRef.current = now;
        return;
      }
      if (e.key === 'G') {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
      }

      // Tab controls
      if (e.key === 'x') {
        e.preventDefault();
        onCloseTab?.();
        return;
      }
      if (e.key === 't') {
        e.preventDefault();
        onNewTab?.();
        return;
      }
      if (e.key === 'r') {
        e.preventDefault();
        onReloadTab?.();
        return;
      }
      if (e.key === 'H') {
        e.preventDefault();
        onGoBack?.();
        return;
      }
      if (e.key === 'L') {
        e.preventDefault();
        onGoForward?.();
        return;
      }
      if (e.key === 'i') {
        e.preventDefault();
        onFocusAddressBar?.();
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setShowVimHelp((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    isHintsMode,
    typedChars,
    hintTargets,
    scanClickableElements,
    onNavigate,
    onCloseTab,
    onNewTab,
    onReloadTab,
    onGoBack,
    onGoForward,
    onFocusAddressBar,
  ]);

  if (!enabled) return null;

  return (
    <>
      {/* Link Hints Overlay */}
      {isHintsMode && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {hintTargets.map((target) => (
            <div
              key={target.id}
              style={{
                position: 'fixed',
                top: `${target.rect.top}px`,
                left: `${target.rect.left}px`,
              }}
              className="transform -translate-y-1/2 -translate-x-1/2"
            >
              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-amber-400 text-slate-950 border border-amber-300 shadow-lg tracking-wider">
                {target.hint}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Floating Vim HUD Indicator (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white border border-slate-700/80 shadow-xl backdrop-blur-md text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isHintsMode ? (
            <span className="text-amber-300 font-bold">
              [VIM HINTS: Type 2 letters {typedChars ? `(${typedChars}...)` : ''} | Esc cancel]
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">[VIM: NORMAL]</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                'f' hints • j/k scroll • x close • ? help
              </span>
            </div>
          )}

          <button
            onClick={() => setShowVimHelp(true)}
            className="p-1 hover:text-indigo-400 text-slate-400 transition-colors cursor-pointer"
            title="Vim Keybindings Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Vim Help Modal */}
      {showVimHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Vim Navigation Quick Reference</h3>
              </div>
              <button
                onClick={() => setShowVimHelp(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">f</span>
                <span className="text-slate-300">Link Hints mode (jump to any link/button)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">j / k</span>
                <span className="text-slate-300">Scroll down / up</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">d / u</span>
                <span className="text-slate-300">Half-page scroll down / up</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">gg / G</span>
                <span className="text-slate-300">Scroll to top / bottom</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">x</span>
                <span className="text-slate-300">Close active tab</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">t</span>
                <span className="text-slate-300">Open new tab</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">r</span>
                <span className="text-slate-300">Reload current tab</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">H / L</span>
                <span className="text-slate-300">History back / forward</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">i</span>
                <span className="text-slate-300">Focus omnibar / address input</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400 font-bold">Esc</span>
                <span className="text-slate-300">Exit hints or blur input</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowVimHelp(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
