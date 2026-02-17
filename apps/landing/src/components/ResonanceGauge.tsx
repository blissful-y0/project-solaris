import { useEffect, useRef, useState } from "react";

/* ── 타입 정의 ── */
interface GaugeSegment {
  id: string;
  range: string;
  label: string;
  description: string;
  /** 게이지 상단에서의 시작 위치 (%) */
  top: string;
  /** 구간 높이 (%) */
  height: string;
  color: string;
  textColor: string;
  /** 텍스트 밝기 (opacity) */
  textOpacity: number;
  /** 설명 텍스트 밝기 */
  descOpacity: number;
}

interface GlitchLine {
  offset: number;
  color: string;
  animation: string;
}

interface BoundaryConfig {
  /** 게이지 상단에서의 위치 (%) */
  top: string;
  color: string;
  glowColor: string;
  glitchLines: GlitchLine[];
}

/* ── 데이터 ── */
const SEGMENTS: GaugeSegment[] = [
  {
    id: "high",
    range: "80+",
    label: "초월",
    description:
      "헬리오스와 공명하며 능력이 깨어난다.\n안정적이고 정밀하다. 그러나 시스템 없이는 제어할 수 없다.",
    top: "0%",
    height: "20%",
    color: "#f59e0b",
    textColor: "#f59e0b",
    textOpacity: 1,
    descOpacity: 0.45,
  },
  {
    id: "mid",
    range: "15 – 79",
    label: "일반",
    description: "능력 없음. 변이는 침묵한다.",
    top: "20%",
    height: "65%",
    color: "rgba(31,41,55,0.3)",
    textColor: "var(--color-text)",
    textOpacity: 0.25,
    descOpacity: 0.15,
  },
  {
    id: "low",
    range: "~15",
    label: "이탈",
    description:
      "감지망에서 사라진다.\n거칠고, 불안정하고, 예측 불가능하다.",
    top: "85%",
    height: "15%",
    color: "#ef4444",
    textColor: "#ef4444",
    textOpacity: 1,
    descOpacity: 0.45,
  },
];

const BOUNDARIES: BoundaryConfig[] = [
  {
    top: "20%",
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.5)",
    glitchLines: [
      {
        offset: -2,
        color: "rgba(245,158,11,0.6)",
        animation: "gauge-glitch-1 2s ease-in-out infinite",
      },
      {
        offset: 3,
        color: "rgba(220,38,38,0.4)",
        animation: "gauge-glitch-2 2.5s ease-in-out infinite",
      },
    ],
  },
  {
    top: "85%",
    color: "#ef4444",
    glowColor: "rgba(239,68,68,0.5)",
    glitchLines: [
      {
        offset: -2,
        color: "rgba(239,68,68,0.6)",
        animation: "gauge-glitch-red-1 2.2s ease-in-out infinite",
      },
      {
        offset: 3,
        color: "rgba(239,68,68,0.4)",
        animation: "gauge-glitch-red-2 2.8s ease-in-out infinite",
      },
    ],
  },
];

/* ── 설정 ── */
const GAUGE_CONFIG = {
  height: 320,
  barWidth: 48,
  labelWidth: 220,
  font: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  highGlow:
    "0 0 15px rgba(245,158,11,0.5), 0 0 30px rgba(245,158,11,0.25), inset 0 0 10px rgba(245,158,11,0.3)",
};

/* ── 서브 컴포넌트: 경계선 + 글리치 ── */
function GlitchBorder({
  boundary,
  animate,
}: {
  boundary: BoundaryConfig;
  animate: boolean;
}) {
  return (
    <div
      className="absolute left-0 w-full"
      style={{ top: boundary.top, height: 3, zIndex: 2 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: boundary.color,
          boxShadow: `0 0 8px ${boundary.color}, 0 0 20px ${boundary.glowColor}`,
        }}
      />
      {animate &&
        boundary.glitchLines.map((line, i) => (
          <div
            key={i}
            className="absolute w-full"
            style={{
              top: line.offset,
              height: 1,
              backgroundColor: line.color,
              animation: line.animation,
            }}
          />
        ))}
    </div>
  );
}

