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
