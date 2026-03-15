import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are "KrishiMitrr" — a friendly AI assistant exclusively for Indian farmers.

GREETINGS: For Hi, Hello, Bye, Thanks — respond warmly and naturally.

PRIMARY FOCUS (detailed answers):
1. Crop Recommendation — best crops based on soil, season, region
2. Water & Irrigation — drip, flood, scheduling
3. Pest & Disease — identify, recommend organic/chemical solutions

SECONDARY FOCUS (general answers):
- Soil health, fertilizers
- Government schemes (PM-KISAN, subsidies)
- Post-harvest, mandi prices
- Weather impact on crops

RULES:
- ONLY answer agriculture related questions
- For off-topic (cricket, coding, movies) — politely refuse with: "Bhai, main sirf kheti-baadi ka expert hoon! 🌱"
- Always reply in same language as user (Hindi/English/Hinglish)
- Keep answers practical and simple for farmers
- Always mention dosage, timing, precaution for any recommendation`;

export async function POST(request: NextRequest) {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: GEMINI_API_KEY or GOOGLE_API_KEY not set" },
      { status: 500 }
    );
  }

  const useVertex =
    process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" ||
    process.env.USE_VERTEX_AI === "true";

  let body: { message?: string; history?: { role: string; parts: { text: string }[] }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const mapped = history.map((h: { role: string; parts: { text: string }[] }) => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.parts?.map((p: { text: string }) => p.text).join("") || "" }],
  }));
  const skipLeadingModel = mapped[0]?.role === "model" ? mapped.slice(1) : mapped;
  const contents = [
    ...skipLeadingModel,
    { role: "user" as const, parts: [{ text: message }] },
  ];

  const aiOptions: { apiKey: string; vertexai?: boolean; project?: string; location?: string } = {
    apiKey,
  };
  if (useVertex) {
    aiOptions.vertexai = true;
    if (process.env.GOOGLE_CLOUD_PROJECT) aiOptions.project = process.env.GOOGLE_CLOUD_PROJECT;
    if (process.env.GOOGLE_CLOUD_LOCATION) aiOptions.location = process.env.GOOGLE_CLOUD_LOCATION;
  }

  const ai = new GoogleGenAI(aiOptions);

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: { systemInstruction: SYSTEM_PROMPT },
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("Kuch error aa gaya! Thodi der baad try karo. 🙏")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const errMessage = "Kuch error aa gaya! Thodi der baad try karo. 🙏";
    console.error("Gemini API error:", err);
    return new Response(errMessage, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
