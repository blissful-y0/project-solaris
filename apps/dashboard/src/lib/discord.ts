export interface DiscordMessagePayload {
  content: string;
  username?: string;
}

function createJsonHeaders(extra?: Record<string, string>) {
  return {
    "content-type": "application/json",
    ...extra,
  };
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordMessagePayload,
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: createJsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`DISCORD_WEBHOOK_FAILED:${response.status}`);
  }
}

export async function sendDiscordDm(
  botToken: string,
  discordUserId: string,
  payload: DiscordMessagePayload,
): Promise<void> {
  const createChannelResponse = await fetch(
    "https://discord.com/api/v10/users/@me/channels",
    {
      method: "POST",
      headers: createJsonHeaders({
        authorization: `Bot ${botToken}`,
      }),
      body: JSON.stringify({ recipient_id: discordUserId }),
    },
  );

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
      headers: createJsonHeaders({
        authorization: `Bot ${botToken}`,
      }),
      body: JSON.stringify(payload),
    },
  );

  if (!sendMessageResponse.ok) {
    throw new Error(`DISCORD_DM_SEND_FAILED:${sendMessageResponse.status}`);
  }
}
