import React, { useState } from 'react';
import { 
  Song, 
  Artist, 
  Album, 
  Collection, 
  GalleryItem, 
  Quote, 
  MerchItem,
  SiteSettings, 
  TrackItem,
  formatInstagramUrl,
  formatInstagramHandle
} from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  saveSong, 
  deleteSong, 
  saveArtist, 
  deleteArtist, 
  saveAlbum, 
  deleteAlbum, 
  saveCollection, 
  deleteCollection, 
  saveGalleryItem, 
  deleteGalleryItem, 
  saveQuote, 
  deleteQuote, 
  saveMerchItem,
  deleteMerchItem,
  saveSiteSettings,
  seedStarterContent,
  syncAllSongsWithAlbums
} from '../services/db';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Star, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Save, 
  RefreshCw, 
  ShieldAlert, 
  ExternalLink,
  Layers,
  Music,
  User,
  Disc,
  Image as ImageIcon,
  Quote as QuoteIcon,
  Sliders,
  LayoutDashboard,
  Mic,
  ListMusic,
  Images,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Activity,
  Users,
  Instagram
} from 'lucide-react';
import { extractArtistsFromSong } from '../services/db';

interface AdminDashboardProps {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  collections: Collection[];
  gallery: GalleryItem[];
  quotes: Quote[];
  merch: MerchItem[];
  settings: SiteSettings;
  onRefreshData: () => Promise<void>;
}

