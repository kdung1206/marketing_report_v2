// ---------------------------------------------------------------------------
// Shared Gemini (Google GenAI) client — extracted out of app.ts so other
// server modules (onpageScanner.ts) can call Gemini too without either
// duplicating the init logic (risking two clients configured slightly
// differently) or importing app.ts itself (app.ts imports every *Store.ts/
// *Sync.ts module, so the reverse import would be circular).
// ---------------------------------------------------------------------------
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder value.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API Client:", error);
}

export const isGeminiConfigured = client !== null;
export const geminiClient = client;

// Same model as the existing "Đánh giá AI" weekly-report analysis
// (app.ts's POST /api/analyze) — one place to bump this if it's ever renamed.
export const GEMINI_MODEL = "gemini-3.5-flash";

// Models tried in order when the primary one is overloaded (HTTP 503
// "high demand"/UNAVAILABLE) or rate-limited. An unknown/retired model id just
// fails fast and the next one is tried, so listing a spare here is harmless.
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

function isRetryableGeminiError(err: any): boolean {
  const text = `${err?.status ?? ""} ${err?.code ?? ""} ${err?.message ?? ""}`;
  return /(429|500|503|504)|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|deadline/i.test(text);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// generateContent with retry + model fallback: Gemini's "model is currently
// experiencing high demand" 503s are usually gone within seconds, so retry the
// primary model once or twice with backoff, then fall through to the spares.
// Non-retryable errors (bad key, bad request) are thrown immediately.
export async function generateTextWithRetry(prompt: string): Promise<string> {
  if (!geminiClient) throw new Error("GEMINI_API_KEY chưa được cấu hình.");
  const models = [GEMINI_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await geminiClient.models.generateContent({ model, contents: prompt });
        if (response.text) return response.text;
        lastError = new Error("Gemini không trả về nội dung.");
        break;
      } catch (err: any) {
        lastError = err;
        if (!isRetryableGeminiError(err)) {
          // A retired/unknown model id is a 404 — worth trying the next model;
          // anything else (auth, bad request) won't be fixed by switching.
          if (/404|NOT_FOUND/i.test(`${err?.status ?? ""} ${err?.message ?? ""}`)) break;
          throw err;
        }
        if (attempt === 0) await sleep(1500);
      }
    }
  }
  throw lastError || new Error("Gemini không phản hồi.");
}
