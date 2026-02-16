import { useState, useCallback, useEffect } from "react";
import type { HeroPhase, CardChoice } from "./types";
import BootPhase from "./BootPhase";
import MeasurePhase from "./MeasurePhase";
import ChoosePhase from "./ChoosePhase";
import SelectedPhase from "./SelectedPhase";

function useDevSkip() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("skip");
}

const HERO_STORAGE_KEY = "solaris:hero-completed";
const HERO_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function useReturningVisitor(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(HERO_STORAGE_KEY);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    return Date.now() - timestamp < HERO_EXPIRY_MS;
  } catch {
    return false;
  }
}

export default function Hero() {
  const devSkip = useDevSkip();
  const returning = useReturningVisitor();
  const skip = devSkip || returning;
  const [phase, setPhase] = useState<HeroPhase>(skip ? "done" : "boot");
  const [choice, setChoice] = useState<CardChoice | null>(skip ? "unknown" : null);

  // skip 시 즉시 이벤트 발사
  useEffect(() => {
    if (!skip) return;
    window.dispatchEvent(new CustomEvent("solaris:hero-selected", { detail: { choice: "unknown" } }));
    window.dispatchEvent(new CustomEvent("solaris:hero-done"));
    if (returning && !devSkip) {
      window.dispatchEvent(new CustomEvent("solaris:hero-skipped"));
    }
  }, [skip, returning, devSkip]);

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
