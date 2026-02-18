import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockRpc,
  mockFrom,
  mockNanoid,
  mockCharacterSingle,
  mockCharacterDeleteEq,
  mockCharactersDelete,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockNanoid: vi.fn(),
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
    mockCharactersDelete.mockReturnValue(createCharactersDeleteChain());

    mockFrom.mockImplementation((table: string) => {
      if (table === "characters") {
        return {
          select: vi.fn(() => createCharactersSelectChain()),
          delete: mockCharactersDelete,
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
      profileData: { age: "24", gender: "M", personality: "침착" },
      appearance: "검은 코트",
      backstory: "테스트 배경",
      leaderApplication: true,
      abilities: [
        {
          tier: "basic",
          name: "기본",
          description: "기본 설명",
          weakness: "약점",
          costAmount: 10,
        },
        {
          tier: "mid",
          name: "중급",
          description: "중급 설명",
          weakness: "약점",
          costAmount: 20,
        },
        {
          tier: "advanced",
          name: "고급",
          description: "고급 설명",
          weakness: "약점",
          costAmount: 30,
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
      }),
    );
  });

  it("submitCharacter는 미인증 사용자를 거부한다", async () => {
    const { submitCharacter } = await import("../character");

    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(
      submitCharacter({
        name: "테스터",
        faction: "bureau",
        abilityClass: "field",
        profileData: {},
        appearance: "",
        backstory: "",
        leaderApplication: false,
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "기본 설명",
            weakness: "",
            costAmount: 10,
          },
          {
            tier: "mid",
            name: "중급",
            description: "중급 설명",
            weakness: "",
            costAmount: 20,
          },
          {
            tier: "advanced",
            name: "고급",
            description: "고급 설명",
            weakness: "",
            costAmount: 30,
          },
        ],
      }),
    ).rejects.toThrow("UNAUTHENTICATED");
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
});
