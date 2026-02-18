"use client";

import { useMemo, useState } from "react";

import { FilterChips } from "@/components/ui";
import type { FilterChipOption } from "@/components/ui/FilterChips";

import { OperationCard } from "./OperationCard";
import type {
  OperationItem,
  OperationStatusFilter,
  OperationTabValue,
} from "./types";

type OperationHubProps = {
  operations: OperationItem[];
};

const TAB_OPTIONS: FilterChipOption[] = [
  { label: "전체", value: "전체" },
  { label: "전투", value: "전투" },
  { label: "RP", value: "RP" },
];

const STATUS_OPTIONS: FilterChipOption[] = [
  { label: "전체", value: "전체" },
  { label: "대기중", value: "대기중" },
  { label: "진행중", value: "진행중" },
  { label: "완료", value: "완료" },
];

/** 작전 허브 — 탭 + 상태 필터 + 카드 그리드 */
export function OperationHub({ operations }: OperationHubProps) {
  const [activeTab, setActiveTab] = useState<OperationTabValue>("전체");
  const [statusFilter, setStatusFilter] = useState<OperationStatusFilter>("전체");

  const filtered = useMemo(() => {
    return operations.filter((op) => {
      if (activeTab !== "전체" && op.type !== activeTab) return false;
      if (statusFilter !== "전체" && op.status !== statusFilter) return false;
      return true;
    });
  }, [operations, activeTab, statusFilter]);

  return (
    <section className="py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="hud-label mb-1">OPERATION // TACTICAL HUB</p>
          <h1 className="text-xl font-bold text-text">통합 작전 목록</h1>
        </div>
        <p className="text-xs text-text-secondary">{operations.length}개 채널</p>
      </div>

      {/* 탭 필터: 전체/전투/RP */}
      <FilterChips
        options={TAB_OPTIONS}
        selected={activeTab}
        onChange={(v) => setActiveTab(v as OperationTabValue)}
      />

      {/* 상태 필터: 전체/대기중/진행중/완료 */}
      <FilterChips
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => setStatusFilter(v as OperationStatusFilter)}
      />

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          등록된 작전이 없습니다.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <OperationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
