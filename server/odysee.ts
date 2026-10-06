import type { FeedItem } from "../shared/schema";
import { decodeEntities, formatDuration } from "./feedUtils";

const RSS_URL = "https://odysee.com/$/rss/@BenJam:c";
const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { items: FeedItem[]; fetchedAt: number } | null = null;

function toEmbedUrl(link: string): string {
  return link.replace("https://odysee.com/", "https://odysee.com/$/embed/");
}

function parseItem(block: string): FeedItem | null {
  const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1];
  const link = block.match(/<link>(.*?)<\/link>/s)?.[1];
  const guid = block.match(/<guid[^>]*>(.*?)<\/guid>/s)?.[1];
  const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1];
  if (!title || !link || !guid || !pubDate) return null;

  const enclosureType = block.match(/<enclosure[^>]*type="([^"]+)"/)?.[1] ?? "";
  const thumbnail = block.match(/<itunes:image href="([^"]+)"/)?.[1];
  const durationSeconds = block.match(/<itunes:duration>(\d+)<\/itunes:duration>/)?.[1];

  let description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1] ?? "";
  description = description
    .replace(/^<p>\s*<img[^>]*>\s*<\/p>/i, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim();

  return {
    id: guid,
    title: decodeEntities(title),
    link,
    embedUrl: toEmbedUrl(link),
    thumbnail,
    pubDate,
    duration: durationSeconds ? formatDuration(Number(durationSeconds)) : undefined,
    mediaType: enclosureType.startsWith("video") ? "video" : "audio",
    description: decodeEntities(description),
  };
}

export async function fetchOdyseeArchive(): Promise<FeedItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`Odysee RSS request failed: ${res.status}`);
  const xml = await res.text();

  const items: FeedItem[] = [];
  for (const match of xml.matchAll(/<item>(.*?)<\/item>/gs)) {
    const item = parseItem(match[1]);
    if (item) items.push(item);
  }

  cache = { items, fetchedAt: Date.now() };
  return items;
}

