import React, { useState } from 'react';
import { Quote } from '../types';
import { Copy, Check, Quote as QuoteIcon } from 'lucide-react';

interface QuotesPageProps {
  quotes: Quote[];
}

export const QuotesPage: React.FC<QuotesPageProps> = ({ quotes }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (quote: Quote) => {
    const textToCopy = `"${quote.text}" — ${quote.attribution || 'Unknown'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          Liner Notes & Aphorisms
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          Quotes & Thoughts
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          Statements, interview fragments, lyrical reflections, and philosophical fragments on art, sound, and the modern condition.
        </p>
      </div>

      {/* Grid of quotes */}
      {quotes.length === 0 ? (
        <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B]">
          <p className="text-sm text-[#707070]">No quotes published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quotes.map(quote => (
            <div
              key={quote.id}
              className="bg-[#0B0B0B] border border-[#242424] p-8 sm:p-10 flex flex-col justify-between space-y-6 relative group hover:border-[#707070] transition-colors"
            >
              <div className="space-y-4">
                <QuoteIcon className="w-6 h-6 text-[#404040]" />
                <blockquote className="text-xl sm:text-2xl font-editorial italic text-[#F5F5F5] leading-relaxed">
                  "{quote.text}"
                </blockquote>
              </div>

              <div className="pt-6 border-t border-[#1C1C1C] flex items-end justify-between gap-4">
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#F5F5F5]">
                    {quote.attribution || 'Anonymous'}
                  </h4>
                  {quote.context && (
                    <p className="text-[11px] text-[#707070] mt-0.5 font-light">
                      {quote.context}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(quote)}
                  className="text-[#707070] hover:text-[#F5F5F5] transition-colors p-2"
                  title="Copy quote to clipboard"
                  aria-label="Copy quote"
                >
                  {copiedId === quote.id ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
