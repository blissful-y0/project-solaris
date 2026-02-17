"use client";

import { useMemo, useState } from "react";

import { Badge, Card } from "@/components/ui";

type SessionMode = "전투" | "RP";

type BattleLobby = {
  id: string;
  title: string;
  participants: number;
  status: "대기중" | "진행중";
  hazard: string;
};

type RpRoom = {
  id: string;
  title: string;
  participants: number;
  status: "대기중" | "진행중";
  topic: string;
};

const BATTLE_LOBBIES: BattleLobby[] = [
  {
    id: "battle-1",
    title: "폐허지대 교전 - Sector 7",
    participants: 8,
    status: "대기중",
    hazard: "방사능 안개",
  },
  {
    id: "battle-2",
    title: "코어 외곽 제압전",
    participants: 12,
    status: "진행중",
    hazard: "전력장 붕괴",
  },
];

const RP_ROOMS: RpRoom[] = [
  {
    id: "room-1",
    title: "중앙 감시탑 브리핑룸",
    participants: 5,
    status: "진행중",
    topic: "작전 사후 보고",
  },
  {
    id: "room-2",
    title: "하층 거주구 접선 채널",
    participants: 3,
    status: "대기중",
    topic: "정보 거래",
  },
];

export default function SessionPage() {
  const [mode, setMode] = useState<SessionMode>("전투");

  const entries = useMemo(() => {
    if (mode === "전투") return BATTLE_LOBBIES;
    return RP_ROOMS;
  }, [mode]);

  return (
    <section className="py-6">
      <div className="mb-6">
        <p className="hud-label mb-1">SESSION HUB</p>
        <h1 className="text-xl font-bold text-text">세션 허브</h1>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-border bg-bg-secondary p-1">
        {(["전투", "RP"] as const).map((item) => {
          const isActive = mode === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-text-secondary hover:text-text"
              }`}
              aria-pressed={isActive}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "전투" &&
          entries.map((entry) => {
            const battle = entry as BattleLobby;

            return (
              <Card key={battle.id} hud className="space-y-3">
                <div>
                  <p className="font-semibold text-text">{battle.title}</p>
                  <p className="text-xs text-text-secondary">위험 요소: {battle.hazard}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">참여 {battle.participants}명</span>
                  <Badge variant={battle.status === "진행중" ? "danger" : "warning"}>
                    {battle.status}
                  </Badge>
                </div>
              </Card>
            );
          })}

        {mode === "RP" &&
          entries.map((entry) => {
            const room = entry as RpRoom;

            return (
              <Card key={room.id} hud className="space-y-3">
                <div>
                  <p className="font-semibold text-text">{room.title}</p>
                  <p className="text-xs text-text-secondary">주제: {room.topic}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">참여 {room.participants}명</span>
                  <Badge variant={room.status === "진행중" ? "info" : "warning"}>
                    {room.status}
                  </Badge>
                </div>
              </Card>
            );
          })}
      </div>
    </section>
  );
}
