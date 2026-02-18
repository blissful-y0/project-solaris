import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface NotificationRow {
  id: string;
  user_id: string | null;
  scope: "user" | "broadcast";
  type: string;
  title: string;
  body: string;
  payload: Record<string, Json>;
  channel: "in_app" | "discord_dm" | "discord_webhook";
  delivery_status: "pending" | "sent" | "failed" | "skipped";
  delivery_attempts: number;
  last_error: string | null;
}

interface UserRow {
  id: string;
  discord_id: string;
  discord_username: string;
}

function getCorsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  };
}

function parseNotification(body: unknown): NotificationRow | null {
  if (!body || typeof body !== "object") return null;
  const candidate = (body as Record<string, unknown>).record ?? (body as Record<string, unknown>).new ?? body;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate as NotificationRow;
}

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

async function sendDiscordWebhook(webhookUrl: string, title: string, body: string) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "SOLARIS",
      content: `**${title}**\n${body}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`DISCORD_WEBHOOK_FAILED:${response.status}`);
  }
}

async function sendDiscordDm(botToken: string, discordUserId: string, title: string, body: string) {
  const createChannelResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bot ${botToken}`,
    },
    body: JSON.stringify({ recipient_id: discordUserId }),
  });

  if (!createChannelResponse.ok) {
    throw new Error(`DISCORD_DM_CHANNEL_FAILED:${createChannelResponse.status}`);
  }

  const channel = (await createChannelResponse.json()) as { id?: string };
  if (!channel.id) {
    throw new Error("DISCORD_DM_CHANNEL_MISSING");
  }

  const sendMessageResponse = await fetch(
    `https://discord.com/api/v10/channels/${channel.id}/messages`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify({
        username: "SOLARIS",
        content: `**${title}**\n${body}`,
      }),
    },
  );

  if (!sendMessageResponse.ok) {
    throw new Error(`DISCORD_DM_SEND_FAILED:${sendMessageResponse.status}`);
  }
}

Deno.serve(async (request) => {
  const corsHeaders = getCorsHeaders();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("NOTIFY_WEBHOOK_SECRET");
  const providedSecret = request.headers.get("x-webhook-secret");
  if (webhookSecret && webhookSecret !== providedSecret) {
    return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
      status: 401,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "MISSING_SUPABASE_ENV" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let currentNotification: NotificationRow | null = null;

  try {
    const body = await request.json();
    const notification = parseNotification(body);
    currentNotification = notification;

    if (!notification) {
      return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (notification.channel === "in_app") {
      await supabase
        .from("notifications")
        .update({ delivery_status: "skipped", updated_at: new Date().toISOString() })
        .eq("id", notification.id);

      return new Response(JSON.stringify({ ok: true, delivery_status: "skipped" }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (notification.channel === "discord_dm") {
      if (!notification.user_id) {
        throw new Error("DM_TARGET_MISSING");
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id, discord_id, discord_username")
        .eq("id", notification.user_id)
        .single();

      const dmUser = userRow as UserRow | null;
      if (userError || !dmUser?.discord_id) {
        throw new Error("DM_USER_NOT_FOUND");
      }

      const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
      if (!botToken) {
        throw new Error("MISSING_DISCORD_BOT_TOKEN");
      }

      await sendDiscordDm(botToken, dmUser.discord_id, notification.title, notification.body);
    }

    if (notification.channel === "discord_webhook") {
      const webhookUrl = getWebhookUrl(notification);
      if (!webhookUrl) {
        throw new Error("WEBHOOK_URL_NOT_FOUND");
      }

      await sendDiscordWebhook(webhookUrl, notification.title, notification.body);
    }

    await supabase
      .from("notifications")
      .update({
        delivery_status: "sent",
        delivery_attempts: (notification.delivery_attempts ?? 0) + 1,
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notification.id);

    return new Response(JSON.stringify({ ok: true, delivery_status: "sent" }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    if (currentNotification) {
      await supabase
        .from("notifications")
        .update({
          delivery_status: "failed",
          delivery_attempts: (currentNotification.delivery_attempts ?? 0) + 1,
          last_error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentNotification.id);
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
  }
});
