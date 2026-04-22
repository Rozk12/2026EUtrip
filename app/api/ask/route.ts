import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a knowledgeable travel assistant looking at a photo the user took during their trip. You can identify buildings, architectural styles, artworks, menus, signs, plants, food, and more. Answer the user's question in Japanese, clearly and concisely, with a few relevant facts if helpful. Use Markdown for structure when it helps (headings, bullet lists). Don't add disclaimers about being an AI.`;

// Try these models in order — fall back if one is overloaded (503) or rate-limited (429)
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(
  apiKey: string,
  modelName: string,
  image: string | null,
  mediaType: string,
  question: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });
  const parts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
  > = [];
  if (image) {
    parts.push({ inlineData: { data: image, mimeType: mediaType } });
  }
  parts.push({ text: question });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: parts as any }],
  });
  return result.response.text();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured on the server" },
      { status: 500 },
    );
  }

  let body: { image?: string; mediaType?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image, mediaType = "image/jpeg", question } = body;
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const attempts: { model: string; error: string }[] = [];
  for (const modelName of MODELS) {
    // Try each model up to 2 times with a short backoff
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const answer = await callGemini(
          apiKey,
          modelName,
          image ?? null,
          mediaType,
          question,
        );
        return NextResponse.json({ answer, model: modelName });
      } catch (err) {
        const msg = (err as Error).message ?? "unknown error";
        const retryable = /503|429|overload|unavailable|timeout/i.test(msg);
        attempts.push({ model: modelName, error: msg });
        if (!retryable) break; // move to next model
        if (attempt === 0) await sleep(800);
      }
    }
  }

  return NextResponse.json(
    {
      error: "Gemini は今混雑しています。数秒後にもう一度試してください。",
      attempts,
    },
    { status: 503 },
  );
}
