import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CorePage from "../page";

describe("CorePage", () => {
  it("헬리오스 코어 브리핑 타임라인을 렌더링한다", () => {
    render(<CorePage />);

    expect(screen.getByText("HELIOS CORE")).toBeInTheDocument();
    expect(screen.getByText("정화 작전 제3막 개시")).toBeInTheDocument();
    expect(screen.getByText("코어 외곽 방어막이 12분 후 재기동됩니다.")).toBeInTheDocument();
  });

  it("관리자 공지, 전투 하이라이트, ARC 상태를 표시한다", () => {
    render(<CorePage />);

    expect(screen.getByText("관리자 공지")).toBeInTheDocument();
    expect(screen.getByText("전투 하이라이트")).toBeInTheDocument();
    expect(screen.getByText("ARC 진행 상태")).toBeInTheDocument();
    expect(screen.getByText("74%")).toBeInTheDocument();
  });
});
