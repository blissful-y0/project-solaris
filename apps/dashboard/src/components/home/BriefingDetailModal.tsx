"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Badge, Modal } from "@/components/ui";

import type { Briefing } from "./mock-briefings";
import { categoryVariant } from "./mock-briefings";

type BriefingDetailModalProps = {
  briefing: Briefing | null;
  onClose: () => void;
};

export function BriefingDetailModal({ briefing, onClose }: BriefingDetailModalProps) {
  if (!briefing) return null;

  const dateStr = format(new Date(briefing.timestamp), "yyyy.MM.dd HH:mm", { locale: ko });

  return (
    <Modal open={!!briefing} onClose={onClose} ariaLabel="브리핑 상세">
      {/* BULLETIN + 카테고리 + 시간 한 줄 */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="hud-label">{briefing.bulletinNumber}</span>
        <Badge variant={categoryVariant[briefing.category]} size="sm">
          {briefing.category}
        </Badge>
        <span className="text-[0.625rem] text-text-secondary">{dateStr}</span>
      </div>

      {/* 타이틀 + 본문 */}
      <h3 className="text-sm font-bold text-text mb-2">{briefing.title}</h3>
      <p className="text-sm text-text/80 leading-relaxed">{briefing.content}</p>

      {/* 소스 */}
      <p className="hud-label mt-4">{briefing.source}</p>
    </Modal>
  );
}
