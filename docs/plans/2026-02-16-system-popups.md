# 시스템 안내 팝업 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** System 섹션의 4개 카드를 클릭하면 풀스크린 HUD 모달이 열려 각 시스템을 안내하는 팝업 구현

**Architecture:** 단일 `SystemModal.tsx` 컴포넌트가 시스템 ID를 받아 해당 데이터를 렌더링. 데이터는 `systemData.ts`에 분리. `System.tsx`에서 카드 클릭 상태를 관리하고 모달을 조건부 렌더링.

**Tech Stack:** React 19, Tailwind CSS v4, Astro 5 (React island)

**Design doc:** `docs/plans/2026-02-16-system-popups-design.md`

---

### Task 1: 시스템 데이터 파일 생성

**Files:**

- Create: `apps/landing/src/components/systemData.ts`

**Step 1: 데이터 타입 및 플레이스홀더 데이터 작성**

```typescript
export interface SystemSection {
  heading: string;
  body: string;
}

export interface SystemInfo {
  code: string;
  title: string;
  glyph: string;
  description: string;
  sections: SystemSection[];
  notionUrl?: string;
}

export const SYSTEMS: SystemInfo[] = [
  {
    code: "GM",
    glyph: "GM",
    title: "AI GM 전투 판정",
    description: "서술의 논리가 곧 무기다",
    sections: [
      {
        heading: "판정 방식",
        body: "AI GM이 캐릭터의 스탯, 공명율, 상황 맥락을 종합하여 전투 결과를 판정합니다. 서술의 논리성과 창의성이 판정에 영향을 줍니다.",
      },
      {
        heading: "전투 흐름",
        body: "행동 선언 → AI 판정 → 결과 서술. 턴제로 진행되며, 각 턴마다 플레이어의 서술이 전투의 방향을 결정합니다.",
      },
    ],
  },
  {
    code: "SYNC",
    glyph: "SYNC",
    title: "공명율",
    description: "80을 넘는 순간, 인간을 초월한다",
    sections: [
      {
        heading: "공명율 등급",
        body: "0-39 일반 | 40-59 감응 | 60-79 각성 | 80+ 초월. 공명율이 높을수록 강력한 능력을 사용할 수 있지만, 인간성을 잃어갈 위험이 따릅니다.",
      },
      {
        heading: "스킬 체계",
        body: "공명율 등급에 따라 해금되는 스킬이 결정됩니다. 각 진영별 고유 스킬 트리가 존재하며, 선택에 따라 캐릭터의 전투 스타일이 달라집니다.",
      },
    ],
  },
  {
    code: "ARC",
    glyph: "ARC",
    title: "시즌제 스토리",
    description: "당신의 선택이 도시의 운명을 바꾼다",
    sections: [
      {
        heading: "시즌 구조",
        body: "시즌마다 메인 스토리 아크가 진행됩니다. 주요 이벤트와 분기점에서 플레이어들의 선택이 스토리의 방향을 결정합니다.",
      },
      {
        heading: "참여 방식",
        body: "캐릭터의 행동이 세계에 반영됩니다. 진영 선택, 임무 수행, 다른 캐릭터와의 관계가 시즌 스토리에 영향을 미칩니다.",
      },
    ],
  },
  {
    code: "OC",
    glyph: "OC",
    title: "캐릭터 생성",
    description: "당신만의 캐릭터를 만드세요",
    sections: [
      {
        heading: "캐릭터 시트",
        body: "기본 정보, 공명율, 진영 소속, 배경 스토리를 설정합니다. 세계관에 맞는 캐릭터를 구성하기 위한 가이드라인을 제공합니다.",
      },
      {
        heading: "가이드라인",
        body: "솔라리스 돔 내부의 시민이든, 외곽의 추방자든 — 세계관에 어울리는 배경을 가진 캐릭터를 만들어보세요.",
      },
    ],
  },
];
```

**Step 2: 커밋**

```bash
git add apps/landing/src/components/systemData.ts
git commit -m "feat: 시스템 데이터 파일 생성 — GM/SYNC/ARC/OC 4개 시스템 플레이스홀더 데이터"
```

---

### Task 2: SystemModal 컴포넌트 생성

**Files:**

- Create: `apps/landing/src/components/SystemModal.tsx`

**Step 1: 모달 컴포넌트 작성**

풀스크린 오버레이 + HUD 브래킷 프레임 + 열림/닫힘 애니메이션.

