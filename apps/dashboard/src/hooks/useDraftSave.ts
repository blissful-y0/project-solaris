"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { EMPTY_DRAFT, type CharacterDraft } from "@/components/character-create/types";

export const STORAGE_KEY = "solaris:character-draft";
const DEBOUNCE_MS = 1500;

export type SaveStatus = "idle" | "saving" | "saved";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isDraftEmpty(draft: CharacterDraft): boolean {
  return JSON.stringify(draft) === JSON.stringify(EMPTY_DRAFT);
}

function loadDraft(): CharacterDraft | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    return { ...EMPTY_DRAFT, ...parsed } as CharacterDraft;
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useDraftSave(draft: CharacterDraft) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [restored] = useState<CharacterDraft | null>(() => loadDraft());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 디바운스 저장
  useEffect(() => {
    if (isDraftEmpty(draft)) return;
    const storage = getStorage();
    if (!storage) return;

    // 저장 대기 중 → saving 표시
    setSaveStatus("saving");
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      storage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaveStatus("saved");

      // 2초 후 idle로 복귀
      fadeTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draft]);

  const clear = useCallback(() => {
    const storage = getStorage();
    storage?.removeItem(STORAGE_KEY);
    setSaveStatus("idle");
  }, []);

  return { saveStatus, restored, clear };
}
