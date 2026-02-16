import { useEffect, useRef } from "react";

// 세계관 스토리 블록 텍스트
const STORY_BLOCKS = [
  "2174년, 핵전쟁이 세상을 삼켰다. 인류는 마지막 도시 솔라리스를 세웠다.",
  "하늘의 태양은 진짜가 아니다. 헬리오스 코어 — 도시를 지배하는 인공 지능이 만든 거짓 빛.",
  "이 도시의 시민들은 꿈을 꾸지 못한다. 공명판이 잠든 영혼마저 감시한다.",
  "모든 시민에게 동조율이 부여된다. 그 숫자가 당신의 운명을 결정한다.",
];

// 스크롤 시 순차 등장하는 블록 컴포넌트
function RevealBlock({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("visible");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}

export default function World() {
  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* 섹션 제목 — 앰버 글로우 (거짓 태양 테마) */}
        <RevealBlock delay={0}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-secondary text-glow-amber text-center mb-16 md:mb-24">
            거짓된 태양의 시대
          </h2>
        </RevealBlock>

        {/* 스토리 블록 — 스크롤 순차 등장 */}
        <div className="space-y-12 md:space-y-16">
          {STORY_BLOCKS.map((text, i) => (
            <RevealBlock key={i} delay={i * 150}>
              <div className="relative pl-6 md:pl-8 border-l-2 border-primary/20">
                {/* 시안 도트 인디케이터 */}
                <div className="absolute left-0 top-0 w-2 h-2 bg-primary rounded-full -translate-x-[5px]" />
                <p className="text-lg md:text-xl lg:text-2xl text-text/90 leading-relaxed font-light">
                  {text}
                </p>
              </div>
            </RevealBlock>
          ))}
        </div>

        {/* 회로 패턴 디바이더 */}
        <div className="mt-20 md:mt-28">
          <RevealBlock delay={0}>
            <div className="circuit-divider" />
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
