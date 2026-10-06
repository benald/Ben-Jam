import { useEffect, useState } from "react";
import type { Track } from "@shared/schema";
import ReleaseCard from "./ReleaseCard";

// groups tracks into pairs so each row gets its own grid context — row heights
// (e.g. title alignment) only match within a row, not across the whole list
function chunkPairs(tracks: Track[]): Track[][] {
  const pairs: Track[][] = [];
  for (let i = 0; i < tracks.length; i += 2) {
    pairs.push(tracks.slice(i, i + 2));
  }
  return pairs;
}

export default function ReleaseList({
  endpoint,
  title,
  subtitle,
  playerType = "mixcloud",
  columns = 2,
}: {
  endpoint: string;
  title: string;
  subtitle?: string;
  playerType?: "mixcloud" | "bandcamp" | "odysee";
  columns?: 1 | 2;
}) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setTracks(null);
    setError(false);
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setTracks)
      .catch(() => setError(true));
  }, [endpoint]);

  return (
    <section>
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">{title}</h1>
        {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
      </header>

      {error && <p className="text-muted">Couldn't load this page right now. Please try again later.</p>}
      {!error && tracks === null && <p className="text-muted">Loading…</p>}
      {!error && tracks?.length === 0 && <p className="text-muted">No entries yet — check back soon.</p>}

      <div className="flex flex-col gap-4">
        {tracks &&
          (columns === 1
            ? tracks.map((track) => <ReleaseCard key={track.id} track={track} playerType={playerType} alignRow={false} />)
            : chunkPairs(tracks).map((pair, i) => (
                <div
                  key={pair[0]?.id ?? i}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 md:[grid-template-rows:repeat(5,auto)]"
                >
                  {pair.map((track) => (
                    <ReleaseCard key={track.id} track={track} playerType={playerType} />
                  ))}
                </div>
              )))}
      </div>
    </section>
  );
}
