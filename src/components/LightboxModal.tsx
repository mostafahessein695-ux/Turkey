import React, { useEffect } from 'react';
import { GalleryItem } from '../types';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (item: GalleryItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  items,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && item) {
        const idx = items.findIndex(i => i.id === item.id);
        if (idx !== -1 && idx < items.length - 1) onNavigate(items[idx + 1]);
      }
      if (e.key === 'ArrowLeft' && item) {
        const idx = items.findIndex(i => i.id === item.id);
        if (idx > 0) onNavigate(items[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, items, onClose, onNavigate]);

  if (!item) return null;

  const currentIndex = items.findIndex(i => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < items.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-150">
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-[#707070] hover:text-[#F5F5F5] transition-colors p-2"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(items[currentIndex - 1])}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#F5F5F5] transition-colors p-3 bg-[#0B0B0B]/80 border border-[#242424]"
          aria-label="Previous item"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={() => onNavigate(items[currentIndex + 1])}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#F5F5F5] transition-colors p-3 bg-[#0B0B0B]/80 border border-[#242424]"
          aria-label="Next item"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
        <div className="relative max-h-[75vh] overflow-hidden bg-[#111111] border border-[#242424]">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] w-auto object-contain mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="mt-4 text-center max-w-xl">
          <div className="flex items-center justify-center gap-2 text-xs text-[#707070] mb-1">
            <span>{item.category || 'Moodboard'}</span>
            <span>·</span>
            <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
          </div>
          <h3 className="text-base font-medium text-[#F5F5F5]">
            {item.title}
          </h3>
          {item.caption && (
            <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">
              {item.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
