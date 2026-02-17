import { useEffect, useRef, useState } from "react";

/* ── 타입 ── */

interface SystemPanelData {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accentColor: string;
  description: string[];
  cost: string[];
  flavor: string;
}

interface AbilityCardData {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  barColor: string;
  skills: string;
  harmonics: string;
  overdrive: string;
}

interface CrossStyleCardData {
  id: string;
  name: string;
  nameKo: string;
  tag: string;
  topColor: string;
  description: string;
  emphasized?: string;
}

/* ── 데이터 ── */

const PANELS: SystemPanelData[] = [
  {
    id: "harmonics",
    title: "HARMONICS PROTOCOL",
    subtitle: "하모닉스 프로토콜",
    tag: "SYNC TYPE — WILL COST",
    accentColor: "#06b6d4",
    description: [
      "헬리오스 연산 체계와 공명하여 발현하는 능력.",
      "안정적이고 정밀하지만, 시스템 접속 상태에서만 사용할 수 있다.",
    ],
    cost: ["WILL 소모", "회복 불가"],
    flavor:
      "자아의 경계가 흐려진다. 헬리오스와 깊이 동기화할수록, 돌아올 자리가 희미해진다.",
  },
  {
    id: "overdrive",
    title: "OVERDRIVE",
    subtitle: "오버드라이브",
    tag: "ASYNC TYPE — HP COST",
    accentColor: "#dc2626",
    description: [
      "시스템 억제 바깥의 비인가 원시 출력.",
      "순간적으로 강력하지만 제어가 어렵고, 대가는 육체에 새겨진다.",
    ],
    cost: ["HP 소모", "회복 가능"],
    flavor: "코피. 근육 경련. 의식 혼탁. 대가는 육체에 새겨진다.",
  },
];

const ABILITIES: AbilityCardData[] = [
  {
    id: "field",
    name: "FIELD",
    nameKo: "역장",
    description: "공간과 물리 법칙에 간섭한다.",
    barColor: "#06b6d4",
    skills: "중력 조작 · 방어막 생성 · 공간 왜곡 · 충격파 방사",
    harmonics: "정밀한 역장 전개와 유지. 범위와 강도를 연산으로 제어.",
    overdrive:
      "폭발적 충격파와 무차별 왜곡. 자신도 영향 범위에 포함될 수 있음.",
  },
  {
    id: "shift",
    name: "SHIFT",
    nameKo: "변환",
    description: "자신의 몸과 물질의 성질을 고쳐 쓴다.",
    barColor: "#ea580c",
    skills: "경화 · 형태 변이 · 물성 조작",
    harmonics:
      "헬리오스 연산으로 분자 구조를 정밀 재배열. 안정적이지만 변환 범위가 좁고, 연산 용량에 제한된다.",
    overdrive:
      "본능적 변이 폭주. 변환 범위와 속도가 극대화되지만, 원래 형태로 돌아오지 못할 위험이 있다.",
  },
  {
    id: "compute",
    name: "COMPUTE",
    nameKo: "연산",
    description: "정보를 지배하고 확률을 읽는다.",
    barColor: "#e5e7eb",
    skills: "확률 예측 · 패턴 분석 · 시스템 침투",
    harmonics:
      "헬리오스 연산과 직결된 분석. 정확하고 안정적이나, 시스템 접속 중에만 유효.",
    overdrive:
      "직감적 확률 예측. 순간적으로 강력하지만 과부하가 빠르고 오차가 크다.",
  },
  {
    id: "empathy",
    name: "EMPATHY",
    nameKo: "감응",
    description: "타인의 정신과 감각에 손을 뻗는다.",
    barColor: "#8b5cf6",
    skills: "감정 읽기 · 정신 연결 · 암시",
    harmonics:
      "헬리오스 네트워크를 경유한 정밀 감응. 대상의 감정 패턴을 데이터로 분석하며, 접촉 없이 원거리 감지가 가능하다.",
    overdrive:
      "직감적 공감 폭발. 범위와 깊이가 비약적으로 증가하지만, 타인의 고통이 자신에게도 흘러든다.",
  },
];

