import { beforeEach, describe, expect, it, vi } from "vitest";

describe("discord utils", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sendDiscordWebhook은 webhook URL로 메시지를 전송한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    const { sendDiscordWebhook } = await import("../discord");

    await sendDiscordWebhook("https://discord.com/api/webhooks/test", {
      content: "스토리 업데이트",
      username: "SOLARIS",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/test",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("sendDiscordDm은 DM 채널 생성 후 메시지를 보낸다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "dm_channel_1" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const { sendDiscordDm } = await import("../discord");

    await sendDiscordDm("bot-token", "123456789", {
      content: "승인 완료",
      username: "SOLARIS",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://discord.com/api/v10/users/@me/channels",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://discord.com/api/v10/channels/dm_channel_1/messages",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
