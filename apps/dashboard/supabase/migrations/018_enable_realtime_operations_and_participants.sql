-- 018_enable_realtime_operations_and_participants.sql
-- operations / operation_participants 테이블을 Realtime publication에 추가

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'operations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.operations;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'operation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.operation_participants;
  END IF;
END
$$;
