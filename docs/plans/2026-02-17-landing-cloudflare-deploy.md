# Landing Cloudflare Pages 배포 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `apps/landing`을 Cloudflare Pages에 배포하고, 기존 Cloudflare 도메인을 연결해 프로덕션 접근 경로를 확정한다.

**Architecture:** Astro 정적 사이트(`@solaris/landing`)를 Cloudflare Pages 글로벌 CDN에서 서빙한다. 모노레포의 같은 GitHub 레포를 플랫폼별로 연결하는 구조로, 백엔드(Railway)와 대시보드(Vercel/Railway)는 이후 단계에서 각각 별도 연결한다.

**Tech Stack:** Astro 5, pnpm workspace, Cloudflare Pages, Cloudflare DNS

---

## 1) 범위 정의 (랜딩 우선)

### 포함
- `apps/landing` Cloudflare Pages 빌드/배포 파이프라인 구성
- Cloudflare 커스텀 도메인 연결
- 보안 헤더(`_headers`) 설정
- 롤백 절차 문서화

### 제외 (후속 단계)
- Dashboard (Next.js 15) 배포 — Railway 또는 Vercel
- AI agent worker — Railway
- 실시간 채팅/Redis

---

## 2) 플랫폼별 역할 분담

리뷰 결과 "서비스 특성에 맞는 플랫폼 선택"으로 결정:

| 서비스 | 특성 | 플랫폼 |
|--------|------|--------|
| Landing (Astro static) | 정적 파일, 글로벌 CDN | **Cloudflare Pages** |
| Dashboard (Next.js 15) | SSR, 동적 | Railway 또는 Vercel (추후) |
| AI Agent Workers | 장시간 연산, 상태 유지 | Railway (추후) |
| Auth/DB | 관리형 서비스 | Supabase |

모노레포(같은 GitHub repo)를 여러 플랫폼에 동시 연결, 각 플랫폼에서 `--filter`로 해당 앱만 빌드.

---

## 3) 최종 설계

### 3-1. Cloudflare Pages 설정

- **Repository**: `blissful-y0/project-solaris`
- **Production branch**: `main`
- **Build command**: `pnpm install --frozen-lockfile && pnpm --filter @solaris/landing build`
- **Build output directory**: `apps/landing/dist`
- **Environment variables**:
  - `PUBLIC_SUPABASE_URL` = `https://jasjvfkbprkzxhsnxstd.supabase.co`
  - `PUBLIC_SUPABASE_ANON_KEY` = `(anon key)`
  - `NODE_VERSION` = `20`

### 3-2. 커스텀 도메인

- Cloudflare Pages에서 커스텀 도메인 추가 (같은 Cloudflare 계정이면 DNS 자동 연결)
- 루트 도메인 → `www` 리다이렉트: Redirect Rules 사용
  - When: `hostname eq "example.com"`
  - Then: Dynamic redirect → `https://www.example.com` (301, preserve path+query)
- 루트 도메인에 더미 A 레코드(`192.0.2.1`, 프록시 ON) 필요 (리다이렉트 수신용)

### 3-3. 보안 헤더 (`apps/landing/public/_headers`)

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

> CSP는 Supabase/Discord CDN/jsdelivr 출처를 허용해야 하므로 배포 후 테스트하며 조정.

### 3-4. 브랜치/환경 전략

- `main` 푸시 → 프로덕션 자동 배포
- PR 생성 → 프리뷰 배포 자동 생성 (Cloudflare Pages 기본 기능)
- 롤백: Cloudflare Pages 대시보드에서 이전 배포 클릭 한 번

---

## 4) 실행 태스크

### Task 1: 로컬 빌드 검증
**Step 1:** 랜딩 빌드
Run: `pnpm --filter @solaris/landing build`

**Step 2:** 산출물 확인
Check: `apps/landing/dist/index.html` 존재 여부

### Task 2: 보안/캐싱 파일 추가

**Step 1:** `apps/landing/public/_headers` 생성 — 보안 헤더 + 캐싱 정책

**Step 2:** `apps/landing/public/robots.txt` 생성 — 초기 배포 시 인덱싱 차단
```
User-agent: *
Disallow: /
```
> 정식 오픈 시 허용으로 변경

