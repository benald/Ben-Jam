import { useState } from "react";
import FeedList from "../components/FeedList";

const TABS = [
  { id: "mixcloud", label: "Mixcloud", endpoint: "/api/mixcloud-archive" },
  { id: "odysee", label: "Odysee", endpoint: "/api/odysee-archive" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Mixes() {
  const [activeTab, setActiveTab] = useState<TabId>("mixcloud");
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <section>
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">Mixes</h1>
        <p className="text-muted mt-2">DJ sets & radio mixes, pulled live from each source.</p>
      </header>

      <div className="flex gap-1 mb-6 bg-surface rounded-t-lg border-b border-surface-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors ${
              activeTab === t.id ? "border-accent text-cream" : "border-transparent text-muted hover:text-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <FeedList key={tab.id} endpoint={tab.endpoint} kind={tab.id} />
    </section>
  );
}
