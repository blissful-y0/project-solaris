# 헤더 + 재방문자 히어로 스킵 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 랜딩 페이지에 고정 헤더(로고 + 네비 + Discord 버튼)를 추가하고, 재방문자는 히어로 시네마틱을 스킵하도록 한다.

**Architecture:** Astro 정적 컴포넌트로 Header를 만들고, 인라인 스크립트로 표시/숨김 제어. Hero.tsx에 localStorage 기반 재방문 감지 로직 추가. 각 섹션 컴포넌트에 scroll target용 id를 부여.

**Tech Stack:** Astro 5, React, Tailwind CSS v4, TypeScript

---

## Task 1: Feature Branch 생성

**Step 1: 브랜치 생성**

```bash
git checkout -b feat/landing-header
```

---

## Task 2: Header.astro 컴포넌트 생성

**Files:**
- Create: `apps/landing/src/components/Header.astro`

**Step 1: Header.astro 작성**

```astro
---
// 고정 헤더 — 로고 + 네비게이션 + Discord 로그인
---

<header
  id="site-header"
  class="fixed top-0 left-0 right-0 z-50 header-hidden"
>
  <div class="header-inner">
    <!-- 로고 -->
    <a href="/" class="header-logo">
      <span class="font-mono text-xs tracking-[0.2em] text-primary/40">PROJECT</span>
      <span class="font-bold tracking-[0.08em] text-primary text-glow-cyan">SOLARIS</span>
    </a>

    <!-- 네비게이션 -->
    <nav class="header-nav">
      <a href="#section-world" class="header-link">세계관</a>
      <a href="#section-factions" class="header-link">진영</a>
      <a href="#section-system" class="header-link">시스템</a>
    </nav>

    <!-- Discord 버튼 -->
    <a
      href="#"
      class="header-discord"
      aria-label="Discord로 로그인"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    </a>
  </div>
</header>

<script is:inline>
  // 헤더 표시/숨김 제어
  function showHeader() {
    const header = document.getElementById('site-header');
    if (header) {
      header.classList.remove('header-hidden');
      header.classList.add('header-visible');
    }
  }

  // 히어로 완료 이벤트 수신
  window.addEventListener('solaris:hero-done', showHeader, { once: true });

  // 재방문자: 히어로 스킵 시 즉시 표시
  window.addEventListener('solaris:hero-skipped', showHeader, { once: true });
</script>
```

**Step 2: 커밋**

```bash
git add apps/landing/src/components/Header.astro
git commit -m "feat: Header.astro 컴포넌트 생성 — 로고 + 네비 + Discord 아이콘"
```

---

## Task 3: 헤더 CSS 스타일 추가

**Files:**
- Modify: `apps/landing/src/styles/global.css` (끝에 추가)

**Step 1: global.css 끝에 헤더 스타일 추가**

```css
/* ========================================
   사이트 헤더 — 고정 상단 바
   ======================================== */
.header-hidden {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}

.header-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

#site-header {
  transition: opacity 0.7s ease, transform 0.7s ease;
  background: rgba(10, 10, 15, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in oklab, var(--color-primary) 15%, transparent);
  box-shadow: 0 1px 20px rgba(0, 212, 255, 0.06);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1100px, 100%);
  margin-inline: auto;
  padding: 0.75rem 1.25rem;
}

.header-logo {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  text-decoration: none;
  gap: 0;
}

.header-nav {
  display: flex;
  gap: 2rem;
}

.header-link {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-text) 50%, transparent);
  text-decoration: none;
  transition: color 0.3s ease, text-shadow 0.3s ease;
  padding: 0.25rem 0;
}

.header-link:hover {
  color: var(--color-primary);
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.header-discord {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  background: color-mix(in oklab, var(--color-discord) 90%, black);
  color: white;
  text-decoration: none;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  box-shadow: 0 0 10px rgba(88, 101, 242, 0.2);
}

.header-discord:hover {
  transform: scale(1.08);
  box-shadow: 0 0 16px rgba(88, 101, 242, 0.45), 0 0 40px rgba(88, 101, 242, 0.15);
}

/* 모바일 헤더 */
@media (max-width: 768px) {
  .header-inner {
    padding: 0.625rem 1rem;
  }

  .header-nav {
    gap: 1.25rem;
  }

  .header-link {
    font-size: 0.6rem;
  }

  .header-discord {
    width: 2rem;
    height: 2rem;
  }

  .header-discord svg {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 480px) {
  .header-nav {
    display: none;
  }
}
```

**Step 2: 커밋**

```bash
git add apps/landing/src/styles/global.css
git commit -m "style: 헤더 CSS 스타일 — 고정 상단, 반투명 블러, 슬라이드인 트랜지션, 모바일 반응형"
```

---

## Task 4: 섹션 ID 추가 (네비 스크롤 타겟)

**Files:**
- Modify: `apps/landing/src/components/World.tsx` — 최상위 `<section>`에 `id="section-world"` 추가
- Modify: `apps/landing/src/components/Factions.tsx` — 최상위 `<section>`에 `id="section-factions"` 추가
- Modify: `apps/landing/src/components/System.tsx` — 최상위 `<section>`에 `id="section-system"` 추가

