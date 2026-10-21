import React, { useState, useMemo } from 'react';
import { Song } from '../types';
import { Search, Filter, ArrowUpDown, Star, ExternalLink, Play, Disc } from 'lucide-react';

interface MusicPageProps {
  songs: Song[];
  onOpenDetail: (song: Song) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({ songs, onOpenDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'rating'>('newest');

  // Compute unique genres and moods
  const genres = useMemo(() => {
    const set = new Set<string>();
    songs.forEach(s => { if (s.genre) set.add(s.genre); });
    return Array.from(set).sort();
  }, [songs]);

  const moods = useMemo(() => {
    const set = new Set<string>();
    songs.forEach(s => {
      s.moodTags?.forEach(m => set.add(m));
    });
    return Array.from(set).sort();
  }, [songs]);

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter(song => {
        const matchesSearch =
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (song.artists && song.artists.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))) ||
          (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesGenre =
          selectedGenre === 'all' || song.genre.toLowerCase() === selectedGenre.toLowerCase();

        const matchesMood =
          selectedMood === 'all' ||
          (song.moodTags && song.moodTags.some(m => m.toLowerCase() === selectedMood.toLowerCase()));

        return matchesSearch && matchesGenre && matchesMood;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'rating') {
          return b.personalRating - a.personalRating;
        }
        return 0;
      });
  }, [songs, searchQuery, selectedGenre, selectedMood, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          Sound Library & Archives
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          Music Catalog
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          A personal, non-commercial library of influential underground tracks, vinyl rips, dubplates, and seminal electronic releases.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#0B0B0B] border border-[#242424] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#707070] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by song title, artist, or album..."
              className="w-full bg-[#111111] border border-[#242424] pl-10 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder-[#707070] focus:outline-none focus:border-[#707070] transition-colors"
            />
          </div>

          {/* Genre Filter */}
          <div className="md:col-span-3">
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

          {/* Mood Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedMood}
              onChange={e => setSelectedMood(e.target.value)}
              className="w-full bg-[#111111] border border-[#242424] px-3 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
            >
              <option value="all">All Moods</option>
              {moods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-[#111111] border border-[#242424] px-3 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-[#707070] pt-2 border-t border-[#181818]">
          <div>
            Showing <span className="text-[#F5F5F5] font-semibold tabular-nums">{filteredSongs.length}</span> of <span className="tabular-nums">{songs.length}</span> songs
          </div>
          {(searchQuery || selectedGenre !== 'all' || selectedMood !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setSelectedMood('all');
              }}
              className="text-[#A1A1A1] hover:text-[#F5F5F5] underline underline-offset-4"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Songs */}
      {filteredSongs.length === 0 ? (
        <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B]">
          <p className="text-sm text-[#707070]">No tracks found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSongs.map(song => (
            <div
              key={song.id}
              onClick={() => onOpenDetail(song)}
              className="group bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-square relative overflow-hidden bg-[#111111]">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-110"
                />
                
                {/* Rating badge */}
                <div className="absolute top-3 right-3 bg-[#050505]/90 border border-[#242424] px-2 py-0.5 text-[11px] font-mono tabular-nums text-[#F5F5F5]">
                  {song.personalRating}/10
                </div>

                {song.isFeatured && (
                  <div className="absolute top-3 left-3 bg-[#050505]/90 border border-[#242424] p-1 text-[#F5F5F5]" title="Featured Track">
                    <Star className="w-3.5 h-3.5 fill-[#F5F5F5]" />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#707070] flex items-center justify-between">
                    <span>{song.genre}</span>
                    {song.releaseYear && <span>{song.releaseYear}</span>}
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F5F5] group-hover:text-white transition-colors truncate mt-1">
                    {song.title}
                  </h3>
                  <p className="text-xs text-[#A1A1A1] truncate">
                    {song.artist}
                  </p>
                </div>

                {/* Mood Tags (Zero-Pill discipline) */}
                {song.moodTags && song.moodTags.length > 0 && (
                  <div className="pt-2 text-[11px] text-[#707070] truncate border-t border-[#1A1A1A]">
                    {song.moodTags.join(' · ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
