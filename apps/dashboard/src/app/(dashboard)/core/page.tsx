import { Card } from "@/components/ui";

export default function CorePage() {
  return (
    <div className="py-6">
      <p className="hud-label mb-2">HELIOS CORE</p>
      <h1 className="text-xl font-bold text-text mb-6">스토리 브리핑</h1>

      <Card hud className="max-w-lg">
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm">
            HELIOS 코어 시스템에서 스토리 브리핑을 준비하고 있습니다.
          </p>
          <p className="text-text-secondary text-xs mt-2">
            ARC 사건 발생 시스템이 곧 가동됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
