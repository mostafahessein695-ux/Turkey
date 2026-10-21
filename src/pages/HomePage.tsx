import React from 'react';
import { 
  Song, 
  Artist, 
  Album, 
  Collection, 
  GalleryItem, 
  Quote, 
  SiteSettings, 
  NavTab 
} from '../types';
import { 
  ArrowDown, 
  ArrowRight, 
  Disc, 
  Star, 
  ExternalLink, 
  Play, 
  Sparkles,
  Mic,
  Radio,
  Volume2,
  Music,
  Users
} from 'lucide-react';
import { isArtistOnSong } from '../services/db';

interface HomePageProps {
  settings: SiteSettings;
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  collections: Collection[];
  gallery: GalleryItem[];
  quotes: Quote[];
  onSelectTab: (tab: NavTab) => void;
  onOpenDetail: (type: 'song' | 'artist' | 'album' | 'collection', data: any) => void;
  onOpenLightbox: (item: GalleryItem) => void;
  onOpenAdminAuth?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  songs,
  artists,
  albums,
  collections,
  gallery,
  quotes,
  onSelectTab,
  onOpenDetail,
  onOpenLightbox,
  onOpenAdminAuth,
}) => {
  const scrollToFeatured = () => {
    const el = document.getElementById('featured-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Featured content
  const featuredSongs = songs.filter(s => s.isFeatured);
  const featuredArtists = artists.filter(a => a.isFeatured);
  const homeArtists = featuredArtists.length > 0 
    ? [...featuredArtists, ...artists.filter(a => !a.isFeatured)].slice(0, 6)
    : artists.slice(0, 6);

  // 2. Recently added
  const recentItems = [...songs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  // 3. Current favorites (rating >= 9.5 or featured)
  const favoriteSongs = songs.filter(s => s.personalRating >= 9.5 || s.isFeatured).slice(0, 4);

  // 4. Visual moodboard items
  const moodboardItems = gallery.slice(0, 6);

  return (
    <div className="w-full space-y-24">
      
      {/* 1. HERO SECTION WITH HARDWARE-ACCELERATED VINYL ROTATION & EQUALIZER */}
      <section className="relative min-h-[85vh] flex flex-col justify-between border-b border-[#242424] overflow-hidden">
        {/* Background image overlay */}
        {settings.heroImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.heroImage}
              alt="Hero Backdrop"
              className="w-full h-full object-cover opacity-20 filter grayscale contrast-125 brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-[#050505]/50" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 sm:pt-28 pb-16 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-8">
              <div className="text-xs uppercase tracking-[0.3em] text-[#A1A1A1] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ambient-pulse" />
                <span>Personal Sonic & Aesthetic Universe</span>
                <span className="hidden sm:inline-block text-[#555555]">·</span>
                <span className="hidden sm:inline-block text-[#707070] font-mono">33⅓ RPM</span>
              </div>

              <h1 
                onClick={onOpenAdminAuth}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#F5F5F5] uppercase leading-[0.95] cursor-pointer hover:text-white transition-colors"
                title="MY WORLD"
              >
                {settings.heroHeadline || 'MY WORLD. MY RULES.'}
              </h1>

              <p className="text-base sm:text-xl text-[#A1A1A1] max-w-2xl font-light leading-relaxed">
                {settings.heroSubhead || 'A collection of sounds, people, moments, and things that mean something to me.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToFeatured}
                  className="px-8 py-4 bg-[#F5F5F5] hover:bg-white text-[#050505] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg hover:shadow-white/10 hover-luxury-lift cursor-pointer"
                >
                  <span>EXPLORE MY WORLD</span>
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTab('artists')}
                  className="px-6 py-4 bg-[#111111]/80 hover:bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#F5F5F5] text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 hover-luxury-lift cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[#A1A1A1]" />
                  <span>Profiled Artists</span>
                </button>

                <button
                  onClick={() => onSelectTab('albums')}
                  className="px-6 py-4 bg-transparent hover:bg-[#111111]/40 border border-[#242424] hover:border-[#707070] text-[#A1A1A1] hover:text-white text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Disc className="w-3.5 h-3.5 text-[#A1A1A1]" />
                  <span>Curated Albums</span>
                </button>
              </div>
            </div>

            {/* Right Column: Real-time Interactive Vinyl Turntable Display */}
            <div className="lg:col-span-5 hidden lg:flex justify-end">
              <div className="relative p-7 bg-[#0B0B0B]/90 border border-[#242424] shadow-2xl space-y-5 max-w-sm w-full hover-luxury-lift">
                
                {/* Turntable Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ambient-pulse" />
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#CCCCCC]">
                      CURATORIAL DECK
                    </span>
                  </div>
                  
                  {/* Realtime Equalizer animation (60fps CSS GPU) */}
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-white bar-anim-1 rounded-none h-full" />
                    <span className="w-1 bg-[#888888] bar-anim-2 rounded-none h-full" />
                    <span className="w-1 bg-white bar-anim-3 rounded-none h-full" />
                    <span className="w-1 bg-[#888888] bar-anim-4 rounded-none h-full" />
                  </div>
                </div>

                {/* Vinyl Disc with authentic grooves & center label */}
                <div className="relative aspect-square flex items-center justify-center p-3">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#181818] via-[#0D0D0D] to-[#141414] border border-[#333333] shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center animate-spin-slow relative">
                    
                    {/* Vinyl Groove Rings */}
                    <div className="absolute inset-3 rounded-full border border-white/[0.04]" />
                    <div className="absolute inset-7 rounded-full border border-white/[0.05]" />
                    <div className="absolute inset-12 rounded-full border border-white/[0.04]" />
                    <div className="absolute inset-16 rounded-full border border-white/[0.05]" />
                    
                    {/* Vinyl Center Label */}
                    <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#333333] flex flex-col items-center justify-center p-2 text-center shadow-inner relative z-10">
                      <span className="text-[7px] font-black tracking-widest uppercase text-white font-mono">
                        MY WORLD
                      </span>
                      <span className="text-[6px] tracking-wider text-[#888888] font-mono mt-0.5">
                        SIDE A · STEREO
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#050505] border border-[#555555] mt-1" />
                    </div>
                  </div>
                </div>

                {/* Turntable Footer Info */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#707070] font-mono">
                  <span>{songs.length} Tracks in rotation</span>
                  <span>{artists.length} Visionaries</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Continuous Fluid Ticker Marquee (Zero-Lag GPU Animation) */}
        <div className="relative z-10 w-full bg-[#080808] border-y border-[#242424] py-3 overflow-hidden select-none">
          <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-[0.25em] text-[#888888] font-mono flex items-center gap-8">
            <span className="text-[#F5F5F5] font-semibold">MY WORLD ARCHIVE</span>
            <span>·</span>
            <span>BURIAL</span>
            <span>·</span>
            <span>APHEX TWIN</span>
            <span>·</span>
            <span>MASSIVE ATTACK</span>
            <span>·</span>
            <span>KELLY LEE OWENS</span>
            <span>·</span>
            <span>UK DUBSTEP & AMBIENT</span>
            <span>·</span>
            <span>BRUTALIST ARCHITECTURE</span>
            <span>·</span>
            <span>33⅓ RPM VINYL CULTURE</span>
            <span>·</span>
            <span>PERSONAL SENSORY SANCTUARY</span>
            <span>·</span>
            <span>LONDON / BERLIN / TOKYO SOUNDSCAPES</span>
            <span>·</span>
            <span className="text-[#F5F5F5] font-semibold">MY WORLD ARCHIVE</span>
            <span>·</span>
            <span>BURIAL</span>
            <span>·</span>
            <span>APHEX TWIN</span>
            <span>·</span>
            <span>MASSIVE ATTACK</span>
            <span>·</span>
            <span>KELLY LEE OWENS</span>
            <span>·</span>
            <span>UK DUBSTEP & AMBIENT</span>
            <span>·</span>
            <span>BRUTALIST ARCHITECTURE</span>
            <span>·</span>
            <span>33⅓ RPM VINYL CULTURE</span>
            <span>·</span>
            <span>PERSONAL SENSORY SANCTUARY</span>
            <span>·</span>
            <span>LONDON / BERLIN / TOKYO SOUNDSCAPES</span>
          </div>
        </div>

        {/* Hero bottom metadata ribbon */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 w-full flex flex-wrap items-center justify-between gap-4 text-xs text-[#707070]">
          <div className="flex items-center gap-6">
            <span>{songs.length} Tracks In Library</span>
            <span>·</span>
            <span className="text-[#F5F5F5] font-medium">{artists.length} Profiled Artists</span>
            <span>·</span>
            <span>{albums.length} Curated Records</span>
          </div>
          <div className="hidden sm:block uppercase tracking-wider text-[11px]">
            London / Berlin / Tokyo / Underground Soundscapes
          </div>
        </div>
      </section>

      {/* 2. PROFILED ARTISTS & VISIONARIES SECTION (FEATURED OUTSIDE ON HOME) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#242424]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#707070] mb-1">
              <Mic className="w-3.5 h-3.5 text-[#E5B555]" />
              <span>Sonic Architects & Influences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              Profiled Artists
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('artists')}
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <span>Explore All Artists ({artists.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {homeArtists.length === 0 ? (
          <div className="py-16 text-center border border-[#242424] bg-[#0B0B0B] text-xs text-[#707070]">
            No artists featured yet. Add or profile artists from the administrator dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeArtists.map(artist => {
              const artistSongsCount = songs.filter(
                s => isArtistOnSong(s, artist.name)
              ).length;
              const artistAlbumsCount = albums.filter(
                a => a.artist.toLowerCase() === artist.name.toLowerCase()
              ).length;

              return (
                <div
                  key={artist.id}
                  onClick={() => onOpenDetail('artist', artist)}
                  className="group bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover-luxury-lift"
                >
                  {/* Photo Container with Monochrome-to-Crisp Transition */}
                  <div className="aspect-[16/11] relative overflow-hidden bg-[#111111]">
                    <img
                      src={artist.profileImage}
                      alt={artist.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-105 group-hover:contrast-125 transition-transform duration-500"
                    />
                    
                    {/* Origin / Country Pill */}
                    {artist.country && (
                      <div className="absolute top-3 left-3 bg-[#050505]/90 border border-[#242424] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#F5F5F5] font-mono">
                        {artist.country}
                      </div>
                    )}

                    {/* Featured Star Badge */}
                    {artist.isFeatured && (
                      <div className="absolute top-3 right-3 bg-[#050505]/90 border border-[#333333] px-2 py-1 text-[10px] uppercase tracking-wider text-[#F5F5F5] flex items-center gap-1 font-mono">
                        <Star className="w-3 h-3 fill-white text-white" />
                        <span className="hidden sm:inline">Featured</span>
                      </div>
                    )}

                    {/* Subtle Audio Waveform on Hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm px-2.5 py-1 border border-[#333333] flex items-center gap-1.5 text-[10px] text-white">
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>View Profile</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#707070]">
                      <div className="flex items-center gap-2">
                        {artist.genres && artist.genres.length > 0 ? (
                          <span className="text-[#A1A1A1]">{artist.genres.slice(0, 2).join(' · ')}</span>
                        ) : (
                          <span>Visionary</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#707070]">
                        {artistSongsCount > 0 ? `${artistSongsCount} Tracks` : ''}
                        {artistSongsCount > 0 && artistAlbumsCount > 0 ? ' · ' : ''}
                        {artistAlbumsCount > 0 ? `${artistAlbumsCount} Albums` : ''}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-white transition-colors">
                      {artist.name}
                    </h3>

                    {artist.bio && (
                      <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed font-light">
                        {artist.bio}
                      </p>
                    )}

                    {artist.personalThoughts && (
                      <p className="text-[11px] text-[#A1A1A1] italic pt-1 border-t border-[#1C1C1C] line-clamp-1">
                        "{artist.personalThoughts}"
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs text-[#A1A1A1] group-hover:text-white transition-colors">
                      <span className="text-[11px] uppercase tracking-wider">Explore Discography</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. FEATURED TRACKS & SOUND ROTATION */}
      <section id="featured-section" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#242424]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#707070] mb-1">
              <Disc className="w-3.5 h-3.5 text-white" />
              <span>Curated Rotation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              Featured Sound & Vision
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('music')}
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredSongs.length === 0 ? (
          <div className="py-12 text-center border border-[#242424] bg-[#0B0B0B] text-xs text-[#707070]">
            No featured tracks selected yet. Set tracks as featured from the dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSongs.slice(0, 3).map(song => (
              <div
                key={song.id}
                onClick={() => onOpenDetail('song', song)}
                className="group bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover-luxury-lift"
              >
                <div className="aspect-square relative overflow-hidden bg-[#111111]">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#050505]/90 border border-[#242424] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#F5F5F5]">
                    {song.genre}
                  </div>
                  
                  {/* Subtle Vinyl Peek-Out on Hover */}
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#111111] border-2 border-[#242424] vinyl-peek pointer-events-none opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-2xl">
                    <div className="w-8 h-8 rounded-full bg-[#050505] border border-[#444444]" />
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#707070] flex items-center justify-between">
                    <span>{song.releaseYear || 'Track'}</span>
                    <span className="tabular-nums font-mono text-[#F5F5F5]">{song.personalRating}/10</span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-white transition-colors truncate">
                    {song.title}
                  </h3>
                  <p className="text-xs text-[#A1A1A1] truncate">
                    {song.artist} {song.album ? `— ${song.album}` : ''}
                  </p>
                  {song.personalNotes && (
                    <p className="text-xs text-[#707070] line-clamp-2 pt-1 font-light italic">
                      "{song.personalNotes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. RECENTLY ADDED */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#242424]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#707070] block mb-1">
              Fresh Additions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              Recently Added to Library
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('music')}
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <span>Explore Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="py-16 text-center border border-[#242424] bg-[#0B0B0B] text-xs text-[#707070]">
            No recent tracks published yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentItems.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenDetail('song', item)}
                className="group cursor-pointer space-y-3 hover-luxury-lift p-2 -m-2"
              >
                <div className="aspect-square bg-[#111111] border border-[#242424] group-hover:border-[#707070] overflow-hidden transition-colors">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#F5F5F5] group-hover:text-white transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#A1A1A1] truncate">
                    {item.artist}
                  </p>
                  <div className="text-[11px] text-[#707070] mt-1 flex items-center gap-2">
                    <span>{item.genre}</span>
                    {item.releaseYear && (
                      <>
                        <span>·</span>
                        <span>{item.releaseYear}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. CURRENT FAVORITES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0B0B0B] border border-[#242424] p-8 sm:p-12 hover-luxury-lift">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-widest text-[#707070] block mb-1">
              Hall of Fame
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              Current Favorites & Permanent Rotation
            </h2>
            <p className="text-xs text-[#A1A1A1] mt-2">
              The seminal records and tracks that remain permanently in heavy rotation.
            </p>
          </div>

          {favoriteSongs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#707070]">
              Favorites being curated.
            </div>
          ) : (
            <div className="divide-y divide-[#1C1C1C]">
              {favoriteSongs.map((fav, idx) => (
                <div
                  key={fav.id}
                  onClick={() => onOpenDetail('song', fav)}
                  className="py-4 flex items-center justify-between gap-4 cursor-pointer group hover:bg-[#111111] px-4 -mx-4 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-mono text-[#707070] w-6 text-right tabular-nums">
                      0{idx + 1}
                    </span>
                    <img
                      src={fav.coverUrl}
                      alt={fav.title}
                      className="w-12 h-12 object-cover bg-black border border-[#242424] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#F5F5F5] group-hover:text-white truncate">
                        {fav.title}
                      </h4>
                      <p className="text-xs text-[#A1A1A1] truncate">
                        {fav.artist} {fav.album ? `— ${fav.album}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <span className="hidden sm:inline-block text-xs text-[#707070]">
                      {fav.genre}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-[#F5F5F5] bg-[#161616] border border-[#242424] px-2.5 py-1">
                      {fav.personalRating}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VISUAL MOODBOARD */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#242424]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#707070] block mb-1">
              Visual Universe
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              Aesthetic Moodboard & Imagery
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('gallery')}
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <span>Full Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {moodboardItems.length === 0 ? (
          <div className="py-16 text-center border border-[#242424] bg-[#0B0B0B] text-xs text-[#707070]">
            Visual gallery items in curation.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {moodboardItems.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenLightbox(item)}
                className="aspect-square bg-[#111111] border border-[#242424] hover:border-[#707070] cursor-pointer overflow-hidden transition-all group relative hover-luxury-lift"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-[11px] font-medium text-[#F5F5F5] truncate">{item.title}</p>
                  <p className="text-[10px] text-[#A1A1A1] truncate">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
