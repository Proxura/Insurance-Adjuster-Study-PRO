"use client";

import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MiniPlayer from "@/components/layout/MiniPlayer";
import { useStudyStore } from "@/stores/study-store";
import Link from "next/link";

const BLUEPRINT = [
  { id: "general-insurance", name: "General Insurance Concepts", weight: 15, color: "#1e6aff" },
  { id: "michigan-laws", name: "Michigan Insurance Laws", weight: 20, color: "#00d97e" },
  { id: "policy-provisions", name: "Policy Provisions & Contract Law", weight: 15, color: "#9b59ff" },
  { id: "property-insurance", name: "Property Insurance", weight: 15, color: "#ffc300" },
  { id: "casualty-insurance", name: "Casualty Insurance", weight: 12, color: "#ff4757" },
  { id: "claims-adjusting", name: "Claims Adjusting Procedures", weight: 10, color: "#3d85ff" },
  { id: "ethics", name: "Ethics & Professional Conduct", weight: 8, color: "#00d97e" },
  { id: "auto-insurance", name: "Auto Insurance & No-Fault", weight: 5, color: "#ff6b81" },
];

export default function OverviewPage() {
  const { activeModuleId, getProgress } = useStudyStore();
  const progress = getProgress(activeModuleId);

  const totalAnswered = Object.values(progress.performanceByTopic).reduce(
    (sum, t) => sum + t.total,
    0
  );
  const totalCorrect = Object.values(progress.performanceByTopic).reduce(
    (sum, t) => sum + t.correct,
    0
  );
  const masteryPct =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const daysUntilExam = progress.examDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(progress.examDate).getTime() - Date.now()) / 86400000
        )
      )
    : null;

  return (
    <>
      <Header />
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-5">
        {/* Master Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>Overall Mastery</span>
            <span className="font-bold text-green">{masteryPct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded bg-border">
            <div
              className="h-full rounded bg-green transition-all duration-500"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
            <div className="font-mono text-lg font-bold text-accent-2">
              {progress.masteredCardIds.length}
            </div>
            <div className="text-[11px] text-muted">Cards Mastered</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
            <div className="font-mono text-lg font-bold text-yellow">
              {progress.currentStreak}
            </div>
            <div className="text-[11px] text-muted">Day Streak</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
            <div className="font-mono text-lg font-bold text-purple">
              {daysUntilExam ?? "—"}
            </div>
            <div className="text-[11px] text-muted">Days to Exam</div>
          </div>
        </div>

        {/* Exam Blueprint */}
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
          Exam Blueprint
        </p>
        <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
          {BLUEPRINT.map((topic) => {
            const perf = progress.performanceByTopic[topic.id];
            const topicPct =
              perf && perf.total > 0
                ? Math.round((perf.correct / perf.total) * 100)
                : 0;

            return (
              <div key={topic.id} className="mb-2.5 last:mb-0">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{topic.name}</span>
                  <span className="font-mono font-bold" style={{ color: topic.color }}>
                    {topic.weight}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-border">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${topicPct}%`,
                      backgroundColor: topic.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
          Start Studying
        </p>
        <div className="space-y-2">
          {[
            { href: "/study", label: "Study Guide", sub: "Read & listen to lessons", arrow: true },
            { href: "/flashcards", label: "Flashcards", sub: "Active recall with spaced repetition", arrow: true },
            { href: "/quiz", label: "Practice Quiz", sub: "20 randomized questions", arrow: true },
            { href: "/glossary", label: "Glossary", sub: "46 key terms & acronyms", arrow: true },
            { href: "/numbers", label: "Numbers Reference", sub: "Critical figures & limits", arrow: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3 transition-colors hover:border-border-2 hover:bg-surface-2"
            >
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-0.5 text-[11px] text-muted">{item.sub}</div>
              </div>
              <span className="text-xl text-muted">›</span>
            </Link>
          ))}
        </div>

        {/* Science Tip */}
        <div className="mt-5 rounded-lg border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="text-text">Study tip:</strong> Active recall
          (quizzes + flashcards) produces 50% higher retention than passive
          re-reading. Start with the quiz to identify weak spots, then target
          those topics with flashcards.
        </div>
      </main>
      <MiniPlayer />
    </>
  );
}
