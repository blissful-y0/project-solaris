# Discord 알림 연동 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 캐릭터 신청 시 어드민 Discord 채널 웹훅 알림 + 승인/반려 시 신청자 Discord DM 개선

**Architecture:**
- `notify` Edge Function (Supabase)이 이미 `discord_dm`/`discord_webhook` 전송 처리함
- DB `notifications` 테이블 INSERT → pg_net 트리거 → Edge Function 호출 파이프라인 완성
- `submitCharacter` 서버 액션에 어드민 웹훅 알림 추가, approve/reject DM 내용 보강이 전부

**Tech Stack:** Next.js 15 Server Actions, Supabase Edge Functions (Deno), Discord API v10

---

## 환경변수 (신규 추가 필요)

| 변수명 | 위치 | 설명 |
|--------|------|------|
| `DISCORD_WEBHOOK_ADMIN` | Supabase Edge Function secrets | 캐릭터 신청 어드민 채널 웹훅 URL |
| `NEXT_PUBLIC_APP_URL` | `.env.local` | 어드민 딥링크 생성용 앱 베이스 URL (예: `https://your-app.vercel.app`) |

---

## Task 1: notify Edge Function — `character_` 타입 라우팅 추가

**파악:** `getWebhookUrl()` 함수는 `story_` / `notice_` 타입 prefix → 각 환경변수로 라우팅. `character_` 타입 핸들러가 없어서 `DISCORD_WEBHOOK_DEFAULT`로 폴백됨. 전용 admin 채널이 필요하므로 `DISCORD_WEBHOOK_ADMIN` 라우팅 추가.

**Files:**
- Modify: `apps/dashboard/supabase/functions/notify/index.ts`

---

**Step 1: 테스트 작성 (현재 `getWebhookUrl` 로직 검증)**

`notify` Edge Function에는 별도 테스트 파일이 없으므로 신규 생성:

```typescript
// apps/dashboard/supabase/functions/notify/index.test.ts
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// getWebhookUrl 함수를 export하도록 index.ts 수정 예정
import { getWebhookUrl } from "./index.ts";

Deno.test("getWebhookUrl — character_ 타입은 DISCORD_WEBHOOK_ADMIN 반환", () => {
  // Deno.env.set으로 임시 환경변수 설정 후 테스트
  const env = new Map([["DISCORD_WEBHOOK_ADMIN", "https://discord.com/api/webhooks/123/abc"]]);
  const result = getWebhookUrl({ type: "character_pending", payload: {} } as any, env);
  assertEquals(result, "https://discord.com/api/webhooks/123/abc");
});

Deno.test("getWebhookUrl — DISCORD_WEBHOOK_ADMIN 없으면 null", () => {
  const result = getWebhookUrl({ type: "character_pending", payload: {} } as any, new Map());
  assertEquals(result, null);
});
```

> 참고: Edge Function 단위 테스트는 선택사항. 로컬 Deno 환경이 없으면 Step 1 건너뛰고 Step 3으로 이동해도 됨.

---

**Step 2: `getWebhookUrl()` 함수에 `character_` prefix 라우팅 추가**

`apps/dashboard/supabase/functions/notify/index.ts`의 `getWebhookUrl` 함수에서 기존 `story_` / `notice_` 블록 다음에 추가:

```typescript
// 변경 전
function getWebhookUrl(notification: NotificationRow): string | null {
  const fromPayload = notification.payload?.webhook_url;
  if (typeof fromPayload === "string" && fromPayload.length > 0) {
    return fromPayload;
  }

  if (notification.type.startsWith("story_")) {
    return Deno.env.get("DISCORD_WEBHOOK_STORY") ?? null;
  }

  if (notification.type.startsWith("notice_")) {
    return Deno.env.get("DISCORD_WEBHOOK_NOTICE") ?? null;
  }

  return Deno.env.get("DISCORD_WEBHOOK_DEFAULT") ?? null;
}

// 변경 후
function getWebhookUrl(notification: NotificationRow): string | null {
  const fromPayload = notification.payload?.webhook_url;
  if (typeof fromPayload === "string" && fromPayload.length > 0) {
    return fromPayload;
  }

  if (notification.type.startsWith("story_")) {
    return Deno.env.get("DISCORD_WEBHOOK_STORY") ?? null;
  }

  if (notification.type.startsWith("notice_")) {
    return Deno.env.get("DISCORD_WEBHOOK_NOTICE") ?? null;
  }

  if (notification.type.startsWith("character_")) {
    return Deno.env.get("DISCORD_WEBHOOK_ADMIN") ?? null;
  }

  return Deno.env.get("DISCORD_WEBHOOK_DEFAULT") ?? null;
}
```

