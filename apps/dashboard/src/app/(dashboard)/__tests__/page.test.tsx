import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseDashboardSession, mockRefetch } = vi.hoisted(() => ({
  mockUseDashboardSession: vi.fn(),
  mockRefetch: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("@/components/home", () => ({
  BriefingFeed: () => <div data-testid="briefing-feed" />,
  mockBriefings: [],
  CitizenIDCard: ({ citizen }: any) => (
    <div data-testid="citizen-id-card">{citizen ? citizen.name : "미등록"}</div>
  ),
}));

vi.mock("@/components/layout", async () => {
  const actual = await vi.importActual<typeof import("@/components/layout")>("@/components/layout");
  return {
    ...actual,
    useDashboardSession: mockUseDashboardSession,
  };
});

import HomePage from "../page";

describe("Dashboard HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardSession.mockReturnValue({
      me: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          displayName: "ambiguousmorality",
        },
        character: null,
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it("로딩 상태를 표시한다", () => {
    mockUseDashboardSession.mockReturnValue({
      me: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<HomePage />);

    expect(screen.getByText("사용자 정보를 불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 메시지와 재시도 버튼을 표시한다", async () => {
    const user = userEvent.setup();
    mockUseDashboardSession.mockReturnValue({
      me: null,
      loading: false,
      error: "FAILED_TO_FETCH_ME",
      refetch: mockRefetch,
    });

    render(<HomePage />);

    expect(screen.getByText("사용자 정보를 불러오지 못했습니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("캐릭터 미등록 시 CitizenIDCard에 null이 전달된다", () => {
    render(<HomePage />);
    expect(screen.getByTestId("citizen-id-card")).toHaveTextContent("미등록");
  });

  it("캐릭터가 approved면 환영 문구에 캐릭터 이름을 우선 표시한다", () => {
    mockUseDashboardSession.mockReturnValue({
      me: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          displayName: "ambiguousmorality",
        },
        character: {
          id: "char-1",
          name: "아마츠키 레이",
          faction: "bureau",
          ability_class: "field",
          hp_max: 80,
          hp_current: 80,
          will_max: 250,
          will_current: 230,
          profile_image_url: null,
          resonance_rate: 87,
          status: "approved",
          created_at: "2026-02-18T00:00:00.000Z",
        },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("아마츠키 레이");
  });

  it("캐릭터가 approved가 아니면 환영 문구에 displayName을 표시한다", () => {
    mockUseDashboardSession.mockReturnValue({
      me: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          displayName: "ambiguousmorality",
        },
        character: {
          id: "char-1",
          name: "아마츠키 레이",
          faction: "bureau",
          ability_class: "field",
          hp_max: 80,
          hp_current: 80,
          will_max: 250,
          will_current: 230,
          profile_image_url: null,
          resonance_rate: 87,
          status: "pending",
          created_at: "2026-02-18T00:00:00.000Z",
        },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<HomePage />);
    expect(screen.getByText("ambiguousmorality")).toBeInTheDocument();
  });
});