**Step 1: World.tsx**

`<section className="section-shell section-divider">` → `<section id="section-world" className="section-shell section-divider">`

**Step 2: Factions.tsx**

`<section className="section-shell section-divider">` → `<section id="section-factions" className="section-shell section-divider">`

**Step 3: System.tsx**

`<section className="section-shell section-divider">` → `<section id="section-system" className="section-shell section-divider">`

**Step 4: 커밋**

```bash
git add apps/landing/src/components/World.tsx apps/landing/src/components/Factions.tsx apps/landing/src/components/System.tsx
git commit -m "feat: 섹션별 id 추가 — 헤더 네비게이션 스크롤 타겟 (#section-world, #section-factions, #section-system)"
```

---

## Task 5: index.astro에 Header 삽입

**Files:**
- Modify: `apps/landing/src/pages/index.astro`

**Step 1: Header import 추가 및 `<main>` 앞에 삽입**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import Hero from "../components/hero";
import World from "../components/World";
import Factions from "../components/Factions";
import System from "../components/System";
import Join from "../components/Join.astro";
import Footer from "../components/Footer.astro";
import "../styles/global.css";
---

<BaseLayout>
  <Header />
  <main>
    ...기존 그대로...
  </main>
  <Footer />
</BaseLayout>
```

**Step 2: 커밋**

```bash
git add apps/landing/src/pages/index.astro
git commit -m "feat: index.astro에 Header 컴포넌트 삽입"
```

---

## Task 6: Hero.tsx — 재방문자 스킵 로직

**Files:**
- Modify: `apps/landing/src/components/hero/Hero.tsx`

**Step 1: localStorage 기반 재방문 감지 추가**

기존 `useDevSkip` 아래에:

```tsx
const HERO_STORAGE_KEY = 'solaris:hero-completed';
const HERO_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function useReturningVisitor(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(HERO_STORAGE_KEY);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    return Date.now() - timestamp < HERO_EXPIRY_MS;
  } catch {
    return false;
  }
}
```

**Step 2: Hero 컴포넌트에서 스킵 로직 통합**

```tsx
export default function Hero() {
  const devSkip = useDevSkip();
  const returning = useReturningVisitor();
  const skip = devSkip || returning;

  const [phase, setPhase] = useState<HeroPhase>(skip ? "done" : "boot");
  const [choice, setChoice] = useState<CardChoice | null>(skip ? "unknown" : null);

  // 스킵 시 이벤트 발사 (기존 로직 유지 + 재방문 이벤트 추가)
  useEffect(() => {
    if (!skip) return;
    window.dispatchEvent(new CustomEvent("solaris:hero-selected", { detail: { choice: "unknown" } }));
    window.dispatchEvent(new CustomEvent("solaris:hero-done"));
    if (returning && !devSkip) {
      window.dispatchEvent(new CustomEvent("solaris:hero-skipped"));
    }
  }, [skip, returning, devSkip]);

  // 히어로 완료 시 localStorage에 타임스탬프 저장
  useEffect(() => {
    if (phase === "done" && !skip) {
      try {
        localStorage.setItem(HERO_STORAGE_KEY, String(Date.now()));
      } catch { /* localStorage 사용 불가 시 무시 */ }
    }
  }, [phase, skip]);
```

**Step 3: 재방문자용 간단 메시지 표시 (done 상태에서)**

기존 `phase === "done"` 블록 수정:

```tsx
{phase === "done" && (
  <div className="text-center animate-[fadeIn_0.8s_ease]">
    <p className="hud-label mb-2">
      {returning ? "SYSTEM CONNECTED" : "SYSTEM READY"}
    </p>
    {!returning && (
      <div className="scroll-arrow mt-4">
        <svg ...>...</svg>
      </div>
    )}
  </div>
)}
```

재방문자는 "SYSTEM CONNECTED" 표시 후 즉시 스크롤.

**Step 4: 커밋**

```bash
git add apps/landing/src/components/hero/Hero.tsx
git commit -m "feat: 재방문자 히어로 스킵 — localStorage 7일 기억, SYSTEM CONNECTED 메시지"
```

---

## Task 7: 빌드 검증 및 시각 확인

**Step 1: 빌드 확인**

```bash
cd apps/landing && pnpm build
```

**Step 2: 개발 서버에서 확인**

```bash
pnpm dev
```

확인 사항:
- 히어로 완료 후 헤더 슬라이드인
- 네비 링크 클릭 시 smooth scroll
- Discord 아이콘 hover glow
- 모바일 반응형 (480px 이하에서 네비 숨김)
- `?skip` 파라미터로 즉시 확인
- 재방문 시 히어로 스킵 + SYSTEM CONNECTED

**Step 3: 최종 커밋 (필요 시)**

빌드/시각 이슈 수정 후 커밋.

---

## Task 8: 브랜치 정리 및 머지

**Step 1: develop 브랜치로 머지**

```bash
git checkout develop
git merge feat/landing-header
git push
```
