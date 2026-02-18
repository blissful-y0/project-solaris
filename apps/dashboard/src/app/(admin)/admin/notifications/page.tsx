"use client";

import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/admin/AccessDenied";
import { Badge, Card } from "@/components/ui";

type LoadState = "loading" | "ready" | "forbidden" | "error";

interface Notification {
  id: string;
  user_id: string | null;
  scope: "user" | "broadcast";
  type: string;
  title: string;
  body: string;
  channel: string;
  delivery_status: string;
  created_at: string;
}

function channelLabel(ch: string) {
  if (ch === "discord_dm") return "Discord DM";
  if (ch === "discord_webhook") return "Webhook";
  if (ch === "in_app") return "인앱";
  return ch;
}

function statusVariant(status: string): "default" | "info" | "danger" {
  if (status === "sent" || status === "delivered") return "default";
  if (status === "pending") return "info";
  return "danger";
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminNotificationsPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<Notification[]>([]);

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/admin/notifications");
      if (response.status === 401 || response.status === 403) {
        setState("forbidden");
        return;
      }
      if (!response.ok) {
        setState("error");
        return;
      }
      const body = (await response.json()) as { data?: Notification[] };
      setRows(body.data ?? []);
      setState("ready");
    };
    void run();
  }, []);

  if (state === "forbidden") return <AccessDenied />;

  return (
    <section className="space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / NOTIFICATIONS</p>
        <h1 className="text-xl font-bold text-text">알림 이력</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {state === "ready" ? `최근 ${rows.length}건` : "..."}
        </p>
      </div>

      <Card hud className="overflow-x-auto">
        {state === "loading" && (
          <p className="text-sm text-text-secondary">불러오는 중...</p>
        )}
        {state === "error" && (
          <p className="text-sm text-accent">알림 이력을 불러오지 못했습니다.</p>
        )}

        {state === "ready" && rows.length === 0 && (
          <p className="text-sm text-text-secondary">발송된 알림이 없습니다.</p>
        )}

        {state === "ready" && rows.length > 0 && (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="px-2 py-2">시각</th>
                <th className="px-2 py-2">유형</th>
                <th className="px-2 py-2">제목</th>
                <th className="px-2 py-2">채널</th>
                <th className="px-2 py-2">대상</th>
                <th className="px-2 py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 align-top">
                  <td className="px-2 py-3 text-text-secondary whitespace-nowrap">
                    {formatTime(row.created_at)}
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant="info">{row.type}</Badge>
                  </td>
                  <td className="px-2 py-3 text-text">
                    <p className="font-medium">{row.title}</p>
                    <p className="text-text-secondary text-xs mt-0.5 line-clamp-1">{row.body}</p>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">{channelLabel(row.channel)}</td>
                  <td className="px-2 py-3 text-xs text-text-secondary">
                    {row.scope === "broadcast" ? "전체" : row.user_id?.slice(0, 8) ?? "-"}
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant={statusVariant(row.delivery_status)}>
                      {row.delivery_status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
