import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Cortex by Proxura — Exam Prep",
  description:
    "AI-powered adaptive learning platform for professional licensing exams. Study smarter with active recall, spaced repetition, and AI tutoring.",
  keywords: [
    "exam prep",
    "insurance adjuster",
    "study guide",
    "flashcards",
    "spaced repetition",
    "AI tutor",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
