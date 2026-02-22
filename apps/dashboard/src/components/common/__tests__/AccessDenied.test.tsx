import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccessDenied } from "../AccessDenied";

/* next/link 모킹 */
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

describe("AccessDenied", () => {
  it("자물쇠 아이콘을 표시한다", () => {
    render(<AccessDenied characterStatus={null} />);
    expect(screen.getByLabelText("접근 거부")).toBeInTheDocument();
  });

  it("'작전 참여 자격이 필요합니다' 텍스트를 표시한다", () => {
    render(<AccessDenied characterStatus={null} />);
    expect(
      screen.getByText("작전 참여 자격이 필요합니다"),
    ).toBeInTheDocument();
  });

  it("HELIOS SYSTEM 레이블을 표시한다", () => {
    render(<AccessDenied characterStatus={null} />);
    expect(screen.getByText("HELIOS SYSTEM // ACCESS RESTRICTED")).toBeInTheDocument();
  });

  describe("characterStatus=null (미등록)", () => {
    it("'캐릭터 생성하러 가기' 링크를 표시한다", () => {
      render(<AccessDenied characterStatus={null} />);
      const link = screen.getByRole("link", { name: /캐릭터 생성하러 가기/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/character/create");
    });
  });

  describe("characterStatus='pending' (승인 대기)", () => {
    it("'승인 대기 중' 텍스트를 표시한다", () => {
      render(<AccessDenied characterStatus="pending" />);
      expect(screen.getByText(/승인 대기 중/)).toBeInTheDocument();
    });

    it("링크를 표시하지 않는다", () => {
      render(<AccessDenied characterStatus="pending" />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("characterStatus='rejected' (거부)", () => {
    it("'재신청' 링크를 표시한다", () => {
      render(<AccessDenied characterStatus="rejected" />);
      const link = screen.getByRole("link", { name: /재신청/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/character/create");
    });
  });
});
