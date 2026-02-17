# Project Solaris Memory

## Project Character
- **장르**: 포스트아포칼립틱 자캐(OC) 커뮤니티. AI GM 텍스트 TRPG 플랫폼.
- **유저 특성**: 세계관 텍스트를 직접 작성함. 반말체(~한다, ~이다) 선호. 구현 후 직접 파일을 수정하는 빈도 높음 → 커밋 전 반드시 `git diff` 확인.
- **작업 흐름**: 비주얼 확인 → 피드백 → 반복 수정이 기본 루프. 한 컴포넌트에 5~6회 수정 거치는 게 일반적.
- **디자인 판단**: 유저가 직접 내림. "이렇게 해줘" 식의 구체적 시안 제공이 많음. 과도한 제안/자동화보다 빠른 반영이 중요.

## Tailwind v4 Critical Pattern
- **NEVER write unlayered `* { margin: 0; padding: 0 }` resets** — Tailwind v4 preflight handles this in `@layer base`. Unlayered CSS overrides ALL Tailwind utility classes.
- **`position: fixed/absolute` in Tailwind v4**: unlayered CSS (e.g. `.section-shell > *`) can override utility classes. 해결: `createPortal(jsx, document.body)`로 DOM 트리 탈출.
- See `tailwind-v4.md` for details.

## React Portal Pattern (Modal)
- `.section-shell > *` 가 unlayered `position: relative; z-index: 1` 설정 → Tailwind의 `fixed` 클래스 무력화.
- **해결**: `createPortal(jsx, document.body)` 사용. 모달은 반드시 포탈로 렌더링.
- 모달 높이 `92vh`, `flex flex-col` + 내부 `overflow-y-auto`로 HUD 브래킷 고정 + 콘텐츠 스크롤 분리.

## React Animation State Machine
- setTimeout 체인에서 `setPhase("closing")` 경합 조건: 사용자가 닫기 누르면 setTimeout 콜백이 "closing"을 덮어씀.
- **해결**: `setPhase((prev) => prev === "closing" ? prev : "expand")` — functional update로 가드.
- `useEffect` 안에서 state 변수 의존 + `setStep()` + `setTimeout()` 조합 시 cleanup이 타이머 킬함 → **별도 effect로 분리**.

## Project Structure
- Monorepo: Turborepo + pnpm workspaces
- Landing: `apps/landing/` — Astro 5 + React + Tailwind CSS v4 (`@tailwindcss/vite`)
- Dashboard: `apps/dashboard/` — Next.js 15
- Design: cyberpunk/post-apocalyptic, Korean UI text, HUD corner brackets
- Colors: primary=#00d4ff (cyan), secondary=#93c5fd (SDF blue), accent=#dc2626 (red/Static)

## 용어 변경 이력
- `동조율` → `공명율` (2026-02-16): 전체 코드베이스 + 문서 일괄 변경 완료
- `SYNC RATE` → `RESONANCE RATE`
- `DREAM` 시스템 → `OC` (캐릭터 생성)으로 교체
- `HELIOS GM` → `HELIOS COMBAT SYSTEM` (CombatDemo)
- ARC 타이틀: `시즌제 스토리` → `사건 발생 시스템`

## Modal System Architecture
- `systemData.ts`: 4개 시스템 (GM, SYNC, ARC, OC) 데이터. description은 optional.
- `SystemModal.tsx`: 공통 모달 프레임. code별 분기:
  - `SYNC` → `ResonanceGauge.tsx` (3구간 게이지)
  - `ARC` → `SeasonTeaser.tsx` (브리핑 버블)
  - `GM` → 기본 섹션 + `CombatDemo.tsx` (채팅 UI)
  - `OC` → 기본 섹션 (아직 커스텀 없음)
- 공통 heading 패턴: `text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold`

## CSS Keyframes Registry (global.css)
- `modal-scan`: 모달 열림 스캔라인
- `bubble-in`: 채팅 버블 등장
- `typing-dot`: 타이핑 인디케이터
- `gauge-glitch-1/2`: 80 경계 앰버 글리치
- `gauge-glitch-red-1/2`: 15 경계 레드 글리치
- `gauge-red-pulse`: ~15 구간 레드 펄스
- `season-tease-pulse`: Coming Soon 텍스트 펄스

## Dev Workflow
- `?skip` URL param bypasses hero cinematic sequence for testing
- 빌드 확인: `pnpm --filter landing build`
- 브랜치: `feat/system-popups` (from main via develop)

## Lessons Learned (2026-02-16)
- See `lessons-learned.md` for detailed notes.
