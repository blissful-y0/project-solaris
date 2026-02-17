import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
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
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
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

  it("비 Discord avatar_url은 렌더링하지 않는다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
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
      expect(screen.queryByAltText("프로필")).not.toBeInTheDocument();
    });
  });

  it("displayName은 32자 제한과 제어문자 제거를 적용한다", async () => {
    const rawName = "테스트\u0000오퍼레이터_이름길이제한을확인하기위한문자열_123456";

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: "user@solaris.test",
          user_metadata: {
            full_name: rawName,
          },
        },
      },
    });

    render(<HomePage />);

    const expected = "테스트오퍼레이터_이름길이제한을확인하기위한문자열_1";
    const matches = await screen.findAllByText(expected);
    expect(matches.length).toBeGreaterThan(0);
  });
});
