-- notifications.scope='user' rows require user_id IS NOT NULL by table CHECK.
-- ON DELETE SET NULL violates that CHECK when a referenced user is deleted.
-- Switch to ON DELETE CASCADE so dependent user notifications are removed instead.

ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;
