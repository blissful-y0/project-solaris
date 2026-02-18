"use client";

import { Card, Button } from "@/components/ui";

export default function AdminSettingsPage() {
  return (
    <section className="py-6 space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / SETTINGS</p>
        <h1 className="text-xl font-bold text-text">운영 설정</h1>
      </div>

      <Card hud className="space-y-3">
        <h2 className="text-sm font-semibold text-text">리더 정책 (수동 운영)</h2>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" defaultChecked /> 진영별 최소 리더 1명 유지 (수동 체크)
        </label>
        <p className="text-xs text-text-secondary">자동 탐지는 사용하지 않음. 관리자가 직접 판단/토글.</p>
      </Card>

      <Card hud className="space-y-3">
        <h2 className="text-sm font-semibold text-text">전투 규칙 표시</h2>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>Bureau 공명율 80 이상</li>
          <li>Static 공명율 15 이하</li>
          <li>크로스오버 스타일은 HP/WILL 이중 코스트 필요</li>
        </ul>
        <Button size="sm" variant="ghost">저장 (준비중)</Button>
      </Card>
    </section>
  );
}
