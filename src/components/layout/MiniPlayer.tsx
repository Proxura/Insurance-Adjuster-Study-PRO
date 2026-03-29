"use client";

import { useAudioStore } from "@/stores/audio-store";

export default function MiniPlayer() {
  const { isPlaying, currentTitle, progress, toggle, stop } = useAudioStore();

  if (!currentTitle) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentTitle}</p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <button onClick={stop} className="text-muted hover:text-text">
          ✕
        </button>
      </div>
    </div>
  );
}
