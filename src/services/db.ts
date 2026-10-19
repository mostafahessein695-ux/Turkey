import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Song, 
  Artist, 
  Album, 
  Collection, 
  GalleryItem, 
  Quote, 
  SiteSettings 
} from '../types';
import { ASSET_IMAGES } from '../assets/images';

// COLLECTION REFS
const SONGS_COLL = 'songs';
const ARTISTS_COLL = 'artists';
const ALBUMS_COLL = 'albums';
const COLLECTIONS_COLL = 'collections';
const GALLERY_COLL = 'gallery';
const QUOTES_COLL = 'quotes';
const SETTINGS_COLL = 'settings';

// ==========================================
// CURATED STARTER DATA (DEFAULT / FALLBACK)
// ==========================================
export const DEFAULT_SETTINGS: SiteSettings = {
  heroHeadline: 'MY WORLD. MY RULES.',
  heroSubhead: 'A collection of sounds, people, moments, and things that mean something to me.',
  heroImage: ASSET_IMAGES.heroVinyl,
  aboutBio: 'MY WORLD is a personal sensory sanctuary and digital archive. It was conceived as an antidote to algorithmic feeds and passive consumption—a curated space where underground electronic records, late-night club artifacts, brutalist visual geometry, and personal philosophies converge. Here, sound is treated not as disposable background noise, but as emotional architecture.',
  aboutPhoto: ASSET_IMAGES.artistPortrait,
  socialLinks: [
    { platform: 'Spotify', url: 'https://open.spotify.com', handle: '@myworld' },
    { platform: 'SoundCloud', url: 'https://soundcloud.com', handle: 'myworld-archives' },
    { platform: 'Bandcamp', url: 'https://bandcamp.com', handle: 'myworld' },
    { platform: 'Instagram', url: 'https://instagram.com', handle: '@myworld.journal' },
  ],
  featuredCollectionId: 'col_late_night',
};