---

**Step 3: Edge Function 배포**

```bash
# Supabase 프로젝트에 배포
supabase functions deploy notify

# DISCORD_WEBHOOK_ADMIN 환경변수 설정 (Discord 채널에서 웹훅 URL 생성 후)
supabase secrets set DISCORD_WEBHOOK_ADMIN="https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
```

---

**Step 4: 커밋**

```bash
git add apps/dashboard/supabase/functions/notify/index.ts
git commit -m "feat(notify): character_ 타입 Discord admin 웹훅 채널 라우팅 추가"
```

---

## Task 2: submitCharacter — 어드민 웹훅 알림 트리거

**파악:**
- `submitCharacter()` 서버 액션: 캐릭터 생성 RPC 완료 후 알림 없음
- `notifications` 테이블 RLS: `service_role` 또는 admin만 INSERT 가능 → 유저 클라이언트로는 삽입 불가
- 따라서 `getServiceClient()` (`@/lib/supabase/service`)를 사용해 알림 생성
- 유저 `discord_username`은 `users_select_own` RLS 정책이 있어 유저 클라이언트로 조회 가능

**Files:**
- Modify: `apps/dashboard/src/app/actions/character.ts`
- Modify: `apps/dashboard/src/app/actions/__tests__/character.test.ts`

---

**Step 1: 테스트 작성 — 알림 생성 검증**

기존 `character.test.ts`에 아래 테스트 추가:

```typescript
// apps/dashboard/src/app/actions/__tests__/character.test.ts 에 추가

import { createNotification } from "@/app/actions/notification";
import { getServiceClient } from "@/lib/supabase/service";

vi.mock("@/app/actions/notification", () => ({
  createNotification: vi.fn(),
}));
vi.mock("@/lib/supabase/service", () => ({
  getServiceClient: vi.fn(),
}));

describe("submitCharacter — 어드민 웹훅 알림", () => {
  it("캐릭터 생성 성공 시 character_pending 웹훅 알림을 생성한다", async () => {
    // mock: supabase auth.getUser, users.select, rpc 모두 성공
    // ...기존 mock 설정에 users 조회 mock 추가...

    await submitCharacter(validDraft);

    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "character_pending",
        channel: "discord_webhook",
        scope: "broadcast",
      }),
      expect.anything(), // service client
    );
  });

  it("알림 생성 실패해도 캐릭터 생성은 성공으로 반환한다", async () => {
    (createNotification as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("NOTIF_FAIL"));

    const result = await submitCharacter(validDraft);
    expect(result).toHaveProperty("characterId");
  });
});
```

---

**Step 2: 테스트 실행 — 실패 확인**

```bash
cd apps/dashboard && npx vitest run src/app/actions/__tests__/character.test.ts
# 예상: createNotification 관련 테스트 FAIL
```

---

**Step 3: submitCharacter 구현 수정**

`apps/dashboard/src/app/actions/character.ts` 상단 import에 추가:

```typescript
import { createNotification } from "@/app/actions/notification";
import { getServiceClient } from "@/lib/supabase/service";
```

`submitCharacter` 함수에서 RPC 성공 후 (`if (error)` 블록 아래), `return` 전에 추가:

