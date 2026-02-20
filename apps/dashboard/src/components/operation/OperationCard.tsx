import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { OperationItem } from "./types";

type OperationCardProps = {
  item: OperationItem;
  onClick?: (item: OperationItem) => void;
};

/** 상태별 stripe 색상 */
const STRIPE_COLOR: Record<OperationItem["status"], string> = {
  live: "bg-emerald-500",
  waiting: "bg-primary",
  completed: "bg-text-secondary/30",
};

/** 상태 인디케이터 라벨 */
function StatusIndicator({ status }: { status: OperationItem["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        LIVE
      </span>
    );
  }
  if (status === "waiting") {
    return (
      <span className="text-xs font-medium text-text-secondary">○ 대기</span>
    );
  }
  return (
    <span className="text-xs font-medium text-text-secondary/60">— 완료</span>
  );
}

/** CTA 버튼 텍스트 */
function ctaText(status: OperationItem["status"]): string {
  if (status === "live") return "입장 ▸";
  if (status === "waiting") return "참가 ▸";
  return "열람 ▸";
}

/** 참가자 총 인원 계산 */
function participantCount(item: OperationItem): number {
  if (item.type === "operation") {
    return item.teamA.length + item.teamB.length;
  }
  /* downtime: host 1명 기본 */
  return 1;
}

/** 경과시간 포맷 */
function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

/** 참가자 표시 */
function ParticipantsLine({ item }: { item: OperationItem }) {
  if (item.type === "operation") {
    const teamANames = item.teamA.map((m) => m.name).join(", ");
    const teamBNames = item.teamB.map((m) => m.name).join(", ");
    return (
      <p className="truncate text-xs text-text-secondary">
        {teamANames} <span className="text-primary/60">vs</span> {teamBNames}
      </p>
    );
  }
  return (
    <p className="truncate text-xs text-text-secondary">
      <span className="text-text-secondary/80">호스트:</span> {item.host.name}
    </p>
  );
}

/** 작전 카드 — 도시어 스타일 */
export function OperationCard({ item, onClick }: OperationCardProps) {
  return (
    <article
      role="article"
      onClick={() => onClick?.(item)}
      className={cn(
        "group flex cursor-pointer overflow-hidden rounded-lg",
        "bg-bg-secondary/80 border border-border backdrop-blur-sm",
        "transition-all duration-200",
        "hover:border-primary/30",
        item.status === "completed" && "opacity-60",
      )}
    >
      {/* 좌측 stripe */}
      <div
        data-testid="status-stripe"
        className={cn("w-1 shrink-0", STRIPE_COLOR[item.status])}
      />

      {/* 카드 본문 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        {/* 1행: 상태 인디케이터 + 타입 뱃지 + 제목 */}
        <div className="flex items-center gap-2">
          <StatusIndicator status={item.status} />
          <Badge variant={item.type === "operation" ? "info" : "warning"}>
            {item.type === "operation" ? "OPERATION" : "DOWNTIME"}
          </Badge>
          <span className="truncate text-sm font-semibold text-text">
            {item.title}
          </span>
        </div>

        {/* 2행: 참가자 */}
        <ParticipantsLine item={item} />

        {/* 3행: 요약 */}
        <p className="line-clamp-1 text-xs text-text-secondary/80">
          {item.summary}
        </p>

        {/* 4행: 인원 + 경과시간 + CTA */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-text-secondary">
            {participantCount(item)}/{item.maxParticipants}명
            <span className="mx-1.5 text-text-secondary/40">·</span>
            {timeAgo(item.createdAt)}
          </p>
          <Button variant="secondary" size="sm" tabIndex={-1}>
            {ctaText(item.status)}
          </Button>
        </div>
      </div>
    </article>
  );
}
