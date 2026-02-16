import { useState, useEffect } from "react";
import type { CardChoice } from "./types";

interface ChoosePhaseProps {
  onSelect: (choice: CardChoice) => void;
}

const CARDS: {
  choice: CardChoice;
  text: string;
  sub: string;
  bracketColor: string;
  hoverGlow: string;
  textColor: string;
  textGlow: string;
}[] = [
  {
    choice: "order",
    text: '"나는 질서를 지킨다"',
    sub: "SOLARIS BUREAU OF CIVIC SECURITY",
    bracketColor: "--color-secondary",
    hoverGlow: "hover-glow-amber",
    textColor: "text-secondary",
    textGlow: "text-glow-amber",
  },
  {
    choice: "truth",
    text: '"나는 진실을 추구한다"',
    sub: "THE STATIC",
    bracketColor: "--color-accent",
    hoverGlow: "hover-glow-magenta",
    textColor: "text-accent",
    textGlow: "text-glow-magenta",
  },
];

export default function ChoosePhase({ onSelect }: ChoosePhaseProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-4xl px-2 md:px-0">
      <p className="hud-label text-center mb-6 md:mb-10">
        SELECT YOUR ALLEGIANCE
      </p>

      <div
        className={`flex flex-col md:flex-row gap-4 md:gap-6 transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {CARDS.map((card, i) => (
          <button
            key={card.choice}
            onClick={() => onSelect(card.choice)}
            className={`group flex-1 relative p-7 md:p-10 bg-bg/60
                       min-h-[120px] md:min-h-[168px]
                       transition-all duration-500 ${card.hoverGlow}
                       opacity-0 cursor-pointer`}
            style={{
              animation: show
                ? `fadeIn 0.6s ${i * 0.15}s ease forwards`
                : undefined,
            }}
          >
            {/* HUD 코너 브라켓 */}
            <span
              className="absolute top-0 left-0 w-4 h-4 md:w-5 md:h-5"
              style={{
                borderTop: `1px solid var(${card.bracketColor})`,
                borderLeft: `1px solid var(${card.bracketColor})`,
              }}
            />
            <span
              className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5"
              style={{
                borderTop: `1px solid var(${card.bracketColor})`,
                borderRight: `1px solid var(${card.bracketColor})`,
              }}
            />
            <span
              className="absolute bottom-0 left-0 w-4 h-4 md:w-5 md:h-5"
              style={{
                borderBottom: `1px solid var(${card.bracketColor})`,
                borderLeft: `1px solid var(${card.bracketColor})`,
              }}
            />
            <span
              className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5"
              style={{
                borderBottom: `1px solid var(${card.bracketColor})`,
                borderRight: `1px solid var(${card.bracketColor})`,
              }}
            />

            <p
              className={`${card.textColor} ${card.textGlow} text-base md:text-xl font-bold mb-2`}
            >
              {card.text}
            </p>
            <p className="text-text/50 text-sm">{card.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
