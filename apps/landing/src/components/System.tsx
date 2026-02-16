import { useEffect, useRef } from "react";

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
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="reveal group relative p-7 md:p-10 bg-bg/60
                 transition-all duration-500 hover-glow-cyan cursor-default text-center"
    >
      {/* HUD 코너 브라켓 */}
      <span
        className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderTop: "1px solid var(--color-primary)",
          borderLeft: "1px solid var(--color-primary)",
          opacity: 0.3,
        }}
      />
      <span
        className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderTop: "1px solid var(--color-primary)",
          borderRight: "1px solid var(--color-primary)",
          opacity: 0.3,
        }}
      />
      <span
        className="absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderBottom: "1px solid var(--color-primary)",
          borderLeft: "1px solid var(--color-primary)",
          opacity: 0.3,
        }}
      />
      <span
        className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderBottom: "1px solid var(--color-primary)",
          borderRight: "1px solid var(--color-primary)",
          opacity: 0.3,
        }}
      />

      <div className="system-glyph pulse mb-4 md:mb-6 mx-auto">
        {feature.glyph}
      </div>

      <h3 className="text-lg md:text-2xl font-bold text-primary text-glow-cyan mb-3">
        {feature.title}
      </h3>

      <p className="text-text/70 text-sm md:text-lg">{feature.description}</p>
    </div>
  );
}

export default function System() {
  return (
    <section id="section-system" className="section-shell section-divider">
      <div className="section-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
