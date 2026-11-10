import React, { useState, useEffect } from 'react';
import { MerchItem } from '../types';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  products: MerchItem[];
  onClose: () => void;
  onSelectProduct: (product: MerchItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
        (p.colors && p.colors.some(c => c.toLowerCase().includes(query.toLowerCase())))
      )
    : products.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl liquid-glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl space-y-5">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#888888]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search streetwear hoodies, tees, sweatpants, accessories..."
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl text-sm text-white placeholder-[#666666] outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="absolute right-4 p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#666666] font-mono uppercase text-[10px] mr-1">Trending:</span>
          {['Hoodies', 'Acid Wash', 'Tees', 'Sweatpants', 'Heavyweight'].map(term => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-3 py-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-[#CCCCCC] hover:text-white transition-all cursor-pointer text-[11px]"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="text-[11px] text-[#707070] uppercase font-mono tracking-wider px-2">
            {query.trim() ? `Search Results (${filtered.length})` : 'Popular Drops'}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#707070]">
              No garments found matching "{query}". Try searching for "hoodie", "tee", or "black".
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
              >
                <img
                  src={product.coverImage}
                  alt={product.name}
                  className="w-12 h-14 object-cover rounded-xl border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-white">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#888888] font-mono">
                    <span className="capitalize">{product.category}</span>
                    <span>&bull;</span>
                    <span className="text-white font-bold">{product.price} {product.currency || 'EGP'}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#707070] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
