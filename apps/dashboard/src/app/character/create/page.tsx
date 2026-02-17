"use client";

import Link from "next/link";

import { WizardShell } from "@/components/character-create";

export default function CharacterCreatePage() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* 뒤로가기 */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
        >
          &larr; 돌아가기
        </Link>
      </div>

      <WizardShell />
    </div>
  );
}
