"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AccessDenied } from "@/components/admin/AccessDenied";
import type { AdminCharacter } from "@/components/admin/types";
import { Badge, Button, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

function factionLabel(faction: AdminCharacter["faction"]) {
  if (faction === "bureau") return "Bureau";
  if (faction === "static") return "Static";
  if (faction === "civilian") return "Civilian";
  return "Defector";
}

export default function AdminCharactersPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<AdminCharacter[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadQueue = async () => {
    const response = await fetch("/api/admin/characters/queue");
    if (response.status === 401 || response.status === 403) {
      setState("forbidden");
      return;
    }
    if (!response.ok) {
      setState("error");
      return;
    }
    const body = (await response.json()) as { data?: AdminCharacter[] };
    setRows(body.data ?? []);
    setState("ready");
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  const hasRows = useMemo(() => rows.length > 0, [rows]);

  const runAction = async (id: string, endpoint: string, init?: RequestInit) => {
    setBusyId(id);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        ...init,
      });
      if (response.ok) {
        await loadQueue();
      }
    } finally {
      setBusyId(null);
    }
  };

  if (state === "forbidden") return <AccessDenied />;

  return (
    <section className="py-6 space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / CHARACTERS</p>
        <h1 className="text-xl font-bold text-text">심사 큐</h1>
      </div>

      <Card hud className="overflow-x-auto">
        {state === "loading" && <p className="text-sm text-text-secondary">불러오는 중...</p>}
        {state === "error" && <p className="text-sm text-accent">큐를 불러오지 못했습니다.</p>}

        {state === "ready" && !hasRows && (
          <p className="text-sm text-text-secondary">현재 대기 중인 신청이 없습니다.</p>
        )}

        {state === "ready" && hasRows && (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="px-2 py-2">이름</th>
                <th className="px-2 py-2">진영</th>
                <th className="px-2 py-2">공명율</th>
                <th className="px-2 py-2">리더 신청</th>
                <th className="px-2 py-2">리더</th>
                <th className="px-2 py-2">액션</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isBusy = busyId === row.id;
                return (
                  <tr key={row.id} className="border-b border-border/60 align-top">
                    <td className="px-2 py-3 font-medium text-text">{row.name}</td>
                    <td className="px-2 py-3"><Badge variant={row.faction === "bureau" ? "info" : "danger"}>{factionLabel(row.faction)}</Badge></td>
                    <td className="px-2 py-3">{row.resonance_rate}</td>
                    <td className="px-2 py-3">{row.leader_application ? "신청" : "-"}</td>
                    <td className="px-2 py-3">{row.is_leader ? "리더" : "일반"}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" loading={isBusy} onClick={() => runAction(row.id, `/api/admin/characters/${row.id}/approve`)}>승인</Button>
                        <Button size="sm" variant="danger" loading={isBusy} onClick={() => runAction(row.id, `/api/admin/characters/${row.id}/reject`, { headers: { "content-type": "application/json" }, body: JSON.stringify({ reason: "" }) })}>반려</Button>
                        <Button size="sm" variant="secondary" loading={isBusy} onClick={() => runAction(row.id, `/api/admin/characters/${row.id}/leader`)}>
                          리더 토글
                        </Button>
                        <Link href={`/admin/characters/${row.id}`} className="inline-flex items-center text-xs text-primary hover:underline">상세</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
