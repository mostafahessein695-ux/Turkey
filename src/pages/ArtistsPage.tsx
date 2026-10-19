import React, { useState, useMemo } from 'react';
import { Artist } from '../types';
import { Search, User, ExternalLink, ArrowRight } from 'lucide-react';

interface ArtistsPageProps {
  artists: Artist[];
  onOpenDetail: (artist: Artist) => void;
}

export const ArtistsPage: React.FC<ArtistsPageProps> = ({ artists, onOpenDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    artists.forEach(a => a.genres?.forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [artists]);

  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearch =
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (artist.country && artist.country.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre =
        selectedGenre === 'all' ||
        (artist.genres && artist.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    });
  }, [artists, searchQuery, selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          People & Influences
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          Profiled Artists
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          Visionaries, underground producers, reclusive composers, and sonic innovators shaping the philosophy of MY WORLD.
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
            placeholder="Search artists by name, origin, or style..."
            className="w-full bg-[#111111] border border-[#242424] pl-10 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder-[#707070] focus:outline-none focus:border-[#707070]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="w-full bg-[#111111] border border-[#242424] px-3 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
          >
            <option value="all">All Genres ({allGenres.length})</option>
            {allGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Artists Grid */}
      {filteredArtists.length === 0 ? (
        <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B]">
          <p className="text-sm text-[#707070]">No artists found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtists.map(artist => (
            <div
              key={artist.id}
              onClick={() => onOpenDetail(artist)}
              className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#111111] relative">
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-110"
                />
                {artist.country && (
                  <div className="absolute bottom-3 left-3 bg-[#050505]/90 border border-[#242424] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1]">
                    {artist.country}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-white transition-colors">
                    {artist.name}
                  </h3>
                  
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="text-xs text-[#707070] mt-1">
                      {artist.genres.join(' / ')}
                    </div>
                  )}

                  {artist.bio && (
                    <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-3 mt-3 font-light">
                      {artist.bio}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs text-[#707070] group-hover:text-[#F5F5F5] transition-colors">
                  <span>Explore Artist Profile</span>
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
