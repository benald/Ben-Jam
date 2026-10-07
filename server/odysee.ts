import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { FeedItem } from "../shared/schema";
import { decodeEntities, formatDuration } from "./feedUtils";

const RSS_URL = "https://odysee.com/$/rss/@BenJam:c";
const CACHE_TTL_MS = 10 * 60 * 1000;

// Disk-backed copy of the last successful fetch, used as a last-resort
// fallback if Odysee is still unreachable after retries and the in-memory
// cache was lost (e.g. the process just restarted). Written best-effort;
// it's fine if this is unavailable (e.g. read-only filesystem).
const DISK_CACHE_PATH = path.join(os.tmpdir(), "ben-jam-odysee-cache.json");

async function readDiskCache(): Promise<FeedItem[] | null> {
  try {
    const raw = await readFile(DISK_CACHE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { items: FeedItem[] };
    return parsed.items;
  } catch {
    return null;
  }
}

async function writeDiskCache(items: FeedItem[]): Promise<void> {
  try {
    await writeFile(DISK_CACHE_PATH, JSON.stringify({ items }), "utf-8");
  } catch (err) {
    console.error("Failed to persist Odysee disk cache", err);
  }
}

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

async function fetchRssOnce(): Promise<FeedItem[]> {
  const res = await fetch(RSS_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BenJamSite/1.0)" },
  });
  if (!res.ok) throw new Error(`Odysee RSS request failed: ${res.status}`);
  const xml = await res.text();

  const items: FeedItem[] = [];
  for (const match of xml.matchAll(/<item>(.*?)<\/item>/gs)) {
    const item = parseItem(match[1]);
    if (item) items.push(item);
  }
  return items;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Odysee load-balances this endpoint across a pool of backend nodes, and
// individual nodes are sometimes unhealthy: they can return a 200 with a
// generic "invalid channel" fallback body instead of the feed, or fail
// outright. This has been observed to happen intermittently regardless of
// the caller's network, so retrying a few times (each attempt may land on a
// different node) works around it. If every attempt still fails, fall back
// to the last successfully fetched result rather than showing an error for
// what is usually a transient upstream blip.
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 750;

let lastGood: { items: FeedItem[]; fetchedAt: number } | null = null;

export async function fetchOdyseeArchive(): Promise<FeedItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const items = await fetchRssOnce();
      if (items.length > 0) {
        cache = { items, fetchedAt: Date.now() };
        lastGood = cache;
        void writeDiskCache(items);
        return items;
      }
    } catch (err) {
      console.error(`Odysee RSS fetch attempt ${attempt}/${MAX_ATTEMPTS} failed`, err);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }

  // in-memory cache from an earlier successful fetch in this process
  if (lastGood) {
    console.error("Odysee RSS request failed after retries; serving last known good feed");
    return lastGood.items;
  }

  // the process just (re)started and hasn't fetched successfully yet; fall
  // back to whatever was last persisted to disk by a previous process
  const diskItems = await readDiskCache();
  if (diskItems && diskItems.length > 0) {
    console.error("Odysee RSS request failed after retries; serving disk-cached feed");
    return diskItems;
  }

  throw new Error("Odysee RSS request returned no items after retries");
}


