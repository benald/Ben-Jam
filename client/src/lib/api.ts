import type { Track, EventItem, GalleryAlbum, ContactInfo, BiographyContent } from "@shared/schema";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request to ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  biography: () => getJson<BiographyContent>("/api/biography"),
  releases: () => getJson<Track[]>("/api/releases"),
  mixes: () => getJson<Track[]>("/api/mixes"),
  demos: () => getJson<Track[]>("/api/demos"),
  label: () => getJson<Track[]>("/api/label"),
  events: () => getJson<EventItem[]>("/api/events"),
  gallery: () => getJson<GalleryAlbum[]>("/api/gallery"),
  contact: () => getJson<ContactInfo>("/api/contact"),
};
