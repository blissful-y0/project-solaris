import { useEffect, useRef, useState } from "react";

/* ── 메시지 타입 ── */
type Speaker = "system" | "mirror" | "ash" | "helios";

interface ChatMessage {
  speaker: Speaker;
  label?: string;
  sublabel?: string;
  body: string;
  verdict?: string;
}

/* ── 메시지 시퀀스 데이터 ── */
const MESSAGES: ChatMessage[] = [
  {
    speaker: "system",
    body: "ENGAGEMENT #0042 — 중층 에너지 전도관 허브\n보안국 순찰조가 전도관 구역 C-7에서 비인가 접근을 감지했다. 좁은 유지보수 통로. 양쪽 벽면에 고압 에너지 전도관이 노출되어 있고, 천장을 따라 증기 배관이 지나간다. 조명은 없다 — 전도관에서 새어나오는 푸른 빛만이 바닥에 길고 차가운 그림자를 만든다.",
  },
  {
    speaker: "mirror",
    label: "거울",
    sublabel: "보안국 · 동조형 역장",
    body: "접촉 감지. 왼쪽 전도관 뒤로 몸을 낮춘다.\n상대는 둘 — 통로 끝 격벽 뒤에 하나, 천장 배관 위에 하나.\n\n통로 중앙에 3미터 폭 역장 벽을 편다. 동시에 배관 접합부에 압축 역장을 걸어 증기를 터뜨린다. 천장의 적에게 뜨거운 증기가 쏟아진다.\n\n이중 운용으로 집중력이 갈리지만, 헬리오스 연산 보조가 오차를 잡아준다. 허용 범위 안이다. 역장 너머로 적의 다음 움직임을 기다린다.",
  },
  {
    speaker: "ash",
    label: "재",
    sublabel: "스태틱 · 스텔스형 발화",
    body: "증기가 터지는 순간 배관에서 손을 놓는다. 왼쪽 어깨에 증기가 스치지만 이 정도 열은 몸이 알아서 흡수한다.\n\n착지하며 바닥에 손을 짚는다. 전도관 금속이 적열색으로 달아오른다. 열이 바닥을 타고 역장 벽 아래로 흘러간다 — 역장이 전도열까지 막는지는 도박이다.\n\n격벽 뒤 동료에게 고개를 끄덕인다. 왼손에서 불꽃이 피어오르고, 통로의 푸른 빛이 주황으로 물든다.\n무릎이 욱신거린다. 코끝에서 피가 흘러내린다. 오래 끌 수 없다.",
  },
  {
    speaker: "helios",
    label: "HELIOS GM",
    sublabel: "전투 판정 시스템",
    body: "거울의 역장이 통로를 갈랐을 때, 전도관의 푸른 빛이 반투명한 막 위에서 잔물결처럼 흔들렸다. 3미터 폭. 천장부터 바닥까지 빈틈없이. 같은 순간 터져나온 증기가 천장을 하얗게 삼켰다. 공명 강화 훈련의 정석 — 차단하고, 교란하고, 기다린다. 헬리오스의 연산이 역장의 출력 오차를 실시간으로 보정하고 있었고, 그 안에 서 있는 한 거울은 흔들리지 않았다.\n\n재는 그 증기 속에서 떨어졌다. 어깨를 스치는 열기를 무시하고 — 아니, 삼키고 — 착지한 손바닥 아래에서 금속이 붉어지기 시작했다. 열이 바닥을 탔다. 역장 벽 아래를, 거울이 서 있는 발밑을 향해. 역장은 날아오는 것을 막는다. 부딪히는 것을 막는다. 하지만 스며드는 것은 막지 못한다. 분자 진동으로 전달되는 열에 대해 역장의 차단 효율은 설계 기준의 12%까지 떨어지는데, 그건 거울도 알고 있을 수도 있고 모를 수도 있다. 재가 그걸 계산했는지 아니면 본인 말대로 도박이었는지도 알 수 없다. 확실한 건 하나다 — 거울의 발밑이 뜨거워지고 있다는 것.\n\n통로의 색이 바뀌었다. 전도관의 차가운 푸른빛 위로 재의 왼손에서 피어오른 불꽃이 주황을 덮었다. 동시에 격벽 뒤의 그림자가 움직였다. 신호는 이미 떨어졌다.\n\n그런데 재의 무릎이 흔들렸다. 낙하 충격이 아직 남아 있다. 코끝에서 흘러내린 피가 달궈진 바닥에 닿아 지직거렸다. 이중 발화는 이 몸이 감당할 수 있는 한계의 바깥에 있고, 지금 통로를 주황으로 물들이고 있는 저 불꽃은 무언가를 태우는 것이 아니라 재 자신이 타고 있는 것이다. 5분, 그 안에 끝내지 못하면 불꽃이 먼저 꺼진다.\n\n거울 앞에 선택이 놓였다. 역장을 유지하면 화상을 입는다. 해제하면 통로가 열린다. 헬리오스의 연산은 최적 해를 제시하고 있겠지만, 상대가 데이터베이스에 없는 비동조형이라는 사실 앞에서 그 계산이 얼마나 믿을 만한지는 거울 자신이 판단해야 한다.",
    verdict: "라운드 결과: 스태틱 우세\n거울 — 역장 하부 열 침투 진행. 유지 시 화상, 해제 시 통로 개방.\n재 — 이중 발화 출혈. 3라운드 초과 시 능력 강제 해제.",
  },
  {
    speaker: "system",
    body: "다음 라운드 서술을 기다리는 중...",
  },
];

