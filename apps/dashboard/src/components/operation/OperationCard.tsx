import { Badge, Card } from "@/components/ui";

import type { OperationItem } from "./types";

type OperationCardProps = {
  item: OperationItem;
};

/** 상태별 텍스트 색상 */
function statusColor(status: OperationItem["status"]): string {
  if (status === "진행중") return "text-success";
  if (status === "완료") return "text-text-secondary/60";
  return "text-text-secondary";
}

/** 작전 카드 — 단일 작전 정보 표시 */
export function OperationCard({ item }: OperationCardProps) {
  return (
    <article>
      <Card hud className="h-full">
        <div className="flex h-full flex-col">
          {/* 상단: 타입 Badge + 상태 + 참가자 수 */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={item.type === "전투" ? "info" : "warning"}>
                {item.type}
              </Badge>
              <span className={`text-xs font-medium ${statusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <p className="text-sm font-mono text-primary">
              {item.participants}/{item.maxParticipants}
            </p>
          </div>

          {/* 제목 + 요약 */}
          <p className="mb-1 font-semibold text-text">{item.title}</p>
          <p className="line-clamp-2 flex-1 text-xs text-text-secondary">
            {item.summary}
          </p>

          {/* 하단: 호스트 */}
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs text-text-secondary">
              호스트: <span className="text-text">{item.host}</span>
            </p>
          </div>
        </div>
      </Card>
    </article>
  );
}
