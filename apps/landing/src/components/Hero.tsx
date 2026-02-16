import { useState, useEffect, useCallback } from "react";

// 카드 선택지 타입
type CardChoice = "order" | "truth" | "unknown" | null;

// 카드 선택 결과 구조
interface CardResult {
  syncRate: string;
  label: string;
  colorClass: string;
  glowClass: string;
}

// 각 선택지별 동조율 측정 결과
const CARD_RESULTS: Record<Exclude<CardChoice, null>, CardResult> = {
  order: {
    syncRate: "87%",
    label: "보안국 적합 판정",
    colorClass: "text-secondary",
    glowClass: "glow-amber-strong",
  },
  truth: {
    syncRate: "12%",
    label: "추방 대상",
    colorClass: "text-accent",
    glowClass: "glow-magenta-strong",
  },
  unknown: {
    syncRate: "측정 불가",
    label: "관찰 대상",
    colorClass: "text-text",
    glowClass: "",
  },
};

// 타이핑 애니메이션 훅 — 한 글자씩 순차 출력
function useTypingAnimation(
  lines: string[],
  typingSpeed = 50,
  lineDelay = 1000
) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setIsComplete(true);
      return;
    }

    if (currentChar < lines[currentLine].length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLine] =
            (updated[currentLine] || "") + lines[currentLine][currentChar];
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    // 현재 줄 완료 → 다음 줄로 이동
    const timer = setTimeout(() => {
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
    }, lineDelay);
    return () => clearTimeout(timer);
  }, [currentLine, currentChar, lines, typingSpeed, lineDelay]);

  return { displayedLines, isComplete };
}

export default function Hero() {
  const { displayedLines, isComplete } = useTypingAnimation(
    ["헬리오스 시스템 접속 중...", "동조율 측정을 시작합니다"],
    50,
    1500
  );

  const [selected, setSelected] = useState<CardChoice>(null);
  const [showCards, setShowCards] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 타이핑 완료 후 카드 표시
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => setShowCards(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  // 카드 선택 핸들러
  const handleSelect = useCallback((choice: Exclude<CardChoice, null>) => {
    setSelected(choice);
    setTimeout(() => setShowResult(true), 300);
  }, []);

  const result = selected ? CARD_RESULTS[selected] : null;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* 그리드 라인 배경 강화 */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* 타이핑 영역 */}
      <div className="relative z-10 text-center mb-12">
        {displayedLines.map((line, i) => (
          <div
            key={i}
            className="font-mono text-lg sm:text-xl md:text-2xl text-primary mb-3 text-glow-cyan"
          >
            {line}
            {/* 현재 타이핑 중인 줄에만 커서 표시 */}
            {i === displayedLines.length - 1 && !isComplete && (
              <span
                className="inline-block w-[2px] h-[1em] bg-primary ml-1 align-middle"
                style={{ animation: "blink-caret 1s step-end infinite" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 3개 진영 선택 카드 */}
      {showCards && !selected && (
        <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-4xl px-4">
          {/* 질서 — SDF (앰버) */}
          <button
            onClick={() => handleSelect("order")}
            className="group flex-1 border border-secondary/30 rounded-lg p-6 md:p-8 bg-bg/80 backdrop-blur-sm
                       transition-all duration-500 hover:border-secondary hover:glow-amber-strong
                       opacity-0 animate-[fadeIn_0.6s_ease_forwards]"
          >
            <p className="text-secondary text-lg md:text-xl font-bold mb-2 text-glow-amber">
              "나는 질서를 지킨다"
            </p>
            <p className="text-text/50 text-sm">당신의 선택이 운명을 결정합니다</p>
          </button>

          {/* 진실 — 레지스탕스 (마젠타) */}
          <button
            onClick={() => handleSelect("truth")}
            className="group flex-1 border border-accent/30 rounded-lg p-6 md:p-8 bg-bg/80 backdrop-blur-sm
                       transition-all duration-500 hover:border-accent hover:glow-magenta-strong
                       opacity-0 animate-[fadeIn_0.6s_0.2s_ease_forwards]"
          >
            <p className="text-accent text-lg md:text-xl font-bold mb-2 text-glow-magenta">
              "나는 진실을 찾는다"
            </p>
            <p className="text-text/50 text-sm">당신의 선택이 운명을 결정합니다</p>
          </button>

          {/* 미정 — 관찰 대상 (회색) */}
          <button
            onClick={() => handleSelect("unknown")}
            className="group flex-1 border border-subtle rounded-lg p-6 md:p-8 bg-bg/80 backdrop-blur-sm
                       transition-all duration-500 hover:border-text/50
                       opacity-0 animate-[fadeIn_0.6s_0.4s_ease_forwards]"
          >
            <p className="text-text text-lg md:text-xl font-bold mb-2">
              "나는 아직 모른다"
            </p>
            <p className="text-text/50 text-sm">당신의 선택이 운명을 결정합니다</p>
          </button>
        </div>
      )}

      {/* 동조율 측정 결과 */}
      {showResult && result && (
        <div className="relative z-10 text-center mt-8 animate-[fadeIn_0.8s_ease]">
          <div
            className={`inline-block border rounded-lg p-6 md:p-8 bg-bg/90 backdrop-blur-sm ${
              selected === "order"
                ? "border-secondary/50 glow-amber"
                : selected === "truth"
                  ? "border-accent/50 glow-magenta"
                  : "border-subtle"
            }`}
          >
            <p className="font-mono text-sm text-text/60 mb-2">
              동조율 측정 완료
            </p>
            <p className={`text-2xl md:text-3xl font-bold ${result.colorClass} mb-1`}>
              동조율: {result.syncRate}
            </p>
            <p className={`text-lg ${result.colorClass}`}>
              — {result.label}
            </p>
          </div>

          {/* 스크롤 유도 화살표 */}
          <div className="mt-12 scroll-arrow">
            <svg
              className="w-6 h-6 mx-auto text-text/40"
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
            <p className="text-text/30 text-xs mt-2 font-mono">SCROLL</p>
          </div>
        </div>
      )}
    </section>
  );
}
