import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_DRAFT, type CharacterDraft } from "../types";
import { StepProfile } from "../StepProfile";

describe("StepProfile", () => {
  const defaultProps = {
    draft: EMPTY_DRAFT,
    onChange: vi.fn() as (patch: Partial<CharacterDraft>) => void,
    onImageUpload: vi.fn() as (file: File) => void,
    isUploading: false,
  };

  it("모든 프로필 필드를 렌더링한다", () => {
    render(<StepProfile {...defaultProps} />);

    expect(screen.getByLabelText(/캐릭터 이름/)).toBeInTheDocument();
    expect(screen.getByLabelText(/성별/)).toBeInTheDocument();
    expect(screen.getByLabelText(/나이/)).toBeInTheDocument();
    expect(screen.getByLabelText(/외형 묘사/)).toBeInTheDocument();
    expect(screen.getByLabelText(/프로필 이미지/)).toBeInTheDocument();
    expect(screen.getByLabelText(/성격/)).toBeInTheDocument();
    expect(screen.getByLabelText(/배경 스토리/)).toBeInTheDocument();
  });

  it("프로필 이미지 선택 시 onImageUpload를 호출한다", async () => {
    const user = userEvent.setup();
    const onImageUpload = vi.fn();

    render(<StepProfile {...defaultProps} onImageUpload={onImageUpload} />);

    const imageInput = screen.getByLabelText(/프로필 이미지/) as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(imageInput, file);

    expect(onImageUpload).toHaveBeenCalledOnce();
    expect(onImageUpload).toHaveBeenCalledWith(file);
  });

  it("캐릭터 이름 입력 시 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StepProfile {...defaultProps} onChange={onChange} />);
    await user.type(screen.getByLabelText(/캐릭터 이름/), "카이");

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: "카" }));
  });

  it("나이 필드는 숫자만 허용한다", () => {
    render(<StepProfile {...defaultProps} />);
    const ageInput = screen.getByLabelText(/나이/);

    expect(ageInput).toHaveAttribute("type", "number");
    expect(ageInput).toHaveAttribute("min", "15");
    expect(ageInput).toHaveAttribute("max", "999");
  });

  it("기존 값을 표시한다", () => {
    const draft = {
      ...EMPTY_DRAFT,
      name: "테스트 캐릭터",
      age: "25",
      gender: "남성",
    };
    render(<StepProfile {...defaultProps} draft={draft} />);

    expect(screen.getByLabelText(/캐릭터 이름/)).toHaveValue("테스트 캐릭터");
    expect(screen.getByLabelText(/나이/)).toHaveValue(25);
    expect(screen.getByLabelText(/성별/)).toHaveValue("남성");
  });

  it("textarea 필드에 maxLength를 설정한다", () => {
    render(<StepProfile {...defaultProps} />);

    expect(screen.getByLabelText(/외형 묘사/)).toHaveAttribute("maxLength", "500");
    expect(screen.getByLabelText(/성격/)).toHaveAttribute("maxLength", "500");
    expect(screen.getByLabelText(/배경 스토리/)).toHaveAttribute("maxLength", "1000");
  });
});
