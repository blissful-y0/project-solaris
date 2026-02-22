import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockRpc,
  mockFrom,
  mockNanoid,
  mockCreateNotification,
  mockGetServiceClient,
  mockCharacterSingle,
  mockCharacterDeleteEq,
  mockCharactersDelete,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockNanoid: vi.fn(),
  mockCreateNotification: vi.fn(),
  mockGetServiceClient: vi.fn(),
  mockCharacterSingle: vi.fn(),
  mockCharacterDeleteEq: vi.fn(),
  mockCharactersDelete: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("nanoid", () => ({
  nanoid: mockNanoid,
}));

vi.mock("@/app/actions/notification", () => ({
  createNotification: mockCreateNotification,
}));

vi.mock("@/lib/supabase/service", () => ({
  getServiceClient: mockGetServiceClient,
}));

function createCharactersSelectChain() {
  return {
    eq: vi.fn(() => ({
      is: vi.fn(() => ({
        single: mockCharacterSingle,
      })),
    })),
  };
}

function createCharactersDeleteChain() {
  const chain = {
    eq: vi.fn(),
  };
  chain.eq.mockImplementation((column: string) => {
    if (column === "user_id") {
      return Promise.resolve({ error: null });
    }
    return chain;
  });
  return {
    eq: chain.eq,
  };
}

