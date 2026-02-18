"use client";

import { Card } from "@/components/ui";

export default function AdminSettingsPage() {
  return (
    <section className="space-y-4">
      <div>
        <p className="hud-label mb-1">ADMIN / SETTINGS</p>
        <h1 className="text-xl font-bold text-text">운영 설정</h1>
      </div>

      <Card hud className="space-y-3">
        <h2 className="text-sm font-semibold text-text">진영 밸런스 기준</h2>
        <div className="grid gap-2 text-sm text-text-secondary">
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span>Bureau HP 기본값</span>
            <span className="text-text">80</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span>Static HP 기본값</span>
            <span className="text-text">120</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span>전향자 HP 기본값</span>
            <span className="text-text">100</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span>Bureau WILL 기본값</span>
            <span className="text-text">250</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span>Static WILL 기본값</span>
            <span className="text-text">150</span>
          </div>
          <div className="flex justify-between">
            <span>전향자 WILL 기본값</span>
            <span className="text-text">200</span>
          </div>
        </div>
      </Card>

      <Card hud className="space-y-3">
        <h2 className="text-sm font-semibold text-text">리더 정책</h2>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>• 진영별 리더 최대 1명 (DB unique 제약)</li>
          <li>• 승인된 캐릭터만 리더 지정 가능</li>
          <li>• 리더 해제 후 다른 캐릭터에 리더 지정 가능</li>
        </ul>
      </Card>

      <Card hud className="space-y-3">
        <h2 className="text-sm font-semibold text-text">능력 체계</h2>
        <div className="grid gap-2 text-sm text-text-secondary">
          <p>• 능력 계열: 역장(Field), 감응(Empathy), 변환(Shift), 연산(Compute)</p>
          <p>• 능력 단계: 기본 스킬, 중급 스킬, 상급 스킬</p>
          <p>• Bureau: 하모닉스 프로토콜 (WILL 소모)</p>
          <p>• Static: 오버드라이브 (HP 소모)</p>
        </div>
      </Card>

      <Card hud className="space-y-3">
        <h2 className="text-sm font-semibold text-text">크로스오버 스타일</h2>
        <div className="grid gap-2 text-sm text-text-secondary">
          <p>• Bureau → 리미터 해제</p>
          <p>• Static → 외장형 / 오버클럭 / 전향자</p>
          <p>• 크로스오버 시 HP/WILL 이중 코스트 적용</p>
        </div>
      </Card>
    </section>
  );
}
