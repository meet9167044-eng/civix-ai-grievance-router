// lib/ai/classify.ts — classifies an image, retries once on bad JSON, falls back gracefully

import { analyzeImage, type AnalyzeImageParams } from "./client";
import { ClassificationSchema, buildFallbackClassification, type Classification } from "./schema";

export async function classifyImage(params: AnalyzeImageParams): Promise<Classification> {
  const start = Date.now();

  async function attempt(extra?: string): Promise<Classification | null> {
    try {
      const augmented: AnalyzeImageParams = extra
        ? { ...params, description: params.description + " " + extra }
        : params;
      const raw = await analyzeImage(augmented);
      const parsed = JSON.parse(raw);
      const result = ClassificationSchema.safeParse(parsed);
      if (result.success) return result.data;
      console.info("[classify] Zod validation failed:", result.error.issues);
      return null;
    } catch (err) {
      console.info("[classify] attempt failed:", (err as Error).message);
      return null;
    }
  }

  // First attempt
  let classification = await attempt();

  // Retry once with a hint
  if (!classification) {
    console.info("[classify] Retrying with JSON hint…");
    classification = await attempt("Return valid JSON only.");
  }

  const latency = Date.now() - start;

  if (classification) {
    console.info(
      `[classify] Success — category=${classification.category} severity=${classification.severity} confidence=${classification.confidence} latency=${latency}ms`
    );
    return classification;
  }

  // Fallback
  console.info(`[classify] Using fallback classification latency=${latency}ms`);
  return buildFallbackClassification(params.description);
}
