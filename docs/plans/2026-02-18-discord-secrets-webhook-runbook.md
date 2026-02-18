# Discord 알림 시크릿 + DB Webhook SQL 설정 런북

> 작성: 2026-02-18
> 대상 프로젝트: `jasjvfkbprkzxhsnxstd`
> 목적: `notifications` INSERT 시 `notify` Edge Function 자동 호출

---

## 0) 사전 조건

- [ ] `notify` 함수 배포 완료
- [ ] `notifications` 테이블 및 `delivery_status` 컬럼 존재
- [ ] 작업자에게 Supabase Dashboard/SQL Editor 권한 있음

---

## 1) Edge Function 시크릿 설정 위치

Dashboard 경로:

1. `https://supabase.com/dashboard/project/jasjvfkbprkzxhsnxstd`
2. `Edge Functions`
3. `Secrets` (또는 `Settings > Edge Functions > Secrets`)

등록 키:

- [ ] `DISCORD_BOT_TOKEN`
- [ ] `DISCORD_WEBHOOK_STORY`
- [ ] `DISCORD_WEBHOOK_NOTICE`
- [ ] `DISCORD_WEBHOOK_DEFAULT`
- [ ] `NOTIFY_WEBHOOK_SECRET`

CLI 대안:

```bash
cd apps/dashboard
pnpm exec supabase secrets set --project-ref jasjvfkbprkzxhsnxstd \
  DISCORD_BOT_TOKEN=... \
  DISCORD_WEBHOOK_STORY=... \
  DISCORD_WEBHOOK_NOTICE=... \
  DISCORD_WEBHOOK_DEFAULT=... \
  NOTIFY_WEBHOOK_SECRET=...
```

---

## 2) DB에서 사용할 비밀값(vault) 저장

주의: 아래 SQL의 `<...>` 값을 실제 값으로 치환 후 실행.

```sql
-- 2-1. 필요한 확장 활성화
create extension if not exists pg_net;
create extension if not exists vault;

-- 2-2. 기존 secret이 있으면 삭제(중복 방지)
do $$
declare
  rec record;
begin
  for rec in
    select id
    from vault.secrets
    where name in (
      'notify_function_url',
      'notify_service_role_key',
      'notify_webhook_secret'
    )
  loop
    perform vault.delete_secret(rec.id);
  end loop;
end
$$;

-- 2-3. secret 저장
select vault.create_secret(
  '<https://jasjvfkbprkzxhsnxstd.functions.supabase.co/notify>',
  'notify_function_url',
  'notify edge function invoke url'
);

select vault.create_secret(
  '<SUPABASE_SERVICE_ROLE_KEY>',
  'notify_service_role_key',
  'service role key for function invoke auth'
);

select vault.create_secret(
  '<NOTIFY_WEBHOOK_SECRET>',
  'notify_webhook_secret',
  'x-webhook-secret for notify function'
);
```

---

## 3) notifications INSERT 트리거 함수 생성(SQL)

```sql
create or replace function public.enqueue_notification_webhook()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_service_role_key text;
  v_webhook_secret text;
  v_headers jsonb;
  v_body jsonb;
begin
  -- pending 상태만 전송 대상
  if new.delivery_status <> 'pending' then
    return new;
  end if;

  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name = 'notify_function_url'
  order by created_at desc
  limit 1;

  select decrypted_secret into v_service_role_key
  from vault.decrypted_secrets
  where name = 'notify_service_role_key'
  order by created_at desc
  limit 1;

  select decrypted_secret into v_webhook_secret
  from vault.decrypted_secrets
  where name = 'notify_webhook_secret'
  order by created_at desc
  limit 1;

  if v_url is null or v_service_role_key is null then
    raise exception 'notify webhook secrets are not configured';
  end if;

  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || v_service_role_key,
    'x-webhook-secret', coalesce(v_webhook_secret, '')
  );

  v_body := jsonb_build_object(
    'type', 'INSERT',
    'table', 'notifications',
    'schema', 'public',
    'record', to_jsonb(new)
  );

  perform net.http_post(
    url := v_url,
    headers := v_headers,
    body := v_body
  );

  return new;
end;
$$;
```

---

## 4) 트리거 연결(SQL)

```sql
drop trigger if exists trg_notifications_enqueue_webhook on public.notifications;

create trigger trg_notifications_enqueue_webhook
after insert on public.notifications
for each row
execute function public.enqueue_notification_webhook();
```

---

## 5) 검증 SQL (실행 순서)

```sql
-- 5-1. 테스트용 알림 INSERT (DM)
insert into public.notifications (
  id,
  user_id,
  scope,
  type,
  title,
  body,
  payload,
  channel,
  delivery_status,
  delivery_attempts
)
values (
  'notif_test_dm_001',
  '<USER_UUID>',
  'user',
  'character_approved',
  '테스트 승인 알림',
  '테스트 본문',
  '{}'::jsonb,
  'discord_dm',
  'pending',
  0
);

-- 5-2. 상태 확인 (워커 처리 후 sent/failed로 변경되는지)
select id, channel, delivery_status, delivery_attempts, last_error, updated_at
from public.notifications
where id = 'notif_test_dm_001';

-- 5-3. 테스트 데이터 정리(선택)
delete from public.notifications where id = 'notif_test_dm_001';
```

---

## 6) 운영 체크리스트

- [ ] Edge Function Secrets 등록 완료
- [ ] vault secret 3종 등록 완료
- [ ] `enqueue_notification_webhook()` 생성 완료
- [ ] `trg_notifications_enqueue_webhook` 생성 완료
- [ ] 테스트 INSERT 후 `delivery_status` 전이 확인 (`pending -> sent` 또는 `failed`)
- [ ] `failed` 시 `last_error` 기준으로 Discord 토큰/웹훅/권한 점검

---

## 7) 롤백 SQL

```sql
drop trigger if exists trg_notifications_enqueue_webhook on public.notifications;
drop function if exists public.enqueue_notification_webhook();
```
