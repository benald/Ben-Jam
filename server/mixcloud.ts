import type { FeedItem } from "../shared/schema";
import { formatDuration } from "./feedUtils";

const MIXCLOUD_USER = "BenJam";
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_PAGES = 10; // safety cap on pagination requests

interface MixcloudCast {
  key: string;
  url: string;
  name: string;
  created_time: string;
  audio_length?: number;
  pictures?: { large?: string; extra_large?: string };
}

let cache: { items: FeedItem[]; fetchedAt: number } | null = null;

function toEmbedUrl(key: string): string {
  return `https://player-widget.mixcloud.com/widget/iframe/?mini=1&feed=${encodeURIComponent(key)}`;
}

export async function fetchMixcloudArchive(): Promise<FeedItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const items: FeedItem[] = [];
  let url: string | undefined = `https://api.mixcloud.com/${MIXCLOUD_USER}/cloudcasts/?limit=100`;

  for (let page = 0; url && page < MAX_PAGES; page++) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mixcloud API request failed: ${res.status}`);
    const json: { data: MixcloudCast[]; paging?: { next?: string } } = await res.json();

    for (const cast of json.data) {
      items.push({
        id: cast.key,
        title: cast.name,
        link: cast.url,
        embedUrl: toEmbedUrl(cast.key),
        thumbnail: cast.pictures?.extra_large ?? cast.pictures?.large,
        pubDate: cast.created_time,
        duration: cast.audio_length ? formatDuration(cast.audio_length) : undefined,
      });
    }

    url = json.paging?.next;
  }

  cache = { items, fetchedAt: Date.now() };
  return items;
}
