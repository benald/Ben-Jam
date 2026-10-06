import { useExclusivePlaybackRef } from "../lib/useExclusivePlaybackRef";

export default function OdyseeEmbed({ embedUrl, title }: { embedUrl?: string; title: string }) {
  const frameRef = useExclusivePlaybackRef();

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-16 rounded-md bg-surface-2 text-muted text-sm">
        No player available yet
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-md overflow-hidden bg-black">
      <iframe
        ref={frameRef}
        title={`${title} player`}
        src={embedUrl}
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