const CROSS_STYLES: CrossStyleCardData[] = [
  {
    id: "override",
    name: "SAFE-MODE OVERRIDE",
    nameKo: "리미터 해제",
    tag: "BUREAU ONLY",
    topColor: "#06b6d4",
    description:
      "보안국 소속 동조형만이 접근할 수 있는 프로토콜. 헬리오스의 안전 제한을 일시적으로 해제하여 오버드라이브에 준하는 출력을 끌어낸다. 시스템이 허용한 폭주 — 그러나 그 대가는 시스템이 아닌 사용자가 치른다.",
  },
  {
    id: "dead-reckoning",
    name: "DEAD RECKONING",
    nameKo: "정밀 제어",
    tag: "STATIC ONLY",
    topColor: "#dc2626",
    description:
      "스태틱 중에서도 극소수만이 도달하는 경지. 야생의 힘을 본능이 아닌 의지로 다스린다. 하모닉스의 정밀함을 시스템 없이 재현하는 것 — 불가능에 가깝지만, 불가능은 아니다.",
  },
  {
    id: "defector",
    name: "DEFECTOR",
    nameKo: "전향자",
    tag: "SPECIAL BACKGROUND",
    topColor: "#d97706",
    description:
      "원래 소속 진영을 이탈한 자. 양쪽의 체계를 경험한 대가로, 불완전하게나마 두 방식을 사용할 수 있다.",
  },
];

/* ── 설정 ── */

const MONO_FONT =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

/* ── 서브 컴포넌트: 두 개의 체계 패널 ── */

