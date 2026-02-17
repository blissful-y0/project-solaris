import { useEffect, useRef, useState } from "react";

/* ── 타입 정의 ── */
interface BriefingBlock {
  type: "normal" | "correction" | "closing";
  lines: string[];
}

/* ── 데이터 ── */
const BRIEFING_HEADER = "2249년 2월 17일 오후 9시 23분";
const BRIEFING_SUBTITLE = "헬리오스 시스템이 알려드립니다.";

const BRIEFING_BLOCKS: BriefingBlock[] = [
  {
    type: "normal",
    lines: [
      "지난 72시간 기록 종합.",
      "",
      "중층 전도관 구역 C-7. 야간 순환 점검 시간대,",
      "비인가 접근 3건 감지. 3건 모두 감지 후 0.8초 이내 신호 소실.",
      "보안국 제4순찰조 현장 도착 시 통로 내 인원 없음.",
      "전도관 외벽 온도 주변 대비 +4℃ 확인.",
      '순찰조 보고: "이상 없음." 온도 편차 미기록.',
      "",
      "같은 시간대, 표층 거주구역 12블록.",
      "시민 7,400명 수면 중 02:14:33,",
      "공명판 2기 출력 요동. 지속 시간 0.003초.",
      "각성 시민 0명. 시스템 분류: 출력 오류. 로그 종결.",
    ],
  },
  {
    type: "correction",
    lines: [
      "정정.",
      "헬리오스 공명판은 가동 이래 오류 기록 0건.",
      "0.003초간 공명판이 정지한 것이 아님.",
      "0.003초간 외부 요인에 의해 공명판이 정지당한 것으로 재분류.",
    ],
  },
  {
    type: "closing",
    lines: [
      "신원 미상. 소속 미상. 위치 미특정.",
      "도시 내부 침투 또는 외부 간섭, 양쪽 가능성 열려 있음.",
      "",
      "보안국 전 요원 대상 비정기 소집 명령 하달.",
      "돔 외곽 감시탑 3기, 지난 48시간 간헐적 통신 두절 보고 접수.",
      "",
      "양측 동시 움직임 포착.",
      "선셋 프로토콜 활성화.",
    ],
  },
];

/* ── 설정 ── */
const SPEAKER_CONFIG = {
  label: "HELIOS SYSTEM",
  color: "#06b6d4",
  bg: "#06b6d4",
  textColor: "rgba(0, 0, 0, 0.85)",
  font: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  fontSize: "0.78rem",
  maxWidth: "min(520px, 90vw)",
};

/* ── 서브 컴포넌트: 타이핑 인디케이터 ── */
function BriefingTypingIndicator() {
  return (
    <div
      className="inline-flex gap-1 px-4 py-2.5 rounded-2xl"
      style={{ backgroundColor: "rgba(6, 182, 212, 0.25)", opacity: 0.7 }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: SPEAKER_CONFIG.color,
            animation: `typing-dot 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── 서브 컴포넌트: 블록 렌더러 ── */
function BriefingBlockContent({ block }: { block: BriefingBlock }) {
  if (block.type === "correction") {
    return (
      <div
        className="mt-3 px-3 py-2.5 rounded-lg"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.15)", lineHeight: 1.7 }}
      >
        {block.lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.85)",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    );
  }

  const isClosing = block.type === "closing";

  return (
    <div
      className={isClosing ? "mt-3 space-y-0.5" : "space-y-0.5"}
      style={{ lineHeight: 1.7 }}
    >
      {block.lines.map((line, i) =>
        line === "" ? (
          <div key={i} className="h-2" />
        ) : (
          <div
            key={i}
            style={{
              fontWeight:
                isClosing && i >= block.lines.length - 2 ? 700 : 400,
            }}
          >
            {line}
          </div>
        ),
      )}
    </div>
  );
}

/* ── 서브 컴포넌트: 브리핑 버블 ── */
function BriefingBubble() {
  return (
    <div style={{ maxWidth: SPEAKER_CONFIG.maxWidth, animation: "bubble-in 0.3s ease-out" }}>
      {/* 화자 라벨 */}
      <div className="flex justify-center mb-1.5">
        <span
          className="text-xs font-semibold tracking-wider uppercase"
          style={{
            color: SPEAKER_CONFIG.color,
            textShadow: `0 0 8px ${SPEAKER_CONFIG.color}66`,
          }}
        >
          {SPEAKER_CONFIG.label}
        </span>
      </div>

      {/* 버블 본체 */}
      <div
        className="px-5 py-4 rounded-2xl leading-relaxed"
        style={{
          backgroundColor: SPEAKER_CONFIG.bg,
          color: SPEAKER_CONFIG.textColor,
          fontFamily: SPEAKER_CONFIG.font,
          fontSize: SPEAKER_CONFIG.fontSize,
        }}
      >
        {/* 헤더 */}
        <div className="font-bold mb-1" style={{ fontSize: "0.82rem" }}>
          {BRIEFING_HEADER}
        </div>
        <div
          className="mb-3 font-semibold"
          style={{ fontSize: "0.78rem", opacity: 0.8 }}
        >
          {BRIEFING_SUBTITLE}
        </div>

        {/* 블록들 */}
        {BRIEFING_BLOCKS.map((block, i) => (
          <BriefingBlockContent key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function SeasonTeaser() {
  const [showBubble, setShowBubble] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observedRef.current) {
          observedRef.current = true;
          setShowTyping(true);
          timerRef.current = setTimeout(() => {
            setShowTyping(false);
            setShowBubble(true);
          }, 1000);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex justify-center">
      {showTyping && !showBubble && <BriefingTypingIndicator />}
      {showBubble && <BriefingBubble />}
    </div>
  );
}
