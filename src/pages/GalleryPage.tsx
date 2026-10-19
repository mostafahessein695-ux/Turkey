import React, { useState, useMemo } from 'react';
import { GalleryItem } from '../types';
import { Eye, Image as ImageIcon } from 'lucide-react';

interface GalleryPageProps {
  gallery: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ gallery, onOpenLightbox }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    gallery.forEach(g => { if (g.category) set.add(g.category); });
    return Array.from(set).sort();
  }, [gallery]);

  const filteredGallery = useMemo(() => {
    if (selectedCategory === 'all') return gallery;
    return gallery.filter(g => g.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [gallery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          Visual Moodboard & Photography
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          Gallery & Artifacts
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          A visual journal of brutalist geometry, sound hardware, high-contrast monochrome streetscapes, and archival ephemera.
        </p>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#242424] pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#F5F5F5] text-[#050505] font-semibold'
                : 'bg-[#111111] text-[#A1A1A1] hover:text-[#F5F5F5]'
            }`}
          >
            All Works ({gallery.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#F5F5F5] text-[#050505] font-semibold'
                  : 'bg-[#111111] text-[#A1A1A1] hover:text-[#F5F5F5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Masonry / Bento visual grid */}
      {filteredGallery.length === 0 ? (
        <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B]">
          <p className="text-sm text-[#707070]">No images in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item, idx) => {
            const isWide = idx % 5 === 0;
            return (
              <div
                key={item.id}
                onClick={() => onOpenLightbox(item)}
                className={`group bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] cursor-pointer overflow-hidden transition-all flex flex-col justify-between ${
                  isWide ? 'sm:col-span-2' : ''
                }`}
              >
                <div className={`overflow-hidden bg-[#111111] relative ${isWide ? 'aspect-[16/9]' : 'aspect-square'}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-115"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 bg-black/70 border border-[#242424] text-[#F5F5F5]">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#707070]">
                    <span>{item.category || 'Moodboard'}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F5F5F5] group-hover:text-white transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-[#A1A1A1] line-clamp-2 pt-0.5 font-light">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
