"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/admin/AccessDenied";
import { Button, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

interface Stats {
  characters: { pending: number; approved: number; rejected: number; total: number };
  users: number;
  notifications: number;
}

export default function AdminPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/admin/stats");
      if (response.status === 401 || response.status === 403) {
        setState("forbidden");
        return;
      }
      if (!response.ok) {
        setState("error");
        return;
      }
      const body = (await response.json()) as { data?: Stats };
      setStats(body.data ?? null);
      setState("ready");
    };
    void run();
  }, []);

  if (state === "forbidden") return <AccessDenied />;
  if (state === "error") {
    return (
      <section>
        <Card hud>
          <p className="hud-label mb-1 text-accent">ADMIN CONSOLE</p>
          <p className="text-sm text-text">관리자 데이터를 불러오지 못했습니다.</p>
        </Card>
      </section>
    );
  }

  const loading = state === "loading";
  const c = stats?.characters;

  return (
    <section className="space-y-6">
      <div>
        <p className="hud-label mb-1">ADMIN CONSOLE</p>
        <h1 className="text-xl font-bold text-text">관리자 대시보드</h1>
      </div>

      {/* 캐릭터 현황 */}
      <div>
        <p className="text-xs text-text-secondary mb-2">캐릭터 현황</p>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card hud>
            <p className="text-xs text-text-secondary">심사 대기</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {loading ? "..." : c?.pending}
            </p>
          </Card>
          <Card hud>
            <p className="text-xs text-text-secondary">승인됨</p>
            <p className="mt-1 text-2xl font-bold text-success">
              {loading ? "..." : c?.approved}
            </p>
          </Card>
          <Card hud>
            <p className="text-xs text-text-secondary">반려됨</p>
            <p className="mt-1 text-2xl font-bold text-accent">
              {loading ? "..." : c?.rejected}
            </p>
          </Card>
          <Card hud>
            <p className="text-xs text-text-secondary">전체 캐릭터</p>
            <p className="mt-1 text-2xl font-bold text-text">
              {loading ? "..." : c?.total}
            </p>
          </Card>
        </div>
      </div>

      {/* 서비스 현황 */}
      <div>
        <p className="text-xs text-text-secondary mb-2">서비스 현황</p>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card hud>
            <p className="text-xs text-text-secondary">전체 유저</p>
            <p className="mt-1 text-2xl font-bold text-text">
              {loading ? "..." : stats?.users}
            </p>
          </Card>
          <Card hud>
            <p className="text-xs text-text-secondary">발송 알림</p>
            <p className="mt-1 text-2xl font-bold text-text">
              {loading ? "..." : stats?.notifications}
            </p>
          </Card>
        </div>
      </div>

      {/* 빠른 이동 */}
      <Card hud className="space-y-3">
        <p className="text-sm text-text">빠른 이동</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/characters"><Button size="sm">심사 큐</Button></Link>
          <Link href="/admin/characters/all"><Button size="sm" variant="secondary">캐릭터 관리</Button></Link>
          <Link href="/admin/notifications"><Button size="sm" variant="secondary">알림 센터</Button></Link>
          <Link href="/admin/settings"><Button size="sm" variant="ghost">운영 설정</Button></Link>
        </div>
      </Card>
    </section>
  );
}
