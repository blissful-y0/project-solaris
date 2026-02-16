import { useEffect, useRef, useState } from "react";
import { SYSTEMS, type SystemInfo } from "./systemData";
import SystemModal from "./SystemModal";

function FeatureCard({
  feature,
  index,
  onClick,
}: {
  feature: SystemInfo;
  index: number;
  onClick: () => void;
}) {
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
      onClick={onClick}
      className="reveal group relative p-7 md:p-10 bg-bg/60
                 transition-all duration-500 hover-glow-cyan cursor-pointer text-center"
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
  const [selectedSystem, setSelectedSystem] = useState<SystemInfo | null>(null);

  return (
    <section id="section-system" className="section-shell section-divider">
      <div className="section-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {SYSTEMS.map((system, i) => (
            <FeatureCard
              key={system.code}
              feature={system}
              index={i}
              onClick={() => setSelectedSystem(system)}
            />
          ))}
        </div>
      </div>

      {selectedSystem && (
        <SystemModal
          system={selectedSystem}
          onClose={() => setSelectedSystem(null)}
        />
      )}
    </section>
  );
}