```tsx
import { useEffect, useRef, useState } from "react";
import type { SystemInfo } from "./systemData";

interface Props {
  system: SystemInfo;
  onClose: () => void;
}

export default function SystemModal({ system, onClose }: Props) {
  const [phase, setPhase] = useState<"scan" | "expand" | "content" | "closing">(
    "scan",
  );
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 열림 애니메이션 시퀀스
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expand"), 300);
    const t2 = setTimeout(() => setPhase("content"), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // ESC 닫기 + body scroll 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleClose = () => {
    setPhase("closing");
    setTimeout(onClose, 250);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor:
          phase === "closing" ? "transparent" : "rgba(0,0,0,0.8)",
        backdropFilter: phase === "closing" ? "none" : "blur(8px)",
        transition: "background-color 0.25s, backdrop-filter 0.25s",
      }}
    >
      {/* 스캔라인 스윕 (열림 시에만) */}
      {phase === "scan" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(0,212,255,0.15) 50%, transparent 60%)",
            animation: "modal-scan 0.3s linear forwards",
          }}
        />
      )}

      {/* 모달 프레임 */}
      <div
        ref={contentRef}
        className="relative w-full max-w-[640px] max-h-[80vh] overflow-y-auto"
        style={{
          opacity: phase === "scan" ? 0 : phase === "closing" ? 0 : 1,
          transform: phase === "expand" ? "scaleY(0.95)" : "scaleY(1)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <div className="relative p-8 md:p-12 bg-bg/95">
          {/* HUD 코너 브래킷 */}
          <span
            className="absolute top-0 left-0 w-5 h-5"
            style={{
              borderTop: "1px solid var(--color-primary)",
              borderLeft: "1px solid var(--color-primary)",
            }}
          />
          <span
            className="absolute top-0 right-0 w-5 h-5"
            style={{
              borderTop: "1px solid var(--color-primary)",
              borderRight: "1px solid var(--color-primary)",
            }}
          />
          <span
            className="absolute bottom-0 left-0 w-5 h-5"
            style={{
              borderBottom: "1px solid var(--color-primary)",
              borderLeft: "1px solid var(--color-primary)",
            }}
          />
          <span
            className="absolute bottom-0 right-0 w-5 h-5"
            style={{
              borderBottom: "1px solid var(--color-primary)",
              borderRight: "1px solid var(--color-primary)",
            }}
          />

          {/* 닫기 버튼 — 우측 상단 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                       text-text/50 hover:text-primary transition-colors cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>

          {/* 헤더: 글리프 + 타이틀 */}
          <div
            className="flex items-center gap-4 mb-6"
            style={{
              opacity: phase === "content" ? 1 : 0,
              transform:
                phase === "content" ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
            }}
          >
            <div className="system-glyph pulse">{system.glyph}</div>
            <h2 className="text-xl md:text-2xl font-bold text-primary text-glow-cyan">
              {system.title}
            </h2>
          </div>

          {/* 구분선 */}
          <div
            className="h-px mb-6"
            style={{
              background:
                "linear-gradient(to right, var(--color-primary), transparent)",
              opacity: phase === "content" ? 0.4 : 0,
              transition: "opacity 0.4s ease 0.2s",
            }}
          />

          {/* 콘텐츠 섹션 */}
          {system.sections.map((section, i) => (
            <div
              key={section.heading}
              className="mb-6 last:mb-0"
              style={{
                opacity: phase === "content" ? 1 : 0,
                transform:
                  phase === "content" ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.4s ease ${0.2 + i * 0.1}s, transform 0.4s ease ${0.2 + i * 0.1}s`,
              }}
            >
              <h3 className="text-sm font-bold text-primary/80 uppercase tracking-widest mb-2">
                {section.heading}
              </h3>
              <p className="text-text/70 text-sm md:text-base leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}

          {/* 하단 구분선 + 노션 링크 */}
          {system.notionUrl && (
            <>
              <div
                className="h-px mt-6 mb-4"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--color-primary), transparent)",
                  opacity: phase === "content" ? 0.3 : 0,
                  transition: "opacity 0.4s ease 0.4s",
                }}
              />
              <div
                style={{
                  opacity: phase === "content" ? 1 : 0,
                  transition: "opacity 0.4s ease 0.5s",
                }}
              >
                <a
                  href={system.notionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary/60 hover:text-primary transition-colors"
                >
                  상세 문서 보기 →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 모달 스캔라인 키프레임 CSS 추가**

`apps/landing/src/styles/global.css`에 추가:

```css
/* 모달 열림 스캔라인 */
@keyframes modal-scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}
```

**Step 3: 커밋**

```bash
git add apps/landing/src/components/SystemModal.tsx apps/landing/src/styles/global.css
git commit -m "feat: SystemModal 컴포넌트 — 풀스크린 HUD 모달, 스캔라인 열림 애니메이션, ESC/배경클릭 닫기"
```

---

### Task 3: System.tsx에 모달 연결

**Files:**

- Modify: `apps/landing/src/components/System.tsx`

**Step 1: System.tsx 수정 — FEATURES를 SYSTEMS로 교체, 클릭 핸들러 + 모달 렌더링 추가**

주요 변경:

1. `FEATURES` 배열 삭제 → `systemData.ts`의 `SYSTEMS` import
2. `FeatureCard`에 `onClick` prop 추가, `cursor-pointer` 적용
3. `System` 컴포넌트에 `selectedSystem` state 추가
4. 조건부 `SystemModal` 렌더링

```tsx
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
      {/* HUD 코너 브라켓 — 동일 */}
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
```

**Step 2: 커밋**

```bash
git add apps/landing/src/components/System.tsx
git commit -m "feat: System 카드 클릭 → 모달 연결 — DREAM→OC 교체, 클릭 핸들러, SystemModal 조건부 렌더링"
```

---

### Task 4: 빌드 검증 및 최종 확인

**Step 1: 빌드 테스트**

```bash
cd /Users/bliss/Documents/project-solaris && pnpm --filter landing build
```

Expected: 빌드 성공, 에러 없음

**Step 2: 로컬 dev 서버로 수동 확인**

```bash
pnpm --filter landing dev
```

확인 사항:

- [ ] System 섹션에 4개 카드 (GM, SYNC, ARC, OC) 표시
- [ ] 각 카드 hover 시 글로우 + 커서 포인터
- [ ] 카드 클릭 → 풀스크린 모달 오픈 (스캔라인 → 확장 → 콘텐츠)
- [ ] 모달 내 글리프 + 타이틀 + 섹션 표시
- [ ] X 버튼 / ESC / 배경 클릭으로 닫기
- [ ] 닫힘 애니메이션 동작
- [ ] 모바일 반응형 (좁은 뷰포트에서 스크롤 가능)

**Step 3: 최종 커밋 (필요 시 수정 후)**

```bash
git add -A
git commit -m "fix: 시스템 팝업 빌드 검증 후 수정사항"
```
