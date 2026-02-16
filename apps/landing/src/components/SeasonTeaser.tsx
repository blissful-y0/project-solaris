import { useEffect, useRef, useState } from "react";

const BRIEFING_HEADER = "2249년 2월 17일 오후 9시 23분";
const BRIEFING_SUBTITLE = "헬리오스 시스템이 알려드립니다.";

const BRIEFING_LINES = [
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
];

const CORRECTION_LINES = [
  "정정.",
  "헬리오스 공명판은 가동 이래 오류 기록 0건.",
  "0.003초간 공명판이 정지한 것이 아님.",
  "0.003초간 외부 요인에 의해 공명판이 정지당한 것으로 재분류.",
];

const CLOSING_LINES = [
  "신원 미상. 소속 미상. 위치 미특정.",
  "도시 내부 침투 또는 외부 간섭, 양쪽 가능성 열려 있음.",
  "",
  "보안국 전 요원 대상 비정기 소집 명령 하달.",
  "돔 외곽 감시탑 3기, 지난 48시간 간헐적 통신 두절 보고 접수.",
  "",
  "양측 동시 움직임 포착.",
  "선셋 프로토콜 활성화.",
];

const mono =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

/**
 * 시즌제 스토리(ARC) 모달 전용 비주얼.
 * 전개 + 참여와 반영 섹션, HELIOS GM 브리핑 버블, 시즌 0 티저.
 */
export default function SeasonTeaser() {
  const [showBubble, setShowBubble] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const observedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = bubbleRef.current;
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 전개 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          전개
        </h3>
        <div className="text-text/70 text-sm leading-relaxed space-y-3">
          <p>
            러닝 기간 동안 메인 스토리가 진행됩니다.
            <br />
            그 주변으로 다수의 서브 스토리가 동시에 진행되며,
            <br />
            유저는 모든 서브 스토리에 참여할 필요는 없습니다.
          </p>
          <p>
            스토리의 분기점에서 헬리오스 시스템(AI)이 양 진영의 행동을
            종합합니다.
            <br />
            누가 어떤 임무를 수행했는지. 어떤 전투에서 이기고 졌는지.
            <br />
            어떤 정보를 손에 넣었고, 어떤 선택을 내렸는지.
            <br />그 총합이 다음 스토리의 방향을 결정합니다.
          </p>
          <p className="text-text/30 text-xs">
            * 운영자 판단에 따라 투표 또는 다수결이 적용될 수 있습니다.
          </p>
        </div>
      </div>

      {/* ── 참여와 반영 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          참여와 반영
        </h3>
        <div className="text-text/70 text-sm leading-relaxed space-y-3">
          <p>
            당신의 캐릭터가 한 모든 행동은 기록됩니다.
            <br />
            진영 선택, 임무 수행, 전투, 다른 캐릭터와의 관계 —
          </p>
          <p>
            전투 결과는 예외 없이 공식 스토리에 반영됩니다.
            <br />
            개인 RP는 공개 여부를 직접 선택할 수 있습니다.
          </p>
          <p>
            공개하면 세계에 흔적이 남습니다.
            <br />
            비공개로 두면 당사자들만의 이야기가 됩니다.
          </p>
          <p className="text-text/50">
            무엇을 드러내고 무엇을 감출지는 당신이 정할 수 있습니다.
          </p>
        </div>
      </div>

      {/* ── 시즌 0 티저 — AI 브리핑 ── */}
      <div>
        <div ref={bubbleRef} className="flex justify-center">
          {/* 타이핑 인디케이터 */}
          {showTyping && !showBubble && (
            <div
              className="inline-flex gap-1 px-4 py-2.5 rounded-2xl"
              style={{
                backgroundColor: "rgba(6, 182, 212, 0.25)",
                opacity: 0.7,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: "#06b6d4",
                    animation: `typing-dot 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 브리핑 버블 */}
          {showBubble && (
            <div
              style={{
                maxWidth: "min(520px, 90vw)",
                animation: "bubble-in 0.3s ease-out",
              }}
            >
              {/* 화자 라벨 */}
              <div className="flex justify-center mb-1.5">
                <span
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{
                    color: "#06b6d4",
                    textShadow: "0 0 8px rgba(6,182,212,0.4)",
                  }}
                >
                  HELIOS SYSTEM
                </span>
              </div>

              {/* 버블 본체 */}
              <div
                className="px-5 py-4 rounded-2xl leading-relaxed"
                style={{
                  backgroundColor: "#06b6d4",
                  color: "rgba(0, 0, 0, 0.85)",
                  fontFamily: mono,
                  fontSize: "0.78rem",
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

                {/* 본문 */}
                <div className="space-y-0.5" style={{ lineHeight: 1.7 }}>
                  {BRIEFING_LINES.map((line, i) =>
                    line === "" ? (
                      <div key={i} className="h-2" />
                    ) : (
                      <div key={i}>{line}</div>
                    ),
                  )}
                </div>

                {/* 정정 — 강조 구간 */}
                <div
                  className="mt-3 px-3 py-2.5 rounded-lg"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.15)",
                    lineHeight: 1.7,
                  }}
                >
                  {CORRECTION_LINES.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        fontWeight: i === 0 ? 700 : 400,
                        color:
                          i === 0
                            ? "rgba(0, 0, 0, 0.95)"
                            : "rgba(0, 0, 0, 0.85)",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* 후반부 */}
                <div className="mt-3 space-y-0.5" style={{ lineHeight: 1.7 }}>
                  {CLOSING_LINES.map((line, i) =>
                    line === "" ? (
                      <div key={i} className="h-2" />
                    ) : (
                      <div
                        key={i}
                        style={{
                          fontWeight: i >= CLOSING_LINES.length - 2 ? 700 : 400,
                        }}
                      >
                        {line}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