/* ── 스피커 설정 ── */
interface SpeakerConfig {
  /** flex 정렬: 좌(start) / 중앙(center) / 우(end) */
  align: "start" | "center" | "end";
  bg: string;
  textColor: string;
  font: string;
  fontSize: string;
  /** 프로필 아이콘 이니셜 */
  icon: string;
  /** 프로필 아이콘 배경색 */
  iconBg: string;
  /** 아바타 표시 여부 */
  hasAvatar?: boolean;
}

const SPEAKERS: Record<Speaker, SpeakerConfig> = {
  system: {
    align: "center",
    bg: "rgba(55, 65, 81, 0.4)",
    textColor: "#9ca3af",
    font: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    fontSize: "0.75rem",
    icon: "",
    iconBg: "#374151",
    hasAvatar: false,
  },
  mirror: {
    align: "start",
    bg: "#93c5fd",
    textColor: "rgba(0, 0, 0, 0.8)",
    font: "var(--font-sans)",
    fontSize: "0.85rem",
    icon: "",
    iconBg: "#93c5fd",
    hasAvatar: true,
  },
  ash: {
    align: "end",
    bg: "#dc2626",
    textColor: "rgba(255, 255, 255, 0.9)",
    font: "var(--font-sans)",
    fontSize: "0.85rem",
    icon: "",
    iconBg: "#dc2626",
    hasAvatar: true,
  },
  helios: {
    align: "center",
    bg: "#00d4ff",
    textColor: "rgba(0, 0, 0, 0.8)",
    font: "var(--font-sans)",
    fontSize: "0.85rem",
    icon: "",
    iconBg: "#00d4ff",
    hasAvatar: false,
  },
};

/* ── 프로필 아이콘 ── */
function Avatar({ speaker }: { speaker: Speaker }) {
  const cfg = SPEAKERS[speaker];
  const isSystem = speaker === "system";

  return (
    <div
      className="shrink-0 grid place-items-center rounded-full"
      style={{
        width: isSystem ? 24 : 32,
        height: isSystem ? 24 : 32,
        backgroundColor: cfg.iconBg,
        fontSize: isSystem ? "0.5rem" : "0.7rem",
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: "0.05em",
      }}
    >
      {cfg.icon}
    </div>
  );
}

