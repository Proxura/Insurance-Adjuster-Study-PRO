"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MiniPlayer from "@/components/layout/MiniPlayer";
import { useAudioStore } from "@/stores/audio-store";
import studyContent from "@content/michigan-adjuster-16-72/lessons/all-lessons.json";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Topic {
  topicId: string;
  topicName: string;
  sections: Section[];
}

const lessons = studyContent as Topic[];

const VOICES = [
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "onyx", label: "Onyx" },
  { value: "fable", label: "Fable" },
];

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function StudyPage() {
  const [selectedTopic, setSelectedTopic] = useState(0);
  const { play, isPlaying, currentTitle, voice, speed, setVoice, setSpeed } =
    useAudioStore();

  const topic = lessons[selectedTopic];

  return (
    <>
      <Header />
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-5">
        {/* Topic Selector */}
        <div className="mb-4">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-8 text-sm text-text outline-none focus:border-accent"
          >
            {lessons.map((t, i) => (
              <option key={t.topicId} value={i}>
                {t.topicName}
              </option>
            ))}
          </select>
        </div>

        {/* Voice & Speed Controls */}
        <div className="mb-5 flex gap-2">
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none"
          >
            {VOICES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-md border px-2 py-1 text-xs font-mono transition-colors ${
                  speed === s
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Sections */}
        {topic && (
          <div className="space-y-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
              {topic.topicName}
            </p>
            {topic.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                  <button
                    onClick={() => play(section.title, section.content)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isPlaying && currentTitle === section.title
                        ? "bg-green text-bg"
                        : "bg-accent/20 text-accent-2 hover:bg-accent/40"
                    }`}
                  >
                    {isPlaying && currentTitle === section.title ? "⏸" : "▶"}
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-text/80">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <MiniPlayer />
    </>
  );
}
