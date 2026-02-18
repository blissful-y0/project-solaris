-- notifications INSERT 시 notify Edge Function 호출 트리거

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.enqueue_notification_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_service_role_key text;
  v_webhook_secret text;
  v_headers jsonb;
  v_body jsonb;
BEGIN
  -- pending 상태만 전송 대상으로 처리
  IF NEW.delivery_status <> 'pending' THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO v_url
  FROM vault.decrypted_secrets
  WHERE name = 'notify_function_url'
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT decrypted_secret INTO v_service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'notify_service_role_key'
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT decrypted_secret INTO v_webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'notify_webhook_secret'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_url IS NULL OR v_service_role_key IS NULL OR v_webhook_secret IS NULL THEN
    RAISE WARNING 'notify webhook secrets are not configured';
    RETURN NEW;
  END IF;

  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || v_service_role_key,
    'x-webhook-secret', COALESCE(v_webhook_secret, '')
  );

  v_body := jsonb_build_object(
    'type', 'INSERT',
    'table', 'notifications',
    'schema', 'public',
    'record', to_jsonb(NEW)
  );

  PERFORM net.http_post(
    url := v_url,
    headers := v_headers,
    body := v_body
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notifications_enqueue_webhook ON public.notifications;

CREATE TRIGGER trg_notifications_enqueue_webhook
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_notification_webhook();
