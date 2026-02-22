import { describe, expect, it } from "vitest";

import { mapOperationListItem, mapOperationMessage } from "../dto";

describe("operations dto", () => {
  it("character가 null인 participant는 team에서 제외한다", () => {
    const mapped = mapOperationListItem(
      {
        id: "op-1",
        title: "테스트",
        type: "operation",
        status: "waiting",
        summary: "",
        is_main_story: false,
        max_participants: 4,
        created_at: "2026-02-22T00:00:00Z",
        created_by: "ch-host",
      },
      [
        { operation_id: "op-1", team: "bureau", character: { id: "ch-a", name: "A" } },
        { operation_id: "op-1", team: "static", character: null },
      ],
    );

    expect(mapped.teamA).toEqual([{ id: "ch-a", name: "A" }]);
    expect(mapped.teamB).toEqual([]);
  });

  it("created_by 참가자가 없으면 host를 빈 값으로 폴백한다", () => {
    const mapped = mapOperationListItem(
      {
        id: "op-1",
        title: "테스트",
        type: "downtime",
        status: "live",
        summary: "",
        is_main_story: false,
        max_participants: 8,
        created_at: "2026-02-22T00:00:00Z",
        created_by: "missing-host",
      },
      [{ operation_id: "op-1", team: "bureau", character: { id: "ch-a", name: "A" } }],
    );

    expect(mapped.host).toEqual({ id: "", name: "" });
  });

  it("defector는 teamB로 분류한다", () => {
    const mapped = mapOperationListItem(
      {
        id: "op-1",
        title: "테스트",
        type: "operation",
        status: "waiting",
        summary: "",
        is_main_story: false,
        max_participants: 4,
        created_at: "2026-02-22T00:00:00Z",
        created_by: "ch-a",
      },
      [
        { operation_id: "op-1", team: "bureau", character: { id: "ch-a", name: "A" } },
        { operation_id: "op-1", team: "defector", character: { id: "ch-d", name: "D" } },
      ],
    );

    expect(mapped.teamA).toEqual([{ id: "ch-a", name: "A" }]);
    expect(mapped.teamB).toEqual([{ id: "ch-d", name: "D" }]);
  });

  it("myCharacterId가 null이면 isMine은 false다", () => {
    const mapped = mapOperationMessage(
      {
        id: "msg-1",
        type: "narration",
        content: "hello",
        created_at: "2026-02-22T00:00:00Z",
        sender_character_id: "ch-a",
        sender: { id: "ch-a", name: "A", profile_image_url: null },
      },
      null,
    );

    expect(mapped.isMine).toBe(false);
  });
});
