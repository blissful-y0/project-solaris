"use client";

import { Card, Button } from "@/components/ui";

export default function AdminNotificationsPage() {
  return (
    <section className="py-6 space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / NOTIFICATIONS</p>
        <h1 className="text-xl font-bold text-text">알림 센터</h1>
      </div>

      <Card hud className="space-y-3">
        <p className="text-sm text-text">개인 DM / 채널 웹훅 발송 UI</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="min-h-[44px] rounded border border-border bg-bg-secondary px-3 text-sm" placeholder="타입 (예: story_update)" />
          <input className="min-h-[44px] rounded border border-border bg-bg-secondary px-3 text-sm" placeholder="대상 user_id (DM일 때)" />
          <input className="min-h-[44px] rounded border border-border bg-bg-secondary px-3 text-sm sm:col-span-2" placeholder="제목" />
          <textarea className="min-h-[120px] rounded border border-border bg-bg-secondary px-3 py-2 text-sm sm:col-span-2" placeholder="본문" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="discord">DM 발송 (준비중)</Button>
          <Button size="sm" variant="secondary">웹훅 발송 (준비중)</Button>
        </div>
      </Card>
    </section>
  );
}
