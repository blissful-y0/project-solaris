import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "../TopBar";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/* usePathname 모킹 */
const mockPathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("TopBar", () => {
  it("SOLARIS 로고를 렌더링한다", () => {
    render(<TopBar />);
    expect(screen.getByText("SOLARIS")).toBeInTheDocument();
  });

  it("has header role", () => {
    render(<TopBar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("has navigation role", () => {
    render(<TopBar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  // --- 데스크탑 네비게이션 ---

  it("5개 네비게이션 항목을 모두 렌더링한다", () => {
    render(<TopBar isCharacterApproved />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Helios Core")).toBeInTheDocument();
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("Registry")).toBeInTheDocument();
    expect(screen.getByText("Lore")).toBeInTheDocument();
  });

  it("활성 항목에 aria-current=page를 설정한다", () => {
    mockPathname.mockReturnValue("/registry");
    render(<TopBar isCharacterApproved />);
    const activeLink = screen.getByRole("link", { name: /registry/i });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("비활성 항목에는 aria-current가 없다", () => {
    mockPathname.mockReturnValue("/registry");
    render(<TopBar isCharacterApproved />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  it("올바른 경로로 링크된다", () => {
    render(<TopBar isCharacterApproved />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /helios core/i })).toHaveAttribute("href", "/core");
    expect(screen.getByRole("link", { name: /operation/i })).toHaveAttribute("href", "/operation");
    expect(screen.getByRole("link", { name: /registry/i })).toHaveAttribute("href", "/registry");
    expect(screen.getByRole("link", { name: /lore/i })).toHaveAttribute("href", "/lore");
  });

  // --- 알림 뱃지 ---

  it("notificationCount가 있으면 뱃지를 표시한다", () => {
    render(<TopBar notificationCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("notificationCount=0이면 뱃지를 표시하지 않는다", () => {
    render(<TopBar notificationCount={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("notificationCount 미전달 시 뱃지를 표시하지 않는다", () => {
    render(<TopBar />);
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
  });

  // --- 잠금 UI ---

  it("Operation은 항상 정상 Link로 렌더링한다", () => {
    render(<TopBar />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    expect(operationLink).toHaveAttribute("href", "/operation");
  });

  it("Operation에 Lock 아이콘 없음", () => {
    render(<TopBar />);
    expect(screen.queryByTestId("lock-icon-/operation")).not.toBeInTheDocument();
  });

  // --- 마이페이지 ---

  it("마이페이지 링크를 표시한다", () => {
    render(<TopBar />);
    expect(screen.getByRole("link", { name: "마이페이지" })).toHaveAttribute("href", "/my");
  });
});
