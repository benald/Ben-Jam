import { useEffect, useState } from "react";
import type { GalleryAlbum } from "@shared/schema";
import { api } from "../lib/api";
import GalleryGrid from "../components/GalleryGrid";

export default function Gallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .gallery()
      .then(setAlbums)
      .catch(() => setError(true));
  }, []);

  return (
    <section>
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">Gallery</h1>
        <p className="text-muted mt-2">Moments from the booth, the event floor, and beyond.</p>
      </header>

      {error && <p className="text-muted">Couldn't load the gallery right now. Please try again later.</p>}
      {!error && albums === null && <p className="text-muted">Loading…</p>}
      {!error && albums?.length === 0 && <p className="text-muted">No photos yet — check back soon.</p>}

      {albums && albums.length > 0 && <GalleryGrid albums={albums} />}
    </section>
  );
}
