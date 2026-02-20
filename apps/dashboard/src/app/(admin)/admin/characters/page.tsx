"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminAccessDenied } from "@/components/common";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RejectReasonModal } from "@/components/admin/RejectReasonModal";
import type { AdminCharacter } from "@/components/admin/types";
import { Badge, Button, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

/** 승인 확인 모달 상태 */
type ApproveTarget = { id: string; name: string } | null;
/** 반려 사유 모달 상태 */
type RejectTarget = { id: string; name: string } | null;

function factionLabel(faction: AdminCharacter["faction"]) {
  if (faction === "bureau") return "Enforcer";
  if (faction === "static") return "Static";
  if (faction === "civilian") return "Civilian";
  return "Defector";
}

export default function AdminCharactersPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<AdminCharacter[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  /* 모달 상태 */
  const [approveTarget, setApproveTarget] = useState<ApproveTarget>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);

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

  /* ── 승인 ── */
  const handleApprove = async () => {
    if (!approveTarget) return;
    setBusyId(approveTarget.id);
    try {
      const res = await fetch(`/api/admin/characters/${approveTarget.id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success(`${approveTarget.name}이(가) 승인되었습니다.`);
        setApproveTarget(null);
        await loadQueue();
      } else {
        toast.error("승인에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  /* ── 반려 ── */
  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    try {
      const res = await fetch(`/api/admin/characters/${rejectTarget.id}/reject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success("반려 처리 완료. 수정 요청이 전달되었습니다.");
        setRejectTarget(null);
        await loadQueue();
      } else {
        toast.error("반려에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  /* ── 리더 토글 ── */
  const handleLeaderToggle = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/characters/${id}/leader`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("리더 상태가 변경되었습니다.");
        await loadQueue();
      } else {
        toast.error("리더 토글에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  if (state === "forbidden") return <AdminAccessDenied />;

  return (
    <>
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
                      <td className="px-2 py-3">
                        <Badge variant={row.faction === "bureau" ? "info" : "danger"}>
                          {factionLabel(row.faction)}
                        </Badge>
                      </td>
                      <td className="px-2 py-3">{row.resonance_rate}</td>
                      <td className="px-2 py-3">{row.leader_application ? "신청" : "-"}</td>
                      <td className="px-2 py-3">{row.is_leader ? "리더" : "일반"}</td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            loading={isBusy}
                            onClick={() => setApproveTarget({ id: row.id, name: row.name })}
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={isBusy}
                            onClick={() => setRejectTarget({ id: row.id, name: row.name })}
                          >
                            반려
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={isBusy}
                            onClick={() => handleLeaderToggle(row.id)}
                          >
                            리더 토글
                          </Button>
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

      {/* 승인 확인 모달 */}
      <ConfirmModal
        open={approveTarget !== null}
        title="캐릭터 승인"
        message={`${approveTarget?.name ?? ""}을(를) 승인하시겠습니까?`}
        confirmLabel="승인"
        loading={busyId !== null}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
      />

      {/* 반려 사유 모달 */}
      <RejectReasonModal
        open={rejectTarget !== null}
        characterName={rejectTarget?.name ?? ""}
        loading={busyId !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </>
  );
}
