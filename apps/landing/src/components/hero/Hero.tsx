import { useState, useCallback, useEffect } from "react";
import type { HeroPhase, CardChoice } from "./types";
import BootPhase from "./BootPhase";
import MeasurePhase from "./MeasurePhase";
import ChoosePhase from "./ChoosePhase";
import SelectedPhase from "./SelectedPhase";
import { resolveHeroSkipMode, HERO_STORAGE_KEY } from "./skipState.js";

type SkipMode = "none" | "dev" | "returning";

export default function Hero() {
  const [skipMode, setSkipMode] = useState<SkipMode>("none");
  const [phase, setPhase] = useState<HeroPhase>("boot");
  const [choice, setChoice] = useState<CardChoice | null>(null);
  const returning = skipMode === "returning";
  const skip = skipMode !== "none";

  // 클라이언트 마운트 후 skip 모드 판정 (SSR 초기 렌더와 일치)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const nextMode = resolveHeroSkipMode({
        search: window.location.search,
        storedTimestamp: localStorage.getItem(HERO_STORAGE_KEY),
      });
      if (nextMode === "none") return;
      setSkipMode(nextMode);
      setChoice("unknown");
      setPhase("done");
    } catch {
      // localStorage 접근 불가 환경에서는 일반 시퀀스를 사용
    }
  }, []);

  // skip 시 즉시 이벤트 발사
  useEffect(() => {
    if (!skip) return;
    window.dispatchEvent(new CustomEvent("solaris:hero-selected", { detail: { choice: "unknown" } }));
    window.dispatchEvent(new CustomEvent("solaris:hero-done"));
    if (returning) {
      window.dispatchEvent(new CustomEvent("solaris:hero-skipped"));
    }
  }, [skip, returning]);

  // 히어로 시퀀스 정상 완료 시 localStorage에 타임스탬프 저장
  useEffect(() => {
    if (phase === "done" && !skip) {
      try {
        localStorage.setItem(HERO_STORAGE_KEY, String(Date.now()));
      } catch { /* localStorage 사용 불가 시 무시 */ }
    }
  }, [phase, skip]);

  const handleBootComplete = useCallback(() => setPhase("measure"), []);
  const handleMeasureComplete = useCallback(() => setPhase("choose"), []);

  const handleSelect = useCallback((c: CardChoice) => {
    setChoice(c);
    setPhase("selected");

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("solaris:hero-selected", { detail: { choice: c } }),
      );
    }
  }, []);

  const handleSelectedComplete = useCallback(() => {
    setPhase("done");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("solaris:hero-done"));
    }
  }, []);

  return (
    <section className="relative min-h-[100svh] md:min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-14 md:py-0 overflow-x-hidden section-divider">
      {/* 그리드 라인 배경 */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.18),transparent_55%)]" />

      {/* 수평 스캔라인 — boot/measure 단계에서만 표시 */}
      {(phase === "boot" || phase === "measure") && (
        <div className="h-scanline" />
      )}

      <div className="relative z-10 w-full flex flex-col items-center">
        {phase === "boot" && <BootPhase onComplete={handleBootComplete} />}

        {phase === "measure" && (
          <MeasurePhase onComplete={handleMeasureComplete} />
        )}

        {phase === "choose" && <ChoosePhase onSelect={handleSelect} />}

        {phase === "selected" && choice && (
          <SelectedPhase choice={choice} onComplete={handleSelectedComplete} />
        )}

        {phase === "done" && (
          <div className="text-center animate-[fadeIn_0.8s_ease]">
            <p className="hud-label mb-2">{returning ? "SYSTEM CONNECTED" : "SYSTEM READY"}</p>
            {!returning && (
              <div className="scroll-arrow mt-4">
                <svg
                  className="w-6 h-6 mx-auto text-primary/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
