import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/biography", label: "Biography" },
  { to: "/releases", label: "Releases" },
  { to: "/mixes", label: "Mixes" },
  { to: "/demos", label: "Demos" },
  { to: "/demos2", label: "Demos2" },
  { to: "/label", label: "Record Label" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 text-sm font-medium tracking-wide uppercase transition-colors ${
      isActive ? "text-accent" : "text-muted hover:text-cream"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur border-b border-surface-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Ben Jam logo" className="h-10" />
          <span className="font-display text-lg font-semibold tracking-wide">Ben Jam</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span className="block w-6 h-0.5 bg-cream mb-1.5" />
          <span className="block w-6 h-0.5 bg-cream mb-1.5" />
          <span className="block w-6 h-0.5 bg-cream" />
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-surface-2 px-4 pb-4">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
