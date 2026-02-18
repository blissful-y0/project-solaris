"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AccessDenied } from "@/components/admin/AccessDenied";
import type { AdminCharacter } from "@/components/admin/types";
import { Button, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

export default function AdminPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [queue, setQueue] = useState<AdminCharacter[]>([]);

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
      setQueue(body.data ?? []);
      setState("ready");
    };

    void run();
  }, []);

  const summary = useMemo(() => {
    const pending = queue.length;
    const leaderApply = queue.filter((item) => item.leader_application).length;
    const bureauPending = queue.filter((item) => item.faction === "bureau").length;
    const staticPending = queue.filter((item) => item.faction === "static").length;

    return { pending, leaderApply, bureauPending, staticPending };
  }, [queue]);

  if (state === "forbidden") return <AccessDenied />;
  if (state === "error") {
    return (
      <section className="py-6">
        <Card hud>
          <p className="hud-label mb-1 text-accent">ADMIN CONSOLE</p>
          <p className="text-sm text-text">관리자 데이터를 불러오지 못했습니다.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-6 space-y-6">
      <div>
        <p className="hud-label mb-1">ADMIN CONSOLE</p>
        <h1 className="text-xl font-bold text-text">관리자 대시보드</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card hud>
          <p className="text-xs text-text-secondary">대기 신청</p>
          <p className="mt-1 text-2xl font-bold text-primary">{state === "loading" ? "..." : summary.pending}</p>
        </Card>
        <Card hud>
          <p className="text-xs text-text-secondary">리더 신청</p>
          <p className="mt-1 text-2xl font-bold text-text">{state === "loading" ? "..." : summary.leaderApply}</p>
        </Card>
        <Card hud>
          <p className="text-xs text-text-secondary">Bureau 대기</p>
          <p className="mt-1 text-2xl font-bold text-text">{state === "loading" ? "..." : summary.bureauPending}</p>
        </Card>
        <Card hud>
          <p className="text-xs text-text-secondary">Static 대기</p>
          <p className="mt-1 text-2xl font-bold text-text">{state === "loading" ? "..." : summary.staticPending}</p>
        </Card>
      </div>

      <Card hud className="space-y-3">
        <p className="text-sm text-text">빠른 이동</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/characters"><Button size="sm">심사 큐</Button></Link>
          <Link href="/admin/notifications"><Button size="sm" variant="secondary">알림 센터</Button></Link>
          <Link href="/admin/settings"><Button size="sm" variant="ghost">운영 설정</Button></Link>
        </div>
      </Card>
    </section>
  );
}
