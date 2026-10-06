import { useExclusivePlaybackRef } from "../lib/useExclusivePlaybackRef";

export default function BandcampEmbed(
  { 
    embedUrl, 
    embedHeight, 
    title, 
    buyUrl 
  }: Readonly<{ 
    embedUrl?: string; 
    embedHeight?: string; 
    title: string; 
    buyUrl?: string 
  }>) {
  const frameRef = useExclusivePlaybackRef();

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-16 rounded-md bg-surface-2 text-muted text-sm">
        No player available yet
      </div>
    );
  }

  return (
    <iframe
      ref={frameRef}
      title={`${title} player`}
      style={{ height: embedHeight }}
      src={embedUrl}
      // Bandcamp's "size=large" widget is a fixed-design embed (square artwork + chrome below it)
      // sized for ~350px wide; stretching it to a wider card pushes the play controls below the
      // visible height, so cap the width instead of letting it fill the card
      className="w-full max-w-[350px] rounded-md border-0"
      seamless
      loading="lazy">
        <a href={buyUrl}>{title}</a>
    </iframe>
  );
}