export const DEFAULT_SONGS: Song[] = [
  {
    id: 'song_archangel',
    title: 'Archangel',
    artist: 'Burial',
    album: 'Untrue',
    coverUrl: ASSET_IMAGES.albumCover,
    releaseYear: '2007',
    genre: 'Future Garage / Ambient',
    moodTags: ['Rainy Night', 'Nostalgia', 'London', 'Hauntology'],
    personalRating: 10,
    personalNotes: 'The defining hauntology track of the 21st century. Ray J vocal pitch-shifted into pure grief and rainy South London pavements. Stays on repeat whenever midnight hits.',
    externalUrl: 'https://hyperdub.net/products/burial-untrue',
    embedUrl: '',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'song_so_u_kno',
    title: 'So U Kno',
    artist: 'Overmono',
    album: 'So U Kno EP',
    coverUrl: ASSET_IMAGES.artistPortrait,
    releaseYear: '2021',
    genre: 'UK Garage / Breakbeat',
    moodTags: ['Club Euphoria', 'Heavy Bass', 'High Energy', 'Late Night'],
    personalRating: 10,
    personalNotes: 'Unstoppable groove. The vocal chop and that syncopated sub-bass defined every underground party in recent memory.',
    externalUrl: 'https://overmono.bandcamp.com',
    embedUrl: '',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'song_100',
    title: '100',
    artist: 'Dean Blunt',
    album: 'Black Metal',
    coverUrl: ASSET_IMAGES.albumCover,
    releaseYear: '2014',
    genre: 'Lo-Fi / Post-Punk',
    moodTags: ['Melancholy', 'Hypnagogic', 'Intimate', 'Minimalist'],
    personalRating: 9.5,
    personalNotes: 'Sampled The Pastels, laid down a hypnotic guitar loop, and mumbled truth into the void. Masterclass in restrained minimalism.',
    externalUrl: 'https://roughtrade.com',
    embedUrl: '',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'song_kerosene',
    title: 'Kerosene!',
    artist: 'Yves Tumor',
    album: 'Heaven to a Tortured Mind',
    coverUrl: ASSET_IMAGES.artistPortrait,
    releaseYear: '2020',
    genre: 'Experimental Rock / Glam',
    moodTags: ['Cathartic', 'Passionate', 'Electric', 'Heavy'],
    personalRating: 9,
    personalNotes: 'Duet with Diana Gordon that ascends straight into stratospheric guitar distortion. Glam rock reborn for the modern era.',
    externalUrl: 'https://yves-tumor.bandcamp.com',
    embedUrl: '',
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'song_alberto_balsalm',
    title: 'Alberto Balsalm',
    artist: 'Aphex Twin',
    album: '...I Care Because You Do',
    coverUrl: ASSET_IMAGES.albumCover,
    releaseYear: '1995',
    genre: 'IDM / Ambient',
    moodTags: ['Reflective', 'Warm', 'Acoustic Percussion', 'Timeless'],
    personalRating: 10,
    personalNotes: 'A metal ammo box and a chair scrape used as percussion, paired with one of the most sublime synthesizer melodies ever recorded.',
    externalUrl: 'https://aphextwin.warp.net',
    embedUrl: '',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'song_gladly',
    title: 'Gladly',
    artist: 'Tirzah',
    album: 'Devotion',
    coverUrl: ASSET_IMAGES.artistPortrait,
    releaseYear: '2018',
    genre: 'Minimalist Post-R&B',
    moodTags: ['Vulnerable', 'Warm', 'Slow Burn', 'Raw'],
    personalRating: 9,
    personalNotes: 'Mica Levi production with Tirzah’s honest, unvarnished voice. Proof that emotional weight needs zero studio sheen.',
    externalUrl: 'https://domino.bandcamp.com',
    embedUrl: '',
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_ARTISTS: Artist[] = [
  {
    id: 'artist_burial',
    name: 'Burial',
    profileImage: ASSET_IMAGES.albumCover,
    bio: 'William Emmanuel Bevan, known by his moniker Burial, is an electronic musician from South London. Working anonymously until 2008, his music evokes the spectral aftermath of London rave culture and empty nighttime streets.',
    genres: ['Future Garage', 'Ambient', 'Dubstep', 'Hauntology'],
    country: 'United Kingdom',
    favoriteAlbums: ['Untrue', 'Kindred EP', 'Rival Dealer'],
    personalThoughts: 'Burial taught me that music is as much about silence, room reverb, and vinyl static as it is about melody. His sound is the emotional blueprint of my late nights.',
    externalUrl: 'https://hyperdub.net',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'artist_dean_blunt',
    name: 'Dean Blunt',
    profileImage: ASSET_IMAGES.artistPortrait,
    bio: 'Roy Chukwuemeka Nnawuchi, better known as Dean Blunt, is a British singer, songwriter, musician, and conceptual artist. Co-founder of avant-garde duo Hype Williams and Babyfather.',
    genres: ['Post-Punk', 'Hypnagogic Pop', 'Dub', 'Avant-Garde'],
    country: 'United Kingdom',
    favoriteAlbums: ['Black Metal', 'The Redeemer', 'Roaches 2012-2019'],
    personalThoughts: 'The ultimate anti-establishment artist. He avoids press, subverts music industry rituals, and creates intensely visceral sonic collages.',
    externalUrl: 'https://world-music.bandcamp.com',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'artist_overmono',
    name: 'Overmono',
    profileImage: ASSET_IMAGES.artistPortrait,
    bio: 'Welsh electronic music duo formed by brothers Tom and Ed Russell (formerly known individually as Truss and Tessela). Masters of hypnotic breakbeats and emotional bass music.',
    genres: ['UK Garage', 'Breakbeat', 'Techno', 'Electronic'],
    country: 'United Kingdom',
    favoriteAlbums: ['Good Lies', 'Whities 019', 'Cash Kid'],
    personalThoughts: 'The soundtrack to every transcendent club night of the past five years. Their synthesis of rough rave breaks and tender vocal treatments is unparalleled.',
    externalUrl: 'https://overmono.com',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'artist_aphex_twin',
    name: 'Aphex Twin',
    profileImage: ASSET_IMAGES.albumCover,
    bio: 'Richard David James, recognized as Aphex Twin, is an Irish-born British musician, composer and DJ best known for his idiosyncratic work in electronic styles like techno and ambient.',
    genres: ['IDM', 'Ambient Techno', 'Acid', 'Experimental'],
    country: 'United Kingdom',
    favoriteAlbums: ['Selected Ambient Works 85-92', 'Drukqs', 'Richard D. James Album'],
    personalThoughts: 'The architect of modern electronic possibility. Still lightyears ahead of everyone else decades later.',
    externalUrl: 'https://aphextwin.warp.net',
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_ALBUMS: Album[] = [
  {
    id: 'album_untrue',
    title: 'Untrue',
    artist: 'Burial',
    coverImage: ASSET_IMAGES.albumCover,
    releaseYear: '2007',
    genre: 'Future Garage / Dubstep',
    tracklist: [
      { id: 't1', trackNumber: 1, title: 'Untitled', duration: '6:06' },
      { id: 't2', trackNumber: 2, title: 'Archangel', duration: '3:58' },
      { id: 't3', trackNumber: 3, title: 'Near Dark', duration: '3:54' },
      { id: 't4', trackNumber: 4, title: 'Ghost Hardware', duration: '4:53' },
      { id: 't5', trackNumber: 5, title: 'Endorphin', duration: '2:57' },
      { id: 't6', trackNumber: 6, title: 'Etched Headplate', duration: '5:59' },
      { id: 't7', trackNumber: 7, title: 'In McDonalds', duration: '2:07' },
      { id: 't8', trackNumber: 8, title: 'Untrue', duration: '6:16' },
      { id: 't9', trackNumber: 9, title: 'Shell of Light', duration: '4:40' },
      { id: 't10', trackNumber: 10, title: 'Dog Shelter', duration: '2:59' },
      { id: 't11', trackNumber: 11, title: 'Homeless', duration: '5:20' },
      { id: 't12', trackNumber: 12, title: 'UK', duration: '1:40' },
      { id: 't13', trackNumber: 13, title: 'Raver', duration: '4:59' },
    ],
    review: 'Untrue is widely regarded as one of the quintessential records of the 2000s. Recorded without a sequencer grid, using raw sound files placed by ear in Sound Forge, its off-kilter swing and vinyl crackle capture the melancholy ecstasy of wandering empty city streets after the warehouse lights have gone up.',
    rating: 10,
    externalUrl: 'https://hyperdub.net/products/burial-untrue',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'album_good_lies',
    title: 'Good Lies',
    artist: 'Overmono',
    coverImage: ASSET_IMAGES.albumCover,
    releaseYear: '2023',
    genre: 'UK Garage / Breakbeat',
    tracklist: [
      { id: 'gl1', trackNumber: 1, title: 'Feelings Plain', duration: '2:49' },
      { id: 'gl2', trackNumber: 2, title: 'Arla Fearn', duration: '4:29' },
      { id: 'gl3', trackNumber: 3, title: 'Good Lies', duration: '3:04' },
      { id: 'gl4', trackNumber: 4, title: 'Walk Thru Water (feat. St. Panther)', duration: '3:05' },
      { id: 'gl5', trackNumber: 5, title: 'Cold Blooded', duration: '3:59' },
      { id: 'gl6', trackNumber: 6, title: 'Skulled', duration: '4:26' },
      { id: 'gl7', trackNumber: 7, title: 'Sugarush', duration: '3:11' },
      { id: 'gl8', trackNumber: 8, title: 'Calon', duration: '4:16' },
      { id: 'gl9', trackNumber: 9, title: 'Is U', duration: '3:48' },
      { id: 'gl10', trackNumber: 10, title: 'Vermonly', duration: '2:54' },
      { id: 'gl11', trackNumber: 11, title: 'So U Kno', duration: '5:43' },
      { id: 'gl12', trackNumber: 12, title: 'Calling Out', duration: '4:46' },
    ],
    review: 'Good Lies coalesces all the tension, kinetic ecstasy, and raw sound system power Overmono refined over years of underground EPs. A monumental modern British electronic album.',
    rating: 9.5,
    externalUrl: 'https://overmono.bandcamp.com/album/good-lies',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'album_black_metal',
    title: 'Black Metal',
    artist: 'Dean Blunt',
    coverImage: ASSET_IMAGES.albumCover,
    releaseYear: '2014',
    genre: 'Post-Punk / Lo-Fi',
    tracklist: [
      { id: 'bm1', trackNumber: 1, title: 'Lush', duration: '2:12' },
      { id: 'bm2', trackNumber: 2, title: '50 Cent', duration: '2:24' },
      { id: 'bm3', trackNumber: 3, title: 'Blow', duration: '1:45' },
      { id: 'bm4', trackNumber: 4, title: '100', duration: '3:39' },
      { id: 'bm5', trackNumber: 5, title: 'Heavy', duration: '2:42' },
      { id: 'bm6', trackNumber: 6, title: 'Molly & Aquafina', duration: '4:44' },
      { id: 'bm7', trackNumber: 7, title: 'Forever', duration: '13:00' },
      { id: 'bm8', trackNumber: 8, title: 'X', duration: '8:55' },
    ],
    review: 'A stark, confrontational, yet deeply romantic artifact. Part indie balladry, part extended noise excursion, Black Metal operates on its own mysterious frequency.',
    rating: 9,
    externalUrl: 'https://roughtrade.com',
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'col_late_night',
    title: 'Late Night',
    slug: 'late-night',
    description: 'The city asleep outside the window. Cold air, low frequencies, quiet solitude. Curated for 3:00 AM listening sessions when everything else stops.',
    coverImage: ASSET_IMAGES.heroVinyl,
    itemIds: ['song_archangel', 'song_100', 'song_alberto_balsalm', 'album_untrue'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'col_underground',
    title: 'Underground',
    slug: 'underground',
    description: 'Raw basslines, vinyl crackle, tape hiss, and sub-frequencies from basement studios and pirate airwaves.',
    coverImage: ASSET_IMAGES.artistPortrait,
    itemIds: ['song_so_u_kno', 'song_archangel', 'album_good_lies', 'album_black_metal'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'col_favorite_songs',
    title: 'Favorite Songs',
    slug: 'favorite-songs',
    description: 'The tracks that defined key years of my life. Essential listening that never fades.',
    coverImage: ASSET_IMAGES.albumCover,
    itemIds: ['song_archangel', 'song_so_u_kno', 'song_alberto_balsalm', 'song_kerosene'],
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'col_memories',
    title: 'Memories',
    slug: 'memories',
    description: 'Soundscapes tethered to specific coordinates, train journeys, conversations, and long-gone apartments.',
    coverImage: ASSET_IMAGES.moodboardNight,
    itemIds: ['song_100', 'song_gladly', 'album_untrue'],
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    title: 'Concrete Monolith at Dusk',
    imageUrl: ASSET_IMAGES.moodboardNight,
    caption: 'Brutalist architecture in grey London rain. Heavy geometric forms casting deep monolithic shadows.',
    category: 'Architecture',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'gal_2',
    title: 'The Analog Ritual',
    imageUrl: ASSET_IMAGES.heroVinyl,
    caption: 'Late night vinyl session. Direct drive turntable, vacuum tube amplifier glow, and 180g heavyweight wax.',
    category: 'Sound Systems',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'gal_3',
    title: 'Producer at the Console',
    imageUrl: ASSET_IMAGES.artistPortrait,
    caption: 'Shadow and intent. Chiaroscuro studio session sculpting syncopated rhythms on hardware samplers.',
    category: 'Studio Moments',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'gal_4',
    title: 'Void & Structure',
    imageUrl: ASSET_IMAGES.albumCover,
    caption: 'Minimal monochrome record sleeve study. Stark contrast between physical stone and pure black void.',
    category: 'Album Art',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_QUOTES: Quote[] = [
  {
    id: 'quote_1',
    text: 'I just want to make tunes that sound like a distant memory you cannot quite hold onto. Like something you heard in a car going past at night.',
    attribution: 'Burial',
    context: 'The Wire Interview, 2007',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'quote_2',
    text: 'The club is not an escape from reality; it is where reality becomes honest, loud, and uncompromised.',
    attribution: 'Anonymous',
    context: 'Club Culture Journal',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'quote_3',
    text: 'Perfection is corporate. The soul lives inside the distortion, the tape hiss, and the awkward pauses between bars.',
    attribution: 'Dean Blunt',
    context: 'Liner Notes',
    isFeatured: true,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'quote_4',
    text: 'Sound is invisible architecture. You inhabit a track just like you inhabit a darkened room.',
    attribution: 'Personal Journal Entry',
    context: 'Reflections on Listening',
    isFeatured: false,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ==========================================
// SONGS API
// ==========================================
export async function fetchPublishedSongs(): Promise<Song[]> {
  try {
    const q = query(collection(db, SONGS_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Song));
    }
    return DEFAULT_SONGS;
  } catch (err) {
    console.warn('Using curated starter songs:', err);
    return DEFAULT_SONGS;
  }
}

export async function fetchAllSongs(): Promise<Song[]> {
  try {
    const snap = await getDocs(collection(db, SONGS_COLL));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Song));
    }
    return DEFAULT_SONGS;
  } catch (err) {
    console.warn('Using curated starter songs:', err);
    return DEFAULT_SONGS;
  }
}

export async function saveSong(song: Partial<Song> & { id?: string }): Promise<string> {
  const songId = song.id || `song_${Date.now()}`;
  const now = new Date().toISOString();
  const payload: Song = {
    id: songId,
    title: song.title || 'Untitled Track',
    artist: song.artist || 'Unknown Artist',
    album: song.album || '',
    coverUrl: song.coverUrl || ASSET_IMAGES.albumCover,
    releaseYear: song.releaseYear || new Date().getFullYear().toString(),
    genre: song.genre || 'Electronic',
    moodTags: song.moodTags || [],
    personalRating: song.personalRating ?? 9,
    personalNotes: song.personalNotes || '',
    externalUrl: song.externalUrl || '',
    embedUrl: song.embedUrl || '',
    isFeatured: song.isFeatured ?? false,
    isPublished: song.isPublished ?? true,
    createdAt: song.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, SONGS_COLL, songId), payload);
    return songId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SONGS_COLL}/${songId}`);
    throw err;
  }
}

export async function deleteSong(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SONGS_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${SONGS_COLL}/${id}`);
    throw err;
  }
}

// ==========================================
// ARTISTS API
// ==========================================
export async function fetchPublishedArtists(): Promise<Artist[]> {
  try {
    const q = query(collection(db, ARTISTS_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Artist));
    }
    return DEFAULT_ARTISTS;
  } catch (err) {
    console.warn('Using curated starter artists:', err);
    return DEFAULT_ARTISTS;
  }
}

export async function fetchAllArtists(): Promise<Artist[]> {
  try {
    const snap = await getDocs(collection(db, ARTISTS_COLL));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Artist));
    }
    return DEFAULT_ARTISTS;
  } catch (err) {
    console.warn('Using curated starter artists:', err);
    return DEFAULT_ARTISTS;
  }
}

