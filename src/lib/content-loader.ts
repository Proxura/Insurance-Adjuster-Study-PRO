import type {
  ExamModuleMetadata,
  LessonFile,
  Flashcard,
  QuizQuestion,
  GlossaryTerm,
  NumbersReference,
} from "@/types/content";

const CONTENT_BASE = "content";

/**
 * Load exam module metadata from JSON.
 * In production, this would load from database/CDN.
 * For now, it imports directly from the content directory.
 */
export async function loadExamModule(
  moduleId: string
): Promise<ExamModuleMetadata> {
  const data = await import(`@content/${moduleId}/metadata.json`);
  return data.default as ExamModuleMetadata;
}

export async function loadLessons(moduleId: string): Promise<LessonFile[]> {
  const metadata = await loadExamModule(moduleId);
  const lessons: LessonFile[] = [];

  for (const topic of metadata.blueprint) {
    try {
      const data = await import(
        `@content/${moduleId}/lessons/${topic.id}.json`
      );
      lessons.push(data.default as LessonFile);
    } catch {
      // Lesson file not yet created for this topic
    }
  }

  return lessons;
}

export async function loadFlashcards(moduleId: string): Promise<Flashcard[]> {
  const data = await import(`@content/${moduleId}/flashcards/all.json`);
  return data.default as Flashcard[];
}

export async function loadQuizQuestions(
  moduleId: string
): Promise<QuizQuestion[]> {
  const data = await import(`@content/${moduleId}/quiz/question-bank.json`);
  return data.default as QuizQuestion[];
}

export async function loadGlossary(moduleId: string): Promise<GlossaryTerm[]> {
  const data = await import(`@content/${moduleId}/glossary/terms.json`);
  return data.default as GlossaryTerm[];
}

export async function loadNumbers(
  moduleId: string
): Promise<NumbersReference[]> {
  const data = await import(`@content/${moduleId}/numbers/reference.json`);
  return data.default as NumbersReference[];
}
