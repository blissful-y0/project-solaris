import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminCharactersPage from "../page";

describe("AdminCharactersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("큐를 렌더링하고 승인 요청을 보낸다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "char_1",
              name: "테스터",
              faction: "bureau",
              resonance_rate: 80,
              leader_application: true,
              is_leader: false,
              abilities: [],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "char_1", status: "approved" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AdminCharactersPage />);

    await waitFor(() => {
      expect(screen.getByText("테스터")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "승인" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/characters/char_1/approve",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