/* ── 타이핑 인디케이터 ── */
function TypingIndicator({ speaker }: { speaker: Speaker }) {
  const cfg = SPEAKERS[speaker];
  const isSystem = speaker === "system";
  const justify =
    cfg.align === "start"
      ? "justify-start"
      : cfg.align === "end"
        ? "justify-end"
        : "justify-center";

  return (
    <div className={`flex ${justify}`}>
      <div className="flex items-end gap-2">
        {cfg.align === "start" && cfg.hasAvatar && <Avatar speaker={speaker} />}
        <div
          className="inline-flex gap-1 px-4 py-2.5 rounded-2xl"
          style={{
            backgroundColor: isSystem ? "rgba(107,114,128,0.15)" : cfg.bg,
            opacity: 0.7,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: isSystem ? "#6b7280" : "#ffffff",
                animation: `typing-dot 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
        {cfg.align === "end" && cfg.hasAvatar && <Avatar speaker={speaker} />}
      </div>
    </div>
  );
}

/* ── 채팅 버블 ── */
function ChatBubble({ message }: { message: ChatMessage }) {
  const cfg = SPEAKERS[message.speaker];
  const isSystem = message.speaker === "system";
  const justify =
    cfg.align === "start"
      ? "justify-start"
      : cfg.align === "end"
        ? "justify-end"
        : "justify-center";

  return (
    <div className={`flex ${justify}`}>
      <div
        className="flex items-start gap-2.5"
        style={{ maxWidth: "min(480px, 85vw)" }}
      >
        {/* 좌측 아바타 */}
        {cfg.hasAvatar && cfg.align === "start" && (
          <div className="pt-5">
            <Avatar speaker={message.speaker} />
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-0">
          {/* 화자 라벨 */}
          {message.label && (
            <span
              className="text-xs font-semibold tracking-wider uppercase px-1"
              style={{
                color: cfg.bg,
                textShadow: `0 0 8px ${cfg.bg}40`,
              }}
            >
              {message.label}
              {message.sublabel && (
                <span className="ml-2 opacity-50 font-normal normal-case tracking-normal">
                  {message.sublabel}
                </span>
              )}
            </span>
          )}

          {/* 버블 */}
          <div
            className="px-4 py-3 rounded-2xl whitespace-pre-line leading-relaxed"
            style={{
              backgroundColor: cfg.bg,
              color: cfg.textColor,
              fontFamily: cfg.font,
              fontSize: cfg.fontSize,
            }}
          >
            {message.body}

            {message.verdict && (
              <div
                className="mt-3 px-3 py-2 rounded-lg whitespace-pre-line"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                  fontSize: "0.8rem",
                  lineHeight: 1.6,
                }}
              >
                {message.verdict}
              </div>
            )}
          </div>
        </div>

        {/* 우측 아바타 */}
        {cfg.hasAvatar && cfg.align === "end" && (
          <div className="pt-5">
            <Avatar speaker={message.speaker} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function CombatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRunningRef.current) {
          isRunningRef.current = true;
          runSequence();
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

  const runSequence = () => {
    let index = 0;

    const showNext = () => {
      if (index >= MESSAGES.length) {
        setShowTyping(false);
        return;
      }

      setShowTyping(true);

      const isHelios = MESSAGES[index].speaker === "helios";
      const typingDelay = 500 + (isHelios ? 500 : 0);

      timerRef.current = setTimeout(() => {
        setShowTyping(false);
        setVisibleCount(index + 1);
        index++;

        if (index < MESSAGES.length) {
          timerRef.current = setTimeout(showNext, 800);
        }
      }, typingDelay);
    };

    showNext();
  };

  const nextSpeaker =
    visibleCount < MESSAGES.length ? MESSAGES[visibleCount].speaker : "system";

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {MESSAGES.slice(0, visibleCount).map((msg, i) => (
        <div
          key={i}
          style={{ animation: "bubble-in 0.3s ease-out" }}
        >
          <ChatBubble message={msg} />
        </div>
      ))}

      {showTyping && <TypingIndicator speaker={nextSpeaker} />}
    </div>
  );
}
