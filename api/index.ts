// Vercel serverless entrypoint. vercel.json rewrites every /api/* request to
// this function; the Express app itself (shared with server.ts for local
// dev) still does the actual path-based routing internally.
import { app } from "../src/server/app";

export default app;
