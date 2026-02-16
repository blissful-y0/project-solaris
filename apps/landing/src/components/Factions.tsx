import { useState, useEffect, useRef } from "react";

interface FactionData {
  id: string;
  name: string;
  englishName: string;
  quote: string;
  description: string[];
  tags: string[];
  tone: "amber" | "magenta";
  heroChoice: string;
}

const FACTIONS: FactionData[] = [
  {
    id: "sdf",
    name: "솔라리스 시민보안국",
    englishName: "SOLARIS BUREAU OF CIVIC SECURITY",
    quote: "의심은 오염이다. 우리는 소독한다.",
    description: [
      "돔이 서던 날부터 있었다. 법 이전에 존재했고, 법보다 먼저 움직인다.\n시민보안국은 묻지 않는다 — 명령한다.",
      "동조율 80 이상. 공명 강화 훈련 이수. 헬리오스가 선택한 자들.\n능력이 깨어난 육체. 흔들리지 않는 정신.",
    ],
    tags: ["질서", "충성", "보호", "동조율 80+"],
    tone: "amber",
    heroChoice: "order",
  },
  {
    id: "resistance",
    name: "더 스태틱",
    englishName: "THE STATIC",
    quote:
      "우리는 태양 아래서 추방당한 자들이다.\n하지만 꿈만은 빼앗기지 않았다.",
    description: [
      "시스템이 잡아내지 못하는 주파수. 감지망 바깥의 잡음.\n동조율이 너무 낮아 쫓겨난 자들, 혹은 너무 많은 걸 알아서 스스로 걸어 나온 자들.",
      "돔 밖은 죽음의 땅이라고 배웠다. 절반은 맞다.\n하지만 그곳에는 도시가 빼앗은 것이 있다 — 밤마다 찾아오는 형체 없는 이미지, 꿈.",
      "처음엔 두렵다. 그 다음엔 그리워진다. 마지막엔 깨닫는다.\n이것이야말로 인간이라는 증거라는 걸.",
    ],
    tags: ["자유", "진실", "꿈", "인간성"],
    tone: "magenta",
    heroChoice: "truth",
  },
];

function FactionAccordion({
  faction,
  isOpen,
  onToggle,
}: {
  faction: FactionData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isAmber = faction.tone === "amber";
  const bracketColor = isAmber ? "--color-secondary" : "--color-accent";
  const titleColor = isAmber
    ? "text-secondary text-glow-amber"
    : "text-accent text-glow-magenta";
  const tagBg = isAmber
    ? "bg-secondary/10 text-secondary"
    : "bg-accent/10 text-accent";
  const glowClass = isAmber ? "glow-amber" : "glow-magenta";
  const chevronColor = isAmber ? "text-secondary" : "text-accent";

  return (
    <div
      ref={ref}
      className={`relative bg-bg/60 transition-all duration-500 p-7 md:p-10
        ${isOpen ? glowClass : ""}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {/* HUD 코너 브라켓 */}
      <span
        className="absolute top-0 left-0 w-4 h-4 md:w-5 md:h-5 transition-all duration-500"
        style={{
          borderTop: `1px solid var(${bracketColor})`,
          borderLeft: `1px solid var(${bracketColor})`,
          opacity: isOpen ? 1 : 0.4,
        }}
      />
      <span
        className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 transition-all duration-500"
        style={{
          borderTop: `1px solid var(${bracketColor})`,
          borderRight: `1px solid var(${bracketColor})`,
          opacity: isOpen ? 1 : 0.4,
        }}
      />
      <span
        className="absolute bottom-0 left-0 w-4 h-4 md:w-5 md:h-5 transition-all duration-500"
        style={{
          borderBottom: `1px solid var(${bracketColor})`,
          borderLeft: `1px solid var(${bracketColor})`,
          opacity: isOpen ? 1 : 0.4,
        }}
      />
      <span
        className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 transition-all duration-500"
        style={{
          borderBottom: `1px solid var(${bracketColor})`,
          borderRight: `1px solid var(${bracketColor})`,
          opacity: isOpen ? 1 : 0.4,
        }}
      />

      {/* 헤더 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div>
          <p className="text-[11px] md:text-xs uppercase tracking-[0.2em] font-mono text-text/45 mb-1">
            {faction.englishName}
          </p>
          <h3 className={`text-xl md:text-3xl font-bold ${titleColor}`}>
            {faction.name}
          </h3>
        </div>
        <div
          className={`${chevronColor} transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* 본문 — grid-template-rows 트랜지션 */}
      <div className={`accordion-body ${isOpen ? "open" : ""}`}>
        <div>
          <div className="pt-6 md:pt-8">
            <blockquote className="text-base md:text-xl text-text/85 leading-relaxed italic mb-5 md:mb-6 whitespace-pre-line">
              &ldquo;{faction.quote}&rdquo;
            </blockquote>
            <div className="flex flex-col gap-3 md:gap-4 mb-5 md:mb-8">
              {faction.description.map((text, i) => (
                <p
                  key={i}
                  className="text-sm md:text-base text-text/70 leading-relaxed whitespace-pre-line"
                >
                  {text}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {faction.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 text-xs md:text-sm font-mono ${tagBg}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Factions() {
  const [openState, setOpenState] = useState<Record<string, boolean>>({
    sdf: false,
    resistance: false,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.choice) return;

      if (detail.choice === "order") {
        setOpenState({ sdf: true, resistance: false });
      } else if (detail.choice === "truth") {
        setOpenState({ sdf: false, resistance: true });
      }
    };

    window.addEventListener("solaris:hero-selected", handler);
    return () => window.removeEventListener("solaris:hero-selected", handler);
  }, []);

  const toggle = (id: string) => {
    setOpenState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="section-shell section-divider">
      <div className="section-inner">
        <div className="flex flex-col gap-8 md:gap-12">
          {FACTIONS.map((faction) => (
            <FactionAccordion
              key={faction.id}
              faction={faction}
              isOpen={openState[faction.id] ?? false}
              onToggle={() => toggle(faction.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
