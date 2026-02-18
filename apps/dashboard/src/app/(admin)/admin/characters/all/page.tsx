"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/admin/AccessDenied";
import type { AdminCharacter } from "@/components/admin/types";
import { Badge, Button, Card, FilterChips } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

type StatusFilter = "all" | "approved" | "rejected" | "pending";

const STATUS_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "승인됨", value: "approved" },
  { label: "심사 대기", value: "pending" },
  { label: "반려됨", value: "rejected" },
];

function factionLabel(faction: AdminCharacter["faction"]) {
  if (faction === "bureau") return "Bureau";
  if (faction === "static") return "Static";
  if (faction === "civilian") return "Civilian";
  return "Defector";
}

function abilityClassLabel(cls: string | null): string {
  if (!cls) return "-";
  const map: Record<string, string> = {
    field: "역장",
    empathy: "감응",
    shift: "변환",
    compute: "연산",
  };
  return map[cls.toLowerCase()] ?? cls;
}

function statusBadge(status: string) {
  if (status === "approved") return <Badge variant="default">승인</Badge>;
  if (status === "rejected") return <Badge variant="danger">반려</Badge>;
  if (status === "pending") return <Badge variant="info">대기</Badge>;
  return <Badge>{status}</Badge>;
}

export default function AdminCharactersAllPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<AdminCharacter[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = useCallback(async (status: StatusFilter) => {
    setState("loading");
    const url =
      status === "all"
        ? "/api/admin/characters/all"
        : `/api/admin/characters/all?status=${status}`;
    const response = await fetch(url);
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
  }, []);

  useEffect(() => {
    void loadAll(statusFilter);
  }, [statusFilter, loadAll]);

  const handleFilterChange = (value: string | string[]) => {
    const v = (Array.isArray(value) ? value[0] : value) as StatusFilter;
    setStatusFilter(v);
  };

  const handleLeaderToggle = async (row: AdminCharacter) => {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/characters/${row.id}/leader`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success(
          row.is_leader
            ? `${row.name}의 리더 권한을 해제했습니다.`
            : `${row.name}을(를) 리더로 지정했습니다.`,
        );
        await loadAll(statusFilter);
      } else {
        const body = await res.json().catch(() => ({}));
        if (body.error === "FACTION_LEADER_ALREADY_EXISTS") {
          toast.error("해당 진영에 이미 리더가 존재합니다.");
        } else if (body.error === "CHARACTER_NOT_APPROVED") {
          toast.error("승인된 캐릭터만 리더로 지정할 수 있습니다.");
        } else {
          toast.error("리더 토글에 실패했습니다.");
        }
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = search.trim()
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.faction.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  if (state === "forbidden") return <AccessDenied />;

  return (
    <section className="space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / CHARACTERS</p>
        <h1 className="text-xl font-bold text-text">캐릭터 관리</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {state === "ready" ? `${rows.length}건` : "..."}
        </p>
      </div>

      {/* 필터 + 검색 */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterChips
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          placeholder="이름 또는 진영 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[240px] rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
        />
      </div>

      <Card hud className="overflow-x-auto">
        {state === "loading" && (
          <p className="text-sm text-text-secondary">불러오는 중...</p>
        )}
        {state === "error" && (
          <p className="text-sm text-accent">목록을 불러오지 못했습니다.</p>
        )}

        {state === "ready" && filtered.length === 0 && (
          <p className="text-sm text-text-secondary">
            {search ? "검색 결과가 없습니다." : "해당 상태의 캐릭터가 없습니다."}
          </p>
        )}

        {state === "ready" && filtered.length > 0 && (
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="px-2 py-2">이름</th>
                <th className="px-2 py-2">진영</th>
                <th className="px-2 py-2">상태</th>
                <th className="px-2 py-2">능력 계열</th>
                <th className="px-2 py-2">공명율</th>
                <th className="px-2 py-2">HP</th>
                <th className="px-2 py-2">WILL</th>
                <th className="px-2 py-2">리더</th>
                <th className="px-2 py-2">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isBusy = busyId === row.id;
                const isApproved = row.status === "approved";
                return (
                  <tr key={row.id} className="border-b border-border/60 align-top">
                    <td className="px-2 py-3 font-medium text-text">{row.name}</td>
                    <td className="px-2 py-3">
                      <Badge variant={row.faction === "bureau" ? "info" : "danger"}>
                        {factionLabel(row.faction)}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">{statusBadge(row.status)}</td>
                    <td className="px-2 py-3">{abilityClassLabel(row.ability_class)}</td>
                    <td className="px-2 py-3">{row.resonance_rate}</td>
                    <td className="px-2 py-3">
                      <span className={row.hp_current < row.hp_max ? "text-accent" : ""}>
                        {row.hp_current}/{row.hp_max}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className={row.will_current < row.will_max ? "text-warning" : ""}>
                        {row.will_current}/{row.will_max}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      {row.is_leader ? <span className="text-primary">리더</span> : "일반"}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isApproved && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={isBusy}
                            onClick={() => handleLeaderToggle(row)}
                          >
                            {row.is_leader ? "리더 해제" : "리더 지정"}
                          </Button>
                        )}
                        <Link
                          href={`/admin/characters/${row.id}`}
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          상세
                        </Link>
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
