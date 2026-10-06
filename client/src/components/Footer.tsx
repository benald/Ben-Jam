import { useEffect, useState } from "react";
import type { ContactInfo } from "@shared/schema";
import { api } from "../lib/api";

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.contact().then(setContact).catch(() => setContact(null));
  }, []);

  return (
    <footer className="border-t border-surface-2 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>© {new Date().getFullYear()} Ben Jam. All rights reserved.</p>
        {contact && (
          <div className="flex gap-4">
            {contact.socials.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
