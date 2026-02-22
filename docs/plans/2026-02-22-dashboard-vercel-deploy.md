# Dashboard Vercel 배포 가이드

> **상태:** 운영
> **대상:** `apps/dashboard` (Next.js 15)
> **플랫폼:** Vercel

---

## 1. 아키텍처 개요

```
GitHub (project-solaris)
  ├── apps/landing   → Cloudflare Pages (배포 완료)
  └── apps/dashboard → Vercel           ← 이 문서
```

- 모노레포(Turborepo + pnpm workspaces) 구조
- Vercel이 `apps/dashboard`만 빌드하도록 Root Directory 설정
- Supabase(Auth + PostgreSQL + Storage) + Discord OAuth 연동

---

## 2. Vercel 프로젝트 설정

| 항목 | 값 |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `apps/dashboard` |
| Build Command | `next build` (기본값) |
| Install Command | `pnpm install` (루트에서 실행, Vercel가 pnpm 자동 감지) |
| Node.js Version | 20.x |

### 환경변수

`.env.example` 참조. Vercel Dashboard > Settings > Environment Variables에서 설정한다.

| 변수 | 용도 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://jasjvfkbprkzxhsnxstd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | Supabase Dashboard에서 확인 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL | 배포 후 Vercel 도메인 또는 커스텀 도메인 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 키 (서버 전용) | Storage 업로드, 관리자 API 등에 사용 |
| `DISCORD_BOT_TOKEN` | Discord 봇 토큰 | 서버 자동 가입, DM 발송 |
| `DISCORD_GUILD_ID` | Discord 서버 ID | `1474271285801386065` |

---

## 3. 이미지 도메인 설정

`next.config.mjs`에서 `NODE_ENV`로 dev/prd 이미지 도메인을 분리한다.

| 도메인 | 환경 | 용도 |
|---|---|---|
| `cdn.discordapp.com` | 전체 | Discord 프로필 이미지 |
| `media.discordapp.net` | 전체 | Discord 미디어 |
| `jasjvfkbprkzxhsnxstd.supabase.co` | 전체 | Supabase Storage (프로덕션) |
| `images.unsplash.com` | dev 전용 | 목 데이터 이미지 |
| `127.0.0.1:54321` | dev 전용 | 로컬 Supabase Storage |

---

## 4. Discord OAuth 설정

Vercel 배포 후 Discord Developer Portal에서 redirect URI를 추가해야 한다.

1. [Discord Developer Portal](https://discord.com/developers/applications) > 앱 선택
2. OAuth2 > Redirects에 추가:
   - `https://<vercel-domain>/api/auth/callback`
   - 커스텀 도메인 연결 시 해당 도메인도 추가
3. Supabase Dashboard > Authentication > URL Configuration:
   - Site URL: `https://<vercel-domain>`
   - Redirect URLs에 `https://<vercel-domain>/api/auth/callback` 추가

---

## 5. 배포 플로우

```
chore/vercel-deploy → PR → develop 머지
                              ↓
                    Vercel GitHub 연결 (develop 브랜치)
                              ↓
                    자동 빌드 + 배포 (*.vercel.app)
```

### 첫 배포 절차

1. `chore/vercel-deploy` 브랜치를 `develop`에 머지
2. Vercel Dashboard에서 GitHub 레포 연결
   - Root Directory: `apps/dashboard`
   - 환경변수 모두 설정
3. 배포 트리거 (develop 브랜치 push 시 자동)
4. `*.vercel.app` 접속 확인
5. Discord OAuth redirect URI 추가
6. 로그인 테스트

### 커스텀 도메인 (후속)

Vercel Dashboard > Settings > Domains에서 커스텀 도메인 추가 후:
- DNS CNAME 레코드 설정
- Discord OAuth redirect URI에 커스텀 도메인 추가
- Supabase URL Configuration에 커스텀 도메인 추가

---

## 6. 배포 후 검증 체크리스트

- [ ] `*.vercel.app` 접속 → 로그인 페이지 렌더
- [ ] Discord OAuth 로그인 성공
- [ ] 홈 페이지 정상 로드 (CitizenIDCard, BriefingFeed)
- [ ] 레지스트리 페이지 — Supabase 실 데이터 조회
- [ ] 작전 페이지 — 목록 로드
- [ ] 프로필 이미지 업로드 (Supabase Storage signed URL)
- [ ] 캐릭터 생성 위자드 진입

---

## 7. 알려진 이슈

### `typescript.ignoreBuildErrors: true`

Supabase generated types(`database.types.ts`)가 실제 DB 스키마와 동기화되지 않아 빌드 타입 에러 59건 존재. `next.config.mjs`에서 임시 우회 중.

**해결 방법:**
```bash
npx supabase gen types typescript --project-id jasjvfkbprkzxhsnxstd > apps/dashboard/src/lib/supabase/database.types.ts
```
타입 재생성 후 `ignoreBuildErrors` 제거.

### pre-existing 테스트 실패 1건

`env.client.ts` 환경변수 검증 — 테스트 환경에서 `NEXT_PUBLIC_*` 미설정 이슈. 프로덕션 동작에는 영향 없음.

---

## 8. 롤백

Vercel Dashboard > Deployments에서 이전 배포 버전으로 즉시 롤백 가능.
