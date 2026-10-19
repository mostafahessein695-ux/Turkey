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
import { ArrowDown, ArrowRight, Disc, Star, ExternalLink, Play, Sparkles } from 'lucide-react';

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
  const featuredAlbums = albums.filter(a => a.isFeatured);

  // 2. Recently added
  const recentItems = [...songs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  // 3. Current favorites (rating >= 9.5 or featured)
  const favoriteSongs = songs.filter(s => s.personalRating >= 9.5 || s.isFeatured).slice(0, 4);

  // 4. Featured collection
  const featuredCollection = collections.find(c => c.isFeatured) || collections[0];

  // 5. Featured quote
  const featuredQuote = quotes.find(q => q.isFeatured) || quotes[0];

  // 6. Visual moodboard items
  const moodboardItems = gallery.slice(0, 6);

  return (
    <div className="w-full space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-between border-b border-[#242424] overflow-hidden">
        {/* Subtle background image overlay */}
        {settings.heroImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.heroImage}
              alt="Hero Backdrop"
              className="w-full h-full object-cover opacity-25 filter grayscale contrast-125 brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/50" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 sm:pt-32 pb-16 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-4xl space-y-8">
            <div className="text-xs uppercase tracking-[0.3em] text-[#A1A1A1] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#707070]" />
              <span>Personal Sonic & Aesthetic Universe</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#F5F5F5] uppercase leading-[0.95]">
              {settings.heroHeadline || 'MY WORLD. MY RULES.'}
            </h1>

            <p className="text-base sm:text-xl text-[#A1A1A1] max-w-2xl font-light leading-relaxed">
              {settings.heroSubhead || 'A collection of sounds, people, moments, and things that mean something to me.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToFeatured}
                className="px-8 py-4 bg-[#F5F5F5] hover:bg-white text-[#050505] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg"
              >
                <span>EXPLORE MY WORLD</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('about')}
                className="px-6 py-4 bg-[#111111]/80 hover:bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#F5F5F5] text-xs font-medium uppercase tracking-widest transition-colors"
              >
                Philosophy
              </button>
            </div>
          </div>
        </div>

        {/* Hero bottom metadata ribbon */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 w-full border-t border-[#242424]/60 flex flex-wrap items-center justify-between gap-4 text-xs text-[#707070]">
          <div className="flex items-center gap-6">
            <span>{songs.length} Tracks In Library</span>
            <span>·</span>
            <span>{artists.length} Profiled Artists</span>
            <span>·</span>
            <span>{albums.length} Curated Records</span>
          </div>
          <div className="hidden sm:block uppercase tracking-wider text-[11px]">
            London / Berlin / Tokyo / Underground Soundscapes
          </div>
        </div>
      </section>

      {/* 2. FEATURED CONTENT SECTION */}
      <section id="featured-section" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#242424]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#707070] block mb-1">
              Curated Rotation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              Featured Sound & Vision
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('music')}
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredSongs.length === 0 && featuredArtists.length === 0 ? (
          <div className="py-12 text-center border border-[#242424] bg-[#0B0B0B] text-xs text-[#707070]">
            No featured items selected yet. Set items as featured from the dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSongs.slice(0, 3).map(song => (
              <div
                key={song.id}
                onClick={() => onOpenDetail('song', song)}
                className="group bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer flex flex-col justify-between"
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

      {/* 3. RECENTLY ADDED */}
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
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5"
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
                className="group cursor-pointer space-y-3"
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

      {/* 4. CURRENT FAVORITES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0B0B0B] border border-[#242424] p-8 sm:p-12">
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

      {/* 5. FEATURED COLLECTION SPOTLIGHT */}
      {featuredCollection && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="relative bg-[#0B0B0B] border border-[#242424] overflow-hidden grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#707070] block mb-2">
                  Featured Collection Playlist
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-[#F5F5F5] uppercase tracking-tight">
                  {featuredCollection.title}
                </h3>
                <p className="text-sm text-[#A1A1A1] leading-relaxed mt-4 font-light">
                  {featuredCollection.description}
                </p>
                <div className="mt-4 text-xs text-[#707070] flex items-center gap-2">
                  <span>{featuredCollection.itemIds?.length || 0} Tracks & Albums Included</span>
                  <span>·</span>
                  <span>Curated by MY WORLD</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => onOpenDetail('collection', featuredCollection)}
                  className="px-6 py-3.5 bg-[#F5F5F5] text-[#050505] hover:bg-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <span>Open Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="md:col-span-6 aspect-video md:aspect-auto relative min-h-[300px]">
              <img
                src={featuredCollection.coverImage}
                alt={featuredCollection.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0B0B0B] via-transparent to-transparent" />
            </div>
          </div>
        </section>
      )}

      {/* 6. VISUAL MOODBOARD */}
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
            className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5"
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
                className="aspect-square bg-[#111111] border border-[#242424] hover:border-[#707070] cursor-pointer overflow-hidden transition-all group relative"
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

      {/* 7. PERSONAL QUOTE */}
      {featuredQuote && (
        <section className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#707070] block">
              Liner Note & Reflection
            </span>
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-editorial italic font-normal text-[#F5F5F5] leading-relaxed">
              "{featuredQuote.text}"
            </blockquote>
            {featuredQuote.attribution && (
              <div className="text-xs uppercase tracking-widest text-[#A1A1A1] pt-2">
                — {featuredQuote.attribution} {featuredQuote.context ? `(${featuredQuote.context})` : ''}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. ABOUT PREVIEW */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="border border-[#242424] bg-[#0B0B0B] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#707070]">
              About MY WORLD
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              The Vision & The Sound
            </h3>
            <p className="text-sm text-[#A1A1A1] leading-relaxed line-clamp-3 font-light">
              {settings.aboutBio}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onSelectTab('about')}
              className="px-6 py-3.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#F5F5F5] text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <span>Read Full About</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