```typescript
  // 어드민 웹훅 알림 (실패해도 캐릭터 생성은 성공으로 처리)
  try {
    const { data: userRow } = await supabase
      .from("users")
      .select("discord_username")
      .eq("id", user.id)
      .single();

    const factionLabel: Record<string, string> = {
      bureau: "보안국",
      static: "The Static",
      defector: "전향자",
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const adminUrl = `${appUrl}/admin/characters/${characterId}`;

    await createNotification(
      {
        userId: null,
        scope: "broadcast",
        type: "character_pending",
        channel: "discord_webhook",
        title: "[캐릭터 신청] 새 신청서 접수",
        body: [
          `이름: **${draft.name}** | 진영: ${factionLabel[draft.faction] ?? draft.faction}`,
          `신청자: @${userRow?.discord_username ?? "unknown"}`,
          adminUrl ? `심사: ${adminUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
      getServiceClient(),
    );
  } catch (notifError) {
    console.error("[submitCharacter] 어드민 웹훅 알림 실패 (캐릭터 생성 완료):", notifError);
  }

  return { characterId: (data as string | null) ?? characterId };
```

---

**Step 4: 테스트 재실행 — 통과 확인**

```bash
cd apps/dashboard && npx vitest run src/app/actions/__tests__/character.test.ts
# 예상: PASS
```

---

**Step 5: 커밋**

```bash
git add apps/dashboard/src/app/actions/character.ts \
        apps/dashboard/src/app/actions/__tests__/character.test.ts
git commit -m "feat(character): 신청 제출 시 어드민 Discord 웹훅 알림 추가"
```

---

## Task 3: 승인/반려 DM 내용 보강

**파악:**
- approve route: `select("id, user_id, status")` — 캐릭터명 없음, DM body 제네릭
- reject route: `select("id, user_id, status")` — 캐릭터명 없음, DM body에 반려사유 미포함
- 두 라우트 모두 `requireAdmin()`의 supabase 클라이언트 사용 → admin RLS 통과 → notification INSERT 가능

**Files:**
- Modify: `apps/dashboard/src/app/api/admin/characters/[id]/approve/route.ts`
- Modify: `apps/dashboard/src/app/api/admin/characters/[id]/approve/__tests__/route.test.ts`
- Modify: `apps/dashboard/src/app/api/admin/characters/[id]/reject/route.ts`
- Modify: `apps/dashboard/src/app/api/admin/characters/[id]/reject/__tests__/route.test.ts`

---

**Step 1: 테스트 수정 — 개선된 알림 내용 검증**

`approve/__tests__/route.test.ts`에 아래 테스트 추가/수정:

```typescript
it("승인 성공 시 캐릭터명을 포함한 DM 알림을 생성한다", async () => {
  const character = { id: "char1", user_id: "user1", status: "approved", name: "아마츠키 레이" };
  // mock chain이 name 필드도 반환하도록 설정
  mockChain.single.mockResolvedValue({ data: character, error: null });

  await POST(mockRequest, { params: Promise.resolve({ id: "char1" }) });

  expect(createNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      body: expect.stringContaining("아마츠키 레이"),
    }),
    expect.anything(),
  );
});
```

`reject/__tests__/route.test.ts`에 추가:

```typescript
it("반려 성공 시 캐릭터명과 반려사유를 포함한 DM 알림을 생성한다", async () => {
  const character = { id: "char1", user_id: "user1", status: "rejected", name: "아마츠키 레이" };
  mockChain.single.mockResolvedValue({ data: character, error: null });

  const req = makeRejectRequest("이 반려사유는 충분히 길어야 합니다 — 20자 이상");
  await POST(req, { params: Promise.resolve({ id: "char1" }) });

  expect(createNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      body: expect.stringContaining("아마츠키 레이"),
    }),
    expect.anything(),
  );
  expect(createNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      body: expect.stringContaining("이 반려사유는 충분히 길어야 합니다"),
    }),
    expect.anything(),
  );
});
```

---

**Step 2: 테스트 실행 — 실패 확인**

```bash
cd apps/dashboard && npx vitest run src/app/api/admin/characters
# 예상: 새로 추가한 테스트 FAIL
```

---

**Step 3: approve route 수정**

`apps/dashboard/src/app/api/admin/characters/[id]/approve/route.ts`:

```typescript
// 변경: select에 name 추가
const { data, error } = await supabase
  .from("characters")
  .update({ status: "approved", rejection_reason: null })
  .eq("id", id)
  .select("id, user_id, status, name")  // name 추가
  .single();

