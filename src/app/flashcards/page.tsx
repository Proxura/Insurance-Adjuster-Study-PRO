"use client";

import { useState, useCallback, useMemo } from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MiniPlayer from "@/components/layout/MiniPlayer";
import { useStudyStore } from "@/stores/study-store";
import allFlashcards from "@content/michigan-adjuster-16-72/flashcards/all.json";
import type { Flashcard } from "@/types/content";

const flashcards = allFlashcards as Flashcard[];

export default function FlashcardsPage() {
  const { activeModuleId, getProgress, markCardMastered, markCardWeak, updateTopicPerformance, updateStreak } =
    useStudyStore();
  const progress = getProgress(activeModuleId);

  // Weighted shuffle: weak cards appear more often
  const deck = useMemo(() => {
    const weak = flashcards.filter((c) =>
      progress.weakCardIds.includes(c.id)
    );
    const mastered = flashcards.filter((c) =>
      progress.masteredCardIds.includes(c.id)
    );
    const unseen = flashcards.filter(
      (c) =>
        !progress.weakCardIds.includes(c.id) &&
        !progress.masteredCardIds.includes(c.id)
    );

    // Weight: weak 3x, unseen 2x, mastered 1x
    const weighted = [
      ...weak, ...weak, ...weak,
      ...unseen, ...unseen,
      ...mastered,
    ];

    // Fisher-Yates shuffle
    for (let i = weighted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
    }
    return weighted;
  }, [progress.weakCardIds, progress.masteredCardIds]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = deck[index % deck.length] || flashcards[0];

  const handleKnew = useCallback(() => {
    if (!card) return;
    markCardMastered(activeModuleId, card.id);
    updateTopicPerformance(activeModuleId, card.topicId, true);
    updateStreak(activeModuleId);
    setFlipped(false);
    setIndex((i) => i + 1);
  }, [card, activeModuleId, markCardMastered, updateTopicPerformance, updateStreak]);

  const handleDidntKnow = useCallback(() => {
    if (!card) return;
    markCardWeak(activeModuleId, card.id);
    updateTopicPerformance(activeModuleId, card.topicId, false);
    updateStreak(activeModuleId);
    setFlipped(false);
    setIndex((i) => i + 1);
  }, [card, activeModuleId, markCardWeak, updateTopicPerformance, updateStreak]);

  if (!card) return null;

  const masteredCount = progress.masteredCardIds.length;
  const totalCards = flashcards.length;

  return (
    <>
      <Header />
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-5">
        {/* Progress */}
        <div className="mb-3 flex justify-between text-sm">
          <span className="font-mono text-xs text-muted">
            Card {(index % deck.length) + 1} / {deck.length}
          </span>
          <span className="font-semibold text-green">
            {masteredCount}/{totalCards} mastered
          </span>
        </div>

        {/* Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className={`cursor-pointer select-none rounded-2xl border-2 p-7 transition-all duration-200 ${
            flipped
              ? "border-accent bg-[#0a1628]"
              : "border-border bg-surface hover:border-border-2"
          }`}
          style={{ minHeight: 185 }}
        >
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
            {flipped ? "Answer" : "Question"}
          </div>
          <div
            className={`text-base leading-relaxed ${
              flipped ? "font-semibold text-[#93c5fd]" : ""
            }`}
          >
            {flipped ? card.answer : card.question}
          </div>
          {!flipped && (
            <p className="mt-4 text-xs text-dim">Tap to reveal answer</p>
          )}
        </div>

        {/* Action Buttons */}
        {flipped && (
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <button
              onClick={handleDidntKnow}
              className="rounded-xl border border-red/30 bg-red/10 py-3 text-sm font-semibold text-red transition-colors hover:bg-red/20"
            >
              Didn&apos;t Know
            </button>
            <button
              onClick={handleKnew}
              className="rounded-xl border border-green/30 bg-green/10 py-3 text-sm font-semibold text-green transition-colors hover:bg-green/20"
            >
              Knew It!
            </button>
          </div>
        )}

        {/* Skip */}
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => i + 1);
          }}
          className="mt-3 w-full rounded-lg border border-border bg-bg py-2 text-xs text-muted transition-colors hover:text-text"
        >
          Skip →
        </button>
      </main>
      <MiniPlayer />
    </>
  );
}
