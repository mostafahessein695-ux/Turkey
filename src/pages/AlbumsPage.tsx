import React, { useState, useMemo } from 'react';
import { Album } from '../types';
import { Search, Star, ArrowRight, Disc } from 'lucide-react';

interface AlbumsPageProps {
  albums: Album[];
  onOpenDetail: (album: Album) => void;
}

export const AlbumsPage: React.FC<AlbumsPageProps> = ({ albums, onOpenDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = useMemo(() => {
    const set = new Set<string>();
    albums.forEach(a => { if (a.genre) set.add(a.genre); });
    return Array.from(set).sort();
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    return albums.filter(album => {
      const matchesSearch =
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'all' || album.genre.toLowerCase() === selectedGenre.toLowerCase();

      return matchesSearch && matchesGenre;
    });
  }, [albums, searchQuery, selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          Long-Form Recordings
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          Curated Albums
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          Complete bodies of work listened to from start to finish. Detailed with track sequences, personal critical reviews, and listening notes.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0B0B0B] border border-[#242424] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#707070] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search albums by title or artist..."
            className="w-full bg-[#111111] border border-[#242424] pl-10 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder-[#707070] focus:outline-none focus:border-[#707070]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="w-full bg-[#111111] border border-[#242424] px-3 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
          >
            <option value="all">All Genres ({genres.length})</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredAlbums.length === 0 ? (
        <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B]">
          <p className="text-sm text-[#707070]">No albums found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlbums.map(album => (
            <div
              key={album.id}
              onClick={() => onOpenDetail(album)}
              className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-square overflow-hidden bg-[#111111] relative">
                <img
                  src={album.coverImage}
                  alt={album.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-110"
                />
                
                <div className="absolute top-3 right-3 bg-[#050505]/90 border border-[#242424] px-2.5 py-1 text-xs font-mono tabular-nums text-[#F5F5F5]">
                  {album.rating}/10
                </div>

                <div className="absolute bottom-3 left-3 bg-[#050505]/90 border border-[#242424] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1]">
                  {album.tracklist?.length || 0} Tracks
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#707070] flex items-center justify-between">
                    <span>{album.genre}</span>
                    {album.releaseYear && <span>{album.releaseYear}</span>}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-white transition-colors mt-1">
                    {album.title}
                  </h3>
                  
                  <p className="text-xs text-[#A1A1A1] mt-0.5">
                    {album.artist}
                  </p>

                  {album.review && (
                    <p className="text-xs text-[#707070] line-clamp-3 mt-3 font-light leading-relaxed">
                      {album.review}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs text-[#707070] group-hover:text-[#F5F5F5] transition-colors">
                  <span>View Tracklist & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
