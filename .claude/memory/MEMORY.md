# Project Solaris Memory

## Project Character
- **장르**: 포스트아포칼립틱 자캐(OC) 커뮤니티. AI GM 텍스트 TRPG 플랫폼.
- **유저 특성**: 세계관 텍스트를 직접 작성함. 반말체(~한다, ~이다) 선호. 구현 후 직접 파일을 수정하는 빈도 높음 → 커밋 전 반드시 `git diff` 확인.
- **작업 흐름**: 비주얼 확인 → 피드백 → 반복 수정이 기본 루프. 한 컴포넌트에 5~6회 수정 거치는 게 일반적.
- **디자인 판단**: 유저가 직접 내림. 과도한 제안/자동화보다 빠른 반영이 중요.
- **커밋 규칙**: 한국어 메시지 + 코드 주석도 한국어. feature branch 전략.
- **Git**: PR merge commit 사용 (squash 아님), 브랜치 유지.

## 세계관 핵심 용어
- **SOLARIS**: 도시 이름. 프로젝트명.
- **HELIOS**: 도시 관장 AI 시스템. 뉴스/전투판정/관리 등 모든 시스템의 주체.
- **Bureau (SBCS)**: Solaris Bureau of Civic Security. 보안국. 동조형. 시안 컬러.
- **Static**: 저항 세력. 비동조형. 레드 컬러. 소속명: "The Static"
- **하모닉스 프로토콜**: Bureau 능력 체계. WILL 소모.
- **오버드라이브**: Static 능력 체계. HP 소모.
- **능력 계열 4종**: 역장(Field), 감응(Empathy), 변환(Shift), 연산(Compute)
- **HP**: 회복 가능. Static 120 / Bureau 80 / 전향자 100
- **WILL**: 회복 불가 (영구 소모). Bureau 250 / Static 150 / 전향자 200
- 뉴스피드 헤더: "HELIOS INTELLIGENCE FEED"
- 목 캐릭터: 아마츠키 레이 (Bureau, 역장)

## Project Structure
- Monorepo: Turborepo + pnpm workspaces
- Landing: `apps/landing/` — Astro 5 + React + Tailwind CSS v4 (`@tailwindcss/vite`)
- Dashboard: `apps/dashboard/` — Next.js 15 + @supabase/ssr + Tailwind CSS v4 (`@tailwindcss/postcss`)
- Design: cyberpunk/post-apocalyptic, Korean UI text, HUD corner brackets
- Colors: primary=#00d4ff (cyan), secondary=#93c5fd (SDF blue), accent=#dc2626 (red/Static)

## Dashboard 구현 현황 (2026-02-18)

### 인프라 + 인증 (PR #15)
- Tailwind v4 + Vitest + 디자인 토큰
- UI 아톰 6종: Button, Input, Badge, Card, Modal, Skeleton
- 레이아웃: TopBar, MobileTabBar, DesktopSidebar, DashboardLayout
- Discord OAuth (Supabase SSR 쿠키 세션 PKCE flow)

### 캐릭터 생성 위자드 (PR #18)
- 5단계 위자드 + useDraftSave (localStorage 자동 저장)

### 홈 페이지 리디자인 (PR #23)
- **CitizenIDCard**: 시민 신분증 카드 (next/image 아바타, RR%, HP 배터리 5세그먼트, WILL 파형 SVG)
  - Bureau → "Solaris Bureau of Civic Security", Static → "The Static"
  - 단일 카드 (flip 없음), 하단에 능력 계열 + 등록일
  - 빈 카드(미등록) → `/character/create` CTA 통합
- **ResonanceTasks**: HELIOS 지시 시스템 (BATTLE/SYSTEM/RP Badge + Link)
- **PomiAd**: 프로파간다 광고 (rounded-xl pill 라벨, 귀여운 "~하세요!" 톤)
- **BriefingFeed**: 헤더 "HELIOS INTELLIGENCE FEED", 3개마다 PomiAd 삽입
- DEV 토글: 미등록/Bureau/Static 3단 전환 (배포 전 제거)

### 테스트 현황 (244건 통과)
- UI/레이아웃/로그인/브리핑/캐릭터 + CitizenIDCard(23), ResonanceTasks(10), PomiAd(4)

## Dashboard Auth 아키텍처
- `@supabase/ssr` 쿠키 세션 (PKCE flow)
- `lib/supabase/client.ts`: 브라우저용
- `lib/supabase/server.ts`: 서버 컴포넌트용
- `lib/supabase/middleware.ts`: 세션 갱신 + 리다이렉트
- `env.client.ts`: process.env 개별 키 직접 참조 (전체 객체 넘기면 클라이언트에서 undefined)
- `.env.local`: gitignore됨, worktree 시 수동 복사 필요

## Dashboard 컴포넌트 패턴
- `cn()` 유틸리티: `import { cn } from "@/lib/utils"`
- UI 아톰: `import { Button, Card, Badge, Modal } from "@/components/ui"`
- 홈: `import { CitizenIDCard, ResonanceTasks, BriefingFeed } from "@/components/home"`
- 이미지: `next/image` Image 컴포넌트 사용 (유저 선호)
- 장식 최소화: HUD 코너 + 글로우 정도만. 블러 원형/스캔라인 자제.

## 용어 변경 이력
- `동조율` → `공명율` (2026-02-16)
- `SYNC RATE` → `RESONANCE RATE`
- `HELIOS NEWS` → `HELIOS INTELLIGENCE FEED` (홈 피드 헤더, 2026-02-18)
- Static 소속명: `The Static` (2026-02-18)

## Dev Workflow
- 대시보드 빌드: `pnpm --filter @solaris/dashboard build`
- 대시보드 테스트: `cd apps/dashboard && npx vitest run`
- 대시보드 dev: `pnpm --filter dashboard dev` (port 3001)
- `.next` 캐시 문제 시: `rm -rf apps/dashboard/.next`

## Lessons Learned
- See `lessons-learned.md` for detailed notes.
