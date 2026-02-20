# Dashboard User Load Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 대시보드 진입 시 사용자/캐릭터 정보 조회를 상위 1회로 통합하고, `/api/me` 단일 API 및 Supabase browser client singleton을 도입해 체감 로딩 지연을 줄인다.

**Architecture:** 대시보드 라우트 그룹에서 `DashboardSessionProvider`가 `/api/me`를 1회 호출해 세션 상태를 메모리로 유지한다. Home/My/TopBar/MobileTabBar는 동일 컨텍스트를 사용하고, 개별 페이지의 `auth.getUser()`/`characters` 직접 조회를 제거한다. 브라우저 Supabase client는 모듈 스코프 singleton으로 재사용한다.

**Tech Stack:** Next.js App Router, React Context, Supabase SSR, Vitest, Testing Library

---

### Task 1: `/api/me` 단일 조회 API 추가

**Files:**
- Create: `apps/dashboard/src/app/api/me/route.ts`
- Create: `apps/dashboard/src/app/api/me/__tests__/route.test.ts`
- Reference: `apps/dashboard/src/app/api/characters/route.ts`
- Reference: `apps/dashboard/src/app/api/notifications/route.ts`

**Step 1: Write the failing test**

- 테스트 케이스:
1. 미인증 시 `401 { error: "UNAUTHENTICATED" }`
2. 인증 + 캐릭터 없음 시 `200 { user, character: null }`
3. 인증 + 캐릭터 있음 시 `200 { user, character }`
- 최소 응답 계약:
```ts
{
  user: { id: string; email: string | null; displayName: string } | null;
  character: {
    id: string;
    name: string;
    status: "pending" | "approved" | "rejected";
    profile_image_url: string | null;
    faction: string;
    ability_class: string | null;
    hp_max: number;
    hp_current: number;
    will_max: number;
    will_current: number;
    resonance_rate: number | null;
    created_at: string;
  } | null;
}
```

**Step 2: Run test to verify it fails**

Run: `cd apps/dashboard && pnpm vitest run src/app/api/me/__tests__/route.test.ts`
Expected: FAIL (route 파일/핸들러 미구현)

**Step 3: Write minimal implementation**

- `createClient()`로 인증 사용자 조회
- 미인증은 즉시 401
- 인증 사용자는 `characters`에서 `user_id + deleted_at is null` 기준 `maybeSingle()`
- user display name은 metadata 우선 + fallback 적용

**Step 4: Run test to verify it passes**

Run: `cd apps/dashboard && pnpm vitest run src/app/api/me/__tests__/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/dashboard/src/app/api/me/route.ts apps/dashboard/src/app/api/me/__tests__/route.test.ts
git commit -m "feat(api): /api/me 단일 세션 조회 엔드포인트 추가"
```

---

### Task 2: 대시보드 상위 1회 조회 컨텍스트 도입

**Files:**
- Create: `apps/dashboard/src/components/layout/DashboardSessionProvider.tsx`
- Modify: `apps/dashboard/src/app/(dashboard)/layout.tsx`
- Modify: `apps/dashboard/src/components/layout/DashboardLayout.tsx`
- Modify: `apps/dashboard/src/components/layout/TopBar.tsx` (props 유지/정합성 확인)
- Modify: `apps/dashboard/src/components/layout/MobileTabBar.tsx` (props 소비 정합성 확인)
- Modify: `apps/dashboard/src/components/layout/index.ts`
- Test: `apps/dashboard/src/components/layout/__tests__/DashboardLayout.test.tsx`

**Step 1: Write the failing test**

- 테스트 케이스:
1. provider가 최초 mount 시 `/api/me` 1회 호출
2. `isCharacterApproved`가 `DashboardLayout`으로 전달됨
3. provider loading 상태에서 자식 렌더가 깨지지 않음

**Step 2: Run test to verify it fails**

Run: `cd apps/dashboard && pnpm vitest run src/components/layout/__tests__/DashboardLayout.test.tsx`
Expected: FAIL (provider 미구현)

**Step 3: Write minimal implementation**

- `DashboardSessionProvider` 구현:
  - `useEffect`에서 `/api/me` fetch 1회
  - 상태: `{ me, loading, error }`
  - hook: `useDashboardSession()`
- `(dashboard)/layout.tsx`에서 provider 래핑
- `DashboardLayout`은 `isCharacterApproved`/`notificationCount`를 provider 값으로 연결

**Step 4: Run test to verify it passes**

Run: `cd apps/dashboard && pnpm vitest run src/components/layout/__tests__/DashboardLayout.test.tsx src/components/layout/__tests__/TopBar.test.tsx src/components/layout/__tests__/MobileTabBar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/dashboard/src/components/layout/DashboardSessionProvider.tsx apps/dashboard/src/app/(dashboard)/layout.tsx apps/dashboard/src/components/layout/DashboardLayout.tsx apps/dashboard/src/components/layout/index.ts apps/dashboard/src/components/layout/__tests__/DashboardLayout.test.tsx
git commit -m "refactor(dashboard): 상위 1회 세션 조회 컨텍스트 도입"
```

---

### Task 3: Home 페이지의 개별 인증/캐릭터 조회 제거 (`/api/me` 사용)

