import type { Track } from "@shared/schema";
import EmbedPlayer from "./EmbedPlayer";
import BandcampEmbed from "./BandcampEmbed";
import OdyseeEmbed from "./OdyseeEmbed";

export default function ReleaseCard({
  track,
  playerType = "mixcloud",
  alignRow = true,
}: {
  track: Track;
  playerType?: "mixcloud" | "bandcamp" | "odysee";
  alignRow?: boolean;
}) {
  // a track can override the page-level default player (used on Mixes, which mixes Mixcloud & Odysee)
  const platform = track.platform ?? playerType;
  // alignRow uses CSS subgrid so title/player/detail/tracklist/footer line up with the other
  // card in the same row — only relevant when cards are laid out two per row
  const rowSpan = alignRow ? "md:[grid-row:span_5] md:grid md:[grid-template-rows:subgrid]" : "";
  const sectionsWrap = alignRow ? "md:contents" : "";
  const rowClass = (n: number) => (alignRow ? `md:[grid-row:${n}]` : "");

  return (
    <article className={`bg-surface rounded-t-lg p-4 sm:p-5 flex flex-col sm:flex-row gap-4 ${rowSpan}`}>
      <div className={`flex-1 min-w-0 flex flex-col gap-3 ${sectionsWrap}`}>
        <div className={rowClass(1)}>
          <h3 className="font-display text-lg font-semibold text-cream">{track.title}</h3>
          <p className="text-sm text-muted">{track.artist}</p>
        </div>

        {/* player comes right after the header so its artwork lines up across every card in a row,
            regardless of how much detail/tracklist text a given release has */}
        <div className={rowClass(2)}>
          {platform === "bandcamp" ? (
            <BandcampEmbed embedUrl={track.embedUrl} embedHeight={track.embedHeight} title={track.title} />
          ) : platform === "odysee" ? (
            <OdyseeEmbed embedUrl={track.embedUrl} title={track.title} />
          ) : (
            <EmbedPlayer embedUrl={track.embedUrl} title={track.title} />
          )}
        </div>

        {track.detail && <p className={`text-sm text-muted italic ${rowClass(3)}`}>{track.detail}</p>}

        {track.tracklist && track.tracklist.length > 0 && (
          <ol className={`text-sm text-muted list-decimal list-inside space-y-0.5 ${rowClass(4)}`}>
            {track.tracklist.map((trackName, index) => (
              <li key={`${track.id}-${index}`}>{trackName}</li>
            ))}
          </ol>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${alignRow ? "md:[grid-row:5] md:self-end" : ""}`}
        >
          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] uppercase tracking-wide text-forest bg-forest/10 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {track.duration && <span className="text-xs text-muted">{track.duration}</span>}
            <span className="text-xs text-muted">Released {track.releaseDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
