import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../src");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("Hero sets a durable done flag before dispatching events", () => {
  const hero = read("components/hero/Hero.tsx");
  assert.match(hero, /__SOLARIS_HERO_DONE\s*=\s*true/);
});

test("Header checks durable done flag on boot", () => {
  const header = read("components/Header.astro");
  assert.match(header, /window\.__SOLARIS_HERO_DONE/);
  assert.match(header, /localStorage\.getItem\(HERO_STORAGE_KEY\)/);
});

test("Index page unlocks sections when durable done flag exists", () => {
  const index = read("pages/index.astro");
  assert.match(index, /window\.__SOLARIS_HERO_DONE/);
  assert.match(index, /localStorage\.getItem\(HERO_STORAGE_KEY\)/);
});