function SystemPanel({ panel }: { panel: SystemPanelData }) {
  return (
    <div
      className="flex-1 p-4 md:p-5 transition-shadow duration-300 group/panel"
      style={{
        backgroundColor: "rgba(17, 17, 17, 0.6)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${panel.accentColor}20, inset 0 0 20px ${panel.accentColor}08`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* 태그 */}
      <div
        className="text-[10px] tracking-[0.2em] mb-3"
        style={{ color: panel.accentColor, fontFamily: MONO_FONT }}
      >
        {panel.tag}
      </div>

      {/* 타이틀 */}
      <h4
        className="text-sm font-bold tracking-wider mb-0.5"
        style={{ color: panel.accentColor }}
      >
        {panel.title}
      </h4>
      <p className="text-text/40 text-xs mb-3">{panel.subtitle}</p>

      {/* 설명 */}
      <div className="space-y-1.5 mb-4">
        {panel.description.map((line, i) => (
          <p key={i} className="text-text/60 text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {/* 코스트 */}
      <div className="flex gap-2 mb-4">
        {panel.cost.map((c, i) => (
          <span
            key={i}
            className="text-[10px] px-2 py-0.5 tracking-wider"
            style={{
              fontFamily: MONO_FONT,
              border: `1px solid ${panel.accentColor}40`,
              color: panel.accentColor,
              backgroundColor: `${panel.accentColor}08`,
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* 플레이버 */}
      <p
        className="text-xs italic leading-relaxed"
        style={{ color: `${panel.accentColor}90` }}
      >
        "{panel.flavor}"
      </p>
    </div>
  );
}

function SystemPanels() {
  return (
    <div className="mb-8">
      <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-3 font-semibold">
        두 개의 체계
      </h3>
      <div className="flex flex-col md:flex-row gap-0">
        <SystemPanel panel={PANELS[0]} />
        {/* 디바이더 */}
        <div
          className="hidden md:block w-px shrink-0"
          style={{ backgroundColor: "#1f2937" }}
        />
        <div
          className="md:hidden h-px"
          style={{ backgroundColor: "#1f2937" }}
        />
        <SystemPanel panel={PANELS[1]} />
      </div>
    </div>
  );
}

/* ── 서브 컴포넌트: 능력 카드 ── */

function AbilityCardItem({
  ability,
  isExpanded,
  onToggle,
}: {
  ability: AbilityCardData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="cursor-pointer transition-colors duration-200"
      style={{
        backgroundColor: isExpanded
          ? "rgba(17, 17, 17, 0.8)"
          : "rgba(17, 17, 17, 0.4)",
      }}
      onClick={onToggle}
    >
      {/* 카드 헤더 */}
      <div className="flex items-stretch">
        {/* 좌측 컬러 바 */}
        <div
          className="w-1 shrink-0"
          style={{ backgroundColor: ability.barColor }}
        />

        <div className="flex-1 p-4 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-sm font-bold tracking-wider"
                style={{ color: ability.barColor }}
              >
                {ability.name}
              </span>
              <span className="text-text/40 text-xs">{ability.nameKo}</span>
            </div>
            <p className="text-text/50 text-xs mt-1">{ability.description}</p>
          </div>

          {/* 토글 아이콘 */}
          <span
            className="text-text/30 text-xs ml-3 shrink-0 transition-transform duration-200"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* 확장 콘텐츠 */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isExpanded ? "600px" : "0",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 ml-1">
          {/* 능력 예제 */}
          <div className="mb-4">
            <div
              className="text-[10px] tracking-[0.15em] text-text/30 mb-1.5"
              style={{ fontFamily: MONO_FONT }}
            >
              EXAMPLES
            </div>
            <p
              className="leading-relaxed"
              style={{ fontSize: "0.875rem", color: "#9ca3af" }}
            >
              {ability.skills}
            </p>
          </div>

          {/* 하모닉스 vs 오버드라이브 비교 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className="p-3"
              style={{
                backgroundColor: "rgba(6, 182, 212, 0.05)",
                borderLeft: "2px solid rgba(6, 182, 212, 0.3)",
              }}
            >
              <div
                className="text-[10px] tracking-[0.15em] mb-1.5"
                style={{ color: "#06b6d4", fontFamily: MONO_FONT }}
              >
                HARMONICS
              </div>
              <p className="text-text/50 text-xs leading-relaxed">
                {ability.harmonics}
              </p>
            </div>
            <div
              className="p-3"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.05)",
                borderLeft: "2px solid rgba(220, 38, 38, 0.3)",
              }}
            >
              <div
                className="text-[10px] tracking-[0.15em] mb-1.5"
                style={{ color: "#dc2626", fontFamily: MONO_FONT }}
              >
                OVERDRIVE
              </div>
              <p className="text-text/50 text-xs leading-relaxed">
                {ability.overdrive}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 서브 컴포넌트: Cross-Style 카드 ── */

function CrossStyleCardItem({ card }: { card: CrossStyleCardData }) {
  return (
    <div className="flex-1" style={{ backgroundColor: "#111111" }}>
      {/* 상단 컬러 라인 */}
      <div className="h-px" style={{ backgroundColor: card.topColor }} />

      <div className="p-4">
        {/* 태그 */}
        <div
          className="text-[10px] tracking-[0.2em] mb-2"
          style={{ color: card.topColor, fontFamily: MONO_FONT }}
        >
          {card.tag}
        </div>

        {/* 이름 */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-sm font-bold tracking-wider text-text/90">
            {card.name}
          </span>
          <span className="text-text/30 text-xs">{card.nameKo}</span>
        </div>

        {/* 설명 */}
        <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
          {card.description}
        </p>

        {/* 강조 문구 */}
        {card.emphasized && (
          <p
            className="text-xs font-medium mt-2 leading-relaxed"
            style={{ color: "#e5e7eb" }}
          >
            {card.emphasized}
          </p>
        )}
      </div>
    </div>
  );
}

function CrossStyleSection() {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
        Cross-Style Combat
      </h3>
      <p className="text-text/40 text-xs mb-4 italic">
        "모든 것은 대가 없이는 불가능하다."
      </p>

      <div className="flex flex-col md:flex-row gap-3">
        {CROSS_STYLES.map((card) => (
          <CrossStyleCardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */

export default function AbilitySystem() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleCard = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-8">
      {/* 섹션 1: 두 개의 체계 */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 500ms ease-out, transform 500ms ease-out",
        }}
      >
        <SystemPanels />
      </div>

      {/* 섹션 2: 능력 카드 */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition:
            "opacity 500ms ease-out 150ms, transform 500ms ease-out 150ms",
        }}
      >
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-3 font-semibold">
          능력 체계
        </h3>
        <div className="flex flex-col gap-2">
          {ABILITIES.map((ability) => (
            <AbilityCardItem
              key={ability.id}
              ability={ability}
              isExpanded={expandedId === ability.id}
              onToggle={() => toggleCard(ability.id)}
            />
          ))}
        </div>
      </div>

      {/* 섹션 3: Cross-Style Combat */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition:
            "opacity 500ms ease-out 300ms, transform 500ms ease-out 300ms",
        }}
      >
        <CrossStyleSection />
      </div>
    </div>
  );
}
