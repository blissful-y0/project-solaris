import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: vi.fn(),
}));

import { requireAdmin } from "@/lib/admin-guard";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

const mockSupabase = { from: vi.fn() };

function makeChain(finalResult: object) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(finalResult),
  };
  chain.order = vi.fn().mockImplementation(() => {
    // second .order() call resolves
    let called = 0;
    return {
      order: vi.fn().mockResolvedValue(finalResult),
    };
  });
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  (requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ supabase: mockSupabase });
});

describe("GET /api/admin/lore", () => {
  it("인증 실패 시 401", async () => {
    (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("UNAUTHENTICATED"));
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("권한 없으면 403", async () => {
    (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("FORBIDDEN"));
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("성공 시 200과 data 반환", async () => {
    const docs = [{ id: "1", title: "제목", slug: "slug", clearance_level: 1, order_index: 0 }];
    const secondOrder = vi.fn().mockResolvedValue({ data: docs, error: null });
    const chain = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      // 첫 번째 .order() 호출은 두 번째 .order()가 있는 객체를 반환
      order: vi.fn().mockReturnValue({ order: secondOrder }),
    };
    mockSupabase.from.mockReturnValue(chain);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });
});

describe("POST /api/admin/lore", () => {
  it("title 없으면 400", async () => {
    const req = new NextRequest("http://localhost/api/admin/lore", {
      method: "POST",
      body: JSON.stringify({ slug: "test" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("slug 없으면 400", async () => {
    const req = new NextRequest("http://localhost/api/admin/lore", {
      method: "POST",
      body: JSON.stringify({ title: "제목" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
