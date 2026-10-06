import type { EventItem } from "@shared/schema";

export default function EventCard({ event }: { event: EventItem }) {
  const parsed = new Date(event.date);
  const hasValidDate = !Number.isNaN(parsed.getTime());
  const day = hasValidDate ? parsed.toLocaleDateString(undefined, { day: "2-digit" }) : "";
  const month = hasValidDate ? parsed.toLocaleDateString(undefined, { month: "short" }) : event.date;

  return (
    <article className="bg-surface rounded-t-lg p-5 flex items-center gap-5">
      <div className="flex flex-col items-center justify-center bg-forest/15 text-forest rounded-md w-16 h-16 flex-shrink-0">
        <span className="text-lg font-bold leading-none">{day}</span>
        <span className="text-xs uppercase font-semibold mt-1">{month}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg font-semibold text-cream">{event.title}</h3>
        <p className="text-sm text-muted">
          {event.venue} — {event.city}
        </p>
        {event.detail && <p className="text-xs text-muted/80 mt-1">{event.detail}</p>}
      </div>

      {event.ticketUrl && (
        <a
          href={event.ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-accent text-ink hover:bg-accent-dark transition-colors flex-shrink-0"
        >
          Tickets
        </a>
      )}
    </article>
  );
}
