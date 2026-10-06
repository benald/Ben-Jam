import { useEffect, useState } from "react";
import type { ContactInfo } from "@shared/schema";
import { api } from "../lib/api";

export default function Contact() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .contact()
      .then(setContact)
      .catch(() => setError(true));
  }, []);

  return (
    <section className="max-w-lg">
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">Contact</h1>
        <p className="text-muted mt-2">Bookings, releases & general enquiries.</p>
      </header>

      {error && <p className="text-muted">Couldn't load contact details right now.</p>}
      {!error && contact === null && <p className="text-muted">Loading…</p>}

      {contact && (
        <div className="bg-surface rounded-t-lg p-6 flex flex-col gap-4">
          <a
            href={`mailto:${contact.email}`}
            className="text-accent font-semibold hover:text-accent-dark transition-colors"
          >
            {contact.email}
          </a>

          <div className="flex flex-col gap-2">
            {contact.socials.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-cream transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