type AdminSection = 'dashboard' | 'music' | 'albums' | 'artists' | 'merch' | 'gallery' | 'settings' | 'collections' | 'quotes';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  songs,
  artists,
  albums,
  collections,
  gallery,
  quotes,
  merch,
  settings,
  onRefreshData,
}) => {
  const { user, logout, adminEmail } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // EDIT STATE FOR ENTITIES
  const [editingSong, setEditingSong] = useState<Partial<Song> | null>(null);
  const [editingArtist, setEditingArtist] = useState<Partial<Artist> | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Partial<Album> | null>(null);
  const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [editingQuote, setEditingQuote] = useState<Partial<Quote> | null>(null);
  const [editingMerch, setEditingMerch] = useState<Partial<MerchItem> | null>(null);
  const [merchSizeInput, setMerchSizeInput] = useState('');
  const [editableSettings, setEditableSettings] = useState<SiteSettings>(settings);
  const [songArtistInput, setSongArtistInput] = useState('');

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const parseErrorMessage = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes('permission') || raw.includes('Missing or insufficient permissions')) {
      return `Database write restricted. Please sign in with your Google Account (${adminEmail}) to authorize edits.`;
    }
    return raw;
  };

  // MULTI-ARTIST SONG HELPERS
  const handleAddArtistToSong = (artistNameToAdd?: string) => {
    const raw = artistNameToAdd ?? songArtistInput;
    const name = raw.trim();
    if (!name || !editingSong) return;

    const currentArtists = editingSong.artists ? [...editingSong.artists] : [];
    if (!currentArtists.some(a => a.toLowerCase() === name.toLowerCase())) {
      currentArtists.push(name);
    }

    const updatedDisplayArtist = editingSong.artist && editingSong.artist.trim() !== ''
      ? (editingSong.artist.toLowerCase().includes(name.toLowerCase()) ? editingSong.artist : `${editingSong.artist}, ${name}`)
      : currentArtists.join(', ');

    setEditingSong({
      ...editingSong,
      artists: currentArtists,
      artist: updatedDisplayArtist,
    });
    setSongArtistInput('');
  };

  const handleRemoveArtistFromSong = (nameToRemove: string) => {
    if (!editingSong) return;
    const currentArtists = (editingSong.artists || []).filter(
      a => a.toLowerCase() !== nameToRemove.toLowerCase()
    );
    setEditingSong({
      ...editingSong,
      artists: currentArtists,
      artist: currentArtists.join(', '),
    });
  };

  // IMAGE UPLOADER HELPER
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotification('File exceeds 2MB limit. Please choose a smaller image or use a URL.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploaded(reader.result);
        showNotification('Image loaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  // RE-SEED DATA HANDLER
  const handleSeedDatabase = async () => {
    if (!window.confirm('Populate the library with curated starter records and photos?')) return;
    setSaving(true);
    try {
      await seedStarterContent();
      await onRefreshData();
      showNotification('Starter catalog loaded into database successfully.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  // SAVE SONG
  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong?.title) {
      showNotification('Song title is required.', 'error');
      return;
    }

    // Resolve all participating artists
    const currentArtists = (editingSong.artists && editingSong.artists.length > 0)
      ? editingSong.artists
      : (editingSong.artist ? extractArtistsFromSong(editingSong) : []);

    if (currentArtists.length === 0 && !editingSong.artist?.trim()) {
      showNotification('Please add at least one artist for this song.', 'error');
      return;
    }

    setSaving(true);
    try {
      const targetAlbumTitle = editingSong.album?.trim();
      const primaryArtist = editingSong.artist?.trim() || currentArtists.join(', ');

      await saveSong({
        ...editingSong,
        artist: primaryArtist,
        artists: currentArtists,
      });
      await onRefreshData();
      setEditingSong(null);
      setSongArtistInput('');

      const artistSummary = currentArtists.length > 1
        ? `Added to all ${currentArtists.length} artists (${currentArtists.join(', ')})`
        : `Assigned to ${currentArtists[0] || primaryArtist}`;

      if (targetAlbumTitle) {
        showNotification(`Song saved! ${artistSummary} & synced with album "${targetAlbumTitle}".`);
      } else {
        showNotification(`Song saved! ${artistSummary}.`);
      }
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  // SYNC ALL ALBUMS FROM EXISTING SONGS
  const handleSyncAllAlbums = async () => {
    setSaving(true);
    try {
      const res = await syncAllSongsWithAlbums();
      await onRefreshData();
      showNotification(`Albums synced from songs: ${res.createdCount} created, ${res.updatedCount} updated.`);
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('Delete this track from the catalog?')) return;
    try {
      await deleteSong(id);
      await onRefreshData();
      showNotification('Song deleted.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // SAVE ARTIST
  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist?.name) {
      showNotification('Artist name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveArtist(editingArtist);
      await onRefreshData();
      setEditingArtist(null);
      showNotification('Artist profile saved.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (!window.confirm('Delete this artist profile?')) return;
    try {
      await deleteArtist(id);
      await onRefreshData();
      showNotification('Artist deleted.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // SAVE ALBUM
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum?.title || !editingAlbum?.artist) {
      showNotification('Album title and artist are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveAlbum(editingAlbum);
      await onRefreshData();
      setEditingAlbum(null);
      showNotification('Album record saved.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await deleteAlbum(id);
      await onRefreshData();
      showNotification('Album deleted.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // ALBUM TRACKLIST ACTIONS
  const handleAddTrack = () => {
    if (!editingAlbum) return;
    const currentList = editingAlbum.tracklist || [];
    const newTrack: TrackItem = {
      id: `track_${Date.now()}`,
      trackNumber: currentList.length + 1,
      title: 'New Track',
      duration: '3:30',
    };
    setEditingAlbum({
      ...editingAlbum,
      tracklist: [...currentList, newTrack],
    });
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    if (!editingAlbum?.tracklist) return;
    const list = [...editingAlbum.tracklist];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    // Swap
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    // Re-assign track numbers
    const renumbered = list.map((item, idx) => ({ ...item, trackNumber: idx + 1 }));
    setEditingAlbum({ ...editingAlbum, tracklist: renumbered });
  };

  const handleDeleteTrack = (index: number) => {
    if (!editingAlbum?.tracklist) return;
    const filtered = editingAlbum.tracklist.filter((_, idx) => idx !== index);
    const renumbered = filtered.map((item, idx) => ({ ...item, trackNumber: idx + 1 }));
    setEditingAlbum({ ...editingAlbum, tracklist: renumbered });
  };

  // SAVE COLLECTION
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection?.title) {
      showNotification('Collection title is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveCollection(editingCollection);
      await onRefreshData();
      setEditingCollection(null);
      showNotification('Collection saved.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error saving collection', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await deleteCollection(id);
      await onRefreshData();
      showNotification('Collection deleted.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error deleting collection', 'error');
    }
  };

  // SAVE GALLERY ITEM
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery?.title || !editingGallery?.imageUrl) {
      showNotification('Title and Image are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveGalleryItem(editingGallery);
      await onRefreshData();
      setEditingGallery(null);
      showNotification('Photo added to gallery.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error saving gallery item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      await deleteGalleryItem(id);
      await onRefreshData();
      showNotification('Image deleted.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error deleting item', 'error');
    }
  };

  // SAVE QUOTE
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote?.text) {
      showNotification('Quote text is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveQuote(editingQuote);
      await onRefreshData();
      setEditingQuote(null);
      showNotification('Quote record saved.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error saving quote', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm('Delete this quote?')) return;
    try {
      await deleteQuote(id);
      await onRefreshData();
      showNotification('Quote deleted.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error deleting quote', 'error');
    }
  };

  // MERCH / CLOTHING HANDLERS
  const handleSaveMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerch?.name) {
      showNotification('Product name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveMerchItem(editingMerch);
      await onRefreshData();
      setEditingMerch(null);
      showNotification('Garment product saved successfully.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMerch = async (id: string) => {
    if (!window.confirm('Delete this garment product from the store archive?')) return;
    try {
      await deleteMerchItem(id);
      await onRefreshData();
      showNotification('Garment removed from store.');
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  const handleToggleMerchStock = async (item: MerchItem) => {
    try {
      await saveMerchItem({
        ...item,
        inStock: !item.inStock,
      });
      await onRefreshData();
      showNotification(`${item.name} marked as ${!item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
    } catch (err: unknown) {
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // SAVE SITE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings(editableSettings);
      await onRefreshData();
      showNotification('Site settings and homepage updated.');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-[#0B0B0B] border border-[#242424] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#707070] mb-1">
            <span className="w-2 h-2 bg-white" />
            <span>Administrator Console</span>
            <span>·</span>
            <span>{user?.email || adminEmail}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F5F5]">
            MY WORLD Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedDatabase}
            disabled={saving}
            className="px-3.5 py-2 bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#A1A1A1] hover:text-[#F5F5F5] text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            title="Populate or restore starter catalog"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Seed Starter Catalog</span>
          </button>
          
          <button
            onClick={() => logout()}
            className="px-3.5 py-2 bg-[#161616] border border-[#242424] hover:border-red-900/60 text-[#A1A1A1] hover:text-[#F5F5F5] text-xs uppercase tracking-wider transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className={`p-4 border text-xs flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-[#0B0B0B] border-[#404040] text-[#F5F5F5]' 
            : 'bg-[#140808] border-[#552020] text-[#FFAAAA]'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Responsive Two-Column Layout with Admin Left Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Admin Left Sidebar */}
        <aside className="lg:col-span-3 bg-[#0B0B0B] border border-[#242424] p-3 sticky top-6 space-y-1">
          <div className="px-3 py-2 border-b border-[#1C1C1C] mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#707070] font-mono block">
              Control Panel
            </span>
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider block mt-0.5">
              Archive Manager
            </span>
          </div>

          {[
            { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'music' as AdminSection, label: 'Music', count: songs.length, icon: Music },
            { id: 'albums' as AdminSection, label: 'Albums', count: albums.length, icon: Disc },
            { id: 'artists' as AdminSection, label: 'Artists', count: artists.length, icon: Mic },
            { id: 'merch' as AdminSection, label: 'Clothing / Store', count: merch.length, icon: ShoppingBag },
            { id: 'gallery' as AdminSection, label: 'Gallery', count: gallery.length, icon: Images },
            { id: 'settings' as AdminSection, label: 'Site Settings', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#141414] text-[#F5F5F5] font-semibold border-l-2 border-white pl-2.5'
                    : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#0F0F0F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#707070]'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-mono tabular-nums text-[#666666]">{tab.count}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Admin Content Area (Right of Sidebar) */}
        <div className="lg:col-span-9 space-y-6">

          {/* ================= SECTION: DASHBOARD OVERVIEW ================= */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#707070] block mb-1">
                  System Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F5F5F5]">
                  Archive Status & Metrics
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveSection('music')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Music Tracks</span>
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {songs.length}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    {songs.filter(s => s.isPublished).length} published · {songs.filter(s => s.isFeatured).length} featured
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('albums')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Curated Albums</span>
                    <Disc className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {albums.length}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    With tracklist sequences
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('artists')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Artist Profiles</span>
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {artists.length}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    Profiles & critical thoughts
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('gallery')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Gallery Photos</span>
                    <Images className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {gallery.length}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    Monochrome moodboard works
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('merch')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Clothing & Merch</span>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {merch.length}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    {merch.filter(m => m.inStock).length} in stock · {merch.filter(m => m.isPublished).length} active
                  </span>
                </div>
              </div>

              {/* Security & Cloud Database Card */}
              <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5]">
                      Server-Side Security & Permissions
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#F5F5F5] bg-[#161616] border border-[#242424] px-2 py-0.5">
                    Authorized
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-[#A1A1A1]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#707070] block">Authorized Account</span>
                    <span className="text-[#F5F5F5] font-mono">{adminEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#707070] block">Authentication Method</span>
                    <span className="text-[#F5F5F5]">Google OAuth (Server-Verified)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#707070] block">Access Enforcement</span>
                    <span className="text-[#F5F5F5]">Server-Side ABAC / Row Level Security</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#707070] block">Public Boundary</span>
                    <span className="text-[#F5F5F5]">Unpublished drafts and mutations strictly locked</span>
                  </div>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5]">
                  Quick Operations
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setActiveSection('music');
                      setEditingSong({
                        title: '',
                        artist: '',
                        album: '',
                        coverUrl: '',
                        releaseYear: new Date().getFullYear().toString(),
                        genre: 'Electronic',
                        moodTags: [],
                        personalRating: 9,
                        personalNotes: '',
                        externalUrl: '',
                        embedUrl: '',
                        isFeatured: false,
                        isPublished: true,
                      });
                    }}
                    className="px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-xs uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Track</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection('albums');
                      setEditingAlbum({
                        title: '',
                        artist: '',
                        coverImage: '',
                        releaseYear: new Date().getFullYear().toString(),
                        genre: 'Electronic',
                        tracklist: [],
                        review: '',
                        rating: 9,
                        externalUrl: '',
                        isFeatured: false,
                        isPublished: true,
                      });
                    }}
                    className="px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-xs uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Album</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection('artists');
                      setEditingArtist({
                        name: '',
                        profileImage: '',
                        bio: '',
                        genres: [],
                        country: '',
                        favoriteAlbums: [],
                        personalThoughts: '',
                        externalUrl: '',
                        isFeatured: false,
                        isPublished: true,
                      });
                    }}
                    className="px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-xs uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Artist Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection('gallery');
                      setEditingGallery({
                        title: '',
                        imageUrl: '',
                        caption: '',
                        category: 'Architecture',
                        isFeatured: true,
                        isPublished: true,
                      });
                    }}
                    className="px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-xs uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photography</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('settings')}
                    className="px-4 py-2.5 bg-[#111111] border border-[#242424] hover:border-[#707070] text-xs uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure Site Copy</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION: MUSIC ================= */}
          {activeSection === 'music' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
              Music Catalog Manager
            </h2>
            <button
              onClick={() => {
                setEditingSong({
                  title: '',
                  artist: '',
                  artists: [],
                  album: '',
                  coverUrl: '',
                  releaseYear: new Date().getFullYear().toString(),
                  genre: 'Electronic',
                  moodTags: [],
                  personalRating: 9,
                  personalNotes: '',
                  externalUrl: '',
                  embedUrl: '',
                  isFeatured: false,
                  isPublished: true,
                });
                setSongArtistInput('');
              }}
              className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Song</span>
            </button>
          </div>

          {/* Form Modal/Drawer for editing song */}
          {editingSong && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                  {editingSong.id ? 'Edit Song Record' : 'Create New Song'}
                </h3>
                <button onClick={() => setEditingSong(null)} className="text-[#707070] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSong} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Song Title *</label>
                    <input
                      type="text"
                      required
                      value={editingSong.title || ''}
                      onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>

                  {/* MULTI-ARTIST SELECTOR & COLLABORATION SYSTEM */}
                  <div className="md:col-span-2 bg-[#101010] border border-[#242424] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5] font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Artists & Collaborators (المغنيين / المشاركون في الأغنية) *</span>
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">
                        ✨ Multi-Artist Auto-Sync
                      </span>
                    </div>

                    {/* Chips of currently assigned artists */}
                    <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 bg-[#0A0A0A] border border-[#1F1F1F]">
                      {(!editingSong.artists || editingSong.artists.length === 0) && (
                        <span className="text-xs text-[#606060] italic">
                          لم يتم تحديد مغنيين بعد. اكتب اسم المغني بالأسفل أو اختر من الفنانين المسجلين.
                        </span>
                      )}
                      {editingSong.artists?.map((artistName, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181818] border border-[#333333] text-xs text-[#F5F5F5] font-medium group"
                        >
                          <User className="w-3 h-3 text-amber-400/80" />
                          <span>{artistName}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveArtistFromSong(artistName)}
                            className="text-[#707070] hover:text-red-400 transition-colors ml-1 cursor-pointer"
                            title={`Remove ${artistName}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Artist Input & Action */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          list="registered-artists-datalist"
                          value={songArtistInput}
                          onChange={e => setSongArtistInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddArtistToSong();
                            }
                          }}
                          placeholder="اكتب اسم المغني (مثال: Travis Scott أو Drake أو حمزة نمرة) أو اختر من القائمة..."
                          className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                        />
                        <datalist id="registered-artists-datalist">
                          {artists.map(a => (
                            <option key={a.id} value={a.name}>
                              {a.name} {a.country ? `(${a.country})` : ''}
                            </option>
                          ))}
                        </datalist>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddArtistToSong()}
                        className="px-4 py-2 bg-[#222222] hover:bg-[#333333] border border-[#333333] text-xs font-semibold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add Artist / إضافة</span>
                      </button>
                    </div>

                    {/* Quick Suggestions from existing catalog */}
                    {artists.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#707070] block">
                          إضافة سريعة بنقرة واحدة من الفنانين المسجلين:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
                          {artists
                            .filter(a => !(editingSong.artists || []).some(existing => existing.toLowerCase() === a.name.toLowerCase()))
                            .slice(0, 12)
                            .map(a => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => handleAddArtistToSong(a.name)}
                                className="px-2.5 py-1 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#505050] text-[11px] text-[#A1A1A1] hover:text-[#F5F5F5] transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>+ {a.name}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Display name override */}
                    <div className="pt-2 border-t border-[#1C1C1C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-wider text-[#808080] mb-0.5">
                          Display Credit (طريقة ظهور أسماء المغنيين للمستمعين):
                        </label>
                        <input
                          type="text"
                          value={editingSong.artist || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingSong({
                              ...editingSong,
                              artist: val,
                              artists: (editingSong.artists && editingSong.artists.length > 0)
                                ? editingSong.artists
                                : val.split(/[,/&+x]|(?:\s+(?:ft\.?|feat\.?|featuring|with)\s+)/i).map(s => s.trim()).filter(Boolean)
                            });
                          }}
                          placeholder="e.g. Drake ft. 21 Savage (or leave auto-generated)"
                          className="w-full bg-[#0A0A0A] border border-[#242424] px-2.5 py-1.5 text-xs text-[#E5E5E5] focus:outline-none focus:border-[#707070]"
                        />
                      </div>
                      <p className="text-[10px] text-[#707070] sm:max-w-xs leading-tight">
                        💡 الأغنية ستنزل فوراً في صفحة وبروفايل كل مغني يتم إضافته هنا. ولو المغني جديد، الموقع هيعمل له بروفايل فنان تلقائياً.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1]">
                        Album Name
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">
                        ✨ Auto-creates Album
                      </span>
                    </div>
                    <input
                      type="text"
                      list="existing-albums-list"
                      value={editingSong.album || ''}
                      onChange={e => setEditingSong({ ...editingSong, album: e.target.value })}
                      placeholder="Type or select album (e.g. Untrue, Midnight Memories)..."
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                    <datalist id="existing-albums-list">
                      {albums.map(a => (
                        <option key={a.id} value={a.title}>
                          {a.artist ? `${a.title} (${a.artist})` : a.title}
                        </option>
                      ))}
                    </datalist>
                    <p className="text-[10px] text-[#707070] mt-1 leading-normal">
                      💡 بمجرد كتابة اسم الألبوم، سيقوم الموقع بإنشاء الألبوم تلقائياً وإدراج هذه الأغنية داخل قائمة تراكـاته فوراً.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Genre</label>
                    <input
                      type="text"
                      value={editingSong.genre || ''}
                      onChange={e => setEditingSong({ ...editingSong, genre: e.target.value })}
                      placeholder="e.g. Dubstep, UK Garage, Ambient"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Release Year</label>
                    <input
                      type="text"
                      value={editingSong.releaseYear || ''}
                      onChange={e => setEditingSong({ ...editingSong, releaseYear: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Personal Rating (1 to 10)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={editingSong.personalRating ?? 9}
                      onChange={e => setEditingSong({ ...editingSong, personalRating: parseFloat(e.target.value) || 9 })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Cover Artwork URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingSong.coverUrl || ''}
                        onChange={e => setEditingSong({ ...editingSong, coverUrl: e.target.value })}
                        placeholder="Image URL or upload"
                        className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                      />
                      <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileUpload(e, base64 => setEditingSong({ ...editingSong, coverUrl: base64 }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Mood Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editingSong.moodTags?.join(', ') || ''}
                      onChange={e => setEditingSong({
                        ...editingSong,
                        moodTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      })}
                      placeholder="Rainy Night, Melancholy, Heavy Bass"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">External Listening URL</label>
                    <input
                      type="url"
                      value={editingSong.externalUrl || ''}
                      onChange={e => setEditingSong({ ...editingSong, externalUrl: e.target.value })}
                      placeholder="https://open.spotify.com/... or Bandcamp"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Embed URL (Optional)</label>
                    <input
                      type="text"
                      value={editingSong.embedUrl || ''}
                      onChange={e => setEditingSong({ ...editingSong, embedUrl: e.target.value })}
                      placeholder="Supported Spotify / SoundCloud embed URL"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">My Personal Notes & Critical Reflection</label>
                  <textarea
                    rows={4}
                    value={editingSong.personalNotes || ''}
                    onChange={e => setEditingSong({ ...editingSong, personalNotes: e.target.value })}
                    placeholder="Reflections on why this track matters, sound design specifics, memories..."
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#707070]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingSong.isFeatured || false}
                      onChange={e => setEditingSong({ ...editingSong, isFeatured: e.target.checked })}
                      className="w-4 h-4 bg-[#111111] border-[#242424]"
                    />
                    <span>Featured in Homepage Rotation</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingSong.isPublished ?? true}
                      onChange={e => setEditingSong({ ...editingSong, isPublished: e.target.checked })}
                      className="w-4 h-4 bg-[#111111] border-[#242424]"
                    />
                    <span>Published (Visible to public)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button
                    type="button"
                    onClick={() => setEditingSong(null)}
                    className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white"
                  >
                    {saving ? 'Saving...' : 'Save Song'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Songs Table */}
          <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
            {songs.map(song => (
              <div key={song.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#111111] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-12 h-12 object-cover bg-black border border-[#242424] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#F5F5F5] truncate">{song.title}</h4>
                      {song.isFeatured && <Star className="w-3.5 h-3.5 fill-white text-white shrink-0" />}
                      {!song.isPublished && (
                        <span className="text-[10px] text-[#707070] border border-[#333333] px-1.5 py-0.2">Draft</span>
                      )}
                    </div>
                    <p className="text-xs text-[#707070] truncate">
                      {song.artist} {song.album ? `· ${song.album}` : ''} · {song.genre} · {song.personalRating}/10
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const currentArtists = (song.artists && song.artists.length > 0)
                        ? song.artists
                        : extractArtistsFromSong(song);
                      setEditingSong({
                        ...song,
                        artists: currentArtists,
                      });
                      setSongArtistInput('');
                    }}
                    className="p-2 text-[#707070] hover:text-[#F5F5F5] cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
                    className="p-2 text-[#707070] hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: ARTISTS ================= */}
      {activeSection === 'artists' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
              Artist Profiles Manager
            </h2>
            <button
              onClick={() => setEditingArtist({
                name: '',
                profileImage: '',
                bio: '',
                genres: [],
                country: '',
                favoriteAlbums: [],
                personalThoughts: '',
                externalUrl: '',
                instagramUrl: '',
                isFeatured: false,
                isPublished: true,
              })}
              className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Artist Profile</span>
            </button>
          </div>

          {editingArtist && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                  {editingArtist.id ? 'Edit Artist Profile' : 'New Artist'}
                </h3>
                <button onClick={() => setEditingArtist(null)} className="text-[#707070] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveArtist} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Artist Name *</label>
                    <input
                      type="text"
                      required
                      value={editingArtist.name || ''}
                      onChange={e => setEditingArtist({ ...editingArtist, name: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Country / Origin</label>
                    <input
                      type="text"
                      value={editingArtist.country || ''}
                      onChange={e => setEditingArtist({ ...editingArtist, country: e.target.value })}
                      placeholder="London, UK / Berlin, Germany"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={editingArtist.genres?.join(', ') || ''}
                      onChange={e => setEditingArtist({
                        ...editingArtist,
                        genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Profile Photo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingArtist.profileImage || ''}
                        onChange={e => setEditingArtist({ ...editingArtist, profileImage: e.target.value })}
                        placeholder="Image URL or upload"
                        className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                      />
                      <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileUpload(e, base64 => setEditingArtist({ ...editingArtist, profileImage: base64 }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Favorite / Essential Albums</label>
                    <input
                      type="text"
                      value={editingArtist.favoriteAlbums?.join(', ') || ''}
                      onChange={e => setEditingArtist({
                        ...editingArtist,
                        favoriteAlbums: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      })}
                      placeholder="Untrue, Kindred EP"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Official Website or Bandcamp</label>
                    <input
                      type="url"
                      value={editingArtist.externalUrl || ''}
                      onChange={e => setEditingArtist({ ...editingArtist, externalUrl: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  {/* INSTAGRAM PROFILE FIELD */}
                  <div className="md:col-span-2 bg-[#101010] border border-[#282828] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5] font-semibold flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-400" />
                        <span>Instagram Profile / انستجرام المغني</span>
                      </label>
                      <span className="text-[10px] text-pink-400 font-mono">
                        Direct Fan Profile
                      </span>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={editingArtist.instagramUrl || ''}
                        onChange={e => setEditingArtist({ ...editingArtist, instagramUrl: e.target.value })}
                        placeholder="e.g. @champagnepapi or https://instagram.com/travisscott"
                        className="w-full bg-[#141414] border border-[#2B2B2B] pl-9 pr-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-pink-500 placeholder-[#606060]"
                      />
                    </div>

                    {editingArtist.instagramUrl && editingArtist.instagramUrl.trim() && (
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-pink-300 font-mono">
                          <span>Handle:</span>
                          <span className="font-semibold text-[#F5F5F5]">{formatInstagramHandle(editingArtist.instagramUrl)}</span>
                        </div>
                        <a
                          href={formatInstagramUrl(editingArtist.instagramUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 underline"
                        >
                          <span>Test Profile Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Short Biography</label>
                  <textarea
                    rows={3}
                    value={editingArtist.bio || ''}
                    onChange={e => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Personal Thoughts about the Artist</label>
                  <textarea
                    rows={3}
                    value={editingArtist.personalThoughts || ''}
                    onChange={e => setEditingArtist({ ...editingArtist, personalThoughts: e.target.value })}
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingArtist.isFeatured || false}
                      onChange={e => setEditingArtist({ ...editingArtist, isFeatured: e.target.checked })}
                    />
                    <span>Featured Artist</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingArtist.isPublished ?? true}
                      onChange={e => setEditingArtist({ ...editingArtist, isPublished: e.target.checked })}
                    />
                    <span>Published</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button type="button" onClick={() => setEditingArtist(null)} className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white">
                    Save Artist
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
            {artists.map(artist => (
              <div key={artist.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#111111] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={artist.profileImage} alt={artist.name} className="w-12 h-12 object-cover bg-black border border-[#242424] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#F5F5F5] truncate">{artist.name}</h4>
                      {artist.instagramUrl ? (
                        <a
                          href={formatInstagramUrl(artist.instagramUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-950/40 border border-pink-700/50 hover:border-pink-500 text-pink-300 text-[10px] font-mono shrink-0"
                          title={`Visit ${artist.name}'s Instagram`}
                        >
                          <Instagram className="w-2.5 h-2.5 text-pink-400" />
                          <span>{formatInstagramHandle(artist.instagramUrl)}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingArtist(artist)}
                          className="text-[10px] font-mono text-[#666666] hover:text-pink-400 flex items-center gap-1 cursor-pointer"
                          title="Add Instagram account"
                        >
                          <Instagram className="w-2.5 h-2.5" />
                          <span>+ Add IG</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#707070] truncate">{artist.country || 'Artist'} · {artist.genres?.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingArtist(artist)} className="p-2 text-[#707070] hover:text-[#F5F5F5]"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteArtist(artist.id)} className="p-2 text-[#707070] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: ALBUMS ================= */}
      {activeSection === 'albums' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
                Curated Albums & Tracklists
              </h2>
              <span className="text-[11px] text-[#707070]">
                Albums are auto-generated when saving songs with album names.
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSyncAllAlbums}
                disabled={saving}
                className="px-3.5 py-2 bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#A1A1A1] hover:text-[#F5F5F5] text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                title="Scan all songs in library and generate or link albums automatically"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                <span>Auto-Sync from Songs</span>
              </button>

              <button
                onClick={() => setEditingAlbum({
                  title: '',
                  artist: '',
                  coverImage: '',
                  releaseYear: new Date().getFullYear().toString(),
                  genre: 'Electronic',
                  tracklist: [],
                  review: '',
                  rating: 9,
                  externalUrl: '',
                  isFeatured: false,
                  isPublished: true,
                })}
                className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white"
              >
                <Plus className="w-4 h-4" />
                <span>Add Album Record</span>
              </button>
            </div>
          </div>

          {editingAlbum && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                  {editingAlbum.id ? 'Edit Album' : 'New Album'}
                </h3>
                <button onClick={() => setEditingAlbum(null)} className="text-[#707070] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAlbum} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Album Title *</label>
                    <input
                      type="text"
                      required
                      value={editingAlbum.title || ''}
                      onChange={e => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Artist *</label>
                    <input
                      type="text"
                      required
                      value={editingAlbum.artist || ''}
                      onChange={e => setEditingAlbum({ ...editingAlbum, artist: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Genre</label>
                    <input
                      type="text"
                      value={editingAlbum.genre || ''}
                      onChange={e => setEditingAlbum({ ...editingAlbum, genre: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Release Year</label>
                    <input
                      type="text"
                      value={editingAlbum.releaseYear || ''}
                      onChange={e => setEditingAlbum({ ...editingAlbum, releaseYear: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Personal Rating (1-10)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={editingAlbum.rating ?? 9}
                      onChange={e => setEditingAlbum({ ...editingAlbum, rating: parseFloat(e.target.value) || 9 })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Cover Artwork URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingAlbum.coverImage || ''}
                        onChange={e => setEditingAlbum({ ...editingAlbum, coverImage: e.target.value })}
                        className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                      />
                      <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileUpload(e, base64 => setEditingAlbum({ ...editingAlbum, coverImage: base64 }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Personal Review & Deep Reflection</label>
                  <textarea
                    rows={4}
                    value={editingAlbum.review || ''}
                    onChange={e => setEditingAlbum({ ...editingAlbum, review: e.target.value })}
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>

                {/* TRACKLIST REORDERING & MANAGEMENT */}
                <div className="space-y-3 pt-4 border-t border-[#1C1C1C]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F5F5F5]">
                        Album Tracklist ({editingAlbum.tracklist?.length || 0})
                      </h4>
                      <p className="text-[11px] text-[#707070]">
                        Use the arrows to reorder tracks in sequence.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTrack}
                      className="px-3 py-1.5 bg-[#161616] border border-[#242424] text-xs text-[#F5F5F5] hover:border-[#707070] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Track</span>
                    </button>
                  </div>

                  <div className="border border-[#242424] divide-y divide-[#1F1F1F] bg-[#111111]">
                    {editingAlbum.tracklist?.map((track, idx) => (
                      <div key={track.id || idx} className="p-3 flex items-center gap-3 text-xs">
                        <span className="font-mono text-[#707070] w-6 text-center tabular-nums">
                          {track.trackNumber}
                        </span>

                        <input
                          type="text"
                          value={track.title}
                          onChange={e => {
                            const updated = [...(editingAlbum.tracklist || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setEditingAlbum({ ...editingAlbum, tracklist: updated });
                          }}
                          placeholder="Track title"
                          className="flex-1 bg-[#0B0B0B] border border-[#242424] px-2.5 py-1 text-xs text-[#F5F5F5]"
                        />

                        <input
                          type="text"
                          value={track.duration || ''}
                          onChange={e => {
                            const updated = [...(editingAlbum.tracklist || [])];
                            updated[idx] = { ...updated[idx], duration: e.target.value };
                            setEditingAlbum({ ...editingAlbum, tracklist: updated });
                          }}
                          placeholder="3:45"
                          className="w-20 bg-[#0B0B0B] border border-[#242424] px-2 py-1 text-xs text-[#F5F5F5] font-mono"
                        />

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveTrack(idx, 'up')}
                            className="p-1 text-[#707070] hover:text-[#F5F5F5] disabled:opacity-30"
                            title="Move track up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (editingAlbum.tracklist?.length || 0) - 1}
                            onClick={() => handleMoveTrack(idx, 'down')}
                            className="p-1 text-[#707070] hover:text-[#F5F5F5] disabled:opacity-30"
                            title="Move track down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrack(idx)}
                            className="p-1 text-[#707070] hover:text-red-400"
                            title="Delete track"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingAlbum.isFeatured || false}
                      onChange={e => setEditingAlbum({ ...editingAlbum, isFeatured: e.target.checked })}
                    />
                    <span>Featured Album</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingAlbum.isPublished ?? true}
                      onChange={e => setEditingAlbum({ ...editingAlbum, isPublished: e.target.checked })}
                    />
                    <span>Published</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button type="button" onClick={() => setEditingAlbum(null)} className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white">
                    Save Album
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
            {albums.map(album => (
              <div key={album.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#111111] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={album.coverImage} alt={album.title} className="w-12 h-12 object-cover bg-black border border-[#242424] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#F5F5F5] truncate">{album.title}</h4>
                    <p className="text-xs text-[#707070] truncate">{album.artist} · {album.releaseYear} · {album.tracklist?.length || 0} Tracks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingAlbum(album)} className="p-2 text-[#707070] hover:text-[#F5F5F5]"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteAlbum(album.id)} className="p-2 text-[#707070] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: COLLECTIONS ================= */}
      {activeSection === 'collections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
              Collections & Thematic Playlists
            </h2>
            <button
              onClick={() => setEditingCollection({
                title: '',
                slug: '',
                description: '',
                coverImage: '',
                itemIds: [],
                isFeatured: false,
                isPublished: true,
              })}
              className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>New Collection</span>
            </button>
          </div>

          {editingCollection && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                  {editingCollection.id ? 'Edit Collection' : 'Create Collection'}
                </h3>
                <button onClick={() => setEditingCollection(null)} className="text-[#707070] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCollection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={editingCollection.title || ''}
                      onChange={e => setEditingCollection({ ...editingCollection, title: e.target.value })}
                      placeholder="e.g. Late Night, Underground, Memories"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Slug</label>
                    <input
                      type="text"
                      value={editingCollection.slug || ''}
                      onChange={e => setEditingCollection({ ...editingCollection, slug: e.target.value })}
                      placeholder="late-night"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Cover Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingCollection.coverImage || ''}
                        onChange={e => setEditingCollection({ ...editingCollection, coverImage: e.target.value })}
                        className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                      />
                      <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileUpload(e, base64 => setEditingCollection({ ...editingCollection, coverImage: base64 }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingCollection.description || ''}
                    onChange={e => setEditingCollection({ ...editingCollection, description: e.target.value })}
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>

                {/* Choose included songs */}
                <div className="space-y-2 pt-2 border-t border-[#1C1C1C]">
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1]">
                    Select Tracks to Include in this Collection
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-[#242424] p-3 divide-y divide-[#1F1F1F] bg-[#111111]">
                    {songs.map(song => {
                      const isSelected = editingCollection.itemIds?.includes(song.id);
                      return (
                        <label key={song.id} className="py-2 flex items-center justify-between text-xs cursor-pointer hover:text-white">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={e => {
                                const current = editingCollection.itemIds || [];
                                const updated = e.target.checked
                                  ? [...current, song.id]
                                  : current.filter(id => id !== song.id);
                                setEditingCollection({ ...editingCollection, itemIds: updated });
                              }}
                            />
                            <span>{song.title} — {song.artist}</span>
                          </div>
                          <span className="text-[#707070]">{song.genre}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingCollection.isFeatured || false}
                      onChange={e => setEditingCollection({ ...editingCollection, isFeatured: e.target.checked })}
                    />
                    <span>Featured on Homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingCollection.isPublished ?? true}
                      onChange={e => setEditingCollection({ ...editingCollection, isPublished: e.target.checked })}
                    />
                    <span>Published</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button type="button" onClick={() => setEditingCollection(null)} className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white">
                    Save Collection
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
            {collections.map(col => (
              <div key={col.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#111111] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={col.coverImage} alt={col.title} className="w-12 h-12 object-cover bg-black border border-[#242424] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#F5F5F5] truncate">{col.title}</h4>
                    <p className="text-xs text-[#707070] truncate">{col.itemIds?.length || 0} Tracks · slug: {col.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingCollection(col)} className="p-2 text-[#707070] hover:text-[#F5F5F5]"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteCollection(col.id)} className="p-2 text-[#707070] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: GALLERY ================= */}
      {activeSection === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
              Visual Gallery & Moodboard
            </h2>
            <button
              onClick={() => setEditingGallery({
                title: '',
                imageUrl: '',
                caption: '',
                category: 'Architecture',
                isFeatured: true,
                isPublished: true,
              })}
              className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photography / Artwork</span>
            </button>
          </div>

          {editingGallery && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                  {editingGallery.id ? 'Edit Image Item' : 'Upload Image to Gallery'}
                </h3>
                <button onClick={() => setEditingGallery(null)} className="text-[#707070] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={editingGallery.title || ''}
                      onChange={e => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Category</label>
                    <input
                      type="text"
                      value={editingGallery.category || ''}
                      onChange={e => setEditingGallery({ ...editingGallery, category: e.target.value })}
                      placeholder="Architecture, Sound Systems, Studio"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Image Source (URL or File Upload) *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={editingGallery.imageUrl || ''}
                        onChange={e => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                        placeholder="Image URL"
                        className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                      />
                      <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileUpload(e, base64 => setEditingGallery({ ...editingGallery, imageUrl: base64 }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Caption / Photographic Note</label>
                  <textarea
                    rows={2}
                    value={editingGallery.caption || ''}
                    onChange={e => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingGallery.isFeatured ?? true}
                      onChange={e => setEditingGallery({ ...editingGallery, isFeatured: e.target.checked })}
                    />
                    <span>Show on Homepage Moodboard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingGallery.isPublished ?? true}
                      onChange={e => setEditingGallery({ ...editingGallery, isPublished: e.target.checked })}
                    />
                    <span>Published</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button type="button" onClick={() => setEditingGallery(null)} className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white">
                    Save Image
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gallery.map(item => (
              <div key={item.id} className="bg-[#0B0B0B] border border-[#242424] overflow-hidden group relative">
                <div className="aspect-square bg-[#111111]">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover filter grayscale" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#F5F5F5] truncate">{item.title}</p>
                  <p className="text-[10px] text-[#707070] truncate">{item.category}</p>
                </div>
                <button
                  onClick={() => handleDeleteGallery(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/80 text-[#707070] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: QUOTES ================= */}
      {activeSection === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
              Quotes & Aphorisms Manager
            </h2>
            <button
              onClick={() => setEditingQuote({
                text: '',
                attribution: '',
                context: '',
                isFeatured: false,
                isPublished: true,
              })}
              className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Quote</span>
            </button>
          </div>

          {editingQuote && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-4">
              <form onSubmit={handleSaveQuote} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Quote Statement *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingQuote.text || ''}
                    onChange={e => setEditingQuote({ ...editingQuote, text: e.target.value })}
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Attribution (Author / Artist)</label>
                    <input
                      type="text"
                      value={editingQuote.attribution || ''}
                      onChange={e => setEditingQuote({ ...editingQuote, attribution: e.target.value })}
                      placeholder="Burial, Dean Blunt, etc."
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Context / Source</label>
                    <input
                      type="text"
                      value={editingQuote.context || ''}
                      onChange={e => setEditingQuote({ ...editingQuote, context: e.target.value })}
                      placeholder="Interview 2007, Liner notes"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingQuote.isFeatured || false}
                      onChange={e => setEditingQuote({ ...editingQuote, isFeatured: e.target.checked })}
                    />
                    <span>Featured on Homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={editingQuote.isPublished ?? true}
                      onChange={e => setEditingQuote({ ...editingQuote, isPublished: e.target.checked })}
                    />
                    <span>Published</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button type="button" onClick={() => setEditingQuote(null)} className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white">
                    Save Quote
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
            {quotes.map(q => (
              <div key={q.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#111111] transition-colors">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs text-[#F5F5F5] italic font-editorial">"{q.text}"</p>
                  <p className="text-[11px] text-[#707070]">— {q.attribution || 'Unknown'} {q.context ? `(${q.context})` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingQuote(q)} className="p-2 text-[#707070] hover:text-[#F5F5F5]"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteQuote(q.id)} className="p-2 text-[#707070] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: CLOTHING / MERCH ================= */}
      {activeSection === 'merch' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-4">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span>Clothing & Merch Store Manager</span>
              </h2>
              <p className="text-xs text-[#707070] font-mono mt-0.5">
                Add streetwear products, manage pricing, stock inventory, and direct WhatsApp sales.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMerch({
                  name: '',
                  price: 45,
                  currency: '$',
                  category: 'hoodies',
                  description: '',
                  coverImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
                  images: [],
                  sizes: ['S', 'M', 'L', 'XL'],
                  inStock: true,
                  isFeatured: false,
                  isPublished: true,
                  whatsappNumber: '+201000000000',
                  orderUrl: '',
                });
                setMerchSizeInput('');
              }}
              className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Garment</span>
            </button>
          </div>

          {/* Garment Edit / Create Form */}
          {editingMerch && (
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Tag className="w-4 h-4 text-white" />
                  <span>{editingMerch.id ? 'Edit Garment Piece' : 'Create New Garment Drop'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingMerch(null)}
                  className="text-[#707070] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMerch} className="space-y-4">
                {/* 1. Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Garment / Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMerch.name || ''}
                      onChange={e => setEditingMerch({ ...editingMerch, name: e.target.value })}
                      placeholder="e.g. SUB-BASS HEAVY HOODIE, ARCHIVE CAP..."
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Category
                    </label>
                    <select
                      value={editingMerch.category || 'hoodies'}
                      onChange={e => setEditingMerch({ ...editingMerch, category: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                    >
                      <option value="hoodies">Hoodies & Sweatshirts</option>
                      <option value="tees">T-Shirts & Longsleeves</option>
                      <option value="headwear">Headwear & Caps & Beanies</option>
                      <option value="pants">Pants & Bottoms</option>
                      <option value="accessories">Accessories & Bags</option>
                    </select>
                  </div>
                </div>

                {/* 2. Price & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingMerch.price ?? 0}
                      onChange={e => setEditingMerch({ ...editingMerch, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={editingMerch.currency || '$'}
                      onChange={e => setEditingMerch({ ...editingMerch, currency: e.target.value })}
                      placeholder="$, EGP, EUR, £"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      WhatsApp Phone (Orders)
                    </label>
                    <input
                      type="text"
                      value={editingMerch.whatsappNumber || ''}
                      onChange={e => setEditingMerch({ ...editingMerch, whatsappNumber: e.target.value })}
                      placeholder="+201xxxxxxxxx"
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                    />
                  </div>
                </div>

                {/* 3. Cover Image & Upload */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                    Product Image (URL or Local Upload)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingMerch.coverImage || ''}
                      onChange={e => setEditingMerch({ ...editingMerch, coverImage: e.target.value })}
                      placeholder="https://... or upload photo"
                      className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                    />
                    <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageFileUpload(e, base64 => setEditingMerch({ ...editingMerch, coverImage: base64 }))}
                      />
                    </label>
                  </div>
                </div>

                {/* 4. Sizes Builder */}
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] font-mono">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {(editingMerch.sizes || []).map((sz, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#161616] border border-[#333] px-2.5 py-1 text-xs text-white font-mono uppercase"
                      >
                        <span>{sz}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingMerch.sizes || []).filter((_, i) => i !== idx);
                            setEditingMerch({ ...editingMerch, sizes: updated });
                          }}
                          className="text-[#777] hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      value={merchSizeInput}
                      onChange={e => setMerchSizeInput(e.target.value)}
                      placeholder="e.g. S, M, L, XL, XXL..."
                      className="flex-1 bg-[#111111] border border-[#242424] px-3 py-1.5 text-xs text-[#F5F5F5] font-mono uppercase"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (merchSizeInput.trim()) {
                            const cur = editingMerch.sizes || [];
                            if (!cur.includes(merchSizeInput.trim().toUpperCase())) {
                              setEditingMerch({ ...editingMerch, sizes: [...cur, merchSizeInput.trim().toUpperCase()] });
                            }
                            setMerchSizeInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (merchSizeInput.trim()) {
                          const cur = editingMerch.sizes || [];
                          if (!cur.includes(merchSizeInput.trim().toUpperCase())) {
                            setEditingMerch({ ...editingMerch, sizes: [...cur, merchSizeInput.trim().toUpperCase()] });
                          }
                          setMerchSizeInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#1F1F1F] border border-[#333] text-xs uppercase font-mono text-white hover:bg-[#2A2A2A]"
                    >
                      Add Size
                    </button>
                  </div>
                </div>

                {/* 5. External Order / Checkout URL (Optional) */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                    External Checkout URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingMerch.orderUrl || ''}
                    onChange={e => setEditingMerch({ ...editingMerch, orderUrl: e.target.value })}
                    placeholder="https://store.example.com/item or Leave blank for WhatsApp ordering"
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>

                {/* 6. Description & Material details */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                    Description & Fabric Specifications
                  </label>
                  <textarea
                    rows={3}
                    value={editingMerch.description || ''}
                    onChange={e => setEditingMerch({ ...editingMerch, description: e.target.value })}
                    placeholder="400 GSM heavyweight French terry cotton, garment dyed, screen-printed graphic on chest and back."
                    className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>

                {/* 7. Checkbox Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#1C1C1C]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5] font-mono">
                    <input
                      type="checkbox"
                      checked={editingMerch.inStock ?? true}
                      onChange={e => setEditingMerch({ ...editingMerch, inStock: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Available In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5] font-mono">
                    <input
                      type="checkbox"
                      checked={editingMerch.isFeatured ?? false}
                      onChange={e => setEditingMerch({ ...editingMerch, isFeatured: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Featured / Top Drop</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5] font-mono">
                    <input
                      type="checkbox"
                      checked={editingMerch.isPublished ?? true}
                      onChange={e => setEditingMerch({ ...editingMerch, isPublished: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Published in Store</span>
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                  <button
                    type="button"
                    onClick={() => setEditingMerch(null)}
                    className="px-4 py-2 border border-[#333] text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-[#E5E5E5] flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Garment'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Existing Clothing Items */}
          <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
            {merch.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#707070]">
                No clothing products in archive yet. Click "Add New Garment" above to create your first piece.
              </div>
            ) : (
              merch.map(item => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#111111] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="w-14 h-14 object-cover border border-[#242424] shrink-0 bg-[#161616]"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
                          {item.name}
                        </span>
                        {item.isFeatured && (
                          <span className="bg-white text-black text-[9px] font-black uppercase px-1.5 py-0.2">
                            DROP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#707070]">
                        <span className="text-white font-bold">{item.currency || '$'}{item.price}</span>
                        <span>·</span>
                        <span className="uppercase">{item.category}</span>
                        <span>·</span>
                        <span>Sizes: {item.sizes?.join(', ') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Fast stock toggler */}
                    <button
                      type="button"
                      onClick={() => handleToggleMerchStock(item)}
                      className={`text-[10px] font-mono uppercase px-2.5 py-1 border transition-colors cursor-pointer ${
                        item.inStock
                          ? 'border-[#23582A] text-[#4ADE80] bg-[#122B15] hover:bg-[#1a3d1e]'
                          : 'border-[#582323] text-[#F87171] bg-[#2B1212] hover:bg-[#3d1a1a]'
                      }`}
                    >
                      {item.inStock ? 'IN STOCK' : 'SOLD OUT'}
                    </button>

                    <button
                      onClick={() => setEditingMerch(item)}
                      className="p-2 text-[#707070] hover:text-[#F5F5F5]"
                      title="Edit Garment"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMerch(item.id)}
                      className="p-2 text-[#707070] hover:text-red-400"
                      title="Delete Garment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION: SITE SETTINGS ================= */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
            Global Site Settings & Copy
          </h2>

          <form onSubmit={handleSaveSettings} className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070] border-b border-[#1F1F1F] pb-2">
                Homepage Hero Section
              </h3>
              
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Headline</label>
                <input
                  type="text"
                  value={editableSettings.heroHeadline || ''}
                  onChange={e => setEditableSettings({ ...editableSettings, heroHeadline: e.target.value })}
                  className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Subhead Description</label>
                <textarea
                  rows={2}
                  value={editableSettings.heroSubhead || ''}
                  onChange={e => setEditableSettings({ ...editableSettings, heroSubhead: e.target.value })}
                  className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Hero Backdrop Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editableSettings.heroImage || ''}
                    onChange={e => setEditableSettings({ ...editableSettings, heroImage: e.target.value })}
                    className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                  <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e, base64 => setEditableSettings({ ...editableSettings, heroImage: base64 }))}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#1C1C1C]">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070] border-b border-[#1F1F1F] pb-2">
                About Page Bio & Philosophy
              </h3>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">Full About Bio</label>
                <textarea
                  rows={6}
                  value={editableSettings.aboutBio || ''}
                  onChange={e => setEditableSettings({ ...editableSettings, aboutBio: e.target.value })}
                  className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-light"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1">About Portrait Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editableSettings.aboutPhoto || ''}
                    onChange={e => setEditableSettings({ ...editableSettings, aboutPhoto: e.target.value })}
                    className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                  <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileUpload(e, base64 => setEditableSettings({ ...editableSettings, aboutPhoto: base64 }))}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[#242424]">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

        </div>
      </div>
    </div>
  );
};

