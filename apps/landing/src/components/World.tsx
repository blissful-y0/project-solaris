import { useEffect, useRef, useState, type ReactNode } from "react";

/* ─── 키워드 하이라이트 헬퍼 ─── */

type KwClass = "kw-primary" | "kw-secondary" | "kw-accent";

const KEYWORDS: [string, KwClass][] = [
  ["솔라리스", "kw-primary"],
  ["헬리오스 코어", "kw-secondary"],
  ["석양 의정서", "kw-accent"],
  ["████████", "kw-accent"],
  ["꿈", "kw-accent"],
  ["█", "kw-primary"],
  ["공명 측정 (RESONANCE CALIBRATION)", "kw-primary"],
];

function highlight(text: string): ReactNode {
  const pattern = new RegExp(
    `(${KEYWORDS.map(([w]) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  const map = Object.fromEntries(KEYWORDS);
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    map[part] ? (
      <span key={i} className={map[part]}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/* ─── 스토리 데이터 ─── */

interface StorySection {
  fileId: string;
  label: string;
  access: "restricted" | "classified";
  paragraphs: string[];
}

const STORY: StorySection[] = [
  {
    fileId: "RECORD_001",
    label: "THE FALL",
    access: "restricted",
    paragraphs: [
      "2174년.\n전쟁이 하늘을 태웠다.\n핵화염이 걷힌 자리에 남은 건 — 재, 침묵, 그리고 살아남았다는 사실뿐.",
      "생존자들은 폐허 위에 돔을 올렸다. 마지막 도시, 솔라리스.\n돔이 닫히던 날, 바깥에 두고 온 것들에 대해 아무도 말하지 않았다.",
      "태양이 떴다. 아이들이 태어났다. 거리에 웃음소리가 돌아왔다.\n누구도 묻지 않았다 — 저 빛이 진짜인지.",
    ],
  },
  {
    fileId: "RECORD_002",
    label: "HELIOS CORE",
    access: "classified",
    paragraphs: [
      "헬리오스 코어, 도시의 심장. 하늘의 태양. 모든 것의 중심.",
      "그것은 시민을 보호한다. 전력을 공급한다. 기후를 조절한다. 질병을 예측한다.\n덕분에 아무도 배고프지 않다. 아무도 다치지 않는다. 아무도 불안하지 않다.",
      "완벽한 도시. 완벽한 질서. 완벽한 ████████.",
      "그런데 가끔, 아주 가끔 —\n무언가 이상하다고 느끼는 사람들이 있다.",
    ],
  },
  {
    fileId: "RECORD_003",
    label: "DREAM PROTOCOL",
    access: "restricted",
    paragraphs: [
      "이 도시의 시민들은 █을 꾸지 않는다.\n잠들면 아무것도 없다. 어둠. 그리고 아침.",
      "이상한 일이다 — 라고 생각하는 사람은 없다.\n태어나서 한 번도 █을 꾼 적 없는 사람에게, █의 부재는 부재가 아니니까.",
      "하지만 돔 밖으로 쫓겨난 자들은 알게 된다.\n처음 맞는 밤, 처음 보는 것.\n형체 없는 이미지, 죽은 사람의 목소리, 가본 적 없는 장소.",
      "그들은 그것에 이름을 붙인다 — 꿈.",
    ],
  },
  {
    fileId: "RECORD_004",
    label: "SUNSET PROTOCOL",
    access: "classified",
    paragraphs: [
      "15번째 생일.\n케이크도 없고, 축하 노래도 없다.\n하얀 방, 하얀 의자, 이마에 붙는 차가운 센서.",
      "시스템은 당신을 측정한다, 그 숫자는 당신이 된다.",
      "공명 측정 (RESONANCE CALIBRATION)",
      "높다면 — 도시가 당신을 원한다. 능력이 깨어나고, 제복이 주어진다.\n낮다면 — 아무도 설명하지 않는다. 문이 닫히고, 다시는 열리지 않는다.",
      "그 사이 어딘가에 있는 대부분은, 평생 그 숫자를 떠올리지 않는다.",
    ],
  },
];

/* ─── 기밀 문서 블록 ─── */

function ClassifiedBlock({
  section,
  index,
}: {
  section: StorySection;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), index * 150);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  // 블록 등장 후 라인 순차 공개
  useEffect(() => {
    if (!revealed) return;

    const total = section.paragraphs.length;
    let line = 0;
    const interval = setInterval(() => {
      line++;
      setVisibleLines(line);
      if (line >= total) clearInterval(interval);
    }, 180);

    return () => clearInterval(interval);
  }, [revealed, section.paragraphs.length]);

  const accessTag =
    section.access === "classified" ? "access-classified" : "access-restricted";
  const accessLabel =
    section.access === "classified" ? "CLASSIFIED" : "RESTRICTED";

  return (
    <div
      ref={ref}
      className={`classified-block p-5 md:p-8 lg:p-10 transition-opacity duration-700 ${
        revealed ? "revealed opacity-100" : "opacity-0"
      }`}
    >
      {/* HUD 코너 브라켓 */}
      <span
        className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 z-10"
        style={{
          borderTop: "1px solid var(--color-primary)",
          borderLeft: "1px solid var(--color-primary)",
          opacity: revealed ? 0.6 : 0,
          transition: "opacity 0.5s",
        }}
      />
      <span
        className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 z-10"
        style={{
          borderTop: "1px solid var(--color-primary)",
          borderRight: "1px solid var(--color-primary)",
          opacity: revealed ? 0.6 : 0,
          transition: "opacity 0.5s",
        }}
      />
      <span
        className="absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 z-10"
        style={{
          borderBottom: "1px solid var(--color-primary)",
          borderLeft: "1px solid var(--color-primary)",
          opacity: revealed ? 0.6 : 0,
          transition: "opacity 0.5s",
        }}
      />
      <span
        className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 z-10"
        style={{
          borderBottom: "1px solid var(--color-primary)",
          borderRight: "1px solid var(--color-primary)",
          opacity: revealed ? 0.6 : 0,
          transition: "opacity 0.5s",
        }}
      />

      {/* 문서 헤더 */}
      <div className="classified-header relative z-10">
        <span style={{ color: "var(--color-primary)", opacity: 0.7 }}>
          {"▸ "}
        </span>
        {section.fileId} // {section.label}
        <span className={`access-tag ${accessTag}`}>{accessLabel}</span>
      </div>

      {/* 본문 — 라인별 등장 */}
      <div className="flex flex-col gap-3 md:gap-4 relative z-10">
        {section.paragraphs.map((text, i) => (
          <p
            key={i}
            className={`classified-line text-sm md:text-base lg:text-lg text-text/85 leading-relaxed font-light whitespace-pre-line ${
              i < visibleLines ? "show" : ""
            }`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            {highlight(text)}
          </p>
        ))}
      </div>

      {/* 문서 종료 */}
      <p
        className={`classified-end relative z-10 transition-opacity duration-500 ${
          visibleLines >= section.paragraphs.length
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        [END OF RECORD]
      </p>
    </div>
  );
}

/* ─── 메인 섹션 ─── */

export default function World() {
  return (
    <section className="section-shell section-divider">
      <div className="section-inner">
        <div
          className="flex flex-col gap-6 md:gap-8 w-full max-w-3xl"
          style={{ marginInline: "auto" }}
        >
          {STORY.map((section, i) => (
            <ClassifiedBlock key={section.fileId} section={section} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
