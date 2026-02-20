import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import CharactersPage from "../page";

/* ─── mock API 응답 데이터 ─── */

const mockListData = [
  {
    id: "1",
    is_mine: true,
    name: "아마츠키 레이",
    faction: "bureau",
    ability_class: "field",
    profile_image_url: "https://example.com/avatar.jpg",
    is_leader: true,
  },
  {
    id: "2",
    is_mine: false,
    name: "크로우 제로",
    faction: "static",
    ability_class: "shift",
    profile_image_url: null,
    is_leader: true,
  },
  {
    id: "3",
    is_mine: false,
    name: "카이 렌",
    faction: "defector",
    ability_class: "field",
    profile_image_url: null,
    is_leader: false,
  },
];

const mockDetailData = {
  id: "1",
  name: "아마츠키 레이",
  faction: "bureau",
  ability_class: "field",
  hp_max: 80,
  hp_current: 72,
  will_max: 250,
  will_current: 190,
  appearance: "은발 단발.",
  backstory: "Enforcer 에이스.",
  profile_image_url: "https://example.com/avatar.jpg",
  is_leader: true,
  resonance_rate: 87,
  abilities: [
    {
      id: "a1",
      character_id: "1",
      tier: "basic",
      name: "압축 역장",
      description: "방어 역장.",
      weakness: "8초 이내.",
      cost_hp: 0,
      cost_will: 15,
    },
  ],
};

function mockFetchSuccess() {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/characters") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockListData }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockDetailData }),
    });
  });
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ error: "INTERNAL_SERVER_ERROR" }),
  });
}

function mockFetchEmpty() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  });
}

beforeEach(() => {
  mockFetchSuccess();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CharactersPage", () => {
  it("페이지 헤더를 렌더링한다", async () => {
    render(<CharactersPage />);
    expect(screen.getByText("REGISTRY // CITIZEN DATABASE")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("아마츠키 레이")).toBeInTheDocument());
  });

  it("로딩 중 Skeleton을 표시한다", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {}),
    ) as unknown as typeof fetch;
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CharactersPage />);
    const skeletons = document.querySelectorAll(".h-\\[170px\\]");
    expect(skeletons.length).toBe(6);
    await Promise.resolve();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
    global.fetch = originalFetch;
  });

  it("데이터 로드 후 캐릭터를 표시한다", async () => {
    render(<CharactersPage />);
    await waitFor(() => {
      expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
      expect(screen.getByText("크로우 제로")).toBeInTheDocument();
      expect(screen.getByText("카이 렌")).toBeInTheDocument();
    });
  });

  it("TOTAL OPERATIVES 카운트를 표시한다", async () => {
    render(<CharactersPage />);
    await waitFor(() => {
      expect(screen.getByText(/TOTAL OPERATIVES: 3/)).toBeInTheDocument();
    });
  });

  it("캐릭터 카드 클릭 → 상세 fetch 후 프로필 모달 표시", async () => {
    const user = userEvent.setup();
    render(<CharactersPage />);

    await waitFor(() => expect(screen.getByText("아마츠키 레이")).toBeInTheDocument());

    await user.click(
      screen.getByRole("button", { name: /아마츠키 레이 상세 보기/ }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/characters/1");

    await waitFor(() => {
      expect(screen.getByText("87%")).toBeInTheDocument();
    });
  });

  it("API 에러 시 에러 메시지를 표시한다", async () => {
    mockFetchError();
    render(<CharactersPage />);

    await waitFor(() => {
      expect(
        screen.getByText("캐릭터 데이터를 불러오는 데 실패했습니다."),
      ).toBeInTheDocument();
    });
  });

  it("승인된 캐릭터가 없으면 빈 상태 메시지를 표시한다", async () => {
    mockFetchEmpty();
    render(<CharactersPage />);

    await waitFor(() => {
      expect(screen.getByText("등록된 시민이 없습니다")).toBeInTheDocument();
    });
  });

  it("/api/characters 목록 엔드포인트를 호출한다", async () => {
    render(<CharactersPage />);

    await waitFor(() => expect(screen.getByText("아마츠키 레이")).toBeInTheDocument());

    expect(global.fetch).toHaveBeenCalledWith("/api/characters", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });
});
