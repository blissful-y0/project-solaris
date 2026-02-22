import { Pin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import type { CoreNotice } from "./mock-core-data";

interface CoreNoticeBoardProps {
  items: readonly CoreNotice[];
  className?: string;
}

/** 관리자 공지 리스트 — 핀 아이콘 + 공지 텍스트 */
export function CoreNoticeBoard({ items, className }: CoreNoticeBoardProps) {
  return (
    <Card hud className={cn("space-y-3", className)}>
      <p className="hud-label">SYSTEM NOTICE</p>

      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">등록된 공지가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-1">
              <div className="flex items-start gap-2">
                {item.pinned && (
                  <Pin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                    data-testid="pin-icon"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{item.title}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <span className="shrink-0 text-[0.625rem] text-text-secondary/60">
                  {item.createdAt}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
