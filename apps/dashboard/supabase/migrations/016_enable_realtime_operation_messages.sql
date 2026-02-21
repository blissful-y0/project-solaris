-- 016_enable_realtime_operation_messages.sql
-- operation_messages 테이블을 Supabase Realtime publication에 추가
-- 이미 추가된 환경에서도 재실행 가능하도록 idempotent하게 처리

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'operation_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.operation_messages;
  END IF;
END
$$;
