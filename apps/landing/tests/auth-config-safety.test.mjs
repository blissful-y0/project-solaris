import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

function readSource(relativePath) {
  return fs.readFileSync(path.join(srcDir, relativePath), "utf8");
}

test("Supabase client creation is guarded by env checks", () => {
  const source = readSource("lib/supabase.ts");

  assert.match(source, /const hasSupabaseEnv =/);
  assert.match(source, /export const supabase = hasSupabaseEnv[\s\S]*\? createClient/);
});

test("Header hydrates AuthButton lazily with client:idle", () => {
  const source = readSource("components/Header.astro");

  assert.match(source, /<AuthButton client:idle \/>/);
});
