import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ContactInfo, Track, EventItem, BiographyContent } from "@shared/schema";
import { api } from "../lib/api";

const MONTHS: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

// events.json stores dates as "DD MON YYYY" (e.g. "30 NOV 2024"), not ISO
function parseEventDate(date: string): Date | null {
  const [day, mon, year] = date.split(" ");
  const month = mon ? MONTHS[mon.toUpperCase()] : undefined;
  if (!day || month === undefined || !year) return null;
  return new Date(Number(year), month, Number(day));
}

export default function Sidebar() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [release, setRelease] = useState<Track | null>(null);
  const [event, setEvent] = useState<{ item: EventItem; isUpcoming: boolean } | null>(null);
  const [bio, setBio] = useState<BiographyContent | null>(null);

  useEffect(() => {
    api
      .contact()
      .then(setContact)
      .catch(() => setContact(null));

    api
      .releases()
      .then((items) => setRelease(items[0] ?? null))
      .catch(() => setRelease(null));

    api
      .events()
      .then((items) => {
        const now = new Date();
        const upcoming = items
          .map((item) => ({ item, date: parseEventDate(item.date) }))
          .filter((e): e is { item: EventItem; date: Date } => e.date !== null && e.date >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

        if (upcoming) {
          setEvent({ item: upcoming.item, isUpcoming: true });
        } else if (items[0]) {
          setEvent({ item: items[0], isUpcoming: false });
        } else {
          setEvent(null);
        }
      })
      .catch(() => setEvent(null));
  }, []);
  
  useEffect(() => {
    api
      .biography()
      .then(setBio)
      .catch(() => setBio(null));
  }, []); 

  return (
    <aside className="flex flex-col gap-6">
      {release && (
        <div className="bg-surface rounded-t-lg p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Latest Release</h2>
          <Link to="/releases" className="flex items-center gap-3 group">
            {release.coverImage ? (
              <img
                src={release.coverImage}
                alt={`${release.title} cover art`}
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-md flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: release.accentColor ?? "#1A1714" }}
              >
                <img src="/logo.png" alt="" className="w-8 h-8 opacity-70" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display font-semibold text-cream truncate group-hover:text-accent transition-colors">
                {release.title}
              </p>
              <p className="text-xs text-muted">{release.releaseDate}</p>
            </div>
          </Link>
        </div>
      )}

      {event && (
        <div className="bg-surface rounded-t-lg p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
            {event.isUpcoming ? "Next Event" : "Latest Event"}
          </h2>
          <Link to="/events" className="block group">
            <p className="font-display font-semibold text-cream group-hover:text-accent transition-colors">
              {event.item.title}
            </p>
            <p className="text-sm text-muted mt-1">
              {event.item.date} · {event.item.venue}, {event.item.city}
            </p>
          </Link>
        </div>
      )}

      {contact && (
        <div className="bg-surface rounded-t-lg p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Follow</h2>
          <div className="flex flex-col gap-2">
            {contact.socials.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted hover:text-accent transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {contact && (
        <div className="bg-surface rounded-t-lg p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Audio sites</h2>
          <div className="flex flex-col gap-2">
            {contact.audio.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted hover:text-accent transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
