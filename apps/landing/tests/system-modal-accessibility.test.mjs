import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentsDir = path.resolve(__dirname, "../src/components");

function readComponent(name) {
  return fs.readFileSync(path.join(componentsDir, name), "utf8");
}

test("SystemModal has dialog semantics and keyboard focus target", () => {
  const source = readComponent("SystemModal.tsx");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /tabIndex=\{-1\}/);
});

test("System cards use button semantics for keyboard interaction", () => {
  const source = readComponent("System.tsx");

  assert.match(source, /<button/);
  assert.match(source, /type="button"/);
});

test("Ability cards expose expanded state on button", () => {
  const source = readComponent("AbilitySystem.tsx");

  assert.match(source, /<button/);
  assert.match(source, /aria-expanded=\{isExpanded\}/);
});
