import { useEffect, useRef } from "react";

// 게임 시스템 피처 데이터
interface Feature {
  glyph: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    glyph: "GM",
    title: "AI GM 전투 판정",
    description: "서술의 논리가 곧 무기다",
  },
  {
    glyph: "SYNC",
    title: "동조율 & 능력",
    description: "80을 넘는 순간, 인간을 초월한다",
  },
  {
    glyph: "ARC",
    title: "시즌제 스토리",
    description: "당신의 선택이 도시의 운명을 바꾼다",
  },
  {
    glyph: "DREAM",
    title: "꿈의 메카닉",
    description: "추방자만이 꿈을 꾼다",
  },
];

// 피처 카드 — 순차 등장 + 호버 시안 글로우
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), index * 150);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="reveal group border border-subtle rounded-lg p-5 md:p-8 bg-bg/80 backdrop-blur-sm
                 transition-all duration-500 hover:border-primary/50 hover-glow-cyan cursor-default text-center"
    >
      {/* HUD 글리프 */}
      <div className="system-glyph pulse mb-4 md:mb-6 mx-auto">
        {feature.glyph}
      </div>

      {/* 피처 제목 — 시안 글로우 */}
      <h3 className="text-lg md:text-2xl font-bold text-primary text-glow-cyan mb-3">
        {feature.title}
      </h3>

      {/* 피처 설명 */}
      <p className="text-text/70 text-sm md:text-lg">
        {feature.description}
      </p>
    </div>
  );
}

export default function System() {
  return (
    <section className="section-shell section-divider">
      <div className="section-inner">
        {/* 섹션 제목 + 회로 디바이더 */}
        <div className="text-center mb-12 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-text mb-4">
            게임 시스템
          </h2>
          <div className="circuit-divider max-w-md mx-auto" />
        </div>

        {/* 2x2 그리드 — 모바일 1열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