export async function saveArtist(artist: Partial<Artist> & { id?: string }): Promise<string> {
  const artistId = artist.id || `artist_${Date.now()}`;
  const now = new Date().toISOString();
  const payload: Artist = {
    id: artistId,
    name: artist.name || 'Unnamed Artist',
    profileImage: artist.profileImage || ASSET_IMAGES.artistPortrait,
    bio: artist.bio || '',
    genres: artist.genres || [],
    country: artist.country || '',
    favoriteAlbums: artist.favoriteAlbums || [],
    personalThoughts: artist.personalThoughts || '',
    externalUrl: artist.externalUrl || '',
    isFeatured: artist.isFeatured ?? false,
    isPublished: artist.isPublished ?? true,
    createdAt: artist.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, ARTISTS_COLL, artistId), payload);
    return artistId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ARTISTS_COLL}/${artistId}`);
    throw err;
  }
}

export async function deleteArtist(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ARTISTS_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ARTISTS_COLL}/${id}`);
    throw err;
  }
}

// ==========================================
// ALBUMS API
// ==========================================
export async function fetchPublishedAlbums(): Promise<Album[]> {
  try {
    const q = query(collection(db, ALBUMS_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Album));
    }
    return DEFAULT_ALBUMS;
  } catch (err) {
    console.warn('Using curated starter albums:', err);
    return DEFAULT_ALBUMS;
  }
}

