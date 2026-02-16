# PROJECT SOLARIS — Claude Code 작업 가이드

## 프로젝트 개요
포스트아포칼립틱 자캐(OC) 커뮤니티 웹서비스. AI GM이 운영하는 텍스트 TRPG 플랫폼.

## Git 규칙
- **master에 직접 커밋 금지** — 반드시 feature branch 사용
- **커밋 메시지는 한글로, 최대한 디테일하게:**
  - `feat: 히어로 섹션 구현 — 헬리오스 타이핑 애니메이션, CSS 스캔라인 오버레이, 3개 진영 선택 카드`
  - `chore: 모노레포 초기 구조 — Turborepo + pnpm, Astro 5 랜딩 + Next.js 15 대시보드 껍데기`
- feature branch 명명: `feat/monorepo-setup`, `feat/landing-hero`, `feat/landing-sections` 등
- 각 branch 완료 시 master로 merge 후 push

## 기술 스택
- **모노레포:** Turborepo + pnpm workspaces
- **랜딩 (apps/landing):** Astro 5 + TypeScript + Tailwind CSS v4
- **대시보드 (apps/dashboard):** Next.js 15 (빈 껍데기만, Phase 1에서 구현)
- **공유:** packages/ui (컴포넌트), packages/config (tsconfig + tailwind)
- **배포:** Vercel
- **인증 (예정):** Supabase Auth + Discord OAuth

## 디자인 시스템

### 컬러 팔레트
- `--bg`: #0a0a0f (거의 검정)
- `--primary`: #f59e0b (앰버/골드 — 거짓 태양)
- `--accent`: #ef4444 (레드 — 위험/레지스탕스)
- `--text`: #e5e7eb (밝은 회색)
- `--subtle`: #1f2937 (다크 그레이, 보더/카드)
- 네온 글로우: box-shadow로 앰버/레드 발광 효과

### 비주얼 스타일
- **다크 SF, 포스트아포칼립틱 게임 소개 사이트**
- **CSS 중심** — 이미지 최소화. 네온 글로우, 스캔라인, 그리드 오버레이, 글리치, 타이핑 애니메이션 전부 CSS로
- CSS 노이즈/그레인 텍스처를 body에 오버레이
- 스크롤 기반 애니메이션 (Intersection Observer + CSS transition)

### 폰트
- Pretendard Variable (한글 서브셋, `font-display: swap`, preload)

### 반응형
- **모바일 퍼스트** 설계
- 브레이크포인트: sm(640px), md(768px), lg(1024px)

## 성능 목표
- Lighthouse 95+ 전 항목
- LCP < 1.5s, FID < 50ms, CLS < 0.05
- Astro 정적 빌드로 JS 최소화
- 이미지 사용 시 webp + srcset + blur placeholder

## 전체 한국어 텍스트
모든 UI 텍스트는 한국어로 작성.
