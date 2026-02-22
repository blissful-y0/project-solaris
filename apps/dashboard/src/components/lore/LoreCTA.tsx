import Link from "next/link";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";

type LoreCTAProps = {
  className?: string;
};

/** 하단 캐릭터 생성 유도 CTA */
export function LoreCTA({ className }: LoreCTAProps) {
  return (
    <Card hud className={cn("flex items-center justify-between gap-3", className)}>
      <div>
        <p className="hud-label mb-1">NEW OPERATIVE</p>
        <p className="text-sm text-text-secondary">
          세계관 이해를 마쳤다면, 다음 오퍼레이터를 등록해 전장에 합류하세요.
        </p>
      </div>
      <Link
        href="/character/create"
        className="flex-shrink-0 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:border-primary/70 transition-colors"
      >
        캐릭터 생성하러 가기
      </Link>
    </Card>
  );
}