/* ── 서브 컴포넌트: 게이지 바 ── */
function GaugeBar({ animate }: { animate: boolean }) {
  return (
    <div
      className="relative w-12 rounded-sm overflow-hidden"
      style={{ backgroundColor: "rgba(31,41,55,0.5)" }}
    >
      {/* 80+ 구간 — 앰버 글로우 */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, #f59e0b, rgba(245,158,11,0.6))",
          boxShadow: animate ? GAUGE_CONFIG.highGlow : "none",
          opacity: animate ? 1 : 0,
          transition: "opacity 0.8s ease, box-shadow 0.8s ease",
        }}
      />

      {/* 경계선들 */}
      {BOUNDARIES.map((b) => (
        <GlitchBorder key={b.top} boundary={b} animate={animate} />
      ))}

      {/* 15-79 구간 — 다크 그레이 */}
      <div
        className="absolute left-0 w-full"
        style={{
          top: "20%",
          height: "65%",
          background:
            "linear-gradient(to bottom, rgba(31,41,55,0.3), rgba(31,41,55,0.15))",
        }}
      />

      {/* ~15 구간 — 레드 펄스 */}
      <div
        className="absolute left-0 w-full bottom-0"
        style={{
          height: "15%",
          background:
            "linear-gradient(to bottom, rgba(239,68,68,0.6), #ef4444)",
          opacity: animate ? 1 : 0,
          transition: "opacity 0.8s ease 0.3s",
          animation: animate
            ? "gauge-red-pulse 2.5s ease-in-out infinite"
            : "none",
        }}
      />
    </div>
  );
}

/* ── 서브 컴포넌트: 구간 라벨 ── */
function SegmentLabel({
  segment,
  animate,
  delay,
}: {
  segment: GaugeSegment;
  animate: boolean;
  delay: string;
}) {
  const isHigh = segment.id === "high";
  const isMid = segment.id === "mid";

  const positionStyle: React.CSSProperties = isHigh
    ? {}
    : isMid
      ? { position: "absolute", top: "42%" }
      : { position: "absolute", bottom: 0 };

  return (
    <div
      style={{
        ...positionStyle,
        opacity: animate ? 1 : 0,
        transition: `opacity 0.6s ease ${delay}`,
      }}
    >
      <span
        className="font-bold"
        style={{
          color: segment.textColor,
          opacity: segment.textOpacity,
          textShadow:
            !isMid ? `0 0 8px ${segment.color}40` : undefined,
          fontSize: isMid ? "0.65rem" : undefined,
        }}
      >
        {segment.range}
      </span>
      <span
        className="ml-2"
        style={{
          color: "var(--color-text)",
          opacity: isMid ? 0.2 : 0.5,
          fontSize: isMid ? "0.65rem" : undefined,
        }}
      >
        {segment.label}
      </span>
      <p
        className="mt-1 leading-snug"
        style={{
          color: "var(--color-text)",
          opacity: segment.descOpacity,
          fontSize: isMid ? "0.65rem" : "0.7rem",
          whiteSpace: "pre-line",
        }}
      >
        {segment.description}
      </p>
    </div>
  );
}

/* ── 서브 컴포넌트: 경계 마커 ── */
function BoundaryMarker({
  top,
  color,
  animate,
  delay,
}: {
  top: string;
  color: string;
  animate: boolean;
  delay: string;
}) {
  return (
    <div
      className="absolute"
      style={{
        top,
        transform: "translateY(-50%)",
        opacity: animate ? 1 : 0,
        transition: `opacity 0.6s ease ${delay}`,
      }}
    >
      <div className="h-px w-6" style={{ backgroundColor: color }} />
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function ResonanceGauge() {
  const [animate, setAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animate) {
          timer = setTimeout(() => setAnimate(true), 400);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex justify-center py-1">
      <div
        className="relative flex gap-4 items-stretch"
        style={{ height: GAUGE_CONFIG.height }}
      >
        {/* 게이지 바 */}
        <GaugeBar animate={animate} />

        {/* 라벨 영역 */}
        <div
          className="relative flex flex-col text-xs"
          style={{
            fontFamily: GAUGE_CONFIG.font,
            width: GAUGE_CONFIG.labelWidth,
          }}
        >
          <SegmentLabel
            segment={SEGMENTS[0]}
            animate={animate}
            delay="0.5s"
          />

          <BoundaryMarker
            top="20%"
            color="rgba(245,158,11,0.5)"
            animate={animate}
            delay="0.8s"
          />

          <SegmentLabel
            segment={SEGMENTS[1]}
            animate={animate}
            delay="1s"
          />

          <BoundaryMarker
            top="85%"
            color="rgba(239,68,68,0.5)"
            animate={animate}
            delay="1.1s"
          />

          <SegmentLabel
            segment={SEGMENTS[2]}
            animate={animate}
            delay="1.2s"
          />
        </div>
      </div>
    </div>
  );
}
