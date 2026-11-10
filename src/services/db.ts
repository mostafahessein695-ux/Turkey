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
  SiteSettings,
  MerchItem,
  CustomerOrder
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
const MERCH_COLL = 'merch';
const ORDERS_COLL = 'orders';

// ==========================================
// CURATED STARTER DATA (DEFAULT / FALLBACK)
// ==========================================
export const DEFAULT_SETTINGS: SiteSettings = {
  heroHeadline: 'TURVEX. HEAVYWEIGHT STREETWEAR.',
  heroSubhead: 'Bespoke cuts, heavyweight knits, and limited capsule drops designed for everyday movement.',
  heroImage: ASSET_IMAGES.heroVinyl,
  aboutBio: 'TURVEX is an independent streetwear archive and garment studio. We curate heavyweight cotton silhouettes, washed tones, and durable minimalist pieces.',
  aboutPhoto: ASSET_IMAGES.artistPortrait,
  socialLinks: [
    { platform: 'Spotify', url: 'https://open.spotify.com', handle: '@turvex' },
    { platform: 'SoundCloud', url: 'https://soundcloud.com', handle: 'turvex-archives' },
    { platform: 'Bandcamp', url: 'https://bandcamp.com', handle: 'turvex' },
    { platform: 'Instagram', url: 'https://instagram.com', handle: '@turvex.studio' },
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
    instagramUrl: 'https://instagram.com/burial',
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
    instagramUrl: 'https://instagram.com/worldmusic419',
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
    instagramUrl: 'https://instagram.com/overmono',
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
    instagramUrl: '',
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

export const DEFAULT_MERCH: MerchItem[] = [
  {
    id: 'merch_boxy_heavyweight_hoodie',
    name: 'TURVEX — 480GSM Boxy Heavyweight Hoodie',
    price: 1250,
    currency: 'EGP',
    description: 'Bespoke 480 GSM French Terry knit crafted from 100% combed organic cotton. Features dropped shoulders, an oversized boxy drape, double-layered hood without drawstrings, and seamless deep side pockets. Hand-distressed edge accents and pre-shrunk vintage enzyme treatment.',
    category: 'hoodies',
    coverImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Washed Black', 'Vintage Bone', 'Raw Clay'],
    colorImages: {
      'Washed Black': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
      'Vintage Bone': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=85',
      'Raw Clay': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85'
    },
    inStock: true,
    stockCount: 42,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isPublished: true,
    details: [
      '480 GSM ultra-heavyweight combed cotton',
      'Drop-shoulder boxy streetwear cut',
      'Double-lined hood with zero drawstrings',
      'Enzyme-washed & pre-shrunk for life'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_underground_vintage_tee',
    name: 'TURVEX — 280GSM Acid Wash Heavyweight Tee',
    price: 650,
    currency: 'EGP',
    description: 'Dense 280 GSM combed jersey cotton treated with manual stone-acid washing for unique grey patina. Thick 1.2-inch ribbed collar that never sags, blind hem finishing, and minimalist micro-embossed TURVEX lettering at nape.',
    category: 'tees',
    coverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Mineral Charcoal', 'Faded Moss', 'Chalk White'],
    colorImages: {
      'Mineral Charcoal': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
      'Faded Moss': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85',
      'Chalk White': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1200&q=85'
    },
    inStock: true,
    stockCount: 78,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isPublished: true,
    details: [
      '280 GSM heavy combed jersey cotton',
      'Hand-crafted stone acid wash wash',
      'Reinforced tight ribbed collar',
      'Relaxed wide streetwear torso'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_tactical_sweatpants',
    name: 'TURVEX — Wide-Leg Minimalist Sweatpants',
    price: 1150,
    currency: 'EGP',
    description: '450 GSM brushed-back fleece designed with a wide, straight-leg pooling profile. Concealed bungee cord hem cinch system allows switching between stacked silhouette and wide trouser drop. Matte gunmetal hardware.',
    category: 'pants',
    coverImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Deep Obsidian', 'Dust Taupe', 'Heather Slate'],
    inStock: true,
    stockCount: 35,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isPublished: true,
    details: [
      '450 GSM brushed interior fleece',
      'Adjustable internal bungee ankle cords',
      'Deep zippered security pockets',
      'Relaxed straight silhouette'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_metal_hardware_zip',
    name: 'TURVEX — Two-Way Heavy Zipper Hoodie',
    price: 1450,
    currency: 'EGP',
    description: '500 GSM loopback cotton with custom two-way brushed silver YKK zipper. Raglan sleeve cut provides unrestricted arm mobility while preserving the sharp architectural drop. Tonal embroidery on the cuff.',
    category: 'hoodies',
    coverImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Jet Black', 'Washed Concrete'],
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isPublished: true,
    details: [
      '500 GSM loopback heavyweight cotton',
      'Dual-way brushed silver YKK hardware',
      'Structured double-layered hood',
      'Raglan ergonomic sleeve construct'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_raw_ink_longsleeve',
    name: 'TURVEX — Raw Ink Heavyweight Longsleeve',
    price: 750,
    currency: 'EGP',
    description: '320 GSM dense knit black longsleeve. Sleeve print with catalog track coordinates and monochrome high-density ink print on the front. Pre-shrunk and garment dyed.',
    category: 'tees',
    coverImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Onyx Black', 'Dark Sand'],
    inStock: true,
    stockCount: 50,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isPublished: true,
    details: [
      '320 GSM dense cotton jersey',
      'High-density pigment ink',
      'Ribbed stretch cuffs',
      'Pre-shrunk finish'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_archive_trucker_cap',
    name: 'TURVEX — 3D Sculpted Foam Trucker Cap',
    price: 450,
    currency: 'EGP',
    description: 'Structured curved-brim trucker silhouette featuring high-density 3D tonal embroidery on high-grade foam front. Breathable poly mesh rear with custom silver metal snap clasp.',
    category: 'headwear',
    coverImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['One Size (Adjustable)'],
    colors: ['All Black', 'Black / Bone', 'Olive Drab'],
    inStock: true,
    stockCount: 65,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isPublished: true,
    details: [
      'Raised 3D satin embroidery',
      'Ultra-dense front foam backing',
      'Branded interior taping',
      'Metallic custom snap closure'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_brutalist_beanie',
    name: 'TURVEX — Chunky Ribbed Lambswool Beanie',
    price: 350,
    currency: 'EGP',
    description: 'Double-layered chunky rib knit crafted from an ultra-soft merino lambswool and organic cotton blend. Finished with a minimal laser-engraved metal bar.',
    category: 'headwear',
    coverImage: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['One Size Fits All'],
    colors: ['Jet Black', 'Charcoal Grey', 'Coffee Brown'],
    inStock: true,
    stockCount: 40,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isPublished: true,
    details: [
      'Double-layer heavy rib weave',
      'Merino wool & combed cotton blend',
      'Laser-engraved matte metal bar',
      'Snug comfortable thermal fit'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'merch_modular_crossbody',
    name: 'TURVEX — Waterproof Cordura Utility Crossbody',
    price: 850,
    currency: 'EGP',
    description: '1000D ballistic waterproof Cordura nylon with taped AquaGuard zippers, fidlock magnetic quick-release strap, and internal velvet-lined compartments for essentials.',
    category: 'accessories',
    coverImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85'
    ],
    sizes: ['One Size (Adjustable Strap)'],
    colors: ['Matte Black', 'Stealth Grey'],
    inStock: true,
    stockCount: 30,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isPublished: true,
    details: [
      '1000D Ballistic Cordura nylon',
      'AquaGuard weatherproof zip closure',
      'German Fidlock magnetic buckle',
      'Velvet padded phone compartment'
    ],
    orderUrl: '',
    whatsappNumber: '+201000000000',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
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

// ==========================================
// ALBUM AUTO-SYNC HELPER
// Automatically creates an album when a song has an album name,
// or appends the song to the album's tracklist if it already exists.
// ==========================================
export async function autoSyncAlbumForSong(song: Song): Promise<{ action: 'created' | 'updated' | 'unchanged'; albumId: string; albumTitle: string } | null> {
  const albumTitle = song.album?.trim();
  if (!albumTitle) return null;

  try {
    const allAlbums = await fetchAllAlbums();
    const normalizedTitle = albumTitle.toLowerCase();

    // 1. Check if album already exists (by title and artist, or by title)
    let existingAlbum = allAlbums.find(
      a => a.title.trim().toLowerCase() === normalizedTitle &&
           a.artist.trim().toLowerCase() === (song.artist || '').trim().toLowerCase()
    );

    if (!existingAlbum) {
      existingAlbum = allAlbums.find(
        a => a.title.trim().toLowerCase() === normalizedTitle
      );
    }

    const now = new Date().toISOString();

    if (!existingAlbum) {
      // Case A: Album does NOT exist -> Automatically create it with this song as Track 1
      const newAlbumId = `album_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newAlbum: Album = {
        id: newAlbumId,
        title: albumTitle,
        artist: song.artist || 'Unknown Artist',
        coverImage: song.coverUrl && song.coverUrl !== ASSET_IMAGES.albumCover 
          ? song.coverUrl 
          : ASSET_IMAGES.albumCover,
        releaseYear: song.releaseYear || new Date().getFullYear().toString(),
        genre: song.genre || 'Electronic',
        tracklist: [
          {
            id: song.id,
            trackNumber: 1,
            title: song.title,
            duration: '',
          }
        ],
        review: `Curated album archive for ${albumTitle} by ${song.artist}.`,
        rating: song.personalRating ?? 9,
        externalUrl: song.externalUrl || '',
        isFeatured: false,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, ALBUMS_COLL, newAlbumId), newAlbum);
      return { action: 'created', albumId: newAlbumId, albumTitle };
    } else {
      // Case B: Album already exists -> Check if this song is in the tracklist
      const currentTracklist = Array.isArray(existingAlbum.tracklist) ? [...existingAlbum.tracklist] : [];
      
      const trackIndex = currentTracklist.findIndex(
        t => t.id === song.id || t.title.trim().toLowerCase() === song.title.trim().toLowerCase()
      );

      let wasChanged = false;

      if (trackIndex === -1) {
        // Not in tracklist yet -> append it
        currentTracklist.push({
          id: song.id,
          trackNumber: currentTracklist.length + 1,
          title: song.title,
          duration: '',
        });
        wasChanged = true;
      } else {
        // Already in tracklist -> ensure id and title match current song
        if (currentTracklist[trackIndex].title !== song.title || currentTracklist[trackIndex].id !== song.id) {
          currentTracklist[trackIndex] = {
            ...currentTracklist[trackIndex],
            id: song.id,
            title: song.title,
          };
          wasChanged = true;
        }
      }

      // If album had default cover and song has a custom cover, adopt it
      let coverImage = existingAlbum.coverImage;
      if (
        (!coverImage || coverImage === ASSET_IMAGES.albumCover) &&
        song.coverUrl &&
        song.coverUrl !== ASSET_IMAGES.albumCover
      ) {
        coverImage = song.coverUrl;
        wasChanged = true;
      }

      if (wasChanged) {
        const updatedAlbumPayload: Album = {
          ...existingAlbum,
          coverImage,
          tracklist: currentTracklist,
          updatedAt: now,
        };
        await setDoc(doc(db, ALBUMS_COLL, existingAlbum.id), updatedAlbumPayload);
        return { action: 'updated', albumId: existingAlbum.id, albumTitle: existingAlbum.title };
      }

      return { action: 'unchanged', albumId: existingAlbum.id, albumTitle: existingAlbum.title };
    }
  } catch (err) {
    console.error('Error in autoSyncAlbumForSong:', err);
    return null;
  }
}

// Utility to sync all songs across all albums in one pass
export async function syncAllSongsWithAlbums(): Promise<{ createdCount: number; updatedCount: number }> {
  const songs = await fetchAllSongs();
  let createdCount = 0;
  let updatedCount = 0;

  for (const song of songs) {
    if (song.album && song.album.trim().length > 0) {
      const res = await autoSyncAlbumForSong(song);
      if (res?.action === 'created') createdCount++;
      if (res?.action === 'updated') updatedCount++;
    }
  }

  return { createdCount, updatedCount };
}

// ==========================================
// MULTI-ARTIST EXTRACTION & SYNC HELPERS
// Ensures tracks with multiple artists are properly indexed under each artist
// and auto-creates artist catalog profiles if an artist doesn't exist yet.
// ==========================================

export function extractArtistsFromSong(song: Partial<Song>): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const add = (name?: string) => {
    if (!name) return;
    const clean = name.trim();
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      result.push(clean);
    }
  };

  // 1. Add from explicit artists array
  if (Array.isArray(song.artists)) {
    song.artists.forEach(add);
  }

  // 2. Also parse from song.artist string (split on comma, &, /, +, feat., ft., featuring, with)
  if (song.artist && song.artist.trim()) {
    const parts = song.artist
      .split(/[,/&+x]|(?:\s+(?:ft\.?|feat\.?|featuring|with)\s+)/i)
      .map(p => p.trim())
      .filter(Boolean);
    parts.forEach(add);
  }

  return result;
}

export function isArtistOnSong(song: Song, artistName: string): boolean {
  if (!song || !artistName) return false;
  const target = artistName.trim().toLowerCase();
  if (!target) return false;

  // 1. Explicit artists array check
  if (Array.isArray(song.artists) && song.artists.length > 0) {
    if (song.artists.some(a => a && a.trim().toLowerCase() === target)) {
      return true;
    }
  }

  // 2. Main artist exact match
  const primary = (song.artist || '').trim().toLowerCase();
  if (primary === target) return true;

  // 3. Extracted parts check
  const parts = primary
    .split(/[,/&+x]|(?:\s+(?:ft\.?|feat\.?|featuring|with)\s+)/i)
    .map(p => p.trim().toLowerCase())
    .filter(Boolean);
  if (parts.some(p => p === target)) return true;

  // 4. Substring check
  if (primary.includes(target)) return true;

  return false;
}

export async function autoSyncArtistsForSong(song: Song): Promise<string[]> {
  try {
    const artistNames = extractArtistsFromSong(song);
    if (artistNames.length === 0) return [];

    const existingArtists = await fetchAllArtists();
    const createdNames: string[] = [];

    for (const name of artistNames) {
      const match = existingArtists.find(
        a => a.name.trim().toLowerCase() === name.toLowerCase()
      );

      if (!match) {
        // Automatically create an artist profile so the song is immediately accessible under this artist!
        const artistId = `artist_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}_${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        const newArtistPayload: Artist = {
          id: artistId,
          name: name,
          profileImage: song.coverUrl && song.coverUrl !== ASSET_IMAGES.albumCover 
            ? song.coverUrl 
            : ASSET_IMAGES.artistPortrait,
          bio: `Artist cataloged in TURVEX archive. Featured on track: "${song.title}".`,
          genres: song.genre ? [song.genre] : [],
          country: '',
          favoriteAlbums: song.album ? [song.album] : [],
          personalThoughts: `Archived automatically via release "${song.title}".`,
          externalUrl: song.externalUrl || '',
          instagramUrl: '',
          spotifyUrl: '',
          isFeatured: false,
          isPublished: true,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, ARTISTS_COLL, artistId), newArtistPayload);
        createdNames.push(name);
        existingArtists.push(newArtistPayload);
      }
    }
    return createdNames;
  } catch (err) {
    console.error('Error in autoSyncArtistsForSong:', err);
    return [];
  }
}

export async function saveSong(song: Partial<Song> & { id?: string }): Promise<string> {
  const songId = song.id || `song_${Date.now()}`;
  const now = new Date().toISOString();

  // Normalize artists array and primary artist string
  const extracted = extractArtistsFromSong(song);
  const normalizedArtists = extracted.length > 0 ? extracted : (song.artist?.trim() ? [song.artist.trim()] : []);
  const primaryArtist = song.artist?.trim() || (normalizedArtists.length > 0 ? normalizedArtists.join(', ') : 'Unknown Artist');

  const payload: Song = {
    id: songId,
    title: song.title || 'Untitled Track',
    artist: primaryArtist,
    artists: normalizedArtists,
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

    // AUTO-CREATE OR LINK ALBUM:
    // If user specified an album name, automatically ensure the album exists
    // and that this song is included in its tracklist!
    if (payload.album && payload.album.trim().length > 0) {
      await autoSyncAlbumForSong(payload);
    }

    // AUTO-CREATE OR LINK ARTISTS:
    // Automatically ensures each artist has a profile and the song is indexed under each of them!
    await autoSyncArtistsForSong(payload);

    return songId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SONGS_COLL}/${songId}`);
    throw err;
  }
}

export async function deleteSong(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SONGS_COLL, id));

    // Also remove from any album tracklist that contains this song
    try {
      const allAlbums = await fetchAllAlbums();
      for (const album of allAlbums) {
        if (album.tracklist && album.tracklist.some(t => t.id === id)) {
          const updatedTracklist = album.tracklist
            .filter(t => t.id !== id)
            .map((t, idx) => ({ ...t, trackNumber: idx + 1 }));
          await setDoc(doc(db, ALBUMS_COLL, album.id), {
            ...album,
            tracklist: updatedTracklist,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (cleanupErr) {
      console.warn('Could not clean up tracklist in albums after song deletion:', cleanupErr);
    }
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
    instagramUrl: artist.instagramUrl || '',
    spotifyUrl: artist.spotifyUrl || '',
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

// ==========================================
// MERCH & CLOTHING STORE API
// ==========================================
const normalizeMerchItem = (item: MerchItem): MerchItem => {
  // Ensure colors are never undefined or empty
  let colors = item.colors;
  if (!colors || colors.length === 0) {
    colors = item.images && item.images.length > 0 ? ['Black', 'White'] : ['Black'];
  }
  return {
    ...item,
    colors,
    colorImages: item.colorImages || {},
  };
};

const DELETED_MERCH_KEY = 'turvex_deleted_product_ids_v1';

// Read deleted product IDs from localStorage cache
function getCachedDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_MERCH_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveCachedDeletedIds(ids: Set<string>) {
  try {
    localStorage.setItem(DELETED_MERCH_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export async function fetchDeletedProductIds(): Promise<Set<string>> {
  const cached = getCachedDeletedIds();
  try {
    const snap = await getDoc(doc(db, SETTINGS_COLL, 'deleted_catalog'));
    if (snap.exists()) {
      const serverIds: string[] = snap.data()?.deletedIds || [];
      serverIds.forEach(id => cached.add(id));
      saveCachedDeletedIds(cached);
    }
  } catch (err) {
    console.warn('Could not fetch deleted catalog IDs from Firestore, using local cache:', err);
  }
  return cached;
}

export async function fetchPublishedMerch(): Promise<MerchItem[]> {
  const deletedIds = await fetchDeletedProductIds();
  try {
    const q = query(collection(db, MERCH_COLL), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      return snap.docs
        .map(d => normalizeMerchItem({ id: d.id, ...d.data() } as MerchItem))
        .filter(item => !deletedIds.has(item.id));
    }
    // If database is empty, return default items excluding any deleted
    return DEFAULT_MERCH.map(normalizeMerchItem).filter(item => !deletedIds.has(item.id));
  } catch (err) {
    console.warn('Using curated starter merch:', err);
    return DEFAULT_MERCH.map(normalizeMerchItem).filter(item => !deletedIds.has(item.id));
  }
}

export async function fetchAllMerch(): Promise<MerchItem[]> {
  const deletedIds = await fetchDeletedProductIds();
  try {
    const snap = await getDocs(collection(db, MERCH_COLL));
    if (snap.docs.length > 0) {
      return snap.docs
        .map(d => normalizeMerchItem({ id: d.id, ...d.data() } as MerchItem))
        .filter(item => !deletedIds.has(item.id));
    }
    return DEFAULT_MERCH.map(normalizeMerchItem).filter(item => !deletedIds.has(item.id));
  } catch (err) {
    console.warn('Using curated starter merch:', err);
    return DEFAULT_MERCH.map(normalizeMerchItem).filter(item => !deletedIds.has(item.id));
  }
}

export async function saveMerchItem(item: Partial<MerchItem> & { id?: string }): Promise<string> {
  const merchId = item.id || `merch_${Date.now()}`;
  const now = new Date().toISOString();
  
  // Resolve colors: default to Black & White if 2 photos are provided, or Black
  let resolvedColors = item.colors && item.colors.length > 0 ? item.colors : [];
  if (resolvedColors.length === 0) {
    resolvedColors = item.images && item.images.length > 0 ? ['Black', 'White'] : ['Black'];
  }

  const payload: MerchItem = {
    id: merchId,
    name: item.name || 'Untitled Garment',
    price: Number(item.price) || 0,
    currency: item.currency || 'EGP',
    description: item.description || '',
    category: item.category || 'hoodies',
    coverImage: item.coverImage || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    images: item.images && item.images.length > 0 ? item.images : [item.coverImage || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'],
    sizes: item.sizes && item.sizes.length > 0 ? item.sizes : ['S', 'M', 'L', 'XL'],
    colors: resolvedColors,
    colorImages: item.colorImages || {},
    inStock: item.inStock ?? true,
    isFeatured: item.isFeatured ?? false,
    isPublished: item.isPublished ?? true,
    orderUrl: item.orderUrl || '',
    whatsappNumber: item.whatsappNumber || '',
    createdAt: item.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, MERCH_COLL, merchId), payload);
    // If it was previously marked deleted, unmark it
    const deleted = getCachedDeletedIds();
    if (deleted.has(merchId)) {
      deleted.delete(merchId);
      saveCachedDeletedIds(deleted);
      try {
        await setDoc(doc(db, SETTINGS_COLL, 'deleted_catalog'), {
          deletedIds: Array.from(deleted),
          updatedAt: now,
        }, { merge: true });
      } catch {}
    }
    return merchId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${MERCH_COLL}/${merchId}`);
    throw err;
  }
}

export async function deleteMerchItem(id: string): Promise<void> {
  const now = new Date().toISOString();
  // 1. Immediately cache the deleted ID locally so the UI updates instantly
  const deleted = getCachedDeletedIds();
  deleted.add(id);
  saveCachedDeletedIds(deleted);

  try {
    // 2. Delete document from Firestore
    await deleteDoc(doc(db, MERCH_COLL, id));
  } catch (err) {
    console.warn(`Firestore document ${id} might not exist yet or error:`, err);
  }

  // 3. Persist deleted ID into Firestore deleted_catalog collection
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'deleted_catalog'), {
      deletedIds: Array.from(deleted),
      updatedAt: now,
    }, { merge: true });
  } catch (err) {
    console.warn('Could not update remote deleted_catalog:', err);
  }

  // 4. Remove this product from the shopping cart if present
  try {
    const rawCart = localStorage.getItem('turvex_cart_items_v1');
    if (rawCart) {
      const items = JSON.parse(rawCart);
      if (Array.isArray(items)) {
        const filtered = items.filter((ci: { product?: { id?: string } }) => ci.product?.id !== id);
        localStorage.setItem('turvex_cart_items_v1', JSON.stringify(filtered));
        window.dispatchEvent(new Event('turvex_cart_updated'));
      }
    }
  } catch {}
}

// Update multiple product images or reorder them
export async function updateProductImages(
  productId: string,
  images: string[],
  coverImage?: string
): Promise<void> {
  const now = new Date().toISOString();
  const mainImage = coverImage || (images.length > 0 ? images[0] : '');
  try {
    await updateDoc(doc(db, MERCH_COLL, productId), {
      images,
      coverImage: mainImage,
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${MERCH_COLL}/${productId}`);
    throw err;
  }
}

// Delete a single image from a product
export async function deleteProductImage(
  productId: string,
  imageToDelete: string
): Promise<{ images: string[]; coverImage: string }> {
  const now = new Date().toISOString();
  const snap = await getDoc(doc(db, MERCH_COLL, productId));
  if (!snap.exists()) {
    throw new Error('Product not found in database');
  }
  const data = snap.data() as MerchItem;
  const currentImages = Array.isArray(data.images) ? data.images : [data.coverImage];
  const newImages = currentImages.filter(img => img !== imageToDelete);
  const newCover = (data.coverImage === imageToDelete)
    ? (newImages[0] || '')
    : data.coverImage;

  await updateDoc(doc(db, MERCH_COLL, productId), {
    images: newImages,
    coverImage: newCover,
    updatedAt: now,
  });

  return { images: newImages, coverImage: newCover };
}

// Save or update custom website images (Hero, banners, capsule campaign images)
export async function updateWebsiteImages(images: Partial<SiteSettings['websiteImages']>): Promise<SiteSettings> {
  const now = new Date().toISOString();
  const current = await fetchSiteSettings();
  const mergedWebsiteImages = {
    ...(current.websiteImages || {}),
    ...images,
  };
  const payload = {
    ...current,
    websiteImages: mergedWebsiteImages,
    updatedAt: now,
  };
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'global'), payload, { merge: true });
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLL}/global`);
    throw err;
  }
}

// ==========================================
// ORDERS API
// ==========================================
export async function createCustomerOrder(
  orderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CustomerOrder> {
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const fullOrder: CustomerOrder = {
    ...orderData,
    id: orderId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, ORDERS_COLL, orderId), fullOrder);
    return fullOrder;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ORDERS_COLL}/${orderId}`);
    throw err;
  }
}

export async function fetchAllOrders(): Promise<CustomerOrder[]> {
  try {
    const snap = await getDocs(collection(db, ORDERS_COLL));
    if (snap.docs.length > 0) {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerOrder));
      // Sort newest first
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  } catch (err) {
    console.warn('Could not fetch orders:', err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: CustomerOrder['status']): Promise<void> {
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, ORDERS_COLL, orderId), {
      status,
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COLL}/${orderId}`);
    throw err;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORDERS_COLL, orderId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ORDERS_COLL}/${orderId}`);
    throw err;
  }
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
  for (const m of DEFAULT_MERCH) {
    await saveMerchItem(m);
  }
  await saveSiteSettings(DEFAULT_SETTINGS);
}