**Files:**
- Modify: `apps/dashboard/src/app/(dashboard)/page.tsx`
- Modify: `apps/dashboard/src/app/(dashboard)/__tests__/page.test.tsx`
- Optional Create: `apps/dashboard/src/lib/me-mapper.ts` (변환 로직 분리 시)

**Step 1: Write the failing test**

- 테스트 케이스:
1. Home이 `createClient().auth.getUser()`를 직접 호출하지 않음
2. `/api/me` 응답의 user/character로 화면 렌더
3. 로딩/에러 시 기존 UX 유지

**Step 2: Run test to verify it fails**

Run: `cd apps/dashboard && pnpm vitest run 'src/app/(dashboard)/__tests__/page.test.tsx'`
Expected: FAIL (기존 mock 구조와 불일치)

**Step 3: Write minimal implementation**

- Home의 `createClient()` 직접 호출 제거
- provider의 `me` 상태(또는 `/api/me` fetch util)만 사용
- 기존 `CitizenData` 매핑 로직은 재사용 가능하도록 함수화

**Step 4: Run test to verify it passes**

Run: `cd apps/dashboard && pnpm vitest run 'src/app/(dashboard)/__tests__/page.test.tsx' src/components/home/__tests__/CitizenIDCard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/dashboard/src/app/(dashboard)/page.tsx apps/dashboard/src/app/(dashboard)/__tests__/page.test.tsx
git commit -m "refactor(home): 사용자/캐릭터 조회를 /api/me 기반으로 통합"
```

---

### Task 4: My 페이지의 개별 `auth.getUser()` 제거 (상위 세션 재사용)

**Files:**
- Modify: `apps/dashboard/src/app/(dashboard)/my/page.tsx`
- Modify: `apps/dashboard/src/app/(dashboard)/my/__tests__/page.test.tsx`

**Step 1: Write the failing test**

- 테스트 케이스:
1. My 페이지가 provider 세션 user를 표시
2. 로그아웃 동작 유지
3. user null fallback 문구 유지

**Step 2: Run test to verify it fails**

Run: `cd apps/dashboard && pnpm vitest run 'src/app/(dashboard)/my/__tests__/page.test.tsx'`
Expected: FAIL

**Step 3: Write minimal implementation**

- `useDashboardSession()`로 user 읽기
- `useEffect + auth.getUser()` 제거
- logout만 `createClient().auth.signOut()` 유지

**Step 4: Run test to verify it passes**

Run: `cd apps/dashboard && pnpm vitest run 'src/app/(dashboard)/my/__tests__/page.test.tsx'`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/dashboard/src/app/(dashboard)/my/page.tsx apps/dashboard/src/app/(dashboard)/my/__tests__/page.test.tsx
git commit -m "refactor(my): 상위 세션 컨텍스트 재사용으로 중복 인증 조회 제거"
```

---

### Task 5: Supabase browser client singleton 적용

**Files:**
- Modify: `apps/dashboard/src/lib/supabase/client.ts`
- Create: `apps/dashboard/src/lib/supabase/__tests__/client.test.ts`

**Step 1: Write the failing test**

- 테스트 케이스:
1. `createClient()`를 여러 번 호출해도 동일 인스턴스 반환
2. SSR 경로에 영향 없음(클라이언트 파일 한정)

**Step 2: Run test to verify it fails**

Run: `cd apps/dashboard && pnpm vitest run src/lib/supabase/__tests__/client.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

- 모듈 스코프 변수 `let browserClient: ReturnType<typeof createBrowserClient> | undefined`
- `createClient()`에서 없으면 생성, 있으면 재사용

**Step 4: Run test to verify it passes**

Run: `cd apps/dashboard && pnpm vitest run src/lib/supabase/__tests__/client.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/dashboard/src/lib/supabase/client.ts apps/dashboard/src/lib/supabase/__tests__/client.test.ts
git commit -m "perf(supabase): browser client singleton으로 중복 인스턴스 생성 방지"
```

---

### Task 6: 통합 검증 및 회귀 점검

**Files:**
- Verify only (코드 변경 없음)

**Step 1: Run focused tests**

Run:
```bash
cd apps/dashboard && pnpm vitest run \
  'src/app/(dashboard)/__tests__/page.test.tsx' \
  'src/app/(dashboard)/my/__tests__/page.test.tsx' \
  src/components/layout/__tests__/DashboardLayout.test.tsx \
  src/components/layout/__tests__/TopBar.test.tsx \
  src/components/layout/__tests__/MobileTabBar.test.tsx \
  src/app/api/me/__tests__/route.test.ts \
  src/lib/supabase/__tests__/client.test.ts
```
Expected: all PASS

**Step 2: Run dashboard test suite smoke**

Run: `cd apps/dashboard && pnpm vitest run src/app/(dashboard) src/components/layout`
Expected: PASS 또는 기존 known failure 외 신규 실패 없음

**Step 3: Manual verification (dev server)**

Run:
```bash
cd apps/dashboard && pnpm dev
```
Check:
- Home 최초 진입 시 user/citizen 카드 렌더
- My 페이지 이동 시 user 재조회 스피너 급증 없음
- TopBar/MobileTabBar 잠금 상태 정상

**Step 4: Final commit (if needed)**

```bash
git add -A
git commit -m "test(perf): 대시보드 세션 통합 로딩 회귀 검증"
```

