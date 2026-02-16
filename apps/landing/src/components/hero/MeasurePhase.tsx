import { useState, useEffect } from "react";
import { useNumberCounter } from "./useNumberCounter";

interface MeasurePhaseProps {
  onComplete: () => void;
}

const HUD_DATA = [
  { label: "BIO_SCAN", value: "ACTIVE" },
  { label: "NEURAL_LINK", value: "SYNCING" },
  { label: "CORE_AUTH", value: "PENDING" },
  { label: "FREQ", value: "427.3Hz" },
];

type MeasureStep = "scanning" | "paused" | "finalizing" | "done";

export default function MeasurePhase({ onComplete }: MeasurePhaseProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<MeasureStep>("scanning");

  // 1단계: 0→76 카운트
  const { value: syncValue, isComplete: firstCountDone } = useNumberCounter(
    76,
    2200,
    show
  );

  // 3단계: 76→100 카운트 (finalizing 때만)
  const { value: finalValue, isComplete: finalCountDone } = useNumberCounter(
    100,
    800,
    step === "finalizing",
    76
  );

  // 화면에 표시할 숫자
  const displayValue =
    step === "finalizing" || step === "done" ? finalValue : syncValue;

  // 초기 등장
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  // 2단계: 76 도달 → paused
  useEffect(() => {
    if (!firstCountDone || step !== "scanning") return;
    setStep("paused");
  }, [firstCountDone, step]);

  // 2.5단계: paused → 1.2초 후 finalizing
  useEffect(() => {
    if (step !== "paused") return;
    const t = setTimeout(() => setStep("finalizing"), 1200);
    return () => clearTimeout(t);
  }, [step]);

  // 4단계: 100 도달 → done
  useEffect(() => {
    if (!finalCountDone || step !== "finalizing") return;
    setStep("done");
  }, [finalCountDone, step]);

  // 5단계: done → 1초 후 완료
  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(onComplete, 1000);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  const statusText =
    step === "paused"
      ? "신호 분석 중..."
      : step === "finalizing" || step === "done"
        ? "캘리브레이션 완료"
        : "동조율 측정 중...";

  return (
    <div
      className={`flex flex-col items-center gap-6 transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* HUD 스캐너 — 원형 레이더 */}
      <div className="relative w-40 h-40 md:w-56 md:h-56">
        {/* 외곽 링 */}
        <div className="absolute inset-0 rounded-full border border-primary/30 border-breathe" />

        {/* 소나 펄스 링 */}
        <div
          className="absolute inset-0 rounded-full border border-primary/20"
          style={{ animation: "pulse-ring 2s ease-out infinite" }}
        />
        <div
          className="absolute inset-0 rounded-full border border-primary/10"
          style={{ animation: "pulse-ring 2s ease-out 1s infinite" }}
        />

        {/* 내부 점선 링 — 역회전 */}
        <div
          className="absolute inset-4 md:inset-6 rounded-full"
          style={{
            border: "1px dashed color-mix(in oklab, var(--color-primary) 35%, transparent)",
            animation: "radar-sweep 6s linear infinite reverse",
          }}
        />

        {/* 레이더 스윕 — conic-gradient */}
        <div
          className="absolute inset-2 md:inset-3 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(0,212,255,0.25) 340deg, rgba(0,212,255,0.5) 355deg, transparent 360deg)",
            animation: "radar-sweep 3s linear infinite",
          }}
        />

        {/* 중앙 숫자 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-3xl md:text-5xl font-bold text-primary text-glow-cyan transition-all duration-300 ${
              step === "paused" ? "animate-pulse" : ""
            }`}
            style={{ animation: step !== "paused" ? "number-glitch 4s infinite" : undefined }}
          >
            {displayValue}
          </span>
          <span className="hud-label mt-1">SYNC RATE</span>
        </div>

        {/* 십자선 */}
        <div className="absolute top-1/2 left-2 right-2 h-px bg-primary/15" />
        <div className="absolute left-1/2 top-2 bottom-2 w-px bg-primary/15" />
      </div>

      {/* HUD 코너 데이터 */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 md:gap-x-12 md:gap-y-2">
        {HUD_DATA.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="hud-label">{d.label}:</span>
            <span className="font-mono text-xs text-primary/80">{d.value}</span>
          </div>
        ))}
      </div>

      {/* 스캔 상태 텍스트 */}
      <p className="font-mono text-sm text-primary/60 animate-pulse">
        {statusText}
      </p>
    </div>
  );
}
