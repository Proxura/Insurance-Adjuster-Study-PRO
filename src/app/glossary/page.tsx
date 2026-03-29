"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MiniPlayer from "@/components/layout/MiniPlayer";
import glossaryData from "@content/michigan-adjuster-16-72/glossary/terms.json";
import type { GlossaryTerm } from "@/types/content";

const terms = glossaryData as GlossaryTerm[];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");

  const filtered = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
          Glossary — {terms.length} Terms
        </p>

        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-dim focus:border-accent"
        />

        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.term}
              className="rounded-xl border border-border bg-surface p-3.5"
            >
              <div className="font-mono text-sm font-bold text-accent-2">
                {t.term}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-text/80">
                {t.definition}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              No terms found matching &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </main>
      <MiniPlayer />
    </>
  );
}
