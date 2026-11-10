import React, { useState, useMemo } from 'react';
import { MerchItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface ShopPageProps {
  products: MerchItem[];
  onOpenProductDetail: (product: MerchItem) => void;
}

type CategoryFilter = 'all' | 'hoodies' | 'tees' | 'pants' | 'headwear' | 'accessories';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onOpenProductDetail,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Garments' },
    { id: 'hoodies', label: 'Hoodies' },
    { id: 'tees', label: 'Heavyweight Tees' },
    { id: 'pants', label: 'Pants & Cargo' },
    { id: 'headwear', label: 'Headwear' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        if (a.isNewArrival && !b.isNewArrival) return -1;
        if (!a.isNewArrival && b.isNewArrival) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      // Featured / default
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-28 sm:py-36 space-y-10">
      {/* Editorial Header */}
      <div className="space-y-3 text-center sm:text-left">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#888888] font-mono block">
          Current Archive &bull; Capsule Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
          TURVEX Garment Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-2xl font-light leading-relaxed">
          Bespoke 480GSM French Terry knitwear, hand-acid washed combed tees, and relaxed wide-leg tailoring. Designed for perpetual wear and everyday movement.
        </p>
      </div>

      {/* Filter and Sort Bar with Apple Liquid Glass pill styling */}
      <div className="p-3 sm:p-4 liquid-glass-panel rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 shadow-lg">
        {/* Categories Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-mono ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#A1A1A1] hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#888888] uppercase tracking-wider font-mono text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#0A0A0A] border border-white/15 text-white px-3 py-1.5 rounded-xl outline-none text-xs font-mono cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="newest">New Drops</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <p className="text-sm font-semibold text-white uppercase tracking-wider">
            No pieces found in this category
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-5 py-2 bg-white text-black text-xs uppercase font-bold rounded-full cursor-pointer hover:bg-white/90"
          >
            View All Pieces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredAndSorted.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};
