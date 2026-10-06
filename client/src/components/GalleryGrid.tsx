import { useState } from "react";
import type { GalleryAlbum } from "@shared/schema";
import Lightbox from "./Lightbox";

export default function GalleryGrid({ albums }: { albums: GalleryAlbum[] }) {
  const [activeAlbum, setActiveAlbum] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const openAlbum = (index: number) => {
    setActiveAlbum(index);
    setActivePhoto(0);
  };

  const album = activeAlbum !== null ? albums[activeAlbum] : null;
  const photos = album
    ? album.photos.map((src, i) => ({
        id: `${album.id}-${i}`,
        src,
        alt: `${album.title} photo ${i + 1}`,
        caption: album.meta,
      }))
    : [];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {albums.map((album, index) => (
          <button
            key={album.id}
            onClick={() => openAlbum(index)}
            className="group relative aspect-square overflow-hidden rounded-md bg-surface"
          >
            <img
              src={album.cover}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3 text-left">
              <p className="font-display text-sm font-semibold text-cream">{album.title}</p>
              {album.meta && <p className="text-xs text-muted">{album.meta}</p>}
            </div>
          </button>
        ))}
      </div>

      {photos.length > 0 && (
        <Lightbox images={photos} activeIndex={activePhoto} onClose={() => setActiveAlbum(null)} onNavigate={setActivePhoto} />
      )}
    </>
  );
}
