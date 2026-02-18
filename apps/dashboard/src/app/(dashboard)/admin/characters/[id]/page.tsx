"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { AccessDenied } from "@/components/admin/AccessDenied";
import type { AdminCharacter } from "@/components/admin/types";
import { Badge, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

export default function AdminCharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<AdminCharacter[]>([]);

  useEffect(() => {
    const run = async () => {
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
    void run();
  }, []);

  const character = useMemo(() => rows.find((row) => row.id === params.id), [rows, params.id]);

  if (state === "forbidden") return <AccessDenied />;

  return (
    <section className="py-6 space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / CHARACTER DETAIL</p>
        <h1 className="text-xl font-bold text-text">신청 상세</h1>
      </div>

      {state === "loading" && <Card hud><p className="text-sm text-text-secondary">불러오는 중...</p></Card>}
      {state === "error" && <Card hud><p className="text-sm text-accent">상세 정보를 불러오지 못했습니다.</p></Card>}

      {state === "ready" && !character && (
        <Card hud>
          <p className="text-sm text-text-secondary">대기 큐에서 해당 신청을 찾지 못했습니다.</p>
        </Card>
      )}

      {character && (
        <Card hud className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">{character.name}</h2>
            <Badge variant={character.faction === "bureau" ? "info" : "danger"}>{character.faction}</Badge>
          </div>

          {character.profile_image_url && (
            <img src={character.profile_image_url} alt="프로필" className="h-28 w-28 rounded-md border border-border object-cover" />
          )}

          <div className="grid gap-2 sm:grid-cols-2 text-sm text-text">
            <p>공명율: {character.resonance_rate}</p>
            <p>능력 계열: {character.ability_class ?? "-"}</p>
            <p>성별: {character.profile_data?.gender ?? "-"}</p>
            <p>나이: {character.profile_data?.age ?? "-"}</p>
            <p className="sm:col-span-2">성격: {character.profile_data?.personality ?? "-"}</p>
            <p className="sm:col-span-2">외형: {character.appearance ?? "-"}</p>
            <p className="sm:col-span-2">배경: {character.backstory ?? "-"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text">스킬</p>
            {character.abilities.map((ability) => (
              <div key={ability.id} className="rounded border border-border p-3 text-sm">
                <p className="font-medium text-text">[{ability.tier}] {ability.name}</p>
                <p className="text-text-secondary mt-1">{ability.description}</p>
                <p className="text-text-secondary mt-1">코스트 HP {ability.cost_hp} / WILL {ability.cost_will}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
