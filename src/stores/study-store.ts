import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProgress,
  TopicPerformance,
  QuizResult,
} from "@/types/content";

interface StudyState {
  // Active module
  activeModuleId: string;
  setActiveModule: (moduleId: string) => void;

  // Progress per module
  progress: Record<string, UserProgress>;
  getProgress: (moduleId: string) => UserProgress;
  updateTopicPerformance: (
    moduleId: string,
    topicId: string,
    correct: boolean
  ) => void;
  markCardMastered: (moduleId: string, cardId: string) => void;
  markCardWeak: (moduleId: string, cardId: string) => void;

  // Quiz results
  quizResults: QuizResult[];
  addQuizResult: (result: QuizResult) => void;

  // Study timer
  sessionStartTime: number | null;
  startSession: () => void;
  addStudyTime: (moduleId: string, ms: number) => void;

  // Streak
  updateStreak: (moduleId: string) => void;

  // Exam date
  setExamDate: (moduleId: string, date: string | null) => void;
}

const defaultProgress: UserProgress = {
  examModuleId: "",
  masteredCardIds: [],
  weakCardIds: [],
  performanceByTopic: {},
  totalStudyMs: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  examDate: null,
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      activeModuleId: "michigan-adjuster-16-72",
      setActiveModule: (moduleId) => set({ activeModuleId: moduleId }),

      progress: {},
      getProgress: (moduleId) => {
        const p = get().progress[moduleId];
        return p ?? { ...defaultProgress, examModuleId: moduleId };
      },

      updateTopicPerformance: (moduleId, topicId, correct) =>
        set((state) => {
          const progress = state.progress[moduleId] ?? {
            ...defaultProgress,
            examModuleId: moduleId,
          };
          const existing: TopicPerformance = progress.performanceByTopic[
            topicId
          ] ?? { correct: 0, total: 0, lastAttempted: null };

          return {
            progress: {
              ...state.progress,
              [moduleId]: {
                ...progress,
                performanceByTopic: {
                  ...progress.performanceByTopic,
                  [topicId]: {
                    correct: existing.correct + (correct ? 1 : 0),
                    total: existing.total + 1,
                    lastAttempted: new Date().toISOString(),
                  },
                },
              },
            },
          };
        }),

      markCardMastered: (moduleId, cardId) =>
        set((state) => {
          const progress = state.progress[moduleId] ?? {
            ...defaultProgress,
            examModuleId: moduleId,
          };
          if (progress.masteredCardIds.includes(cardId)) return state;
          return {
            progress: {
              ...state.progress,
              [moduleId]: {
                ...progress,
                masteredCardIds: [...progress.masteredCardIds, cardId],
                weakCardIds: progress.weakCardIds.filter((id) => id !== cardId),
              },
            },
          };
        }),

      markCardWeak: (moduleId, cardId) =>
        set((state) => {
          const progress = state.progress[moduleId] ?? {
            ...defaultProgress,
            examModuleId: moduleId,
          };
          if (progress.weakCardIds.includes(cardId)) return state;
          return {
            progress: {
              ...state.progress,
              [moduleId]: {
                ...progress,
                weakCardIds: [...progress.weakCardIds, cardId],
                masteredCardIds: progress.masteredCardIds.filter(
                  (id) => id !== cardId
                ),
              },
            },
          };
        }),

      quizResults: [],
      addQuizResult: (result) =>
        set((state) => ({
          quizResults: [...state.quizResults, result],
        })),

      sessionStartTime: null,
      startSession: () => set({ sessionStartTime: Date.now() }),
      addStudyTime: (moduleId, ms) =>
        set((state) => {
          const progress = state.progress[moduleId] ?? {
            ...defaultProgress,
            examModuleId: moduleId,
          };
          return {
            progress: {
              ...state.progress,
              [moduleId]: {
                ...progress,
                totalStudyMs: progress.totalStudyMs + ms,
              },
            },
          };
        }),

      updateStreak: (moduleId) =>
        set((state) => {
          const progress = state.progress[moduleId] ?? {
            ...defaultProgress,
            examModuleId: moduleId,
          };
          const today = new Date().toISOString().split("T")[0];
          const lastDate = progress.lastStudyDate;

          let newStreak = progress.currentStreak;
          if (lastDate !== today) {
            const yesterday = new Date(Date.now() - 86400000)
              .toISOString()
              .split("T")[0];
            newStreak = lastDate === yesterday ? newStreak + 1 : 1;
          }

          return {
            progress: {
              ...state.progress,
              [moduleId]: {
                ...progress,
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, progress.longestStreak),
                lastStudyDate: today,
              },
            },
          };
        }),

      setExamDate: (moduleId, date) =>
        set((state) => {
          const progress = state.progress[moduleId] ?? {
            ...defaultProgress,
            examModuleId: moduleId,
          };
          return {
            progress: {
              ...state.progress,
              [moduleId]: { ...progress, examDate: date },
            },
          };
        }),
    }),
    { name: "cortex-study-store" }
  )
);
