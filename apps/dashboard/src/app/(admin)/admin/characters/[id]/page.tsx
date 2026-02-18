"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminAccessDenied } from "@/components/common";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RejectReasonModal } from "@/components/admin/RejectReasonModal";
import type { AdminCharacter } from "@/components/admin/types";
import { Badge, Button, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error" | "not_found";

function abilityClassLabel(cls: string | null): string {
  if (!cls) return "-";
  const map: Record<string, string> = {
    field: "역장 (Field)",
    empathy: "감응 (Empathy)",
    shift: "변환 (Shift)",
    compute: "연산 (Compute)",
  };
  return map[cls.toLowerCase()] ?? cls;
}

function tierLabel(tier: string): string {
  const map: Record<string, string> = {
    basic: "기본 스킬",
    mid: "중급 스킬",
    advanced: "상급 스킬",
  };
  return map[tier] ?? tier;
}

function crossoverLabel(style: string | null): string {
  if (!style) return "-";
  const map: Record<string, string> = {
    limiter_release: "리미터 해제",
    external_device: "외장형",
    overclock: "오버클럭",
    defector: "전향자",
  };
  return map[style.toLowerCase()] ?? style;
}

function statusLabel(status: string): { text: string; variant: "info" | "default" | "danger" } {
  if (status === "pending") return { text: "심사 대기", variant: "info" };
  if (status === "approved") return { text: "승인됨", variant: "default" };
  if (status === "rejected") return { text: "반려됨", variant: "danger" };
  return { text: status, variant: "default" };
}

export default function AdminCharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<LoadState>("loading");
  const [character, setCharacter] = useState<AdminCharacter | null>(null);
  const [busy, setBusy] = useState(false);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const loadCharacter = async () => {
    const response = await fetch(`/api/admin/characters/${params.id}`);
    if (response.status === 401 || response.status === 403) {
      setState("forbidden");
      return;
    }
    if (response.status === 404) {
      setState("not_found");
      return;
    }
    if (!response.ok) {
      setState("error");
      return;
    }
    const body = (await response.json()) as { data?: AdminCharacter };
    if (!body.data) {
      setState("not_found");
      return;
    }
    setCharacter(body.data);
    setState("ready");
  };

  useEffect(() => {
    void loadCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const isPending = character?.status === "pending";
  const isApproved = character?.status === "approved";

  const handleLeaderToggle = async () => {
    if (!character) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/characters/${character.id}/leader`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success(
          character.is_leader
            ? `${character.name}의 리더 권한을 해제했습니다.`
            : `${character.name}을(를) 리더로 지정했습니다.`,
        );
        await loadCharacter();
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
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    if (!character) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/characters/${character.id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success(`${character.name}이(가) 승인되었습니다.`);
        setShowApprove(false);
        await loadCharacter();
      } else {
        toast.error("승인에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!character) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/characters/${character.id}/reject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success("반려 처리 완료. 수정 요청이 전달되었습니다.");
        setShowReject(false);
        await loadCharacter();
      } else {
        toast.error("반려에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "forbidden") return <AdminAccessDenied />;

  const statusInfo = character ? statusLabel(character.status) : null;

  return (
    <>
      <section className="space-y-4">
        <div>
          <p className="hud-label mb-1">ADMIN / CHARACTER DETAIL</p>
          <h1 className="text-xl font-bold text-text">캐릭터 상세</h1>
        </div>

        {state === "loading" && (
          <Card hud><p className="text-sm text-text-secondary">불러오는 중...</p></Card>
        )}
        {state === "error" && (
          <Card hud><p className="text-sm text-accent">상세 정보를 불러오지 못했습니다.</p></Card>
        )}
        {state === "not_found" && (
          <Card hud><p className="text-sm text-text-secondary">해당 캐릭터를 찾지 못했습니다.</p></Card>
        )}

        {character && state === "ready" && (
          <Card hud className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">{character.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={character.faction === "bureau" ? "info" : "danger"}>
                  {character.faction}
                </Badge>
                {statusInfo && (
                  <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                )}
              </div>
            </div>

            {/* 프로필 이미지 */}
            {character.profile_image_url && (
              <div className="relative h-28 w-28 overflow-hidden rounded-md border border-border">
                <Image
                  src={character.profile_image_url}
                  alt={`${character.name} 프로필`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            )}

            {/* 기본 정보 */}
            <div className="grid gap-2 sm:grid-cols-2 text-sm text-text">
              <p>공명율: {character.resonance_rate}</p>
              <p>HP: {character.hp_current}/{character.hp_max}</p>
              <p>WILL: {character.will_current}/{character.will_max}</p>
              <p>능력 계열: {abilityClassLabel(character.ability_class)}</p>
              <p>성별: {character.profile_data?.gender ?? "-"}</p>
              <p>나이: {character.profile_data?.age ?? "-"}</p>
              <p>크로스오버: {crossoverLabel(character.crossover_style)}</p>
              <p>리더: {character.is_leader ? "리더" : "일반"}{character.leader_application ? " (리더 신청)" : ""}</p>
              <p className="sm:col-span-2">성격: {character.profile_data?.personality ?? "-"}</p>
              <p className="sm:col-span-2">외형: {character.appearance ?? "-"}</p>
              <p className="sm:col-span-2">배경: {character.backstory ?? "-"}</p>
            </div>

            {/* 스킬 목록 */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text">스킬</p>
              {character.abilities.map((ability) => (
                <div key={ability.id} className="rounded border border-border p-3 text-sm">
                  <p className="font-medium text-text">
                    [{tierLabel(ability.tier)}] {ability.name}
                  </p>
                  <p className="text-text-secondary mt-1">{ability.description}</p>
                  {ability.weakness && (
                    <p className="text-text-secondary mt-1">약점: {ability.weakness}</p>
                  )}
                  <p className="text-text-secondary mt-1">
                    코스트 HP {ability.cost_hp} / WILL {ability.cost_will}
                  </p>
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {isPending && (
                <>
                  <Button size="sm" loading={busy} onClick={() => setShowApprove(true)}>
                    승인
                  </Button>
                  <Button size="sm" variant="danger" loading={busy} onClick={() => setShowReject(true)}>
                    반려
                  </Button>
                </>
              )}
              {isApproved && (
                <Button size="sm" variant="secondary" loading={busy} onClick={handleLeaderToggle}>
                  {character.is_leader ? "리더 해제" : "리더 지정"}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => router.back()}>
                목록으로
              </Button>
            </div>
          </Card>
        )}
      </section>

      {character && (
        <ConfirmModal
          open={showApprove}
          title="캐릭터 승인"
          message={`${character.name}을(를) 승인하시겠습니까?`}
          confirmLabel="승인"
          loading={busy}
          onClose={() => setShowApprove(false)}
          onConfirm={handleApprove}
        />
      )}

      {character && (
        <RejectReasonModal
          open={showReject}
          characterName={character.name}
          loading={busy}
          onClose={() => setShowReject(false)}
          onConfirm={handleReject}
        />
      )}
    </>
  );
}
