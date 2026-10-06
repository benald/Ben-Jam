export interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  embedUrl?: string;
  embedHeight?: string;
  buyUrl?: string;
  releaseDate: string;
  tags?: string[];
  tracklist?: string[];
  detail?: string;
  duration?: string;
  accentColor?: string;
  platform?: "mixcloud" | "bandcamp" | "odysee";
}

// normalized shape returned by the server-side Mixcloud/Bandcamp/Odysee feed fetchers
export interface FeedItem {
  id: string;
  title: string;
  link: string;
  embedUrl?: string;
  thumbnail?: string;
  pubDate?: string;
  duration?: string;
  description?: string;
  mediaType?: "audio" | "video";
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  ticketUrl?: string;
  detail?: string;
}

export interface BiographyImage {
  src: string;
  alt: string;
}

export interface BiographyLink {
  label: string;
  url: string;
}

export interface BiographySection {
  heading: string;
  paragraphs: string[];
  residencies?: string[];
  events?: string[];
  djs?: string[];
  image?: BiographyImage; 
  radio?: string[];
}

export interface BiographyContent {
  portrait: BiographyImage;
  intro: string;
  sections: BiographySection[];
  links: BiographyLink[];
}


export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  meta?: string;
  cover: string;
  photos: string[];
}

export interface ContactSocial {
  label: string;
  url: string;
}

export interface ContactInfo {
  email: string;
  socials: ContactSocial[];
}
