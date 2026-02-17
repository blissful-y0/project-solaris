import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CitizenIDCard } from "../CitizenIDCard";
import type { CitizenData } from "../mock-citizen";

/* ─── next/link 모킹 (href만 검증) ─── */
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

/* ─── 테스트용 시민 데이터 ─── */
const baseCitizen: CitizenData = {
  name: "카이 서연",
  faction: "Bureau",
  resonanceRate: 87,
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  citizenId: "SCC-7291-0483",
  avatarUrl: null,
  abilityClass: "역장 (Field)",
  joinDate: "2026-01-15",
};

describe("CitizenIDCard", () => {
  describe("시민 등록 상태 (앞면)", () => {
    it("시민 이름을 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      /* 앞면 + 뒷면 모두에 이름이 표시됨 */
      const names = screen.getAllByText("카이 서연");
      expect(names.length).toBeGreaterThanOrEqual(1);
    });

    it("SOLARIS CITIZEN ID 라벨을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("SOLARIS CITIZEN ID")).toBeInTheDocument();
    });

    it("진영 Badge를 표시한다 (Bureau → SBCS)", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("SBCS")).toBeInTheDocument();
    });

    it("Static 진영은 STATIC Badge를 표시한다", () => {
      const staticCitizen: CitizenData = {
        ...baseCitizen,
        faction: "Static",
      };
      render(<CitizenIDCard citizen={staticCitizen} />);
      expect(screen.getByText("STATIC")).toBeInTheDocument();
    });

    it("공명율을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("87%")).toBeInTheDocument();
    });

    it("공명율 >= 70이면 시안 컬러를 적용한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const rr = screen.getByText("87%");
      expect(rr).toHaveClass("text-primary");
    });

    it("공명율 < 40이면 레드 컬러를 적용한다", () => {
      const lowRR: CitizenData = { ...baseCitizen, resonanceRate: 25 };
      render(<CitizenIDCard citizen={lowRR} />);
      const rr = screen.getByText("25%");
      expect(rr).toHaveClass("text-accent");
    });

    it("HP 배터리를 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const hpMeter = screen.getByRole("meter", { name: /HP 64\/80/ });
      expect(hpMeter).toBeInTheDocument();
    });

    it("WILL 파형을 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const willMeter = screen.getByRole("meter", { name: /WILL 198\/250/ });
      expect(willMeter).toBeInTheDocument();
    });

    it("HP 수치를 텍스트로 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("64/80")).toBeInTheDocument();
    });

    it("WILL 수치를 텍스트로 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("198/250")).toBeInTheDocument();
    });

    it("카드 번호를 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      /* 앞면 + 뒷면 모두에 카드 번호가 표시됨 */
      const ids = screen.getAllByText("SCC-7291-0483");
      expect(ids.length).toBeGreaterThanOrEqual(1);
    });

    it("RESONANCE RATE 라벨을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("RESONANCE RATE")).toBeInTheDocument();
    });
  });

  describe("HP 배터리 색상", () => {
    it("HP >= 60%이면 success 색상", () => {
      const citizen: CitizenData = {
        ...baseCitizen,
        hp: { current: 60, max: 80 },
      };
      render(<CitizenIDCard citizen={citizen} />);
      const meter = screen.getByRole("meter", { name: /HP/ });
      const filledSegments = meter.querySelectorAll(".bg-success");
      expect(filledSegments.length).toBeGreaterThan(0);
    });

    it("HP < 30%이면 accent (레드) 색상", () => {
      const citizen: CitizenData = {
        ...baseCitizen,
        hp: { current: 15, max: 80 },
      };
      render(<CitizenIDCard citizen={citizen} />);
      const meter = screen.getByRole("meter", { name: /HP/ });
      const filledSegments = meter.querySelectorAll(".bg-accent");
      expect(filledSegments.length).toBeGreaterThan(0);
    });
  });

  describe("플립 인터랙션", () => {
    it("클릭하면 카드가 뒤집힌다", async () => {
      const user = userEvent.setup();
      render(<CitizenIDCard citizen={baseCitizen} />);

      const card = screen.getByRole("button", {
        name: /시민 ID 카드/,
      });
      await user.click(card);

      /* 뒷면 컨텐츠: CITIZEN PROFILE 라벨 */
      expect(screen.getByText("CITIZEN PROFILE")).toBeInTheDocument();
    });

    it("Enter 키로 카드를 뒤집을 수 있다", async () => {
      const user = userEvent.setup();
      render(<CitizenIDCard citizen={baseCitizen} />);

      const card = screen.getByRole("button", {
        name: /시민 ID 카드/,
      });
      card.focus();
      await user.keyboard("{Enter}");

      expect(screen.getByText("CITIZEN PROFILE")).toBeInTheDocument();
    });

    it("Space 키로 카드를 뒤집을 수 있다", async () => {
      const user = userEvent.setup();
      render(<CitizenIDCard citizen={baseCitizen} />);

      const card = screen.getByRole("button", {
        name: /시민 ID 카드/,
      });
      card.focus();
      await user.keyboard(" ");

      expect(screen.getByText("CITIZEN PROFILE")).toBeInTheDocument();
    });

    it("aria-label에 시민 이름이 포함된다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute(
        "aria-label",
        "카이 서연 시민 ID 카드 (탭하여 뒤집기)",
      );
    });
  });

  describe("카드 뒷면", () => {
    it("소속 풀네임을 표시한다 (Bureau)", async () => {
      const user = userEvent.setup();
      render(<CitizenIDCard citizen={baseCitizen} />);

      const card = screen.getByRole("button", { name: /시민 ID 카드/ });
      await user.click(card);

      expect(
        screen.getByText("Solaris Bureau of Civic Security"),
      ).toBeInTheDocument();
    });

    it("능력 계열을 표시한다", async () => {
      const user = userEvent.setup();
      render(<CitizenIDCard citizen={baseCitizen} />);

      const card = screen.getByRole("button", { name: /시민 ID 카드/ });
      await user.click(card);

      expect(screen.getByText("역장 (Field)")).toBeInTheDocument();
    });

    it("내 프로필 보기 링크가 /my로 이동한다", async () => {
      const user = userEvent.setup();
      render(<CitizenIDCard citizen={baseCitizen} />);

      const card = screen.getByRole("button", { name: /시민 ID 카드/ });
      await user.click(card);

      const link = screen.getByText("내 프로필 보기 →");
      expect(link.closest("a")).toHaveAttribute("href", "/my");
    });
  });

  describe("빈 카드 (미등록)", () => {
    it("citizen이 null이면 빈 카드를 렌더링한다", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("미등록 시민")).toBeInTheDocument();
    });

    it("아바타 자리에 ? 표시", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("RR/HP/WILL 모두 ---로 표시한다", () => {
      render(<CitizenIDCard citizen={null} />);
      const dashes = screen.getAllByText("---");
      expect(dashes).toHaveLength(3);
    });

    it("캐릭터 생성 링크가 /character/create로 이동한다", () => {
      render(<CitizenIDCard citizen={null} />);
      const link = screen.getByRole("link", { name: /캐릭터 생성/ });
      expect(link).toHaveAttribute("href", "/character/create");
    });

    it("CTA 텍스트를 표시한다", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("탭하여 캐릭터 생성 →")).toBeInTheDocument();
    });
  });
});
