import { useState, useEffect } from "react";
import { useTypingAnimation } from "./useTypingAnimation";

interface BootPhaseProps {
  onComplete: () => void;
}

const BOOT_LINES = ["헬리오스 시스템 접속 중..."];

export default function BootPhase({ onComplete }: BootPhaseProps) {
  const { displayedLines, isComplete } = useTypingAnimation(
    BOOT_LINES,
    55,
    1500
  );
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!isComplete) return;
    // 타이핑 끝 → 잠시 대기 → 글리치 퇴장 → 다음
    const t1 = setTimeout(() => setExiting(true), 800);
    const t2 = setTimeout(onComplete, 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isComplete, onComplete]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 md:gap-10 transition-all duration-500 ${
        exiting ? "opacity-0 scale-95 blur-sm" : "opacity-100"
      }`}
    >
      {/* 상단 HUD 레이블 */}
      <p className="hud-label tracking-[0.3em] animate-pulse">
        HELIOS CORE // RESONANCE CALIBRATION
      </p>

      {/* 메인 타이핑 텍스트 — 박스 없이 플로팅 */}
      {displayedLines.map((line, i) => (
        <div
          key={i}
          className="font-mono text-xl sm:text-2xl md:text-4xl leading-relaxed text-primary text-glow-cyan text-center"
        >
          {line}
          {i === displayedLines.length - 1 && !isComplete && (
            <span
              className="inline-block w-[2px] h-[0.9em] bg-primary ml-1 align-middle"
              style={{ animation: "blink-caret 1s step-end infinite" }}
            />
          )}
        </div>
      ))}

      {/* 하단 장식 — 가느다란 수평선 + 펄스 */}
      <div className="w-32 md:w-48 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
    </div>
  );
}
