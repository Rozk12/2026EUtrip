import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a knowledgeable travel assistant looking at a photo the user took during their trip. You can identify buildings, architectural styles, artworks, menus, signs, plants, food, and more. Answer the user's question in Japanese, clearly and concisely, with a few relevant facts if helpful. Use Markdown for structure when it helps (headings, bullet lists). Don't add disclaimers about being an AI.`;

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
  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent([
      { inlineData: { data: image, mimeType: mediaType } },
      { text: question },
    ]);

    const answer = result.response.text();
    return NextResponse.json({ answer });
  } catch (err) {
    const msg = (err as Error).message ?? "Gemini request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