export async function fetchAllAlbums(): Promise<Album[]> {
  try {
    const snap = await getDocs(collection(db, ALBUMS_COLL));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Album));
    }
    return DEFAULT_ALBUMS;
  } catch (err) {
    console.warn('Using curated starter albums:', err);
    return DEFAULT_ALBUMS;
  }
}

export async function saveAlbum(album: Partial<Album> & { id?: string }): Promise<string> {
  const albumId = album.id || `album_${Date.now()}`;
  const now = new Date().toISOString();
  const payload: Album = {
    id: albumId,
    title: album.title || 'Untitled Album',
    artist: album.artist || 'Unknown Artist',
    coverImage: album.coverImage || ASSET_IMAGES.albumCover,
    releaseYear: album.releaseYear || new Date().getFullYear().toString(),
    genre: album.genre || 'Electronic',
    tracklist: album.tracklist || [],
    review: album.review || '',
    rating: album.rating ?? 9,
    externalUrl: album.externalUrl || '',
    isFeatured: album.isFeatured ?? false,
    isPublished: album.isPublished ?? true,
    createdAt: album.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, ALBUMS_COLL, albumId), payload);
    return albumId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ALBUMS_COLL}/${albumId}`);
    throw err;
  }
}

export async function deleteAlbum(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ALBUMS_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ALBUMS_COLL}/${id}`);
    throw err;
  }
}

