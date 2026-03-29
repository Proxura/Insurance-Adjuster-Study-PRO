"use client";

import { useStudyStore } from "@/stores/study-store";

export default function Header() {
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
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const studyHours = Math.floor(progress.totalStudyMs / 3600000);
  const studyMinutes = Math.floor((progress.totalStudyMs % 3600000) / 60000);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-linear-to-br from-[#0a1628] to-[#061020]">
      <div className="mx-auto max-w-3xl px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-mono text-[15px] font-bold text-accent-2 tracking-tight">
              CORTEX
            </h1>
            <p className="mt-0.5 text-[11px] text-muted tracking-wide">
              Michigan Series 16-72 — Adjuster Exam
            </p>
          </div>
          <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white">
            PRO
          </span>
        </div>
        <div className="mt-2.5 flex gap-3.5 text-[11px]">
          <span className="font-semibold text-green">
            {accuracy}% accuracy
          </span>
          <span className="text-yellow">
            🔥 {progress.currentStreak} day streak
          </span>
          <span className="text-muted">
            {studyHours}h {studyMinutes}m studied
          </span>
        </div>
      </div>
    </header>
  );
}
