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
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
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

export type NavTab = 
  | 'home' 
  | 'music' 
  | 'artists' 
  | 'albums' 
  | 'gallery' 
  | 'admin';

export interface DetailViewTarget {
  type: 'song' | 'artist' | 'album' | 'collection';
  id: string;
}
