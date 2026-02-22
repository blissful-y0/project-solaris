-- Reduce vault lookups per notification insert from 3 queries to 1 query.

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

  WITH latest AS (
    SELECT DISTINCT ON (name) name, decrypted_secret
    FROM vault.decrypted_secrets
    WHERE name IN ('notify_function_url', 'notify_service_role_key', 'notify_webhook_secret')
    ORDER BY name, created_at DESC
  )
  SELECT
    max(decrypted_secret) FILTER (WHERE name = 'notify_function_url'),
    max(decrypted_secret) FILTER (WHERE name = 'notify_service_role_key'),
    max(decrypted_secret) FILTER (WHERE name = 'notify_webhook_secret')
  INTO
    v_url,
    v_service_role_key,
    v_webhook_secret
  FROM latest;

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
