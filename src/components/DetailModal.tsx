import React from 'react';
import { Song, Artist, Album, Collection } from '../types';
import { X, ExternalLink, Star, Disc, User, Music, Radio, Clock, Share2, Play } from 'lucide-react';

interface DetailModalProps {
  target: {
    type: 'song' | 'artist' | 'album' | 'collection';
    data: Song | Artist | Album | Collection;
  } | null;
  allSongs?: Song[];
  allAlbums?: Album[];
  onClose: () => void;
  onSelectOtherItem?: (type: 'song' | 'artist' | 'album' | 'collection', id: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  target,
  allSongs = [],
  allAlbums = [],
  onClose,
  onSelectOtherItem,
}) => {
  if (!target) return null;

  const { type, data } = target;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0B0B0B] border border-[#242424] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
        
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 text-[#707070] hover:text-[#F5F5F5] transition-colors p-2 bg-[#050505]/80 border border-[#242424]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SONG DETAIL */}
        {type === 'song' && (() => {
          const song = data as Song;
          return (
            <div className="p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Artwork */}
                <div className="md:col-span-5 relative group">
                  <div className="aspect-square bg-[#111111] border border-[#242424] overflow-hidden">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {song.isFeatured && (
                    <div className="mt-3 text-[11px] uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-[#F5F5F5] text-[#F5F5F5]" />
                      <span>Featured in rotation</span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="md:col-span-7 space-y-4">
                  <div className="text-xs uppercase tracking-widest text-[#707070] flex items-center gap-2">
                    <span>{song.genre}</span>
                    {song.releaseYear && (
                      <>
                        <span>·</span>
                        <span>{song.releaseYear}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
                    {song.title}
                  </h2>

                  <div className="text-base text-[#A1A1A1] flex items-center gap-2">
                    <span className="font-medium text-[#F5F5F5]">{song.artist}</span>
                    {song.album && (
                      <>
                        <span className="text-[#707070]">/</span>
                        <span className="text-[#707070]">{song.album}</span>
                      </>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="pt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-[#707070]">Personal Rating:</span>
                      <span className="text-sm font-semibold text-[#F5F5F5] tabular-nums">
                        {song.personalRating}/10
                      </span>
                    </div>
                  </div>

                  {/* Mood Tags (Zero Pill Discipline - clean text with separators) */}
                  {song.moodTags && song.moodTags.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#707070] block mb-1.5">
                        Atmosphere & Mood
                      </span>
                      <div className="text-xs text-[#A1A1A1] flex flex-wrap items-center gap-y-1">
                        {song.moodTags.map((tag, idx) => (
                          <React.Fragment key={idx}>
                            <span>{tag}</span>
                            {idx < song.moodTags.length - 1 && <span className="mx-2 text-[#404040]">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External links */}
                  {song.externalUrl && (
                    <div className="pt-4">
                      <a
                        href={song.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#F5F5F5] text-xs font-medium uppercase tracking-wider transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Listen on Music Platform</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Notes */}
              {song.personalNotes && (
                <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                    Personal Notes & Reflection
                  </h3>
                  <p className="text-sm text-[#A1A1A1] leading-relaxed whitespace-pre-line font-light">
                    {song.personalNotes}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ARTIST DETAIL */}
        {type === 'artist' && (() => {
          const artist = data as Artist;
          const relatedSongs = allSongs.filter(
            s => s.artist.toLowerCase() === artist.name.toLowerCase()
          );
          const relatedAlbums = allAlbums.filter(
            a => a.artist.toLowerCase() === artist.name.toLowerCase()
          );

          return (
            <div className="p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-5">
                  <div className="aspect-[4/3] bg-[#111111] border border-[#242424] overflow-hidden">
                    <img
                      src={artist.profileImage}
                      alt={artist.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <div className="text-xs uppercase tracking-widest text-[#707070] flex items-center gap-2">
                    <span>{artist.country || 'Artist Profile'}</span>
                    {artist.genres && artist.genres.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{artist.genres.join(' / ')}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
                    {artist.name}
                  </h2>

                  {artist.bio && (
                    <p className="text-sm text-[#A1A1A1] leading-relaxed pt-2">
                      {artist.bio}
                    </p>
                  )}

                  {artist.externalUrl && (
                    <div className="pt-3">
                      <a
                        href={artist.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#F5F5F5] hover:text-white underline underline-offset-4"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Official Channel / Releases</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Thoughts */}
              {artist.personalThoughts && (
                <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                    Personal Thoughts & Influence
                  </h3>
                  <p className="text-sm text-[#A1A1A1] leading-relaxed whitespace-pre-line font-light">
                    {artist.personalThoughts}
                  </p>
                </div>
              )}

              {/* Favorite Albums list */}
              {artist.favoriteAlbums && artist.favoriteAlbums.length > 0 && (
                <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                    Essential Releases
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-[#A1A1A1]">
                    {artist.favoriteAlbums.map((albumName, idx) => (
                      <span key={idx} className="bg-[#111111] border border-[#242424] px-3 py-1.5">
                        {albumName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Library Items */}
              {relatedSongs.length > 0 && (
                <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                    Archived Songs by {artist.name} ({relatedSongs.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedSongs.map(song => (
                      <button
                        key={song.id}
                        onClick={() => onSelectOtherItem && onSelectOtherItem('song', song.id)}
                        className="flex items-center gap-3 p-3 bg-[#111111] border border-[#242424] hover:border-[#707070] text-left transition-colors"
                      >
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-10 h-10 object-cover bg-black"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-[#F5F5F5] truncate">{song.title}</p>
                          <p className="text-[11px] text-[#707070] truncate">{song.album || song.genre}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ALBUM DETAIL */}
        {type === 'album' && (() => {
          const album = data as Album;
          return (
            <div className="p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-5">
                  <div className="aspect-square bg-[#111111] border border-[#242424] overflow-hidden">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="text-xs uppercase tracking-widest text-[#707070] flex items-center gap-2">
                    <span>{album.genre}</span>
                    {album.releaseYear && (
                      <>
                        <span>·</span>
                        <span>{album.releaseYear}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
                    {album.title}
                  </h2>

                  <p className="text-base text-[#A1A1A1]">
                    By <span className="text-[#F5F5F5] font-medium">{album.artist}</span>
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#707070]">Album Rating:</span>
                    <span className="text-sm font-semibold text-[#F5F5F5] tabular-nums">
                      {album.rating}/10
                    </span>
                  </div>

                  {album.externalUrl && (
                    <div className="pt-3">
                      <a
                        href={album.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#F5F5F5] text-xs font-medium uppercase tracking-wider transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Stream / Purchase Album</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Review */}
              {album.review && (
                <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                    Personal Album Review
                  </h3>
                  <p className="text-sm text-[#A1A1A1] leading-relaxed whitespace-pre-line font-light">
                    {album.review}
                  </p>
                </div>
              )}

              {/* Tracklist */}
              {album.tracklist && album.tracklist.length > 0 && (
                <div className="pt-6 border-t border-[#1C1C1C] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                    Tracklist ({album.tracklist.length} tracks)
                  </h3>
                  <div className="border border-[#242424] divide-y divide-[#1F1F1F]">
                    {album.tracklist.map((track, i) => (
                      <div
                        key={track.id || i}
                        className="px-4 py-3 flex items-center justify-between text-xs hover:bg-[#111111] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-[#707070] tabular-nums w-5 text-right font-mono">
                            {track.trackNumber || i + 1}
                          </span>
                          <span className="text-[#F5F5F5] font-medium">{track.title}</span>
                        </div>
                        {track.duration && (
                          <span className="text-[#707070] font-mono tabular-nums">{track.duration}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* COLLECTION DETAIL */}
        {type === 'collection' && (() => {
          const col = data as Collection;
          const relatedSongs = allSongs.filter(s => col.itemIds?.includes(s.id));
          const relatedAlbums = allAlbums.filter(a => col.itemIds?.includes(a.id));

          return (
            <div className="p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-5">
                  <div className="aspect-square bg-[#111111] border border-[#242424] overflow-hidden">
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="text-xs uppercase tracking-widest text-[#707070]">
                    Curated Collection · {col.itemIds?.length || 0} Items
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
                    {col.title}
                  </h2>

                  <p className="text-sm text-[#A1A1A1] leading-relaxed pt-2">
                    {col.description}
                  </p>
                </div>
              </div>

              {/* Items in collection */}
              <div className="pt-6 border-t border-[#1C1C1C] space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
                  Collection Index
                </h3>

                <div className="space-y-3">
                  {relatedSongs.map(song => (
                    <button
                      key={song.id}
                      onClick={() => onSelectOtherItem && onSelectOtherItem('song', song.id)}
                      className="w-full p-4 bg-[#111111] border border-[#242424] hover:border-[#707070] flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-12 h-12 object-cover bg-black shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#F5F5F5] group-hover:text-white truncate">
                            {song.title}
                          </p>
                          <p className="text-xs text-[#707070] truncate">
                            {song.artist} {song.album ? `— ${song.album}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#707070] font-mono tabular-nums shrink-0 ml-4">
                        {song.genre}
                      </div>
                    </button>
                  ))}

                  {relatedAlbums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => onSelectOtherItem && onSelectOtherItem('album', album.id)}
                      className="w-full p-4 bg-[#111111] border border-[#242424] hover:border-[#707070] flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-12 h-12 object-cover bg-black shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#F5F5F5] group-hover:text-white truncate">
                            {album.title} (Album)
                          </p>
                          <p className="text-xs text-[#707070] truncate">
                            {album.artist} · {album.releaseYear}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#707070] font-mono tabular-nums shrink-0 ml-4">
                        {album.rating}/10
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};
