import type { Express, Request, Response } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchOdyseeArchive, debugOdyseeFetch } from "./odysee";
import { fetchMixcloudArchive } from "./mixcloud";
import { fetchBandcampArchive } from "./bandcamp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

const resources = [
  "discography",
  "releases",
  "label",
  "demos",
  "events",
  "gallery",
  "contact",
  "biography",
  "mixes",
] as const;

async function readJson(name: string) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export function registerRoutes(app: Express) {
  for (const resource of resources) {
    app.get(`/api/${resource}`, async (_req: Request, res: Response) => {
      try {
        const data = await readJson(resource);
        res.json(data);
      } catch (err) {
        console.error(`Failed to read ${resource}.json`, err);
        res.status(500).json({ error: `Failed to load ${resource}` });
      }
    });
  }

  // TEMPORARY diagnostic route for debugging the production empty-feed issue; remove once resolved.
  app.get("/api/odysee-debug", async (_req: Request, res: Response) => {
    try {
      res.json(await debugOdyseeFetch());
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  const feeds = {
    "odysee-archive": fetchOdyseeArchive,
    "mixcloud-archive": fetchMixcloudArchive,
    "bandcamp-archive": fetchBandcampArchive,
  } as const;

  for (const [route, fetchFeed] of Object.entries(feeds)) {
    app.get(`/api/${route}`, async (_req: Request, res: Response) => {
      try {
        const items = await fetchFeed();
        res.json(items);
      } catch (err) {
        console.error(`Failed to load ${route}`, err);
        res.status(500).json({ error: `Failed to load ${route}` });
      }
    });
  }
}
