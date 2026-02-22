-- Performance indexes for operations/notifications hot paths.

CREATE INDEX IF NOT EXISTS idx_operations_created_at_active
  ON public.operations (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at_desc
  ON public.notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_scope_unread
  ON public.notifications (user_id, scope)
  WHERE read_at IS NULL AND user_id IS NOT NULL;
