import { useEffect, useState } from "react";
import type { EventItem } from "@shared/schema";
import { api } from "../lib/api";
import EventCard from "../components/EventCard";

export default function Events() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .events()
      .then(setEvents)
      .catch(() => setError(true));
  }, []);

  const now = Date.now();
  const upcoming = events?.filter((e) => new Date(e.date).getTime() >= now) ?? [];
  const past = events?.filter((e) => new Date(e.date).getTime() < now) ?? [];

  return (
    <section>
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">Events</h1>
        <p className="text-muted mt-2">Catch a set live.</p>
      </header>

      {error && <p className="text-muted">Couldn't load events right now. Please try again later.</p>}
      {!error && events === null && <p className="text-muted">Loading…</p>}

      {events !== null && (
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="font-display text-xl font-semibold text-cream mb-4">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-muted">No upcoming events announced — check back soon.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-cream mb-4">Past</h2>
              <div className="flex flex-col gap-4 opacity-70">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
