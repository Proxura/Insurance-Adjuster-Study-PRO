import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI tutor not configured" },
      { status: 500 }
    );
  }

  try {
    const { question, userAnswer, correctAnswer, explanation, mode = "explain" } =
      await request.json();

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "explain") {
      systemPrompt =
        "You are an expert insurance exam tutor. Explain concepts clearly and concisely. Use simple language and real-world examples. Keep responses under 200 words.";
      userPrompt = `The student answered a question incorrectly on their Michigan Insurance Adjuster exam prep.

Question: ${question}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}
Textbook explanation: ${explanation}

Please explain WHY the correct answer is right and WHY their answer was wrong. Use a real-world example if helpful.`;
    } else {
      // "elaborate" mode — elaborative interrogation
      systemPrompt =
        "You are a Socratic insurance exam tutor. Ask probing questions to deepen understanding. Keep responses under 150 words.";
      userPrompt = `The student just answered a question correctly. Help them understand it deeper.

Question: ${question}
Correct answer: ${correctAnswer}

Ask them "WHY is this true?" and provide a brief explanation that connects this to broader insurance concepts.`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "Unable to generate explanation.";

    return NextResponse.json({ explanation: text });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
