// lib/ai/client.ts — AI provider abstraction (Gemini default, Claude stub)
// All calls happen server-side only. Never expose keys to the browser.

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";

export interface AnalyzeImageParams {
  imageBase64: string;
  mimeType: string;
  description: string;
  lat: number;
  lng: number;
}

async function analyzeWithGemini(params: AnalyzeImageParams): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-exp";

  const res = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.imageBase64,
            },
          },
          {
            text: `Citizen description: ${params.description || "none"}\nCoordinates: ${params.lat}, ${params.lng}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  return res.text ?? "{}";
}

// Claude stub — swap in when AI_PROVIDER=claude
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function analyzeWithClaude(_params: AnalyzeImageParams): Promise<string> {
  throw new Error("Claude provider not yet implemented. Set AI_PROVIDER=gemini.");
}

export async function analyzeImage(params: AnalyzeImageParams): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  if (provider === "claude") {
    return analyzeWithClaude(params);
  }
  return analyzeWithGemini(params);
}
