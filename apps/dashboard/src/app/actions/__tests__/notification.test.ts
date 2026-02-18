import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateClient, mockNanoid, mockInsert } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockNanoid: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("nanoid", () => ({
  nanoid: mockNanoid,
}));

describe("createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      from: vi.fn(() => ({
        insert: mockInsert,
      })),
    });

    mockNanoid.mockReturnValue("notif_001");
    mockInsert.mockResolvedValue({ error: null });
  });

  it("in_app 채널이면 delivery_status를 skipped로 저장한다", async () => {
    const { createNotification } = await import("../notification");

    await createNotification({
      userId: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08",
      scope: "user",
      type: "character_approved",
      title: "승인 완료",
      body: "캐릭터가 승인되었습니다.",
      channel: "in_app",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "notif_001",
        delivery_status: "skipped",
      }),
    );
  });

  it("discord_dm 채널이면 delivery_status를 pending으로 저장한다", async () => {
    const { createNotification } = await import("../notification");

    await createNotification({
      userId: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08",
      scope: "user",
      type: "character_rejected",
      title: "반려 안내",
      body: "캐릭터가 반려되었습니다.",
      channel: "discord_dm",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "notif_001",
        delivery_status: "pending",
      }),
    );
  });

  it("supabase 인스턴스가 전달되면 createClient를 다시 호출하지 않는다", async () => {
    const { createNotification } = await import("../notification");
    const providedInsert = vi.fn().mockResolvedValue({ error: null });
    const providedClient = {
      from: vi.fn(() => ({
        insert: providedInsert,
      })),
    };

    await createNotification(
      {
        userId: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08",
        scope: "user",
        type: "character_approved",
        title: "승인 완료",
        body: "캐릭터가 승인되었습니다.",
        channel: "discord_dm",
      },
      providedClient as never,
    );

    expect(providedInsert).toHaveBeenCalled();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});
