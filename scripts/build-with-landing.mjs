#!/usr/bin/env node

/**
 * Vercel 통합 빌드 스크립트
 *
 * 1) Astro 랜딩 빌드 (apps/landing)
 * 2) 정적 출력을 대시보드 public/에 복사
 *    - dist/index.html → public/_landing.html
 *    - dist/_astro/    → public/_astro/
 * 3) Next.js 대시보드 빌드
 */

import { execSync } from "node:child_process";
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const LANDING_DIR = resolve(root, "apps/landing");
const DASHBOARD_DIR = resolve(root, "apps/dashboard");
const LANDING_DIST = resolve(LANDING_DIR, "dist");

function run(cmd, cwd = root) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

// 1) Astro 랜딩 빌드
console.log("\n=== [1/3] Astro 랜딩 빌드 ===");
run("pnpm --filter @solaris/landing build");

// 2) 정적 출력 복사
console.log("\n=== [2/3] 랜딩 정적 파일 복사 ===");

const landingHtml = resolve(LANDING_DIST, "index.html");
const astroAssets = resolve(LANDING_DIST, "_astro");

if (!existsSync(landingHtml)) {
  console.error("ERROR: 랜딩 빌드 출력(index.html)을 찾을 수 없습니다.");
  process.exit(1);
}

const destPublic = resolve(DASHBOARD_DIR, "public");
mkdirSync(resolve(destPublic, "_astro"), { recursive: true });

cpSync(landingHtml, resolve(destPublic, "_landing.html"));
console.log("  index.html → public/_landing.html");

if (existsSync(astroAssets)) {
  cpSync(astroAssets, resolve(destPublic, "_astro"), { recursive: true });
  console.log("  _astro/ → public/_astro/");
}

// 3) Next.js 대시보드 빌드
console.log("\n=== [3/3] Next.js 대시보드 빌드 ===");
run("pnpm --filter @solaris/dashboard build");

console.log("\n=== 빌드 완료 ===");
