export default async function handler(req: any, res: any) {
  const results: Record<string, string> = {};
  const tryImport = async (label: string, path: string) => {
    try {
      await import(path);
      results[label] = "ok";
    } catch (e: any) {
      results[label] = String(e && e.stack ? e.stack : e);
    }
  };
  await tryImport("express", "express");
  await tryImport("supabase-js", "@supabase/supabase-js");
  await tryImport("google-genai", "@google/genai");
  await tryImport("dotenv", "dotenv");
  await tryImport("data", "../src/data");
  await tryImport("supabaseClient", "../src/server/supabaseClient");
  await tryImport("app", "../src/server/app");
  res.status(200).json(results);
}
