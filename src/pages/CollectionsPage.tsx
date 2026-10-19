import React from 'react';
import { Collection, Song, Album } from '../types';
import { ArrowRight, Layers, Music, Disc } from 'lucide-react';

interface CollectionsPageProps {
  collections: Collection[];
  songs: Song[];
  albums: Album[];
  onOpenDetail: (collection: Collection) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  collections,
  songs,
  albums,
  onOpenDetail,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          Curated Playlists & Moods
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          Collections
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          Thematic groupings of sound, memories, and sensory artifacts organized by specific psychological states and nighttime settings.
        </p>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B]">
          <p className="text-sm text-[#707070]">No collections published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map(col => {
            const count = col.itemIds?.length || 0;
            return (
              <div
                key={col.id}
                onClick={() => onOpenDetail(col)}
                className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="aspect-[16/9] overflow-hidden bg-[#111111] relative">
                  <img
                    src={col.coverImage}
                    alt={col.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/30 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#A1A1A1] block mb-1">
                        Collection · {count} Items
                      </span>
                      <h3 className="text-2xl font-bold text-[#F5F5F5] group-hover:text-white uppercase tracking-tight">
                        {col.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-3 font-light">
                    {col.description}
                  </p>

                  <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs text-[#707070] group-hover:text-[#F5F5F5] transition-colors">
                    <span>Listen to sequence</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