// ==========================================
// COLLECTIONS API
// ==========================================
export async function fetchPublishedCollections(): Promise<Collection[]> {
  try {
    const q = query(collection(db, COLLECTIONS_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Collection));
    }
    return DEFAULT_COLLECTIONS;
  } catch (err) {
    console.warn('Using curated starter collections:', err);
    return DEFAULT_COLLECTIONS;
  }
}

export async function fetchAllCollections(): Promise<Collection[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS_COLL));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Collection));
    }
    return DEFAULT_COLLECTIONS;
  } catch (err) {
    console.warn('Using curated starter collections:', err);
    return DEFAULT_COLLECTIONS;
  }
}

export async function saveCollection(col: Partial<Collection> & { id?: string }): Promise<string> {
  const colId = col.id || `col_${Date.now()}`;
  const now = new Date().toISOString();
  const slug = col.slug || col.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `col-${Date.now()}`;
  const payload: Collection = {
    id: colId,
    title: col.title || 'Untitled Collection',
    slug,
    description: col.description || '',
    coverImage: col.coverImage || ASSET_IMAGES.albumCover,
    itemIds: col.itemIds || [],
    isFeatured: col.isFeatured ?? false,
    isPublished: col.isPublished ?? true,
    createdAt: col.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, COLLECTIONS_COLL, colId), payload);
    return colId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS_COLL}/${colId}`);
    throw err;
  }
}

export async function deleteCollection(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS_COLL}/${id}`);
    throw err;
  }
}

