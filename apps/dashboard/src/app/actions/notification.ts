"use server";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { getUserFriendlyError } from "@/lib/supabase/helpers";

interface CreateNotificationParams {
  userId: string | null;
  scope: "user" | "broadcast";
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  channel: "in_app" | "discord_dm" | "discord_webhook";
}

type NotificationClient = Awaited<ReturnType<typeof createClient>>;

export async function createNotification(
  params: CreateNotificationParams,
  client?: NotificationClient,
) {
  const supabase = client ?? (await createClient());
  const deliveryStatus = params.channel === "in_app" ? "skipped" : "pending";

  const { error } = await supabase.from("notifications").insert({
    id: nanoid(12),
    user_id: params.userId,
    scope: params.scope,
    type: params.type,
    title: params.title,
    body: params.body,
    payload: params.payload ?? {},
    channel: params.channel,
    delivery_status: deliveryStatus,
    delivery_attempts: 0,
  });

  if (error) {
    throw new Error(getUserFriendlyError(error as never));
  }
}
