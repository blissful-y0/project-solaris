import { Card } from "@/components/ui";

export default function SessionPage() {
  return (
    <div className="py-6">
      <p className="hud-label mb-2">SESSION HUB</p>
      <h1 className="text-xl font-bold text-text mb-6">세션 선택</h1>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {/* 전투 모드 카드 */}
        <article className="group">
          <Card hud>
            <div className="py-4 text-center">
              <p className="hud-label mb-2 text-primary">COMBAT MODE</p>
              <h2 className="text-lg font-bold text-text mb-2">전투 세션</h2>
              <p className="text-text-secondary text-sm">
                HELIOS COMBAT SYSTEM을 통한 전투 세션에 참여합니다.
              </p>
              <p className="text-xs text-text-secondary mt-3">준비 중</p>
            </div>
          </Card>
        </article>

        {/* RP 모드 카드 */}
        <article className="group">
          <Card hud>
            <div className="py-4 text-center">
              <p className="hud-label mb-2 text-accent">RP MODE</p>
              <h2 className="text-lg font-bold text-text mb-2">RP 세션</h2>
              <p className="text-text-secondary text-sm">
                자유 롤플레이 세션에 참여합니다.
              </p>
              <p className="text-xs text-text-secondary mt-3">준비 중</p>
            </div>
          </Card>
        </article>
      </div>
    </div>
  );
}
