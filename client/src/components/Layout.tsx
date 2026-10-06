import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const showSidebar = pathname !== "/";
  const contentRef = useRef<HTMLDivElement>(null);
  const [headerOffset, setHeaderOffset] = useState(0);

  // every page's content starts with a `<header className="mb-8">` of varying height (title +
  // optional subtitle). Measure it so the sidebar can start level with the page's actual content
  // (e.g. the release cards) instead of level with the header/title.
  useLayoutEffect(() => {
    if (!showSidebar) return;
    const header = contentRef.current?.querySelector("header");
    if (!header) {
      setHeaderOffset(0);
      return;
    }

    const measure = () => {
      const marginBottom = parseFloat(getComputedStyle(header).marginBottom || "0");
      setHeaderOffset(header.offsetHeight + marginBottom);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [showSidebar, pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ink text-cream">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div ref={contentRef} className="lg:col-span-2 min-w-0">
              {children}
            </div>
            <div
              className="lg:mt-[var(--header-offset)]"
              style={{ "--header-offset": `${headerOffset}px` } as CSSProperties}
            >
              <Sidebar />
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}
