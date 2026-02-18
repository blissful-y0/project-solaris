import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CitizenIDCard } from "../CitizenIDCard";
import type { CitizenData } from "../mock-citizen";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({}),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseCitizen: CitizenData = {
  name: "아마츠키 레이",
  faction: "Bureau",
  resonanceRate: 87,
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  citizenId: "SCC-7291-0483",
  avatarUrl: null,
  abilityClass: "역장 (Field)",
  joinDate: "2026-01-15",
  status: "approved",
};

describe("PendingCard", () => {
  const pendingCitizen: CitizenData = {
    ...baseCitizen,
    status: "pending",
  };

  it("승인 대기 상태 라벨을 표시한다", () => {
    render(<CitizenIDCard citizen={pendingCitizen} />);
    expect(screen.getByText("APPROVAL PENDING")).toBeInTheDocument();
  });

  it("캐릭터 이름을 표시한다", () => {
    render(<CitizenIDCard citizen={pendingCitizen} />);
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
  });

  it("소속 정보를 표시한다", () => {
    render(<CitizenIDCard citizen={pendingCitizen} />);
    expect(
      screen.getByText("Solaris Bureau of Civic Security"),
    ).toBeInTheDocument();
  });

  it("신청 취소 버튼을 렌더링한다", () => {
    render(<CitizenIDCard citizen={pendingCitizen} />);
    expect(
      screen.getByRole("button", { name: /신청 취소/ }),
    ).toBeInTheDocument();
  });

  it("신청 취소 클릭 시 onCancel을 호출한다", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<CitizenIDCard citizen={pendingCitizen} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: /신청 취소/ }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("HELIOS 신원 확인 안내 텍스트를 표시한다", () => {
    render(<CitizenIDCard citizen={pendingCitizen} />);
    expect(screen.getByText(/HELIOS 시스템이 신원을 확인/)).toBeInTheDocument();
  });
});

describe("RejectedCard", () => {
  const rejectedCitizen: CitizenData = {
    ...baseCitizen,
    status: "rejected",
  };

  it("반려 상태 라벨을 표시한다", () => {
    render(<CitizenIDCard citizen={rejectedCitizen} />);
    expect(screen.getByText("REGISTRATION DENIED")).toBeInTheDocument();
  });

  it("캐릭터 이름을 표시한다", () => {
    render(<CitizenIDCard citizen={rejectedCitizen} />);
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
  });

  it("재신청 링크를 제공한다", () => {
    render(<CitizenIDCard citizen={rejectedCitizen} />);
    const link = screen.getByRole("link", { name: /재신청/ });
    expect(link).toHaveAttribute("href", "/character/create");
  });

  it("반려 안내 텍스트를 표시한다", () => {
    render(<CitizenIDCard citizen={rejectedCitizen} />);
    expect(screen.getByText(/등록이 반려되었습니다/)).toBeInTheDocument();
  });
});

describe("기존 카드 호환성", () => {
  it("status=approved이면 기존 RegisteredCard를 렌더링한다", () => {
    render(<CitizenIDCard citizen={baseCitizen} />);
    expect(screen.getByText("SOLARIS CITIZEN ID")).toBeInTheDocument();
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("status 미지정(undefined)이면 RegisteredCard를 렌더링한다", () => {
    const { status, ...noCitizenStatus } = baseCitizen;
    render(
      <CitizenIDCard citizen={noCitizenStatus as CitizenData} />,
    );
    expect(screen.getByText("SOLARIS CITIZEN ID")).toBeInTheDocument();
  });

  it("citizen이 null이면 EmptyCard를 렌더링한다", () => {
    render(<CitizenIDCard citizen={null} />);
    expect(screen.getByText("미확인 시민")).toBeInTheDocument();
  });
});
