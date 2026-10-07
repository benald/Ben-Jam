import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { FeedItem } from "../shared/schema";
import { decodeEntities, formatDuration } from "./feedUtils";

const RSS_URL = "https://odysee.com/$/rss/@BenJam:c";
const CLAIM_SEARCH_URL = "https://api.na-backend.odysee.com/api/v1/proxy";
const CHANNEL = "@BenJam:c";
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

interface ClaimSearchItem {
  name?: string;
  claim_id?: string;
  value?: {
    title?: string;
    description?: string;
    release_time?: string;
    stream_type?: string;
    thumbnail?: { url?: string };
    video?: { duration?: number };
    audio?: { duration?: number };
  };
}

function buildItemFromClaim(item: ClaimSearchItem): FeedItem | null {
  const { name, claim_id: claimId, value } = item;
  if (!name || !claimId || !value?.title) return null;

  const link = `https://odysee.com/${name}:${claimId}`;
  const releaseTimeMs = value.release_time ? Number(value.release_time) * 1000 : undefined;
  const durationSeconds = value.video?.duration ?? value.audio?.duration;

  return {
    id: link,
    title: decodeEntities(value.title),
    link,
    embedUrl: toEmbedUrl(link),
    thumbnail: value.thumbnail?.url,
    pubDate: releaseTimeMs ? new Date(releaseTimeMs).toUTCString() : undefined,
    duration: durationSeconds ? formatDuration(durationSeconds) : undefined,
    mediaType: value.stream_type === "video" ? "video" : "audio",
    description: value.description ? decodeEntities(value.description).trim() : undefined,
  };
}

// Independent fallback data source: Odysee's JSON-RPC API on a different
// domain/backend pool than the "$/rss/" convenience endpoint above, used as
// an alternate path in case that specific endpoint/node is unhealthy.
async function fetchClaimSearchOnce(): Promise<FeedItem[]> {
  const res = await fetch(CLAIM_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "claim_search",
      params: {
        channel: CHANNEL,
        claim_type: "stream",
        order_by: ["release_time"],
        page_size: 50,
      },
    }),
  });
  if (!res.ok) throw new Error(`Odysee claim_search request failed: ${res.status}`);
  const json = (await res.json()) as { result?: { items?: ClaimSearchItem[] }; error?: { message?: string } };
  if (json.error) throw new Error(`Odysee claim_search error: ${json.error.message}`);

  const items: FeedItem[] = [];
  for (const claim of json.result?.items ?? []) {
    const item = buildItemFromClaim(claim);
    if (item) items.push(item);
  }
  return items;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Odysee load-balances these endpoints across a pool of backend nodes, and
// individual nodes are sometimes unhealthy: they can return a 200 with a
// generic "invalid channel" fallback body instead of the feed, or fail
// outright. This has been observed to happen intermittently, and in some
// cases consistently for a given caller, so attempts alternate between two
// independent endpoints (which may be routed differently) in addition to
// retrying. If every attempt still fails, fall back to the last
// successfully fetched result rather than showing an error for what is
// usually a transient upstream issue.
const FETCHERS = [fetchRssOnce, fetchClaimSearchOnce, fetchRssOnce, fetchClaimSearchOnce, fetchRssOnce];
const RETRY_DELAY_MS = 750;

let lastGood: { items: FeedItem[]; fetchedAt: number } | null = null;

export async function fetchOdyseeArchive(): Promise<FeedItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  for (let attempt = 1; attempt <= FETCHERS.length; attempt++) {
    try {
      const items = await FETCHERS[attempt - 1]();
      if (items.length > 0) {
        cache = { items, fetchedAt: Date.now() };
        lastGood = cache;
        void writeDiskCache(items);
        return items;
      }
    } catch (err) {
      console.error(`Odysee fetch attempt ${attempt}/${FETCHERS.length} failed`, err);
    }
    if (attempt < FETCHERS.length) await sleep(RETRY_DELAY_MS);
  }

  // in-memory cache from an earlier successful fetch in this process
  if (lastGood) {
    console.error("Odysee fetch failed after retries; serving last known good feed");
    return lastGood.items;
  }

  // the process just (re)started and hasn't fetched successfully yet; fall
  // back to whatever was last persisted to disk by a previous process
  const diskItems = await readDiskCache();
  if (diskItems && diskItems.length > 0) {
    console.error("Odysee fetch failed after retries; serving disk-cached feed");
    return diskItems;
  }

  throw new Error("Odysee fetch returned no items after retries");
}


