import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CorePage from "../page";

describe("CorePage", () => {
  it("HELIOS CORE // COMMAND CENTER 헤더를 렌더링한다", () => {
    render(<CorePage />);
    expect(screen.getByText("HELIOS CORE // COMMAND CENTER")).toBeInTheDocument();
  });

  it("스토리 브리핑 타임라인을 렌더링한다", () => {
    render(<CorePage />);
    expect(screen.getByText("제3구역 검문 강화 — Bureau 긴급 배치")).toBeInTheDocument();
  });

  it("SYSTEM NOTICE 공지판을 렌더링한다", () => {
    render(<CorePage />);
    expect(screen.getByText("SYSTEM NOTICE")).toBeInTheDocument();
    expect(screen.getByText("시즌 0 사전 브리핑 안내")).toBeInTheDocument();
  });

  it("HELIOS SYSTEM STATUS를 렌더링한다", () => {
    render(<CorePage />);
    // 모바일 + 데스크탑 각각 1개씩 렌더링
    const headers = screen.getAllByText("HELIOS SYSTEM STATUS");
    expect(headers.length).toBe(2);
    const arcLabels = screen.getAllByText("ARC-01 // 35%");
    expect(arcLabels.length).toBe(2);
  });

  it("COMBAT HIGHLIGHTS를 렌더링한다", () => {
    render(<CorePage />);
    expect(screen.getByText("COMBAT HIGHLIGHTS")).toBeInTheDocument();
    expect(screen.getByText("아마츠키 레이 vs 카이토 진")).toBeInTheDocument();
  });

  it("도시 공명율과 활성 작전을 표시한다", () => {
    render(<CorePage />);
    // 모바일 + 데스크탑 각각 1개씩
    const resonance = screen.getAllByText("82.4%");
    expect(resonance.length).toBe(2);
    const ops = screen.getAllByText("7");
    expect(ops.length).toBe(2);
  });

  it("데스크탑 3열 그리드 레이아웃을 가진다", () => {
    const { container } = render(<CorePage />);
    const grid = container.querySelector(".lg\\:grid-cols-3");
    expect(grid).toBeInTheDocument();
  });

  it("모바일에서 SystemStatus가 상단에 표시된다", () => {
    const { container } = render(<CorePage />);
    // SystemStatus는 lg:hidden인 모바일 전용 + lg:block인 데스크탑 버전
    const mobileStatus = container.querySelector("[data-testid='mobile-system-status']");
    expect(mobileStatus).toBeInTheDocument();
  });
});
