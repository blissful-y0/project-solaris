import { Card } from "@/components/ui";

export default function WorldPage() {
  return (
    <div className="py-6">
      <p className="hud-label mb-2">LORE DATABASE</p>
      <h1 className="text-xl font-bold text-text mb-6">세계관 허브</h1>

      <Card hud className="max-w-lg">
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm">
            SOLARIS 세계관 데이터베이스를 준비하고 있습니다.
          </p>
          <p className="text-text-secondary text-xs mt-2">
            도시의 기록이 곧 공개됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
