import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Check, Sparkles, User, ExternalLink, BookmarkPlus } from 'lucide-react';
import { AIMessage } from '../../types';

interface AIMessageItemProps {
  message: AIMessage;
  onSaveAsNote?: (title: string, content: string) => void;
}

export const AIMessageItem: React.FC<AIMessageItemProps> = ({ message, onSaveAsNote }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    if (onSaveAsNote) {
      const firstLine = message.content.split('\n')[0].replace(/[#*`]/g, '').trim() || 'AI Insight';
      onSaveAsNote(firstLine.slice(0, 45), message.content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 text-sm transition-all duration-200 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Content Container */}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs transition-all ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-xs'
            : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
        ) : (
          <div className="space-y-2">
            <div className="markdown-body max-w-none text-slate-800 text-sm">
              <Markdown>{message.content}</Markdown>
            </div>

            {/* Sources List if Grounded */}
            {message.sources && message.sources.length > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-blue-600" />
                  <span>Cited Web Sources:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {message.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] px-2 py-0.5 rounded-full bg-white hover:bg-slate-100 text-blue-700 hover:text-blue-900 flex items-center gap-1 border border-slate-200 transition-colors shadow-2xs"
                      title={src.url}
                    >
                      <span className="truncate max-w-[160px]">{src.title || src.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span className="text-[10px] text-slate-400">{message.timestamp}</span>
              <div className="flex items-center gap-1">
                {onSaveAsNote && (
                  <button
                    onClick={handleSaveNote}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                    title="Save to AI Notes"
                  >
                    {saved ? (
                      <span className="text-emerald-600 flex items-center gap-0.5 text-[10px] font-medium">
                        <Check className="w-3 h-3" /> Saved
                      </span>
                    ) : (
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