describe("character actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      rpc: mockRpc,
      from: mockFrom,
    });
    mockCreateNotification.mockResolvedValue(undefined);
    mockGetServiceClient.mockReturnValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    });
    mockCharactersDelete.mockReturnValue(createCharactersDeleteChain());

    mockFrom.mockImplementation((table: string) => {
      if (table === "characters") {
        return {
          select: vi.fn(() => createCharactersSelectChain()),
          delete: mockCharactersDelete,
        };
      }

      if (table === "users") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { discord_username: "safe-user" },
                error: null,
              }),
            })),
          })),
        };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
      };
    });
  });

  it("submitCharacter는 RPC로 캐릭터와 능력을 원자 생성한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });
    mockNanoid
      .mockReturnValueOnce("char_001")
      .mockReturnValueOnce("ab_001")
      .mockReturnValueOnce("ab_002")
      .mockReturnValueOnce("ab_003");
    mockRpc.mockResolvedValue({ data: "char_001", error: null });

    const result = await submitCharacter({
      name: "테스터",
      faction: "bureau",
      abilityClass: "field",
      resonanceRate: 80,
      profileData: { age: "24", gender: "M", personality: "침착" },
      profileImageUrl: "https://cdn.example.com/profile.png",
      appearance: "검은 코트",
      backstory: "테스트 배경",
      leaderApplication: true,
      abilities: [
        {
          tier: "basic",
          name: "기본",
          description: "기본 설명",
          costHp: 0,
          costWill: 10,
        },
        {
          tier: "mid",
          name: "중급",
          description: "중급 설명",
          costHp: 0,
          costWill: 20,
        },
        {
          tier: "advanced",
          name: "고급",
          description: "고급 설명",
          costHp: 0,
          costWill: 30,
        },
      ],
    });

    expect(result).toEqual({ characterId: "char_001" });
    expect(mockRpc).toHaveBeenCalledWith(
      "create_character_with_abilities",
      expect.objectContaining({
        p_id: "char_001",
        p_user_id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08",
        p_hp_max: 80,
        p_will_max: 250,
        p_leader_application: true,
        p_crossover_style: null,
        p_resonance_rate: 80,
        p_profile_image_url: "https://cdn.example.com/profile.png",
      }),
    );
  });

  it("submitCharacter는 웹훅 본문에서 멘션 문자를 이스케이프한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });
    mockNanoid
      .mockReturnValueOnce("char_001")
      .mockReturnValueOnce("ab_001")
      .mockReturnValueOnce("ab_002")
      .mockReturnValueOnce("ab_003");
    mockRpc.mockResolvedValue({ data: "char_001", error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "characters") {
        return {
          select: vi.fn(() => createCharactersSelectChain()),
          delete: mockCharactersDelete,
        };
      }

      if (table === "users") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { discord_username: "@everyone" },
                error: null,
              }),
            })),
          })),
        };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
      };
    });

    await submitCharacter({
      name: "@here 테스터",
      faction: "bureau",
      abilityClass: "field",
      resonanceRate: 80,
      profileData: { age: "24", gender: "M", personality: "침착" },
      profileImageUrl: "https://cdn.example.com/profile.png",
      appearance: "검은 코트",
      backstory: "테스트 배경",
      leaderApplication: true,
      abilities: [
        {
          tier: "basic",
          name: "기본",
          description: "기본 설명",
          costHp: 0,
          costWill: 10,
        },
        {
          tier: "mid",
          name: "중급",
          description: "중급 설명",
          costHp: 0,
          costWill: 20,
        },
        {
          tier: "advanced",
          name: "고급",
          description: "고급 설명",
          costHp: 0,
          costWill: 30,
        },
      ],
    });

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "discord_webhook",
        body: expect.stringContaining("이름: **＠here 테스터**"),
      }),
      expect.anything(),
    );
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "discord_webhook",
        body: expect.stringContaining("신청자: @＠everyone"),
      }),
      expect.anything(),
    );
  });

  it("submitCharacter는 보안국 공명율이 80 미만이면 거부한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    await expect(
      submitCharacter({
        name: "테스터",
        faction: "bureau",
        abilityClass: "field",
        resonanceRate: 79,
        profileData: {},
        profileImageUrl: "",
        appearance: "",
        backstory: "",
        leaderApplication: false,
        crossoverStyle: null,
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "기본 설명",
            costHp: 0,
            costWill: 10,
          },
          {
            tier: "mid",
            name: "중급",
            description: "중급 설명",
            costHp: 0,
            costWill: 20,
          },
          {
            tier: "advanced",
            name: "고급",
            description: "고급 설명",
            costHp: 0,
            costWill: 30,
          },
        ],
      }),
    ).rejects.toThrow("INVALID_RESONANCE_RATE");
  });

  it("submitCharacter는 스태틱 공명율이 15 초과면 거부한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    await expect(
      submitCharacter({
        name: "테스터",
        faction: "static",
        abilityClass: "field",
        resonanceRate: 16,
        profileData: {},
        profileImageUrl: "",
        appearance: "",
        backstory: "",
        leaderApplication: false,
        crossoverStyle: null,
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "기본 설명",
            costHp: 10,
            costWill: 0,
          },
          {
            tier: "mid",
            name: "중급",
            description: "중급 설명",
            costHp: 20,
            costWill: 0,
          },
          {
            tier: "advanced",
            name: "고급",
            description: "고급 설명",
            costHp: 30,
            costWill: 0,
          },
        ],
      }),
    ).rejects.toThrow("INVALID_RESONANCE_RATE");
  });

  it("submitCharacter는 crossoverStyle이 있으면 스킬별 HP/WILL 코스트를 모두 요구한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    await expect(
      submitCharacter({
        name: "테스터",
        faction: "bureau",
        abilityClass: "field",
        resonanceRate: 80,
        profileData: {},
        profileImageUrl: "",
        appearance: "",
        backstory: "",
        leaderApplication: false,
        crossoverStyle: "limiter-override",
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "기본 설명",
            costHp: 0,
            costWill: 10,
          },
          {
            tier: "mid",
            name: "중급",
            description: "중급 설명",
            costHp: 0,
            costWill: 20,
          },
          {
            tier: "advanced",
            name: "고급",
            description: "고급 설명",
            costHp: 0,
            costWill: 30,
          },
        ],
      }),
    ).rejects.toThrow("INVALID_DUAL_COST");
  });

  it("submitCharacter는 미인증 사용자를 거부한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(
      submitCharacter({
        name: "테스터",
        faction: "bureau",
        abilityClass: "field",
        resonanceRate: 80,
        profileData: {},
        profileImageUrl: "",
        appearance: "",
        backstory: "",
        leaderApplication: false,
        crossoverStyle: null,
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "기본 설명",
            costHp: 0,
            costWill: 10,
          },
          {
            tier: "mid",
            name: "중급",
            description: "중급 설명",
            costHp: 0,
            costWill: 20,
          },
          {
            tier: "advanced",
            name: "고급",
            description: "고급 설명",
            costHp: 0,
            costWill: 30,
          },
        ],
      }),
    ).rejects.toThrow("UNAUTHENTICATED");
  });

  it("submitCharacter는 이름/설명 검증 실패 시 거부한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    await expect(
      submitCharacter({
        name: " ",
        faction: "bureau",
        abilityClass: "field",
        resonanceRate: 80,
        profileData: {},
        profileImageUrl: "",
        appearance: "",
        backstory: "",
        leaderApplication: false,
        crossoverStyle: null,
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "기본 설명",
            costHp: 0,
            costWill: 10,
          },
          {
            tier: "mid",
            name: "중급",
            description: "중급 설명",
            costHp: 0,
            costWill: 20,
          },
          {
            tier: "advanced",
            name: "고급",
            description: "고급 설명",
            costHp: 0,
            costWill: 30,
          },
        ],
      }),
    ).rejects.toThrow("INVALID_CHARACTER_NAME");
  });

  it("cancelCharacter는 pending/rejected 상태만 하드 삭제한다", async () => {
    const { cancelCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });
    mockCharacterSingle.mockResolvedValue({
      data: { id: "char_001", status: "pending" },
      error: null,
    });

    await cancelCharacter();

    expect(mockCharactersDelete).toHaveBeenCalled();
  });

  it("getMyCharacter는 내 캐릭터와 능력 조인 결과를 반환한다", async () => {
    const { getMyCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });
    mockCharacterSingle.mockResolvedValue({
      data: {
        id: "char_001",
        status: "approved",
        abilities: [{ id: "ab_001", tier: "basic" }],
      },
      error: null,
    });

    const result = await getMyCharacter();

    expect(result).toEqual(
      expect.objectContaining({
        id: "char_001",
      }),
    );
  });

  it("getMyCharacter는 캐릭터 미존재면 null을 반환한다", async () => {
    const { getMyCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });
    mockCharacterSingle.mockResolvedValue({
      data: null,
      error: { code: "PGRST116" },
    });

    const result = await getMyCharacter();
    expect(result).toBeNull();
  });

  it("getMyCharacter는 DB 오류를 삼키지 않고 던진다", async () => {
    const { getMyCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });
    mockCharacterSingle.mockResolvedValue({
      data: null,
      error: { code: "42501" },
    });

    await expect(getMyCharacter()).rejects.toThrow("권한이 없습니다.");
  });
});
