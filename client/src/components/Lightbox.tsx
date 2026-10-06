import type { GalleryImage } from "@shared/schema";

export default function Lightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const image = images[activeIndex];

  const goTo = (delta: number) => {
    const next = (activeIndex + delta + images.length) % images.length;
    onNavigate(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-cream text-2xl leading-none" aria-label="Close gallery">
        ×
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goTo(-1);
        }}
        className="absolute left-4 text-cream text-3xl px-2"
        aria-label="Previous image"
      >
        ‹
      </button>

      <figure className="max-w-3xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.alt} className="max-h-[70vh] w-auto mx-auto rounded-md" />
        {image.caption && <figcaption className="text-center text-muted mt-3 text-sm">{image.caption}</figcaption>}
      </figure>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goTo(1);
        }}
        className="absolute right-4 text-cream text-3xl px-2"
        aria-label="Next image"
      >
        ›
      </button>
    </div>
  );
}
