import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResonanceTasks } from "../ResonanceTasks";

/* localStorage 모킹 */
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { value: storageMock, writable: true });
});

afterEach(() => {
  storageMock.clear();
  vi.restoreAllMocks();
});

describe("ResonanceTasks", () => {
  it("텍스트 에어리어를 표시한다", () => {
    render(<ResonanceTasks />);
    expect(screen.getByRole("textbox", { name: /Personal Directives Memo/i })).toBeInTheDocument();
  });

  it("마운트 후 SYNC: OK 상태를 표시한다", () => {
    render(<ResonanceTasks />);
    expect(screen.getByText("SYNC: OK")).toBeInTheDocument();
  });

  it("입력 시 localStorage에 저장한다", async () => {
    const user = userEvent.setup();
    render(<ResonanceTasks />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "test memo");

    expect(storageMock.setItem).toHaveBeenCalledWith(
      "helios_personal_directives",
      expect.stringContaining("test memo"),
    );
  });

  it("localStorage에 저장된 메모를 불러온다", () => {
    storageMock.getItem.mockReturnValueOnce("saved content");
    render(<ResonanceTasks />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("saved content");
  });

  it("바이트 카운터를 표시한다", async () => {
    const user = userEvent.setup();
    render(<ResonanceTasks />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "hello");

    expect(screen.getByText("5 BYTES")).toBeInTheDocument();
  });
});
