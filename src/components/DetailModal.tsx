import React, { useState } from 'react';
import { Song, Artist, Album, Collection, MerchItem, formatInstagramUrl, formatInstagramHandle } from '../types';
import { X, ExternalLink, Star, Disc, User, Music, Radio, Clock, Share2, Play, Users, Instagram, ShoppingBag, MessageCircle, Tag, Check, Ruler } from 'lucide-react';
import { isArtistOnSong } from '../services/db';

interface DetailModalProps {
  target: {
    type: 'song' | 'artist' | 'album' | 'collection' | 'merch';
    data: Song | Artist | Album | Collection | MerchItem;
  } | null;
  allSongs?: Song[];
  allAlbums?: Album[];
  onClose: () => void;
  onSelectOtherItem?: (type: 'song' | 'artist' | 'album' | 'collection' | 'merch', id: string) => void;
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

                  <div className="text-base text-[#A1A1A1] flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#F5F5F5]">{song.artist}</span>
                    {song.album && (
                      <>
                        <span className="text-[#707070]">/</span>
                        <span className="text-[#707070]">{song.album}</span>
                      </>
                    )}
                  </div>

                  {/* Multiple Artists Pills */}
                  {song.artists && song.artists.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#707070] flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Participating Artists:</span>
                      </span>
                      {song.artists.map((artName, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#141414] border border-[#242424] text-[11px] text-[#D4D4D4] font-medium"
                        >
                          {artName}
                        </span>
                      ))}
                    </div>
                  )}

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
            s => isArtistOnSong(s, artist.name)
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

                  {/* ARTIST SOCIAL & PROFILE LINKS */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    {artist.instagramUrl && (
                      <a
                        href={formatInstagramUrl(artist.instagramUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#1b0c16] to-[#120810] border border-pink-700/60 hover:border-pink-500 text-pink-200 hover:text-white transition-all text-xs font-semibold tracking-wider uppercase group shadow-md"
                      >
                        <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                        <span>Instagram:</span>
                        <span className="font-mono text-pink-300 font-bold lowercase">
                          {formatInstagramHandle(artist.instagramUrl)}
                        </span>
                        <ExternalLink className="w-3 h-3 text-pink-400/80 ml-0.5" />
                      </a>
                    )}

                    {artist.externalUrl && (
                      <a
                        href={artist.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#111111] border border-[#2B2B2B] hover:border-[#606060] text-[#E0E0E0] hover:text-white transition-all text-xs uppercase tracking-wider font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#888888]" />
                        <span>Releases / Web</span>
                      </a>
                    )}
                  </div>
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
                          <p className="text-[11px] text-[#707070] truncate">
                            {song.artist && song.artist.toLowerCase() !== artist.name.toLowerCase() ? (
                              <span className="text-[#A1A1A1] font-medium">{song.artist} · </span>
                            ) : null}
                            {song.album || song.genre}
                          </p>
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

        {/* MERCH / CLOTHING DETAIL */}
        {type === 'merch' && (() => {
          const item = data as MerchItem;
          const [selectedSize, setSelectedSize] = useState<string>(item.sizes?.[0] || 'M');
          const [activeImg, setActiveImg] = useState<string>(item.coverImage || item.images?.[0] || '');

          const formatPrice = (price: number, currency?: string) => {
            const cur = currency?.trim() || 'EGP';
            if (cur === '$' || cur === '£' || cur === '€') {
              return `${cur}${price.toLocaleString()}`;
            }
            return `${price.toLocaleString()} ${cur}`;
          };

          const handleWhatsApp = () => {
            const phone = (item.whatsappNumber || '').replace(/[^\d+]/g, '') || '201000000000';
            const msg = encodeURIComponent(
              `Hello! I want to order "${item.name}" from MY WORLD.\nSize: ${selectedSize}\nPrice: ${formatPrice(item.price, item.currency)}`
            );
            window.open(`https://wa.me/${phone.replace('+', '')}?text=${msg}`, '_blank');
          };

          return (
            <div className="p-6 sm:p-10 space-y-8">
              {/* Header tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] bg-[#141414] px-2.5 py-1 border border-[#242424]">
                  {item.category}
                </span>
                {item.inStock ? (
                  <span className="bg-[#122B15] text-[#4ADE80] border border-[#23582A] text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 font-bold">
                    IN STOCK · متوفر
                  </span>
                ) : (
                  <span className="bg-[#2B1212] text-[#F87171] border border-[#582323] text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 font-bold">
                    SOLD OUT · غير متوفر
                  </span>
                )}
                {item.isFeatured && (
                  <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                    FEATURED DROP
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Artwork / Imagery */}
                <div className="md:col-span-5 space-y-3">
                  <div className="aspect-square bg-[#111111] border border-[#242424] overflow-hidden">
                    <img
                      src={activeImg || item.coverImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {item.images && item.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {item.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(img)}
                          className={`w-14 h-14 shrink-0 border overflow-hidden transition-all ${
                            activeImg === img ? 'border-white' : 'border-[#333] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Information */}
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                      {item.name}
                    </h2>
                    <div className="text-2xl font-black font-mono text-white mt-2">
                      {formatPrice(item.price, item.currency)}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="border-t border-[#1F1F1F] pt-4">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#707070] mb-1">
                      Fabric & Silhouette Description
                    </h4>
                    <p className="text-xs text-[#CCCCCC] leading-relaxed whitespace-pre-line font-mono">
                      {item.description || 'Exclusive underground collection garment. Premium heavy material designed with durable detailing.'}
                    </p>
                  </div>

                  {/* Specifications */}
                  <div className="bg-[#111111] border border-[#222222] p-4 space-y-2 text-xs font-mono text-[#A1A1A1]">
                    <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                      <span className="text-[#666666] uppercase">Material</span>
                      <span className="text-white font-semibold">100% Dense Combed Cotton</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                      <span className="text-[#666666] uppercase">Fabric Density</span>
                      <span className="text-white font-semibold">380 - 450 GSM Heavyweight</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] uppercase">Cut & Fit</span>
                      <span className="text-white font-semibold">Oversized Drop-Shoulder</span>
                    </div>
                  </div>

                  {/* Sizes */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="space-y-2 border-t border-[#1F1F1F] pt-4">
                      <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                        <span>SELECT SIZE</span>
                        <span className="text-white font-bold">{selectedSize}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.sizes.map(sz => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                              selectedSize === sz
                                ? 'bg-white text-black font-bold border border-white'
                                : 'bg-[#141414] text-[#888] hover:text-white border border-[#2B2B2B]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    {item.inStock ? (
                      <>
                        <button
                          onClick={handleWhatsApp}
                          className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#3A3A3A] hover:border-white py-3 px-4 text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          <span>Order on WhatsApp (طلب مباشر عبر واتساب)</span>
                        </button>
                        {item.orderUrl && (
                          <a
                            href={item.orderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white hover:bg-[#E5E5E5] text-black py-3 px-4 text-xs uppercase font-black tracking-wider transition-colors flex items-center justify-center gap-2"
                          >
                            <span>Go to Online Store</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="p-3 bg-[#121212] border border-[#222] text-center text-xs font-mono text-[#666]">
                        THIS ITEM IS CURRENTLY ARCHIVED / SOLD OUT
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};