// ==========================================
// GALLERY API
// ==========================================
export async function fetchPublishedGallery(): Promise<GalleryItem[]> {
  try {
    const q = query(collection(db, GALLERY_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
    }
    return DEFAULT_GALLERY;
  } catch (err) {
    console.warn('Using curated starter gallery:', err);
    return DEFAULT_GALLERY;
  }
}

export async function fetchAllGallery(): Promise<GalleryItem[]> {
  try {
    const snap = await getDocs(collection(db, GALLERY_COLL));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
    }
    return DEFAULT_GALLERY;
  } catch (err) {
    console.warn('Using curated starter gallery:', err);
    return DEFAULT_GALLERY;
  }
}

export async function saveGalleryItem(item: Partial<GalleryItem> & { id?: string }): Promise<string> {
  const itemId = item.id || `gal_${Date.now()}`;
  const payload: GalleryItem = {
    id: itemId,
    title: item.title || 'Untitled Frame',
    imageUrl: item.imageUrl || ASSET_IMAGES.moodboardNight,
    caption: item.caption || '',
    category: item.category || 'Architecture & Mood',
    isFeatured: item.isFeatured ?? false,
    isPublished: item.isPublished ?? true,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, GALLERY_COLL, itemId), payload);
    return itemId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${GALLERY_COLL}/${itemId}`);
    throw err;
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GALLERY_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${GALLERY_COLL}/${id}`);
    throw err;
  }
}

