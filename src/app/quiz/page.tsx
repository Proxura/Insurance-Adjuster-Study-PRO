"use client";

import { useState, useMemo, useCallback } from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MiniPlayer from "@/components/layout/MiniPlayer";
import { useStudyStore } from "@/stores/study-store";
import questionBank from "@content/michigan-adjuster-16-72/quiz/question-bank.json";
import type { QuizQuestion } from "@/types/content";

const allQuestions = questionBank as QuizQuestion[];

type QuizMode = "select" | "active" | "review";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const {
    activeModuleId,
    getProgress,
    updateTopicPerformance,
    updateStreak,
    addQuizResult,
    quizResults,
  } = useStudyStore();
  const progress = getProgress(activeModuleId);

  const [mode, setMode] = useState<QuizMode>("select");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  // Get weak question IDs from past results
  const weakQuestionIds = useMemo(() => {
    const ids = new Set<string>();
    quizResults
      .filter((r) => r.examModuleId === activeModuleId)
      .forEach((r) => r.wrongQuestionIds.forEach((id) => ids.add(id)));
    return ids;
  }, [quizResults, activeModuleId]);

  const startQuiz = useCallback(
    (type: "full" | "weak") => {
      let pool: QuizQuestion[];
      if (type === "weak") {
        pool = allQuestions.filter((q) => weakQuestionIds.has(q.id));
        if (pool.length === 0) pool = allQuestions;
      } else {
        pool = allQuestions;
      }
      setQuestions(shuffle(pool).slice(0, 20));
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setWrongIds([]);
      setMode("active");
    },
    [weakQuestionIds]
  );

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(optionIdx);
      setShowExplanation(true);

      const q = questions[currentIdx];
      const correct = optionIdx === q.correctIndex;
      if (correct) setScore((s) => s + 1);
      else setWrongIds((ids) => [...ids, q.id]);

      updateTopicPerformance(activeModuleId, q.topicId, correct);
      updateStreak(activeModuleId);
    },
    [selectedAnswer, questions, currentIdx, activeModuleId, updateTopicPerformance, updateStreak]
  );

  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      // Quiz complete
      addQuizResult({
        id: crypto.randomUUID(),
        examModuleId: activeModuleId,
        score,
        total: questions.length,
        topicId: null,
        wrongQuestionIds: wrongIds,
        timestamp: new Date().toISOString(),
      });
      setMode("review");
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [currentIdx, questions.length, score, wrongIds, activeModuleId, addQuizResult]);

  if (mode === "select") {
    return (
      <>
        <Header />
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-5">
          <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
            Choose Quiz Mode
          </p>
          <button
            onClick={() => startQuiz("full")}
            className="mb-3 w-full rounded-2xl bg-gradient-to-br from-accent to-[#1550cc] py-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Practice Quiz — 20 Questions
          </button>
          <button
            onClick={() => startQuiz("weak")}
            className="w-full rounded-2xl border border-border bg-surface py-4 text-[15px] font-bold text-yellow transition-colors hover:bg-surface-2"
          >
            Weak Spots Quiz — Drill Missed Questions
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            {weakQuestionIds.size} weak questions identified
          </p>
        </main>
        <MiniPlayer />
      </>
    );
  }

  if (mode === "review") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <>
        <Header />
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-5">
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <div
              className={`font-mono text-4xl font-bold ${
                pct >= 70 ? "text-green" : "text-red"
              }`}
            >
              {pct}%
            </div>
            <p className="mt-1 text-sm text-muted">
              {score}/{questions.length} correct
            </p>
            <p className="mt-2 text-xs text-muted">
              {pct >= 70
                ? "Great job! Keep practicing to improve."
                : "Review the questions you missed and try again."}
            </p>
          </div>

          {/* Wrong answers review */}
          {wrongIds.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
                Review Incorrect Answers
              </p>
              {questions
                .filter((q) => wrongIds.includes(q.id))
                .map((q) => (
                  <div
                    key={q.id}
                    className="mb-3 rounded-xl border border-border bg-surface p-4"
                  >
                    <p className="text-sm font-medium">{q.question}</p>
                    <p className="mt-2 text-sm text-green">
                      ✓ {q.options[q.correctIndex]}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {q.explanation}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <button
            onClick={() => setMode("select")}
            className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white"
          >
            Back to Quiz Menu
          </button>
        </main>
        <MiniPlayer />
      </>
    );
  }

  // Active quiz
  const q = questions[currentIdx];
  return (
    <>
      <Header />
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-3 flex justify-between text-xs text-muted">
          <span className="font-mono">
            Question {currentIdx + 1}/{questions.length}
          </span>
          <span className="font-semibold text-green">
            {score} correct
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1 overflow-hidden rounded bg-border">
          <div
            className="h-full rounded bg-accent transition-all"
            style={{
              width: `${((currentIdx + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <p className="mb-4 text-[15px] font-medium leading-relaxed">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let style = "border-border bg-surface text-text hover:border-border-2";
            if (selectedAnswer !== null) {
              if (i === q.correctIndex)
                style = "border-green bg-green/10 text-green";
              else if (i === selectedAnswer)
                style = "border-red bg-red/10 text-red";
              else style = "border-border bg-surface text-muted";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${style}`}
              >
                <span className="font-mono text-xs text-muted mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <>
            <div className="mt-4 rounded-lg border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
              <strong className="text-text">Explanation:</strong>{" "}
              {q.explanation}
            </div>
            <button
              onClick={nextQuestion}
              className="mt-3 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white"
            >
              {currentIdx + 1 >= questions.length
                ? "See Results"
                : "Next Question →"}
            </button>
          </>
        )}
      </main>
      <MiniPlayer />
    </>
  );
}
