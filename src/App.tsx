import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Song, 
  Artist, 
  Album, 
  Collection, 
  GalleryItem, 
  Quote, 
  SiteSettings, 
  NavTab 
} from './types';
import { 
  fetchPublishedSongs, 
  fetchAllSongs,
  fetchPublishedArtists, 
  fetchAllArtists,
  fetchPublishedAlbums, 
  fetchAllAlbums,
  fetchPublishedCollections, 
  fetchAllCollections,
  fetchPublishedGallery, 
  fetchAllGallery,
  fetchPublishedQuotes, 
  fetchAllQuotes,
  fetchSiteSettings,
  seedStarterContent
} from './services/db';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MusicPage } from './pages/MusicPage';
import { AlbumsPage } from './pages/AlbumsPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { GalleryPage } from './pages/GalleryPage';
import { QuotesPage } from './pages/QuotesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DetailModal } from './components/DetailModal';
import { LightboxModal } from './components/LightboxModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ASSET_IMAGES } from './assets/images';

const MainApp: React.FC = () => {
  const { isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [loading, setLoading] = useState(true);

  // Database states
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    heroHeadline: 'MY WORLD. MY RULES.',
    heroSubhead: 'A collection of sounds, people, moments, and things that mean something to me.',
    heroImage: ASSET_IMAGES.heroVinyl,
    aboutBio: 'MY WORLD is a personal sensory sanctuary and digital archive. It was conceived as an antidote to algorithmic feeds and passive consumption.',
    aboutPhoto: ASSET_IMAGES.artistPortrait,
    socialLinks: [
      { platform: 'Spotify', url: 'https://open.spotify.com', handle: '@myworld' },
      { platform: 'SoundCloud', url: 'https://soundcloud.com', handle: 'myworld-archives' },
      { platform: 'Bandcamp', url: 'https://bandcamp.com', handle: 'myworld' },
      { platform: 'Instagram', url: 'https://instagram.com', handle: '@myworld.journal' },
    ],
    featuredCollectionId: 'col_late_night',
  });

  // Modal states
  const [detailTarget, setDetailTarget] = useState<{
    type: 'song' | 'artist' | 'album' | 'collection';
    data: any;
  } | null>(null);

  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  // Load database data
  const loadData = useCallback(async () => {
    try {
      // If admin, fetch all records (including drafts); otherwise fetch published
      const [
        songsData,
        artistsData,
        albumsData,
        collectionsData,
        galleryData,
        quotesData,
        settingsData,
      ] = await Promise.all([
        isAdmin ? fetchAllSongs() : fetchPublishedSongs(),
        isAdmin ? fetchAllArtists() : fetchPublishedArtists(),
        isAdmin ? fetchAllAlbums() : fetchPublishedAlbums(),
        isAdmin ? fetchAllCollections() : fetchPublishedCollections(),
        isAdmin ? fetchAllGallery() : fetchPublishedGallery(),
        isAdmin ? fetchAllQuotes() : fetchPublishedQuotes(),
        fetchSiteSettings(),
      ]);

      // Set application states from Firestore
      setSongs(songsData);
      setArtists(artistsData);
      setAlbums(albumsData);
      setCollections(collectionsData);
      setGallery(galleryData);
      setQuotes(quotesData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle switching between related items in detail view
  const handleSelectOtherDetailItem = (type: 'song' | 'artist' | 'album' | 'collection', id: string) => {
    if (type === 'song') {
      const s = songs.find(item => item.id === id);
      if (s) setDetailTarget({ type: 'song', data: s });
    } else if (type === 'artist') {
      const a = artists.find(item => item.id === id);
      if (a) setDetailTarget({ type: 'artist', data: a });
    } else if (type === 'album') {
      const al = albums.find(item => item.id === id);
      if (al) setDetailTarget({ type: 'album', data: al });
    } else if (type === 'collection') {
      const c = collections.find(item => item.id === id);
      if (c) setDetailTarget({ type: 'collection', data: c });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-[#242424] selection:text-[#FFFFFF] flex flex-col lg:flex-row">
      {/* 1. Permanent Left Sidebar on desktop, collapsible drawer on mobile */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAdminAuth={() => setAdminAuthOpen(true)}
        settings={settings}
      />

      {/* 2. Main Website Content to the RIGHT of the sidebar */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col justify-between min-h-screen">
        <main className="flex-1">
          {loading ? (
            <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border border-[#404040] border-t-white animate-spin" />
              <p className="text-xs uppercase tracking-widest text-[#707070]">
                Connecting to MY WORLD...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'home' && (
                <HomePage
                  settings={settings}
                  songs={songs}
                  artists={artists}
                  albums={albums}
                  collections={collections}
                  gallery={gallery}
                  quotes={quotes}
                  onSelectTab={setCurrentTab}
                  onOpenDetail={(type, data) => setDetailTarget({ type, data })}
                  onOpenLightbox={item => setLightboxItem(item)}
                />
              )}

              {currentTab === 'music' && (
                <MusicPage
                  songs={songs}
                  onOpenDetail={song => setDetailTarget({ type: 'song', data: song })}
                />
              )}

              {currentTab === 'albums' && (
                <AlbumsPage
                  albums={albums}
                  onOpenDetail={album => setDetailTarget({ type: 'album', data: album })}
                />
              )}

              {currentTab === 'artists' && (
                <ArtistsPage
                  artists={artists}
                  onOpenDetail={artist => setDetailTarget({ type: 'artist', data: artist })}
                />
              )}

              {currentTab === 'collections' && (
                <CollectionsPage
                  collections={collections}
                  songs={songs}
                  albums={albums}
                  onOpenDetail={col => setDetailTarget({ type: 'collection', data: col })}
                />
              )}

              {currentTab === 'gallery' && (
                <GalleryPage
                  gallery={gallery}
                  onOpenLightbox={item => setLightboxItem(item)}
                />
              )}

              {currentTab === 'quotes' && (
                <QuotesPage
                  quotes={quotes}
                />
              )}

              {currentTab === 'about' && (
                <AboutPage
                  settings={settings}
                />
              )}

              {currentTab === 'admin' && (
                isAdmin ? (
                  <AdminDashboard
                    songs={songs}
                    artists={artists}
                    albums={albums}
                    collections={collections}
                    gallery={gallery}
                    quotes={quotes}
                    settings={settings}
                    onRefreshData={loadData}
                  />
                ) : (
                  <div className="max-w-md mx-auto px-6 py-32 text-center space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-wide text-[#F5F5F5]">
                      Access Restricted
                    </h2>
                    <p className="text-xs text-[#707070]">
                      The administrator dashboard requires authenticated credentials for {settings.socialLinks?.[0]?.handle || 'the archive owner'}.
                    </p>
                    <button
                      onClick={() => setAdminAuthOpen(true)}
                      className="px-6 py-2.5 bg-[#F5F5F5] text-[#050505] text-xs uppercase font-bold tracking-wider cursor-pointer hover:bg-white"
                    >
                      Authenticate with Google
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </main>

        {/* Minimal Footer */}
        <Footer
          settings={settings}
          onSelectTab={setCurrentTab}
          onOpenAdminAuth={() => setAdminAuthOpen(true)}
        />
      </div>

      {/* Modals & Overlays */}
      <DetailModal
        target={detailTarget}
        allSongs={songs}
        allAlbums={albums}
        onClose={() => setDetailTarget(null)}
        onSelectOtherItem={handleSelectOtherDetailItem}
      />

      <LightboxModal
        item={lightboxItem}
        items={gallery}
        onClose={() => setLightboxItem(null)}
        onNavigate={item => setLightboxItem(item)}
      />

      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onSuccess={() => {
          setCurrentTab('admin');
          loadData();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
