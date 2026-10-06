import { useEffect, useState } from "react";
import type { FeedItem } from "@shared/schema";
import EmbedPlayer from "./EmbedPlayer";
import BandcampEmbed from "./BandcampEmbed";
import OdyseeEmbed from "./OdyseeEmbed";

type FeedKind = "mixcloud" | "bandcamp" | "odysee";

function formatDate(pubDate?: string) {
  if (!pubDate) return undefined;
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function FeedCard({ item, kind }: { item: FeedItem; kind: FeedKind }) {
  // odysee embeds are full video players, so lazy-load them behind a thumbnail; mixcloud/bandcamp widgets are cheap to render up front
  const [expanded, setExpanded] = useState(kind !== "odysee");
  const date = formatDate(item.pubDate);

  return (
    <article className="bg-surface rounded-t-lg p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-cream">{item.title}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
            {item.duration && <span>{item.duration}</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-wide text-accent hover:text-accent-dark whitespace-nowrap"
        >
          View source
        </a>
      </div>

      {item.description && (
        <p className="text-sm text-muted whitespace-pre-line line-clamp-3">{item.description}</p>
      )}

      {expanded ? (
        kind === "bandcamp" ? (
          <BandcampEmbed embedUrl={item.embedUrl} title={item.title} />
        ) : kind === "odysee" ? (
          <OdyseeEmbed embedUrl={item.embedUrl} title={item.title} />
        ) : (
          <EmbedPlayer embedUrl={item.embedUrl} title={item.title} />
        )
      ) : (
        item.thumbnail && (
          <button
            onClick={() => setExpanded(true)}
            className="relative w-full h-40 rounded-md overflow-hidden group"
            aria-label={`Play ${item.title}`}
          >
            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/40 group-hover:bg-ink/60 transition-colors">
              <span className="w-10 h-10 rounded-full bg-cream/90 flex items-center justify-center text-ink">▶</span>
            </span>
          </button>
        )
      )}
    </article>
  );
}

export default function FeedList({
  endpoint,
  kind,
  emptyMessage = "Nothing here yet — check back soon.",
}: {
  endpoint: string;
  kind: FeedKind;
  emptyMessage?: string;
}) {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setItems(null);
    setError(false);
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setItems)
      .catch(() => setError(true));
  }, [endpoint]);

  if (error) return <p className="text-muted">Couldn't load this right now. Please try again later.</p>;
  if (items === null) return <p className="text-muted">Loading…</p>;
  if (items.length === 0) return <p className="text-muted">{emptyMessage}</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} kind={kind} />
      ))}
    </div>
  );
}
