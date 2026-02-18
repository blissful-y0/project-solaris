import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));
const { mockMaybeSingle } = vi.hoisted(() => ({
  mockMaybeSingle: vi.fn(),
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
  mockCitizen: { name: "목시민", faction: "Bureau", resonanceRate: 87 },
  ResonanceTasks: () => <div data-testid="resonance-tasks" />,
  mockTasks: [],
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      }),
    }),
  }),
}));

import HomePage from "../page";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("Dashboard HomePage", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockMaybeSingle.mockReset();
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it("getUser 응답 전에는 로딩 상태를 표시한다", () => {
    const deferred = createDeferred<{ data: { user: null } }>();
    mockGetUser.mockReturnValue(deferred.promise);

    render(<HomePage />);

    expect(screen.getByText("사용자 정보를 불러오는 중...")).toBeInTheDocument();
  });

  it("getUser 실패 시 에러 메시지와 재시도 버튼을 표시한다", async () => {
    const user = userEvent.setup();
    mockGetUser
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ data: { user: null } });

    render(<HomePage />);

    expect(
      await screen.findByText("사용자 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalledTimes(2);
    });
  });

  it("캐릭터 미등록 시 CitizenIDCard에 null이 전달된다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          user_metadata: {
            full_name: "테스트 오퍼레이터",
            avatar_url: "https://evil.example/avatar.png",
          },
        },
      },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("citizen-id-card")).toHaveTextContent("미등록");
    });
  });

  it("displayName은 32자 제한과 제어문자 제거를 적용한다", async () => {
    const rawName = "테스트\u0000오퍼레이터_이름길이제한을확인하기위한문자열_123456";

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          user_metadata: {
            full_name: rawName,
          },
        },
      },
    });

    render(<HomePage />);

    const expected = "테스트오퍼레이터_이름길이제한을확인하기위한문자열_123456".slice(0, 32);
    const matches = await screen.findAllByText(expected);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("캐릭터가 approved면 환영 문구에 캐릭터 이름을 우선 표시한다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          user_metadata: {
            full_name: "ambiguousmorality",
          },
        },
      },
    });
    mockMaybeSingle.mockResolvedValue({
      data: {
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
      error: null,
    });

    render(<HomePage />);

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("아마츠키 레이");
    expect(screen.queryByText("ambiguousmorality")).not.toBeInTheDocument();
  });

  it("캐릭터가 approved가 아니면 환영 문구에 Discord 표시명을 표시한다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          user_metadata: {
            full_name: "ambiguousmorality",
          },
        },
      },
    });
    mockMaybeSingle.mockResolvedValue({
      data: {
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
      error: null,
    });

    render(<HomePage />);

    expect(await screen.findByText("ambiguousmorality")).toBeInTheDocument();
  });
});
