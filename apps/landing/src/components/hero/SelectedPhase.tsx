import { useState, useEffect } from "react";
import type { CardChoice } from "./types";
import { CARD_RESULTS } from "./types";

interface SelectedPhaseProps {
  choice: CardChoice;
  onComplete: () => void;
}

export default function SelectedPhase({
  choice,
  onComplete,
}: SelectedPhaseProps) {
  const [show, setShow] = useState(false);
  const result = CARD_RESULTS[choice];

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 100);
    const t2 = setTimeout(onComplete, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div
      className={`text-center transition-all duration-700 ${
        show ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      <div
        className={`inline-block relative p-6 md:p-10 bg-bg/60 ${result.glowClass}`}
      >
        {/* HUD 코너 브라켓 */}
        <span
          className="absolute top-0 left-0 w-4 h-4 md:w-5 md:h-5"
          style={{
            borderTop: `1px solid var(${result.bracketColor})`,
            borderLeft: `1px solid var(${result.bracketColor})`,
          }}
        />
        <span
          className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5"
          style={{
            borderTop: `1px solid var(${result.bracketColor})`,
            borderRight: `1px solid var(${result.bracketColor})`,
          }}
        />
        <span
          className="absolute bottom-0 left-0 w-4 h-4 md:w-5 md:h-5"
          style={{
            borderBottom: `1px solid var(${result.bracketColor})`,
            borderLeft: `1px solid var(${result.bracketColor})`,
          }}
        />
        <span
          className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5"
          style={{
            borderBottom: `1px solid var(${result.bracketColor})`,
            borderRight: `1px solid var(${result.bracketColor})`,
          }}
        />

        <p className="hud-label mb-3">RESONANCE MEASUREMENT COMPLETE</p>
        <p
          className={`text-2xl md:text-4xl font-bold ${result.colorClass} mb-2`}
          style={{ animation: "number-glitch 4s infinite" }}
        >
          RESONANCE: {result.syncRate}
        </p>
        <p className={`text-base md:text-lg ${result.colorClass}`}>
          — {result.label}
        </p>
      </div>

      <div className="mt-8 md:mt-12 scroll-arrow">
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
        {/* <p className="text-text/30 text-xs mt-2 font-mono">스크롤</p> */}
      </div>
    </div>
  );
}
