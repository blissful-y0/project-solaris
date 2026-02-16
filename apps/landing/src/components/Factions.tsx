import { useEffect, useRef } from "react";

// 진영 카드 컴포넌트 — 앰버(SDF) 또는 마젠타(레지스탕스) 글로우
function FactionCard({
  faction,
}: {
  faction: {
    name: string;
    englishName: string;
    quote: string;
    tags: string[];
    color: "amber" | "magenta";
  };
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 색상별 스타일 매핑
  const isAmber = faction.color === "amber";
  const borderColor = isAmber ? "border-secondary/30" : "border-accent/30";
  const hoverBorder = isAmber ? "hover:border-secondary" : "hover:border-accent";
  const hoverGlow = isAmber ? "hover-glow-amber" : "hover-glow-magenta";
  const textColor = isAmber ? "text-secondary" : "text-accent";
  const textGlow = isAmber ? "text-glow-amber" : "text-glow-magenta";
  const tagBg = isAmber ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent";
  const tagBorder = isAmber ? "border-secondary/20" : "border-accent/20";

  return (
    <div
      ref={ref}
      className={`reveal group flex-1 border ${borderColor} rounded-lg p-5 md:p-12 bg-bg/80 backdrop-blur-sm
                  transition-all duration-700 ${hoverBorder} ${hoverGlow} cursor-default`}
    >
      {/* 진영 이름 */}
      <h3 className={`text-xl md:text-3xl lg:text-4xl font-bold text-center ${textColor} ${textGlow} mb-2`}>
        {faction.name}
      </h3>
      <p className="text-text/40 text-sm font-mono tracking-widest uppercase text-center mb-6 md:mb-8">
        {faction.englishName}
      </p>

      {/* 대표 문구 */}
      <blockquote className="text-base md:text-xl text-text/80 leading-relaxed text-center mb-6 md:mb-10 italic">
        &ldquo;{faction.quote}&rdquo;
      </blockquote>

      {/* 키워드 태그 */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {faction.tags.map((tag) => (
          <span
            key={tag}
            className={`px-3 py-1 text-sm border ${tagBorder} ${tagBg} rounded-full font-mono`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Factions() {
  return (
    <section className="section-shell section-divider">
      <div className="section-inner">
        {/* 2분할 레이아웃 — 데스크탑 가로, 모바일 세로 */}
        <div className="flex flex-col lg:flex-row gap-5 md:gap-7">
          {/* 태양방위군 (SDF) — 앰버 */}
          <FactionCard
            faction={{
              name: "태양방위군",
              englishName: "Solar Defense Force",
              quote: "우리는 마지막 문명의 수호자다",
              tags: ["질서", "충성", "보호", "동조율 80+"],
              color: "amber",
            }}
          />
          {/* 레지스탕스 — 마젠타 */}
          <FactionCard
            faction={{
              name: "레지스탕스",
              englishName: "The Exiled",
              quote: "우리는 태양 아래서 추방당한 자들이다",
              tags: ["자유", "진실", "꿈", "인간성"],
              color: "magenta",
            }}
          />
        </div>

        {/* 하단 CTA */}
        <div className="text-center mt-14 md:mt-16">
          <p className="text-lg md:text-2xl text-text/70 font-light text-glow-cyan">
            당신의 운명을 선택하시겠습니까?
          </p>
        </div>
      </div>
    </section>
  );
}
