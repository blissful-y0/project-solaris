# Discord 연동 환경변수 설정 가이드

> `docs/plans/2026-02-22-discord-notifications.md` 구현 완료 후 배포 전 설정 체크리스트

---

## 필요 환경변수 요약

| 변수명 | 위치 | 용도 |
|--------|------|------|
| `DISCORD_BOT_TOKEN` | `.env.local` / Vercel | 서버 자동 가입 + DM 발송 |
| `DISCORD_GUILD_ID` | `.env.local` / Vercel | 자동 가입할 Discord 서버 ID |
| `NEXT_PUBLIC_APP_URL` | `.env.local` / Vercel | 어드민 딥링크 생성 (예: `https://your-app.vercel.app`) |
| `DISCORD_WEBHOOK_ADMIN` | Supabase Edge Function secrets | 캐릭터 신청 어드민 채널 웹훅 URL |

---

## 1. Discord 봇 토큰 (`DISCORD_BOT_TOKEN`)

1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. 봇 애플리케이션 선택 (또는 새로 생성)
3. **Bot** 탭 → **Reset Token** → 토큰 복사
4. **Bot** 탭 → **Privileged Gateway Intents** → `SERVER MEMBERS` 활성화
5. **OAuth2** 탭 → Redirects에 Supabase 콜백 URL 등록 확인

---

## 2. Discord 서버 ID (`DISCORD_GUILD_ID`)

1. Discord 앱 → 설정 → **고급** → **개발자 모드** ON
2. 대상 서버 이름 우클릭 → **서버 ID 복사**

---

## 3. 봇 서버 초대 (아직 안 했다면)

아래 URL에서 `{CLIENT_ID}`를 봇 애플리케이션 ID로 교체:

```
https://discord.com/oauth2/authorize?client_id={CLIENT_ID}&permissions=1&scope=bot
```

- `permissions=1` = `CREATE_INSTANT_INVITE` (guilds.join 스코프에 필요)
- 봇이 서버에 참여한 상태여야 OAuth 로그인 시 자동 가입이 동작함

---

## 4. 어드민 웹훅 URL (`DISCORD_WEBHOOK_ADMIN`)

1. Discord → 캐릭터 신청 알림 받을 채널 선택
2. 채널 설정 → **연동** → **웹후크** → **새 웹후크**
3. 이름: `SOLARIS` (또는 원하는 이름)
4. **웹후크 URL 복사** → `https://discord.com/api/webhooks/...` 형식

---

## 5. 환경변수 등록

### 로컬 개발 (`apps/dashboard/.env.local`)

```bash
# 기존 변수 아래에 추가
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Supabase Edge Function secrets

```bash
# 어드민 웹훅 URL 등록
supabase secrets set DISCORD_WEBHOOK_ADMIN="https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"

# DISCORD_BOT_TOKEN이 이미 설정되어 있는지 확인
supabase secrets list
```

### Vercel (프로덕션)

Vercel 대시보드 → Settings → Environment Variables:

- `DISCORD_BOT_TOKEN` = 봇 토큰
- `DISCORD_GUILD_ID` = 서버 ID
- `NEXT_PUBLIC_APP_URL` = 프로덕션 도메인 (예: `https://solaris.vercel.app`)

---

## 6. Supabase Dashboard 확인

**Authentication → Providers → Discord:**

- 클라이언트 `signInWithOAuth`에서 `scopes: "guilds.join"`을 요청하므로, Supabase Dashboard에서 별도 스코프 설정은 불필요
- 단, **Additional Scopes** 필드가 비어있거나 기존 스코프와 충돌하지 않는지 확인

---

## 7. notify Edge Function 배포

```bash
supabase functions deploy notify
```

배포 후 테스트:

```bash
# 웹훅 테스트 (직접 Edge Function 호출)
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/notify \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_NOTIFY_WEBHOOK_SECRET" \
  -d '{
    "record": {
      "id": "test-uuid",
      "user_id": null,
      "scope": "broadcast",
      "type": "character_pending",
      "title": "[테스트] 신청서 접수",
      "body": "이름: 테스트 캐릭터 | 진영: 보안국",
      "payload": {},
      "channel": "discord_webhook",
      "delivery_status": "pending",
      "delivery_attempts": 0,
      "last_error": null
    }
  }'
```

---

## 체크리스트

- [ ] Discord 봇 토큰 발급 + SERVER MEMBERS intent 활성화
- [ ] 봇을 서버에 초대 (CREATE_INSTANT_INVITE 권한)
- [ ] 서버 ID 확인
- [ ] 어드민 알림 채널에 웹훅 생성
- [ ] `.env.local`에 3개 변수 추가 (`DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `NEXT_PUBLIC_APP_URL`)
- [ ] Supabase secrets에 `DISCORD_WEBHOOK_ADMIN` 등록
- [ ] Vercel에 프로덕션 환경변수 등록
- [ ] `supabase functions deploy notify` 배포
- [ ] 테스트: 캐릭터 신청 → 어드민 채널 웹훅 수신 확인
- [ ] 테스트: 승인/반려 → 신청자 Discord DM 수신 확인
- [ ] 테스트: 신규 로그인 → Discord 서버 자동 가입 확인
