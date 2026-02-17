import Link from "next/link";

import { Card } from "@/components/ui";

export default function WorldPage() {
  return (
    <section className="py-6 space-y-6">
      <div>
        <p className="hud-label mb-1">LORE</p>
        <h1 className="text-xl font-bold text-text">솔라리스 세계관 브리프</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card hud className="space-y-2">
          <h2 className="font-semibold text-text">도시: 솔라리스</h2>
          <p className="text-sm text-text-secondary">
            2174년, 인류는 거대한 돔 도시 안에서만 생존한다. 시민들은 인공태양이
            도시를 지킨다고 믿는다.
          </p>
        </Card>

        <Card hud className="space-y-2">
          <h2 className="font-semibold text-text">진영 구도</h2>
          <p className="text-sm text-text-secondary">
            질서를 수호하는 태양방위군과 진실을 추적하는 추방자 진영이 헬리오스
            코어의 통제권을 두고 충돌한다.
          </p>
        </Card>

        <Card hud className="space-y-2">
          <h2 className="font-semibold text-text">능력 체계</h2>
          <p className="text-sm text-text-secondary">
            공명율은 시민의 운명을 결정한다. 고공명자는 통제 권력에 편입되고,
            저공명자는 감시망 바깥에서 다른 각성을 맞이한다.
          </p>
        </Card>

        <Card hud className="space-y-2">
          <h2 className="font-semibold text-text">일상과 통제</h2>
          <p className="text-sm text-text-secondary">
            시민은 꿈 없는 수면과 반복되는 보고 체계에 길들여진다. 안정의 대가로
            감정과 기억은 점차 시스템의 연료가 된다.
          </p>
        </Card>
      </div>

      <Card hud className="flex items-center justify-between gap-3">
        <div>
          <p className="hud-label mb-1">NEW OPERATIVE</p>
          <p className="text-sm text-text-secondary">
            세계관 이해를 마쳤다면, 다음 오퍼레이터를 등록해 전장에 합류하세요.
          </p>
        </div>
        <Link
          href="/character/create"
          className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:border-primary/70"
        >
          캐릭터 생성하러 가기
        </Link>
      </Card>
    </section>
  );
}
