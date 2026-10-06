import type { FeedItem } from "../shared/schema";
import { decodeEntities } from "./feedUtils";

const BANDCAMP_MUSIC_URL = "https://brainkat.bandcamp.com/music";
const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { items: FeedItem[]; fetchedAt: number } | null = null;

function toEmbedUrl(itemType: string, itemId: string): string {
  return `https://bandcamp.com/EmbeddedPlayer/${itemType}=${itemId}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/`;
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).trim();
}

// parses a Bandcamp theme's <li data-item-id="album-123" ...><a href><img><p class="title">...
function parseItem(block: string): FeedItem | null {
  const idMatch = block.match(/data-item-id="(album|track)-(\d+)"/);
  const href = block.match(/<a href="([^"]+)">/)?.[1];
  const thumbnail = block.match(/<img src="([^"]+)"/)?.[1];
  const titleBlock = block.match(/<p class="title">([\s\S]*?)<\/p>/)?.[1];
  if (!idMatch || !href || !titleBlock) return null;

  const [, itemType, itemId] = idMatch;
  const [titlePart, artistPart] = titleBlock.split(/<br\s*\/?>/i);
  const title = stripTags(titlePart);
  const artist = artistPart ? stripTags(artistPart) : undefined;

  return {
    id: `${itemType}-${itemId}`,
    title: artist ? `${title} — ${artist}` : title,
    link: `https://brainkat.bandcamp.com${href}`,
    embedUrl: toEmbedUrl(itemType, itemId),
    thumbnail,
  };
}

export async function fetchBandcampArchive(): Promise<FeedItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const res = await fetch(BANDCAMP_MUSIC_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BenJamSite/1.0)" },
  });
  if (!res.ok) throw new Error(`Bandcamp request failed: ${res.status}`);
  const html = await res.text();

  const items: FeedItem[] = [];
  for (const match of html.matchAll(/<li data-item-id="(?:album|track)-\d+"[\s\S]*?<\/li>/g)) {
    const item = parseItem(match[0]);
    if (item) items.push(item);
  }

  cache = { items, fetchedAt: Date.now() };
  return items;
}
