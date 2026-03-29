/** Metadata for an exam module */
export interface ExamModuleMetadata {
  id: string;
  name: string;
  state: string;
  category: string;
  seriesCode: string;
  version: string;
  questionCount: number;
  timeLimit: number; // minutes
  passingScore: number; // percentage
  blueprint: BlueprintTopic[];
}

export interface BlueprintTopic {
  id: string;
  name: string;
  weight: number; // percentage of exam
  lessonCount: number;
  questionCount: number;
}

/** Study guide lesson section */
export interface LessonSection {
  id: string;
  title: string;
  content: string; // prose HTML or markdown
}

export interface LessonFile {
  topicId: string;
  topicName: string;
  sections: LessonSection[];
}

/** Flashcard */
export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  explanation?: string;
}

/** Quiz question */
export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: "easy" | "medium" | "hard";
}

/** Glossary term */
export interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
}

/** Numbers reference item */
export interface NumbersReference {
  label: string;
  value: string;
  category?: string;
  note?: string;
}

/** User progress tracking */
export interface UserProgress {
  examModuleId: string;
  masteredCardIds: string[];
  weakCardIds: string[];
  performanceByTopic: Record<string, TopicPerformance>;
  totalStudyMs: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  examDate: string | null;
}

export interface TopicPerformance {
  correct: number;
  total: number;
  lastAttempted: string | null;
}

/** Quiz result record */
export interface QuizResult {
  id: string;
  examModuleId: string;
  score: number;
  total: number;
  topicId: string | null; // null = mixed
  wrongQuestionIds: string[];
  timestamp: string;
}
