import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EMPTY_DRAFT, type CharacterDraft } from "@/components/character-create/types";

// useDraftSave를 아직 구현하지 않았으므로 임포트만 선언
import { STORAGE_KEY, useDraftSave } from "../useDraftSave";

const SAMPLE_DRAFT: CharacterDraft = {
  ...EMPTY_DRAFT,
  faction: "bureau",
  abilityClass: "field",
  abilityName: "테스트 능력",
};

describe("useDraftSave", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("localStorage에 draft를 저장한다", () => {
    const { result } = renderHook(() => useDraftSave(SAMPLE_DRAFT));

    // 디바운스 대기
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.faction).toBe("bureau");
    expect(stored.abilityName).toBe("테스트 능력");
    expect(result.current.isSaved).toBe(true);
  });

  it("500ms 디바운스로 저장한다", () => {
    renderHook(() => useDraftSave(SAMPLE_DRAFT));

    // 499ms에는 아직 저장 안 됨
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // 500ms에 저장됨
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("localStorage에서 draft를 복원한다", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DRAFT));

    const { result } = renderHook(() => useDraftSave(EMPTY_DRAFT));

    expect(result.current.restored).toEqual(SAMPLE_DRAFT);
  });

  it("저장된 draft가 없으면 restored는 null이다", () => {
    const { result } = renderHook(() => useDraftSave(EMPTY_DRAFT));

    expect(result.current.restored).toBeNull();
  });

  it("localStorage를 사용할 수 없는 환경에서도 안전하게 동작한다", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(() => renderHook(() => useDraftSave(EMPTY_DRAFT))).not.toThrow();
  });

  it("손상된 localStorage 데이터는 무시하고 삭제한다", () => {
    localStorage.setItem(STORAGE_KEY, "{invalid-json");

    const { result } = renderHook(() => useDraftSave(EMPTY_DRAFT));

    expect(result.current.restored).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clear 호출 시 localStorage를 비운다", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DRAFT));

    const { result } = renderHook(() => useDraftSave(EMPTY_DRAFT));

    act(() => {
      result.current.clear();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("EMPTY_DRAFT는 저장하지 않는다", () => {
    renderHook(() => useDraftSave(EMPTY_DRAFT));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("draft 변경 시 디바운스를 리셋한다", () => {
    const { rerender } = renderHook(
      ({ draft }) => useDraftSave(draft),
      { initialProps: { draft: SAMPLE_DRAFT } },
    );

    // 400ms 진행
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // draft 변경 → 디바운스 리셋
    const updatedDraft = { ...SAMPLE_DRAFT, abilityName: "변경된 능력" };
    rerender({ draft: updatedDraft });

    // 400ms 더 지남 (총 800ms) — 아직 저장 안 됨 (리셋 후 400ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // 100ms 더 지남 (리셋 후 500ms) — 저장됨
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.abilityName).toBe("변경된 능력");
  });

  it("draft가 변경되면 다음 저장 전까지 isSaved는 false다", () => {
    const { result, rerender } = renderHook(
      ({ draft }) => useDraftSave(draft),
      { initialProps: { draft: SAMPLE_DRAFT } },
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isSaved).toBe(true);

    const updatedDraft = { ...SAMPLE_DRAFT, name: "새 이름" };
    rerender({ draft: updatedDraft });
    expect(result.current.isSaved).toBe(false);
  });
});
