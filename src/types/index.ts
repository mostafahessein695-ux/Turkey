export interface Song {
  id: string;
  title: string;
  artist: string;
  artists?: string[]; // Multiple artists / collaborators
  album?: string;
  coverUrl: string;
  releaseYear?: string;
  genre: string;
  moodTags: string[];
  personalRating: number; // 1 to 5 or 1 to 10
  personalNotes?: string;
  externalUrl?: string; // Spotify, Apple Music, Bandcamp, YouTube
  embedUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TrackItem {
  id: string;
  trackNumber: number;
  title: string;
  duration?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  releaseYear?: string;
  genre: string;
  tracklist: TrackItem[];
  review?: string;
  rating: number; // 1 to 10
  externalUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  profileImage: string;
  bio?: string;
  genres: string[];
  country?: string;
  favoriteAlbums?: string[];
  personalThoughts?: string;
  externalUrl?: string;
  instagramUrl?: string; // Instagram handle or link (@username or https://instagram.com/username)
  spotifyUrl?: string; // Spotify artist profile URL
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export function formatInstagramUrl(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, '');
  return `https://instagram.com/${handle}`;
}

export function formatInstagramHandle(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.includes('instagram.com/')) {
    const parts = trimmed.split('instagram.com/')[1].split('/')[0].split('?')[0];
    return `@${parts}`;
  }
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  itemIds: string[]; // Song or album IDs
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
  category?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface Quote {
  id: string;
  text: string;
  attribution?: string;
  context?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface SiteSettings {
  id?: string;
  heroHeadline: string;
  heroSubhead: string;
  heroImage?: string;
  aboutBio: string;
  aboutPhoto?: string;
  socialLinks: {
    platform: string;
    url: string;
    handle: string;
  }[];
  featuredCollectionId?: string;
  updatedAt?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  currency?: string;
  description?: string;
  category: 'hoodies' | 'tees' | 'headwear' | 'pants' | 'accessories' | string;
  coverImage: string;
  images?: string[];
  sizes: string[]; // e.g. ['S', 'M', 'L', 'XL', 'XXL']
  inStock: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  orderUrl?: string; // external checkout or Instagram/store link
  whatsappNumber?: string; // WhatsApp ordering e.g. '201xxxxxxxxx'
  createdAt: string;
  updatedAt?: string;
}

export type NavTab = 
  | 'home' 
  | 'music' 
  | 'artists' 
  | 'merch'
  | 'albums' 
  | 'gallery' 
  | 'admin';

export interface DetailViewTarget {
  type: 'song' | 'artist' | 'album' | 'collection' | 'merch';
  id: string;
}
