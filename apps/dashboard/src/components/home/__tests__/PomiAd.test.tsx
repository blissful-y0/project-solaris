import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PomiAd } from "../PomiAd";

describe("PomiAd", () => {
  it("기본 라벨 POMI WELLNESS를 표시한다", () => {
    render(<PomiAd text="테스트 문구" />);
    expect(screen.getByText("POMI WELLNESS")).toBeInTheDocument();
  });

  it("전달된 텍스트를 표시한다", () => {
    render(<PomiAd text="높은 공명율은 건강한 시민의 증거입니다." />);
    expect(
      screen.getByText("높은 공명율은 건강한 시민의 증거입니다."),
    ).toBeInTheDocument();
  });

  it("커스텀 라벨을 지원한다", () => {
    render(<PomiAd text="테스트" label="HELIOS CARE" />);
    expect(screen.getByText("HELIOS CARE")).toBeInTheDocument();
    expect(screen.queryByText("POMI WELLNESS")).not.toBeInTheDocument();
  });

  it("Card 컴포넌트로 렌더링되며 프로파간다 스타일을 갖는다", () => {
    const { container } = render(<PomiAd text="테스트" />);
    const card = container.firstElementChild;
    expect(card?.className).toContain("bg-primary/5");
    expect(card?.className).toContain("border-primary/20");
  });
});
