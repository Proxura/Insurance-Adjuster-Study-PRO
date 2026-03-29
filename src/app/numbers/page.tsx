"use client";

import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MiniPlayer from "@/components/layout/MiniPlayer";
import numbersData from "@content/michigan-adjuster-16-72/numbers/reference.json";
import type { NumbersReference } from "@/types/content";

const numbers = numbersData as NumbersReference[];

// Group by category
const grouped = numbers.reduce(
  (acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  },
  {} as Record<string, NumbersReference[]>
);

export default function NumbersPage() {
  return (
    <>
      <Header />
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
          Numbers Reference — Michigan
        </p>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-2">
              {category}
            </p>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              {items.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="text-sm">{item.label}</div>
                  <div className="font-mono text-sm font-bold text-green">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      <MiniPlayer />
    </>
  );
}