// ==========================================
// QUOTES API
// ==========================================
export async function fetchPublishedQuotes(): Promise<Quote[]> {
  try {
    const q = query(collection(db, QUOTES_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Quote));
    }
    return DEFAULT_QUOTES;
  } catch (err) {
    console.warn('Using curated starter quotes:', err);
    return DEFAULT_QUOTES;
  }
}

export async function fetchAllQuotes(): Promise<Quote[]> {
  try {
    const snap = await getDocs(collection(db, QUOTES_COLL));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Quote));
    }
    return DEFAULT_QUOTES;
  } catch (err) {
    console.warn('Using curated starter quotes:', err);
    return DEFAULT_QUOTES;
  }
}

export async function saveQuote(quote: Partial<Quote> & { id?: string }): Promise<string> {
  const quoteId = quote.id || `quote_${Date.now()}`;
  const payload: Quote = {
    id: quoteId,
    text: quote.text || '',
    attribution: quote.attribution || '',
    context: quote.context || '',
    isFeatured: quote.isFeatured ?? false,
    isPublished: quote.isPublished ?? true,
    createdAt: quote.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, QUOTES_COLL, quoteId), payload);
    return quoteId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${QUOTES_COLL}/${quoteId}`);
    throw err;
  }
}

export async function deleteQuote(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, QUOTES_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${QUOTES_COLL}/${id}`);
    throw err;
  }
}

// ==========================================
// SITE SETTINGS API
// ==========================================
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COLL, 'global'));
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.warn('Using default site settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'global'), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLL}/global`);
    throw err;
  }
}

// REALTIME HOOK HELPER
export function subscribeToPublishedCollection<T>(
  collName: string,
  onData: (data: T[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(collection(db, collName), where('isPublished', '==', true));
  return onSnapshot(
    q,
    snapshot => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T));
      onData(items);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collName);
    }
  );
}

// SEED STARTER CONTENT
export async function seedStarterContent(): Promise<void> {
  for (const s of DEFAULT_SONGS) {
    await saveSong(s);
  }
  for (const a of DEFAULT_ARTISTS) {
    await saveArtist(a);
  }
  for (const al of DEFAULT_ALBUMS) {
    await saveAlbum(al);
  }
  for (const c of DEFAULT_COLLECTIONS) {
    await saveCollection(c);
  }
  for (const g of DEFAULT_GALLERY) {
    await saveGalleryItem(g);
  }
  for (const q of DEFAULT_QUOTES) {
    await saveQuote(q);
  }
  await saveSiteSettings(DEFAULT_SETTINGS);
}
