import { useEffect, useRef } from "react";

// 게임 시스템 피처 데이터
interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "⚔️",
    title: "AI GM 전투 판정",
    description: "서술의 논리가 곧 무기다",
  },
  {
    icon: "⚡",
    title: "동조율 & 능력",
    description: "80을 넘는 순간, 인간을 초월한다",
  },
  {
    icon: "📖",
    title: "시즌제 스토리",
    description: "당신의 선택이 도시의 운명을 바꾼다",
  },
  {
    icon: "🌙",
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
      className="reveal group border border-subtle rounded-lg p-6 md:p-8 bg-bg/80 backdrop-blur-sm
                 transition-all duration-500 hover:border-primary/50 hover:glow-cyan cursor-default"
    >
      {/* 아이콘 — 펄스 애니메이션 */}
      <div className="text-4xl md:text-5xl mb-4 md:mb-6 pulse">
        {feature.icon}
      </div>

      {/* 피처 제목 — 시안 글로우 */}
      <h3 className="text-xl md:text-2xl font-bold text-primary text-glow-cyan mb-3">
        {feature.title}
      </h3>

      {/* 피처 설명 */}
      <p className="text-text/70 text-base md:text-lg">
        {feature.description}
      </p>
    </div>
  );
}

export default function System() {
  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* 섹션 제목 + 회로 디바이더 */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            게임 시스템
          </h2>
          <div className="circuit-divider max-w-md mx-auto" />
        </div>

        {/* 2x2 그리드 — 모바일 1열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
