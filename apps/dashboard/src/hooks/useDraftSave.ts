"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { EMPTY_DRAFT, type CharacterDraft } from "@/components/character-create/types";

export const STORAGE_KEY = "solaris:character-draft";
const DEBOUNCE_MS = 500;

function isDraftEmpty(draft: CharacterDraft): boolean {
  return JSON.stringify(draft) === JSON.stringify(EMPTY_DRAFT);
}

function loadDraft(): CharacterDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CharacterDraft;
  } catch {
    return null;
  }
}

export function useDraftSave(draft: CharacterDraft) {
  const [isSaved, setIsSaved] = useState(false);
  const [restored] = useState<CharacterDraft | null>(() => loadDraft());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 디바운스 저장
  useEffect(() => {
    if (isDraftEmpty(draft)) return;

    timerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setIsSaved(true);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft]);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsSaved(false);
  }, []);

  return { isSaved, restored, clear };
}
