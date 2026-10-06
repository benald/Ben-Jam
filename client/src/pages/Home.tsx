import { Link } from "react-router-dom";

const shortcuts = [
  { to: "/mixes", label: "Latest Mixes" },
  { to: "/releases", label: "Latest Releases" },
  { to: "/events", label: "Upcoming Events" },
];

export default function Home() {
  return (
    <section className="flex flex-col items-center text-center gap-6 py-12">
      <img src="/logo.png" alt="Ben Jam logo" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-lg object-cover" />
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream">Ben Jam</h1>
      <p className="text-muted max-w-xl">
        DJ, producer and Brain Kat Records label owner. Explore the discography, catch the latest mixes, and find out
        where to hear it live next.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        {shortcuts.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="px-5 py-2.5 rounded-full bg-accent text-ink font-semibold text-sm uppercase tracking-wide hover:bg-accent-dark transition-colors"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