// 변경: 알림 body에 캐릭터명 포함
await createNotification({
  userId: data.user_id,
  scope: "user",
  type: "character_approved",
  title: "[SOLARIS] 캐릭터 승인 완료",
  body: `캐릭터 **${data.name}**이(가) 승인되었습니다.\n이제 작전에 참여하실 수 있습니다.`,
  channel: "discord_dm",
  payload: { characterId: data.id },
}, supabase);
```

---

**Step 4: reject route 수정**

`apps/dashboard/src/app/api/admin/characters/[id]/reject/route.ts`:

```typescript
// 변경: select에 name 추가
const { data, error } = await supabase
  .from("characters")
  .update({ status: "rejected", rejection_reason: reason })
  .eq("id", id)
  .select("id, user_id, status, name")  // name 추가
  .single();

// 변경: 알림 body에 캐릭터명 + 반려사유 포함
await createNotification({
  userId: data.user_id,
  scope: "user",
  type: "character_rejected",
  title: "[SOLARIS] 캐릭터 반려 안내",
  body: `캐릭터 **${data.name}**이(가) 반려되었습니다.\n\n반려 사유: ${reason}`,
  channel: "discord_dm",
  payload: { characterId: data.id },
}, supabase);
```

---

**Step 5: 테스트 재실행 — 전체 통과 확인**

```bash
cd apps/dashboard && npx vitest run src/app/api/admin/characters
# 예상: PASS
```

---

**Step 6: 전체 테스트 회귀 확인**

```bash
cd apps/dashboard && npx vitest run
# 기존 테스트 깨지지 않았는지 확인
```

---

**Step 7: 커밋**

```bash
git add apps/dashboard/src/app/api/admin/characters/[id]/approve/route.ts \
        apps/dashboard/src/app/api/admin/characters/[id]/approve/__tests__/route.test.ts \
        apps/dashboard/src/app/api/admin/characters/[id]/reject/route.ts \
        apps/dashboard/src/app/api/admin/characters/[id]/reject/__tests__/route.test.ts
git commit -m "feat(admin): 승인/반려 DM에 캐릭터명 + 반려사유 포함"
```

---

## Task 4: OAuth 시 Discord 서버 자동 가입

**파악:**
- Discord OAuth로 로그인하면 `guilds.join` 스코프를 요청할 수 있음
- Supabase `signInWithOAuth`에 `scopes: "guilds.join"` 추가 → OAuth 후 `provider_token`에 해당 권한 포함
- 콜백 라우트에서 `provider_token`을 이용해 Discord API `PUT /guilds/{guild_id}/members/{user_id}` 호출
- 봇이 서버에 미리 참여한 상태이고 `CREATE_INSTANT_INVITE` 권한이 있어야 함
- 201: 추가 성공 / 204: 이미 서버 멤버 → 둘 다 성공 처리
- 실패해도 로그인 자체는 차단하지 않음 (graceful degradation)

**새 환경변수:**

| 변수명 | 위치 | 설명 |
|--------|------|------|
| `DISCORD_GUILD_ID` | `.env.local` / Vercel | 자동 가입할 Discord 서버(길드) ID |
| `DISCORD_BOT_TOKEN` | `.env.local` / Vercel | Discord 봇 토큰 (서버 사이드 전용, `NEXT_PUBLIC_` 없음) |

> `DISCORD_BOT_TOKEN`은 notify Edge Function에 이미 설정되어 있을 수 있음. Next.js 서버 환경에도 별도 설정 필요.

**Files:**
- Modify: `apps/dashboard/src/app/(auth)/login/page.tsx`
- Modify: `apps/dashboard/src/app/api/auth/callback/route.ts`
- Modify: `apps/dashboard/src/app/api/auth/callback/__tests__/route.test.ts` (있을 경우)

---

**Step 1: login/page.tsx — `guilds.join` 스코프 추가**

`apps/dashboard/src/app/(auth)/login/page.tsx`의 `signInWithOAuth` 호출에 `scopes` 옵션 추가:

```typescript
// 변경 전
const { error } = await supabase.auth.signInWithOAuth({
  provider: "discord",
  options: {
    redirectTo: callbackUrl.toString(),
  },
});

