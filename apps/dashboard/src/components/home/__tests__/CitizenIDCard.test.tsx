import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CitizenIDCard } from "../CitizenIDCard";
import type { CitizenData } from "../mock-citizen";

/* ─── next/link 모킹 ─── */
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
  name: "아마츠키 레이",
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
  describe("등록된 시민 카드", () => {
    it("시민 이름을 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
    });

    it("SOLARIS CITIZEN ID 라벨을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("SOLARIS CITIZEN ID")).toBeInTheDocument();
    });

    it("Bureau 소속 풀네임을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("Solaris Bureau of Civic Security")).toBeInTheDocument();
    });

    it("Static 소속명을 표시한다", () => {
      const staticCitizen: CitizenData = { ...baseCitizen, faction: "Static" };
      render(<CitizenIDCard citizen={staticCitizen} />);
      expect(screen.getByText("The Static")).toBeInTheDocument();
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
      expect(screen.getByText("SCC-7291-0483")).toBeInTheDocument();
    });

    it("RESONANCE RATE 라벨을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("RESONANCE RATE")).toBeInTheDocument();
    });

    it("능력 계열을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("역장 (Field)")).toBeInTheDocument();
    });

    it("등록일을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("2026-01-15")).toBeInTheDocument();
    });

    it("소속 풀네임이 이름 아래에 표시된다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("Solaris Bureau of Civic Security")).toBeInTheDocument();
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

  describe("빈 카드 (미등록)", () => {
    it("citizen이 null이면 빈 카드를 렌더링한다", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("미확인 시민")).toBeInTheDocument();
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
      expect(screen.getByText("NEW OPERATIVE REQUIRED")).toBeInTheDocument();
    });
  });
});
