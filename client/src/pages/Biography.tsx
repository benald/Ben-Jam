import { useEffect, useState } from "react";
import type { BiographyContent } from "@shared/schema";
import { api } from "../lib/api";

export default function Biography() {
  const [bio, setBio] = useState<BiographyContent | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .biography()
      .then(setBio)
      .catch(() => setError(true));
  }, []);

  return (
    <section>
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">Biography</h1>
        <p className="text-muted mt-2">About me</p>
      </header>

      {error && <p className="text-muted">Couldn't load this page right now. Please try again later.</p>}
      {!error && bio === null && <p className="text-muted">Loading…</p>}

      {bio && (
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={bio.portrait.src}
              alt={bio.portrait.alt}
              className="w-full sm:w-56 h-56 object-cover rounded-t-lg flex-shrink-0"
            />
            <p className="text-cream leading-relaxed">{bio.intro}</p>
          </div>

          {bio.sections.map((section) => (
            <div key={section.heading} className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <h2 className="font-display text-xl font-semibold text-cream">{section.heading}</h2>
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-muted leading-relaxed">
                    {paragraph}
                  </p>
                ))}
                <h3>Residencies</h3>
                {section.residencies && section.residencies.length > 0 && (
                  <ul className="text-sm text-muted list-disc list-inside space-y-1">
                    {section.residencies.map((residency) => (
                      <li key={residency}>{residency}</li>
                    ))}
                  </ul>
                )}
                <h3>Events</h3>
                {section.events && section.events.length > 0 && (
                  <ul className="text-sm text-muted list-disc list-inside space-y-1">
                    {section.events.map((event) => (
                      <li key={event}>{event}</li>
                    ))}
                  </ul>
                )}
                <h3>Radio</h3>
                {section.radio && section.radio.length > 0 && (
                  <ul className="text-sm text-muted list-disc list-inside space-y-1">
                    {section.radio.map((radio) => (
                      <li key={radio}>{radio}</li>
                    ))}
                  </ul>
                )}
                <h3>DJs I've worked with</h3>
                {section.djs && section.djs.length > 0 && (
                  <ul className="grid grid-cols-2 row-span-3 text-sm text-muted list-disc list-inside space-y-1">
                    {section.djs.map((dj) => (
                      <li key={dj}>{dj}</li>
                    ))}
                  </ul>
                )}
              </div>
              {section.image && (
                <img
                  src={section.image.src}
                  alt={section.image.alt}
                  className="w-full sm:w-56 h-40 sm:h-auto object-cover rounded-t-lg flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