// 변경 후
const { error } = await supabase.auth.signInWithOAuth({
  provider: "discord",
  options: {
    redirectTo: callbackUrl.toString(),
    scopes: "guilds.join",
  },
});
```

---

**Step 2: callback/route.ts — 길드 자동 가입 로직 추가**

`apps/dashboard/src/app/api/auth/callback/route.ts`에서 두 가지 수정:

**2a. `exchangeCodeForSession` 반환값에서 `session` 추출:**

```typescript
// 변경 전
const { error } = await supabase.auth.exchangeCodeForSession(code);

// 변경 후
const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
```

**2b. upsert 성공 후 길드 가입 시도 (redirect 직전):**

```typescript
// upsertError 처리 블록 다음, return NextResponse.redirect(...) 직전에 추가

// Discord 서버 자동 가입 (실패해도 로그인 차단 안 함)
const guildId = process.env.DISCORD_GUILD_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;
const providerToken = session?.provider_token;

if (guildId && botToken && providerToken && discordId) {
  try {
    const guildRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: `Bot ${botToken}`,
        },
        body: JSON.stringify({ access_token: providerToken }),
      },
    );
    // 201: 추가됨, 204: 이미 멤버 — 둘 다 정상
    if (!guildRes.ok && guildRes.status !== 204) {
      console.error(
        `[auth/callback] Discord 길드 가입 실패: ${guildRes.status}`,
      );
    }
  } catch (guildError) {
    console.error("[auth/callback] Discord 길드 가입 오류:", guildError);
  }
}

return NextResponse.redirect(`${origin}${next}`);
```

---

**Step 3: 테스트 작성 (선택)**

콜백 라우트 테스트 파일이 있다면 아래 케이스 추가:

```typescript
it("길드 가입 실패해도 로그인은 성공으로 리다이렉트한다", async () => {
  // DISCORD_GUILD_ID, DISCORD_BOT_TOKEN 환경변수 설정
  // fetch mock이 PUT /guilds/... 에 500 반환하도록 설정
  // 결과: NextResponse.redirect("/") — 로그인 차단 없음
});
```

---

**Step 4: 환경변수 추가**

```bash
# .env.local에 추가
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_BOT_TOKEN=your_bot_token_here
```

> Discord 서버 ID 확인: Discord 설정 → 고급 → 개발자 모드 ON → 서버 우클릭 → ID 복사

---

**Step 5: 커밋**

```bash
git add apps/dashboard/src/app/(auth)/login/page.tsx \
        apps/dashboard/src/app/api/auth/callback/route.ts
git commit -m "feat(auth): Discord OAuth 시 서버 자동 가입 추가 (guilds.join)"
```

---

## 환경변수 설정 체크리스트

로컬 테스트 전:
- [ ] Discord 개발자 포털 → 봇 토큰 확인 (`DISCORD_BOT_TOKEN` 이미 설정 여부)
- [ ] 어드민 Discord 채널 → 채널 설정 → 연동 → 웹훅 생성 → URL 복사
- [ ] Supabase Edge Function secrets: `DISCORD_WEBHOOK_ADMIN` 설정
- [ ] `.env.local`에 `NEXT_PUBLIC_APP_URL=http://localhost:3001` (로컬) 또는 배포 URL 추가
- [ ] Discord 서버 ID 확인 후 `.env.local`에 `DISCORD_GUILD_ID` 추가
- [ ] `.env.local`에 `DISCORD_BOT_TOKEN` 추가 (Next.js 서버 사이드용)
- [ ] Discord 봇이 서버에 참여했는지 + `CREATE_INSTANT_INVITE` 권한 보유 확인

## 메시지 포맷 예시

**어드민 채널 웹훅 (캐릭터 신청):**
```
**[캐릭터 신청] 새 신청서 접수**
이름: **아마츠키 레이** | 진영: 보안국
신청자: @username
심사: https://your-app.vercel.app/admin/characters/abc123
```

**승인 DM:**
```
**[SOLARIS] 캐릭터 승인 완료**
캐릭터 **아마츠키 레이**이(가) 승인되었습니다.
이제 작전에 참여하실 수 있습니다.
```

**반려 DM:**
```
**[SOLARIS] 캐릭터 반려 안내**
캐릭터 **아마츠키 레이**이(가) 반려되었습니다.

반려 사유: 배경 서사가 세계관과 맞지 않습니다. 솔라리스 시민 등록 여부를 명확히 기재해 주세요.
```