**Step 3:** `supabase.ts` 환경변수 검증 추가
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
```

### Task 3: Cloudflare Pages 프로젝트 생성

**Step 1:** Cloudflare Dashboard → Pages → Create a project → Connect to Git
- Repository: `blissful-y0/project-solaris`

**Step 2:** 빌드 설정 입력
- Build command: `pnpm install --frozen-lockfile && pnpm --filter @solaris/landing build`
- Build output directory: `apps/landing/dist`
- Root directory: (비워두기 — 모노레포 루트)

**Step 3:** 환경변수 입력
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `NODE_VERSION=20`

**Step 4:** 첫 배포 트리거
Expected: 빌드 성공, `*.pages.dev` 도메인으로 접근 가능

### Task 4: 커스텀 도메인 연결

**Step 1:** Cloudflare Pages → Custom domains → 도메인 추가
Expected: 같은 Cloudflare 계정이면 DNS 자동 설정

**Step 2:** 루트 도메인 리다이렉트 설정
- Cloudflare DNS에 루트 도메인 A 레코드 `192.0.2.1` (프록시 ON)
- Rules → Redirect Rules에서 루트 → www 301 리다이렉트

**Step 3:** SSL/TLS 확인
- Full (Strict) 모드 활성화
- HSTS 활성화

### Task 5: 배포 검증

**Step 1:** 기능 검증
Check: Hero 시퀀스, 모달, 모바일 헤더, 애니메이션, Discord 로그인 버튼

**Step 2:** 보안 헤더 검증
Run: `curl -I https://www.example.com` — 헤더 확인

**Step 3:** 성능 측정
Check: Lighthouse (목표 95+), LCP < 1.5s

**Step 4:** 롤백 경로 확인
Check: Cloudflare Pages 대시보드 → Deployments → 이전 버전 선택 가능 확인

### Task 6: Supabase Auth URL 설정 업데이트

**Step 1:** Supabase Dashboard → Authentication → URL Configuration
- Site URL: `https://www.example.com` (프로덕션 도메인)
- Redirect URLs: `https://www.example.com`, `http://localhost:4321`

**Step 2:** Discord Developer Portal → OAuth2 → Redirects
- 기존 Supabase callback URL은 그대로 유지

### Task 7: 문서/커밋

**Step 1:** 운영 문서 업데이트
- Cloudflare Pages 프로젝트 URL
- 커스텀 도메인 설정값
- 배포/롤백 절차

**Step 2:** 커밋
```bash
git add apps/landing/public/_headers apps/landing/public/robots.txt docs/plans/
git commit -m "chore: 랜딩 Cloudflare Pages 배포 설정 — 보안 헤더, robots.txt, 배포 계획"
```

---

## 5) 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| Cloudflare Pages 빌드 실패 | `pnpm install` 시 모노레포 전체 의존성 설치 → 빌드 시간 초과 가능. `NODE_VERSION` 환경변수 확인 |
| DNS 전파 지연 | 같은 Cloudflare 계정이면 즉시 적용. 외부 DNS는 TTL 짧게 설정 |
| 환경변수 누락 | `supabase.ts`에 검증 로직 추가로 빌드 타임에 즉시 감지 |
| 플랫폼 마이그레이션 필요 시 | Astro static 빌드는 어디든 배포 가능. `dist/` 폴더만 옮기면 됨 (Vercel, Netlify, S3+CloudFront 등) |

---

## 6) 후속 계획

1. **Dashboard 배포** — Next.js 15 SSR → Railway 또는 Vercel, 같은 GitHub repo 연결 (`--filter @solaris/dashboard`)
2. **AI Agent Workers** — Railway 서비스로 분리 (Combat/Story)
3. **DNS 라우팅 확장**:
   - `www.solaris.example` → Cloudflare Pages (랜딩)
   - `app.solaris.example` → Dashboard (SSR)
   - `api.solaris.example` → Railway (백엔드/AI)
4. `robots.txt` 허용으로 변경 (정식 오픈 시)
5. Lighthouse CI 자동화 (배포 파이프라인에 `lhci autorun` 추가)
